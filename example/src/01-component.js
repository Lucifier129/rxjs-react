import React from 'react'
import ReactDOM from 'react-dom'
import { Spring } from 'rxjs-react/components'

const TRIANGLE = 'M20,380 L380,380 L380,380 L200,20 L20,380 Z'
const RECTANGLE = 'M20,20 L20,380 L380,380 L380,20 L20,20 Z'
const styles = {
  container: {
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    willChange: 'background'
  },
  shape: { width: 300, height: 300, willChange: 'transform' }
}

const Content = ({ toggle, color, scale, shape, start, end, stop, rotation }) => (
  <div
    style={{
      ...styles.container,
      background: `linear-gradient(to bottom, ${start} ${stop}, ${end} 100%)`
    }}
  >
    <svg
      style={{
        ...styles.shape,
        transform: `scale3d(${scale}, ${scale}, ${scale}) rotate(${rotation})`
      }}
      version="1.1"
      viewBox="0 0 400 400"
    >
      <g style={{ cursor: 'pointer' }} fill={color} fillRule="evenodd" onMouseDown={toggle}>
        <path d={shape} />
      </g>
    </svg>
  </div>
)

const triangle = {
  color: '#247BA0',
  start: '#B2DBBF',
  end: '#247BA0',
  scale: 0.6,
  shape: TRIANGLE,
  stop: '0%',
  rotation: '0deg'
}

const rectangle = {
  color: '#70C1B3',
  start: '#B2DBBF',
  end: '#F3FFBD',
  scale: 1.5,
  shape: RECTANGLE,
  stop: '50%',
  rotation: '45deg'
}

class App extends React.Component {
  state = {
    status: false
  }
  toggle = () => {
    this.setState({ status: !this.state.status })
  }
  render() {
    return (
      <Spring to={this.state.status ? rectangle : triangle}>
        {style => {
          return <Content toggle={this.toggle} {...style} />
        }}
      </Spring>
    )
  }
}

ReactDOM.render(<App />, document.getElementById('root'))
