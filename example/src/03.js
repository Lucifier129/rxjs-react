import React from 'react'
import ReactDOM from 'react-dom'
import { Transition } from 'rxjs-react/component'

const defaultStyles = {
  cursor: 'pointer',
  position: 'absolute',
  width: '100%',
  height: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  color: 'white',
  fontWeight: 800,
  fontSize: '16em'
}
class App extends React.PureComponent {
  state = { toggled: true }
  toggle = e => {
    this.setState(state => ({ toggled: !state.toggled }))
  }
  render() {
    return (
      <div onClick={this.toggle}>
        <Transition
          keys={obj => obj.value}
          list={[this.state.toggled ? { color: '#247BA0', value: 'A' } : { color: '#B2DBBF', value: 'B' }]}
          default={{ opacity: 0 }}
          enter={{ opacity: 1 }}
          leave={{ opacity: 0 }}
          options={{ overshootClamping: true, damping: 10, stiffness: 20 }}
        >
          {(styles, { color, value }) => (
            <div style={{ ...defaultStyles, ...styles, backgroundColor: color }}>{value}</div>
          )}
        </Transition>
      </div>
    )
  }
}

ReactDOM.render(<App />, document.getElementById('root'))
