# Table of Contents 👇

* [reactive](#reactive)
* [components](#components)
* [spring](#spring)
* [operators](#operators)

## reactive

```jsx
import { reactive } from 'rxjs-react'
```

`reactive` is the core api of `rxjs-react`, it supports multiple styles.

### reactive(ReactElement) -> ReactElement

If `reactive` receives `ReactElement`, it will return `ReactElement` too, which can re-render automatically when `observable` produce a new value.

Every parts in `ReactElement` can be `observable`, no matter how deep it is.

```jsx
const interval$ = interval(100)
const react_element = reactive(<div>{interval$}</div>)
ReactDOM.render(react_element, document.getElementById('root'))
```

### reactive(observable) -> ReactElement

If `reactive` receives `observable`, it will return `ReactElement`, which will be rendered when `observable` produce a new value.

```jsx
const react_element = reactive(interval(100))
ReactDOM.render(react_element, document.getElementById('root'))
```

### reactive(ReactComponent|ReactPureComponent|ReactFunctionalComponent) -> ReactPureComponent

If `reactive` receives `ReactComponent`, `ReactPureComponent` or `ReactFunctionalComponent`(aka functional stateless component), it will return `ReactPureComponent` which can re-render automatically when `observable` in `ReactElement` rendered by `ReactComponent|ReactPureComponent|ReactFunctionalComponent` produce a new value.

```jsx
// works with react component and decorator syntax
@reactive
class MyReactComponent extends React.Component {
	render() {
		return <div>{interval(100)}</div>
	}
}

const MyReactComponent = class extends React.Component {
	render() {
		return <div>{interval(100)}</div>
	}
}
// ES5 style is ok.
const MyReactiveComponent = reactive(MyReactComponent)

// works with react functional component
const MyFunctionalComponent = reactive(() => {
	return <div>{interval(100)}</div>
})
```

## components

`rxjs-react` provides some useful `ReactComponent`, and they are following the `render props` style.

[click to see wobble spring configuration](https://github.com/skevy/wobble#configuration)

```jsx
import { Spring, Transition } from 'rxjs-react/components'
```

### Spring

Spring is heavy inspired by [react-spring](https://github.com/drcmda/react-spring/blob/master/API-OVERVIEW.md#springs-and-basic-interpolation), and use [wobble](https://github.com/skevy/wobble) under the hood.

> You can interpolate almost everything, from numbers, colors, svg-paths, percentages, arrays to string patterns.

```jsx
<Spring
	// from style
	from={{
		display: 'inline-block',
		position: 'relative',
		left: -100,
		transform: 'rotate(0deg) scale(1, 1)',
		color: 'purple'
	}}
	// to style
	// you can this propValue to trigger next animation.
	to={{
		display: 'inline-block',
		position: 'relative',
		left: 20,
		transform: 'rotate(360deg) scale(2, 2)',
		color: 'red'
	}}
	// spring config https://github.com/skevy/wobble#configuration
	options={springConfigOfWobble}
	// animating event
	onAnimating={Function}
	// animation end event
	onAnimated={Function}
>
	{styles => <div style={styles}>text</div>}
</Spring>
```

We can combine `reactive` and `Spring` together, [click to see the demo](https://codesandbox.io/s/7y4ylmz21j)

```jsx
import React from 'react'
import { render } from 'react-dom'
import { reactive } from 'rxjs-react'
import { interval } from 'rxjs'
import { map } from 'rxjs/operators'
import { Spring } from 'rxjs-react/components'

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

const toggle$ = interval(1000).pipe(map(n => styles[n % 2]))

const App = reactive(() => (
	<div style={containerStyle}>
		<Spring from={styles[0]} to={toggle$}>
			{styles => <div style={styles}>{'\u2728'}</div>}
		</Spring>
	</div>
))

render(<App />, document.getElementById('root'))
```

### Transition

`Transition` Component is based on `Spring` Component, it supports a list transition of children.

[click to see the todo-list demo](https://codesandbox.io/s/61yq32o353)

```jsx
<Transition
	// unique in each item, identity function as default
	keys={obj => obj.id}
	// an array of data
	list={list}
	// default style
	default={defaultStyle}
	// enter style
	enter={enterStyle}
	// leave style
	leave={leaveStyle}
	//  spring config https://github.com/skevy/wobble#configuration
	options={springConfigOfWobble}
	// callback of enter event
	onEnter={(value, index) => {}}
	// callback of leave event
	onLeave={(value, index) => {}}
>
	{(styles, item, index) => {
		// render function for each items
		return <div style={styles}>{item}</div>
	}}
</Transition>
```

## spring

`rxjs-react` provides two `Spring` api, `Spring` and `SpringSubject`. They are supporting `Spring Component` and `Transiton Component` mentioned above.

```jsx
import { Spring, SpringSubject } from 'rxjs-react/spring'
```

### Spring(fromValue, toValue, options) -> observable

`Spring` return `observable` which can be subscribed.

* fromValue can be number, string, object or array
* toValue can be number, string, object or array
* [options doc](https://github.com/skevy/wobble#configuration)

Note: If `fromValue` is equal or shallow equal with `toValue`, observable will just feed value once.

### SpringSubject(fromValue, toValue, options) -> observable(subject-like)

`SpringSubject` is similar to `Spring`, except it returns a `subject-like` object, you can call `next(nextValue)` to update the `toValue`.

[click to see an simple example](https://codesandbox.io/s/p9xzx899nm)

What is `subject-like` means? `rxjs-react` wrap it to be `subject.next(nextValue, springOptions)` of type signature, so we can update `springOptions` too.

## operators

`rxjs-react` provides some useful `operators`.

```jsx
import {
	toReactComponent,
	toReactiveComponent,
	toReactContext,
	toPromise
} from 'rxjs-react/operators'
```

### toReactComponent -> observable -> (render: (value, props) -> ReactElement) -> ReactComponent

`toReactComponent` can make `observable` to be `ReactComponent`, it receives a render function which has two arguments, the first one is value from `observable`, the second one is props from `ReactComponent`

[click to see reactive demo](https://codesandbox.io/s/rmkwjx0rrq)

### toReactiveComponent -> observable -> (render: (value, props) -> ReactElement|observable) -> ReactComponent

`toReactiveComponent` is similar to `toReactComponent`, except it supports write `observable` in `render` function.

[click to see the reactive demo](https://codesandbox.io/s/89xkmowq8)

```jsx
import React from 'react'
import { render } from 'react-dom'
import { toReactiveComponent } from 'rxjs-react/operators'
import { from, of, interval, noop } from 'rxjs'
import { delay, scan, concatMap, publishReplay, refCount } from 'rxjs/operators'

const interval$ = interval(100).pipe(publishReplay(1), refCount())
// keep interval$ unsubscribe
interval$.subscribe(noop)
const App = from('hello rxjs-react!').pipe(
	concatMap(char => of(char).pipe(delay(300))),
	scan((str, char) => str + char, ''),
	toReactiveComponent(text => {
		return (
			<div>
				<h1>{text}</h1>
				<p>count: {interval$}</p>
			</div>
		)
	})
)

render(<App />, document.getElementById('root'))
```

### toReactContext -> observable -> ReactContext

`toReactContext` can make `observable` become `ReactContext`, the value of `context` is came from `observable`

```jsx
import React from 'react'
import { render } from 'react-dom'
import { toReactContext } from 'rxjs-react/operators'
import { interval } from 'rxjs'
import { map } from 'rxjs/operators'

const colors = ['purple', 'red']
const { Provider, Consumer } = interval(800).pipe(
	map(n => colors[n % 2]),
	toReactContext
)

const Content = props => {
	return (
		<Consumer>
			{color => {
				return <div style={{ color }}>{props.children}</div>
			}}
		</Consumer>
	)
}

const App = () => {
	return (
		<Provider>
			<Content>content text with ReactContext</Content>
		</Provider>
	)
}

render(<App />, document.getElementById('root'))
```

### toPromise -> observable -> promise

`toPromise` can make `observable` become `promise`, and collects all values came from `observable`.

[click to see the reactive demo](https://codesandbox.io/s/6l9jq3p623)

```jsx
while (true) {
  await delayTime(1000);
  await container$.next(state.container.show).pipe(toPromise);
  await content$.next(state.content.show).pipe(toPromise);
  await delayTime(1000);
  await content$.next(state.content.hide).pipe(toPromise);
  await container$.next(state.container.hide).pipe(toPromise);
}
```
