import * as vscode from 'vscode';

const path = require('path');
const fs = require('fs');

import {getLinkedModules} from './link';

export function activate(context: vscode.ExtensionContext) {
    setInterval(checkForLinkedModules, 10000);

    const item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right);
    item.text = 'my icon: $(file-symlink-file) $(link)';
    item.show();
}

async function checkForLinkedModules(): Promise<void> {
    const rootPath = vscode.workspace.rootPath;
    if (!rootPath) return;

    const linkedModules = await getLinkedModules(rootPath);
    if (linkedModules && linkedModules.length) {
        const item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right);
        item.text = 'hello world';
        item.show();
    }
}

export function deactivate() {
}