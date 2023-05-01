import * as vscode from 'vscode';
import { setUpLeafRendering } from './liveLeafRendering';
import { VaporTaskProvider } from './VaporTaskProvider';

let vaporTaskProvider: vscode.Disposable | undefined;

export function activate(context: vscode.ExtensionContext) {
	try {
		const workspaceRoot = (vscode.workspace.workspaceFolders && (vscode.workspace.workspaceFolders.length > 0))
			? vscode.workspace.workspaceFolders[0].uri.fsPath : undefined;
		if (!workspaceRoot) {
			return;
		}

		vaporTaskProvider = vscode.tasks.registerTaskProvider(
            "swift",
            new VaporTaskProvider(workspaceRoot)
        );

		context.subscriptions.push(
			vscode.commands.registerCommand('renderLeaf', async () => {
				await setUpLeafRendering();
			})
		);
	} catch (error) {
        vscode.window.showErrorMessage(`Activating Vapor extension failed: ${JSON.stringify(error)}`);
    }
}

export function deactivate(): void {
	if (vaporTaskProvider) {
		vaporTaskProvider.dispose();
	}
}
