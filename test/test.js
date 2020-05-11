const _ = require('lodash');

const { expect } = require('chai');
const { toSE, getLineType } = require('./sbvr-helper');
const { LFOptimiser } = require('../lf-optimiser');

module.exports = function (builtInVocab) {
	if (builtInVocab == null) {
		builtInVocab = false;
	}
	const SBVRParser = require('../sbvr-parser').SBVRParser.createInstance();
	SBVRParser.enableReusingMemoizations(SBVRParser._sideEffectingRules);

	if (builtInVocab) {
		SBVRParser.AddBuiltInVocab(builtInVocab);
	}

	let seSoFar = '';
	let lfSoFar = SBVRParser.matchAll(seSoFar, 'Process');
	let currentVocab = 'Default';

	const runExpectation = function (describe, input, expectation) {
		let lf;
		let text;
		let type;
		if (_.isArray(input)) {
			lf = input;
			text = toSE(lf, currentVocab);
			type = getLineType(lf);
			input = type + ': ' + text;
		} else if (_.isObject(input)) {
			({ lf, se: text } = input);
			type = getLineType(lf);
			input = type + ': ' + text;
		}

		if (type === 'Vocabulary') {
			currentVocab = lf[1];
		}

		it(input, function () {
			let result;
			try {
				SBVRParser.reset();
				const newLF = SBVRParser.matchAll(seSoFar + input, 'Process');
				if (newLF.length === lfSoFar.length) {
					const last = newLF[newLF.length - 1];
					const attributes = last[last.length - 1];
					result = attributes[attributes.length - 1];
				} else {
					result = newLF[newLF.length - 1];
				}
				lfSoFar = newLF;
				seSoFar += input + '\n';
				if (lf) {
					expect(result).to.deep.equal(lf);
					expect(() => LFOptimiser.match(newLF, 'Process')).to.not.throw();
				}
			} catch (e) {
				if (expectation != null) {
					return expectation(e);
				} else {
					throw e;
				}
			}

			if (typeof expectation === 'function') {
				expectation(result);
			}
		});
	};

	const ret = runExpectation.bind(null, describe);
	ret.skip = runExpectation.bind(null, describe.skip);
	ret.only = runExpectation.bind(null, describe.only);
	return ret;
};
