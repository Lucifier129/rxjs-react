import React from 'react'
import ReactDOM from 'react-dom'
import { reactive, toReactiveComponent, toReactComponent } from 'rxjs-react'
import { dynamicSpring } from 'rxjs-react/spring'
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

@reactive
class Slider$ extends React.PureComponent {
  constructor(props) {
    super(props)
    this.spring$ = dynamicSpring()
  }
  update = status => {
    this.spring$.next(status ? 1 : 0)
  }
  componentDidMount() {
    this.update(this.props.status)
  }
  componentDidUpdate(prevProps) {
    if (prevProps.status !== this.props.status) {
      this.update(this.props.status)
    }
  }
  render() {
    let style = {
      width: this.spring$ |> map(toPercent),
      height: 3,
      backgroundColor: 'green'
    }
    return <div style={style} />
  }
}

@reactive
class TodoItem$ extends React.PureComponent {
  spring$ = dynamicSpring()
  handleRemove = () => {
    let remove = value => this.props.onRemove(this.props.id)
    this.spring$.next(0).subscribe({ complete: remove })
  }
  handleToggle = () => {
    this.props.onToggle(this.props.id)
  }
  render() {
    let { props, state } = this
    let style = {
      height: this.spring$ |> map(value => value * 40),
      opacity: this.spring$,
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
