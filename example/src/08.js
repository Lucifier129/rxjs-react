import React from 'react'
import ReactDOM from 'react-dom'
import { reactive } from 'rxjs-react'
import { interval, of, merge } from 'rxjs'
import { map, delay } from 'rxjs/operators'

const interval$ = interval(100).pipe(
	delay(1000),
	map(count => {
		return <div>interval: {count}</div>
	})
)
const content$ = merge(of(<div>loading...</div>), interval$)

const App = reactive(props => {
	return (
		<React.Fragment>
			<h1>Suspense Element</h1>
			<React.Fragment>{content$}</React.Fragment>
		</React.Fragment>
	)
})

ReactDOM.render(<App />, document.getElementById('root'))
