import "@babel/polyfill"

import React from "react"
import ReactDOM from "react-dom"
import {BrowserRouter, Switch, Route, his} from "react-router-dom"
import {createStore, applyMiddleware} from "redux"
import {Provider} from "react-redux"
import thunk from "redux-thunk"

import rootReducer from "./reducers"
import LoadPhraseBook from "./components/load-phrase-book"
import Upload from "./components/upload"
import SelectSpeakers from "./components/select-speakers"

const store = createStore(rootReducer, applyMiddleware(thunk))

history.pushState(null, "", "/en/upload")

const App = (
	<Provider store={store}>
		<BrowserRouter>
			<Switch>
				<Route path="/:language/*" render={props =>
					<LoadPhraseBook updateLanguage={props.match.params.language}>
						<Switch>
							<Route exact path="/:language/upload" component={Upload} />
							<Route exact path="/:language/select-speakers" component={SelectSpeakers} />
						</Switch>
					</LoadPhraseBook>
				} />
			</Switch>
		</BrowserRouter>
	</Provider>
)

ReactDOM.render(App, document.getElementById("app"))