import React from "react"
import {connect} from "react-redux"
import {setPhraseBook} from "../actions"

class LoadPhraseBook extends React.Component {
	componentDidMount() {
		this.onChange()
	}

	componentDidUpdate() {
		this.onChange()
	}

	onChange() {
        const {currentLanguage, updateLanguage, setPhraseBook} = this.props

        if (!currentLanguage || currentLanguage !== updateLanguage) {
            setPhraseBook(updateLanguage)
        }
	}

	render() {
        const {phraseBook, children} = this.props
		return Object.keys(phraseBook || {}).length ? (children || null) : null
	}
}

const mapStateToProps = state => ({
    currentLanguage: state.language,
    phraseBook: state.phraseBook
})

const mapDispatchToProps = {
    setPhraseBook
}

export default connect(mapStateToProps, mapDispatchToProps)(LoadPhraseBook)