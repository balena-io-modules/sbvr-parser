_ = require('lodash')

stripAttributes = (x) -> x[...-1]

exports.term = (term, vocab = 'Default') -> ['Term', term, vocab, ['Attributes']]
exports.verb = (verb) -> ['Verb', verb, false]
exports.factType = factType = (factType...) ->
	['FactType'].concat(
		_.map(factType, (factTypePart) ->
			switch factTypePart[0]
				when 'Term'
					stripAttributes(factTypePart)
				else
					factTypePart
		)
	).concat([['Attributes']])
exports.conceptType = (term) -> ['ConceptType', stripAttributes(term)]
exports.referenceScheme = (term) -> ['ReferenceScheme', stripAttributes(term)]

resolveFormulationType = (formulationType) ->
	switch formulationType
		when 'Necessity'
			'It is necessary that'
resolveQuantifier = (quantifier) ->
	if _.isArray(quantifier)
		[quantifier, cardinality] = quantifier
		cardinality = 
			[	'Number'
				if cardinality is 'one' then 1 else cardinality
			]
	switch quantifier
		when 'each'
			'UniversalQuantification'
		when 'exactly'
			[	'ExactQuantification'
				[	'Cardinality'
					cardinality
				]
			]
		when 'at least'
			[	'AtLeastNQuantification'
				[	'MinimumCardinality'
					cardinality
				]
			]
exports.rule = rule = (formulationType, quantifier, term, verb, quantifier2, term2) ->
	[	'Rule'
		[	formulationType + 'Formulation'
			[	resolveQuantifier(quantifier)
				[	'Variable'
					[	'Number'
						0
					]
					stripAttributes(term)
				]
				resolveQuantifier(quantifier2).concat [
					[	'Variable'
						[	'Number'
							1
						]
						stripAttributes(term2)
					]
					[	'AtomicFormulation'
						stripAttributes(factType term, verb, term2)
						[	'RoleBinding'
							stripAttributes(term)
							0
						]
						[	'RoleBinding'
							stripAttributes(term2)
							1
						]
					]
				]
			]
		]
		[	'StructuredEnglish'
			[resolveFormulationType(formulationType), (if _.isArray(quantifier) then quantifier.join(' ') else quantifier), term[1], verb[1], (if _.isArray(quantifier2) then quantifier2.join(' ') else quantifier2), term2[1]].join(' ')
		]
	]
exports.necessity = do ->
	necessityRule = rule.bind(null, 'Necessity')
	(args...) ->
		[	'Necessity'
			necessityRule.apply(null, args)
		]
