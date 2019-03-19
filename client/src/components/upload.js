import React from "react"
import {connect} from "react-redux"
import {setFileName, setFileContent} from "../actions"
import {withRouter} from "react-router-dom"
import autoBind from "react-autobind"

const fileToBase64 = file => new Promise((resolve, reject) => {
	const reader = new FileReader()
	reader.readAsDataURL(file)
	reader.onload = () => resolve(reader.result.split("base64,")[1])
	reader.onerror = e => reject(e)
})

const getFileParts = file => {
	const parts = file.name.split(".")
	const name = parts.filter((part, index) => index < parts.length - 1).join(".")
	const extension = (parts[parts.length - 1] || "").toLowerCase()

	return {name, extension}
}

const validFileExtension = "stl"

class Upload extends React.Component {
	constructor(props) {
		super(props)
		autoBind(this)
	}

	componentDidMount() {
		document.body.addEventListener("dragover", this.cancelEvent)
		document.body.addEventListener("dragenter", this.cancelEvent)
		document.body.addEventListener("drop", this.cancelEvent)
	}

	componentWillUnmount() {
		document.body.removeEventListener("dragover", this.cancelEvent)
		document.body.removeEventListener("dragenter", this.cancelEvent)
		document.body.removeEventListener("drop", this.cancelEvent)
	}

	cancelEvent(e) {
		e.preventDefault()
	}

	handleDrop(e) {
		this.cancelEvent(e)
	
		if (e.dataTransfer && e.dataTransfer.items.length && e.dataTransfer.items[0].kind === "file") {
			const file = e.dataTransfer.items[0].getAsFile()

			if (file) {
				this.processFile(file)
			}
		}
	}

	handleUpload(e) {
		const file = e.target.files[0]

		if (file) {
			this.processFile(e.target.files[0])
		}
	}

	async processFile(file) {
		try {
			const {setFileName, setFileContent, phraseBook, language, history} = this.props
			const {name: fileName, extension: fileExtension} = getFileParts(file)

			if (fileExtension === validFileExtension) {
				const fileContent = await fileToBase64(file)

				setFileName(fileName)
				setFileContent(fileContent)

				history.push(`/${language}/select-speakers`)
			} else {
				alert(phraseBook.invalidFileExtension)
			}
		} catch(e) {}
	}

	render() {
		const {phraseBook} = this.props

		const content = (
			<div
				className="upload-content"
				onDragEnter={this.cancelEvent}
				onDragEnd={this.cancelEvent}
				onDrop={this.handleDrop}>
				<div className="upload-content-inner">
					<h1>
						{phraseBook.dragAndDrop}
					</h1>
					<div>
						{phraseBook.or}
					</div>
					<div>
						<label className="upload-button" htmlFor="file-upload">
							{phraseBook.chooseFile}
						</label>
						<input
							style={{display: "none"}}
							type="file"
							id="file-upload"
							accept={`.${validFileExtension}`}
							onChange={this.handleUpload}
						/>
					</div>
				</div>
			</div>
		)

        return content
	}
}

const mapStateToProps = state => ({
	language: state.language,
	phraseBook: state.phraseBook
})

const mapDispatchToProps = {
	setFileName,
	setFileContent
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Upload))