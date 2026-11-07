const test = require('./test')();
const { expect } = require('chai');

// Finds the minimum cardinality of the (first) at least N quantification in some LF
const minimumCardinality = (lf) => {
	if (!Array.isArray(lf)) {
		return;
	}
	if (lf[0] === 'AtLeastNQuantification') {
		return lf[1];
	}
	for (const part of lf) {
		const cardinality = minimumCardinality(part);
		if (cardinality != null) {
			return cardinality;
		}
	}
};

describe('more than quantification', function () {
	test('Term: person');
	test('Term: car');
	test('Fact type: person drives car');
	test('Rule: It is obligatory that each person drives more than 2 car.', (result) => {
		expect(minimumCardinality(result)).to.deep.equal([
			'MinimumCardinality',
			['Number', 3],
		]);
	});
	test('Rule: It is obligatory that each person drives at least 3 car.', (result) => {
		expect(minimumCardinality(result)).to.deep.equal([
			'MinimumCardinality',
			['Number', 3],
		]);
	});
});
