import 'babel-polyfill'
import React from 'react'
import ReactDOM from 'react-dom'
import { reactive, toPromise } from 'rxjs-react'
import { Spring, SpringSubject } from 'rxjs-react/spring'
import { map, delay } from 'rxjs/operators'

const delayTime = time => new Promise(resolve => setTimeout(resolve, time))

const state = {
  container: {
    show: { x: 0 },
    hide: { x: -100 }
  },
  content: {
    show: { x: 0, opacity: 1 },
    hide: { x: -120, opacity: 0 }
  }
}

const container$ = new SpringSubject(state.container.hide)
const content$ = new SpringSubject(state.content.hide)

const style$ = {
  container: container$.pipe(map(({ x }) => ({ transform: `translate3d(${x}%,0,0)` }))),
  content: content$.pipe(map(({ x, ...styles }) => ({ transform: `translate3d(${x}%,0,0)`, ...styles })))
}

@reactive
class App extends React.Component {
  state = {
    items: ['Lorem ipsum', 'dolor sit amet', 'consectetur adipiscing elit', 'sed do eiusmod tempor']
  }

  async componentDidMount() {
    while (true) {
      await delayTime(1000)
      await container$.next(state.container.show).pipe(toPromise)
      await content$.next(state.content.show).pipe(toPromise)
      await delayTime(1000)
      await content$.next(state.content.hide).pipe(toPromise)
      await container$.next(state.container.hide).pipe(toPromise)
    }
  }

  render() {
    return (
      <div className="container" style={style$.container}>
        {this.state.items.map((item, index) => (
          <div key={item} className="item" style={style$.content.pipe(delay(100 * index))}>
            {item}
          </div>
        ))}
      </div>
    )
  }
}

ReactDOM.render(<App />, document.getElementById('root'))
