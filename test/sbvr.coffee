expect = require('chai').expect
test = require('./test')
{term, verb, factType, conceptType} = require('./sbvr-helper')

name = term 'name'
pilot = term 'pilot'
plane = term 'plane'
test name
test pilot
test conceptType name
test plane
test factType pilot, verb('can fly'), plane
