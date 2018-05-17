// Taken from https://github.com/drcmda/react-spring/blob/master/src/animated/targets/Interpolation.js
import { normalizeColor, colorNames } from './normalize-css-color'

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
const colorNamesRegex = new RegExp(
  `(${Object.keys(colorNames).join('|')})`,
  'g'
)

const convertColor = str =>
  (str + '')
    .replace(colorRegex, colorToRgba)
    .replace(colorNamesRegex, colorToRgba)

// rgba requires that the r,g,b are integers.... so we want to round them, but we *dont* want to
// round the opacity (4th column).
const rgbaRegex = /rgba\(([0-9\.-]+), ([0-9\.-]+), ([0-9\.-]+), ([0-9\.-]+)\)/gi
const rgbaReplacement = (_, p1, p2, p3, p4) =>
  `rgba(${Math.round(p1)}, ${Math.round(p2)}, ${Math.round(p3)}, ${p4})`

const identity = x => x
const toNumberList = list => (list ? list.map(Number) : empty)
const empty = []

const createUpdater = (inputStr, outputStr) => {
  inputStr = convertColor(inputStr)
  outputStr = convertColor(outputStr)
  let inputList = toNumberList(inputStr.match(stringShapeRegex))
  let outputList = toNumberList(outputStr.match(stringShapeRegex))
  let diffList = outputList.map((output, index) => {
    let input = inputList[index]
    return output - input
  })
  return ratio => {
    let i = 0
    return inputStr
      .replace(stringShapeRegex, () => inputList[i] + diffList[i++] * ratio)
      .replace(rgbaRegex, rgbaReplacement)
  }
}

export default createUpdater
