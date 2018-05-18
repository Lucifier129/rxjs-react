import { Spring } from 'wobble'
import { Observable, Subject, ReplaySubject } from 'rxjs'
import { map, publishReplay, refCount, switchMap, tap, startWith } from 'rxjs/operators'
import createUpdater from './createUpdater'
import { isPlainObject } from '../shared'

const mapValue = (obj, f) =>
	Object.keys(obj).reduce((result, key) => {
		result[key] = f(obj[key], key)
		return result
	}, {})

const makeUpdater = (fromValue, toValue) => {
	if (isPlainObject(fromValue)) {
		let updaterObj = mapValue(fromValue, (value, key) => makeUpdater(value, toValue[key]))
		return ratio => mapValue(updaterObj, updater => updater(ratio))
	} else if (Array.isArray(fromValue)) {
		let updaterList = fromValue.map((oldValue, index) => makeUpdater(oldValue, toValue[index]))
		return ratio => updaterList.map(updater => updater(ratio))
	}
	return createUpdater(fromValue, toValue)
}

const defaultSpringOptions = {
	fromValue: 0,
	toValue: 1
}

export const spring = (fromValue, toValue, options) => {
	return Observable.create(observer => {
		let instance = new Spring({ ...defaultSpringOptions, ...options })
		let updater = makeUpdater(fromValue, toValue)
		instance.start()
		instance.onUpdate(data => {
			let value = updater(data.currentValue)
			observer.next(value)
		})
		instance.onStop(() => {
			observer.complete()
		})
		return () => instance.stop()
	})
}

export const dynamicSpring = (fromValue, toValue, options) => {
	let lastValue = fromValue
	let subject = new ReplaySubject(1)
	let updateLastValue = value => (lastValue = value)
	let handleSwitch = targetValue => {
		return spring(lastValue, targetValue).pipe(tap(updateLastValue))
	}
	let spring$ = subject.pipe(startWith(toValue), switchMap(handleSwitch))
	spring$.next = config => subject.next(config)
	spring$.complete = () => subject.complete()
	return spring$
}
