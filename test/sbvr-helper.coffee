_ = require 'lodash'

stripAttributes = (x) -> _.reject(x, 0: 'Attributes')

factTypeBody = (factType) ->
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
	.compact()
	.value()

exports.vocabulary = (vocab) -> ['Vocabulary', vocab, ['Attributes']]
exports.term = (term, vocab = 'Default') -> ['Term', term, vocab, ['Attributes']]
exports.numberedTerms = (term, amount) ->
	return _.times amount, (num) ->
		numberedTerm = _.clone(term)
		numberedTerm[3] = ['Number', num]
		return numberedTerm
exports.verb = (verb, negated = false) -> ['Verb', verb, negated]
exports.factType = factType = (factType...) ->
	factTypeLF = factTypeBody(factType)
	attributes = ['Attributes']
	if factTypeLF.length is 3 and factTypeLF[1][1] in ['has', 'is of']
		synFormLF = _.cloneDeep(factTypeLF)
		synFormLF.reverse()
		synFormLF[1][1] =
			if synFormLF[1][1] is 'has'
				'is of'
			else
				'has'
		attributes.push(['SynonymousForm', synFormLF])
	[	'FactType'
		factTypeLF...
		attributes
	]
exports.conceptType = (term) -> ['ConceptType', stripAttributes(term)]
exports.referenceScheme = (term) -> ['ReferenceScheme', stripAttributes(term)]
exports.termForm = (term) -> ['TermForm', stripAttributes(term)]
exports.synonym = (term) -> ['Synonym', stripAttributes(term)]
exports.synonymousForm = (factType...) ->
	[	'SynonymousForm'
		factTypeBody(factType)
	]

exports.note = (note) -> ['Note', note]
exports.definitionEnum = (options...) -> ['Definition', ['Enum'].concat(parseEmbeddedData(option)[3] for option in options)]
exports.definition = (variable) ->
	{ lf, se } = createParser().resolveTerm(variable)
	return {
		lf: [
			'Definition'
			lf
		]
		se: se
	}

# Gets the type of the line (eg Term/Rule) and adds spaces if necessary (eg "SynonymousForm" to "Synonymous Form")
exports.getLineType = (lf) -> lf[0].replace(/([A-Z])/g, ' $1').trim()

exports.toSE = toSE = (lf, currentVocab) ->
	recursiveSE = _.partial(toSE, _, currentVocab)
	if _.isArray lf
		switch lf[0]
			when 'Vocabulary'
				lf[1]
			when 'Term'
				if lf[3]? and lf[3][0] isnt 'Attributes'
					if _.isArray(lf[3]) and lf[3][0] is 'Number'
						"#{lf[1]}#{lf[3][1]}"
					else
						recursiveSE(lf[3])
				else if lf[2] != currentVocab
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
					_.map(lf[1][1...], recursiveSE).join(' or ')
				else
					lf
			when 'SynonymousForm'
				_.map(lf[1], recursiveSE).join(' ').trim()
			when 'Text'
				'"' + lf[1] + '"'
			when 'Integer'
				lf[1]
			when 'at least', 'at most'
				_.map(lf, recursiveSE).join(' ')
			else
				_.map(lf[1...], recursiveSE).join(' ').trim()
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

createParser = (currentVocab = 'Default') ->
	currentVocabSE = _.partialRight(toSE, currentVocab)
	closedProjection = (args, identifier, binding) ->
		try
			{ lf, se } = junction(ruleBody, args, [], [], identifier, binding)
		catch
			{ lf, se } = junction(verbContinuation, args, [identifier], [binding])
		return {
			lf
			se: 'that ' + se
		}

	resolveIdentifier = do ->
		num = -1
		knownNums = {}
		return (identifier) ->
			strippedIdentifier = stripAttributes(identifier)
			# Only increment the num and generate LF if there is no embedded data.
			if !strippedIdentifier[3]?
				num++
				data = num
				lf = [
					'Variable'
					[	'Number'
						num
					]
					strippedIdentifier
				]
			else if strippedIdentifier[3][0] is 'Number'
				key = strippedIdentifier[1] + '|' + strippedIdentifier[2] + '|' + strippedIdentifier[3][1]
				if !knownNums[key]?
					num++
					knownNums[key] = num
				data = knownNums[key]
				lf = [
					'Variable'
					[	'Number'
						data
					]
					strippedIdentifier
				]
			else
				data = strippedIdentifier[3]
			return {
				identifier
				se: currentVocabSE(identifier)
				binding: [
					'RoleBinding'
					strippedIdentifier
					data
				]
				lf
			}

	resolveTerm = (arr) ->
		identifier =
			if arr[0] is 'Term'
				arr
			else if _.isArray(arr[0]) and arr[0][0] is 'Term'
				arr[0]
			else
				throw new Error('Not a term: ' + arr)
		{ identifier, se, binding, lf } = resolveIdentifier(identifier)
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

	resolveVerb = (verb) ->
		# TODO: Actually do some proper checks
		if verb?
			return verb
		throw new Error('Not a verb: ' + verb)

	junctionTypes =
		Disjunction: 'or'
		Conjunction: 'and'
	junction = (fn, junctionStruct, fnArgs...) ->
		maybeJunction = junctionStruct
		while maybeJunction.length is 1 and _.isArray(maybeJunction[0])
			maybeJunction = maybeJunction[0]
		if junctionTypes.hasOwnProperty(maybeJunction[0])
			lf = [maybeJunction[0]]
			se = []
			junctionType = junctionTypes[maybeJunction[0]]
			junctionArgs = maybeJunction[1...]
			for args, i in junctionArgs
				prevJunctioned = junctioned
				{ lf: fnLF, se: fnSE, junctioned } = junction(fn, args, _.cloneDeep(fnArgs)...)
				if prevJunctioned and i + 1 < junctionArgs.length
					fnSE = junctionType + ' ' + fnSE
				lf.push(fnLF)
				se.push(fnSE)
			lastSE = se.pop()
			if se.length > 1 or prevJunctioned
				se.push('')
			return {
				lf
				se: [
					se.join(', ').trim()
					junctionType
					lastSE
				].join(' ')
				junctioned: true
			}
		else
			fn(junctionStruct, fnArgs...)

	verbContinuation = (args, factTypeSoFar, bindings, postfixIdentifier, postfixBinding) ->
		try
			verb = resolveVerb(args[0])
			factTypeSoFar.push(verb)
			{ lf, se } = junction(ruleBody, args[1...], factTypeSoFar, bindings)
			return {
				lf
				se: [
					currentVocabSE(verb)
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
			se: currentVocabSE(verb) ? ''
		}

	ruleBody = (args, factTypeSoFar = [], bindings = [], postfixIdentifier, postfixBinding) ->
		try
			{ lf: quantifierLF, se: quantifierSE } = resolveQuantifier(args[0])
			{ identifier, se: identifierSE, lf: identifierLF, binding, hasClosedProjection } = resolveTerm(args[1])
			factTypeSoFar.push(identifier)
			bindings.push(binding)
			{ lf, se } = junction(verbContinuation, args[2...], factTypeSoFar, bindings, postfixIdentifier, postfixBinding)
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
				{ identifier, se: identifierSE, binding } = resolveEmbeddedData(args[0])
				factTypeSoFar.push(identifier)
				bindings.push(binding)
				{ lf, se } = junction(verbContinuation, args[1...], factTypeSoFar, bindings, postfixIdentifier, postfixBinding)
				return {
					se: [
						identifierSE
						se
					].join(' ')
					lf
				}

	return {
		junction
		resolveTerm
		ruleBody
	}

exports.customRule = (structuredEnglish, formulationType, args...) ->
	lf = rule(formulationType, args...)
	lf[2][1] = structuredEnglish
	return lf

exports.vocabRule = vocabRule = (vocab, formulationType, args...) ->
	formulationType += 'Formulation'
	parser = createParser(vocab)
	{ lf, se } = parser.junction(parser.ruleBody, args)
	return [
		'Rule'
		[	formulationType
			lf
		]
		[	'StructuredEnglish'
			[	toSE(formulationType, vocab)
				se
			].join(' ') + '.'
		]
	]
exports.vocabNecessity = vocabNecessity = (vocab, args...) ->
	[	'Necessity'
		vocabRule(vocab, 'Necessity', args...)
	]
exports.rule = rule = _.partial(vocabRule, 'Default')
exports.necessity = _.partial(vocabNecessity, 'Default')

nestedPairs = (type, pairs) ->
	if pairs.length is 1
		return pairs[0]
	return [type, pairs[0], nestedPairs(type, pairs[1...])]
exports._nestedOr = (ruleParts...) -> nestedPairs('Disjunction', ruleParts)
exports._nestedAnd = (ruleParts...) -> nestedPairs('Conjunction', ruleParts)

exports._or = (ruleParts...) -> ['Disjunction'].concat(ruleParts)
exports._and = (ruleParts...) -> ['Conjunction'].concat(ruleParts)
