import React from 'react'
import { ReplaySubject } from 'rxjs'
import { map, delay, concatMap, tap } from 'rxjs/operators'
import { SpringSubject } from '../spring'
import reactive from '../reactive'
import { shallowEqual } from '../shared'

@reactive
export default class Spring extends React.PureComponent {
  spring$ = new SpringSubject(this.props.from, null, this.props.options)
  next = () => {
    let { to, onAnimating, onAnimated } = this.props
    this.spring$.next(to).subscribe({
      next: onAnimating,
      complete: onAnimated
    })
  }
  componentDidMount() {
    this.next()
  }
  componentDidUpdate(prevProps) {
    if (!shallowEqual(prevProps.to, this.props.to)) {
      this.next()
    }
  }
  render() {
    return this.spring$.pipe(map(this.props.children))
  }
}
