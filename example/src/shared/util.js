import { Spring } from 'wobble'
import { Observable } from 'rxjs'
import { map, publishReplay, refCount } from 'rxjs/operators'
import { normalizeColor } from './normalize-css-color'

const springOptions = {
	fromValue: 1,
	toValue: 0,
	overshootClamping: true,
	damping: 10,
	mass: 2
}

export const spring = options => {
	return Observable.create(observer => {
		let instance = new Spring({ ...springOptions, ...options })
		instance.start()
		instance.onUpdate(data => {
			observer.next(data.currentValue)
		})
		instance.onStop(() => {
			observer.complete()
		})
		return () => instance.stop()
	})
}

export const mapValue = (obj, f) =>
	Object.keys(obj).reduce((result, key) => {
		result[key] = f(obj[key], key)
		return result
	}, {})

export const springObject = (fromObj, toObj, options) => {
	let spring$ = spring({ fromValue: 0, toValue: 1, ...options }).pipe(
		map(value => Math.abs(value < 1 ? value : 2 - value)),
		publishReplay(1),
		refCount()
	)
	let getValue = (newValue, oldValue) => ratio => {
		let isArray = Array.isArray(oldValue)
		if (!isArray) {
			oldValue = [oldValue]
			newValue = [newValue]
		}
		let list = newValue.map((value, index) => {
			let diff = value - oldValue[index]
			return oldValue[index] + diff * ratio
		})
		return isArray ? list : list[0]
	}
	return mapValue(toObj, (newValue, key) => {
		return spring$.pipe(map(getValue(newValue, fromObj[key])))
	})
}

export const springObjectAll = (fromObj, toObj, options) => {
	let spring$ = spring({ fromValue: 0, toValue: 1, ...options }).pipe(
		map(value => Math.abs(value < 1 ? value : 2 - value))
	)
	let getValue = ratio => (newValue, key) => {
		let oldValue = fromObj[key]
		let isArray = Array.isArray(oldValue)
		if (!isArray) {
			oldValue = [oldValue]
			newValue = [newValue]
		}
		let list = newValue.map((value, index) => {
			let diff = value - oldValue[index]
			return oldValue[index] + diff * ratio
		})
		return isArray ? list : list[0]
	}
	let convert = ratio => {
		return mapValue(toObj, getValue(ratio))
	}
	return spring$.pipe(map(convert))
}

export const colorToRgba = input => {
	var int32Color = typeof input !== 'number' ? normalizeColor(input) : input
	if (int32Color === null) return input
	int32Color = int32Color || 0 // $FlowIssue
	var r = (int32Color & 0xff000000) >>> 24
	var g = (int32Color & 0x00ff0000) >>> 16
	var b = (int32Color & 0x0000ff00) >>> 8
	var a = (int32Color & 0x000000ff) / 255
	return [r, g, b, a]
}

export const listToRgba = ([r, g, b, a]) => `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${a})`

export const toShape = ([v1, v2, v3, v4, v5, v6, v7, v8, v9, v10]) =>
	`M${v1},${v2} L${v3},${v4} L${v5},${v6} L${v7},${v8} L${v9},${v10} Z`

export const toDeg = x => `${x}deg`

export const toPercent = x => `${x}%`
