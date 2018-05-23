import React from 'react'
import ReactDOM from 'react-dom'
import { reactive } from 'rxjs-react'
import { interval } from 'rxjs'
import { map } from 'rxjs/operators'

const color$ = interval(1000 / 60).pipe(map(value => `rgb(${value % 255}, 10, 110)`))
const dataCount$ = interval(100)
const textCount$ = interval(100)

const App = reactive(props => {
	return (
		<h1 style={{ color: color$ }} data-count={dataCount$}>
			Everything can be reactive: {textCount$}
		</h1>
	)
})

ReactDOM.render(<App />, document.getElementById('root'))
