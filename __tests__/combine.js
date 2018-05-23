import { combine } from '../src/shared'
import { interval, of, fromEvent } from 'rxjs'
import EventEmitter from 'events'

it('should support flat list', () => {
  let emitter = new EventEmitter()
  let a$ = fromEvent(emitter, 'a')
  let b$ = fromEvent(emitter, 'b')
  let list$ = combine([a$, b$])
  let expected = [[1, 2], [2, 2]]

  list$.subscribe(value => expect(value).toEqual(expected.shift()))

  emitter.emit('a', 1)
  expect(expected.length).toBe(2)
  emitter.emit('b', 2)
  expect(expected.length).toBe(1)
  emitter.emit('a', 1)
  expect(expected.length).toBe(0)
})

it('should support flat object', () => {
  let emitter = new EventEmitter()
  let a$ = fromEvent(emitter, 'a')
  let b$ = fromEvent(emitter, 'b')
  let list$ = combine({ a: a$, b: b$ })
  let expected = [{ a: 1, b: 2 }, { a: 2, b: 2 }]

  list$.subscribe(value => expect(value).toEqual(expected.shift()))

  emitter.emit('a', 1)
  expect(expected.length).toBe(2)
  emitter.emit('b', 2)
  expect(expected.length).toBe(1)
  emitter.emit('a', 1)
  expect(expected.length).toBe(0)
})

it('should support nest object', () => {
  let emitter = new EventEmitter()
  let a$ = fromEvent(emitter, 'a')
  let b$ = fromEvent(emitter, 'b')
  let c$ = fromEvent(emitter, 'c')
  let list$ = combine({
    a: [a$],
    nest: [
      b$,
      {
        c: c$
      }
    ]
  })
  let expected = [
    {
      a: [1],
      nest: [2, { c: 3 }]
    },
    {
      a: [1],
      nest: [2, { c: 4 }]
    }
  ]

  list$.subscribe(value => expect(value).toEqual(expected.shift()))

  emitter.emit('a', 1)
  expect(expected.length).toBe(2)
  emitter.emit('b', 2)
  expect(expected.length).toBe(2)
  emitter.emit('c', 3)
  expect(expected.length).toBe(1)
  emitter.emit('c', 4)
  expect(expected.length).toBe(0)
})
