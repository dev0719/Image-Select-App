import React from "react"
import autoBind from "react-autobind"

class SpeakerThumbnail extends React.Component {
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

    render() {
        const {index, image, imageSize, imagesPerRow, margin} = this.props

        return (
            <React.Fragment>
                <div
                    className="inline-block relative"
                    style={{
                        marginRight: `${margin}px`,
                        marginBottom: `${margin}px`
                    }}>
                    <span
                        onClick={this.doOnClick}
                        className="speaker-thumbnail-x">
                        <span className="speaker-thumbnail-x-content">
                            &times;
                        </span>
                    </span>
                    <img
                        className="speaker-thumbnail"
                        ref={elem => (this.image = elem)}
                        style={{
                            width: `${imageSize}px`,
                            height: "auto"
                        }}
                        src={image.thumbnailSrc}
                    />
                </div>
                {(index + 1) % imagesPerRow === 0 ? <div /> : null}
            </React.Fragment>
        )
    }
}

export default SpeakerThumbnail