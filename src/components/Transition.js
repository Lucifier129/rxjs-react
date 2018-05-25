import React from 'react'
import { identity, noop } from 'rxjs'
import Spring from './Spring'

export default class Transition extends React.PureComponent {
	static defaultProps = {
		keys: identity,
		onEnter: noop,
		onLeave: noop,
		children: () => false
	}
	static getDerivedStateFromProps(nextProps, prevState) {
		let newTransitions = createTransitions(nextProps.list, nextProps.keys)
		if (prevState.transitions == null) {
			return { transitions: newTransitions }
		}
		let { list, keyMap } = prevState.transitions
		let { list: newList, keyMap: newKeyMap } = newTransitions
		let newLength = newList.length
		for (let i = 0; i < list.length; i++) {
			let item = list[i]
			if (!newKeyMap.hasOwnProperty(item.key)) {
				item = item.type === 'leave' ? item : { ...item, type: 'leave' }
				newList.splice(i, 0, item)
				newKeyMap[item.key] = 1
			}
		}
		return {
			transitions: newTransitions
		}
	}
	state = {
		transitions: null
	}
	removeItem = targetId => {
		let { list, keyMap } = this.state.transitions
		let newList = list.filter(item => item.id !== targetId)
		let newKeyMap = { ...keyMap }
		delete newKeyMap[targetId]
		this.setState({ transitions: { list: newList, keyMap: newKeyMap } })
	}
	render() {
		let { props } = this
		return this.state.transitions.list.map(item => {
			return (
				<TransitionItem
					key={item.key}
					default={props.default}
					enter={props.enter}
					leave={props.leave}
					options={props.options}
					onEnter={props.onEnter}
					onLeave={props.onLeave}
					onRemove={this.removeItem}
					{...item}
				>
					{props.children}
				</TransitionItem>
			)
		})
	}
}

class TransitionItem extends React.PureComponent {
	static getDerivedStateFromProps(nextProps, prevState) {
		return {
			overshootClamping: true,
			damping: 30,
			stiffness: 100,
			...nextProps.options
		}
	}
	state = {}
	entered = false
	handleAnimated = () => {
		if (this.props.type === 'leave') {
			this.props.onRemove(this.props.id)
			return
		}
		if (this.entered) return
		this.entered = true
		this.props.onEnter(this.props.value, this.props.index)
	}
	componentWillUnmount() {
		// if component have not entered, should not emit onLeave event
		if (!this.entered) return
		this.props.onLeave(this.props.value, this.props.index)
	}
	render() {
		let { state, props } = this
		let to
		if (props.type === 'leave') {
			to = props.leave
		} else {
			to = props.enter
    }
		return (
			<Spring from={props.default} to={to} options={this.state} onAnimated={this.handleAnimated}>
				{style => props.children(style, props.value, props.index)}
			</Spring>
		)
	}
}

const createTransitions = (list, keys) => {
	let keyMap = {}
	let results = list.map((item, index) => {
		let key = keys(item)
		if (keyMap.hasOwnProperty(key)) {
			throw new Error('The key is already existed: ' + key)
		}
		keyMap[key] = 1
		return {
			type: 'enter',
			value: item,
			key: key,
			id: key,
			index: index
		}
	})
	return {
		list: results,
		keyMap
	}
}
