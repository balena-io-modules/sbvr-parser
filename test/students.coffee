test = require('./test')()
expect = require('chai').expect
{term, verb, factType, conceptType, termForm, referenceScheme, necessity, rule, conceptType, note, definition, synonym} = require('./sbvr-helper')

has = verb 'has'

person = term 'person'
homoSapiens = term 'homo sapiens'
educationalInstitution = term 'educational institution'
age = term 'age'
student = term 'student'

describe 'students', ->
	# T: person
	test person
	# 	Synonym: homo sapiens
	test synonym homoSapiens
	# T: educational institution
	test educationalInstitution
	#	Definition: "UniS" or "UWE"
	test definition 'UniS', 'UWE'
	# T: age
	test 'T: age --Ignored comment', (result) ->
		expect(result).to.deep.equal age
	# F: person is enrolled in educational institution --Ignored comment
	test 'F: person is enrolled in educational institution --Ignored comment', (result) ->
		expect(result).to.deep.equal(factType person, verb('is enrolled in'), educationalInstitution)
	# Vocabulary: other
	test 'Vocabulary: other'
	# Term: other term
	test 'Term: other term', (result) ->
		expect(result).to.deep.equal term 'other term', 'other'
	# Concept Type: person (Default)
	test 'Concept Type: homo sapiens (Default)', (result) ->
		expect(result).to.deep.equal conceptType person