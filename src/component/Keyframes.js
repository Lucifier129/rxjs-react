import React from 'react'
import { ReplaySubject } from 'rxjs'
import { map, delay, concatMap, tap } from 'rxjs/operators'
import { SpringSubject } from '../spring'
import reactive from '../reactive'

@reactive
export default class Spring extends React.PureComponent {
  spring$ = new SpringSubject(this.props.from, this.props.to, this.props.options)
	componentDidUpdate(prevProps) {
		if (prevProps.to !== this.props.to) {
			let { to, onAnimating, onAnimated } = this.props
			this.spring$.next(to).subscribe({
				next: onAnimating,
				complete: onAnimated
			})
		}
	}
	render() {
		return this.spring$.pipe(map(this.props.children))
	}
}
