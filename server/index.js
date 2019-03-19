require("dotenv").config()

const path = require("path")
const bodyParser = require("body-parser")
const express = require("express")
const app = express()
const port = process.env.PORT || 80
const staticPath = path.join(__dirname, "..", "client", "dist")
const indexFile = path.join(staticPath, "index.html")
const controllers = require("./controllers.js")

app.use(express.static(staticPath))
app.post("/api/upload-file/:prefix", bodyParser.json(), controllers.uploadFile)
app.post("/api/process-file/:prefix", bodyParser.json(), controllers.processFile)
app.get("/api/image-data/:prefix", controllers.getImageData)
app.get("*", (req, res) => res.sendFile(indexFile))
app.listen(port)