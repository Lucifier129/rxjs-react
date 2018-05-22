// Forked from: https://github.com/chenglou/react-motion/tree/master/demos/demo8-draggable-list
// Original: http://framerjs.com/examples/preview/#list-sorting.framer

import React from 'react'
import ReactDOM from 'react-dom'
import { reactive } from 'rxjs-react'
import { Spring, SpringSubject } from 'rxjs-react/spring'
import EventEmitter from 'events'
import { fromEvent, merge } from 'rxjs'
import { map, startWith, switchMap, takeUntil, scan, tap, mergeMap, mapTo, takeLast } from 'rxjs/operators'

const range = count => Array.from({ length: count }).map((_, index) => index + 1)
const clamp = (n, min, max) => Math.max(Math.min(n, max), min)
const itemsCount = 4
function reinsert(arr, from, to) {
  const _arr = arr.slice(0)
  const val = _arr[from]
  _arr.splice(from, 1)
  _arr.splice(to, 0, val)
  return _arr
}

@reactive
class App extends React.Component {
  emitter = new EventEmitter()
  start$ = fromEvent(this.emitter, 'start')
  move$ = fromEvent(this.emitter, 'move')
  end$ = fromEvent(this.emitter, 'end')
  data$ = this.start$.pipe(
    switchMap(data => {
      let move$ = this.move$.pipe(takeUntil(this.end$), map(f => f(data)))
      let end$ = move$.pipe(takeLast(1), map(state => ({ ...state, topDeltaY: 0, originalPosOfLastPressed: 0 })))
      return merge(move$, end$)
    }),
    startWith({ mouseY: 0, topDeltaY: 0, originalPosOfLastPressed: 0, order: range(itemsCount) }),
    scan((prev, curr) => {
      if (prev == null) return curr
      let { order } = prev
      let { mouseY, originalPosOfLastPressed } = curr
      const currentRow = clamp(Math.round(mouseY / 100), 0, itemsCount - 1)
      let newOrder = order
      if (originalPosOfLastPressed && currentRow !== order.indexOf(originalPosOfLastPressed))
        newOrder = reinsert(order, order.indexOf(originalPosOfLastPressed), currentRow)
      return { ...prev, ...curr, order: newOrder }
    }, null)
    // tap(value => console.log('value', value))
  )

  componentDidMount() {
    window.addEventListener('touchmove', this.handleTouchMove)
    window.addEventListener('touchend', this.handleMouseUp)
    window.addEventListener('mousemove', this.handleMouseMove)
    window.addEventListener('mouseup', this.handleMouseUp)
  }

  handleTouchStart = (key, pressLocation, e) => this.handleMouseDown(key, pressLocation, e.touches[0])
  handleTouchMove = e => e.preventDefault() || this.handleMouseMove(e.touches[0])
  handleMouseUp = () => this.emitter.emit('end', { topDeltaY: 0 })
  handleMouseDown = (pos, pressY, { pageY }) =>
    this.emitter.emit('start', {
      topDeltaY: pageY - pressY,
      mouseY: pressY,
      originalPosOfLastPressed: pos
    })
  handleMouseMove = ({ pageY }) => {
    this.emitter.emit('move', state => {
      const { topDeltaY, originalPosOfLastPressed } = state
      const mouseY = pageY - topDeltaY
      return { mouseY: mouseY, originalPosOfLastPressed }
    })
  }

  springs = range(itemsCount).map(() => SpringSubject({ scale: 1, shadow: 1 }, { scale: 1, shadow: 1 }))

  render() {
    return (
      <div className="demo8">
        {range(itemsCount).map(i => {
          return this.data$.pipe(
            switchMap(({ mouseY, originalPosOfLastPressed, order }) => {
              const active = originalPosOfLastPressed === i
              const y = active ? mouseY : order.indexOf(i) * 100
              const style = active ? { scale: 1.1, shadow: 16 } : { scale: 1, shadow: 1 }
              return this.springs[i - 1].next(style).pipe(
                map(({ scale, shadow }) => (
                  <div
                    onMouseDown={this.handleMouseDown.bind(null, i, y)}
                    onTouchStart={this.handleTouchStart.bind(null, i, y)}
                    className="demo8-item"
                    style={{
                      boxShadow: `rgba(0, 0, 0, 0.2) 0px ${shadow}px ${2 * shadow}px 0px`,
                      transform: `translate3d(0, ${y}px, 0) scale(${scale})`,
                      zIndex: i === originalPosOfLastPressed ? 99 : i
                    }}
                  >
                    {order.indexOf(i) + 1}
                  </div>
                ))
              )
            })
          )
        })}
      </div>
    )
  }
}

ReactDOM.render(<App />, document.getElementById('root'))
