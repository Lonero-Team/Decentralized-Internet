// Based on https://github.com/eslint/eslint/blob/master/lib/rules/no-var.js

'use strict';

// Load modules


// Declare internals

const internals = {
    scopeTypes: ['Program', 'BlockStatement', 'SwitchStatement', 'ForStatement', 'ForInStatement', 'ForOfStatement']
};


module.exports = {
    meta: {
        docs: {
            description: 'require `let` or `const` instead of `var` when outside of try...catch',
            category: 'ECMAScript 6',
            recommended: true
        },
        schema: []
    },
    create(context) {

        const check = (node) => {

            if (node.parent.parent &&
                (node.parent.parent.type === 'TryStatement' ||
                 node.parent.parent.type === 'CatchClause')) {

                const variables = context.getDeclaredVariables(node);
                const scopeNode = internals.getScopeNode(node);
                if (variables.some(internals.isUsedFromOutsideOf(scopeNode))) {
                    return;
                }
            }

            context.report(node, 'Unexpected var, use let or const instead.');
        };

        return {
            'VariableDeclaration:exit'(node) {

                if (node.kind === 'var') {
                    check(node);
                }
            }
        };
    }
};


module.exports.esLintRuleName = 'hapi-no-vars';


internals.getScopeNode = function (node) {

    if (internals.scopeTypes.indexOf(node.type) !== -1) {
        return node;
    }

    return internals.getScopeNode(node.parent);
};


internals.isUsedFromOutsideOf = function (scopeNode) {

    const isOutsideOfScope = (reference) => {

        const scope = scopeNode.range;
        const id = reference.identifier.range;
        return id[0] < scope[0] || id[1] > scope[1];
    };

    return (variable) => variable.references.some(isOutsideOfScope);
};
