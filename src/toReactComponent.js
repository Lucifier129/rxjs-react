import React from 'react'
import { Subject, combineLatest } from 'rxjs'
import { map, switchMap, startWith } from 'rxjs/operators'
import { getDisplayName } from './shared'

const toReactComponent = f => source => {
  const Component = class extends React.PureComponent {
    subject = new Subject()
    view = null
    view$ = combineLatest(this.subject |> startWith(this.props), source)
    |> map(([props, data]) => f({ ...data, ...props }))
    handleView = view => {
      this.view = view
      if (this.mounted) this.forceUpdate()
    }
    subscription = this.view$.subscribe(this.handleView)
    componentDidMount() {
      this.mounted = true
    }
    componentWillUnmount() {
      this.mounted = false
      this.subscription.unsubscribe()
    }
    componentDidUpdate(prevProps) {
      if (prevProps !== this.props) {
        this.subject.next(this.props)
      }
    }
    render() {
      return this.view
    }
  }
  Component.displayName = getDisplayName(f)
  return Component
}

export default toReactComponent
