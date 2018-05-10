!function(root, factory) {
    "function" == typeof define && define.amd ? define([ "require", "exports", "ometa-core", "./sbvr-libs", "lodash", "./inflection" ], factory) : "object" == typeof exports ? factory(require, exports, require("ometa-js").core) : factory(function(moduleName) {
        return root[moduleName];
    }, root, root.OMeta);
}(this, function(require, exports, OMeta) {
    var SBVRLibs = require("./sbvr-libs").SBVRLibs, _ = require("lodash");
    require("./inflection");
    var SBVRParser = exports.SBVRParser = SBVRLibs._extend({
        EOL: function() {
            var $elf = this, _fromIdx = this.input.idx;
            return function() {
                switch (this.anything()) {
                  case "\n":
                    return "\n";

                  case "\r":
                    return this._opt(function() {
                        return this._applyWithArgs("exactly", "\n");
                    });

                  default:
                    throw this._fail();
                }
            }.call(this);
        },
        EOLSpaces: function() {
            var $elf = this, _fromIdx = this.input.idx, eol;
            eol = !1;
            this._many(function() {
                return this._or(function() {
                    this._apply("EOL");
                    return eol = !0;
                }, function() {
                    return this._apply("space");
                });
            });
            return this._pred(eol);
        },
        IdentifierKey: function(identifier) {
            var $elf = this, _fromIdx = this.input.idx, index;
            index = this._or(function() {
                this._pred(_.isArray(identifier[3]));
                this._pred("Number" == identifier[3][0]);
                return identifier[3][1];
            }, function() {
                return "";
            });
            return identifier[1] + "|" + identifier[2] + "|" + index;
        },
        Bind: function(identifier, bindings) {
            var $elf = this, _fromIdx = this.input.idx, binding, identifierKey, varNumber;
            identifierKey = this._applyWithArgs("IdentifierKey", identifier);
            varNumber = this.ruleVars[identifierKey];
            this._pred(null != varNumber);
            binding = [ "RoleBinding", identifier, varNumber ];
            this._opt(function() {
                this._pred(bindings);
                return bindings.push(binding);
            });
            return binding;
        },
        spaces: function() {
            var $elf = this, _fromIdx = this.input.idx;
            return this._many(function() {
                this._not(function() {
                    return this._apply("EOL");
                });
                return this._apply("space");
            });
        },
        Number: function() {
            var $elf = this, _fromIdx = this.input.idx, n;
            return this._or(function() {
                this._apply("spaces");
                n = this._consumedBy(function() {
                    return this._many1(function() {
                        return this._apply("digit");
                    });
                });
                return [ "Number", parseInt(n, 10) ];
            }, function() {
                this._applyWithArgs("token", "one");
                return [ "Number", 1 ];
            });
        },
        Real: function() {
            var $elf = this, _fromIdx = this.input.idx, n;
            this._apply("spaces");
            n = this._consumedBy(function() {
                this._many1(function() {
                    return this._apply("digit");
                });
                this._applyWithArgs("exactly", ".");
                return this._many1(function() {
                    return this._apply("digit");
                });
            });
            return [ "Real", Number(n) ];
        },
        Integer: function() {
            var $elf = this, _fromIdx = this.input.idx, n;
            this._apply("spaces");
            n = this._consumedBy(function() {
                return this._many1(function() {
                    return this._apply("digit");
                });
            });
            return [ "Integer", Number(n) ];
        },
        Text: function() {
            var $elf = this, _fromIdx = this.input.idx, text;
            this._apply("spaces");
            this._applyWithArgs("exactly", '"');
            text = this._consumedBy(function() {
                return this._many1(function() {
                    return this._or(function() {
                        switch (this.anything()) {
                          case "\\":
                            return this._applyWithArgs("exactly", '"');

                          default:
                            throw this._fail();
                        }
                    }, function() {
                        this._not(function() {
                            return this._applyWithArgs("exactly", '"');
                        });
                        return this.anything();
                    });
                });
            });
            this._applyWithArgs("exactly", '"');
            return [ "Text", text ];
        },
        Value: function() {
            var $elf = this, _fromIdx = this.input.idx;
            return this._or(function() {
                return this._apply("Real");
            }, function() {
                return this._apply("Integer");
            }, function() {
                return this._apply("Text");
            });
        },
        toSBVREOL: function() {
            var $elf = this, _fromIdx = this.input.idx;
            this._apply("spaces");
            return this._consumedBy(function() {
                return this._many(function() {
                    this._apply("spaces");
                    return this._or(function() {
                        return this._apply("InformalIdentifier");
                    }, function() {
                        switch (this.anything()) {
                          case "'":
                            this._apply("InformalIdentifier");
                            return this._applyWithArgs("exactly", "'");

                          default:
                            throw this._fail();
                        }
                    }, function() {
                        return this._many1(function() {
                            this._not(function() {
                                return this._apply("space");
                            });
                            return this.anything();
                        });
                    });
                });
            });
        },
        toEOL: function() {
            var $elf = this, _fromIdx = this.input.idx;
            return this._consumedBy(function() {
                return this._many(function() {
                    this._not(function() {
                        return this._apply("EOL");
                    });
                    return this.anything();
                });
            });
        },
        token: function(x) {
            var $elf = this, _fromIdx = this.input.idx, s;
            this._apply("spaces");
            s = this._applyWithArgs("seq", x);
            this._lookahead(function() {
                return this._or(function() {
                    return this._apply("space");
                }, function() {
                    return this._apply("end");
                });
            });
            return s;
        },
        AddIdentifier: function(identifierType, baseSynonym) {
            var $elf = this, _fromIdx = this.input.idx, identifier, startInput;
            startInput = this.input;
            identifier = this._many1(function() {
                return this._apply("IdentifierPart");
            });
            identifier = identifier.join(" ");
            this._addToken(startInput, this.input, identifierType, []);
            return function() {
                return $elf._AddIdentifier(identifierType, identifier, baseSynonym);
            };
        },
        InformalIdentifier: function() {
            var $elf = this, _fromIdx = this.input.idx;
            return this._applyWithArgs("Identifier", void 0, !0);
        },
        Identifier: function(factTypeSoFar, noAutoComplete) {
            var $elf = this, _fromIdx = this.input.idx, name, term;
            this._opt(function() {
                return this._not(function() {
                    return term = this._consumedBy(function() {
                        return this._opt(function() {
                            return this._applyWithArgs("Term", factTypeSoFar);
                        });
                    });
                });
            });
            this._opt(function() {
                return this._not(function() {
                    return name = this._consumedBy(function() {
                        return this._opt(function() {
                            return this._applyWithArgs("Name", factTypeSoFar);
                        });
                    });
                });
            });
            return this._or(function() {
                this._pred(term || name);
                return this._or(function() {
                    this._pred(term.length > name.length);
                    return this._applyWithArgs("Term", factTypeSoFar);
                }, function() {
                    return this._applyWithArgs("Name", factTypeSoFar);
                });
            }, function() {
                this._pred(!noAutoComplete);
                return this._or(function() {
                    return this._applyWithArgs("Term", factTypeSoFar);
                }, function() {
                    return this._applyWithArgs("Name", factTypeSoFar);
                });
            });
        },
        Vocabulary: function() {
            var $elf = this, _fromIdx = this.input.idx, vocabulary;
            vocabulary = this._apply("FindVocabulary");
            return [ "Vocabulary", vocabulary ];
        },
        Name: function(factTypeSoFar) {
            var $elf = this, _fromIdx = this.input.idx;
            return this._applyWithArgs("FindIdentifier", "Name", factTypeSoFar);
        },
        Term: function(factTypeSoFar) {
            var $elf = this, _fromIdx = this.input.idx, n, term;
            term = this._applyWithArgs("FindIdentifier", "Term", factTypeSoFar);
            this._opt(function() {
                n = this._consumedBy(function() {
                    return this._many1(function() {
                        return this._apply("digit");
                    });
                });
                return term.push([ "Number", Number(n) ]);
            });
            return term;
        },
        FindIdentifier: function(identifierType, factTypeSoFar) {
            var $elf = this, _fromIdx = this.input.idx, identifier, quote;
            this._apply("spaces");
            quote = this._opt(function() {
                return this._applyWithArgs("exactly", "'");
            });
            identifier = this._applyWithArgs("FindIdentifierNest", identifierType, factTypeSoFar);
            this._or(function() {
                return this._pred(!quote);
            }, function() {
                return this._applyWithArgs("seq", quote);
            });
            return identifier;
        },
        FindIdentifierNest: function(identifierType, factTypeSoFar, identifierSoFar) {
            var $elf = this, _fromIdx = this.input.idx, identifierSoFar, part, vocabulary;
            part = this._apply("IdentifierPart");
            identifierSoFar = this._or(function() {
                this._pred(identifierSoFar);
                return identifierSoFar + " " + part;
            }, function() {
                return part;
            });
            this._pred(identifierSoFar.length <= this.longestIdentifier[identifierType]);
            return this._or(function() {
                return this._applyWithArgs("FindIdentifierNest", identifierType, factTypeSoFar, identifierSoFar);
            }, function() {
                vocabulary = this._or(function() {
                    return this._applyWithArgs("FindVocabulary", identifierSoFar);
                }, function() {
                    return this.currentVocabulary;
                });
                return this._applyWithArgs("IsFactTypeIdentifier", [ identifierType, identifierSoFar, vocabulary ], factTypeSoFar);
            });
        },
        FindVocabulary: function(identifier) {
            var $elf = this, _fromIdx = this.input.idx, bracket, vocabulary;
            this._apply("spaces");
            bracket = this._opt(function() {
                return this._applyWithArgs("exactly", "(");
            });
            vocabulary = this._apply("FindVocabularyNest");
            this._pred(!identifier || this.vocabularies[vocabulary].IdentifierChildren.hasOwnProperty(identifier));
            this._or(function() {
                return this._pred(!bracket);
            }, function() {
                switch (this.anything()) {
                  case ")":
                    return ")";

                  default:
                    throw this._fail();
                }
            });
            return vocabulary;
        },
        FindVocabularyNest: function(vocabularySoFar) {
            var $elf = this, _fromIdx = this.input.idx, part, vocabularySoFar;
            part = this._apply("IdentifierPart");
            vocabularySoFar = this._or(function() {
                this._pred(vocabularySoFar);
                return vocabularySoFar + " " + part;
            }, function() {
                return part;
            });
            this._pred(vocabularySoFar.length <= this.longestIdentifier.Vocabulary);
            return this._or(function() {
                return this._applyWithArgs("FindVocabularyNest", vocabularySoFar);
            }, function() {
                this._pred(this.vocabularies.hasOwnProperty(vocabularySoFar));
                return vocabularySoFar;
            });
        },
        IdentifierPart: function() {
            var $elf = this, _fromIdx = this.input.idx;
            this._apply("spaces");
            return this._consumedBy(function() {
                return this._many1(function() {
                    return this._or(function() {
                        return this._apply("letter");
                    }, function() {
                        switch (this.anything()) {
                          case "-":
                            return "-";

                          default:
                            throw this._fail();
                        }
                    });
                });
            });
        },
        addVerb: function() {
            var $elf = this, _fromIdx = this.input.idx;
            this._apply("ClearSuggestions");
            return this._applyWithArgs("Verb", !0);
        },
        Verb: function(factTypeSoFar) {
            var $elf = this, _fromIdx = this.input.idx;
            return this._applyWithArgs("FindVerb", factTypeSoFar);
        },
        FindVerb: function(factTypeSoFar, verbSoFar, negated) {
            var $elf = this, _fromIdx = this.input.idx, negated, part, verb, verbSoFar;
            this._opt(function() {
                this._pred(factTypeSoFar && !verbSoFar);
                this._or(function() {
                    return this._applyWithArgs("Keyword", "isn't");
                }, function() {
                    return this._applyWithArgs("Keyword", "aren't");
                });
                verbSoFar = "is";
                return negated = !0;
            });
            part = this._apply("VerbPart");
            verbSoFar = this._or(function() {
                this._pred(verbSoFar);
                return verbSoFar + " " + part;
            }, function() {
                return this._verbForm(part);
            });
            this._opt(function() {
                this._pred(factTypeSoFar && "is" === verbSoFar);
                this._apply("spaces");
                this._applyWithArgs("Keyword", "not");
                return negated = !0;
            });
            return this._or(function() {
                return this._applyWithArgs("FindVerb", factTypeSoFar, verbSoFar, negated);
            }, function() {
                this._or(function() {
                    return this._pred(!0 === factTypeSoFar);
                }, function() {
                    return this._applyWithArgs("IsVerb", factTypeSoFar, verbSoFar);
                });
                verb = [ "Verb", verbSoFar ];
                this._or(function() {
                    this._pred(negated);
                    return verb.push(!0);
                }, function() {
                    return verb.push(!1);
                });
                return verb;
            });
        },
        VerbPart: function() {
            var $elf = this, _fromIdx = this.input.idx;
            this._apply("spaces");
            this._not(function() {
                return this._apply("Identifier");
            });
            return this._apply("IdentifierPart");
        },
        JoiningQuantifier: function() {
            var $elf = this, _fromIdx = this.input.idx;
            return this._applyWithArgs("matchForAll", "Keyword", [ "and", "at", "most" ]);
        },
        Quantifier: function() {
            var $elf = this, _fromIdx = this.input.idx, m, n;
            return this._or(function() {
                this._applyWithArgs("Keyword", "each");
                return [ "UniversalQuantification" ];
            }, function() {
                this._applyWithArgs("matchForAny", "Keyword", [ "a", "an", "some" ]);
                return [ "ExistentialQuantification" ];
            }, function() {
                this._applyWithArgs("matchForAll", "Keyword", [ "at", "most" ]);
                n = this._apply("Number");
                return [ "AtMostNQuantification", [ "MaximumCardinality", n ] ];
            }, function() {
                this._applyWithArgs("matchForAll", "Keyword", [ "at", "least" ]);
                n = this._apply("Number");
                return this._or(function() {
                    this._apply("JoiningQuantifier");
                    m = this._apply("Number");
                    return [ "NumericalRangeQuantification", [ "MinimumCardinality", n ], [ "MaximumCardinality", m ] ];
                }, function() {
                    return [ "AtLeastNQuantification", [ "MinimumCardinality", n ] ];
                });
            }, function() {
                this._applyWithArgs("matchForAll", "Keyword", [ "more", "than" ]);
                n = this._apply("Number");
                ++n[1];
                return [ "AtLeastNQuantification", [ "MinimumCardinality", n ] ];
            }, function() {
                this._applyWithArgs("Keyword", "exactly");
                n = this._apply("Number");
                return [ "ExactQuantification", [ "Cardinality", n ] ];
            }, function() {
                this._applyWithArgs("Keyword", "no");
                return [ "ExactQuantification", [ "Cardinality", [ "Number", 0 ] ] ];
            });
        },
        Keyword: function(word, noToken) {
            var $elf = this, _fromIdx = this.input.idx;
            return this._or(function() {
                this._pred(!0 === noToken);
                return this._applyWithArgs("seq", word);
            }, function() {
                this._pred(!0 !== noToken);
                return this._applyWithArgs("token", word);
            });
        },
        addThat: function() {
            var $elf = this, _fromIdx = this.input.idx;
            return this._applyWithArgs("Keyword", "that");
        },
        addThe: function() {
            var $elf = this, _fromIdx = this.input.idx;
            return this._applyWithArgs("Keyword", "the");
        },
        DisableCommas: function(bool) {
            var $elf = this, _fromIdx = this.input.idx;
            return this.disableCommas = bool;
        },
        addComma: function(force) {
            var $elf = this, _fromIdx = this.input.idx;
            this._pred(force || !this.disableCommas);
            return this._applyWithArgs("Keyword", ",");
        },
        CreateVar: function(identifier) {
            var $elf = this, _fromIdx = this.input.idx, identifierKey, varNumber;
            identifierKey = this._applyWithArgs("IdentifierKey", identifier);
            varNumber = this._or(function() {
                this._pred("|" !== identifierKey.slice(-1));
                this._pred(this.ruleVars[identifierKey]);
                return this.ruleVars[identifierKey];
            }, function() {
                return this.ruleVars[identifierKey] = this.ruleVarsCount++;
            });
            return [ "Variable", [ "Number", varNumber ], identifier ];
        },
        EmbedVar: function(identifier, data) {
            var $elf = this, _fromIdx = this.input.idx, identifierKey;
            identifierKey = this._applyWithArgs("IdentifierKey", identifier);
            return this.ruleVars[identifierKey] = data;
        },
        IsAtomicFormulation: function(factType, bindings) {
            var $elf = this, _fromIdx = this.input.idx, realFactType;
            realFactType = this._applyWithArgs("IsFactType", factType);
            this._pred(realFactType);
            return [ "AtomicFormulation" ].concat([ [ "FactType" ].concat(factType) ], bindings);
        },
        ClosedProjection: function(identifier, bind) {
            var $elf = this, _fromIdx = this.input.idx;
            this._apply("addThat");
            return this._or(function() {
                return this._applyWithArgs("Junction", "VerbContinuation", [ [ identifier ], [ bind ] ]);
            }, function() {
                return this._applyWithArgs("Junction", "RuleBody", [ [], [], identifier, bind ]);
            });
        },
        TermEntity: function(factType, bindings) {
            var $elf = this, _fromIdx = this.input.idx, bind, term, thatLF, varLF;
            term = this._applyWithArgs("Term", factType);
            varLF = this._applyWithArgs("CreateVar", term);
            bind = this._applyWithArgs("Bind", term, bindings);
            this._opt(function() {
                thatLF = this._applyWithArgs("ClosedProjection", term, bind);
                varLF.push(thatLF);
                return this._opt(function() {
                    this._pred(factType);
                    return this._applyWithArgs("addComma", !1);
                });
            });
            return {
                term: term,
                lf: varLF
            };
        },
        RuleBody: function(factType, bindings, parentIdentifier, parentBind) {
            var $elf = this, _fromIdx = this.input.idx, bind, data, identifier, lf, quant, termEntity;
            this._or(function() {
                quant = this._apply("Quantifier");
                termEntity = this._applyWithArgs("TermEntity", factType, bindings);
                return factType.push(termEntity.term);
            }, function() {
                this._apply("addThe");
                identifier = this._applyWithArgs("Identifier", factType);
                this._or(function() {
                    return this._applyWithArgs("Bind", identifier, bindings);
                }, function() {
                    this._applyWithArgs("EmbedVar", identifier, identifier);
                    return this._applyWithArgs("Bind", identifier, bindings);
                });
                return factType.push(identifier);
            }, function() {
                data = this._apply("Value");
                identifier = this._applyWithArgs("IsFactTypeIdentifier", [ "Term", data[0], "Type" ], factType);
                identifier.push(data);
                this._applyWithArgs("EmbedVar", identifier, data);
                bind = this._applyWithArgs("Bind", identifier, bindings);
                bind[2] = data;
                return factType.push(identifier);
            });
            lf = this._or(function() {
                return this._applyWithArgs("Junction", "VerbContinuation", [ factType, bindings, parentIdentifier, parentBind ]);
            }, function() {
                return this._applyWithArgs("IsAtomicFormulation", factType, bindings);
            });
            return null == quant ? lf : quant.concat([ termEntity.lf, lf ]);
        },
        VerbContinuation: function(factType, bindings, parentIdentifier, parentBind) {
            var $elf = this, _fromIdx = this.input.idx, v;
            v = this._applyWithArgs("Verb", factType);
            factType.push(v);
            (function() {
                if (null != parentIdentifier) {
                    factType.push(parentIdentifier);
                    bindings.push(parentBind);
                }
            }).call(this);
            return this._or(function() {
                return this._applyWithArgs("Junction", "RuleBody", [ factType, bindings ]);
            }, function() {
                return this._applyWithArgs("IsAtomicFormulation", factType, bindings);
            });
        },
        Modifier: function() {
            var $elf = this, _fromIdx = this.input.idx, r;
            this._applyWithArgs("token", "It");
            this._applyWithArgs("token", "is");
            r = this._or(function() {
                this._applyWithArgs("token", "obligatory");
                return [ "ObligationFormulation" ];
            }, function() {
                this._applyWithArgs("token", "necessary");
                return [ "NecessityFormulation" ];
            }, function() {
                this._or(function() {
                    return this._applyWithArgs("token", "prohibited");
                }, function() {
                    return this._applyWithArgs("token", "forbidden");
                });
                return [ "ObligationFormulation", [ "LogicalNegation" ] ];
            }, function() {
                this._or(function() {
                    return this._applyWithArgs("token", "impossible");
                }, function() {
                    this._applyWithArgs("token", "not");
                    return this._applyWithArgs("token", "possible");
                });
                return [ "NecessityFormulation", [ "LogicalNegation" ] ];
            }, function() {
                this._applyWithArgs("token", "possible");
                return [ "PossibilityFormulation" ];
            }, function() {
                this._applyWithArgs("token", "permitted");
                return [ "PermissibilityFormulation" ];
            });
            this._applyWithArgs("token", "that");
            return r;
        },
        Disjunction: function() {
            var $elf = this, _fromIdx = this.input.idx;
            this._applyWithArgs("Keyword", "or");
            return "Disjunction";
        },
        Conjunction: function() {
            var $elf = this, _fromIdx = this.input.idx;
            this._applyWithArgs("Keyword", "and");
            return "Conjunction";
        },
        JunctionType: function() {
            var $elf = this, _fromIdx = this.input.idx;
            return this._or(function() {
                return this._apply("Disjunction");
            }, function() {
                return this._apply("Conjunction");
            });
        },
        SerialCommaCheck: function() {
            var $elf = this, _fromIdx = this.input.idx;
            this._applyWithArgs("exactly", ",");
            return this._or(function() {
                return this._applyWithArgs("token", "and");
            }, function() {
                return this._applyWithArgs("token", "or");
            });
        },
        UpcomingCommaJunction: function() {
            var $elf = this, _fromIdx = this.input.idx;
            return this._lookahead(function() {
                return this._or(function() {
                    this._many(function() {
                        this._not(function() {
                            return this._apply("EOL");
                        });
                        this._not(function() {
                            return this._apply("SerialCommaCheck");
                        });
                        return this.anything();
                    });
                    this._apply("SerialCommaCheck");
                    return !0;
                }, function() {
                    return !1;
                });
            });
        },
        SimpleJunction: function(ruleName, args) {
            var $elf = this, _fromIdx = this.input.idx, junctioned, result, type;
            result = this._applyWithArgs.apply(this, [ ruleName ].concat(_.cloneDeep(args)));
            return this._or(function() {
                type = this._apply("JunctionType");
                junctioned = this._applyWithArgs("SimpleJunction", ruleName, args);
                return [ type, result, junctioned ];
            }, function() {
                return result;
            });
        },
        Junction: function(ruleName, args) {
            var $elf = this, _fromIdx = this.input.idx, commaSeparated, junctioned, result, type, upcoming;
            upcoming = this._apply("UpcomingCommaJunction");
            this._applyWithArgs("DisableCommas", upcoming || this.disableCommas);
            result = this._opt(function() {
                result = this._applyWithArgs("SimpleJunction", ruleName, args);
                return this._or(function() {
                    this._pred(upcoming);
                    commaSeparated = this._many(function() {
                        this._applyWithArgs("addComma", !0);
                        return this._applyWithArgs("SimpleJunction", ruleName, args);
                    });
                    this._applyWithArgs("addComma", !0);
                    type = this._apply("JunctionType");
                    junctioned = this._applyWithArgs("Junction", ruleName, args, !0);
                    return [ type, result ].concat(commaSeparated).concat([ junctioned ]);
                }, function() {
                    return result;
                });
            });
            upcoming = this._apply("UpcomingCommaJunction");
            this._applyWithArgs("DisableCommas", upcoming);
            this._pred(result);
            return result;
        },
        StartRule: function() {
            var $elf = this, _fromIdx = this.input.idx;
            return this._or(function() {
                return this._applyWithArgs("token", "R:");
            }, function() {
                return this._applyWithArgs("token", "Rule:");
            });
        },
        NewRule: function() {
            var $elf = this, _fromIdx = this.input.idx, mod, ruleLF, ruleText;
            this._apply("StartRule");
            this._apply("spaces");
            ruleText = this._lookahead(function() {
                return this._apply("toEOL");
            });
            this.ruleVars = {};
            this.ruleVarsCount = 0;
            mod = this._apply("Modifier");
            ruleLF = this._applyWithArgs("Junction", "RuleBody", [ [], [] ]);
            this._apply("EOLTerminator");
            mod = _.cloneDeep(mod);
            2 === mod.length ? mod[1][1] = ruleLF : mod[1] = ruleLF;
            return [ "Rule", mod, [ "StructuredEnglish", ruleText ] ];
        },
        StartFactType: function() {
            var $elf = this, _fromIdx = this.input.idx;
            return this._or(function() {
                return this._applyWithArgs("token", "F:");
            }, function() {
                return this._applyWithArgs("token", "Fact type:");
            });
        },
        NewFactType: function() {
            var $elf = this, _fromIdx = this.input.idx, factType, identifier, v;
            this._apply("StartFactType");
            factType = [];
            this._many1(function() {
                identifier = this._apply("Identifier");
                v = this._apply("addVerb");
                return factType.push(identifier, v);
            });
            this._opt(function() {
                identifier = this._apply("Identifier");
                return factType.push(identifier);
            });
            return function() {
                $elf.AddFactType(factType, factType);
                var attributes = [ "Attributes" ];
                if (3 === factType.length && ("has" === factType[1][1] || "is of" === factType[1][1])) {
                    synFactType = _.cloneDeep(factType);
                    synFactType.reverse();
                    "has" === synFactType[1][1] ? synFactType[1][1] = "is of" : synFactType[1][1] = "has";
                    $elf.AddFactType(synFactType, factType);
                    attributes.push([ "SynonymousForm", synFactType ]);
                }
                return [ "FactType" ].concat(factType).concat([ attributes ]);
            };
        },
        StartVocabulary: function() {
            var $elf = this, _fromIdx = this.input.idx;
            this._applyWithArgs("token", "Vocabulary:");
            return "Vocabulary";
        },
        StartTerm: function() {
            var $elf = this, _fromIdx = this.input.idx;
            this._or(function() {
                return this._applyWithArgs("token", "T:");
            }, function() {
                return this._applyWithArgs("token", "Term:");
            });
            return "Term";
        },
        StartName: function() {
            var $elf = this, _fromIdx = this.input.idx;
            this._or(function() {
                return this._applyWithArgs("token", "N:");
            }, function() {
                return this._applyWithArgs("token", "Name:");
            });
            return "Name";
        },
        NewIdentifier: function() {
            var $elf = this, _fromIdx = this.input.idx, func, identifierType;
            identifierType = this._or(function() {
                return this._apply("StartVocabulary");
            }, function() {
                return this._apply("StartTerm");
            }, function() {
                return this._apply("StartName");
            });
            this._apply("ClearSuggestions");
            func = this._applyWithArgs("AddIdentifier", identifierType);
            return function() {
                return func().concat([ [ "Attributes" ] ]);
            };
        },
        NewAttribute: function() {
            var $elf = this, _fromIdx = this.input.idx, attrName, attrValOrFunc, currentLine;
            currentLine = _.last(this.lines);
            attrName = this._applyWithArgs("AllowedAttrs", currentLine[0]);
            attrName = attrName.replace(/ /g, "");
            this._apply("spaces");
            attrValOrFunc = this._applyWithArgs("ApplyFirstExisting", [ "Attr" + attrName, "DefaultAttr" ]);
            return function() {
                var lastLine = $elf.lines.pop(), attrVal = _.isFunction(attrValOrFunc) ? attrValOrFunc(lastLine) : attrValOrFunc;
                _.last(lastLine).push([ attrName, attrVal ]);
                return lastLine;
            };
        },
        AllowedAttrs: function(termOrFactType) {
            var $elf = this, _fromIdx = this.input.idx, attrName;
            attrName = this._applyWithArgs("matchForAny", "seq", this.branches.AllowedAttrs.call(this, termOrFactType));
            return attrName.replace(":", "");
        },
        DefaultAttr: function() {
            var $elf = this, _fromIdx = this.input.idx;
            return this._apply("toSBVREOL");
        },
        AttrConceptType: function() {
            var $elf = this, _fromIdx = this.input.idx, term;
            term = this._apply("Term");
            return function(currentLine) {
                var identifier;
                if ("FactType" === currentLine[0]) {
                    var attributes = _.last(currentLine), termForm = _.find(attributes, [ 0, "TermForm" ]);
                    if (!termForm) throw new Error("Cannot have a concept type for a fact type that does not have a term-form.");
                    identifier = termForm[1];
                } else identifier = currentLine.slice(0, 3);
                var identifierName = identifier[1], identifierVocab = identifier[2];
                if ($elf.vocabularies[identifierVocab].ConceptTypes.hasOwnProperty(identifier)) throw new Error("Two concept type attributes");
                if ("FactType" !== identifier[0]) {
                    if ($elf.IdentifiersEqual(identifier, term)) throw new Error("A term cannot have itself as its concept type");
                    var termName = term[1], termVocab = term[2];
                    $elf.vocabularies[identifierVocab].ConceptTypes[identifier] = term;
                    $elf.vocabularies[termVocab].IdentifierChildren[termName].push(identifier.slice(1));
                }
                return term;
            };
        },
        AttrDefinition: function() {
            var $elf = this, _fromIdx = this.input.idx, moreValues, termEntity, value, values;
            return this._or(function() {
                this._opt(function() {
                    return this._apply("addThe");
                });
                this.ruleVars = {};
                this.ruleVarsCount = 0;
                termEntity = this._apply("TermEntity");
                this._apply("EOLTerminator");
                return function(currentLine) {
                    if ("FactType" !== currentLine[0]) {
                        $elf.vocabularies[currentLine[2]].ConceptTypes[currentLine.slice(0, 3)] = termEntity.term;
                        $elf.vocabularies[currentLine[2]].IdentifierChildren[termEntity.term[1]].push([ currentLine[1], currentLine[2] ]);
                    }
                    return termEntity.lf;
                };
            }, function() {
                value = this._apply("Value");
                values = this._many(function() {
                    this._apply("addComma");
                    return this._apply("Value");
                });
                this._or(function() {
                    return moreValues = this._many1(function() {
                        this._opt(function() {
                            return this._apply("addComma");
                        });
                        this._apply("Disjunction");
                        return this._apply("Value");
                    });
                }, function() {
                    return this._pred(0 === values.length);
                });
                return [ "Enum", value ].concat(values, moreValues);
            });
        },
        AttrGuidanceType: function() {
            var $elf = this, _fromIdx = this.input.idx;
            return this._applyWithArgs("matchForAny", "seq", this.branches.AttrGuidanceType);
        },
        AttrNecessity: function() {
            var $elf = this, _fromIdx = this.input.idx, lf, ruleText;
            return this._or(function() {
                ruleText = this._lookahead(function() {
                    return this._apply("toEOL");
                });
                this.ruleVars = {};
                this.ruleVarsCount = 0;
                lf = this._applyWithArgs("RuleBody", [], []);
                this._apply("EOLTerminator");
                return [ "Rule", [ "NecessityFormulation", lf ], [ "StructuredEnglish", "It is necessary that " + ruleText ] ];
            }, function() {
                return this._apply("toSBVREOL");
            });
        },
        AttrReferenceScheme: function() {
            var $elf = this, _fromIdx = this.input.idx, t;
            return this._or(function() {
                t = this._apply("Term");
                this._apply("EOLTerminator");
                return t;
            }, function() {
                return this._apply("toSBVREOL");
            });
        },
        AttrSynonym: function() {
            var $elf = this, _fromIdx = this.input.idx, currentLine;
            currentLine = _.last(this.lines);
            return this._applyWithArgs("AddIdentifier", currentLine[0], currentLine[1]);
        },
        AttrSynonymousForm: function() {
            var $elf = this, _fromIdx = this.input.idx, factType, identifier, v;
            factType = [];
            this._many1(function() {
                identifier = this._apply("Identifier");
                v = this._apply("addVerb");
                return factType.push(identifier, v);
            });
            this._opt(function() {
                identifier = this._apply("Identifier");
                return factType.push(identifier);
            });
            return function(currentLine) {
                $elf.AddFactType(factType, currentLine.slice(1, -1));
                return factType;
            };
        },
        AttrTermForm: function() {
            var $elf = this, _fromIdx = this.input.idx, func;
            func = this._applyWithArgs("AddIdentifier", "Term");
            return function(currentLine) {
                for (var term = func(), i = 0; i < currentLine.length; i++) if ("Term" === currentLine[i][0]) {
                    var factType = [ term, [ "Verb", "has", !1 ], currentLine[i] ];
                    $elf.AddFactType(factType, factType);
                }
                return term;
            };
        },
        StartComment: function() {
            var $elf = this, _fromIdx = this.input.idx;
            this._applyWithArgs("exactly", "-");
            this._applyWithArgs("exactly", "-");
            return "--";
        },
        NewComment: function() {
            var $elf = this, _fromIdx = this.input.idx;
            this._apply("StartComment");
            return this._apply("toEOL");
        },
        EOLTerminator: function() {
            var $elf = this, _fromIdx = this.input.idx;
            this._opt(function() {
                return this._apply("Terminator");
            });
            this._apply("spaces");
            return this._lookahead(function() {
                return this._or(function() {
                    return this._apply("EOL");
                }, function() {
                    return this._apply("end");
                });
            });
        },
        Terminator: function() {
            var $elf = this, _fromIdx = this.input.idx;
            this._apply("spaces");
            return this._applyWithArgs("Keyword", ".", !0);
        },
        space: function() {
            var $elf = this, _fromIdx = this.input.idx;
            return this._or(function() {
                return SBVRLibs._superApply(this, "space");
            }, function() {
                return this._apply("NewComment");
            });
        },
        Line: function() {
            var $elf = this, _fromIdx = this.input.idx, func, l;
            this._apply("spaces");
            l = this._or(function() {
                func = this._or(function() {
                    return this._apply("NewIdentifier");
                }, function() {
                    return this._apply("NewFactType");
                }, function() {
                    return this._apply("NewAttribute");
                });
                return func();
            }, function() {
                return this._apply("NewRule");
            });
            this._apply("ClearSuggestions");
            this.lines.push(l);
            return l;
        },
        Process: function() {
            var $elf = this, _fromIdx = this.input.idx;
            this._opt(function() {
                return this._apply("EOLSpaces");
            });
            this._opt(function() {
                return this._apply("Line");
            });
            this._many(function() {
                this._apply("EOLSpaces");
                return this._apply("Line");
            });
            this._many(function() {
                return this._apply("space");
            });
            this._apply("end");
            return this.lines;
        }
    });
    SBVRParser.ClearSuggestions = function() {};
    SBVRParser.initialize = function() {
        this.builtInVocab = "";
        this.builtInVocabInputHead = "";
        this.allowedAttrLists = _.cloneDeep(defaultAllowedAttrLists);
        this.reset();
    };
    SBVRParser._enableTokens = function() {
        SBVRLibs._enableTokens.call(this, [ "StartVocabulary", "StartTerm", "StartName", "StartFactType", "StartRule", "NewComment", "Vocabulary", "Term", "Name", "Modifier", "Verb", "Keyword", "AllowedAttrs", "AttrGuidanceType", "Number", "Value" ]);
    };
    SBVRParser._sideEffectingRules = [ "Process", "Line" ];
    SBVRParser._AddIdentifier = function(identifierType, identifier, baseSynonym) {
        null == baseSynonym && (baseSynonym = identifier);
        if ("Vocabulary" === identifierType) this.AddVocabulary(identifier, baseSynonym); else {
            var vocabulary = this.vocabularies[this.currentVocabulary];
            vocabulary.IdentifierChildren.hasOwnProperty(identifier) && this._pred(!1);
            baseSynonym === identifier ? vocabulary.IdentifierChildren[baseSynonym] = [] : vocabulary.IdentifierChildren[identifier] = vocabulary.IdentifierChildren[baseSynonym];
            vocabulary[identifierType][identifier] = baseSynonym;
        }
        this.longestIdentifier[identifierType] = Math.max(identifier.length, identifier.pluralize().length, this.longestIdentifier[identifierType]);
        return "Vocabulary" === identifierType ? [ identifierType, identifier ] : [ identifierType, identifier, this.currentVocabulary ];
    };
    SBVRParser.BaseSynonym = function(identifier) {
        var identifierType = identifier[0], identifierName = identifier[1], vocabulary = identifier[2], identifiers = this.vocabularies[vocabulary][identifierType];
        if (identifiers.hasOwnProperty(identifierName)) identifierName = identifiers[identifierName]; else {
            identifierName = identifierName.singularize();
            this._pred(identifiers.hasOwnProperty(identifierName));
            identifierName = identifiers[identifierName];
        }
        return [ identifierType, identifierName, vocabulary ];
    };
    SBVRParser.IsFactTypeIdentifier = function(identifier, factTypeSoFar) {
        var identifierType = identifier[0], vocabulary = identifier[2], baseIdentifier = this.BaseSynonym(identifier), identifiers = this.branches[identifierType].call(this, factTypeSoFar, vocabulary);
        this._pred(-1 !== identifiers.indexOf(baseIdentifier[1]));
        return baseIdentifier;
    };
    SBVRParser.IsVerb = function(factTypeSoFar, verb) {
        verb = [ "Verb", verb ];
        var currentLevel = this._traverseFactType(factTypeSoFar);
        this._pred(!1 !== currentLevel);
        if (!currentLevel.hasOwnProperty(verb)) {
            this._pred(currentLevel.hasOwnProperty("__valid"));
            return this.IsVerb([], verb);
        }
    };
    SBVRParser._verbForm = function(verb) {
        return "are" === verb ? "is" : "have" === verb ? "has" : "are " === verb.slice(0, 4) ? "is " + verb.slice(4) : verb;
    };
    SBVRParser.IsFactType = function(factType) {
        var currentLevel = this._traverseFactType(factType);
        return !1 !== currentLevel && currentLevel.__valid;
    };
    var removeRegex = new RegExp("^(?:" + [ [ "Term", "" ].toString(), [ "Name", "" ].toString(), [ "Verb", "" ].toString() ].join("|") + ")(.*?)(?:,(.*))?$"), defaultAllowedAttrLists = [ "Concept Type:", "Definition:", "Definition (Informal):", "Description:", "Dictionary Basis:", "Example:", "General Concept:", "Namespace URI:", "Necessity:", "Note:", "Possibility:", "Reference Scheme:", "See:", "Source:", "Subject Field:" ];
    defaultAllowedAttrLists = {
        Term: [ "Synonym:" ].concat(defaultAllowedAttrLists),
        Name: [ "Synonym:" ].concat(defaultAllowedAttrLists),
        FactType: [ "Synonymous Form:", "Term Form:" ].concat(defaultAllowedAttrLists),
        Rule: [ "Rule Name:", "Guidance Type:", "Source:", "Synonymous Statement:", "Note:", "Example:", "Enforcement Level:" ]
    };
    var getValidFactTypeParts = function getValidFactTypeParts(vocabulary, identifierType, factTypeSoFar) {
        var vocabularies = this.vocabularies;
        if (null == factTypeSoFar || 0 === factTypeSoFar.length) {
            var identifiers;
            identifiers = null == vocabulary ? vocabularies[this.currentVocabulary][identifierType] : vocabularies[vocabulary][identifierType];
            return _.keys(identifiers);
        }
        var factTypePart, currentLevel = this._traverseFactType(factTypeSoFar), factTypeParts = {}, followChildrenChain = function(vocabulary, identifier) {
            vocabulary = vocabularies[vocabulary];
            var identifiers = vocabulary[identifierType];
            identifiers.hasOwnProperty(identifier) && (factTypeParts[identifiers[identifier]] = !0);
            for (var i = 0; i < vocabulary.IdentifierChildren[identifier].length; i++) {
                var child = vocabulary.IdentifierChildren[identifier][i];
                followChildrenChain(child[1], child[0]);
            }
        };
        for (factTypePart in currentLevel) if (currentLevel.hasOwnProperty(factTypePart)) {
            var matches = removeRegex.exec(factTypePart), factTypePartVocabulary;
            if (null != matches) {
                factTypePart = matches[1];
                if (matches[2]) {
                    factTypePartVocabulary = matches[2];
                    followChildrenChain(factTypePartVocabulary, factTypePart);
                } else factTypeParts[factTypePart] = !0;
            }
        }
        return _.keys(factTypeParts);
    };
    SBVRParser.reset = function() {
        SBVRLibs.initialize.call(this);
        this.branches = {
            ClearSuggestions: [],
            StartVocabulary: [ "Vocabulary:" ],
            StartTerm: [ "Term:      " ],
            StartName: [ "Name:      " ],
            StartFactType: [ "Fact type: " ],
            StartRule: [ "Rule:      " ],
            Vocabulary: function(factTypeSoFar) {
                return _.keys(this.vocabularies);
            },
            Term: function(factTypeSoFar, vocabulary) {
                return getValidFactTypeParts.call(this, vocabulary, "Term", factTypeSoFar);
            },
            Name: function(factTypeSoFar, vocabulary) {
                return getValidFactTypeParts.call(this, vocabulary, "Name", factTypeSoFar);
            },
            Verb: function(factTypeSoFar, vocabulary) {
                return !0 === factTypeSoFar ? [] : getValidFactTypeParts.call(this, vocabulary, "Verb", factTypeSoFar);
            },
            AllowedAttrs: function(termOrFactType) {
                return this.allowedAttrLists.hasOwnProperty(termOrFactType) ? this.allowedAttrLists[termOrFactType] : null == termOrFactType ? this.allowedAttrLists.Term.concat(this.allowedAttrLists.Name, this.allowedAttrLists.FactType) : [];
            },
            AttrGuidanceType: [ "operative business rule", "structural business rule", "advice of permission", "advice of possibility", "advice of optionality", "advice of contingency" ],
            Modifier: [ "It is obligatory that", "It is necessary that", "It is prohibited that", "It is forbidden that", "It is impossible that", "It is not possible that", "It is possible that", "It is permitted that" ],
            Quantifier: [ "each", "a", "an", "some", "at most", "at least", "more than", "exactly", "no" ],
            JoiningQuantifier: [ "and at most" ],
            Number: [ "1", "2", "3", "4", "5", "6", "7", "8", "9", "one" ],
            addThat: [ "that", "that the" ],
            addThe: [ "the" ],
            addComma: [ "," ],
            Disjunction: [ "or" ],
            Conjunction: [ "and" ],
            Terminator: [ "." ]
        };
        this.longestIdentifier = {
            Vocabulary: 0,
            Term: 0,
            Name: 0
        };
        this.ruleVars = {};
        this.ruleVarsCount = 0;
        this.lines = [ "Model" ];
        this.disableCommas = !1;
        var origInputHead = this.inputHead;
        if ("" !== this.builtInVocab) {
            this.inputHead = this.builtInVocabInputHead;
            this.matchAll(this.builtInVocab, "Process");
            this.builtInVocabInputHead = this.inputHead;
        }
        this.inputHead = null;
        this.inputHead = null;
        this.matchAll("Vocabulary: Default", "Process");
        this.inputHead = origInputHead;
    };
    SBVRParser.AddBuiltInVocab = function(vocabulary) {
        try {
            var origInputHead = this.inputHead;
            vocabulary += "\n";
            this.matchAll(vocabulary, "Process");
            this.inputHead = origInputHead;
            this.builtInVocab += vocabulary;
        } catch (e) {
            throw e;
        } finally {
            this.reset();
        }
    };
    SBVRParser.AddCustomAttribute = function(attributeName, attachedTo) {
        if (null == attachedTo) for (attachedTo in this.allowedAttrLists) this.allowedAttrLists.hasOwnProperty(attachedTo) && this.allowedAttrLists[attachedTo].push(attributeName); else {
            if (!this.allowedAttrLists.hasOwnProperty(attachedTo)) throw new Error("Unknown attachment");
            this.allowedAttrLists[attachedTo].push(attributeName);
        }
    };
    SBVRParser.matchForAny = function(rule, arr) {
        for (var $elf = this, origInput = this.input, ref = {}, result = ref, idx = 0; idx < arr.length; idx++) {
            try {
                $elf.input = origInput;
                result = $elf._applyWithArgs.call($elf, rule, arr[idx]);
            } catch (e) {
                if (!(e instanceof SyntaxError)) throw e;
            }
            if (result !== ref) return result;
        }
        throw this._fail();
    };
    SBVRParser.matchForAll = function(rule, arr) {
        for (var idx = 0; idx < arr.length; idx++) this._applyWithArgs.call(this, rule, arr[idx]);
    };
    SBVRParser.exactly = function(wanted) {
        if (wanted.toLowerCase() === this._apply("lowerCaseAnything")) return wanted;
        throw this._fail();
    };
    SBVRParser._disablePrependingInput();
});