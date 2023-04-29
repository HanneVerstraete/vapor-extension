import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.commands.registerCommand('renderLeaf', async () => {
			const panel = vscode.window.createWebviewPanel(
				'leafRendering', 
				'Leaf Render', 
				vscode.ViewColumn.Two,
				{}
			);

			const convertedTemplate = await _convertToHtml(_getLeafTemplate());

			panel.webview.html = convertedTemplate;

			let timer = setTimeout(() => {}, 0);

			vscode.workspace.onDidChangeTextDocument(() => {
				clearTimeout(timer);

				timer = setTimeout(async () => {
					const convertedTemplate = await _convertToHtml(_getLeafTemplate());
	
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

async function _convertToHtml(template: string): Promise<string> {
	const dummyData: Record<string, any> = _getDummyData((template));

	let result = template;
	
	result = await _convertImports(result);
	result = _convertExportsAndExtensions(result);
	result = _convertIfStatements(result);
	result = _convertForLoops(result, dummyData);
	result = _convertVariables(result, dummyData);
	result = _convertCount(result, dummyData);

	return result;
}

async function _convertImports(result: string): Promise<string> {
	const reg = /#import[(]["](.*)["][)]/;

	// TO DO also be able to find path if file is in different folder?
	const currentlyOpenTabfilePath = vscode.window?.activeTextEditor?.document?.fileName ?? '';
	const basePath = currentlyOpenTabfilePath.substring(0, currentlyOpenTabfilePath.lastIndexOf('/'));

	let arr;

	while ((arr = reg.exec(result)) !== null) {
		await vscode.workspace.openTextDocument(basePath + '/' + arr[1] + '.leaf').then((document) => {
			let importedTemplate = document.getText();

			result = result.replace(reg, importedTemplate);	
		});
	}

	return result;
}

function _convertExportsAndExtensions(result: string): string {
	const reg = /#((export[(]["](.*)["][)][:]|endexport)|(extend[(]["](.*)["][)][:]|endextend))/;
	let arr;
	
	while ((arr = reg.exec(result)) !== null) {
		result = result.replace(reg, '');
	}

	return result;
}

function _convertIfStatements(result: string): string {
	const regIfElse = /#if[(]([^)]*)[)]:((.|\n)*)#else:((.|\n)*)#endif/;
	const regIf = /#if[(]([^)]*)[)]:((.|\n)*)#endif/;

	let arrIfElse;
	let arrIf;

	while ((arrIf = regIf.exec(result)) !== null) {
		arrIfElse = regIfElse.exec(result);

		if (arrIfElse && eval(arrIfElse[1]) === true) {
			result = result.replace(regIfElse, arrIfElse?.[2] ?? '');
		} else if(arrIfElse ) {
			result = result.replace(regIfElse, arrIfElse?.[4] ?? '');
		} else if (arrIf && eval(arrIf[1]) === true) {
			result = result.replace(regIf, arrIf[2]);
		} else {
			result = result.replace(regIf, '');
		}
	}

	return result;
}

function _convertForLoops(result: string, dummyData: Record<string, any>): string {
	const regForCondition = /#for[(](.*)[)]/;
	const regForSection = /#for[(]([^)]*)[)]:((.|\n)*)#endfor/;

	let arrForCondition;
	let arrForSection;

	while ((arrForSection = regForSection.exec(result)) !== null) {
		arrForCondition = regForCondition.exec(result) ?? [];
		
		const loopConditions = arrForCondition[1]?.split(' ') ?? '';
		let toAdd = '';

		for(let i = 0; i < dummyData[loopConditions[2]].length; i++) {
			toAdd += arrForSection[2].replace(loopConditions[0], `${loopConditions[2]}[${i}]`);
		}

		result = result.replace(regForSection, toAdd);
	}	

	return result;
}

function _convertVariables(result: string, dummyData: Record<string, any>): string {
	const reg = /[#][(](.*)[)]/;
	let arr;

	while ((arr = reg.exec(result)) !== null) {
		const parName: string = arr[1];
		const parPath = parName.split(/[.\[\]]+/);

		let dummyResult = {...dummyData};

		for (let i = 0; i < parPath.length; i++) {
			dummyResult = dummyResult[parPath[i]];	
		}
		
		result = result.replace(reg, (dummyResult as unknown as string));
	}

	return result;
}

function _convertCount(result: string, dummyData: Record<string, any>): string {
	const reg = /#count[(](.*)[)]/;

	let arr;
	
	while ((arr = reg.exec(result)) !== null) {
		const parName: string = arr[1];
		
		result = result.replace(reg, dummyData[parName].length);
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
