import React from 'react'
import ReactDOM from 'react-dom'
import { reactive } from 'rxjs-react'
import { interval } from 'rxjs'
import { map } from 'rxjs/operators'

const fontSize$ = interval(100).pipe(map(value => 12 + value % 24))
const dataCount$ = interval(100)
const textCount$ = interval(100)

const App = reactive(props => {
	return (
		<h1 style={{ fontSize: fontSize$ }} data-count={dataCount$}>
			Everything can be reactive: {textCount$}
		</h1>
	)
})

ReactDOM.render(<App />, document.getElementById('root'))
