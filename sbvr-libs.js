!function(root, factory) {
    "function" == typeof define && define.amd ? define([ "require", "exports", "ometa-core", "lodash" ], factory) : "object" == typeof exports ? factory(require, exports, require("ometa-js").core) : factory(function(moduleName) {
        return root[moduleName];
    }, root, root.OMeta);
}(this, function(require, exports, OMeta) {
    var _ = require("lodash"), SBVRLibs = exports.SBVRLibs = OMeta._extend({});
    SBVRLibs.initialize = function() {
        this.currentVocabulary = "";
        this.vocabularies = {};
        this.factTypes = {};
    };
    SBVRLibs.ApplyFirstExisting = function(rules, ruleArgs) {
        null == ruleArgs && (ruleArgs = []);
        for (var i = 0; i < rules.length; i++) if (null != this[rules[i]]) return ruleArgs.length > 0 ? this._applyWithArgs.apply(this, [ rules[i] ].concat(ruleArgs)) : this._apply(rules[i], ruleArgs);
    };
    SBVRLibs.IdentifiersEqual = function(a, b) {
        return a[0] === b[0] && a[1] === b[1] && a[2] === b[2];
    };
    SBVRLibs.FollowConceptType = function(identifier) {
        var conceptTypes = this.vocabularies[identifier[2]].ConceptTypes;
        identifier = identifier.slice(0, 3);
        return conceptTypes.hasOwnProperty(identifier) ? conceptTypes[identifier] : !1;
    };
    SBVRLibs.AddVocabulary = function(vocabulary, baseSynonym) {
        this.currentVocabulary = baseSynonym;
        this.vocabularies.hasOwnProperty(baseSynonym) || (this.vocabularies[baseSynonym] = {
            Term: {},
            Name: {},
            IdentifierChildren: {},
            ConceptTypes: {}
        });
        this.vocabularies.hasOwnProperty(vocabulary) || (this.vocabularies[vocabulary] = this.vocabularies[baseSynonym]);
    };
    var formatFactType = function(factType) {
        return _.map(factType, 1).join(" ");
    };
    SBVRLibs.AddFactType = function(factType, realFactType) {
        for (var mappedFactType = [], matchingFactTypes = _.isEqual(factType, realFactType), i = 0; i < realFactType.length; i++) {
            var realFactTypePart = realFactType[i];
            mappedFactType[i] = realFactTypePart.slice(0, 3);
            if ("Verb" !== realFactTypePart[0]) if (matchingFactTypes) mappedFactType[i][3] = i; else {
                for (var mappingFound = !1, j = 0; j < factType.length; j++) {
                    var factTypePart = factType[j];
                    if ("Verb" !== factTypePart[0] && this.IdentifiersEqual(realFactTypePart, factTypePart) && realFactTypePart.length === factTypePart.length && (realFactTypePart.length < 4 || realFactTypePart[3][1] === factTypePart[3][1])) {
                        if (mappingFound) throw new Error('Ambiguous use of fact type "' + formatFactType(factType) + '", please add explicit numbering');
                        mappingFound = !0;
                        mappedFactType[i][3] = j;
                    }
                }
                if (!mappingFound) throw new Error('Unable to map identifiers for "' + formatFactType(factType) + '", please add explicit numbering');
            }
        }
        this._traverseFactType(factType, mappedFactType);
        if (3 === factType.length && ("has" === factType[1][1] || "is of" === factType[1][1])) {
            mappedFactType = _.clone(mappedFactType);
            mappedFactType[0] = mappedFactType[0].slice(0, 3).concat(2);
            mappedFactType[2] = mappedFactType[2].slice(0, 3).concat(0);
            "has" === factType[1][1] ? this._traverseFactType([ factType[2], [ "Verb", "is of", factType[1][2] ], factType[0] ], mappedFactType) : "is of" === factType[1][1] && this._traverseFactType([ factType[2], [ "Verb", "has", factType[1][2] ], factType[0] ], mappedFactType);
        }
    };
    SBVRLibs._traverseFactType = function(factType, create) {
        var $elf = this, traverseRecurse = function(currentFactTypePart, remainingFactType, currentLevel) {
            if (null == currentFactTypePart) {
                create && (currentLevel.__valid = create);
                return currentLevel;
            }
            var finalLevel, finalLevels = {};
            switch (currentFactTypePart[0]) {
              case "Verb":
                currentFactTypePart = currentFactTypePart.slice(0, 2);
                break;

              default:
                currentFactTypePart = currentFactTypePart.slice(0, 3);
            }
            if (currentLevel.hasOwnProperty(currentFactTypePart) || create && (currentLevel[currentFactTypePart] = {})) {
                finalLevel = traverseRecurse(remainingFactType[0], remainingFactType.slice(1), currentLevel[currentFactTypePart]);
                finalLevel !== !1 && _.assign(finalLevels, finalLevel);
            }
            if (!create && ("Term" === currentFactTypePart[0] || "Name" === currentFactTypePart[0])) for (;(currentFactTypePart = $elf.FollowConceptType(currentFactTypePart)) !== !1; ) if (currentLevel.hasOwnProperty(currentFactTypePart)) {
                finalLevel = traverseRecurse(remainingFactType[0], remainingFactType.slice(1), currentLevel[currentFactTypePart]);
                finalLevel !== !1 && _.assign(finalLevels, finalLevel);
            }
            return _.isEmpty(finalLevels) === !0 ? !1 : finalLevels;
        };
        return traverseRecurse(factType[0], factType.slice(1), this.factTypes);
    };
});