[![Build Status](https://travis-ci.org/Lucifier129/rxjs-react.svg?branch=master)](https://travis-ci.org/Lucifier129/rxjs-react)
[![npm version](https://badge.fury.io/js/rxjs-react.svg)](https://badge.fury.io/js/rxjs-react)

    npm install rxjs-react

```javascript
// ES2015
import { reactive } from 'rxjs-react'

// Commonjs
const { reactive } = require('rxjs-react')
```

# Table of Contents 👇

* [Motivation](#motivation)
* [Usage](#usage)
* [API Doc](#api-doc)

# Motivation

`React Suspense` is a great new feature in `react`, it supports writing async code in `render function` without `async/await` syntax, and making `data-fetching`, `loading` and `code-spliting` become easier and simpler.

What if we go further?

Put observable(`rxjs`) in `render function`.

[click to see reactive demo](https://codesandbox.io/s/9o6ym1jrr4)

```jsx
import React from 'react'
import { render } from 'react-dom'
import { reactive } from 'rxjs-react'
import { from, of } from 'rxjs'
import { map, delay, scan, concatMap } from 'rxjs/operators'

const App = reactive(() => {
	const hello$ = from('hello rxjs-react!').pipe(
		concatMap(char => of(char).pipe(delay(300))),
		scan((str, char) => str + char, ''),
		map(text => <h1>{text}</h1>)
	)
	return <div>{hello$}</div>
})

render(<App />, document.getElementById('root'))
```

# Usage

## reactive element

`ReactElement` can be reactive.

[click to see reactive demo](https://codesandbox.io/s/34nv3y6891)

```jsx
import React from 'react'
import { render } from 'react-dom'
import { reactive } from 'rxjs-react'
import { interval } from 'rxjs'

const app = reactive(<h1>{interval(10)}</h1>)
render(app, document.getElementById('root'))
```

## reactive props

`Props` can be reactive.

[click to see reactive demo](https://codesandbox.io/s/l9ppox2jl)

```jsx
import React from 'react'
import { render } from 'react-dom'
import { reactive } from 'rxjs-react'
import { interval } from 'rxjs'

const Count = props => <h1>count {props.count} from reactive props</h1>

const app = reactive(<Count count={interval(10)} />)

render(app, document.getElementById('root'))
```

## reactive component

`ReactComponent` can be reactive.

[click to see reactive demo](https://codesandbox.io/s/ppoz847m67)

```jsx
import React from 'react'
import { render } from 'react-dom'
import { reactive } from 'rxjs-react'
import { Subject, merge, interval } from 'rxjs'
import { map, mapTo, scan, startWith } from 'rxjs/operators'

@reactive
class App extends React.PureComponent {
	incre$ = new Subject()
	decre$ = new Subject()
	autoIncre$ = interval(100)
	count$ = merge(
		this.incre$.pipe(mapTo(+1)),
		this.decre$.pipe(mapTo(-1)),
		this.autoIncre$.pipe(mapTo(+0.01))
	).pipe(startWith(0), scan((sum, n) => sum + n, 0), map(n => n.toFixed(2)))
	render() {
		return (
			<React.Fragment>
				<button onClick={() => this.incre$.next()}>+1</button>
				{this.count$}
				<button onClick={() => this.decre$.next()}>-1</button>
			</React.Fragment>
		)
	}
}

render(<App />, document.getElementById('root'))
```

## functional reactive component

`functional stateless component` can be reactive.

[click to see reactive demo](https://codesandbox.io/s/wkyo9442vk)

```jsx
import React from 'react'
import { render } from 'react-dom'
import { reactive } from 'rxjs-react'
import { interval } from 'rxjs'

const App = reactive(props => <h1>count {interval(props.period)}</h1>)

render(<App period={10} />, document.getElementById('root'))
```
