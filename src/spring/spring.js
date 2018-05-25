import { Spring as WobbleSpring } from 'wobble'
import { Observable, ReplaySubject, empty } from 'rxjs'
import { switchMap, tap, startWith } from 'rxjs/operators'
import handleValue from './handleValue'
import { shallowEqual } from '../shared'

const spring = (fromValue, toValue, options) => {
	return Observable.create(observer => {
		if (fromValue != null && toValue == null) {
			observer.next(fromValue)
			observer.complete()
			return
		}

		if (fromValue == null && toValue != null) {
			observer.next(toValue)
			observer.complete()
			return
		}

		if (fromValue == null && toValue == null) {
			observer.next(null)
			observer.complete()
			return
		}

		if (shallowEqual(fromValue, toValue)) {
			observer.next(toValue)
			observer.complete()
			return
		}

		let updater = handleValue(fromValue, toValue)
		let instance = new WobbleSpring({
			...options,
			fromValue: 0,
			toValue: 1
		})
		instance.start()
		instance.onUpdate(data => {
			observer.next(updater(data.currentValue))
		})
		instance.onStop(() => {
			observer.complete()
		})
		return () => instance.stop()
	})
}

export function Spring(fromValue, toValue, options) {
	return spring(fromValue, toValue, options)
}

const springSubject = (fromValue, toValue, options) => {
	let lastValue = fromValue
	let subject = new ReplaySubject(1)
	let updateLastValue = value => (lastValue = value)
	let handleSwitch = ({ value, observer, nextOptions }) => {
		if (lastValue == null && value == null) return empty()
		return spring(lastValue, value, nextOptions || options).pipe(tap(updateLastValue), tap(observer))
	}
	let startValue = { value: toValue }
	let spring$ = subject.pipe(startWith(startValue), switchMap(handleSwitch))
	spring$.next = (value, nextOptions) => {
		let innerSubject = new ReplaySubject(1)
		subject.next({ value, nextOptions, observer: innerSubject })
		return innerSubject
	}
	spring$.complete = () => subject.complete()
	return spring$
}

export function SpringSubject(fromValue, toValue, options) {
	return springSubject(fromValue, toValue, options)
}
