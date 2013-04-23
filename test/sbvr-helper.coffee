_ = require('lodash')

stripAttributes = (x) -> x[...-1]

exports.term = (term, vocab = 'Default') -> ['Term', term, vocab, ['Attributes']]
exports.verb = (verb) -> ['Verb', verb, false]
exports.factType = (factType...) ->
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
