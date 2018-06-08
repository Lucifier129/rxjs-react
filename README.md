[![Build Status](https://travis-ci.org/Lucifier129/rxjs-react.svg?branch=master)](https://travis-ci.org/Lucifier129/rxjs-react)
[![npm version](https://badge.fury.io/js/rxjs-react.svg)](https://badge.fury.io/js/rxjs-react)

    npm install rxjs-react

```jsx
// ES2015
import { reactive } from 'rxjs-react'

// Commonjs
const { reactive } = require('rxjs-react')
```

# Table of Contents 👇

* [Motivation](#motivation)
* [Usage](#usage)
* [API Doc](./doc/api.md)

# Motivation

`React Suspense` is a great new feature in `react v16.x`, it supports writing async code in `render function` without `async/await` syntax, and making `data-fetching`, `loading` and `code-spliting` become easier and simpler.

What if we go further?

Put observable(`rxjs`) in `render function`. [learn more](./doc/api.md#reactive)

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

And put `react` in `observable`. [learn more](./doc/api.md#operators)

[click to see reactive demo](https://codesandbox.io/s/rmkwjx0rrq)

```jsx
import React from 'react'
import { render } from 'react-dom'
import { toReactComponent } from 'rxjs-react/operators'
import { from, of } from 'rxjs'
import { delay, scan, concatMap } from 'rxjs/operators'

const App = from('hello rxjs-react!').pipe(
	concatMap(char => of(char).pipe(delay(300))),
	scan((str, char) => str + char, ''),
	toReactComponent(text => {
		return (
			<div>
				<h1>{text}</h1>
			</div>
		)
	})
)

render(<App />, document.getElementById('root'))
```

# Usage 👇

* [reactive element](#reactive-element)
* [reactive props](#reactive-props)
* [reactive component](#reactive-component)
* [functional reactive component](#functional-reactive-component)
* [everything in jsx can be reactive](#everything-in-jsx-can-be-reactive)
* [data fetching](#data-fetching)
* [loading](#loading)
* [code-spliting](#code-spliting)
* [animation][#animation]

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

## everything in jsx can be reactive

`react element`, `react component`, `react props`, `style`, `react children`, almost everything in jsx can be reactive.

[click to see reactive demo](https://codesandbox.io/s/8lvnzzlyn8)

```jsx
import React from 'react'
import ReactDOM from 'react-dom'
import { reactive } from 'rxjs-react'
import { interval } from 'rxjs'
import { map, startWith, switchMap } from 'rxjs/operators'

const App$ = reactive(() => {
	let Type$ = interval(1000).pipe(
		startWith(0),
		map(value => `h${value % 6 + 1}`)
	)
	let style$ = {
		color: interval(1000 / 60).pipe(
			map(value => `rgb(${value % 255}, 10, 110)`)
		)
	}
	let props$ = {
		count: interval(100)
	}
	return (
		<div style={style$} {...props$}>
			<Type$>
				Everything can be reactive: <span>{interval(100)}</span>
			</Type$>
		</div>
	)
})

ReactDOM.render(<App$ />, document.getElementById('root'))
```

## data-fetching

We can just use `from` to make promise become observable.

[click to see reactive demo](https://codesandbox.io/s/q9nnx8xn26)

```jsx
import React from 'react'
import ReactDOM from 'react-dom'
import { reactive } from 'rxjs-react'
import { from } from 'rxjs'
import { map } from 'rxjs/operators'

@reactive
class App extends React.Component {
	data$ = from(fetch(this.props.url).then(res => res.json()))
	render() {
		return (
			<React.Fragment>
				<h1>data from github api</h1>
				<pre>
					{this.data$.pipe(
						map(data => {
							return JSON.stringify(data, null, 2)
						})
					)}
				</pre>
			</React.Fragment>
		)
	}
}

ReactDOM.render(
	<App url="https://api.github.com/repos/lucifier129/rxjs-react" />,
	document.getElementById('root')
)
```

## loading

We can receive multiple values from an observable, so use `startWith` is a good way to show loading or something defaults.

We can also use `merge(defaultValue$, asyncValue$)`.

[click to see reactive demo](https://codesandbox.io/s/4rqo2ml77w)

```jsx
import React from 'react'
import ReactDOM from 'react-dom'
import { reactive } from 'rxjs-react'
import { from, merge } from 'rxjs'
import { map, delay, startWith } from 'rxjs/operators'

@reactive
class App extends React.Component {
	data$ = from(fetch(this.props.url).then(res => res.json())).pipe(delay(1000))
	render() {
		return (
			<React.Fragment>
				<h1>data from github api</h1>
				<pre>
					{this.data$.pipe(
						map(data => {
							return JSON.stringify(data, null, 2)
						}),
						startWith(<div>loading...</div>)
					)}
				</pre>
			</React.Fragment>
		)
	}
}

ReactDOM.render(
	<App url="https://api.github.com/repos/lucifier129/rxjs-react" />,
	document.getElementById('root')
)
```

## code spliting

The solution of `code-spliting` is the same as `loading`

[click to see reactive demo](https://codesandbox.io/s/olw0nwm2kq)

```jsx
import React from 'react'
import ReactDOM from 'react-dom'
import { reactive } from 'rxjs-react'
import { from, merge, of } from 'rxjs'
import { map } from 'rxjs/operators'

const ComponentA = () => <div>component A</div>
const Loading = () => <div>loading...</div>
const fakeImportComponentA = () =>
	new Promise(resovle => {
		setTimeout(() => resolve(ComponentA), 1000)
	})
const Component$ = merge(of(Loading), from(fakeImportComponentA()))

@reactive
class App extends React.Component {
	render() {
		return (
			<React.Fragment>
				<h1>code spliting with rxjs-react</h1>
				{Component$.pipe(map(Component => <Component />))}
			</React.Fragment>
		)
	}
}

ReactDOM.render(<App />, document.getElementById('root'))
```

# animation

`rxjs-react` provides two ways to implement animations.

* `rxjs` style api

```jsx
import { Spring, SpringSubject } from 'rxjs-react/spring'
const spring$ = new Spring(fromValue, toValue, options)
// and
const subject = new SpringSubject(fromValue, toValue, options)
```

* `react` style api

```jsx
import { Spring Transition } from 'rxjs-react/components'

<Spring from={fromValue} to={toValue} options={options} />
// and
<Transition
	list={list}
	default={default}
	enter={enter}
	leave={leave}
	options={options}
	onEnter={onEnter}
	onLeave={onLeave}
>
	{(styles, item) => <div style={styles}>{item}</div>}
</Transition>
```

[click to see an simple example](https://codesandbox.io/s/p9xzx899nm)

```jsx
import React from 'react'
import { render } from 'react-dom'
import { reactive } from 'rxjs-react'
import { SpringSubject } from 'rxjs-react/spring'

const styles = [
	{
		display: 'inline-block',
		position: 'relative',
		left: -100,
		transform: 'rotate(0deg) scale(1, 1)',
		color: 'purple'
	},
	{
		display: 'inline-block',
		position: 'relative',
		left: 20,
		transform: 'rotate(360deg) scale(2, 2)',
		color: 'red'
	}
]

const containerStyle = {
	fontFamily: 'sans-serif',
	textAlign: 'center',
	fontSize: '30px',
	paddingTop: 30
}

@reactive
class App extends React.Component {
	spring$ = SpringSubject(styles[0])
	handleToggle = () => {
		this.spring$.next(styles.reverse()[0])
	}
	render() {
		return (
			<div style={containerStyle}>
				<button onClick={this.handleToggle}>toggle</button>
				<div style={this.spring$}>{'\u2728'}</div>
			</div>
		)
	}
}

render(<App />, document.getElementById('root'))
```

## some of react-spring examples reimplemented by rxjs-react

* [demo1](https://codesandbox.io/s/3yr1rjv245)
* [demo2](https://codesandbox.io/s/8p3wk0ym02)
* [demo3](https://codesandbox.io/s/l9xqwxop9q)
* [demo4](https://codesandbox.io/s/6l9jq3p623)
* [demo5](https://codesandbox.io/s/vn74vk9n47)
* [demo6](https://codesandbox.io/s/wkn385j76w)

# Note

The author of this repository is not native speaker, if you find syntax error, please help to improve:-)

Welcome to contribute!
