import React from 'react'
import ReactDOM from 'react-dom'
import { reactive, toReactiveComponent, toReactComponent } from 'rxjs-react'
import { Observable, interval, Subject, ReplaySubject, merge, of, fromEvent, range } from 'rxjs'
import {
	startWith,
	switchMap,
	mapTo,
	map,
	scan,
	publishReplay,
	refCount,
	debounceTime,
	tap,
	catchError,
	sample,
	delay
} from 'rxjs/operators'
import { spring } from './shared/util'
import EventEmitter from 'events'

const createToggler = status => {
	let options = {
		show: { fromValue: 0, toValue: 1 },
		hide: { fromValue: 1, toValue: 0 }
	}
	let emitter = new EventEmitter()
	let show$ = fromEvent(emitter, 'show')
	let hide$ = fromEvent(emitter, 'hide')
	let state$ =
		merge(show$, hide$)
		|> startWith({ options: status ? options.show : options.hide })
		|> switchMap(
			data =>
				spring(data.options)
				|> tap({ complete: data.handler })
				|> map(Math.abs)
				|> map(value => (value < 1 ? value : 2 - value))
		)
		|> publishReplay(1)
		|> refCount()
	let show = callback => {
		emitter.emit('show', {
			options: options.show,
			handler: callback
		})
	}
	let hide = callback => {
		emitter.emit('hide', {
			options: options.hide,
			handler: callback
		})
	}
	return {
		state$,
		show,
		hide
	}
}

class TodoApp extends React.PureComponent {
	state = {
		text: '',
		todos: []
	}
	uid = 0
	handleChange = event => {
		this.setState({
			text: event.target.value
		})
	}
	handleAdd = () => {
		if (!this.state.text) return
		let todo = {
			id: this.uid++,
			completed: false,
			text: this.state.text
		}
		let todos = this.state.todos.concat(todo)
		this.setState({ todos, text: '' })
	}
	handleRemove = id => {
		let todos = this.state.todos.filter(todo => todo.id !== id)
		this.setState({ todos })
	}
	handleToggle = id => {
		let todos = this.state.todos.map(todo => (todo.id !== id ? todo : { ...todo, completed: !todo.completed }))
		this.setState({ todos })
	}
	handleToggleAll = () => {
		let todos = this.state.todos.map(todo => ({
			...todo,
			completed: !todo.completed
		}))
		this.setState({ todos })
	}
	render() {
		return (
			<div>
				<h1>Todo App</h1>
				<header>
					input: <input type="text" value={this.state.text} onChange={this.handleChange} />
					<button onClick={this.handleAdd}>add</button>
					<button onClick={this.handleToggleAll}>toggleAll</button>
				</header>
				{this.state.todos.map(todo => (
					<TodoItem$ key={todo.id} {...todo} onToggle={this.handleToggle} onRemove={this.handleRemove} />
				))}
			</div>
		)
	}
}

const Timer$ = interval(100) |> map(count => ({ count })) |> toReactComponent(props => props.count)

const toPercent = x => x * 100 + '%'
const show$ = spring({ fromValue: 0, toValue: 1 })
const hide$ = spring({ fromValue: 1, toValue: 0 })
const Slider$ = reactive(({ status }) => {
	let spring$ = status ? show$ : hide$
	let width$ = spring$ |> map(Math.abs) |> map(value => (value < 1 ? value : 2 - value)) |> map(toPercent)
	let style = {
		width: width$,
		height: 3,
		backgroundColor: 'green'
	}
	return <div style={style} />
})

@reactive
class TodoItem$ extends React.PureComponent {
	toggler = createToggler(true)
	handleRemove = () => {
		let remove = value => this.props.onRemove(this.props.id)
		this.toggler.hide(remove)
	}
	handleToggle = () => {
		this.props.onToggle(this.props.id)
	}
	render() {
		let { props, state } = this
		let style = {
			height: this.toggler.state$ |> map(value => value * 40),
			opacity: this.toggler.state$,
			backgroundColor: '#eaeaea',
			marginBottom: 3,
			lineHeight: '40px'
		}
		return (
			<div style={style}>
				{props.text} <button onClick={this.handleToggle}>{props.completed ? 'completed' : 'active'}</button>{' '}
				<button onClick={this.handleRemove}>delete</button>
				<Timer$ />
				<Slider$ status={props.completed} />
			</div>
		)
	}
}

ReactDOM.render(<TodoApp />, document.getElementById('root'))
