import path from "path";
import fs from "fs";

function resolveFilePath(projectRoot: string) {

}

// assumption is that we will receive
function findProjectRoot(startingPath: string): string {
    let projectRoot = '.'

    const x = path.parse(startingPath)
    fs.readdirSync(x.dir).forEach((file) => {
        if(!fs.statSync(file).isDirectory()) {

        } else {
            findProjectRoot(path.resolve(x.dir, '..'))
        }
    })


    return projectRoot
}
