import React from 'react'
import { interval, of, create, merge } from 'rxjs'
import { delay, map, switchMap, take, tap, publishReplay, refCount } from 'rxjs/operators'
import renderer from 'react-test-renderer'
import reactive from '../src/reactive'

it('should support sync reactive value', () => {
  let Count$ = reactive(of(1, 2, 3))
  let component = renderer.create(<Count$ />)
  let tree = component.toJSON()
  expect(tree).toBe('3')
})

it('should support async reactive value', done => {
  let count$ = interval(20).pipe(take(3))
  let Count$ = reactive(count$)
  let component = renderer.create(<Count$ />)
  let instance = component.getInstance()
  let expected = [0, 1, 2].map(String)
  instance.componentDidUpdate = () => {
    expect(component.toJSON()).toBe(expected.shift())
    if (!expected.length) done()
  }
})

it('should support sync reactive element', () => {
  let attr$ = of(1, 2, 3)
  let text$ = of(3, 4, 5)
  let Count$ = reactive(<div data-index={attr$}>content:{text$}</div>)
  let component = renderer.create(<Count$ />)
  let tree = component.toJSON()
  expect(tree.props['data-index']).toBe(3)
  expect(tree.children).toEqual(['content:', '5'])
})

it('should support async reactive element', () => {
  let time$ = interval(20).pipe(take(3), publishReplay(1), refCount())
  let attr$ = time$.pipe(map(value => value + 1))
  let text$ = time$.pipe(map(value => value + 2))
  let Count$ = reactive(<div data-index={attr$}>content:{text$}</div>)
  let component = renderer.create(<Count$ />)
  let expected = [[1, ['content:', '1']], [2, ['content:', '2']], [3, ['content:', '3']]]
  component.componentDidUpdate = () => {
    let tree = component.toJSON()
    let data = expected.shift()
    expect(tree.props['data-index']).toBe(data[0])
    expect(tree.children).toEqual(data[1])
    if (!expected.length) done()
  }
})

it('should support reactive type of react element', () => {
  let Type1 = () => 1
  let Type2 = () => 2
  let Type$ = merge(of(Type1).pipe(delay(20)), of(Type2).pipe(delay(40)))
  let error = console.error
  // React will check the type of react element, it can make jest throw error. so make it silent here
  console.error = () => {}
  let component = renderer.create(reactive(<Type$ />))
  console.error = error
  let expected = ['1', '2']
  component.componentDidUpdate = () => {
    expect(component.toJSON()).toBe(expected.shift())
    if (!expected.length) done()
  }
})
