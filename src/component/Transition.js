import React from 'react'
import Spring from './Spring'

const indentity = x => x

export default class Transition extends React.PureComponent {
  static defaultProps = {
    keys: indentity
  }
  static getDerivedStateFromProps(nextProps, prevState) {
    let { list, keyMap } = prevState.transitions
    let newTransitions = createTransitions(nextProps.list, nextProps.keys)
    let { list: newList, keyMap: newKeyMap } = newTransitions
    for (let i = 0; i < list.length; i++) {
      let item = list[i]
      if (item.type === 'delete') continue
      let index = item.index
      if (newKeyMap.hasOwnProperty(item.key)) {
        let newItem = newList.find(newItem => newItem.key === item.key)
        if (newItem.index === index) {
          newItem.type = 'static'
        } else {
          newItem.type = 'reorder'
        }
      } else {
        newList.splice(index, 0, { ...item, type: 'delete' })
      }
    }
    return {
      transitions: newTransitions
    }
  }
  state = {
    transitions: createTransitions(this.props.list, this.props.keys)
  }
  render() {
    return (
      <React.Fragment>
        {this.state.transitions.list.map(item => {
          return (
            <TransitionItem
              key={item.key}
              item={item}
              default={this.props.default}
              enter={this.props.enter}
              leave={this.props.leave}
              options={this.props.options}
            >
              {this.props.children}
            </TransitionItem>
          )
        })}
      </React.Fragment>
    )
  }
}

class TransitionItem extends React.PureComponent {
  state = {
    delete: false
  }
  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.item.type !== 'delete') {
      return { delete: false }
    }
    return null
  }
  handleAnimated = () => {
    if (this.props.item.type === 'delete') {
      this.setState({ delete: true })
    }
  }
  render() {
    if (this.state.delete) return null
    let to
    if (this.props.item.type === 'delete') {
      to = this.props.leave
    } else {
      to = this.props.enter
    }
    return (
      <Spring
        from={this.props.default}
        to={to}
        options={{ overshootClamping: true, damping: 30, stiffness: 100, ...this.props.options }}
        onAnimated={this.handleAnimated}
        delay={
          Array.isArray(this.props.delay)
            ? this.props.delay[this.props.item.index]
            : typeof this.props.delay === 'function'
              ? this.props.delay(this.props.item.value, this.props.item.index)
              : this.props.delay
        }
      >
        {style => this.props.children(style, this.props.item.value, this.props.item.index)}
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
      type: 'create',
      value: item,
      key: key,
      index: index
    }
  })
  return {
    list: results,
    keyMap
  }
}
