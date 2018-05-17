import React from 'react'
import ReactDOM from 'react-dom'
import { reactive } from 'rxjs-react'
import { combineLatest } from 'rxjs'
import { map, tap } from 'rxjs/operators'
import { spring, springObject, springObjectAll, colorToRgba, listToRgba, toShape, toPercent, toDeg } from './shared/util'
import { normalizeColor } from './shared/normalize-css-color'

const TRIANGLE = [20, 380, 380, 380, 380, 380, 200, 20, 20, 380]
const RECTANGLE = [20, 20, 20, 380, 380, 380, 380, 20, 20, 20]

const styles = {
	container: {
		height: '100%',
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		willChange: 'background'
	},
	shape: { width: 300, height: 300, willChange: 'transform' }
}

const toBackground = ([start, stop, end]) =>
	`linear-gradient(to bottom, ${listToRgba(start)} ${toPercent(stop)}, ${listToRgba(end)} 100%)`
const toTransform = ([scale, rotation]) => `scale3d(${scale}, ${scale}, ${scale}) rotate(${toDeg(rotation)})`
const Content = reactive(({ toggle, style$ }) => {
	let background$ = combineLatest(style$.start, style$.stop, style$.end).pipe(map(toBackground))
	let transform$ = combineLatest(style$.scale, style$.rotation).pipe(map(toTransform))
	let containerStyle$ = { ...styles.container, background: background$ }
	let shapeStyle$ = { ...styles.shape, transform: transform$ }
	let fill$ = style$.color.pipe(map(listToRgba))
	let d$ = style$.shape.pipe(map(toShape))
	return (
		<div style={containerStyle$}>
			<svg style={shapeStyle$} version="1.1" viewBox="0 0 400 400">
				<g style={{ cursor: 'pointer' }} fill={fill$} fillRule="evenodd" onClick={toggle}>
					<path id="path-1" d={d$} />
				</g>
			</svg>
		</div>
	)
})

let style1 = {
	color: colorToRgba('#247BA0'),
	start: colorToRgba('#B2DBBF'),
	end: colorToRgba('#247BA0'),
	scale: 0.6,
	shape: TRIANGLE,
	stop: 0,
	rotation: 0
}

let style2 = {
	color: colorToRgba('#70C1B3'),
	start: colorToRgba('#B2DBBF'),
	end: colorToRgba('#F3FFBD'),
	scale: 1.5,
	shape: RECTANGLE,
	stop: 50,
	rotation: 45
}

class App extends React.Component {
	state = { toggle: true }
	toggle = () => this.setState(state => ({ toggle: !state.toggle }))
	render() {
		const style$ = this.state.toggle ? springObject(style1, style2) : springObject(style2, style1)
		return <Content style$={style$} toggle={this.toggle} />
	}
}

ReactDOM.render(<App />, document.getElementById('root'))
