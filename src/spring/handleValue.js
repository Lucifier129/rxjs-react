// Taken from https://github.com/drcmda/react-spring/blob/master/src/animated/targets/Interpolation.js
import { normalizeColor, colorNames } from './normalize-css-color'
import { mapValue, isPlainObject } from '../shared'

function colorToRgba(input) {
  var int32Color = normalizeColor(input)
  if (int32Color === null) return input
  int32Color = int32Color || 0 // $FlowIssue
  const r = (int32Color & 0xff000000) >>> 24
  const g = (int32Color & 0x00ff0000) >>> 16
  const b = (int32Color & 0x0000ff00) >>> 8
  const a = (int32Color & 0x000000ff) / 255
  return `rgba(${r}, ${g}, ${b}, ${a})`
}

// Problem: https://github.com/animatedjs/animated/pull/102
// Solution: https://stackoverflow.com/questions/638565/parsing-scientific-notation-sensibly/658662
const stringShapeRegex = /[+\-]?(?:0|[1-9]\d*)(?:\.\d*)?(?:[eE][+\-]?\d+)?/g

// Covers rgb, rgba, hsl, hsla
// Taken from https://gist.github.com/olmokramer/82ccce673f86db7cda5e
const colorRegex = /(#[\d\w]+|\w+\((?:\d+%?(?:,\s)*){3}(?:\d*\.?\d+)?\))/
// Covers color names (transparent, blue, etc.)
const colorNamesRegex = new RegExp(`(${Object.keys(colorNames).join('|')})`, 'g')

const convertColor = str => (str + '').replace(colorRegex, colorToRgba).replace(colorNamesRegex, colorToRgba)

// rgba requires that the r,g,b are integers.... so we want to round them, but we *dont* want to
// round the opacity (4th column).
const rgbaRegex = /rgba\(([0-9\.-]+), ([0-9\.-]+), ([0-9\.-]+), ([0-9\.-]+)\)/gi
const rgbaReplacement = (_, p1, p2, p3, p4) => `rgba(${Math.round(p1)}, ${Math.round(p2)}, ${Math.round(p3)}, ${p4})`

const empty = []
const constant = value => () => value

const handleValue = (fromValue, toValue) => {
  if (fromValue != null && toValue == null) {
    return constant(fromValue)
  }
  if (fromValue == null && toValue != null) {
    return constant(toValue)
  }

  let fromType = typeof fromValue
  let toType = typeof toValue
  if (fromType === 'number' && toType === 'number') {
    return handleNumberValue(fromValue, toValue)
  } else if (fromType === 'string' && toType === 'string') {
    return handleStringValue(fromValue, toValue)
  } else if (isPlainObject(fromValue) && isPlainObject(toValue)) {
    return handleObjectValue(fromValue, toValue)
  } else if (Array.isArray(fromValue) && Array.isArray(toValue)) {
    return handleArrayValue(fromValue, toValue)
  }

  throw new Error(`unsupported type or not the same type. fromValue: ${fromValue}, toValue: ${toValue}`)
}

const handleNumberValue = (fromValue, toValue) => {
  let diffValue = toValue - fromValue
  return ratio => fromValue + diffValue * ratio
}

const handleStringValue = (fromValue, toValue) => {
  fromValue = convertColor(fromValue)
  toValue = convertColor(toValue)
  let fromArray = fromValue.match(stringShapeRegex) || empty
  let toArray = toValue.match(stringShapeRegex) || empty
  let diffArray = fromArray.map((fromValue, index) => {
    fromValue = fromArray[index] = Number(fromValue)
    return Number(toArray[index]) - fromValue
  })
  return ratio => {
    let index = 0
    let replacement = () => fromArray[index] + diffArray[index++] * ratio
    return fromValue.replace(stringShapeRegex, replacement).replace(rgbaRegex, rgbaReplacement)
  }
}

const handleArrayValue = (fromArray, toArray) => {
  let handlerList = toArray.map((toValue, index) => handleValue(fromArray[index], toValue))
  // add items which are not in toArray
  handlerList = handlerList.concat(fromArray.slice(handlerList.length).map(constant))
  return ratio => handlerList.map(handler => handler(ratio))
}

const handleObjectValue = (fromObject, toObject) => {
  let handlerObject = mapValue(toObject, (toValue, key) => handleValue(fromObject[key], toValue))
  // add keys which are not in toObject
  for (let key in fromObject) {
    if (!handlerObject.hasOwnProperty(key)) {
      handlerObject[key] = constant(fromObject[key])
    }
  }
  return ratio => mapValue(handlerObject, handler => handler(ratio))
}

export default handleValue
