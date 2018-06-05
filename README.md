[![Build Status](https://travis-ci.org/Lucifier129/rxjs-react.svg?branch=master)](https://travis-ci.org/Lucifier129/rxjs-react)
[![npm version](https://badge.fury.io/js/rxjs-react.svg)](https://badge.fury.io/js/rxjs-react)

    npm install rxjs-react

```javascript
// ES2015
import { reactive } from 'rxjs-react'

// Commonjs
const { reactive } = require('rxjs-react')
```

# Table of Contents 👇

* [Motivation](#motivation)
* [Usage](#usage)
* [API Doc](#api-doc)

# Motivation

`React Suspense` is a great new features in `react`, it supports writing async code in `render function` without `async/await` syntax, and making `data-fetching`, `loading` and `code-spiliting` become easier and simpler. What if we go further?

Put observable(`rxjs`) in `render function`?

[click to see reactive demo](https://codesandbox.io/s/9o6ym1jrr4)
```javascript
import React from 'react';
import { render } from 'react-dom';
import { reactive } from 'rxjs-react'
import { from, of } from 'rxjs'
import { delay, scan, concatMap } from 'rxjs/operators'

const hello$ = from('hello rxjs-react!').pipe(
  concatMap(char => of(char).pipe(delay(300))),
  scan((str, char) => str + char, '')
)

const App = reactive(() => (
  <div>
    <h1>{hello$}</h1>
  </div>
));

render(<App />, document.getElementById('root'));
```