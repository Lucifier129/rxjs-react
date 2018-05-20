import React from 'react'
import { map, delay } from 'rxjs/operators'
import { SpringSubject } from '../spring'
import reactive from '../reactive'

@reactive
export default class Spring extends React.PureComponent {
  subject = new SpringSubject(this.props.from, this.props.to, this.props.options)
  spring$ = this.props.delay ? this.subject.pipe(delay(this.props.delay)) : this.subject
  componentDidUpdate(prevProps) {
    if (prevProps.to !== this.props.to) {
      let { to, onAnimating, onAnimated } = this.props
      let handler = () => {
        this.subject.next(to).subscribe({
          next: onAnimating,
          complete: onAnimated
        })
      }
      if (this.props.delay) {
        setTimeout(handler, this.props.delay)
      } else {
        handler()
      }
    }
  }
  render() {
    return this.spring$.pipe(map(this.props.children))
  }
}
