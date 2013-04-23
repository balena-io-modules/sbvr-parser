expect = require('chai').expect
test = require('./test')
{term, verb, factType, conceptType, referenceScheme, necessity} = require('./sbvr-helper')

name = term 'name'
pilot = term 'pilot'
plane = term 'plane'

# Term:      name
test name
# Term:      pilot
test pilot
# 	Reference Scheme: name
test referenceScheme name
# Term:      plane
test plane
# 	Reference Scheme: name
test referenceScheme name
# Fact Type: pilot has name
test factType pilot, verb('has'), name
# 	Necessity: each pilot has exactly one name
test necessity 'each', pilot, verb('has'), 'exactly', 'one', name
# Fact Type: plane has name
test factType plane, verb('has'), name
# 	Necessity: each plane has exactly one name
test necessity 'each', plane, verb('has'), 'exactly', 'one', name
# Fact type: pilot can fly plane
test factType pilot, verb('can fly'), plane
# Fact type: pilot is experienced
test factType pilot, verb('is experienced')
# Rule:       It is necessary that each pilot that is not experienced, can fly at most 2 planes
