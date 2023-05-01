import parser from '@solidity-parser/parser'
import {File} from "buffer";
import fs from "fs";
import {SmartContract, Function, Modifier} from "../../types";
export default class Parser {
    // https://github.com/ConsenSys/surya/blob/master/src/graph.js

    parse(contractContents: string, location: string): SmartContract [] {
        const contracts: SmartContract[] = []
        let contract: SmartContract

        const astSourceUnit = parser.parse(contractContents,
            {
                loc: true,
                range: true,
                tolerant: true
            }
        )

        parser.visit(astSourceUnit, {
            ContractDefinition(node) {
                contract =
                    <SmartContract>{
                        location: location,
                        contents: '', // TODO: add contents retrieval
                        functions: [],
                        kind: node.kind,
                        name: node.name
                    }

                node.baseContracts.map(spec =>
                    spec.baseName.namePath
                );
            },

            // add complete contract when it's finished processing
            'ContractDefinition:exit': function(node) {
                contracts.push(contract)
            },

            FunctionDefinition(node) {
                const modifiers: Modifier[] =
                    node.modifiers.map((mod) =>
                        <Modifier>{
                            name: mod.name
                        })

                const func: Function = <Function>{
                    name: node.name!,
                    contents: '',
                    fullyQualifiedDescriptor: '',
                    modifiers: modifiers,
                    visibility: node.visibility!
                }

                contract.functions.push(func)
            },
        })

        return contracts
    }
}