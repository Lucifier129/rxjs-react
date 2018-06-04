import React from "react"
import toReactComponent from "./toReactComponent"

const toReactContext = source => {
  let { Provider, Consumer } = React.createContext()
  let ReactiveProvider = source.pipe(
    toReactComponent((data, props) => {
      return <Provider value={data} {...props} />
    })
  )
  return {
    Provider: ReactiveProvider,
    Consumer
  }
}

export default toReactContext
