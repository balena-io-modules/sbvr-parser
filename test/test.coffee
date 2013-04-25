_ = require('lodash')

expect = require('chai').expect
{toSE} = require('./sbvr-helper')

module.exports = ->
	require('ometa-js')
	SBVRParser = require('../sbvr-parser.ometajs').SBVRParser.createInstance()

	lfSoFar = [ 'Model',
		[ 'Vocabulary', 'Default', [ 'Attributes' ] ]
	]
	seSoFar = ''

	runExpectation = (describe, lf, expectation) ->
		if _.isArray(lf)
			text = toSE(lf)
			type = lf[0].replace(/([A-Z])/g, ' $1').trim()
			input = type + ': ' + text

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
			it input, ->
				expect(result).to.deep.equal(lf)
			expectation?(result)
		catch e
			if expectation?
				expectation(e)
			else
				it input, ->
					expect(e).to.be.null
				# throw e
	
	ret = runExpectation.bind(null, describe)
	ret.skip = runExpectation.bind(null, describe.skip)
	ret.only = runExpectation.bind(null, describe.only)
	return ret