const typeVocab = require('fs').readFileSync(
	require.resolve('@balena/sbvr-types/Type.sbvr'),
);
const test = require('./test')(typeVocab);
const { expect } = require('chai');

const {
	term,
	numberedTerms,
	verb,
	factType,
	termForm,
	conceptType,
	referenceScheme,
	synonymousForm,
	necessity,
	rule,
	customRule,
	definition,
	_or,
	_and,
	_nestedOr,
	_nestedAnd,
} = require('./sbvr-helper');

const shortTextType = term('Short Text', 'Type');
const integerType = term('Integer', 'Type');
const lengthType = term('Length', 'Type');

const name = term('name');
const yearsOfExperience = term('years of experience');
const person = term('person');
const pilot = term('pilot');
const veteranPilot = term('veteran pilot');
const plane = term('plane');
const testTerm = term('test term');
const testTermForm = term('test term form');

const persons = numberedTerms(person, 2);
const pilots = numberedTerms(pilot, 2);
const planes = numberedTerms(plane, 2);

describe('pilots', function () {
	// Term:      name
	test(name);
	// 	Concept Type: Short Text (Type)
	test(conceptType(shortTextType));
	// Term:      years of experience
	test(yearsOfExperience);
	// 	Concept Type: Integer (Type)
	test(conceptType(integerType));
	// Term:      test
	test(testTerm);
	// Term:      person
	test(person);
	// Term:      pilot
	test(pilot);
	// 	Concept Type: person
	test(conceptType(person));
	// 	Reference Scheme: name
	test(referenceScheme(name));
	// Term:      plane
	test(plane);
	// 	Reference Scheme: name
	test(referenceScheme(name));
	// Fact Type: pilot has name
	test(factType(pilot, verb('has'), name));
	// 	Necessity: each pilot has exactly one name
	test(necessity('each', pilot, verb('has'), ['exactly', 'one'], name));
	// Fact Type: pilot has years of experience
	test(factType(pilot, verb('has'), yearsOfExperience));
	// 	Necessity: each pilot has exactly one years of experience
	test(
		necessity(
			'each',
			pilot,
			verb('has'),
			['exactly', 'one'],
			yearsOfExperience,
		),
	);
	// 	Necessity: each pilot has a years of experience that is greater than -1.
	test(
		necessity('each', pilot, verb('has'), 'a', [
			yearsOfExperience,
			verb('is greater than'),
			-1,
		]),
	);
	// Fact Type: plane has name
	test(factType(plane, verb('has'), name));
	// 	Necessity: each plane has exactly one name
	test(necessity('each', plane, verb('has'), ['exactly', 'one'], name));
	// 	Necessity: each name that is of a plane has a length (Type) that is greater than 1
	test(
		necessity('each', [name, verb('is of'), 'a', plane], verb('has'), 'a', [
			lengthType,
			verb('is greater than'),
			1,
		]),
	);
	// 	Necessity: each name of a plane has a length (Type) that is greater than 1
	test(
		necessity(
			{ se: 'each name of a plane has a Length (Type) that is greater than 1' },
			'each',
			[name, verb('is of'), 'a', plane],
			verb('has'),
			'a',
			[lengthType, verb('is greater than'), 1],
		),
	);
	// Fact type: pilot can fly plane
	test(factType(pilot, verb('can fly'), plane));
	// 	Synonymous Form: plane can be flown by pilot
	test(synonymousForm(plane, verb('can be flown by'), pilot));
	// Fact type: pilot [can teach pilots]
	test({
		se: 'pilot [can teach pilots]',
		lf: factType(pilot, verb('can teach pilots')),
	});
	// Fact type: pilot0 taught pilot1
	test(factType(pilots[0], verb('taught'), pilots[1]));
	// 	Synonymous Form: pilot1 was taught by pilot0
	test(synonymousForm(pilots[1], verb('was taught by'), pilots[0]));
	// Fact type: person is parent of person
	test(factType(person, verb('is parent of'), person));
	// 	Synonymous Form: person was parented by person
	test(synonymousForm(person, verb('was parented by'), person), (e) =>
		expect(e)
			.to.be.an('error')
			.that.has.a.property('message')
			.that.equals(
				'Ambiguous use of fact type "person was parented by person", please add explicit numbering',
			),
	);
	// 	Synonymous Form: person0 was parented by person1
	test(synonymousForm(persons[0], verb('was parented by'), persons[1]), (e) =>
		expect(e)
			.to.be.an('error')
			.that.has.a.property('message')
			.that.equals(
				'Unable to map identifiers for "person was parented by person", please add explicit numbering',
			),
	);
	// 	Term Form: test term form
	test(termForm(testTermForm));
	// 	Concept Type: test term
	test(conceptType(testTerm));
	// Fact type: pilot is experienced
	test(factType(pilot, verb('is experienced')));
	// Term: veteran pilot
	test(veteranPilot);
	// 	Definition: pilot that can fly at least 2 planes
	test(definition([pilot, verb('can fly'), ['at least', 2], plane]));
	// Rule:       It is necessary that each pilot can fly at least 1 plane
	test(
		rule('Necessity', 'each', pilot, verb('can fly'), ['at least', 1], plane),
	);
	// Rule:       It is necessary that each pilot that is experienced, can fly at least 2 planes
	test(
		rule(
			'Necessity',
			'each',
			[pilot, verb('is experienced')],
			verb('can fly'),
			['at least', 2],
			plane,
		),
	);
	// Rule:       It is necessary that each pilot that is not experienced, can fly at most 2 planes
	test(
		rule(
			'Necessity',
			'each',
			[pilot, verb('is experienced', true)],
			verb('can fly'),
			['at most', 2],
			plane,
		),
	);
	// Rule:       It is necessary that each pilot that can fly at most 2 planes, is not experienced
	test(
		rule(
			'Necessity',
			'each',
			[pilot, verb('can fly'), ['at most', 2], plane],
			verb('is experienced', true),
		),
	);

	// Rule:       It is necessary that each plane that at least 3 pilots can fly, has a name
	test(
		rule(
			'Necessity',
			'each',
			[plane, ['at least', 3], pilot, verb('can fly')],
			verb('has'),
			'a',
			name,
		),
	);
	// Rule:       It is necessary that each plane that at least 3 pilots that are experienced can fly, has a name
	test(
		customRule(
			'It is necessary that each plane that at least 3 pilots that are experienced can fly, has a name',
			'Necessity',
			'each',
			[
				plane,
				['at least', 3],
				[pilot, verb('is experienced')],
				verb('can fly'),
			],
			verb('has'),
			'a',
			name,
		),
	);
	// Rule:       It is necessary that each plane that at least 3 pilots that are not experienced can fly, has a name
	test(
		customRule(
			'It is necessary that each plane that at least 3 pilots that are not experienced can fly, has a name',
			'Necessity',
			'each',
			[
				plane,
				['at least', 3],
				[pilot, verb('is experienced', true)],
				verb('can fly'),
			],
			verb('has'),
			'a',
			name,
		),
	);
	// Rule:       It is necessary that each plane that at least 3 pilots that aren't experienced can fly, has a name
	test(
		customRule(
			"It is necessary that each plane that at least 3 pilots that aren't experienced can fly, has a name",
			'Necessity',
			'each',
			[
				plane,
				['at least', 3],
				[pilot, verb('is experienced', true)],
				verb('can fly'),
			],
			verb('has'),
			'a',
			name,
		),
	);
	// Rule:       It is necessary that each plane that at least 3 pilots that a name is of can fly, has a name
	test(
		rule(
			'Necessity',
			'each',
			[
				plane,
				['at least', 3],
				[pilot, verb('is experienced')],
				verb('can fly'),
			],
			verb('has'),
			'a',
			name,
		),
	);

	// Rule:       It is necessary that each pilot has a years of experience that is greater than 0
	test(
		rule('Necessity', 'each', pilot, verb('has'), 'a', [
			yearsOfExperience,
			verb('is greater than'),
			0,
		]),
	);

	// Rule:       It is necessary that each plane can be flown by at least 1 pilot
	test(
		rule(
			'Necessity',
			'each',
			plane,
			verb('can be flown by'),
			['at least', 1],
			pilot,
		),
	);

	// Rule:       It is necessary that a given plane can be flown by at least 1 pilot
	test(
		rule(
			'Necessity',
			'a given',
			plane,
			verb('can be flown by'),
			['at least', 1],
			pilot,
		),
	);

	// -- OR

	// Rule:       It is necessary that each pilot that is experienced, can fly at least 2 planes or has a years of experience that is greater than 5
	test(
		rule(
			'Necessity',
			'each',
			[pilot, verb('is experienced')],
			_or(
				[verb('can fly'), ['at least', 2], plane],
				[verb('has'), 'a', [yearsOfExperience, verb('is greater than'), 5]],
			),
		),
	);

	// Rule:       It is necessary that each pilot that is not experienced, can not fly at least 2 planes or does not have a years of experience that is greater than 5
	test(
		rule(
			'Necessity',
			'each',
			[pilot, verb('is experienced', true)],
			_or(
				[verb('can fly', true), ['at least', 2], plane],
				[
					verb('has', true),
					'a',
					[yearsOfExperience, verb('is greater than'), 5],
				],
			),
		),
	);

	// Rule:       It is necessary that each pilot that is experienced or can fly at least 2 planes, has a years of experience that is greater than 5
	test(
		rule(
			'Necessity',
			'each',
			[
				pilot,
				_or(
					[verb('is experienced')],
					[verb('can fly'), ['at least', 2], plane],
				),
			],
			verb('has'),
			'a',
			[yearsOfExperience, verb('is greater than'), 5],
		),
	);
	// Rule:       It is necessary that each pilot that is experienced or can fly at least 3 planes or can fly exactly one plane, has a years of experience that is greater than 5
	test(
		rule(
			'Necessity',
			'each',
			[
				pilot,
				_nestedOr(
					[verb('is experienced')],
					[verb('can fly'), ['at least', 3], plane],
					[verb('can fly'), ['exactly', 'one'], plane],
				),
			],
			verb('has'),
			'a',
			[yearsOfExperience, verb('is greater than'), 5],
		),
	);

	// Rule:       It is necessary that each pilot that is experienced, can fly at least 3 planes or exactly one plane
	test(
		rule(
			'Necessity',
			'each',
			[pilot, verb('is experienced')],
			verb('can fly'),
			_or([['at least', 3], plane], [['exactly', 'one'], plane]),
		),
	);
	// Rule:       It is necessary that each pilot that can fly at least 3 planes or exactly one plane, is experienced
	test(
		rule(
			'Necessity',
			'each',
			[
				pilot,
				verb('can fly'),
				_or([['at least', 3], plane], [['exactly', 'one'], plane]),
			],
			verb('is experienced'),
		),
	);

	// Rule:       It is necessary that each pilot can fly at least one plane or a pilot can fly at least 10 planes
	test(
		rule(
			'Necessity',
			_or(
				['each', pilot, verb('can fly'), ['at least', 'one'], plane],
				['a', pilot, verb('can fly'), ['at least', 10], plane],
			),
		),
	);
	// Rule:       It is necessary that each plane that at least 3 pilots can fly or exactly one pilot can fly, has a name
	test(
		rule(
			'Necessity',
			'each',
			[
				plane,
				_or(
					[['at least', 3], pilot, verb('can fly')],
					[['exactly', 'one'], pilot, verb('can fly')],
				),
			],
			verb('has'),
			'a',
			name,
		),
	);

	// -- AND

	// Rule:       It is necessary that each pilot that is experienced, can fly at least 2 planes and has a years of experience that is greater than 5
	test(
		rule(
			'Necessity',
			'each',
			[pilot, verb('is experienced')],
			_and(
				[verb('can fly'), ['at least', 2], plane],
				[verb('has'), 'a', [yearsOfExperience, verb('is greater than'), 5]],
			),
		),
	);
	// Rule:       It is necessary that each pilot that is experienced and can fly at least 2 planes, has a years of experience that is greater than 5
	test(
		rule(
			'Necessity',
			'each',
			[
				pilot,
				_and(
					[verb('is experienced')],
					[verb('can fly'), ['at least', 2], plane],
				),
			],
			verb('has'),
			'a',
			[yearsOfExperience, verb('is greater than'), 5],
		),
	);
	// Rule:       It is necessary that each pilot that is experienced and can fly at least 3 planes and can fly exactly one plane, has a years of experience that is greater than 5
	test(
		rule(
			'Necessity',
			'each',
			[
				pilot,
				_nestedAnd(
					[verb('is experienced')],
					[verb('can fly'), ['at least', 3], plane],
					[verb('can fly'), ['exactly', 'one'], plane],
				),
			],
			verb('has'),
			'a',
			[yearsOfExperience, verb('is greater than'), 5],
		),
	);

	// Rule:       It is necessary that each pilot that is experienced, can fly at least 3 planes and exactly one plane
	test(
		rule(
			'Necessity',
			'each',
			[pilot, verb('is experienced')],
			verb('can fly'),
			_and([['at least', 2], plane], [['exactly', 'one'], plane]),
		),
	);
	// Rule:       It is necessary that each pilot that can fly at least 3 planes and exactly one plane, is experienced
	test(
		rule(
			'Necessity',
			'each',
			[
				pilot,
				verb('can fly'),
				_and([['at least', 2], plane], [['exactly', 'one'], plane]),
			],
			verb('is experienced'),
		),
	);

	// Rule:       It is necessary that each pilot can fly at least one plane and a pilot can fly at least 10 planes
	test(
		rule(
			'Necessity',
			_and(
				['each', pilot, verb('can fly'), ['at least', 'one'], plane],
				['a', pilot, verb('can fly'), ['at least', 10], plane],
			),
		),
	);
	// Rule:       It is necessary that each plane that at least 3 pilots can fly and exactly one pilot can fly, has a name
	test(
		rule(
			'Necessity',
			'each',
			[
				plane,
				_and(
					[['at least', 3], pilot, verb('can fly')],
					[['exactly', 'one'], pilot, verb('can fly')],
				),
			],
			verb('has'),
			'a',
			name,
		),
	);

	// -- AND / OR

	// Rule:       It is necessary that each pilot that is experienced and can fly at least 3 planes or can fly exactly one plane, has a years of experience that is greater than 5
	test(
		rule(
			'Necessity',
			'each',
			[
				pilot,
				_and(
					[verb('is experienced')],
					_or(
						[verb('can fly'), ['at least', 3], plane],
						[verb('can fly'), ['exactly', 'one'], plane],
					),
				),
			],
			verb('has'),
			'a',
			[yearsOfExperience, verb('is greater than'), 5],
		),
	);

	// Rule:       It is necessary that each pilot that can fly at least 3 planes or can fly exactly one plane and is experienced, has a years of experience that is greater than 5
	test(
		rule(
			'Necessity',
			'each',
			[
				pilot,
				_or(
					[verb('can fly'), ['at least', 3], plane],
					_and(
						[verb('can fly'), ['exactly', 'one'], plane],
						[verb('is experienced')],
					),
				),
			],
			verb('has'),
			'a',
			[yearsOfExperience, verb('is greater than'), 5],
		),
	);

	// -- Commas

	// Rule:       It is necessary that each pilot that is experienced, can fly at least 3 planes, and can fly at most 10 planes, has a years of experience that is greater than 5
	test(
		rule(
			'Necessity',
			'each',
			[
				pilot,
				_and(
					[verb('is experienced')],
					[verb('can fly'), ['at least', 3], plane],
					[verb('can fly'), ['at most', 10], plane],
				),
			],
			verb('has'),
			'a',
			[yearsOfExperience, verb('is greater than'), 5],
		),
	);

	// Rule:       It is necessary that each pilot that is experienced, can fly at least 3 planes, or can fly exactly one plane, has a years of experience that is greater than 5
	test(
		rule(
			'Necessity',
			'each',
			[
				pilot,
				_or(
					[verb('is experienced')],
					[verb('can fly'), ['at least', 3], plane],
					[verb('can fly'), ['exactly', 'one'], plane],
				),
			],
			verb('has'),
			'a',
			[yearsOfExperience, verb('is greater than'), 5],
		),
	);

	// Rule:       It is necessary that each pilot that is experienced, can fly at least 3 planes, and can fly at most 10 planes or has a name that has a length (Type) that is greater than 20, has a years of experience that is greater than 5
	test(
		rule(
			'Necessity',
			'each',
			[
				pilot,
				_and(
					[verb('is experienced')],
					[verb('can fly'), ['at least', 3], plane],
					_or(
						[verb('can fly'), ['at most', 10], plane],
						[
							verb('has'),
							'a',
							[
								name,
								verb('has'),
								'a',
								[lengthType, verb('is greater than'), 20],
							],
						],
					),
				),
			],
			verb('has'),
			'a',
			[yearsOfExperience, verb('is greater than'), 5],
		),
	);

	// Rule:       It is necessary that each pilot that is experienced, can fly at least 3 planes, or can fly exactly one plane and has a name that has a length (Type) that is greater than 10, has a years of experience that is greater than 5
	test(
		rule(
			'Necessity',
			'each',
			[
				pilot,
				_or(
					[verb('is experienced')],
					[verb('can fly'), ['at least', 3], plane],
					_and(
						[verb('can fly'), ['exactly', 'one'], plane],
						[
							verb('has'),
							'a',
							[
								name,
								verb('has'),
								'a',
								[lengthType, verb('is greater than'), 20],
							],
						],
					),
				),
			],
			verb('has'),
			'a',
			[yearsOfExperience, verb('is greater than'), 5],
		),
	);

	// Rule:       It is necessary that each pilot that is experienced, can fly exactly one plane or can fly at least 5 planes, and can fly at least 3 planes, has a years of experience that is greater than 5
	test(
		rule(
			'Necessity',
			'each',
			[
				pilot,
				_and(
					[verb('is experienced')],
					_or(
						[verb('can fly'), ['exactly', 'one'], plane],
						[verb('can fly'), ['at least', 5], plane],
					),
					[verb('can fly'), ['at least', 3], plane],
				),
			],
			verb('has'),
			'a',
			[yearsOfExperience, verb('is greater than'), 5],
		),
	);

	// Rule:       It is necessary that each pilot that is experienced, can fly at least one plane and can fly at most 5 planes, or can fly at least 3 planes, has a years of experience that is greater than 5
	test(
		rule(
			'Necessity',
			'each',
			[
				pilot,
				_or(
					[verb('is experienced')],
					_and(
						[verb('can fly'), ['at least', 'one'], plane],
						[verb('can fly'), ['at most', 5], plane],
					),
					[verb('can fly'), ['at least', 3], plane],
				),
			],
			verb('has'),
			'a',
			[yearsOfExperience, verb('is greater than'), 5],
		),
	);

	// Rule:       It is necessary that each pilot that is experienced, can fly at most 10 planes or has a name that has a length (Type) that is greater than 20, and can fly at least 3 planes, has a years of experience that is greater than 5
	test(
		rule(
			'Necessity',
			'each',
			[
				pilot,
				_and(
					[verb('is experienced')],
					_or(
						[verb('can fly'), ['at most', 10], plane],
						[
							verb('has'),
							'a',
							[
								name,
								verb('has'),
								'a',
								[lengthType, verb('is greater than'), 20],
							],
						],
					),
					[verb('can fly'), ['at least', 3], plane],
				),
			],
			verb('has'),
			'a',
			[yearsOfExperience, verb('is greater than'), 5],
		),
	);

	// Rule:       It is necessary that each pilot that is experienced, can fly exactly one plane and has a name that has a length (Type) that is greater than 10, or can fly at least 3 planes, has a years of experience that is greater than 5
	test(
		rule(
			'Necessity',
			'each',
			[
				pilot,
				_or(
					[verb('is experienced')],
					_and(
						[verb('can fly'), ['exactly', 'one'], plane],
						[
							verb('has'),
							'a',
							[
								name,
								verb('has'),
								'a',
								[lengthType, verb('is greater than'), 20],
							],
						],
					),
					[verb('can fly'), ['at least', 3], plane],
				),
			],
			verb('has'),
			'a',
			[yearsOfExperience, verb('is greater than'), 5],
		),
	);

	// Rule:       It is necessary that each pilot that can fly at most 10 planes or can fly at least 15 planes, and is experienced and can fly at least 3 planes, has a years of experience that is greater than 5
	test(
		rule(
			'Necessity',
			'each',
			[
				pilot,
				_nestedAnd(
					_or(
						[verb('can fly'), ['at most', 10], plane],
						[verb('can fly'), ['at least', 15], plane],
					),
					[verb('is experienced')],
					[verb('can fly'), ['at least', 3], plane],
				),
			],
			verb('has'),
			'a',
			[yearsOfExperience, verb('is greater than'), 5],
		),
	);

	// Rule:       It is necessary that each pilot that can fly at least one plane and at most 10 planes, or is experienced or can fly at least 3 planes, has a years of experience that is greater than 5
	test(
		rule(
			'Necessity',
			'each',
			[
				pilot,
				_nestedOr(
					_and(
						[verb('can fly'), ['exactly', 'one'], plane],
						[verb('can fly'), ['at most', 10], plane],
					),
					[verb('is experienced')],
					[verb('can fly'), ['at least', 3], plane],
				),
			],
			verb('has'),
			'a',
			[yearsOfExperience, verb('is greater than'), 5],
		),
	);

	// Rule:       It is necessary that each pilot0 that can fly a plane0, can fly a plane1 that can be flown by a pilot1 that can fly a plane0
	test(
		rule(
			'Necessity',
			'each',
			[pilots[0], verb('can fly'), 'a', planes[0]],
			verb('can fly'),
			'a',
			[
				planes[1],
				verb('can be flown by'),
				'a',
				[pilots[1], verb('can fly'), 'a', planes[0]],
			],
		),
	);
});
