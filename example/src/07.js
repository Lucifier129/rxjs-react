import React from 'react'
import ReactDOM from 'react-dom'
import { reactive } from 'rxjs-react'
import { of, merge, from } from 'rxjs'
import { map, mapTo } from 'rxjs/operators'

const delayTime = time => new Promise(resolve => setTimeout(resolve, time))

const Content = ({ text }) => <div>async content: {text}</div>
const Loading = () => <div>loading...</div>
const Content$ = merge(of(Loading), from(delayTime(1000)).pipe(mapTo(Content)))

const App = reactive(props => {
	return (
		<div>
			<h1>Suspense Component</h1>
			<Content$ text="test" />
		</div>
	)
})

ReactDOM.render(<App />, document.getElementById('root'))
