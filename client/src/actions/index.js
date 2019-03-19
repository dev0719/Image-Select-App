import axios from "axios"
import {SET_PHRASEBOOK, SET_IMAGES, SET_MATCH, SET_CAPTIONS, SET_FILE_CONTENT, SET_FILE_NAME} from "../action-types"

export const setImages = images => dispatch => dispatch({type: SET_IMAGES, images})

export const setCaptions = captions => dispatch => dispatch({type: SET_CAPTIONS, captions})

export const setPhraseBook = language => dispatch => dispatch({type: SET_PHRASEBOOK, language})

export const setMatch = (image, speaker) => dispatch => dispatch({type: SET_MATCH, image, speaker})

export const loadImageData = () => async (dispatch, getState) => {
    const {fileName} = getState()
    const {data: images} = await axios.get(`/api/image-data/${fileName}`)
    dispatch({type: SET_IMAGES, images})

    return images
}

export const setFileName = fileName => async dispatch => dispatch({type: SET_FILE_NAME, fileName})

export const setFileContent = fileContent => async dispatch => dispatch({type: SET_FILE_CONTENT, fileContent})

export const uploadCaptionsFile = () => async (dispatch, getState) => {
    const {fileName, fileContent} = getState()
    const {data: captions} = await axios.post(`/api/upload-file/${encodeURIComponent(fileName)}`, {fileContent})
    dispatch({type: SET_CAPTIONS, captions})

    return captions
}

export const processFile = speakers => async (dispatch, getState) => {
    const {images, fileName, fileContent} = getState()
    const speakerSelections = {}

    speakers.map(speaker => {
        speakerSelections[speaker] = images.filter(image => image.speaker === speaker).map(image => image.key)
    })

    const {data: result} = await axios.post(`/api/process-file/${encodeURIComponent(fileName)}`, {fileContent, speakerSelections}, {responseType: 'arraybuffer'})

    return result
}