import * as vscode from 'vscode';

import * as path from 'path';
import * as fs from 'fs';
import { ChildProcess } from 'child_process';

import { hasLinkedModules, getLinkedModules } from './linkedModules';

export async function activate(context: vscode.ExtensionContext) {
    vscode.commands.registerCommand('npm-link-status.showLinkedModules', showLinkedModules)

    await checkForLinkedModules();
    setInterval(checkForLinkedModules, 10 * 1000);
}

const item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
item.text = 'npm $(link)';
item.tooltip = 'Linked npm modules detected';
item.command = 'npm-link-status.showLinkedModules';

async function showLinkedModules(): Promise<void> {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || !workspaceFolders.length) return;

    const linkedModulesP = Promise.all(workspaceFolders.map(rootFolder => {
        return getLinkedModuleItems(rootFolder.uri.fsPath, workspaceFolders.length > 1);
    })).then(linkedModules => {
        // Flatten
        return linkedModules.reduce<vscode.QuickPickItem[]>((acc, modules) => acc.concat(modules), []);
    });

    vscode.window.showQuickPick(linkedModulesP, { placeHolder: 'Linked npm modules' });
}

async function getLinkedModuleItems(rootPath: string, isMultiroot: boolean): Promise<vscode.QuickPickItem[]> {
    const linkedModules = await getLinkedModules(rootPath);
    return linkedModules.map(m => {
        const description = isMultiroot ?
            path.basename(rootPath) + ' → ' + m.actualPath :
            '→ ' + m.actualPath;

        return <vscode.QuickPickItem>{
            label: m.name,
            description
        };
    });
}

async function checkForLinkedModules(): Promise<void> {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || !workspaceFolders.length) return;

    for (let rootFolder of workspaceFolders) {
        if (await hasLinkedModules(rootFolder.uri.fsPath)) {
            item.show();
            return;
        }
    }

    item.hide();
}

export function deactivate() {
}
