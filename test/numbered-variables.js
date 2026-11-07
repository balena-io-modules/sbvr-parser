const test = require('./test')();
const { expect } = require('chai');

// Finds the variable numbers used for the given numbered term in some LF
const variableNumbers = (lf, termName, termNumber, numbers = []) => {
	if (Array.isArray(lf)) {
		if (
			lf[0] === 'Variable' &&
			lf[2][1] === termName &&
			lf[2][3] != null &&
			lf[2][3][1] === termNumber
		) {
			numbers.push(lf[1][1]);
		}
		lf.forEach((part) => variableNumbers(part, termName, termNumber, numbers));
	}
	return numbers;
};

describe('numbered terms quantified more than once', function () {
	test('Term: person');
	test('Fact type: person1 knows person2');
	// Each use of a numbered term should refer to the same variable, whether or not it is the first variable
	test('Rule: It is obligatory that each person1 knows a person2 that knows each person1.', (result) => {
		const numbers = variableNumbers(result, 'person', 1);
		expect(numbers).to.have.lengthOf(2);
		expect(numbers[1]).to.equal(numbers[0]);
	});
	test('Rule: It is obligatory that each person2 knows a person1 that knows each person1.', (result) => {
		const numbers = variableNumbers(result, 'person', 1);
		expect(numbers).to.have.lengthOf(2);
		expect(numbers[1]).to.equal(numbers[0]);
	});
});
