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
	{lf, se} = createParser().resolveTerm(variable)
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
				if lf[3]? and lf[3][0] isnt 'Attributes'
					toSE(lf[3])
				else if lf[2] != 'Default'
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
	se =
		if _.isArray(quantifier)
			quantifier.join(' ')
		else
			quantifier

	if _.isArray(quantifier)
		[quantifier, cardinality] = quantifier
		cardinality = 
			[	'Number'
				if cardinality is 'one' then 1 else cardinality
			]
	lf =
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
				throw new Error('Unknown quantifier: ' + quantifier)
	return {
		lf
		se
	}

parseEmbeddedData = (embeddedData) ->
	if _.isNumber(embeddedData)
		if embeddedData == parseInt(embeddedData, 0)
			['Term', 'Integer', 'Type', ['Integer', embeddedData]]
		else
			['Term', 'Real', 'Type', ['Real', embeddedData]]
	else if _.isString(embeddedData)
		['Term', 'Text', 'Type', ['Text', embeddedData]]
	else
		throw new Error('Not embedded data: ' + embeddedData)

createParser = ->
	num = -1
	closedProjection = (args, identifier, binding) ->
		try
			{lf, se} = ruleBody(args, [], [], identifier, binding)
		catch
			{lf, se} = disjunction(verbContinuation, args, [identifier], [binding])
		return {
			lf
			se: 'that ' + se
		}

	resolveIdentifier = (identifier) ->
		num++
		strippedIdentifier = stripAttributes(identifier)
		return {
			identifier
			se: toSE(identifier)
			binding: [
				'RoleBinding'
				strippedIdentifier
				strippedIdentifier[3] ? num
			]
			lf: [
				'Variable'
				[	'Number'
					num
				]
				strippedIdentifier
			]
		}

	resolveTerm = (arr) ->
		identifier =
			if arr[0] is 'Term'
				arr
			else if _.isArray(arr[0]) and arr[0][0] is 'Term'
				arr[0]
			else
				throw new Error('Not a term: ' + arr)
		{identifier, se, binding, lf} = resolveIdentifier(identifier)
		if _.isArray(arr[0])
			projection = closedProjection(arr[1...], identifier, binding)
			se += ' ' + projection.se
			lf.push(projection.lf)
		return {
			identifier
			se
			binding
			lf
			hasClosedProjection: projection?
		}

	resolveEmbeddedData = (embeddedData) ->
		identifier = parseEmbeddedData(embeddedData)
		return resolveIdentifier(identifier)

	resolveName = (name) -> 
		# TODO: Actually do something and match the return of resolveTerm and resolveEmbeddedData
		return name

	resolveVerb = (verb) -> 
		# TODO: Actually do some proper checks
		if verb?
			return verb
		throw new Error('Not a verb: ' + verb)

	disjunction = (fn, disjunction, fnArgs...) ->
		if disjunction?[0]?[0] is 'Disjunction'
			lf = ['Disjunction']
			se = []
			for args in disjunction[0][1...]
				{lf: fnLF, se: fnSE} = fn(args, _.cloneDeep(fnArgs)...)
				lf.push(fnLF)
				se.push(fnSE)
			return {
				lf
				se: se.join(' or ')
			}
		else
			fn(disjunction, fnArgs...)

	verbContinuation = (args, factTypeSoFar, bindings, postfixIdentifier, postfixBinding) ->
		try
			verb = resolveVerb(args[0])
			factTypeSoFar.push(verb)
			{lf, se} = ruleBody(args[1...], factTypeSoFar, bindings)
			return {
				lf
				se: [
					toSE(verb)
					se
				].join(' ')
			}
		if postfixIdentifier?
			factTypeSoFar.push(postfixIdentifier)
		if postfixBinding?
			bindings.push(postfixBinding)
		lf = [
			'AtomicFormulation'
			stripAttributes(factType(factTypeSoFar...))
		].concat(bindings)
		return {
			lf
			se: toSE(verb) ? ''
		}

	ruleBody = (args, factTypeSoFar = [], bindings = [], postfixIdentifier, postfixBinding) ->
		try
			{lf: quantifierLF, se: quantifierSE} = resolveQuantifier(args[0])
			{identifier, se: identifierSE, lf: identifierLF, binding, hasClosedProjection} = resolveTerm(args[1])
			factTypeSoFar.push(identifier)
			bindings.push(binding)
			{lf, se} = disjunction(verbContinuation, args[2...], factTypeSoFar, bindings, postfixIdentifier, postfixBinding)
			if hasClosedProjection and se != ''
				identifierSE += ','
			return {
				lf: quantifierLF.concat([identifierLF, lf])
				se: [
					quantifierSE
					identifierSE
					se
				].join(' ').trim()
			}
		catch e
			if args[0] is 'the'
				console.log('Named references are not implemented yet', args, e, e.stack)
				process.exit()
			else
				{identifier, se: identifierSE, lf: identifierLF, binding} = resolveEmbeddedData(args[0])
				factTypeSoFar.push(identifier)
				bindings.push(binding)
				{lf, se} = disjunction(verbContinuation, args[1...], factTypeSoFar, bindings, postfixIdentifier, postfixBinding)
				return {
					se: [
						identifierSE
						se
					].join(' ')
					# We ignore the identifierLF for embedded data.
					lf
				}

	return {
		resolveTerm
		ruleBody
	}

exports.rule = rule = (formulationType, args...) ->
	formulationType += 'Formulation'
	{lf, se} = createParser().ruleBody(args)
	return [
		'Rule'
		[	formulationType
			lf
		]
		[	'StructuredEnglish'
			[	toSE(formulationType)
				se
			].join(' ') + '.'
		]
	]
exports.necessity = do ->
	necessityRule = rule.bind(null, 'Necessity')
	(args...) ->
		[	'Necessity'
			necessityRule.apply(null, args)
		]
exports._or = (ruleParts...) ->
	['Disjunction', ruleParts...]
