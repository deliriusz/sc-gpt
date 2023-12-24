// https://github.com/ConsenSys/surya/blob/774b28e02e9088ec5395bc93ec8e37332a7ac116/src/utils/parserHelpers.js


import {ASTNode, FunctionCall, FunctionDefinition} from "@solidity-parser/parser/dist/src/ast-types";

function functionName(node: FunctionDefinition) {
    let name;
    if (node.isConstructor) {
        name = '<Constructor>';
    } else if (node.isFallback) {
        name = '<Fallback>';
    } else if (node.isReceiveEther) {
        name = '<Receive Ether>';
    } else {
        name = node.name;
    }

    return name;
}

const BUILTINS = [
    'gasleft', 'require', 'assert', 'revert', 'addmod', 'mulmod', 'keccak256',
    'sha256', 'sha3', 'ripemd160', 'ecrecover',
];

function isLowerCase(str: string) {
    return str === str.toLowerCase();
}

const parserHelpers = {
    isRegularFunctionCall: (node: FunctionCall, contractNames: string[], eventNames: string[], structNames: string[]) => {
        const expr = node.expression;
        return expr && expr.type === 'Identifier'
            && !contractNames.includes(expr.name)
            && !eventNames.includes(expr.name)
            && !structNames.includes(expr.name)
            && !BUILTINS.includes(expr.name);
    },

    isMemberAccess: (node: any): boolean => {
        const expr = node.expression;
        return expr.type === 'MemberAccess' && !['push', 'pop', 'encode', 'encodePacked', 'encodeWithSelector', 'encodeWithSignature', 'decode'].includes(expr.memberName);
    },

    isIndexAccess: (node: any): boolean => {
        const expr = node.expression;
        return expr.type === 'IndexAccess';
    },

    isMemberAccessOfAddress: (node: any): boolean => {
        const expr = node.expression.expression;
        return expr.type === 'FunctionCall'
            && expr.expression.hasOwnProperty('typeName')
            && expr.expression.typeName.name === 'address';
    },

    isAContractTypecast: (node: any, contractNames: string[]): boolean => {
        const expr = node.expression.expression;
        // @TODO: replace lowercase for better filtering
        return expr.type === 'FunctionCall'
            && expr.expression.hasOwnProperty('name')
            && contractNames.includes(expr.expression.name[0]);
    },

    isUserDefinedDeclaration: (node: any): boolean => {
        return node.hasOwnProperty('typeName')&& node.typeName.type === 'UserDefinedTypeName';
    },

    isElementaryTypeDeclaration: (node: any): boolean => {
        return node.hasOwnProperty('typeName')&& node.typeName.type === 'ElementaryTypeName';
    },

    isArrayDeclaration: (node: any): boolean => {
        return node.hasOwnProperty('typeName')&& node.typeName.type === 'ArrayTypeName';
    },

    isMappingDeclaration: (node: any): boolean => {
        return node.hasOwnProperty('typeName')&& node.typeName.type === 'Mapping';
    },

    isAddressDeclaration: (node: any): boolean => {
        return node.hasOwnProperty('typeName')
            && node.typeName.type === 'ElementaryTypeName'
            && node.typeName.name === 'address';
    },

    isElementaryTypecast: (node: any): boolean => {
        return node.hasOwnProperty('type')
            && node.type === 'FunctionCall'
            && node.hasOwnProperty('expression')
            && node.expression.type === 'TypeNameExpression'
            && node.expression.typeName.type === 'ElementaryTypeName';
    },

    isSpecialVariable: (node: any): boolean => {
        // now (same as block.timestamp)
        if(
            node.hasOwnProperty('type')
            && node.type === 'Identifier'
            && node.name === 'now'
        ) {
            return true;
            // any block.<x> special variable
        } else if(
            node.hasOwnProperty('type')
            && node.type === 'MemberAccess'
            && node.hasOwnProperty('expression')
            && node.expression.type === 'Identifier'
            && node.expression.name === 'block'
        ) {
            return true;
            // any msg.<x> special variable
        } else if(
            node.hasOwnProperty('type')
            && node.type === 'MemberAccess'
            && node.hasOwnProperty('expression')
            && node.expression.type === 'Identifier'
            && node.expression.name === 'msg'
        ) {
            return true;
            // any tx.<x> special variable
        } else if(
            node.hasOwnProperty('type')
            && node.type === 'MemberAccess'
            && node.hasOwnProperty('expression')
            && node.expression.type === 'Identifier'
            && node.expression.name === 'tx'
        ) {
            return true;
            // if not then... return false
        } else {
            return false;
        }
    },

    getSpecialVariableType: (node: any): string => {
        // now (same as block.timestamp)
        if(
            node.hasOwnProperty('type')
            && node.type === 'Identifier'
            && node.name === 'now'
        ) {
            return 'uint256';

        } else if(
            node.hasOwnProperty('type')
            && node.type === 'MemberAccess'
            && node.hasOwnProperty('expression')
            && node.expression.hasOwnProperty('type')
            && node.expression.type === 'Identifier'
        ) {
            // in case it is block.<x> special variable
            if(node.expression.name === 'block') {
                if(node.memberName === 'coinbase') {
                    return 'address';
                } else {
                    return 'uint256';
                }
            }

            // or msg.<x> special variable
            else if(node.expression.name === 'msg') {
                if(node.memberName === 'data') {
                    return 'bytes';
                } else if(node.memberName === 'sender') {
                    return 'address';
                } else if(node.memberName === 'sig') {
                    return 'bytes4';
                } else if(node.memberName === 'value') {
                    return 'uint256';
                }
            }

            // or tx.<x> special variable
            else if(node.expression.name === 'tx') {
                if(node.memberName === 'origin') {
                    return 'address';
                } else if(node.memberName === 'gasprice') {
                    return 'uint256';
                }
            }
        } else {
            // if not a special variable, return false
            return '';
        }
        return ''
    },
};

export {
    functionName,
    parserHelpers,
    isLowerCase
}
