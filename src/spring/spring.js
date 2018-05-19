import { Spring } from 'wobble'
import { Observable, ReplaySubject } from 'rxjs'
import { switchMap, tap, startWith } from 'rxjs/operators'
import handleValue from './handleValue'

export const spring = (fromValue = 0, toValue = 1, options) => {
  return Observable.create(observer => {
    let instance = new Spring({
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

export const dynamicSpring = (fromValue = 0, toValue = 1, options) => {
  let lastValue = fromValue
  let subject = new ReplaySubject(1)
  let updateLastValue = value => (lastValue = value)
  let handleSwitch = ({ value, observer }) => {
    return spring(lastValue, value, options).pipe(tap(updateLastValue), tap(observer))
  }
  let startValue = { value: toValue, observer: options && options.observer }
  let spring$ = subject.pipe(startWith(startValue), switchMap(handleSwitch))
  spring$.next = (value, observer) => subject.next({ value, observer })
  spring$.complete = () => subject.complete()
  return spring$
}
