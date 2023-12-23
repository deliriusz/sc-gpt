import {EOL} from "os";

function getMultiLineSubstring(startLine: number, startColumn: number,
                          endLine: number, endColumn: number, data: string): string {
    let resultingArray: string[]

    const linedData = data.split(`\r?\n`)

    resultingArray = linedData.slice(startLine, endLine)

    const resultingArrayEnd = resultingArray.length - 1

    resultingArray[0] = resultingArray[0].substring(startColumn)
    resultingArray[resultingArrayEnd] = resultingArray[resultingArrayEnd].substring(0, endColumn)

    return resultingArray.join(EOL)
}