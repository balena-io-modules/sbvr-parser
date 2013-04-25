_ = require('lodash')

stripAttributes = (x) -> x[...-1]

exports.term = (term, vocab = 'Default') -> ['Term', term, vocab, ['Attributes']]
exports.verb = (verb, negated = false) -> ['Verb', verb, negated]
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

exports.toSE = toSE = (lf) ->
	if _.isArray lf
		switch lf[0]
			when 'Term'
				lf[1]
			when 'Verb'
				if lf[2]
					lf[1].replace('is', 'is not')
				else
					lf[1]
			when 'Necessity'
				lf[1][2][1].replace('It is necessary that ', '')
			when 'Rule'
				lf[2][1]
			when 'Attributes'
				''
			else
				_.map(lf[1...], toSE).join(' ').trim()
	else
		switch lf
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
			['UniversalQuantification']
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
		when 'at most'
			[	'AtMostNQuantification'
				[	'MaximumCardinality'
					cardinality
				]
			]
		else
			throw 'Unknown quantifier: ' + quantifier
resolveVariable = (variable) ->
	identifier =
		if variable[0] is 'Term'
			variable
		else
			variable[0]
	binding =
		[	'RoleBinding'
			stripAttributes(identifier)
			0
		]
	return {
		identifier
		binding
		lf:
			[	'Variable'
				[	'Number'
					0
				]
				stripAttributes(identifier)
			].concat(
				if variable[0] is 'Term'
					[]
				else
					[	[	'AtomicFormulation'
							stripAttributes(factType.apply(null, variable))
							binding
						]
					]
			)
		se: 
			if variable[0] is 'Term'
				toSE(variable)
			else
				toSE(identifier) + ' that ' + _.map(variable[1...], toSE).join(' ')
	}

exports.rule = rule = (formulationType, quantifier, variable, verb, quantifier2, term2) ->
	{lf: variableLF, se: variableSE, binding: variableBinding, identifier} = resolveVariable(variable)
	[	'Rule'
		[	formulationType + 'Formulation'
			resolveQuantifier(quantifier).concat [
				variableLF
				resolveQuantifier(quantifier2).concat [
					[	'Variable'
						[	'Number'
							1
						]
						stripAttributes(term2)
					]
					[	'AtomicFormulation'
						stripAttributes(factType identifier, verb, term2)
						variableBinding
						[	'RoleBinding'
							stripAttributes(term2)
							1
						]
					]
				]
			]
		]
		[	'StructuredEnglish'
			[	toSE(formulationType)
				(if _.isArray(quantifier) then quantifier.join(' ') else quantifier)
				variableSE
				toSE(verb)
				(if _.isArray(quantifier2) then quantifier2.join(' ') else quantifier2)
				toSE(term2)
			].join(' ') + '.'
		]
	]
exports.necessity = do ->
	necessityRule = rule.bind(null, 'Necessity')
	(args...) ->
		[	'Necessity'
			necessityRule.apply(null, args)
		]
