import React from 'react'
import ReactDOM from 'react-dom'
import { reactive, toReactComponent, toReactiveComponent } from 'rxjs-react'
import { Spring, SpringSubject } from 'rxjs-react/spring'
import { Spring as SpringComponent } from 'rxjs-react/component'
import { concat } from 'rxjs'
import { map, toPromise } from 'rxjs/operators'

const delay = time => new Promise(resolve => setTimeout(resolve, time))

const containerStyles = [{ from: { x: -100 }, to: { x: 0 } }, { to: { x: -100 } }]
class Container extends React.PureComponent {
	static getDerivedStateFromProps(nextProps) {
		return nextProps.status ? containerStyles[0] : containerStyles[1]
	}
	state = {
		...(this.props.status ? containerStyles[0] : containerStyles[1])
	}
	render() {
		return (
			<SpringComponent from={this.state.from} to={this.state.to}>
				{this.props.children}
			</SpringComponent>
		)
	}
}

const contentStyles = [{ from: { x: -120, opacity: 0 }, to: { x: 0, opacity: 1 } }, { to: { x: -120, opacity: 0 } }]
class Content extends React.PureComponent {
	static getDerivedStateFromProps(nextProps) {
		return nextProps.status ? contentStyles[0] : contentStyles[1]
	}
	state = {
		...(this.props.status ? contentStyles[0] : contentStyles[1])
	}
	render() {
		return (
			<SpringComponent from={this.state.from} to={this.state.to}>
				{this.props.children}
			</SpringComponent>
		)
	}
}

class App extends React.Component {
	state = {
		items: ['Lorem ipsum', 'dolor sit amet', 'consectetur adipiscing elit', 'sed do eiusmod tempor'],
		container: false,
		content: false
	}

	componentDidMount() {
		this.next()
	}
	next = () => {
		this.setState({ container: true })
		delay(1000)
			.then(() => {
				this.setState({ content: true })
				return delay(1000)
			})
			.then(() => {
				this.setState({ container: false, content: false })
				return delay(1000)
			})
			.then(this.next)
	}

	render() {
		return (
			<Container status={this.state.container}>
				{({ x }) => {
					return (
						<div className="container" style={{ transform: `translate3d(${x}%,0,0)` }}>
							<Content status={this.state.content}>
								{({ x, ...styles }) => {
									return this.state.items.map(item => (
										<div key={item} className="item" style={{ transform: `translate3d(${x}%,0,0)`, ...styles }}>
											{item}
										</div>
									))
								}}
							</Content>
						</div>
					)
				}}
			</Container>
		)
	}
}

ReactDOM.render(<App />, document.getElementById('root'))
