import * as vscode from 'vscode';
import { setUpLeafRendering } from './liveLeafRendering';

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.commands.registerCommand('renderLeaf', async () => {
			await setUpLeafRendering();
		})
	  );
}

export function deactivate() {}
