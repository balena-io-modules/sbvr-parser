_ = require('lodash')

stripAttributes = (x) -> _.reject(x, (part) -> part[0] is 'Attributes')

exports.term = (term, vocab = 'Default') -> ['Term', term, vocab, ['Attributes']]
exports.verb = (verb, negated = false) -> ['Verb', verb, negated]
exports.factType = factType = (factType...) ->
	['FactType'].concat(
		_.map(factType, (factTypePart) ->
			if _.isNumber(factTypePart)
				parseEmbeddedData(factTypePart)
			else if factTypePart[0] is  'Term'
				stripAttributes(factTypePart)
			else
				factTypePart
		)
	).concat([['Attributes']])
exports.conceptType = (term) -> ['ConceptType', stripAttributes(term)]
exports.referenceScheme = (term) -> ['ReferenceScheme', stripAttributes(term)]
exports.termForm = (term) -> ['TermForm', stripAttributes(term)]

exports.toSE = toSE = (lf) ->
	if _.isArray lf
		switch lf[0]
			when 'Term'
				if lf[2] != 'Default'
					lf[1] + ' (' + lf[2] + ')'
				else
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
		if _.isNumber(lf)
			lf
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
		when 'a', 'an', 'some'
			['ExistentialQuantification']
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

parseEmbeddedData = (embeddedData) ->
	if _.isNumber(embeddedData)
		if embeddedData == parseInt(embeddedData, 0)
			['Term', 'Integer', 'Type', ['Integer', embeddedData]]
		else
			['Term', 'Real', 'Type', ['Real', embeddedData]]

createVariableResolver = ->
	num = -1
	resolveVariable = (variable) ->
		num++
		identifier =
			if _.isNumber(variable)
				parseEmbeddedData(variable)
			else if variable[0] is 'Term'
				variable
			else
				variable[0]
		strippedIdentifier = stripAttributes(identifier)
		binding =
			[	'RoleBinding'
				strippedIdentifier
				strippedIdentifier[3] ? num
			]
		return {
			identifier
			binding
			lf:
				[	'Variable'
					[	'Number'
						num
					]
					strippedIdentifier
				].concat(
					if _.isNumber(variable) or variable[0] is 'Term'
						[]
					else
						[	[	'AtomicFormulation'
								stripAttributes(factType.apply(null, variable))
								binding
							].concat(
								if variable[2]?
									[resolveVariable(variable[2]).binding]
								else
									[]
							)
						]
				)
			se: 
				if _.isNumber(variable) or variable[0] is 'Term'
					toSE(variable)
				else
					toSE(identifier) + ' that ' + _.map(variable[1...], toSE).join(' ')
		}

exports.rule = rule = (formulationType, quantifier, variable, verb, quantifier2, variable2) ->
	resolveVariable = createVariableResolver()
	{lf: variableLF, se: variableSE, binding: variableBinding, identifier} = resolveVariable(variable)
	{lf: variableLF2, se: variableSE2, binding: variableBinding2, identifier: identifier2} = resolveVariable(variable2)
	[	'Rule'
		[	formulationType + 'Formulation'
			resolveQuantifier(quantifier).concat [
				variableLF
				resolveQuantifier(quantifier2).concat [
					variableLF2
					[	'AtomicFormulation'
						stripAttributes(factType identifier, verb, identifier2)
						variableBinding
						variableBinding2
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
				variableSE2
			].join(' ') + '.'
		]
	]
exports.necessity = do ->
	necessityRule = rule.bind(null, 'Necessity')
	(args...) ->
		[	'Necessity'
			necessityRule.apply(null, args)
		]
