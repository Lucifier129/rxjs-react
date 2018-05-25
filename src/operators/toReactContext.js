import React from 'react'
import toReactComponent from './toReactComponent';

const toReactContext = defaultValue => source => {
  let { Provider, Consumer } = React.createContext(defaultValue)
  let ReactiveProvider = source.pipe(toReactComponent((data, props) => {
    return <Provider value={data} {...props} />
  }))
  return {
    Provider: ReactiveProvider,
    Consumer
  }
}

export default toReactContext