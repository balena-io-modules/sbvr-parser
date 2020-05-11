const test = require('./test')();
const { expect } = require('chai');
const {
	term,
	verb,
	factType,
	conceptType,
	definitionEnum,
	synonym,
} = require('./sbvr-helper');

const person = term('person');
const homoSapiens = term('homo sapiens');
const educationalInstitution = term('educational institution');
const age = term('age');

describe('students', function () {
	// T: person
	test(person);
	// 	Synonym: homo sapiens
	test(synonym(homoSapiens));
	// T: educational institution
	test(educationalInstitution);
	//	Definition: "UniS" or "UWE"
	test(definitionEnum('UniS', 'UWE'));
	// T: age
	test('T: age --Ignored comment', (result) =>
		expect(result).to.deep.equal(age));
	// F: person is enrolled in educational institution --Ignored comment
	test('F: person is enrolled in educational institution --Ignored comment', (result) =>
		expect(result).to.deep.equal(
			factType(person, verb('is enrolled in'), educationalInstitution),
		));
	// Vocabulary: other
	test('Vocabulary: other');
	// Term: other term
	test('Term: other term', (result) =>
		expect(result).to.deep.equal(term('other term', 'other')));
	// Concept Type: person (Default)
	test('Concept Type: homo sapiens (Default)', (result) =>
		expect(result).to.deep.equal(conceptType(person)));
});
