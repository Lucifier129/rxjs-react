import React from 'react'
import ReactDOM from 'react-dom'
import { reactive } from 'rxjs-react'
import { springObject, springValue } from 'rxjs-react/spring'
import { combineLatest } from 'rxjs'
import { map, tap } from 'rxjs/operators'

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

const Content = ({
  toggle,
  color,
  scale,
  shape,
  start,
  end,
  stop,
  rotation
}) => (
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
      <g
        style={{ cursor: 'pointer' }}
        fill={color}
        fillRule="evenodd"
        onClick={toggle}
      >
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

const triangle2rectangle$ = springValue(triangle, rectangle)
const rectangle2triangle$ = springValue(rectangle, triangle)

@reactive
class App extends React.Component {
  state = { toggle: true }
  toggle = () => this.setState(state => ({ toggle: !state.toggle }))
  render() {
    const toggle = this.state.toggle
    const style$ = toggle ? triangle2rectangle$ : rectangle2triangle$
    return style$.pipe(
      map(style => <Content toggle={this.toggle} {...style} />)
    )
  }
}

ReactDOM.render(<App />, document.getElementById('root'))
