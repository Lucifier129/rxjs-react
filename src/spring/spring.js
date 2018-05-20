import { Spring as WobbleSpring } from 'wobble'
import { Observable, ReplaySubject } from 'rxjs'
import { switchMap, tap, startWith } from 'rxjs/operators'
import handleValue from './handleValue'

const spring = (fromValue, toValue, options) => {
  return Observable.create(observer => {
    let instance = new WobbleSpring({
      ...options,
      fromValue: 0,
      toValue: 1
    })
    let updater = handleValue(fromValue, toValue)
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
  let handleSwitch = ({ value, observer }) => {
    return spring(lastValue, value, options).pipe(tap(updateLastValue), tap(observer))
  }
  let startValue = { value: toValue, observer: options && options.observer }
  let spring$ = subject.pipe(startWith(startValue), switchMap(handleSwitch))
  spring$.next = value => {
    let innerSubject = new ReplaySubject(1)
    subject.next({ value, observer: innerSubject })
    return innerSubject
  }
  spring$.complete = () => subject.complete()
  return spring$
}

export function SpringSubject(fromValue, toValue, options) {
  return springSubject(fromValue, toValue, options)
}
