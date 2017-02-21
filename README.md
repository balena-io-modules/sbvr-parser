## sbvr-parser

An SBVR Structured Englished to SBVR Logical Formulation parser.

The SBVR documentation can be found here http://www.omg.org/spec/SBVR/

### Example usage

```js
const SBVRParser = require('./sbvr-parser.js').SBVRParser.createInstance()
const rule = 'Term: name'
const LF = SBVRParser.matchAll(rule, 'Process')

console.log(LF)
```
outputs:
```js
[ 'Model',
  [ 'Vocabulary', 'Default', [ 'Attributes' ] ],
  [ 'Term', 'name', 'Default', [ 'Attributes' ] ] ]
```

### Tests

Tests can be found under the `test/` folder, to run the whole suite use `npm test`
