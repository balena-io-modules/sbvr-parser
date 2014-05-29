_ = require('lodash')

stripAttributes = (x) -> _.reject(x, (part) -> part[0] is 'Attributes')

exports.term = (term, vocab = 'Default') -> ['Term', term, vocab, ['Attributes']]
exports.verb = (verb, negated = false) -> ['Verb', verb, negated]
exports.factType = factType = (factType...) ->
	['FactType'].concat(
		_(factType)
		# Standardise the fact type parts
		.map (factTypePart) ->
			if _.isNumber(factTypePart) or _.isString(factTypePart)
				# Parse numbers/strings to the correct term array.
				parseEmbeddedData(factTypePart)
			else if factTypePart[0] is 'Term'
				# Strip attributes from terms
				stripAttributes(factTypePart)
			else if factTypePart[0] is 'Verb'
				factTypePart
			else
				# Ignore any unknown fact type parts
				null
		# Remove the nulls
		.filter()
		.value()
	).concat([['Attributes']])
exports.conceptType = (term) -> ['ConceptType', stripAttributes(term)]
exports.referenceScheme = (term) -> ['ReferenceScheme', stripAttributes(term)]
exports.termForm = (term) -> ['TermForm', stripAttributes(term)]
exports.synonym = (term) -> ['Synonym', stripAttributes(term)]

exports.note = (note) -> ['Note', note]
exports.definitionEnum = (options...) -> ['Definition', ['Enum'].concat(parseEmbeddedData(option)[3] for option in options)]
exports.definition = (variable) ->
	resolveVariable = createVariableResolver()
	{lf, se} = resolveVariable(variable)
	return {
		lf: [
			'Definition'
			lf
		]
		se: se
	}

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
			when 'Definition'
				if lf[1][0] is 'Enum'
					_.map(lf[1][1...], toSE).join(' or ')
				else
					lf
			when 'Text'
				'"' + lf[1] + '"'
			when 'Integer'
				lf[1]
			when 'at least', 'at most'
				_.map(lf, toSE).join(' ')
			else
				_.map(lf[1...], toSE).join(' ').trim()
	else
		if _.isNumber(lf)
			lf
		else
			switch lf
				when 'NecessityFormulation'
					'It is necessary that'
				else
					lf

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
	else if _.isString(embeddedData)
		['Term', 'Text', 'Type', ['Text', embeddedData]]

createVariableResolver = ->
	num = -1
	resolveVariable = (variable) ->
		num++
		identifier =
			if _.isNumber(variable) or _.isString(variable)
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
		resultVar = [
			'Variable'
			[	'Number'
				num
			]
			strippedIdentifier
		]
		return {
			identifier
			binding
			variable: resultVar
			lf:
				resultVar.concat(
					if _.isNumber(variable) or _.isString(variable) or variable[0] is 'Term'
						[]
					else
						# If there is a 4th element then we're looking at [Term, Verb, Quantifier, Term]
						if variable.length is 4
							secondVar = resolveVariable(variable[3])
						# However if there's only 3 elements then we're looking at [Term, Verb, EmbeddedData]
						else if variable.length is 3
							embeddedVar = resolveVariable(variable[2])

						atomicFormulation = 
							[
								'AtomicFormulation'
								stripAttributes(factType(variable...))
								binding
							].concat(
								if secondVar?
									[secondVar.binding]
								else if embeddedVar?
									[embeddedVar.binding]
								else
									[]
							)
						[
							if secondVar?
								resolveQuantifier(variable[2]).concat([secondVar.variable, atomicFormulation])
							else
								atomicFormulation
						]
				)
			se: 
				if _.isNumber(variable) or _.isString(variable) or variable[0] is 'Term'
					toSE(variable)
				else
					toSE(identifier) + ' that ' + _.map(variable[1...], toSE).join(' ')
		}

exports.rule = rule = (formulationType, quantifier, variable, verb, quantifier2, variable2) ->
	formulationType += 'Formulation'
	resolveVariable = createVariableResolver()
	{lf: variableLF, se: variableSE, binding: variableBinding, identifier} = resolveVariable(variable)
	{lf: variableLF2, se: variableSE2, binding: variableBinding2, identifier: identifier2} = resolveVariable(variable2)
	[	'Rule'
		[	formulationType
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
