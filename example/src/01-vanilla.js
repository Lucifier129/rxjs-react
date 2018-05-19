import { dynamicSpring } from 'rxjs-react/spring'
import { map, tap } from 'rxjs/operators'

const TRIANGLE = 'M20,380 L380,380 L380,380 L200,20 L20,380 Z'
const RECTANGLE = 'M20,20 L20,380 L380,380 L380,20 L20,20 Z'

const renderContent = ({ toggle, color, scale, shape, start, end, stop, rotation }) =>
  `<div
    class="container"
		style="${`background: linear-gradient(to bottom, ${start} ${stop}, ${end} 100%)`}"
	>
		<svg
     class="shape"
			style="${`transform:scale3d(${scale}, ${scale}, ${scale}) rotate(${rotation})`}"
			version="1.1"
			viewBox="0 0 400 400"
		>
			<g style="cursor:pointer" fill="${color}" fillRule="evenodd">
				<path d="${shape}" id="target" />
			</g>
		</svg>
	</div>`

const triangle = {
  color: '#247BA0',
  start: '#B2DBBF',
  end: '#247BA0',
  scale: 0.6,
  shape: TRIANGLE,
  stop: '0%',
  rotation: '0deg'
}

const rectangle = {
  color: '#70C1B3',
  start: '#B2DBBF',
  end: '#F3FFBD',
  scale: 1.5,
  shape: RECTANGLE,
  stop: '50%',
  rotation: '45deg'
}

const spring$ = dynamicSpring(triangle, rectangle)
const root = document.getElementById('root')

spring$.subscribe(style => {
  root.innerHTML = renderContent(style)
})

const toggle = () => {
  spring$.next(!status ? triangle : rectangle)
  status = !status
}

let status = false
document.addEventListener('mousedown', event => {
  if (event.target.id !== 'target') return
  toggle()
})
