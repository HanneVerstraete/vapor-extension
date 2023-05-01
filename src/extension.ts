import * as vscode from 'vscode';
import { setUpLeafRendering } from './liveLeafRendering';

export function activate(context: vscode.ExtensionContext) {
	try {
		context.subscriptions.push(
			vscode.commands.registerCommand('renderLeaf', async () => {
				await setUpLeafRendering();
			})
		);
	} catch (error) {
        vscode.window.showErrorMessage(`Activating Vapor extension failed: ${JSON.stringify(error)}`);
    }
}

export function deactivate() {}
