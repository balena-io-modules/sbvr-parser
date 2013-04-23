_ = require('lodash')

expect = require('chai').expect


module.exports = ->
	require('ometa-js')
	SBVRParser = require('../sbvr-parser.ometajs').SBVRParser.createInstance()

	lfSoFar = [ 'Model',
		[ 'Vocabulary', 'Default', [ 'Attributes' ] ]
	]
	seSoFar = ''

	runExpectation = (describe, lf, expectation) ->
		text =
			switch lf[0]
				when 'Term'
					lf[1]
				when 'FactType'
					_.map(lf[1...-1], (factTypePart) -> factTypePart[1]).join(' ')
				when 'ConceptType', 'ReferenceScheme'
					_.map(lf[1...], (factTypePart) -> factTypePart[1]).join(' ')
				when 'Necessity'
					lf[1][2][1].replace('It is necessary that ', '')
				when 'Rule'
					lf[2][1]
		type = lf[0].replace(/([A-Z])/g, ' $1').trim()
		input = type + ': ' + text

		describe input, ->
			try
				SBVRParser.reset()
				newLF = SBVRParser.matchAll(seSoFar + input, 'Process')
				if newLF.length == lfSoFar.length
					last = newLF[newLF.length - 1]
					attributes = last[last.length - 1]
					result = attributes[attributes.length - 1]
				else
					result = newLF[newLF.length - 1]
				lfSoFar = newLF
				seSoFar += input + '\n'
				it 'should be a ' + type + ' "' + text + '"', ->
					expect(result).to.deep.equal(lf)
				expectation?(result)
			catch e
				if expectation?
					expectation(e)
				else
					console.error(e)
					throw e
	
	ret = runExpectation.bind(null, describe)
	ret.skip = runExpectation.bind(null, describe.skip)
	ret.only = runExpectation.bind(null, describe.only)
	return ret