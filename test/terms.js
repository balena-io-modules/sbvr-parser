const typeVocab = require('fs').readFileSync(
	require.resolve('@balena/sbvr-types/Type.sbvr'),
);
const test = require('./test')(typeVocab);
const { expect } = require('chai');

const {
	term,
	termForm,
	verb,
	factType,
	necessity,
	referenceType,
	note,
} = require('./sbvr-helper');

const testTerm = term('term');
const termHistory = term('term history');
const termHistoryBeta = term('term history beta');
const testTermForm = term('term form');

describe('terms', function () {
	test(testTerm);
	test(termHistory);
	test(factType(termHistory, verb('references'), testTerm));
	test(referenceType('informative'));
	test(
		necessity(
			'each',
			termHistory,
			verb('references'),
			['at most', 1],
			testTerm,
		),
	);

	test(termHistoryBeta);
	test(factType(termHistoryBeta, verb('references'), testTerm));
	test(referenceType('strict'));
	test(
		necessity(
			'each',
			termHistoryBeta,
			verb('references'),
			['at most', 1],
			testTerm,
		),
	);

	test(referenceType('pogo'), (e) => {
		expect(e).to.be.an('error');
	});
});
