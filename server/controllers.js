const bucketName = process.env.AWS_BUCKET_NAME
const baseFolder = process.env.AWS_BASE_FOLDER
const childProcess = require("child_process")
const path = require("path")
const fs = require("fs")
const util = require("util")
const writeFile = util.promisify(fs.writeFile)
const AWS = require("aws-sdk")
const s3 = new AWS.S3({region: process.env.AWS_REGION_NAME})

const listFiles = prefix => new Promise((resolve, reject) => {
    s3.listObjects({Bucket: bucketName, Prefix: prefix}, (err, data) => {
        if (err) {
            reject(err)
        } else {
            resolve(data.Contents.filter(item => item.Size > 0))
        }
    })
})

const getFileUrl = (key, expires) => new Promise((resolve, reject) => {
    s3.getSignedUrl("getObject", {Bucket: bucketName, Key: key, Expires: expires}, (err, data) => {
        if (err) {
            reject(err)
        } else {
            resolve(data)
        }
    })
})

const getImageData = async (req, res) => {
    const expires = 60 * 60 * 12 // 12 hours
    const prefix = `${baseFolder}/${req.params.prefix}/`
    const imageList = await listFiles(prefix)
    const allImages = []
    const returnData = []

    const filePromises = imageList.map(async file => {
        const fullName = file.Key.substr(prefix.length).trim()

        if (fullName.length) {
            const fileParts = fullName.split(".")
            const fileName = fileParts.filter((part, index) => index < fileParts.length - 1).join(".")
            const key = fileName.split("_")[0]
            const part = fileName.split("_")[1]

            if (fileName.length) {
                const src = await getFileUrl(file.Key, expires)
                allImages.push({key, part, src})
            }
        }
    })

    await Promise.all(filePromises)

    allImages
        .filter(image => image.part === "thumbnail")
        .map(thumbnail => {
            const fullImage = allImages.filter(fullImage => fullImage.part === "full" && fullImage.key == thumbnail.key)[0]

            if (fullImage) {
                returnData.push({key: thumbnail.key, thumbnailSrc: thumbnail.src, fullSrc: fullImage.src})
            }
        })

    returnData
        .sort((prev, next) => {
            const prevKey = parseInt(prev.key.replace("Speaker", ""), 10)
            const nextKey = parseInt(next.key.replace("Speaker", ""), 10)

            return prevKey > nextKey ? 1 : -1
        })

    res.send(returnData)
}

const uploadFile = async (req, res) => {
    try {
        const processingFolder = path.join(__dirname, "processing")
        const baseFileName = `${req.params.prefix}.stl`
        const fileName = path.join(processingFolder, "output", baseFileName)
        const fileContent = req.body.fileContent
        const command = `python3 stl2preview_captions_cli.py "./output/" "${baseFileName}"`

        await writeFile(fileName, fileContent, "base64")

        childProcess.exec(command, {cwd: processingFolder}, (err, stdOut) => {
            if (!err && stdOut) {
                const output = JSON.parse(stdOut)
                res.send(output)
            } else {
                res.status(500).send({error: "Error generating preview captions."})
            }
        })
    } catch(e) {
        res.status(500).send({error: "Error generating preview captions."})
    }
}

const processFile = async (req, res) => {
    try {
        const processingFolder = path.join(__dirname, "processing")
        const baseFileName = `${req.params.prefix}.stl`
        const fileName = path.join(processingFolder, "output", baseFileName)
        const basedProcessedName = `${req.params.prefix}_positioned.stl`
        const processedName = path.join(processingFolder, "output", basedProcessedName)
        const fileContent = req.body.fileContent
        const speakerSelections = req.body.speakerSelections
        const command = `python3 position_captions_cli.py "./output/" "${baseFileName}" "${JSON.stringify(JSON.stringify(speakerSelections))}"`

        await writeFile(fileName, fileContent, "base64")

        childProcess.exec(command, {cwd: processingFolder}, err => {
            if (!err) {
                res.sendFile(processedName)
            } else {
                res.status(500).send({error: "Error positioning captions."})
            }
        })
    } catch(e) {
        res.status(500).send({error: "Error positioning captions."})
    }
}

module.exports = {
    getImageData,
    uploadFile,
    processFile
}