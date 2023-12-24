import {parse, visit} from '@solidity-parser/parser'
import {SmartContract, Function, Modifier} from "../../types";
import {functionName, parserHelpers} from "./helpers";

// https://github.com/ConsenSys/surya/blob/master/src/graph.js
export const parseStr = (contractContents: string, location: string): SmartContract [] => {
    const contracts: SmartContract[] = []
    const contractsMap: Map<String, SmartContract> = new Map()
    let contract: SmartContract
    const imports: string [] = []

    function tryGetFunction(contractName: string, functionName: string): Function | undefined {
        let contractToCheck = contractsMap.get(contractName)
        if (!contractToCheck && contract.name !== contractName) {
            return undefined
        } else {
            contractToCheck = contract
        }

        let matchingFunction = contractToCheck.functions.filter((v: any, i: number, a: any) => {
            v.name === functionName
        })

        return matchingFunction[0]
    }

    // variables required for intermediate processing
    let callingScope: any = null;
    let dependencies: object = {};
    let userDefinedStateVars = {};
    let stateVars = {};
    let contractUsingFor: any = {'': {}};
    let functionsPerContract = {'0_global':[]}; // TODO: change for list
    let eventsPerContract = {'0_global':[]};
    let structsPerContract = {'0_global':[]};
    let s = ['0_global'];
    let userDefinedLocalVars: Map<string, string> = new Map();
    let localVars: Map<string, string> = new Map();
    let tempUserDefinedStateVars: Map<string, string> = new Map();
    let tempStateVars: Map<string, string> = new Map();
    let eventDefinitions = [];


    const astSourceUnit = parse(contractContents,
        {
            loc: true,
            range: true,
            tolerant: true
        }
    )

    if(astSourceUnit.errors && astSourceUnit.errors.length > 0) {
        return []
    }

    visit(astSourceUnit, {
        ContractDefinition(node) {
            contract =
                <SmartContract>{
                    location: location,
                    contents: getSubstringInRange(contractContents, node.range),
                    imports: imports,
                    functions: [],
                    kind: node.kind,
                    name: node.name
                }

            node.baseContracts.map(spec =>
                spec.baseName.namePath // TODO: add this to contract
            );
        },

        ImportDirective(node) {
            imports.push(node.path)
        },

        // add complete contract when it's finished processing
        'ContractDefinition:exit': function(node) {
            contracts.push(contract)
        },

        FunctionDefinition(node) {
            const name = functionName(node);

            // callingScope = nodeName(name, );
            callingScope = contract.name // TODO: check this

            const modifiers: Modifier[] =
                node.modifiers.map((mod) =>
                    <Modifier>{
                        name: mod.name,
                        contents: getSubstringInRange(contractContents, mod.range)
                    })

            let functionDescriptor: string
            const funcRange: number[] = node.range ? node.range : [0, 0]

            // if a function has body, we copy it's full signature
            // together with visibility, return types, etc.
            if (node.body && node.body.range) {
                funcRange[1] = node.body.range[0]
            }

            functionDescriptor = getSubstringInRange(contractContents, funcRange)

            const func: Function = <Function>{
                name: node.name!,
                contents: getSubstringInRange(contractContents, node.range),
                fullyQualifiedDescriptor: functionDescriptor,
                modifiers: modifiers,
                visibility: node.visibility!,
                isConstructor: node.isConstructor,
                isFallback: node.isFallback,
                isReceiveEther: node.isReceiveEther,
                isVirtual: node.isVirtual
            }

            contract.functions.push(func)
        },

        'FunctionDefinition:exit': function(node) {
            callingScope = null
            userDefinedLocalVars.clear()
            localVars.clear()
        },


        FunctionCall(node) {
            if (!callingScope) {
                // this is a function call outside of functions and modifiers, ignore for now
                return;
            }

            const expr = node.expression;

            let name: string;
            let localContractName = contract.name;

            // Construct an array with the event and struct names in the whole dependencies tree of the current contract
            let eventsOfDependencies: any[] = [];
            let structsOfDependencies: any[] = [];
            if (dependencies.hasOwnProperty(contract.name)) {
                // for (let dep of dependencies[contract.name] as string) {
                //     eventsOfDependencies = eventsOfDependencies.concat(eventsPerContract[dep]);
                //     structsOfDependencies = structsOfDependencies.concat(structsPerContract[dep]);
                // }
            }

            if(
                parserHelpers.isRegularFunctionCall(node, s, eventsOfDependencies, structsOfDependencies)
            ) {
                // opts.color = colorScheme.call.regular;
                if ("name" in expr) {
                    name = expr.name;
                }
            } else if(parserHelpers.isMemberAccess(node)) {
                let object = null;
                let variableType = null;

                if ("memberName" in expr) {
                    name = expr.memberName;
                }

                let expression: any = {}
                if ("expression" in expr) {
                    expression = expr.expression
                }

                // checking if the member expression is a simple identifier
                if("expression" in expr && expression.hasOwnProperty('name')) {
                    if ("name" in expression) {
                        object = expression.name;
                    }

                    // checking if it is a member of `address` and pass along it's contents
                } else if(parserHelpers.isMemberAccessOfAddress(node)
                    && "arguments" in expression) {
                    if(expression.arguments[0].hasOwnProperty('name')) {
                        object = expression.arguments[0].name;
                    } else if(expression.arguments[0].type === 'NumberLiteral') {
                        object = 'address('+expression.arguments[0].number+')';
                    } else {
                        object = JSON.stringify(expression.arguments).replace(/"/g,"");
                    }

                    // checking if it is a typecasting to a user-defined contract type
                } else if(parserHelpers.isAContractTypecast(node, s)) {
                    if ("name" in expression.expression) {
                        object = expression.expression.name;
                    }
                }

                // check if member expression is a special var and get its canonical type
                if(parserHelpers.isSpecialVariable(expression)) {
                    variableType = parserHelpers.getSpecialVariableType(expression);

                    // check if member expression is a typecast for a canonical type
                } else if(parserHelpers.isElementaryTypecast(expression)) {
                    variableType = expression.expression.typeName.name;

                    // else check for vars in defined the contract
                } else {
                    // check if member access is a function of a "using for" declaration
                    // START
                    if(localVars.has(object)) {
                        variableType = localVars.get(object);
                    } else if(userDefinedLocalVars.get(object)) {
                        variableType = userDefinedLocalVars.get(object);
                    } else if(tempUserDefinedStateVars.get(object)) {
                        variableType = tempUserDefinedStateVars.get(object);
                    } else if(tempStateVars.get(object)) {
                        variableType = tempStateVars.get(object);
                    }
                }

                // convert to canonical elementary type: uint -> uint256
                variableType = variableType === 'uint' ? 'uint256' : variableType;

                // if variable type is not null let's replace "object" for the actual library name
                if (variableType !== null) {
                    // Incase there is a "using for" declaration for this specific variable type we get its definition
                    if (contractUsingFor.hasOwnProperty(variableType) &&
                        functionsPerContract.hasOwnProperty(contractUsingFor[variableType])) {

                        // If there were any library declarations done to all the types with "*"
                        // we will add them to the list of matching contracts
                        // let contractUsingForDefinitions = new Set(...contractUsingFor[variableType]);
                        // if (contractUsingFor.hasOwnProperty('*') &&
                        //     functionsPerContract.hasOwnProperty(contractUsingFor['*'])) {
                        //     contractUsingForDefinitions = new Set(...contractUsingFor[variableType], ...contractUsingFor[contract.name]['*']);
                        // }

                        // check which usingFor contract the method resolves to (best effort first match)
                        // let matchingContracts = [...contractUsingForDefinitions].filter(contract => functionsPerContract[contract].includes(name));

                        // if(matchingContracts.length > 0){
                        //     // we found at least one matching contract. use the first. don't know what to do if multiple are matching :/
                        //     if (!options.libraries) {
                        //         object = matchingContracts[0];
                        //     } else {
                        //         return;
                        //     }
                        // }
                    }
                    // In case there is not, we can just shortcircuit the search to only the "*" variable type, incase it exists
                } else if (contractUsingFor.hasOwnProperty('*') &&
                    functionsPerContract.hasOwnProperty(contractUsingFor['*'])) {
                    // check which usingFor contract the method resolves to (best effort first match)
                    // let matchingContracts = [...contractUsingFor['*']].filter(contract => functionsPerContract[contract].includes(name));

                    // if(matchingContracts.length > 0){
                    //     // we found at least one matching contract. use the first. don't know what to do if multiple are matching :/
                    //     if (!options.libraries) {
                    //         object = matchingContracts[0];
                    //     } else {
                    //         return;
                    //     }
                    // }
                }
                // END

                // if we have found nothing so far then create no node
                if(object === null) {
                    return;
                } else if(object === 'this') {
                    // opts.color = colorScheme.call.this;
                } else if (object === 'super') {
                    // "super" in this context is gonna be the 2nd element of the dependencies array
                    // since the first is the contract itself
                    // localContractName = dependencies[''][1];
                } else if (tempUserDefinedStateVars.has(object)) {
                    localContractName = tempUserDefinedStateVars.get(object)!;
                } else if (userDefinedLocalVars.has(object)) {
                    localContractName = userDefinedLocalVars.get(object)!;
                } else {
                    localContractName = object;
                }

            } else {
                return;
            }
        }
    })

    return contracts
}

const getSubstringInRange = (content: string, rangeArr: number[] | undefined): string => {
    const range = getRange(rangeArr, content.length)

    return content.substring(range.start, range.end)
}

const getRange = (rangeArr: number[] | undefined, max: number): { start: number; end: number } => {
    const range = {
        start: 0,
        end: max
    }

    if (rangeArr && rangeArr.length == 2) {
        range.start = rangeArr[0]
        range.end = rangeArr[1]
    }

    return range
}
