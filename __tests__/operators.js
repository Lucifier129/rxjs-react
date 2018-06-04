import React from "react"
import { interval, of, throwError } from "rxjs"
import { take, publishReplay, refCount } from "rxjs/operators"
import renderer from "react-test-renderer"
import {
  toPromise,
  toReactComponent,
  toReactiveComponent,
  toReactContext
} from "../src/operators"

it("should make observable become promise", async () => {
  let observable = of(1, 2, 3)
  let values = await observable.pipe(toPromise)
  let expected = [1, 2, 3]
  expect(values).toEqual(expected)
})

it("should support rejectable promise", async () => {
  let observable = throwError("test throw error")
  try {
    await observable.pipe(toPromise)
  } catch (error) {
    expect(error).toBe("test throw error")
  }
})

it("should make observable become react component", () => {
  let observable = of(1, 2, 3)
  let Component = observable.pipe(
    toReactComponent((data, props) => {
      return <div className={props.className}>{data}</div>
    })
  )
  let component = renderer.create(<Component className="test-class-name" />)
  let expected = {
    type: "div",
    props: { className: "test-class-name" },
    children: ["3"]
  }
  expect(component.toJSON()).toEqual(expected)
})

it("should support async observable to react component", done => {
  let observable = interval(20).pipe(take(3), publishReplay(1), refCount())
  let Component = observable.pipe(
    toReactComponent((data, props) => {
      return <div className={props.className}>{data}</div>
    })
  )
  let component = renderer.create(<Component className="test-class-name" />)
  let expected = [
    {
      type: "div",
      props: { className: "test-class-name" },
      children: ["0"]
    },
    {
      type: "div",
      props: { className: "test-class-name" },
      children: ["1"]
    },
    {
      type: "div",
      props: { className: "test-class-name" },
      children: ["2"]
    }
  ]
  observable.subscribe(() => {
    expect(component.toJSON()).toEqual(expected.shift())
    if (!expected.length) done()
  })
})

it("should make observable become reactive component", () => {
  let observable = of(1, 2, 3)
  let count$ = of(4, 5, 6)
  let Component = observable.pipe(
    toReactiveComponent((data, props) => {
      return (
        <div className={props.className}>
          {data}
          {count$}
        </div>
      )
    })
  )
  let component = renderer.create(<Component className="test-class-name" />)
  let expected = {
    type: "div",
    props: { className: "test-class-name" },
    children: ["3", "6"]
  }
  expect(component.toJSON()).toEqual(expected)
})

it("should support async observable to reactive component", done => {
  let observable = interval(20).pipe(take(3), publishReplay(1), refCount())
  let count$ = of(4, 5, 6)
  let Component = observable.pipe(
    toReactiveComponent((data, props) => {
      return (
        <div className={props.className}>
          {data}
          {count$}
        </div>
      )
    })
  )
  let component = renderer.create(<Component className="test-class-name" />)
  let instance = component.getInstance()
  let expected = [
    {
      type: "div",
      props: { className: "test-class-name" },
      children: ["0", "6"]
    },
    {
      type: "div",
      props: { className: "test-class-name" },
      children: ["1", "6"]
    },
    {
      type: "div",
      props: { className: "test-class-name" },
      children: ["2", "6"]
    }
  ]
  instance.componentDidUpdate = () => {
    expect(component.toJSON()).toEqual(expected.shift())
    if (!expected.length) done()
  }
})

it("should make observable become react context", () => {
  let observable = of(1, 2, 3)
  let { Provider, Consumer } = observable.pipe(toReactContext)
  let Component = props => {
    return (
      <Consumer>
        {value => <div className={props.className}>{value}</div>}
      </Consumer>
    )
  }
  let component = renderer.create(
    <Provider>
      <Component className="test-class-name" />
    </Provider>
  )
  let expected = {
    type: "div",
    props: { className: "test-class-name" },
    children: ["3"]
  }
  expect(component.toJSON()).toEqual(expected)
})

it("should support async observable become react context", done => {
  let observable = interval(20).pipe(take(3), publishReplay(1), refCount())
  let { Provider, Consumer } = observable.pipe(toReactContext)
  let Component = props => {
    return (
      <Consumer>
        {value => <div className={props.className}>{value}</div>}
      </Consumer>
    )
  }
  let component = renderer.create(
    <Provider>
      <Component className="test-class-name" />
    </Provider>
  )
  let expected = [
    {
      type: "div",
      props: { className: "test-class-name" },
      children: ["0"]
    },
    {
      type: "div",
      props: { className: "test-class-name" },
      children: ["1"]
    },
    {
      type: "div",
      props: { className: "test-class-name" },
      children: ["2"]
    }
  ]
  observable.subscribe(() => {
    expect(component.toJSON()).toEqual(expected.shift())
    if (!expected.length) done()
  })
})
