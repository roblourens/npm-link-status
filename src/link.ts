import * as path from 'path';
import * as promisify from 'promisify-node';
const fsP = promisify('fs');

export function getLinkedModules(workspaceRoot: string): Promise<string[]> {
    return new Promise<string[]>((resolve, reject) => {
        try {
            const files = await fsP.readdir(path.join(__dirname, '../../node_modules')); 

            Promise.all(files.map(file => {
                const modulePath = path.join('.', 'node_modules', file);
                return verifyNotALinkedModule(modulePath);
            })).then(() => resolve(true), () => resolve(false));
        } catch (e) {
            reject(e);
        }
        }); 
    });
}

function verifyNotALinkedModule(modulePath) {
    return new Promise((resolve, reject) => {
        fs.lstat(modulePath, (err, stat) => {
            if (stat.isSymbolicLink()) {
                reject(new Error('Symbolic link found: ' + modulePath));
            } else {
                resolve();
            }
        });
    });
}