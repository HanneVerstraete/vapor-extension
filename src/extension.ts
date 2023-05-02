import * as vscode from 'vscode';
import { setUpLeafRendering } from './liveLeafRendering';
import { VaporTaskProvider } from './VaporTaskProvider';
import { pathExists } from './utilities';

export async function activate(context: vscode.ExtensionContext) {
	console.debug('Activating Vapor for Visual Studio Code...');

	let workspaceRoot: string | undefined;
	if (vscode.workspace.workspaceFolders) {
		workspaceRoot = vscode.workspace.workspaceFolders[0].uri.fsPath;
	}

	if (workspaceRoot && await pathExists(workspaceRoot, 'Package.swift')) {
		vscode.commands.executeCommand('setContext', 'swift.hasPackage', true);
	} else {
		return;
	}

	vscode.tasks.registerTaskProvider('vapor', new VaporTaskProvider(workspaceRoot));

	context.subscriptions.push(
		vscode.commands.registerCommand('renderLeaf', async () => {
			await setUpLeafRendering();
		})
	);
}

export function deactivate() {}