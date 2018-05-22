//forked from: https://github.com/chenglou/react-motion/tree/master/demos/demo3-todomvc-list-transition
import React from 'react'
import ReactDOM from 'react-dom'
import { reactive } from 'rxjs-react'
import { Transition } from 'rxjs-react/component'

class App extends React.Component {
	state = {
		todos: [
			{ key: 't1', data: { text: 'Board the plane', isDone: false } },
			{ key: 't2', data: { text: 'Sleep', isDone: false } },
			{ key: 't3', data: { text: 'Try to finish conference slides', isDone: false } },
			{ key: 't4', data: { text: 'Eat cheese and drink wine', isDone: false } },
			{ key: 't5', data: { text: 'Go around in Uber', isDone: false } },
			{ key: 't6', data: { text: 'Talk with conf attendees', isDone: false } },
			{ key: 't7', data: { text: 'Show Demo 1', isDone: false } },
			{ key: 't8', data: { text: 'Show Demo 2', isDone: false } }
		],
		value: '',
		selected: 'all'
	}

	handleSelect = selected => this.setState({ selected })
	handleClearCompleted = () => this.setState({ todos: this.state.todos.filter(({ data }) => !data.isDone) })
	handleDestroy = date => this.setState({ todos: this.state.todos.filter(({ key }) => key !== date) })
	handleChange = ({ target: { value } }) => this.setState({ value })

	handleSubmit = e =>
		e.preventDefault() ||
		this.setState({
			value: '',
			todos: [
				{
					key: 't' + Date.now(),
					data: { text: this.state.value, isDone: false }
				}
			].concat(this.state.todos)
		})

	handleDone = doneKey =>
		this.setState({
			todos: this.state.todos.map(todo => {
				const {
					key,
					data: { text, isDone }
				} = todo
				return key === doneKey ? { key: key, data: { text: text, isDone: !isDone } } : todo
			})
		})

	handleToggleAll = () =>
		this.setState({
			todos: this.state.todos.map(({ key, data: { text, isDone } }) => ({
				key: key,
				data: { text: text, isDone: !this.state.todos.every(({ data }) => data.isDone) }
			}))
		})

	getItems = () => {
		const { todos, value, selected } = this.state
		return todos.filter(({ data: { isDone, text } }) => {
			return (
				text.toUpperCase().indexOf(value.toUpperCase()) >= 0 &&
				((selected === 'completed' && isDone) || (selected === 'active' && !isDone) || selected === 'all')
			)
		})
	}

	render() {
		const { todos, value, selected } = this.state
		const itemsLeft = todos.filter(({ data: { isDone } }) => !isDone).length
		const items = this.getItems()
		return (
			<section className="todoapp">
				<Header value={value} handleSubmit={this.handleSubmit} handleChange={this.handleChange} />
				<section className="main">
					<input
						className="toggle-all"
						type="checkbox"
						checked={itemsLeft === 0}
						style={{ display: todos.length === 0 ? 'none' : 'inline' }}
						onChange={this.handleToggleAll}
					/>
					<ul className="todo-list">
						<Transition
							keys={item => item.key}
							list={items}
							default={{ height: 0, opacity: 1 }}
							enter={{ height: 60, opacity: 1 }}
							leave={{ height: 0, opacity: 0 }}
						>
							{(style, { key, data: { isDone, text } }) => (
								<li style={style} className={isDone ? 'completed' : ''}>
									<div className="view">
										<input className="toggle" type="checkbox" onChange={() => this.handleDone(key)} checked={isDone} />
										<label>{text}</label>
										<button className="destroy" onClick={() => this.handleDestroy(key)} />
									</div>
								</li>
							)}
						</Transition>
					</ul>
					<Footer
						itemsLeft={itemsLeft}
						selected={selected}
						handleSelect={this.handleSelect}
						handleClearCompleted={this.handleClearCompleted}
					/>
				</section>
			</section>
		)
	}
}

const Header = ({ value, handleSubmit, handleChange }) => (
	<header className="header">
		<h1>todos</h1>
		<form onSubmit={handleSubmit}>
			<input
				autoFocus={true}
				className="new-todo"
				placeholder="What needs to be done?"
				value={value}
				onChange={handleChange}
			/>
		</form>
	</header>
)

const Footer = ({ itemsLeft, selected, handleSelect, handleClearCompleted }) => (
	<footer className="footer">
		<span className="todo-count">
			<strong>{itemsLeft}</strong> {itemsLeft === 1 ? 'item' : 'items'} left
		</span>
		<ul className="filters">
			<li>
				<a className={selected === 'all' ? 'selected' : ''} onClick={() => handleSelect('all')}>
					All
				</a>
			</li>
			<li>
				<a className={selected === 'active' ? 'selected' : ''} onClick={() => handleSelect('active')}>
					Active
				</a>
			</li>
			<li>
				<a className={selected === 'completed' ? 'selected' : ''} onClick={() => handleSelect('completed')}>
					Completed
				</a>
			</li>
		</ul>
		<button className="clear-completed" onClick={handleClearCompleted}>
			Clear completed
		</button>
	</footer>
)

ReactDOM.render(<App />, document.getElementById('root'))
