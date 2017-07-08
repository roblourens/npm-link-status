import * as vscode from 'vscode';

const path = require('path');
const fs = require('fs');
import { ChildProcess } from 'child_process';

import { hasLinkedModules, getLinkedModules } from './linkedModules';

export async function activate(context: vscode.ExtensionContext) {
    vscode.commands.registerCommand('npm-link-status.showLinkedModules', showLinkedModules)

    await checkForLinkedModules();
    setInterval(checkForLinkedModules, 10 * 1000);
}

const item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
item.text = 'npm $(link)';
item.tooltip = 'Linked NPM modules detected';
item.command = 'npm-link-status.showLinkedModules';

async function showLinkedModules(): Promise<void> {
    const rootPath = vscode.workspace.rootPath;
    if (!rootPath) return;

    vscode.window.showQuickPick(getLinkedModuleItems(rootPath), { placeHolder: 'Linked NPM modules' });
}

async function getLinkedModuleItems(rootPath: string): Promise<vscode.QuickPickItem[]> {
    const linkedModules = await getLinkedModules(rootPath);
    return linkedModules.map(m => {
        return <vscode.QuickPickItem>{
            label: m.name,
            description: '→ ' + m.actualPath
        };
    });
}

async function checkForLinkedModules(): Promise<void> {
    const rootPath = vscode.workspace.rootPath;
    if (!rootPath) return;

    if (await hasLinkedModules(rootPath)) {
        item.show();
    } else {
        item.hide();
    }
}

export function deactivate() {
}
