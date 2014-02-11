define(function(require, exports, module) {
"use strict";

var oop = require("../lib/oop");
var c_cppHighlightRules = require("./c_cpp_highlight_rules").c_cppHighlightRules;

var miniHighlightRules = function() {

    var keywords = (
        "func|if|else|while|return"
    );

    var buildinConstants = (
        ""
    );

    var keywordMapper = this.createKeywordMapper({
        "variable.language": "this",
        "keyword": keywords,
        "constant.language": buildinConstants
    }, "identifier");

    this.$rules = new c_cppHighlightRules().$rules;
    this.$rules.start.forEach(function(rule) {
        if (typeof rule.token == "function")
            rule.token = keywordMapper;
    })
};

oop.inherits(miniHighlightRules, c_cppHighlightRules);

exports.miniHighlightRules = miniHighlightRules;
});
