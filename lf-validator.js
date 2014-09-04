!function(root, factory) {
    "function" == typeof define && define.amd ? define([ "require", "exports", "ometa-core", "./sbvr-libs" ], factory) : "object" == typeof exports ? factory(require, exports, require("ometa-js").core) : factory(function(moduleName) {
        return root[moduleName];
    }, root, root.OMeta);
}(this, function(require, exports, OMeta) {
    var SBVRLibs = require("./sbvr-libs").SBVRLibs, LFValidator = exports.LFValidator = SBVRLibs._extend({
        trans: function() {
            var $elf = this, _fromIdx = this.input.idx, a, t;
            this._form(function() {
                t = this.anything();
                return a = this._applyWithArgs("apply", t);
            });
            return a;
        },
        token: function(x) {
            var $elf = this, _fromIdx = this.input.idx, a, t;
            this._form(function() {
                t = this.anything();
                this._pred(t == x);
                return a = this._applyWithArgs("apply", x);
            });
            return a;
        },
        letters: function() {
            var $elf = this, _fromIdx = this.input.idx, l;
            l = this._many1(function() {
                return this._apply("letter");
            });
            this._many(function() {
                return this._apply("space");
            });
            return l.join("");
        },
        Number: function() {
            var $elf = this, _fromIdx = this.input.idx, n;
            n = this._apply("number");
            this._pred(!isNaN(n));
            return [ "Number", parseInt(n, 10) ];
        },
        Model: function() {
            var $elf = this, _fromIdx = this.input.idx, x, xs;
            xs = [];
            this._many(function() {
                x = this._or(function() {
                    return this._applyWithArgs("token", "Vocabulary");
                }, function() {
                    return this._applyWithArgs("token", "Term");
                }, function() {
                    return this._applyWithArgs("token", "Name");
                }, function() {
                    return this._applyWithArgs("token", "FactType");
                }, function() {
                    return this._applyWithArgs("token", "Rule");
                });
                return this._opt(function() {
                    this._pred(null != x);
                    return xs.push(x);
                });
            });
            return [ "Model" ].concat(xs);
        },
        FactType: function() {
            var $elf = this, _fromIdx = this.input.idx, attrs, factType, identifier, verb;
            factType = [];
            this._many(function() {
                identifier = this._or(function() {
                    return this._applyWithArgs("token", "Term");
                }, function() {
                    return this._applyWithArgs("token", "Name");
                });
                verb = this._applyWithArgs("token", "Verb");
                return factType = factType.concat([ identifier, verb ]);
            });
            this._opt(function() {
                identifier = this._or(function() {
                    return this._applyWithArgs("token", "Term");
                }, function() {
                    return this._applyWithArgs("token", "Name");
                });
                return factType.push(identifier);
            });
            this._opt(function() {
                return this._lookahead(function() {
                    attrs = this.anything();
                    return this._applyWithArgs("AddFactType", factType, factType);
                });
            });
            return this._applyWithArgs("addAttributes", [ "FactType" ].concat(factType));
        },
        Vocabulary: function() {
            var $elf = this, _fromIdx = this.input.idx, vocab;
            vocab = this.anything();
            this._applyWithArgs("AddVocabulary", vocab, vocab);
            return this._applyWithArgs("addAttributes", [ "Vocabulary", vocab ]);
        },
        Term: function() {
            var $elf = this, _fromIdx = this.input.idx, data, term, vocab;
            term = this.anything();
            vocab = this.anything();
            return this._or(function() {
                data = this._or(function() {
                    return this._applyWithArgs("token", "Number");
                }, function() {
                    return this._apply("Value");
                });
                return [ "Term", term, vocab, data ];
            }, function() {
                return this._applyWithArgs("addAttributes", [ "Term", term, vocab ]);
            });
        },
        Name: function() {
            var $elf = this, _fromIdx = this.input.idx, name, vocab;
            name = this.anything();
            vocab = this.anything();
            return this._applyWithArgs("addAttributes", [ "Name", name, vocab ]);
        },
        Verb: function() {
            var $elf = this, _fromIdx = this.input.idx, negated, v;
            v = this.anything();
            negated = this._or(function() {
                return this._apply("true");
            }, function() {
                return this._apply("false");
            });
            return [ "Verb", v, negated ];
        },
        Disjunction: function() {
            var $elf = this, _fromIdx = this.input.idx, xs;
            xs = this._many(function() {
                return this._apply("trans");
            });
            return [ "Disjunction" ].concat(xs);
        },
        Conjunction: function() {
            var $elf = this, _fromIdx = this.input.idx, xs;
            xs = this._many(function() {
                return this._apply("trans");
            });
            return [ "Conjunction" ].concat(xs);
        },
        Rule: function() {
            var $elf = this, _fromIdx = this.input.idx, t, x;
            x = this._or(function() {
                return this._applyWithArgs("token", "ObligationFormulation");
            }, function() {
                return this._applyWithArgs("token", "NecessityFormulation");
            }, function() {
                return this._applyWithArgs("token", "PossibilityFormulation");
            }, function() {
                return this._applyWithArgs("token", "PermissibilityFormulation");
            });
            t = this._applyWithArgs("token", "StructuredEnglish");
            return [ "Rule", x, t ];
        },
        addAttributes: function(termOrFactType) {
            var $elf = this, _fromIdx = this.input.idx, attrName, attrVal, attrs, attrsFound;
            this._or(function() {
                return this._apply("end");
            }, function() {
                attrsFound = {};
                attrs = [ "Attributes" ];
                this._form(function() {
                    this._applyWithArgs("exactly", "Attributes");
                    this._many(function() {
                        return this._form(function() {
                            attrName = this.anything();
                            attrVal = this._applyWithArgs("ApplyFirstExisting", [ "Attr" + attrName, "DefaultAttr" ], [ termOrFactType ]);
                            return this._opt(function() {
                                this._pred(null != attrVal);
                                attrsFound[attrName] = attrVal;
                                return attrs.push([ attrName, attrVal ]);
                            });
                        });
                    });
                    return this._apply("end");
                });
                return this._applyWithArgs("defaultAttributes", termOrFactType, attrsFound, attrs);
            });
            return termOrFactType;
        },
        DefaultAttr: function(tableID) {
            var $elf = this, _fromIdx = this.input.idx;
            return this.anything();
        },
        AttrConceptType: function(termOrFactType) {
            var $elf = this, _fromIdx = this.input.idx, conceptType, term, vocab;
            term = this._form(function() {
                this._applyWithArgs("exactly", "Term");
                conceptType = this.anything();
                return vocab = this.anything();
            });
            this.vocabularies[this.currentVocabulary].ConceptTypes[termOrFactType] = term;
            return term;
        },
        AttrDefinition: function(termOrFactType) {
            var $elf = this, _fromIdx = this.input.idx, values;
            return this._or(function() {
                return this._form(function() {
                    this._applyWithArgs("exactly", "Enum");
                    return values = this._many1(function() {
                        return this.anything();
                    });
                });
            }, function() {
                return this._apply("trans");
            });
        },
        AttrNecessity: function(termOrFactType) {
            var $elf = this, _fromIdx = this.input.idx;
            return this._or(function() {
                return this._applyWithArgs("token", "Rule");
            }, function() {
                return this._apply("DefaultAttr");
            });
        },
        AttrSynonymousForm: function(factType) {
            var $elf = this, _fromIdx = this.input.idx, synForm;
            synForm = this.anything();
            this._applyWithArgs("AddFactType", synForm, factType.slice(1));
            return synForm;
        },
        StructuredEnglish: function() {
            var $elf = this, _fromIdx = this.input.idx, a;
            a = this.anything();
            return [ "StructuredEnglish", a ];
        },
        ObligationFormulation: function() {
            var $elf = this, _fromIdx = this.input.idx, xs;
            xs = this._many(function() {
                return this._apply("trans");
            });
            return [ "ObligationFormulation" ].concat(xs);
        },
        NecessityFormulation: function() {
            var $elf = this, _fromIdx = this.input.idx, xs;
            xs = this._many(function() {
                return this._apply("trans");
            });
            return [ "NecessityFormulation" ].concat(xs);
        },
        PossibilityFormulation: function() {
            var $elf = this, _fromIdx = this.input.idx, xs;
            xs = this._many(function() {
                return this._apply("trans");
            });
            return [ "PossibilityFormulation" ].concat(xs);
        },
        PermissibilityFormulation: function() {
            var $elf = this, _fromIdx = this.input.idx, xs;
            xs = this._many(function() {
                return this._apply("trans");
            });
            return [ "PermissibilityFormulation" ].concat(xs);
        },
        LogicalNegation: function() {
            var $elf = this, _fromIdx = this.input.idx, xs;
            xs = this._apply("trans");
            return [ "LogicalNegation" ].concat([ xs ]);
        },
        quant: function() {
            var $elf = this, _fromIdx = this.input.idx, x;
            return this._or(function() {
                return this._applyWithArgs("token", "Disjunction");
            }, function() {
                return this._applyWithArgs("token", "Conjunction");
            }, function() {
                return this._applyWithArgs("token", "UniversalQuantification");
            }, function() {
                return this._applyWithArgs("token", "ExistentialQuantification");
            }, function() {
                return this._applyWithArgs("token", "ExactQuantification");
            }, function() {
                return this._applyWithArgs("token", "AtMostNQuantification");
            }, function() {
                return this._applyWithArgs("token", "AtLeastNQuantification");
            }, function() {
                return this._applyWithArgs("token", "NumericalRangeQuantification");
            }, function() {
                this._form(function() {
                    this._applyWithArgs("exactly", "LogicalNegation");
                    return x = this._apply("quant");
                });
                return [ "LogicalNegation", x ];
            });
        },
        UniversalQuantification: function() {
            var $elf = this, _fromIdx = this.input.idx, v, xs;
            v = this._applyWithArgs("token", "Variable");
            xs = this._many(function() {
                return this._apply("trans");
            });
            return [ "UniversalQuantification", v ].concat(xs);
        },
        ExistentialQuantification: function() {
            var $elf = this, _fromIdx = this.input.idx, v, xs;
            v = this._applyWithArgs("token", "Variable");
            xs = this._many(function() {
                return this._apply("trans");
            });
            return [ "ExistentialQuantification", v ].concat(xs);
        },
        ExactQuantification: function() {
            var $elf = this, _fromIdx = this.input.idx, i, v, xs;
            i = this._applyWithArgs("token", "Cardinality");
            v = this._applyWithArgs("token", "Variable");
            xs = this._many(function() {
                return this._apply("trans");
            });
            return [ "ExactQuantification", i, v ].concat(xs);
        },
        AtMostNQuantification: function() {
            var $elf = this, _fromIdx = this.input.idx, a, v, xs;
            a = this._applyWithArgs("token", "MaximumCardinality");
            v = this._applyWithArgs("token", "Variable");
            xs = this._many(function() {
                return this._apply("trans");
            });
            return [ "AtMostNQuantification", a, v ].concat(xs);
        },
        AtLeastNQuantification: function() {
            var $elf = this, _fromIdx = this.input.idx, i, v, xs;
            i = this._applyWithArgs("token", "MinimumCardinality");
            v = this._applyWithArgs("token", "Variable");
            xs = this._many(function() {
                return this._apply("trans");
            });
            return [ "AtLeastNQuantification", i, v ].concat(xs);
        },
        NumericalRangeQuantification: function() {
            var $elf = this, _fromIdx = this.input.idx, a, i, v, xs;
            i = this._applyWithArgs("token", "MinimumCardinality");
            a = this._applyWithArgs("token", "MaximumCardinality");
            v = this._applyWithArgs("token", "Variable");
            xs = this._many(function() {
                return this._apply("trans");
            });
            return [ "NumericalRangeQuantification", i, a, v ].concat(xs);
        },
        Cardinality: function() {
            var $elf = this, _fromIdx = this.input.idx, n;
            n = this._applyWithArgs("token", "Number");
            return [ "Cardinality", n ];
        },
        MinimumCardinality: function() {
            var $elf = this, _fromIdx = this.input.idx, n;
            n = this._applyWithArgs("token", "Number");
            return [ "MinimumCardinality", n ];
        },
        MaximumCardinality: function() {
            var $elf = this, _fromIdx = this.input.idx, n;
            n = this._applyWithArgs("token", "Number");
            return [ "MaximumCardinality", n ];
        },
        Variable: function() {
            var $elf = this, _fromIdx = this.input.idx, num, term, w;
            num = this._applyWithArgs("token", "Number");
            term = this._applyWithArgs("token", "Term");
            w = this._many(function() {
                return this._or(function() {
                    return this._applyWithArgs("token", "AtomicFormulation");
                }, function() {
                    return this._apply("quant");
                });
            });
            return [ "Variable", num, term ].concat(w);
        },
        Real: function() {
            var $elf = this, _fromIdx = this.input.idx, num;
            num = this._apply("number");
            this._pred(!isNaN(num));
            return [ "Real", num ];
        },
        Integer: function() {
            var $elf = this, _fromIdx = this.input.idx, num;
            num = this._apply("number");
            this._pred(!isNaN(num));
            return [ "Integer", num ];
        },
        Text: function() {
            var $elf = this, _fromIdx = this.input.idx, text;
            text = this.anything();
            return [ "Text", text ];
        },
        Value: function() {
            var $elf = this, _fromIdx = this.input.idx;
            return this._or(function() {
                return this._applyWithArgs("token", "Real");
            }, function() {
                return this._applyWithArgs("token", "Integer");
            }, function() {
                return this._applyWithArgs("token", "Text");
            });
        },
        RoleBinding: function() {
            var $elf = this, _fromIdx = this.input.idx, bindIdentifier, identifier;
            identifier = this._or(function() {
                return this._applyWithArgs("token", "Term");
            }, function() {
                return this._applyWithArgs("token", "Name");
            });
            bindIdentifier = this._or(function() {
                return this._apply("number");
            }, function() {
                return this._apply("Value");
            });
            return [ "RoleBinding", identifier, bindIdentifier ];
        },
        AtomicFormulation: function() {
            var $elf = this, _fromIdx = this.input.idx, b, f;
            f = this._applyWithArgs("token", "FactType");
            b = this._many(function() {
                return this._applyWithArgs("token", "RoleBinding");
            });
            return [ "AtomicFormulation", f ].concat(b);
        }
    });
    LFValidator.initialize = function() {
        SBVRLibs.initialize.call(this);
    };
    LFValidator.defaultAttributes = function(termOrVerb, attrsFound, attrs) {
        termOrVerb.push(attrs);
    };
});