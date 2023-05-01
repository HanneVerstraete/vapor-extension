import * as vscode from "vscode";

const configuration = {
    get path(): string {
        return vscode.workspace.getConfiguration("swift").get<string>("path", "");
    }
};

export default configuration;