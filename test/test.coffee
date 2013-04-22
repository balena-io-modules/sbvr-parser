_ = require('lodash')
_.mixin(
	capitalize: (string) ->
		string.charAt(0).toUpperCase() + string[1...].toLowerCase()
)

chai = require('chai')
expect = chai.expect
chai.use (chai, utils) ->
	assertionPrototype = chai.Assertion.prototype
	utils.addMethod assertionPrototype, 'term', (termName, vocabulary = 'Default') ->
		obj = utils.flag(@, 'object')
		expect(obj).to.deep.equal(['Term', termName, vocabulary, ['Attributes']])

require('ometa-js')
SBVRParser = require('../sbvr-parser.ometajs').SBVRParser.createInstance()

lfSoFar = [ 'Model',
	[ 'Vocabulary', 'Default', [ 'Attributes' ] ]
]
seSoFar = ''

runExpectation = (describe, input, expectation) ->
	type = input[0...input.indexOf(':')]
	text = input[input.indexOf(':') + 1...].trim()
	describe 'Parsing ' + input, ->
		try
			SBVRParser.reset()
			newLF = SBVRParser.matchAll(seSoFar + input, 'Process')
			if newLF.length == lfSoFar
				last = newLF[newLF.length - 1]
				attributes = last[last.length - 1]
				result = attributes[attributes.length - 1]
			else
				result = newLF[newLF.length - 1]
			lfSoFar = newLF
			seSoFar += input + '\n'
			switch type
				when 'Term'
					it 'should be a term "' + text + '"', ->
						expect(result).to.be.a.term(text)
			expectation?(result)
		catch e
			if expectation?
				expectation(e)
			else
				throw e

module.exports = runExpectation.bind(null, describe)
module.exports.skip = runExpectation.bind(null, describe.skip)
module.exports.only = runExpectation.bind(null, describe.only)