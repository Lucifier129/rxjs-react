import React from 'react'
import ReactDOM from 'react-dom'
import { Transition } from 'rxjs-react/components'

const defaultStyles = {
  overflow: 'hidden',
  width: '100%',
  backgroundColor: '#247BA0',
  color: 'white',
  display: 'flex',
  justifyContent: 'center',
  fontSize: '4em'
}

class ListItem extends React.PureComponent {
  render() {
    return <li />
  }
}

class App extends React.PureComponent {
  state = { items: ['item1', 'item2', 'item3'] }

  componentDidMount() {
    // new item
    setTimeout(() => this.setState({ items: ['item1', 'item2', 'item3', 'item4'] }), 1000)
    // new item in between
    setTimeout(() => this.setState({ items: ['item1', 'item2', 'item5', 'item3', 'item4'] }), 2000)
    // deleted items
    setTimeout(() => this.setState({ items: ['item1', 'item3', 'item4'] }), 3000)
    // scrambled order
    setTimeout(() => this.setState({ items: ['item4', 'item2', 'item3', 'item1'] }), 4000)
  }

  render() {
    return (
      <ul>
        <Transition
          list={this.state.items}
          default={{ opacity: 0, height: 0 }}
          enter={{ opacity: 1, height: 100 }}
          leave={{ opacity: 0, height: 0 }}
        >
          {(styles, item) => {
            return <li style={{ ...defaultStyles, ...styles }}>{item}</li>
          }}
        </Transition>
      </ul>
    )
  }
}

ReactDOM.render(<App />, document.getElementById('root'))
