import React from 'react'
import { Subject, noop } from 'rxjs'
import { switchMap, publishReplay, refCount } from 'rxjs/operators'
import {
  combine,
  unsubscribe,
  isReactComponent,
  getDisplayName,
  isPlainObject,
  once
} from './shared'

const defaults = { debounce: 0, displayName: '', PureComponent: true }
const reactive = options => Component => {
  const settings = { ...defaults, ...options }
  const ReactComponent = makeReactComponent(Component, settings.PureComponent)
  class ReactiveComponent extends ReactComponent {
    $$agent = createReactiveAgent(this, super.render, settings)
    componentDidMount() {
      this.$$agent.setMounted(true)
      super.componentDidMount && super.componentDidMount()
    }
    componentWillUnmount() {
      this.$$agent.setMounted(false)
      super.componentWillUnmount && super.componentWillUnmount()
    }
    render() {
      return this.$$agent.render()
    }
  }
  const displayName = settings.displayName || getDisplayName(ReactComponent)
  ReactiveComponent.displayName = `Reactive(${displayName})`
  return ReactiveComponent
}

const createReactiveAgent = (instance, superRender, settings) => {
  let view = null
  let timer = null
  let mounted = false
  let isRefresh = false
  let subscriptions = []
  let subject = new Subject()
  let clearSubscriptions = () => {
    while (subscriptions.length > 1) {
      subscriptions.shift().unsubscribe()
    }
  }
  let toView = vdom => {
    const view$ = combine(vdom).pipe(publishReplay(1), refCount())
    /**
     * switchMap will unsub the stream which break the refCount in combine(vdom)
     * maintain a sub of noop to keep it
     * and unsub the sub in next update frame
     */
    subscriptions.push(view$.subscribe(noop))
    return view$.pipe(once(clearSubscriptions))
  }
  let view$ = subject.pipe(switchMap(toView))
  let handleView = nextView => {
    view = nextView
    if (mounted) {
      clearTimeout(timer)
      timer = setTimeout(refresh, settings.debounce)
    }
  }
  let subscription = view$.subscribe(handleView)
  let refresh = () => {
    if (!mounted) return
    isRefresh = true
    instance.forceUpdate()
    isRefresh = false
  }
  let setMounted = status => (mounted = status)
  let handleUnmount = () => {
    mounted = false
    subscription.unsubscribe()
    subscriptions.forEach(unsubscribe)
  }

  let render = () => {
    if (!mounted || !isRefresh) subject.next(superRender.call(instance))
    return view
  }

  return {
    render,
    setMounted,
    handleUnmount
  }
}

const makeReactComponent = (Component, PureComponent) => {
  if (isReactComponent(Component)) return Component
  const factory = Component
  const SuperComponent = PureComponent ? React.PureComponent : React.Component
  class FactoryComponent extends SuperComponent {
    render() {
      return factory(this.props)
    }
  }
  FactoryComponent.displayName = getDisplayName(Component)
  return FactoryComponent
}

export default function(param) {
  if (param === undefined || isPlainObject(param)) return reactive(param)
  return reactive()(param)
}
