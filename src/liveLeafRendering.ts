import * as vscode from 'vscode';

export async function setUpLeafRendering () {
    const panel = vscode.window.createWebviewPanel(
        'leafRendering', 
        'Leaf Render', 
        vscode.ViewColumn.Two,
        {}
    );

	const template = _getActiveTemplate;
	const baseUrl = _getBaseUrl();
	
    panel.webview.html = _getWebView(`${baseUrl}${template}`);

    let timer = setTimeout(() => {}, 0);

    vscode.workspace.onDidChangeTextDocument(async () => {
		const template = _getActiveTemplate();

        clearTimeout(timer);

        timer = setTimeout(async () => {
			// TO DO cleaner solve instead reloading by setting to blank
			panel.webview.html = _getWebView('about:blank');
			panel.webview.html = _getWebView(`http://127.0.0.1:8080/leaf-preview/${template}`);
        }, 500);
   });

   vscode.window.onDidChangeActiveTextEditor(async () => {
		const template = _getActiveTemplate();

		clearTimeout(timer);

		timer = setTimeout(async () => {
			// TO DO cleaner solve instead reloading by setting to blank
			panel.webview.html = _getWebView('about:blank');
			panel.webview.html = _getWebView(`http://127.0.0.1:8080/leaf-preview/${template}`);
		}, 500);
	});
}

function _getActiveTemplate(): string {
	let template = '';

	const currentlyOpenTabfilePath = vscode.window.activeTextEditor?.document?.fileName ?? '';

	if (currentlyOpenTabfilePath) {
		const fileName = currentlyOpenTabfilePath.substring(currentlyOpenTabfilePath.lastIndexOf('/') + 1);
		if (fileName.includes('.leaf')) {
			template = fileName.substring(0, fileName.lastIndexOf('.'));
		}
	}

	return template;
}

function _getBaseUrl() {
	let path = '';
	let basUrl = 'http://127.0.0.1:8080';

	if(vscode.workspace.workspaceFolders !== undefined) {
	 	path = vscode.workspace.workspaceFolders[0].uri.path ;

		let uri = path + '/Sources/App/routes.swift';

		vscode.workspace.openTextDocument(uri).then((document) => {
			let text = document.getText();
			let regex = /localhost[^]*;/;
			let match = regex.exec(text)?.[0];
	
			if (match) {
				let startIndex = match.indexOf('http');
				let endIndex = match.lastIndexOf('/');
	
				basUrl = match.substring(startIndex, endIndex + 1);
			}
		});
	} 

	return basUrl;
}

function _getWebView(location: string) {
	return `<!DOCTYPE html>
	<html lang="en">
		<head>
			<title>HTML Full-screen iframe (100% Height and Width)</title>
			<style>
				body{
					margin: 0; /* Remove default margin */
				}
				iframe{      
					display: block; 
					height: 100vh; 
					width: 100vw;   
					border: none;
					background: white;
				}
			</style>
		</head>
		<body>
			<iframe src='${location}' sandbox="allow-scripts allow-same-origin"></iframe>
		</body>
	</html>`;
}
