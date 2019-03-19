import React from "react"
import autoBind from "react-autobind"

class SpeakerImage extends React.Component {
    constructor(props) {
        super(props)
        autoBind(this)
    }

    doOnClick() {
        const {image, speaker, onClick} = this.props

        if (onClick) {
            onClick(image, speaker)
        }
    }

    doOnMouseOver() {
        const {image, onMouseOver} = this.props

        if (onMouseOver) {
            onMouseOver(image)
        }
    }

    doOnMouseOut() {
        const {image, onMouseOut} = this.props

        if (onMouseOut) {
            onMouseOut(image)
        }
    }

    render() {
        const {index, image, imageSize, imagesPerRow, margin} = this.props
        const isSelected = image.speaker !== null

        return (
            <React.Fragment>
                <div
                    className="inline-block relative"
                    onClick={this.doOnClick}
                    onMouseOver={this.doOnMouseOver}
                    onMouseOut={this.doOnMouseOut}
                    style={{
                        marginRight: `${(index + 1) % imagesPerRow === 0 ? 0 : margin}px`,
                        marginBottom: `${margin}px`
                    }}>
                    {
                        isSelected ?
                        <span className="speaker-image-check">
                            {/* &#10004; */}
                        </span> :
                        null
                    }
                    <img
                        className={`speaker-image${isSelected ? "-selected" : ""}`}
                        style={{
                            width: `${imageSize}px`,
                            height: `auto`
                        }}
                        src={image.thumbnailSrc}
                    />
                </div>
                {(index + 1) % imagesPerRow === 0 ? <div /> : null}
            </React.Fragment>
        )
    }
}

export default SpeakerImage