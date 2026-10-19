const { expect } = require('chai');
const { SBVRParser } = require('../sbvr-parser');

describe('matchUntil', function () {
	const Grammar = SBVRParser._extend({
		UntilB() {
			return this._consumedBy(function () {
				return this._applyWithArgs('matchUntil', (x) => x === 'b');
			});
		},
		UntilError() {
			return this._applyWithArgs('matchUntil', () => {
				throw new TypeError('A bug in the predicate');
			});
		},
	});

	it('should stop when the predicate matches', function () {
		expect(Grammar.matchAll('aab', 'UntilB')).to.equal('aa');
	});

	it('should stop at the end of the input', function () {
		expect(Grammar.matchAll('aaa', 'UntilB')).to.equal('aaa');
	});

	it('should not hide errors other than match failures', function () {
		expect(() => Grammar.matchAll('aaa', 'UntilError')).to.throw(
			TypeError,
			'A bug in the predicate',
		);
	});
});
