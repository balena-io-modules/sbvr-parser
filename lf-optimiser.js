var OMeta = require("ometa-js/lib/ometajs/core"), LFValidator = require("./lf-validator").LFValidator, LFOptimiser = exports.LFOptimiser = LFValidator._extend({
    Helped: function() {
        var $elf = this, _fromIdx = this.input.idx;
        this._pred(!0 === this.helped);
        return this.helped = !1;
    },
    SetHelped: function() {
        var $elf = this, _fromIdx = this.input.idx;
        return this.helped = !0;
    },
    Process: function() {
        var $elf = this, _fromIdx = this.input.idx, x;
        x = this.anything();
        x = this._applyWithArgs("trans", x);
        this._many(function() {
            this._applyWithArgs("Helped", "disableMemoisation");
            return this._or(function() {
                return x = this._applyWithArgs("trans", x);
            }, function() {
                console.error("Failed to reprocess?!");
                return this._pred(!1);
            });
        });
        return x;
    },
    AtLeastNQuantification: function() {
        var $elf = this, _fromIdx = this.input.idx, i, v, xs;
        return this._or(function() {
            i = this._applyWithArgs("token", "MinimumCardinality");
            this._pred(1 == i[1][1]);
            v = this._applyWithArgs("token", "Variable");
            xs = this._many(function() {
                return this._apply("trans");
            });
            this._apply("SetHelped");
            return [ "ExistentialQuantification", v ].concat(xs);
        }, function() {
            return LFValidator._superApply(this, "AtLeastNQuantification");
        });
    },
    NumericalRangeQuantification: function() {
        var $elf = this, _fromIdx = this.input.idx, i, j, v, xs;
        return this._or(function() {
            i = this._applyWithArgs("token", "MinimumCardinality");
            j = this._applyWithArgs("token", "MaximumCardinality");
            this._pred(i[1][1] == j[1][1]);
            v = this._applyWithArgs("token", "Variable");
            xs = this._many(function() {
                return this._apply("trans");
            });
            this._apply("SetHelped");
            return [ "ExactQuantification", [ "Cardinality", i[1] ], v ].concat(xs);
        }, function() {
            return LFValidator._superApply(this, "NumericalRangeQuantification");
        });
    },
    LogicalNegation: function() {
        var $elf = this, _fromIdx = this.input.idx, xs;
        return this._or(function() {
            this._form(function() {
                this._applyWithArgs("exactly", "LogicalNegation");
                return xs = this._apply("trans");
            });
            this._apply("SetHelped");
            return xs;
        }, function() {
            return LFValidator._superApply(this, "LogicalNegation");
        });
    }
});

LFOptimiser.initialize = function() {
    LFValidator.initialize.call(this);
    this._didSomething = !1;
};