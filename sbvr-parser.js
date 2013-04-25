(function(root, factory) {
    "function" == typeof define && define.amd ? define([ "require", "exports", "ometa-core" ], factory) : "object" == typeof exports ? factory(require, exports, require("ometa-js").core) : factory(function(moduleName) {
        return root[moduleName];
    }, root, root.OMeta);
})(this, function(require, exports, OMeta) {
    var SBVRLibs = require("./sbvr-libs").SBVRLibs, _ = require("lodash");
    require("./inflection");
    var SBVRParser = exports.SBVRParser = SBVRLibs._extend({
        EOL: function() {
            var $elf = this, _fromIdx = this.input.idx;
            return function() {
                switch (this._apply("anything")) {
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
        Bind: function(identifier, bindings) {
            var $elf = this, _fromIdx = this.input.idx, binding, varNumber;
            varNumber = this.ruleVars[identifier];
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
                        return function() {
                            switch (this._apply("anything")) {
                              case "\\":
                                return this._applyWithArgs("exactly", '"');

                              default:
                                throw this._fail();
                            }
                        }.call(this);
                    }, function() {
                        this._not(function() {
                            return this._applyWithArgs("exactly", '"');
                        });
                        return this._apply("anything");
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
                        return function() {
                            switch (this._apply("anything")) {
                              case "'":
                                return function() {
                                    this._apply("InformalIdentifier");
                                    return this._applyWithArgs("exactly", "'");
                                }.call(this);

                              default:
                                throw this._fail();
                            }
                        }.call(this);
                    }, function() {
                        return this._many1(function() {
                            this._not(function() {
                                return this._apply("space");
                            });
                            return this._apply("anything");
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
                    return this._apply("anything");
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
            var $elf = this, _fromIdx = this.input.idx, identifier;
            identifier = this._lookahead(function() {
                return this._many1(function() {
                    return this._apply("IdentifierPart");
                });
            });
            identifier = identifier.join(" ");
            this._applyWithArgs("_AddIdentifier", identifierType, identifier, baseSynonym);
            return this._applyWithArgs("apply", identifierType);
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
            var $elf = this, _fromIdx = this.input.idx, factTypeIdentifier, identifierSoFar, part, vocabulary;
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
                factTypeIdentifier = this._applyWithArgs("IsFactTypeIdentifier", vocabulary, identifierType, factTypeSoFar, identifierSoFar);
                this._pred(factTypeIdentifier !== !1);
                return [ identifierType, factTypeIdentifier, vocabulary ];
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
                return function() {
                    switch (this._apply("anything")) {
                      case ")":
                        return ")";

                      default:
                        throw this._fail();
                    }
                }.call(this);
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
                        return function() {
                            switch (this._apply("anything")) {
                              case "-":
                                return "-";

                              default:
                                throw this._fail();
                            }
                        }.call(this);
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
                this._applyWithArgs("Keyword", "isn't");
                verbSoFar = "is";
                return negated = !0;
            });
            part = this._apply("VerbPart");
            verbSoFar = this._or(function() {
                this._pred(verbSoFar);
                return verbSoFar + " " + part;
            }, function() {
                return part;
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
                    return this._pred(factTypeSoFar === !0);
                }, function() {
                    return this._pred(this.isVerb(factTypeSoFar, verbSoFar));
                });
                verb = [ "Verb", this._verbForm(verbSoFar) ];
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
                this._pred(noToken === !0);
                return this._applyWithArgs("seq", word);
            }, function() {
                this._pred(noToken !== !0);
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
        addComma: function() {
            var $elf = this, _fromIdx = this.input.idx;
            return this._applyWithArgs("Keyword", ",");
        },
        addOr: function() {
            var $elf = this, _fromIdx = this.input.idx;
            return this._applyWithArgs("Keyword", "or");
        },
        CreateVar: function(identifier) {
            var $elf = this, _fromIdx = this.input.idx, varNumber;
            varNumber = this.ruleVars[identifier] = this.ruleVarsCount++;
            return [ "Variable", [ "Number", varNumber ], identifier ];
        },
        EmbedVar: function(identifier, data) {
            var $elf = this, _fromIdx = this.input.idx;
            return this.ruleVars[identifier] = data;
        },
        IsAtomicFormulation: function(factType, bindings) {
            var $elf = this, _fromIdx = this.input.idx, realFactType;
            realFactType = this._applyWithArgs("IsFactType", factType);
            this._pred(realFactType);
            return [ "AtomicFormulation" ].concat([ [ "FactType" ].concat(factType) ], bindings);
        },
        ClosedProjection: function(identifier, bind) {
            var $elf = this, _fromIdx = this.input.idx, factType, verb;
            this._apply("addThat");
            return this._or(function() {
                factType = [ identifier ];
                verb = this._applyWithArgs("Verb", factType);
                factType.push(verb);
                return this._or(function() {
                    return this._applyWithArgs("RuleBody", factType, [ bind ]);
                }, function() {
                    return this._applyWithArgs("IsAtomicFormulation", factType, [ bind ]);
                });
            }, function() {
                return this._applyWithArgs("RuleBody", [], [], identifier, bind);
            });
        },
        RuleBody: function(factType, bindings, parentIdentifier, parentBind) {
            var $elf = this, _fromIdx = this.input.idx, bind, data, factTypeIdentifier, identifier, lf, quant, t, tVar, thatLF, v;
            this._or(function() {
                quant = this._apply("Quantifier");
                t = this._applyWithArgs("Term", factType);
                tVar = this._applyWithArgs("CreateVar", t);
                bind = this._applyWithArgs("Bind", t, bindings);
                factType.push(t);
                return this._opt(function() {
                    thatLF = this._applyWithArgs("ClosedProjection", t, bind);
                    tVar.push(thatLF);
                    return this._opt(function() {
                        return this._apply("addComma");
                    });
                });
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
                factTypeIdentifier = this._applyWithArgs("IsFactTypeIdentifier", "Type", "Term", factType, data[0]);
                this._pred(factTypeIdentifier !== !1);
                identifier = [ "Term", factTypeIdentifier, "Type", data ];
                this._applyWithArgs("EmbedVar", identifier, data);
                bind = this._applyWithArgs("Bind", identifier, bindings);
                bind[2] = data;
                return factType.push(identifier);
            });
            lf = this._or(function() {
                v = this._applyWithArgs("Verb", factType);
                factType.push(v);
                (function() {
                    if (null != parentIdentifier) {
                        factType.push(parentIdentifier);
                        bindings.push(parentBind);
                    }
                }).call(this);
                return this._or(function() {
                    return this._applyWithArgs("RuleBody", factType, bindings);
                }, function() {
                    return this._applyWithArgs("IsAtomicFormulation", factType, bindings);
                });
            }, function() {
                return this._applyWithArgs("IsAtomicFormulation", factType, bindings);
            });
            return null == quant ? lf : quant.concat([ tVar, lf ]);
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
                this._applyWithArgs("token", "prohibited");
                return [ "ObligationFormulation", [ "LogicalNegation" ] ];
            }, function() {
                this._applyWithArgs("token", "impossible");
                return [ "NecessityFormulation", [ "LogicalNegation" ] ];
            }, function() {
                this._applyWithArgs("token", "not");
                this._applyWithArgs("token", "possible");
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
            this.ruleVarsCount = 0;
            mod = this._apply("Modifier");
            ruleLF = this._applyWithArgs("RuleBody", [], []);
            this._apply("EOLTerminator");
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
            this._applyWithArgs("AddFactType", factType, factType);
            factType.push([ "Attributes" ]);
            return [ "FactType" ].concat(factType);
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
            var $elf = this, _fromIdx = this.input.idx, identifier, identifierType;
            identifierType = this._or(function() {
                return this._apply("StartVocabulary");
            }, function() {
                return this._apply("StartTerm");
            }, function() {
                return this._apply("StartName");
            });
            this._apply("ClearSuggestions");
            identifier = this._applyWithArgs("AddIdentifier", identifierType);
            identifier.push([ "Attributes" ]);
            return identifier;
        },
        NewAttribute: function() {
            var $elf = this, _fromIdx = this.input.idx, attrName, attrVal, currentLine;
            currentLine = this.lines[this.lines.length - 1];
            attrName = this._applyWithArgs("AllowedAttrs", currentLine[0]);
            attrName = attrName.replace(/ /g, "");
            this._apply("spaces");
            attrVal = this._applyWithArgs("ApplyFirstExisting", [ "Attr" + attrName, "DefaultAttr" ], [ currentLine ]);
            return function() {
                var lastLine = this.lines.pop();
                lastLine[lastLine.length - 1].push([ attrName, attrVal ]);
                return lastLine;
            }.call(this);
        },
        AllowedAttrs: function(termOrFactType) {
            var $elf = this, _fromIdx = this.input.idx, attrName;
            attrName = this._applyWithArgs("matchForAny", "seq", this.branches.AllowedAttrs.call(this, termOrFactType));
            return attrName.replace(":", "");
        },
        DefaultAttr: function(currentLine) {
            var $elf = this, _fromIdx = this.input.idx;
            return this._apply("toSBVREOL");
        },
        AttrConceptType: function(currentLine) {
            var $elf = this, _fromIdx = this.input.idx, identifier, identifierName, identifierVocab, term, termName, termVocab;
            identifierName = currentLine[1];
            identifierVocab = currentLine[2];
            identifier = currentLine.slice(0, 3);
            this._pred(!this.vocabularies[identifierVocab].ConceptTypes.hasOwnProperty(identifier));
            term = this._apply("Term");
            this._or(function() {
                return this._pred("FactType" === currentLine[0]);
            }, function() {
                termName = term[1];
                termVocab = term[2];
                this._pred(identifierName != termName || identifierVocab != termVocab);
                this.vocabularies[identifierVocab].ConceptTypes[identifier] = term;
                return this.vocabularies[termVocab].IdentifierChildren[termName].push([ identifierName, identifierVocab ]);
            });
            return term;
        },
        AttrDefinition: function(currentLine) {
            var $elf = this, _fromIdx = this.input.idx, b, moreValues, tVar, term, thatLF, value, values;
            return this._or(function() {
                this._opt(function() {
                    return this._apply("addThe");
                });
                this.ruleVarsCount = 0;
                term = this._apply("Term");
                tVar = this._applyWithArgs("CreateVar", term);
                b = this._applyWithArgs("Bind", term);
                thatLF = this._applyWithArgs("ClosedProjection", term, b);
                tVar.push(thatLF);
                this._opt(function() {
                    return this._or(function() {
                        return this._pred("FactType" === currentLine[0]);
                    }, function() {
                        this.vocabularies[currentLine[2]].ConceptTypes[currentLine.slice(0, 3)] = term;
                        return this.vocabularies.IdentifierChildren[term[1]].push([ currentLine[1], currentLine[2] ]);
                    });
                });
                return tVar;
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
                        this._apply("addOr");
                        return this._apply("Value");
                    });
                }, function() {
                    return this._pred(0 === values.length);
                });
                return [ "Enum", value ].concat(values, moreValues);
            });
        },
        AttrGuidanceType: function(currentLine) {
            var $elf = this, _fromIdx = this.input.idx;
            return this._applyWithArgs("matchForAny", "seq", this.branches.AttrGuidanceType);
        },
        AttrNecessity: function(currentLine) {
            var $elf = this, _fromIdx = this.input.idx, lf, ruleText;
            return this._or(function() {
                ruleText = this._lookahead(function() {
                    return this._apply("toEOL");
                });
                this.ruleVarsCount = 0;
                lf = this._applyWithArgs("RuleBody", [], []);
                this._apply("EOLTerminator");
                return [ "Rule", [ "NecessityFormulation", lf ], [ "StructuredEnglish", "It is necessary that " + ruleText ] ];
            }, function() {
                return this._apply("toSBVREOL");
            });
        },
        AttrReferenceScheme: function(currentLine) {
            var $elf = this, _fromIdx = this.input.idx, t;
            return this._or(function() {
                t = this._apply("Term");
                this._apply("EOLTerminator");
                return t;
            }, function() {
                return this._apply("toSBVREOL");
            });
        },
        AttrSynonym: function(currentLine) {
            var $elf = this, _fromIdx = this.input.idx;
            return this._applyWithArgs("AddIdentifier", currentLine[0], currentLine[1]);
        },
        AttrSynonymousForm: function(currentLine) {
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
            this._applyWithArgs("AddFactType", factType, currentLine.slice(1, -1));
            return factType;
        },
        AttrTermForm: function(currentLine) {
            var $elf = this, _fromIdx = this.input.idx, term;
            term = this._applyWithArgs("AddIdentifier", "Term");
            (function() {
                for (var i = 0; currentLine.length > i; i++) if ("Term" === currentLine[i][0]) {
                    var factType = [ term, [ "Verb", "has", !1 ], currentLine[i] ];
                    this.AddFactType(factType, factType);
                }
            }).call(this);
            return term;
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
        Line: function() {
            var $elf = this, _fromIdx = this.input.idx, l;
            this._apply("spaces");
            return this._or(function() {
                l = this._or(function() {
                    return this._apply("NewIdentifier");
                }, function() {
                    return this._apply("NewFactType");
                }, function() {
                    return this._apply("NewRule");
                }, function() {
                    return this._apply("NewAttribute");
                });
                this._apply("ClearSuggestions");
                this.lines.push(l);
                return l;
            }, function() {
                return this._apply("NewComment");
            });
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
    SBVRParser._sideEffectingRules = [ "Process", "Line", "NewIdentifier", "AddIdentifier", "NewFactType", "AddFactType", "NewAttribute", "AttrConceptType", "AttrDefinition", "AttrSynonym", "AttrSynonymousForm", "AttrTermForm", "Modifier" ];
    SBVRParser._AddIdentifier = function(identifierType, identifier, baseSynonym) {
        null == baseSynonym && (baseSynonym = identifier);
        if ("Vocabulary" === identifierType) this.AddVocabulary(identifier, baseSynonym); else {
            var vocabulary = this.vocabularies[this.currentVocabulary];
            vocabulary.IdentifierChildren.hasOwnProperty(identifier) && this._pred(!1);
            baseSynonym === identifier ? vocabulary.IdentifierChildren[baseSynonym] = [] : vocabulary.IdentifierChildren[baseSynonym].push([ identifier, this.currentVocabulary ]);
            vocabulary[identifierType][identifier] = baseSynonym;
        }
        this.longestIdentifier[identifierType] = Math.max(identifier.length, identifier.pluralize().length, this.longestIdentifier[identifierType]);
    };
    SBVRParser.BaseSynonym = function(vocabulary, identifierType, identifier) {
        var identifiers = this.vocabularies[vocabulary][identifierType];
        if (identifiers.hasOwnProperty(identifier)) return identifiers[identifier];
        identifier = identifier.singularize();
        return identifiers.hasOwnProperty(identifier) ? identifiers[identifier] : !1;
    };
    SBVRParser.IsFactTypeIdentifier = function(vocabulary, identifierType, factTypeSoFar, identifier) {
        identifier = this.BaseSynonym(vocabulary, identifierType, identifier);
        if (identifier === !1) return !1;
        var identifiers = this.branches[identifierType].call(this, factTypeSoFar, vocabulary);
        return -1 !== identifiers.indexOf(identifier) ? identifier : !1;
    };
    SBVRParser.isVerb = function(factTypeSoFar, verb) {
        verb = [ "Verb", this._verbForm(verb) ];
        var currentLevel = this._traverseFactType(factTypeSoFar);
        return currentLevel === !1 ? !1 : currentLevel.hasOwnProperty(verb) ? !0 : currentLevel.hasOwnProperty("__valid") ? this.isVerb([], verb) : !1;
    };
    SBVRParser._verbForm = function(verb) {
        return "are " === verb.slice(0, 4) ? "is " + verb.slice(4) : "are" === verb ? "is" : "have" === verb ? "has" : verb;
    };
    SBVRParser.IsFactType = function(factType) {
        var currentLevel = this._traverseFactType(factType);
        return currentLevel === !1 ? !1 : currentLevel.__valid;
    };
    var removeRegex = RegExp("^(?:" + [ "" + [ "Term", "" ], "" + [ "Name", "" ], "" + [ "Verb", "" ] ].join("|") + ")(.*?)(?:,(.*))?$"), defaultAllowedAttrLists = [ "Concept Type:", "Definition:", "Definition (Informal):", "Description:", "Dictionary Basis:", "Example:", "General Concept:", "Namespace URI:", "Necessity:", "Note:", "Possibility:", "Reference Scheme:", "See:", "Source:", "Subject Field:" ];
    defaultAllowedAttrLists = {
        Term: [ "Synonym:" ].concat(defaultAllowedAttrLists),
        Name: [ "Synonym:" ].concat(defaultAllowedAttrLists),
        FactType: [ "Synonymous Form:", "Term Form:" ].concat(defaultAllowedAttrLists),
        Rule: [ "Rule Name:", "Guidance Type:", "Source:", "Synonymous Statement:", "Note:", "Example:", "Enforcement Level:" ]
    };
    var getValidFactTypeParts = function(vocabulary, identifierType, factTypeSoFar) {
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
            for (var i = 0; vocabulary.IdentifierChildren[identifier].length > i; i++) {
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
                return getValidFactTypeParts.call(this, vocabulary, "Verb", factTypeSoFar);
            },
            AllowedAttrs: function(termOrFactType) {
                return this.allowedAttrLists.hasOwnProperty(termOrFactType) ? this.allowedAttrLists[termOrFactType] : null == termOrFactType ? this.allowedAttrLists.Term.concat(this.allowedAttrLists.Name, this.allowedAttrLists.FactType) : [];
            },
            AttrGuidanceType: [ "operative business rule", "structural business rule", "advice of permission", "advice of possibility", "advice of optionality", "advice of contingency" ],
            Modifier: [ "It is obligatory that", "It is necessary that", "It is prohibited that", "It is impossible that", "It is not possible that", "It is possible that", "It is permitted that" ],
            Quantifier: [ "each", "a", "an", "some", "at most", "at least", "more than", "exactly", "no" ],
            JoiningQuantifier: [ "and at most" ],
            Number: [ "1", "2", "3", "4", "5", "6", "7", "8", "9", "one" ],
            addThat: [ "that", "that the" ],
            addThe: [ "the" ],
            addComma: [ "," ],
            addOr: [ "or" ],
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
        var origInputHead = this.inputHead;
        if ("" !== this.builtInVocab) {
            this.inputHead = this.builtInVocabInputHead;
            this.matchAll(this.builtInVocab, "Process");
            this.builtInVocabInputHead = this.inputHead;
        }
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
            if (!this.allowedAttrLists.hasOwnProperty(attachedTo)) throw "Unknown attachment";
            this.allowedAttrLists[attachedTo].push(attributeName);
        }
    };
    SBVRParser.matchForAny = function(rule, arr) {
        for (var $elf = this, origInput = this.input, ref = {}, result = ref, idx = 0; arr.length > idx; idx++) {
            try {
                $elf.input = origInput;
                result = $elf._applyWithArgs.call($elf, rule, arr[idx]);
            } catch (e) {
                if (!(e instanceof SyntaxError)) throw e;
            } finally {}
            if (result !== ref) return result;
        }
        throw this._fail();
    };
    SBVRParser.matchForAll = function(rule, arr) {
        for (var idx = 0; arr.length > idx; idx++) this._applyWithArgs.call(this, rule, arr[idx]);
    };
    SBVRParser.exactly = function(wanted) {
        if (wanted.toLowerCase() === this._apply("lowerCaseAnything")) return wanted;
        throw this._fail();
    };
    SBVRParser.lowerCaseAnything = function() {
        return this._apply("anything").toLowerCase();
    };
    SBVRParser._disablePrependingInput();
});