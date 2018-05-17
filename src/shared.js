import { combineLatest, of, isObservable } from 'rxjs'
import { map, tap } from 'rxjs/operators'

export const once = f => source => {
  let ignore = false
  return source.pipe(
    tap(value => {
      if (ignore) return
      ignore = true
      f(value)
    })
  )
}

export const isSource = obj => !!obj && isObservable(obj)
export const makeSource = obj => (isSource(obj) ? obj : of(obj))

export const isPlainObject = obj => {
  if (typeof obj !== 'object' || obj === null) return false

  let proto = obj
  while (Object.getPrototypeOf(proto) !== null) {
    proto = Object.getPrototypeOf(proto)
  }

  return Object.getPrototypeOf(obj) === proto
}

export const isReactComponent = obj =>
  !!(obj && obj.prototype && obj.prototype.isReactComponent)

export const getDisplayName = WrappedComponent => {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component'
}

const combineArray = array => {
  if (!array.length) return array
  let sourceList = Array(array.length)
  let hasSource = false
  for (let i = 0; i < array.length; i++) {
    let item = array[i]
    let source = combineIfNeeded(item)
    if (isSource(source)) {
      hasSource = true
      sourceList[i] = source
    } else {
      sourceList[i] = of(item)
    }
  }
  return hasSource ? combineLatest(sourceList) : array
}

const combineObject = obj => {
  let keys = Object.keys(obj)
  if (!keys.length) return obj
  let valueArray = keys.map(key => obj[key])
  let source = combineArray(valueArray)
  if (!isSource(source)) return obj
  let construct = (result, value, index) => {
    result[keys[index]] = value
    return result
  }
  let toShape = valueList => {
    return valueList.reduce(construct, {})
  }
  return source.pipe(map(toShape))
}

const combineIfNeeded = shape => {
  if (isSource(shape)) {
    return shape
  } else if (Array.isArray(shape)) {
    return combineArray(shape)
  } else if (isPlainObject(shape)) {
    return combineObject(shape)
  }
  return shape
}

export const combine = shape => {
  return makeSource(combineIfNeeded(shape))
}

export const unsubscribe = subscription => subscription.unsubscribe()
