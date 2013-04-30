test = require('./test')()
expect = require('chai').expect
{term, verb, factType, conceptType, termForm, referenceScheme, necessity, rule, conceptType, note, definition} = require('./sbvr-helper')

has = verb 'has'

person = term 'person'
educationalInstitution = term 'educational institution'
age = term 'age'
student = term 'student'

describe 'students', ->
	# T: person
	test person
	# T: educational institution
	test educationalInstitution
	#	Definition: "UniS" or "UWE"
	test definition 'unis', 'uwe'
	# T: age
	test 'T: age --Ignored comment', (result) ->
		expect(result).to.deep.equal age
	# F: person is enrolled in educational institution --Ignored comment
	test 'F: person is enrolled in educational institution --Ignored comment', (result) ->
		expect(result).to.deep.equal(factType person, verb('is enrolled in'), educationalInstitution)