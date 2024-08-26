const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');

function execJava(javaCode) {
    return new Promise((resolve, reject) => {
        const filename = `Example.java`;
        const classFile = `Example.class`;

        // Save the Java code to a file
        fs.writeFile(filename, javaCode, (err) => {
            if (err) {
                reject(`Error writing file: ${err}`);
                return;
            }
            console.log(`Java file saved as ${filename}`);

            // Compile the Java file
            exec(`javac ${filename}`, (compileError, stdout, stderr) => {
                if (compileError) {
                    reject(`Error compiling Java code: ${compileError.message}\n${stderr}`);
                    return;
                }

                // Run the compiled Java class
                exec(`java ${path.parse(filename).name}`, (runError, runStdout, runStderr) => {
                    if (runError) {
                        reject(`Error running Java code: ${runError.message}\n${runStderr}`);
                        return;
                    }

                    // Clean up the files after execution
                    setTimeout(() => {
                        fs.unlink(filename, (err) => {
                            if (err) console.error(`Error deleting file ${filename}: ${err.message}`);
                        });
                        fs.unlink(classFile, (err) => {
                            if (err) console.error(`Error deleting file ${classFile}: ${err.message}`);
                        });
                    }, 5000); // Adjust the delay as needed

                    resolve(runStdout);
                });
            });
        });
    });
}

module.exports = { execJava };