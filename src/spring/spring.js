import { Spring } from 'wobble'
import { Observable, Subject, ReplaySubject } from 'rxjs'
import { map, publishReplay, refCount, switchMap, tap, startWith } from 'rxjs/operators'
import handleValue from './handleValue'

const defaultSpringOptions = {
  fromValue: 0,
  toValue: 1
}

export const spring = (fromValue, toValue, options) => {
  return Observable.create(observer => {
    let instance = new Spring({ ...defaultSpringOptions, ...options })
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
