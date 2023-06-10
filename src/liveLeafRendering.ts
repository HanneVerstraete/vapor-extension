import * as vscode from 'vscode';

var timer: NodeJS.Timeout;
var currentlyRenderedTemplate = "";

export async function setUpLeafRendering () {
    const panel = vscode.window.createWebviewPanel(
        'leafRendering', 
        'Leaf Render', 
        vscode.ViewColumn.Two,
		{
			enableScripts: true
		}
    );
	const baseUrl = _getBaseUrl();
	const template = _getActiveTemplate();
	
    panel.webview.html = _getWebView(`${baseUrl}${template}`);

	_setEventListeners(template, panel);
}

function _getBaseUrl() {
	let path = '';
	let baseUrl = 'http://127.0.0.1:8080';

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
	
				baseUrl = match.substring(startIndex, endIndex + 1);
			}
		});
	} 

	return `${baseUrl}/leaf-preview/`;
}

function _getActiveTemplate(): string {
	let template;

	const currentlyOpenTabfilePath = vscode.window.activeTextEditor?.document?.fileName;

	if (currentlyOpenTabfilePath) {
		const fileName = currentlyOpenTabfilePath.substring(currentlyOpenTabfilePath.lastIndexOf('/') + 1);
		if (fileName.includes('.leaf')) {
			template = fileName.substring(0, fileName.lastIndexOf('.'));
		}
	}

	return template ?? '';
}

function _reloadTemplate(template: string, panel: vscode.WebviewPanel) {
	if (timer) {
		clearTimeout(timer);
	}
	
	timer = setTimeout(async () => {
		const newTemplate = _getActiveTemplate();

		if (newTemplate.length > 0) {
			currentlyRenderedTemplate = newTemplate;
		} else if (currentlyRenderedTemplate.length === 0) {
			currentlyRenderedTemplate = template;
		}
	
		const timeStamp = Date.now();
		const baseUrl = _getBaseUrl();
		
		//add date to url, so url is always different and iframe will always reload
		panel.webview.html = _getWebView(`${baseUrl}${currentlyRenderedTemplate}?${timeStamp}`);
	}, 500);
}

function _setEventListeners(template: string, panel: vscode.WebviewPanel) {
	vscode.workspace.onDidChangeTextDocument(async () => {
		_reloadTemplate(template, panel);
   	});

   vscode.window.onDidChangeActiveTextEditor(async () => {
		_reloadTemplate(template, panel);
	});
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
			<iframe id="webViewFrame" src='${location}' sandbox="allow-scripts allow-same-origin"></iframe>
			<script>
				document.getElementById('webViewFrame').src = '${location}
			</script>
		</body>
	</html>`;
}
