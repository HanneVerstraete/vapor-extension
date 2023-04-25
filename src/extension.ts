import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.commands.registerCommand('renderLeaf', () => {
			const panel = vscode.window.createWebviewPanel(
				'leafRendering', 
				'Leaf Render', 
				vscode.ViewColumn.Two,
				{}
			);

			const convertedTemplate = _convertToHtml(_getLeafTemplate());

			panel.webview.html = convertedTemplate;

			let timer = setTimeout(() => {}, 0);

			vscode.workspace.onDidChangeTextDocument(() => {
				clearTimeout(timer);

				timer = setTimeout(() => {
					const convertedTemplate = _convertToHtml(_getLeafTemplate());
	
					panel.webview.html = convertedTemplate;
				}, 400);
		   });
		})
	  );
}

function _getLeafTemplate(): string {
	const editor = vscode.window.activeTextEditor;

	if (editor) {
		return editor.document.getText();
	}

	return '';
}

function _convertToHtml(template: string): string {
	const reg = /[#][(](.*)[)]/;
	
	let arr;
	let result = template;
	let dummyData: Record<string, any> = _getDummyData((template));
	
	while ((arr = reg.exec(result)) !== null) {
		const parName: string = arr[1];
		
		result = result.replace(reg, dummyData[parName]);
	}

	return result;
}

function _getDummyData(template: string): Record<string, any> {
	const reg = /<!-- ([^>]*) -->/g;
	const matches = template.match(reg) ?? [];

	let dummyData = {};

	matches.forEach((match) => {
		if (!match.includes('dummyData')) {
			return;
		}

		const toConvert = match.substring(match.indexOf('{'), match.lastIndexOf('}') + 1);
		
		// TO DO should convert to json of choose other format/way + add catching of invalid json
		const formattedToJson = JSON.parse(toConvert);
		
		dummyData = {...dummyData, ...formattedToJson};
	});

	return dummyData;
}

export function deactivate() {}
