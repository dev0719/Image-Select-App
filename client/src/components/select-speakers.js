import React from "react"
import {connect} from "react-redux"
import {withRouter} from "react-router-dom"
import autoBind from "react-autobind"
import {saveAs} from "file-saver"

import {setImages, setCaptions, loadImageData, uploadCaptionsFile, setMatch, processFile} from "../actions"
import Loader from "./loader"
import SpeakerImage from "./speaker-image"
import SpeakerThumbnail from "./speaker-thumbnail"

const speakers = ["white", "yellow", "cyan", "green"]

const preloadImages = (images, propName, delay) => {
    const doLoad = (image, index) => {
        setTimeout(() => {
            const preloadedImage = new Image()
            preloadedImage.src = image[propName]
        }, (index + 1) * delay)
    }

    images.map(doLoad)
}

class SelectSpeakers extends React.Component {
    constructor(props) {
        super(props)

        autoBind(this)

        this.hoverOutTimer = 0

        this.state = {
            loadingImages: true,
            processingFile: false,
            speakerIndex: 0,
            hoverContent: null
        }
    }

    componentDidMount() {
        const {setImages, setCaptions, loadImageData, uploadCaptionsFile, history, phraseBook} = this.props

        const afterImageLoad = loadedImages => {
            this.setState({loadingImages: false}, () => {
                if (loadedImages && !loadedImages.length) {
                    alert(phraseBook.videoNotReady)
                    history.goBack()
                }
            })
        }

        const afterUpload = () => null

        setImages([])
        setCaptions([])

        loadImageData().then(afterImageLoad, afterImageLoad)
        uploadCaptionsFile().then(afterUpload, afterUpload)
    }

    componentWillUnmount() {
        clearTimeout(this.hoverOutTimer)
    }

    componentDidUpdate(prevProps) {
        const {images: prevImages} = prevProps
        const {images} = this.props
        const processDelay = 3000
        const loadDelay = 200

        if (prevImages !== images && images.length) {
            const work = () => preloadImages(images, "fullSrc", loadDelay)
            setTimeout(work, processDelay)
        }
    }

    toggleSpeaker(image, speaker) {
        const {setMatch} = this.props
        setMatch(image, image.speaker === speaker ? null : speaker)
    }

    deselectSpeaker(image) {
        const {setMatch} = this.props
        setMatch(image, null)
    }

    onMouseOverImage(image) {
        const {captions} = this.props
        const hoverContent = {src: image.fullSrc, lines: captions[image.index] || []}

        clearTimeout(this.hoverOutTimer)
        this.setState({hoverContent})
    }

    onMouseOutImage() {
        const interval = 350
        this.hoverOutTimer = setTimeout(() => this.setState({hoverContent: null}), interval)
    }

    goNext() {
        const {speakerIndex} = this.state

        if (speakerIndex + 1 === speakers.length) {
            this.getResults()
        } else {
            this.setState({speakerIndex: speakerIndex + 1})
        }
    }

    goPrev() {
        const {speakerIndex} = this.state
        this.setState({speakerIndex: speakerIndex - 1})
    }

    async getResults() {
        const {processFile, fileName} = this.props
        let result = null

        this.setState({processingFile: true})

        try {
            result = await processFile(speakers)
        } catch(e) {}

        if (result) {
            saveAs(new Blob([result]), `${fileName}_positioned.stl`)
        }

        this.setState({processingFile: false})
    }

    render() {
        const {loadingImages, processingFile, speakerIndex, hoverContent} = this.state

        if (processingFile) {
            return <Loader />
        }

        const {phraseBook, images} = this.props
        const currentSpeaker = speakers[speakerIndex]
        const sectionMargin = 15
        const sectionPadding = 24

        const leftWidth = 600
        const selectionsPerRow = 4
        const selectionMargin = 10
        const selectionSize = ((leftWidth - (sectionPadding * 2)) - ((selectionsPerRow - 1) * selectionMargin)) / selectionsPerRow

        const rightWidth = 600
        const thumbnailsPerRow = 6
        const thumbnailMargin = 16
        const thumbnailSize = ((rightWidth - (sectionPadding * 2)) - (thumbnailsPerRow * thumbnailMargin)) / thumbnailsPerRow

        const speakersWithResults = speakers.filter(speaker => images.filter(image => image.speaker === speaker).length)

        const header = (
            <div className="speaker-controls" style={{padding: `${sectionPadding}px ${sectionPadding}px ${sectionPadding - 16 }px ${sectionPadding}px`}}>
                <div>
                    <button
                        disabled={speakerIndex === 0}
                        style={{width: `${selectionSize}px`}}
                        onClick={this.goPrev}
                        type="button"
                        className="blended-button">
                        {phraseBook.goPrev}
                    </button>
                </div>
                <div>
                    <div>{phraseBook.selectImages}</div>
                    <h1 style={{color: currentSpeaker}}>{currentSpeaker}</h1>
                </div>
                <div>
                    <button
                        disabled={!speakers.length || (speakerIndex + 1 === speakers.length && !speakersWithResults.length)}
                        style={{width: `${selectionSize}px`}}
                        onClick={this.goNext}
                        type="button"
                        className="active-button">
                        {speakerIndex + 1 === speakers.length ? phraseBook.complete : phraseBook.goNext}
                    </button>
                </div>
            </div>
        )

        const selectImages = images.filter(image => image.speaker === currentSpeaker || image.speaker === null)

        const speakerImages = (
            <div className="speaker-images" style={{padding: `${sectionPadding}px`}}>
                    {
                        loadingImages ?
                        <Loader /> :
                        (
                            selectImages.length ?
                            selectImages.map((image, index) => (
                                <SpeakerImage
                                    key={`speaker-image-${image.key}`}
                                    index={index}
                                    image={image}
                                    speaker={currentSpeaker}
                                    imageSize={selectionSize}
                                    imagesPerRow={selectionsPerRow}
                                    margin={selectionMargin}
                                    onClick={this.toggleSpeaker}
                                    onMouseOver={this.onMouseOverImage}
                                    onMouseOut={this.onMouseOutImage}
                                />
                            )) :
                            <div className="no-speakers-left">
                                {phraseBook.noSpeakersLeft}
                            </div>
                        )
                    }
            </div>
        )

        const hoverImage = (
            hoverContent !== null ?
            <React.Fragment>
                <div
                    className="hover-image-container-layer"
                    style={{
                        width: `${rightWidth}px`,
                        marginLeft: `${sectionMargin}px`,
                        left: `calc(((100vw - ${leftWidth}px - ${rightWidth}px) / 2) + ${leftWidth}px)`
                    }}
                />
                <div
                    className="hover-image-container"
                    style={{
                        width: `${rightWidth}px`,
                        marginLeft: `${sectionMargin}px`,
                        left: `calc(((100vw - ${leftWidth}px - ${rightWidth}px) / 2) + ${leftWidth}px)`
                    }}>
                    <div className="hover-image">
                        <img src={hoverContent.src} style={{width: `${rightWidth}px`, height: "auto"}} />
                        {
                            hoverContent.lines.length ?
                            <div className="hover-content">
                                {
                                    hoverContent.lines.map((line, index) => (
                                        <div key={`captions-${index}`} style={{color: line.color}}>
                                            {line.text}
                                        </div>
                                    ))
                                }
                            </div> :
                            null
                        }
                    </div>
                </div>
            </React.Fragment> :
            null
        )

        const selections = (
            <div className="speaker-selections" style={{padding: `${sectionPadding}px`}}>
                {
                    speakersWithResults.map(speaker => (
                        <div key={`speaker-thumbnail-${speaker}`}>
                            <div className="speaker-thumbnail-header">
                                <strong style={{color: speaker}}>
                                    {speaker}
                                </strong>
                            </div>
                            <div>
                                {
                                    images
                                        .filter(image => image.speaker === speaker)
                                        .map((image, index) => (
                                            <SpeakerThumbnail
                                                key={`speaker-thumbnail-${speaker}-${image.key}`}
                                                index={index}
                                                image={image}
                                                speaker={speaker}
                                                imageSize={thumbnailSize}
                                                imagesPerRow={thumbnailsPerRow}
                                                margin={thumbnailMargin}
                                                onClick={this.deselectSpeaker}
                                            />
                                        ))
                                }
                            </div>
                        </div>
                    ))
                }
            </div>
        )

        return (
            <React.Fragment>
                <div className="select-speaker-content">
                    <div
                        className="left-content"
                        style={{width: `${leftWidth}px`, marginRight: `${sectionMargin}px`}}>
                        {header}
                        {speakerImages}
                    </div>
                    <div
                        className="right-content"
                        style={{width: `${rightWidth}px`, marginLeft: `${sectionMargin}px`}}>
                        {selections}
                    </div>
                </div>
                {hoverImage}
            </React.Fragment>
        )
    }
}

const mapStateToProps = state => ({
    fileName: state.fileName,
    phraseBook: state.phraseBook,
    images: state.images,
    captions: state.captions
})

const mapDispatchToProps = {
    setImages,
    setCaptions,
    loadImageData,
    uploadCaptionsFile,
    setMatch,
    processFile
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(SelectSpeakers))