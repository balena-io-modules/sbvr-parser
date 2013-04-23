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

resolveQuantifier = (quantifier) ->
	switch quantifier
		when 'each'
			'UniversalQuantification'
		when 'exactly'
			'ExactQuantification'
exports.necessity = (quantifier, term, verb, quantifier2, cardinality, term2) ->
	[	'Necessity'
		[	'Rule'
			[	'NecessityFormulation'
				[	resolveQuantifier(quantifier)
					[	'Variable'
						[	'Number'
							0
						]
						stripAttributes(term)
					]
					[	resolveQuantifier(quantifier2)
						[	'Cardinality'
							[	'Number'
								if cardinality is 'one' then 1 else cardinality
							]
						]
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
				['It is necessary that', quantifier, term[1], verb[1], quantifier2, cardinality, term2[1]].join(' ')
			]
		]
	]
