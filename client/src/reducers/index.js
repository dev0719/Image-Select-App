import getPhraseBook from "../phrase-book"
import {SET_PHRASEBOOK, SET_IMAGES, SET_MATCH, SET_CAPTIONS, SET_FILE_NAME, SET_FILE_CONTENT} from "../action-types"

const initialState = {
	language: "",
	phraseBook: null,
	images: [],
	captions: [],
	fileName: "",
	fileContent: ""
}

const rootReducer = (state = initialState, action) => {
	switch (action.type) {
		case SET_PHRASEBOOK:
			return {...state, language: action.language, phraseBook: getPhraseBook(action.language)}
		case SET_IMAGES:
			return {...state, images: action.images.map((image, index) => ({...image, index, speaker: null}))}
		case SET_MATCH:
			const {image, speaker} = action

			const newImages = state.images
				.map(currentImage => {
					const newImage = {...currentImage}

					if (newImage.key === image.key) {
						newImage.speaker = speaker
					}

					return newImage
				})

			return {...state, images: newImages}
		case SET_CAPTIONS:
			return {...state, captions: action.captions}
		case SET_FILE_NAME:
			return {...state, fileName: action.fileName}
		case SET_FILE_CONTENT:
			return {...state, fileContent: action.fileContent}
		default:
			return state
	}
}

export default rootReducer