_ = require('lodash')

expect = require('chai').expect
{toSE} = require('./sbvr-helper')
{LFOptimiser} = require('../lf-optimiser')

# Gets the type of the line (eg Term/Rule) and adds spaces if necessary (eg "SynonymousForm" to "Synonymous Form")
getLineType = (lf) -> lf[0].replace(/([A-Z])/g, ' $1').trim()

module.exports = (builtInVocab = false) ->
	SBVRParser = require('../sbvr-parser').SBVRParser.createInstance()
	SBVRParser.enableReusingMemoizations(SBVRParser._sideEffectingRules)
	
	if builtInVocab
		SBVRParser.AddBuiltInVocab(builtInVocab)

	seSoFar = ''
	lfSoFar = SBVRParser.matchAll(seSoFar, 'Process')

	runExpectation = (describe, input, expectation) ->
		if _.isArray(input)
			lf = input
			text = toSE(lf)
			type = getLineType(lf)
			input = type + ': ' + text
		else if _.isObject(input)
			{lf, se: text} = input
			type = getLineType(lf)
			input = type + ': ' + text

		it input, ->
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
				if lf
					expect(result).to.deep.equal(lf)
					expect(-> LFOptimiser.match(newLF, 'Process')).to.not.throw()
				expectation?(result)
			catch e
				if expectation?
					expectation(e)
				else
					throw e
	
	ret = runExpectation.bind(null, describe)
	ret.skip = runExpectation.bind(null, describe.skip)
	ret.only = runExpectation.bind(null, describe.only)
	return ret
