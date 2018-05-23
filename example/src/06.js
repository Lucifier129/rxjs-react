import 'babel-polyfill'
import React from 'react'
import ReactDOM from 'react-dom'
import { reactive } from 'rxjs-react'
import { toPromise } from 'rxjs-react/operators'
import { SpringSubject } from 'rxjs-react/spring'
import { map, tap, delay, startWith } from 'rxjs/operators'

const delayTime = time => new Promise(resolve => setTimeout(resolve, time))

const state = {
  down: -100,
  up: 100
}

const spring$ = new SpringSubject(state.down, null, { mass: 40, overshootClamping: true })

@reactive
class App extends React.PureComponent {
  state = { items: ['item1', 'item2', 'item3', 'item4', 'item5'] }
  async componentDidMount() {
    while (true) {
      await spring$.next(state.up).pipe(toPromise)
      await spring$.next(state.down).pipe(toPromise)
    }
  }
  render() {
    return (
      <div style={{ position: 'relative' }}>
        {this.state.items.map((_, i) => (
          <svg
            key={i}
            style={{
              width: 100,
              height: 100,
              willChange: 'transform',
              transform: spring$.pipe(map(y => `translate3d(0, ${y}px, 0)`), delay(300 * i), startWith(state.down))
            }}
            viewBox="0 0 400 400"
          >
            <g fill="#247BA0" fillRule="evenodd">
              <path id="path-1" d="M20,380 L380,380 L380,380 L200,20 L20,380 Z" />
            </g>
          </svg>
        ))}
      </div>
    )
  }
}

ReactDOM.render(<App />, document.getElementById('root'))
