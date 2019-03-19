const phrases = {
	dragAndDrop: [
		{
			language: "en",
			value: "Drag & Drop an STL File Here"
		}
	],
	or: [
		{
			language: "en",
			value: "Or"
		}
	],
	chooseFile: [
		{
			language: "en",
			value: "Choose File"
		}
	],
	invalidFileExtension: [
		{
			language: "en",
			value: "Invalid file extension."
		}
	],
	selectImages: [
		{
			language: "en",
			value: "Select all images of speakers with captions in"
		}
	],
	noSpeakersLeft: [
		{
			language: "en",
			value: "No speakers left to choose"
		}
	],
	goPrev: [
		{
			language: "en",
			value: "Prev"
		}
	],
	goNext: [
		{
			language: "en",
			value: "Next"
		}
	],
	complete: [
		{
			language: "en",
			value: "Complete"
		}
	],
	videoNotReady: [
		{
			language: "en",
			value: "Either the video hasn't been processed yet or the STL file name does not match the video file name. Please check back later or make sure the file matches the video file name (e.g. \"SAMPLE.stl\" for \"SAMPLE.mpg\" video)."
		}
	]
}

const getPhraseBook = language => {
	const phraseBook = {}

	Object.keys(phrases).map(key => {
		const entry = phrases[key].filter(entry => entry.language === language)[0]

		if (entry) {
			phraseBook[key] = entry.value
		}
	})

	return phraseBook
}

export default getPhraseBook