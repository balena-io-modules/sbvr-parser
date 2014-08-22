typeVocab = require('fs').readFileSync(__dirname + '/Type.sbvr')
test = require('./test')(typeVocab)
{term, verb, factType, conceptType, referenceScheme, necessity, rule, definition, _or} = require('./sbvr-helper')

shortTextType = term 'Short Text', 'Type'
integerType = term 'Integer', 'Type'

name = term 'name'
yearsOfExperience = term 'years of experience'
pilot = term 'pilot'
veteranPilot = term 'veteran pilot'
plane = term 'plane'

describe 'pilots', ->
	# Term:      name
	test name
	# 	Concept Type: Short Text (Type)
	test conceptType shortTextType
	# Term:      years of experience
	test yearsOfExperience
	# 	Concept Type: Integer (Type)
	test conceptType integerType
	# Term:      pilot
	test pilot
	# 	Reference Scheme: name
	test referenceScheme name
	# Term:      plane
	test plane
	# 	Reference Scheme: name
	test referenceScheme name
	# Fact Type: pilot has name
	test factType pilot, verb('has'), name
	# 	Necessity: each pilot has exactly one name
	test necessity 'each', pilot, verb('has'), ['exactly', 'one'], name
	# Fact Type: pilot has years of experience
	test factType pilot, verb('has'), yearsOfExperience
	# 	Necessity: each pilot has exactly one years of experience
	test necessity 'each', pilot, verb('has'), ['exactly', 'one'], yearsOfExperience
	# Fact Type: plane has name
	test factType plane, verb('has'), name
	# 	Necessity: each plane has exactly one name
	test necessity 'each', plane, verb('has'), ['exactly', 'one'], name
	# Fact type: pilot can fly plane
	test factType pilot, verb('can fly'), plane
	# Fact type: pilot is experienced
	test factType pilot, verb('is experienced')
	# Term: veteran pilot
	test veteranPilot
	# 	Definition: pilot that can fly at least 2 planes
	test definition [pilot, verb('can fly'), ['at least', 2], plane]
	# Rule:       It is necessary that each pilot can fly at least 1 plane
	test rule 'Necessity', 'each', pilot, verb('can fly'), ['at least', 1], plane
	# Rule:       It is necessary that each pilot that is experienced, can fly at least 2 planes
	test rule 'Necessity', 'each', [pilot, verb('is experienced')], verb('can fly'), ['at most', 2], plane
	# Rule:       It is necessary that each pilot that is not experienced, can fly at most 2 planes
	test rule 'Necessity', 'each', [pilot, verb('is experienced', true)], verb('can fly'), ['at most', 2], plane
	# Rule:       It is necessary that each pilot that can fly at most 2 planes, is not experienced
	test rule 'Necessity', 'each', [pilot, verb('can fly'), ['at most', 2], plane], verb('is experienced', true)

	# Rule:       It is necessary that each plane that at least 3 pilots can fly, has a name
	test rule 'Necessity', 'each', [plane, ['at least', 3], pilot, verb('can fly')], verb('has'), 'a', name
	# Rule:       It is necessary that each plane that at least 3 pilots that are experienced can fly, has a name
	test rule 'Necessity', 'each', [plane, ['at least', 3], [pilot, verb('is experienced')], verb('can fly')], verb('has'), 'a', name
	# Rule:       It is necessary that each plane that at least 3 pilots that a name is of can fly, has a name
	test rule 'Necessity', 'each', [plane, ['at least', 3], [pilot, verb('is experienced')], verb('can fly')], verb('has'), 'a', name

	# Rule:       It is necessary that each pilot that is experienced, can fly at least 2 planes or has a years of experience that is greater than 5
	test rule 'Necessity', 'each', [pilot, verb('is experienced')],
		_or(
			[verb('can fly'), ['at least', 2], plane]
			[verb('has'), 'a', [yearsOfExperience, verb('is greater than'), 5]]
		)
	# Rule:       It is necessary that each pilot that is experienced or can fly at least 2 planes, has a years of experience that is greater than 5
	test rule 'Necessity', 'each',
		[pilot,
			_or(
				[verb('is experienced')]
				[verb('can fly'), ['at most', 2], plane]
			)
		], verb('has'), 'a', [yearsOfExperience, verb('is greater than'), 5]
	# Rule:       It is necessary that each pilot that is experienced or can fly at least 3 planes or can fly exactly one plane, has a years of experience that is greater than 5
	test rule 'Necessity', 'each',
		[pilot,
			_or(
				[verb('is experienced')]
				[verb('can fly'), ['at most', 3], plane]
				[verb('can fly'), ['exactly', 'one'], plane]
			)
		], verb('has'), 'a', [yearsOfExperience, verb('is greater than'), 5]

	# Rule:       It is necessary that each pilot that is experienced, can fly at least 3 planes or exactly one plane
	test rule 'Necessity', 'each', [pilot, verb('is experienced')], verb('can fly'), 
		_or(
			[['at least', 2], plane]
			[['exactly', 'one'], plane]
		)
	# Rule:       It is necessary that each pilot that can fly at least 3 planes or exactly one plane, is experienced
	test rule 'Necessity', 'each',
		[pilot, verb('can fly'),
			_or(
				[['at least', 2], plane]
				[['exactly', 'one'], plane]
			)
		], verb('is experienced')

	# Rule:       It is necessary that each pilot can fly at least one plane or a pilot can fly at least 10 planes
	test rule 'Necessity', _or(
		['each', pilot, verb('can fly'), ['at least', 'one'], plane]
		['a', pilot, verb('can fly'), ['at least', 10], plane]
	)
	# Rule:       It is necessary that each plane that at least 3 pilots can fly or exactly one pilot can fly, has a name
	test rule 'Necessity', 'each', [plane, 
		_or(
			[['at least', 3], pilot, verb('can fly')]
			[['exactly', 'one'], pilot, verb('can fly')]
		)], verb('has'), 'a', name
