import React from 'react'
import ReactDOM from 'react-dom'
import { reactive } from 'rxjs-react'
import { interval, of, merge } from 'rxjs'
import { map, delay } from 'rxjs/operators'

const App = reactive(props => {
	const interval$ = interval(100).pipe(delay(1000), map(count => <div>interval: {count}</div>))
	const loading$ = of(<div>loading...</div>)
	return (
		<React.Fragment>
			<h1>Suspense Element</h1>
			{merge(loading$, interval$)}
		</React.Fragment>
	)
})

ReactDOM.render(<App />, document.getElementById('root'))
