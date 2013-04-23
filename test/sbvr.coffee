expect = require('chai').expect
test = require('./test')
{term, verb, factType} = require('./sbvr-helper')

name = term 'name'
pilot = term 'pilot'
plane = term 'plane'
test name
test pilot
# test 'Concept Type', [name]
test plane
test factType pilot, verb('can fly'), plane
