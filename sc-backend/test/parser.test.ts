import chai, { expect } from 'chai'
import { parseCommandLine } from 'typescript';
import {parseStr} from "../lib/parser/solidityParser";
import {basicFixture} from "./fixtures/basic";

describe('Parser', () => {
    // const solidityParser: SolidityParser = new SolidityParser()

    it('should perform basic parse', function () {
        const pathToTest = './fixtures/basic.ts'

        const parsedContracts = parseStr(basicFixture, pathToTest)

        console.log(JSON.stringify(parsedContracts))

        expect(parsedContracts).to.be.not.null
        expect(parsedContracts.length).to.eq(2)
    });

    

})
