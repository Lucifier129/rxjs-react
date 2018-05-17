import { Spring } from 'wobble'
import { Observable } from 'rxjs'
import { map, publishReplay, refCount } from 'rxjs/operators'
import createUpdater from './createUpdater'

const mapValue = (obj, f) =>
  Object.keys(obj).reduce((result, key) => {
    result[key] = f(obj[key], key)
    return result
  }, {})

const springOptions = {
  fromValue: 1,
  toValue: 0,
  overshootClamping: true,
  damping: 10,
  mass: 2
}

export const createSpring = options => {
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

export const springObject = (fromObj, toObj, options) => {
  let spring$ = createSpring({ fromValue: 0, toValue: 1, ...options }).pipe(
    publishReplay(1),
    refCount()
  )
  return mapValue(toObj, (newValue, key) => {
    return spring$.pipe(map(createUpdater(fromObj[key], newValue)))
  })
}

export const springValue = (fromObj, toObj, options) => {
  let spring$ = createSpring({ fromValue: 0, toValue: 1, ...options })
  let updaterObj = mapValue(fromObj, (value, key) =>
    createUpdater(value, toObj[key])
  )
  let convert = ratio => {
    return mapValue(updaterObj, updater => updater(ratio))
  }
  return spring$.pipe(map(convert))
}
