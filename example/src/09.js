import React from 'react'
import ReactDOM from 'react-dom'
import { reactive } from 'rxjs-react'
import { interval } from 'rxjs'
import { map, startWith, switchMap } from 'rxjs/operators'

const App = reactive(() => {
	let Type = interval(1000).pipe(startWith(0), map(value => `h${value % 6 + 1}`))
	let style = {
		color: interval(1000 / 60).pipe(map(value => `rgb(${value % 255}, 10, 110)`))
	}
	let props = {
		count: interval(100)
	}
	return (
		<div style={style} {...props}>
			<Type>
				Everything can be reactive: <span>{interval(100)}</span>
			</Type>
		</div>
	)
})

ReactDOM.render(<App />, document.getElementById('root'))
