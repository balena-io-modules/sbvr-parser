_ = require('lodash')

exports.term = (term, vocab = 'Default') -> ['Term', term, vocab, ['Attributes']]
exports.verb = (verb) -> ['Verb', verb, false]
exports.factType = (factType...) ->
	['FactType'].concat(
		_.map(factType, (factTypePart) ->
			switch factTypePart[0]
				when 'Term'
					factTypePart[...-1]
				else
					factTypePart
		)
	).concat([['Attributes']])