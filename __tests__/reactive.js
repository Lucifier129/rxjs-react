import React from 'react'
import { interval, of, create, merge } from 'rxjs'
import { delay, map, switchMap, take, tap, publishReplay, refCount } from 'rxjs/operators'
import renderer from 'react-test-renderer'
import reactive from '../src/reactive'

it('should support sync reactive value', () => {
	let value$ = reactive(of(1, 2, 3))
	let component = renderer.create(value$)
	let tree = component.toJSON()
	expect(tree).toBe('3')
})

it('should support async reactive value', done => {
	let value$ = reactive(interval(20).pipe(take(3)))
	let component = renderer.create(value$)
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
	let elem$ = reactive(<div data-index={attr$}>content:{text$}</div>)
	let component = renderer.create(elem$)
	let tree = component.toJSON()
	expect(tree.props['data-index']).toBe(3)
	expect(tree.children).toEqual(['content:', '5'])
})

it('should support async reactive element', done => {
	let time$ = interval(20).pipe(take(3), publishReplay(1), refCount())
	let attr$ = time$.pipe(map(value => value + 1))
	let text$ = time$.pipe(map(value => value + 2))
	let elem$ = reactive(<div data-index={attr$}>content:{text$}</div>)
	let component = renderer.create(elem$)
	let instance = component.getInstance()
	let expected = [[1, ['content:', '2']], [2, ['content:', '3']], [3, ['content:', '4']]]
	instance.componentDidUpdate = () => {
		let tree = component.toJSON()
		let data = expected.shift()
		expect(tree.props['data-index']).toBe(data[0])
		expect(tree.children).toEqual(data[1])
		if (!expected.length) done()
	}
})

it('should support reactive type of react element', done => {
	let Type1 = () => 1
	let Type2 = () => 2
	let Type$ = merge(of(Type1).pipe(delay(20)), of(Type2).pipe(delay(60)))
	// React will check the type of react element, it can make jest throw error. so make it silent here
	let error = console.error
	console.error = () => {}
	let elem$ = reactive(<Type$ />)
	console.error = error
	let component = renderer.create(elem$)
	let expected = ['1', '2']
	let instance = component.getInstance()
	instance.componentDidUpdate = () => {
		expect(component.toJSON()).toBe(expected.shift())
		if (!expected.length) done()
	}
})

it('should support sync reactive stateless component', () => {
	let Stateless$ = reactive(({ className }) => <div className={className}>{of(1, 2, 3)}</div>)
	let component = renderer.create(<Stateless$ className="test-class-name" />)
	let expected = {
		type: 'div',
		props: { className: 'test-class-name' },
		children: ['3']
	}
	expect(component.toJSON()).toEqual(expected)
})

it('should support async reactive stateless component', done => {
	let Stateless$ = reactive(({ className }) => <div className={of(className).pipe(delay(10))}>{of(1, 2, 3)}</div>)
	let component = renderer.create(<Stateless$ className="test-class-name" />)
	let instance = component.getInstance()
	let expected = {
		type: 'div',
		props: { className: 'test-class-name' },
		children: ['3']
	}
	instance.componentDidUpdate = () => {
		expect(component.toJSON()).toEqual(expected)
		done()
	}
})

it('should support sync reactive react component', () => {
	@reactive
	class Test$ extends React.PureComponent {
		render() {
			return <div className={this.props.className}>{of(this.props.children + '456')}</div>
		}
	}
	let component = renderer.create(<Test$ className="test-class-name">123</Test$>)
	let expected = {
		type: 'div',
		props: { className: 'test-class-name' },
		children: ['123456']
	}
	expect(component.toJSON()).toEqual(expected)
})

it('should support async reactive react component', done => {
	let expected = [
		{
			type: 'div',
			props: { className: 'test-class-name' },
			children: ['123', '0']
		},
		{
			type: 'div',
			props: { className: 'test-class-name' },
			children: ['123', '1']
		},
		{
			type: 'div',
			props: { className: 'test-class-name' },
			children: ['123', '2']
		}
	]

	@reactive
	class Test$ extends React.PureComponent {
		componentDidUpdate() {
			expect(component.toJSON()).toEqual(expected.shift())
			if (!expected.length) done()
		}
		render() {
			return (
				<div className={this.props.className}>
					{this.props.children}
					{interval(20).pipe(take(3))}
				</div>
			)
		}
	}
	let component = renderer.create(<Test$ className="test-class-name">123</Test$>)
})
