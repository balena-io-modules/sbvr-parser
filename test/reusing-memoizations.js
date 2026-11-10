/* eslint-disable @typescript-eslint/no-require-imports */
const { describe, it } = require('mocha');
const { expect } = require('chai');
const { SBVRParser } = require('../sbvr-parser');
const { SBVRLibs } = require('../sbvr-libs');

// Editors reparse the whole text after each edit, reusing the memoizations of the previous parse
// for the text before the edit, which must give the same result as a fresh parse.
describe('reusing memoizations', function () {
	const reparse = (before, after) => {
		const parser = SBVRParser.createInstance();
		parser.enableReusingMemoizations(parser._sideEffectingRules);
		try {
			parser.matchAll(before, 'Process');
		} catch (e) {
			if (!(e instanceof SyntaxError)) {
				throw e;
			}
		}
		parser.reset();
		return parser.matchAll(after, 'Process');
	};

	it('should match the longest identifier when the previous text ended inside it', function () {
		const lines = 'Term: term\nTerm: term history\nFact Type: ';
		const text = lines + 'term history references term';
		expect(reparse(lines + 'term hi', text)).to.deep.equal(
			SBVRParser.matchAll(text, 'Process'),
		);
	});

	it('should match the longest identifier when the previous text ended after some of its words', function () {
		const lines = 'Term: term\nTerm: term history big thing\nFact Type: ';
		const text = lines + 'term history big thing has term';
		expect(reparse(lines + 'term history big th', text)).to.deep.equal(
			SBVRParser.matchAll(text, 'Process'),
		);
	});

	it('should report the failure position of a fresh parse when it fails before the edit', function () {
		const lines = 'Term: person\nFact Typo: person\nTerm: ';
		// ometa-js can throw the same error object for every failed match, so the positions are
		// read straight away
		let freshErr;
		let freshIdx;
		try {
			SBVRParser.matchAll(lines + 'car', 'Process');
		} catch (e) {
			freshErr = e;
			freshIdx = e.OMeta.idx;
		}
		let err;
		let idx;
		try {
			reparse(lines + 'ca', lines + 'car');
		} catch (e) {
			err = e;
			idx = e.OMeta.idx;
		}
		expect(freshErr).to.be.instanceOf(SyntaxError);
		expect(err).to.be.instanceOf(SyntaxError);
		expect(idx).to.equal(freshIdx);
	});

	it('should report the failure position of a fresh parse after the streams were walked', function () {
		const lines = 'Term: person\nFact Typo: person\nTerm: ';
		let freshIdx;
		try {
			SBVRParser.matchAll(lines + 'car', 'Process');
		} catch (e) {
			freshIdx = e.OMeta.idx;
		}
		const parser = SBVRParser.createInstance();
		parser.enableReusingMemoizations(parser._sideEffectingRules);
		try {
			parser.matchAll(lines + 'ca', 'Process');
		} catch (e) {
			if (!(e instanceof SyntaxError)) {
				throw e;
			}
		}
		// Walk every stream to the end of the input, as the codemirror-ometa highlighter does to
		// collect the tokens
		try {
			for (let input = parser.inputHead; input != null; input = input.tail()) {
				// Nothing to do
			}
		} catch (e) {
			if (!(e instanceof SyntaxError)) {
				throw e;
			}
		}
		parser.reset();
		let err;
		let idx;
		try {
			parser.matchAll(lines + 'car', 'Process');
		} catch (e) {
			err = e;
			idx = e.OMeta.idx;
		}
		expect(err).to.be.instanceOf(SyntaxError);
		expect(idx).to.equal(freshIdx);
	});

	describe('highlighting tokens', function () {
		// The distinct tokens, as `start-end:rule`
		const tokens = (parser) => {
			const result = new Set();
			for (
				let input = parser.inputHead;
				input?.idx !== undefined;
				input = input.tl
			) {
				for (const [end, rule] of input.tokens ?? []) {
					result.add(`${input.idx}-${end}:${rule}`);
				}
			}
			return [...result].sort();
		};

		it('should match a fresh parse when the previous text ended inside an identifier', function () {
			const lines = 'Term: term\nTerm: term history\nFact Type: ';
			const text = lines + 'term history references term';
			const fresh = SBVRParser.createInstance();
			fresh._enableTokens();
			fresh.matchAll(text, 'Process');
			const parser = SBVRParser.createInstance();
			parser.enableReusingMemoizations(parser._sideEffectingRules);
			parser._enableTokens();
			parser.matchAll(lines + 'term hi', 'Process');
			parser.reset();
			parser.matchAll(text, 'Process');
			expect(tokens(parser)).to.deep.equal(tokens(fresh));
		});

		it('should drop the tokens of a reused memoization that examined the edited input', function () {
			// `M` ends after one character but looks at the next three
			const Grammar = SBVRParser._extend({
				Top() {
					this._apply('Outer');
					return this._apply('end');
				},
				Outer() {
					this._opt(function () {
						return this._apply('M');
					});
					return this._many(function () {
						return this._apply('anything');
					});
				},
				M() {
					this._applyWithArgs('exactly', 'a');
					return this._lookahead(function () {
						this._applyWithArgs('exactly', 'a');
						this._applyWithArgs('exactly', 'b');
						return this._applyWithArgs('exactly', 'c');
					});
				},
			});
			const parser = Grammar.createInstance();
			parser.enableReusingMemoizations(['Top', 'Outer']);
			SBVRLibs._enableTokens.call(parser, ['M']);
			// The second parse reuses `M`'s memoization, and the third changes what it looked at
			for (const text of ['aabcdef', 'aabcdeg', 'aabXdeg']) {
				parser.matchAll(text, 'Top');
			}
			const fresh = Grammar.createInstance();
			SBVRLibs._enableTokens.call(fresh, ['M']);
			fresh.matchAll('aabXdeg', 'Top');
			expect(tokens(parser)).to.deep.equal(tokens(fresh));
		});
	});
});
