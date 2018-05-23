import React from 'react'
import ReactDOM from 'react-dom'
import { Spring } from 'rxjs-react/components'

class App extends React.PureComponent {
  state = { toggle: true, items: ['item1', 'item2', 'item3', 'item4', 'item5'] }
  toggle = () => this.setState(state => ({ toggle: !state.toggle }))
  render() {
    const { toggle, items } = this.state
    return (
      <div style={{ backgroundColor: '#247BA0' }}>
        {items.map((item, index) => (
          <Spring
            key={item}
            from={{ opacity: 0, x: -100 }}
            to={{ opacity: toggle ? 1 : 0.25, x: toggle ? 0 : 100 }}
            options={{ mass: 2 + index * 5, overshootClamping: true, allowsOverdamping: true }}
          >
            {({ opacity, x }) => (
              <div
                className="box"
                onClick={this.toggle}
                style={{
                  opacity,
                  transform: `translate3d(${x}%,0,0)`
                }}
              />
            )}
          </Spring>
        ))}
      </div>
    )
  }
}

ReactDOM.render(<App />, document.getElementById('root'))
