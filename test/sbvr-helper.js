/*
 * decaffeinate suggestions:
 * DS104: Avoid inline assignments
 * DS205: Consider reworking code to avoid use of IIFEs
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const _ = require('lodash');

const stripAttributes = (x) => _.reject(x, { 0: 'Attributes' });

const factTypeBody = (fType) =>
	_(fType)
		// Standardise the fact type parts
		.map(function (factTypePart) {
			if (_.isNumber(factTypePart) || _.isString(factTypePart)) {
				// Parse numbers/strings to the correct term array.
				return parseEmbeddedData(factTypePart);
			} else if (factTypePart[0] === 'Term') {
				// Strip attributes from terms
				return stripAttributes(factTypePart);
			} else if (factTypePart[0] === 'Verb') {
				return factTypePart;
			} else {
				// Ignore any unknown fact type parts
				return null;
			}
		})
		.compact()
		.value();

exports.vocabulary = (vocab) => ['Vocabulary', vocab, ['Attributes']];
exports.term = function (term, vocab) {
	if (vocab == null) {
		vocab = 'Default';
	}
	return ['Term', term, vocab, ['Attributes']];
};
exports.numberedTerms = (term, amount) =>
	_.times(amount, function (num) {
		const numberedTerm = _.clone(term);
		numberedTerm[3] = ['Number', num];
		return numberedTerm;
	});
exports.verb = function (verb, negated) {
	if (negated == null) {
		negated = false;
	}
	return ['Verb', verb, negated];
};
const factType = function (...fType) {
	const factTypeLF = factTypeBody(fType);
	const attributes = ['Attributes'];
	if (factTypeLF.length === 3 && ['has', 'is of'].includes(factTypeLF[1][1])) {
		const synFormLF = _.cloneDeep(factTypeLF);
		synFormLF.reverse();
		synFormLF[1][1] = synFormLF[1][1] === 'has' ? 'is of' : 'has';
		attributes.push(['SynonymousForm', synFormLF]);
	}
	return ['FactType', ...factTypeLF, attributes];
};
exports.factType = factType;
exports.conceptType = (term) => ['ConceptType', stripAttributes(term)];
exports.referenceScheme = (term) => ['ReferenceScheme', stripAttributes(term)];
exports.termForm = (term) => ['TermForm', stripAttributes(term)];
exports.synonym = (term) => ['Synonym', stripAttributes(term)];
exports.synonymousForm = (...fType) => ['SynonymousForm', factTypeBody(fType)];

exports.note = (note) => ['Note', note];
exports.definitionEnum = (...options) => [
	'Definition',
	['Enum'].concat(options.map((option) => parseEmbeddedData(option)[3])),
];
exports.definition = function (variable) {
	const { lf, se } = createParser().resolveTerm(variable);
	return {
		lf: ['Definition', lf],
		se,
	};
};

// Gets the type of the line (eg Term/Rule) and adds spaces if necessary (eg "SynonymousForm" to "Synonymous Form")
exports.getLineType = (lf) => lf[0].replace(/([A-Z])/g, ' $1').trim();

const toSE = function (lf, currentVocab) {
	const recursiveSE = _.partial(toSE, _, currentVocab);
	if (_.isArray(lf)) {
		switch (lf[0]) {
			case 'Vocabulary':
				return lf[1];
			case 'Term':
				if (lf[3] != null && lf[3][0] !== 'Attributes') {
					if (_.isArray(lf[3]) && lf[3][0] === 'Number') {
						return `${lf[1]}${lf[3][1]}`;
					} else {
						return recursiveSE(lf[3]);
					}
				} else if (lf[2] !== currentVocab) {
					return lf[1] + ' (' + lf[2] + ')';
				} else {
					return lf[1];
				}
			case 'Verb':
				if (lf[2]) {
					return lf[1].replace('is', 'is not');
				} else {
					return lf[1];
				}
			case 'Necessity':
				return lf[1][2][1].replace('It is necessary that ', '');
			case 'Rule':
				return lf[2][1];
			case 'Attributes':
				return '';
			case 'Definition':
				if (lf[1][0] === 'Enum') {
					return _.map(lf[1].slice(1), recursiveSE).join(' or ');
				} else {
					return lf;
				}
			case 'SynonymousForm':
				return _.map(lf[1], recursiveSE).join(' ').trim();
			case 'Text':
				return '"' + lf[1] + '"';
			case 'Integer':
				return lf[1];
			case 'at least':
			case 'at most':
				return _.map(lf, recursiveSE).join(' ');
			default:
				return _.map(lf.slice(1), recursiveSE).join(' ').trim();
		}
	} else {
		if (_.isNumber(lf)) {
			return lf;
		} else {
			switch (lf) {
				case 'NecessityFormulation':
					return 'It is necessary that';
				default:
					return lf;
			}
		}
	}
};
exports.toSE = toSE;

const resolveQuantifier = function (quantifier) {
	let cardinality;
	const se = _.isArray(quantifier) ? quantifier.join(' ') : quantifier;

	if (_.isArray(quantifier)) {
		[quantifier, cardinality] = quantifier;
		cardinality = ['Number', cardinality === 'one' ? 1 : cardinality];
	}
	const lf = (() => {
		switch (quantifier) {
			case 'each':
			case 'a given':
				return ['UniversalQuantification'];
			case 'a':
			case 'an':
			case 'some':
				return ['ExistentialQuantification'];
			case 'exactly':
				return ['ExactQuantification', ['Cardinality', cardinality]];
			case 'at least':
				return ['AtLeastNQuantification', ['MinimumCardinality', cardinality]];
			case 'at most':
				return ['AtMostNQuantification', ['MaximumCardinality', cardinality]];
			default:
				throw new Error('Unknown quantifier: ' + quantifier);
		}
	})();
	return {
		lf,
		se,
	};
};

var parseEmbeddedData = function (embeddedData) {
	if (_.isNumber(embeddedData)) {
		if (embeddedData === parseInt(embeddedData, 0)) {
			return ['Term', 'Integer', 'Type', ['Integer', embeddedData]];
		} else {
			return ['Term', 'Real', 'Type', ['Real', embeddedData]];
		}
	} else if (_.isString(embeddedData)) {
		return ['Term', 'Text', 'Type', ['Text', embeddedData]];
	} else {
		throw new Error('Not embedded data: ' + embeddedData);
	}
};

var createParser = function (currentVocab) {
	if (currentVocab == null) {
		currentVocab = 'Default';
	}
	const currentVocabSE = _.partialRight(toSE, currentVocab);
	const closedProjection = function (args, identifier, binding) {
		let lf;
		let se;
		try {
			({ lf, se } = junction(ruleBody, args, [], [], identifier, binding));
		} catch (error) {
			({ lf, se } = junction(verbContinuation, args, [identifier], [binding]));
		}
		return {
			lf,
			se: 'that ' + se,
		};
	};

	const resolveIdentifier = (function () {
		let num = -1;
		const knownNums = {};
		return function (identifier) {
			let data;
			let lf;
			const strippedIdentifier = stripAttributes(identifier);
			// Only increment the num and generate LF if there is no embedded data.
			if (strippedIdentifier[3] == null) {
				num++;
				data = num;
				lf = ['Variable', ['Number', num], strippedIdentifier];
			} else if (strippedIdentifier[3][0] === 'Number') {
				const key =
					strippedIdentifier[1] +
					'|' +
					strippedIdentifier[2] +
					'|' +
					strippedIdentifier[3][1];
				if (knownNums[key] == null) {
					num++;
					knownNums[key] = num;
				}
				data = knownNums[key];
				lf = ['Variable', ['Number', data], strippedIdentifier];
			} else {
				data = strippedIdentifier[3];
			}
			return {
				identifier,
				se: currentVocabSE(identifier),
				binding: ['RoleBinding', strippedIdentifier, data],
				lf,
			};
		};
	})();

	const resolveTerm = function (arr) {
		let binding;
		let lf;
		let projection;
		let se;
		let identifier = (() => {
			if (arr[0] === 'Term') {
				return arr;
			} else if (_.isArray(arr[0]) && arr[0][0] === 'Term') {
				return arr[0];
			} else {
				throw new Error('Not a term: ' + arr);
			}
		})();
		({ identifier, se, binding, lf } = resolveIdentifier(identifier));
		if (_.isArray(arr[0])) {
			projection = closedProjection(arr.slice(1), identifier, binding);
			se += ' ' + projection.se;
			lf.push(projection.lf);
		}
		return {
			identifier,
			se,
			binding,
			lf,
			hasClosedProjection: projection != null,
		};
	};

	const resolveEmbeddedData = function (embeddedData) {
		const identifier = parseEmbeddedData(embeddedData);
		return resolveIdentifier(identifier);
	};

	const resolveVerb = function (verb) {
		// TODO: Actually do some proper checks
		if (verb != null) {
			return verb;
		}
		throw new Error('Not a verb: ' + verb);
	};

	const junctionTypes = {
		Disjunction: 'or',
		Conjunction: 'and',
	};
	var junction = function (fn, junctionStruct, ...fnArgs) {
		let maybeJunction = junctionStruct;
		while (maybeJunction.length === 1 && _.isArray(maybeJunction[0])) {
			maybeJunction = maybeJunction[0];
		}
		if (junctionTypes.hasOwnProperty(maybeJunction[0])) {
			let junctioned;
			let prevJunctioned;
			const lf = [maybeJunction[0]];
			const se = [];
			const junctionType = junctionTypes[maybeJunction[0]];
			const junctionArgs = maybeJunction.slice(1);
			for (let i = 0; i < junctionArgs.length; i++) {
				let fnLF;
				let fnSE;
				const args = junctionArgs[i];
				prevJunctioned = junctioned;
				({
					lf: fnLF,
					se: fnSE,
					junctioned,
				} = junction(fn, args, ..._.cloneDeep(fnArgs)));
				if (prevJunctioned && i + 1 < junctionArgs.length) {
					fnSE = junctionType + ' ' + fnSE;
				}
				lf.push(fnLF);
				se.push(fnSE);
			}
			const lastSE = se.pop();
			if (se.length > 1 || prevJunctioned) {
				se.push('');
			}
			return {
				lf,
				se: [se.join(', ').trim(), junctionType, lastSE].join(' '),
				junctioned: true,
			};
		} else {
			return fn(junctionStruct, ...fnArgs);
		}
	};

	var verbContinuation = function (
		args,
		factTypeSoFar,
		bindings,
		postfixIdentifier,
		postfixBinding,
	) {
		let lf;
		let verb;
		try {
			let se;
			verb = resolveVerb(args[0]);
			factTypeSoFar.push(verb);
			({ lf, se } = junction(ruleBody, args.slice(1), factTypeSoFar, bindings));
			return {
				lf,
				se: [currentVocabSE(verb), se].join(' '),
			};
		} catch (e) {
			// ignore
		}
		if (postfixIdentifier != null) {
			factTypeSoFar.push(postfixIdentifier);
		}
		if (postfixBinding != null) {
			bindings.push(postfixBinding);
		}
		lf = [
			'AtomicFormulation',
			stripAttributes(factType(...(factTypeSoFar || []))),
		].concat(bindings);

		const left = currentVocabSE(verb);
		return {
			lf,
			se: left != null ? left : '',
		};
	};

	var ruleBody = function (
		args,
		factTypeSoFar,
		bindings,
		postfixIdentifier,
		postfixBinding,
	) {
		if (factTypeSoFar == null) {
			factTypeSoFar = [];
		}
		if (bindings == null) {
			bindings = [];
		}
		try {
			const { lf: quantifierLF, se: quantifierSE } = resolveQuantifier(args[0]);
			let {
				identifier,
				se: identifierSE,
				lf: identifierLF,
				binding,
				hasClosedProjection,
			} = resolveTerm(args[1]);
			factTypeSoFar.push(identifier);
			bindings.push(binding);
			let { lf, se } = junction(
				verbContinuation,
				args.slice(2),
				factTypeSoFar,
				bindings,
				postfixIdentifier,
				postfixBinding,
			);
			if (hasClosedProjection && se !== '') {
				identifierSE += ',';
			}
			return {
				lf: quantifierLF.concat([identifierLF, lf]),
				se: [quantifierSE, identifierSE, se].join(' ').trim(),
			};
		} catch (e) {
			if (args[0] === 'the') {
				console.log(
					'Named references are not implemented yet',
					args,
					e,
					e.stack,
				);
				return process.exit();
			} else {
				let {
					identifier,
					se: identifierSE,
					binding,
				} = resolveEmbeddedData(args[0]);
				factTypeSoFar.push(identifier);
				bindings.push(binding);
				let { lf, se } = junction(
					verbContinuation,
					args.slice(1),
					factTypeSoFar,
					bindings,
					postfixIdentifier,
					postfixBinding,
				);
				return {
					se: [identifierSE, se].join(' '),
					lf,
				};
			}
		}
	};

	return {
		junction,
		resolveTerm,
		ruleBody,
	};
};

exports.customRule = function (structuredEnglish, formulationType, ...args) {
	const lf = rule(formulationType, ...args);
	lf[2][1] = structuredEnglish;
	return lf;
};

const vocabRule = function (vocab, formulationType, ...args) {
	let manualSE;
	if (_.isObject(args[0]) && args[0].se != null) {
		manualSE = args.shift();
	}
	formulationType += 'Formulation';
	const parser = createParser(vocab);
	let { lf, se } = parser.junction(parser.ruleBody, args);
	if (manualSE != null) {
		({ se } = manualSE);
	}
	return [
		'Rule',
		[formulationType, lf],
		['StructuredEnglish', [toSE(formulationType, vocab), se].join(' ') + '.'],
	];
};
exports.vocabRule = vocabRule;
const vocabNecessity = (vocab, ...args) => [
	'Necessity',
	vocabRule(vocab, 'Necessity', ...args),
];
exports.vocabNecessity = vocabNecessity;

const rule = _.partial(vocabRule, 'Default');
exports.rule = rule;
exports.necessity = _.partial(vocabNecessity, 'Default');

var nestedPairs = function (type, pairs) {
	if (pairs.length === 1) {
		return pairs[0];
	}
	return [type, pairs[0], nestedPairs(type, pairs.slice(1))];
};
exports._nestedOr = (...ruleParts) => nestedPairs('Disjunction', ruleParts);
exports._nestedAnd = (...ruleParts) => nestedPairs('Conjunction', ruleParts);

exports._or = (...ruleParts) => ['Disjunction'].concat(ruleParts);
exports._and = (...ruleParts) => ['Conjunction'].concat(ruleParts);
