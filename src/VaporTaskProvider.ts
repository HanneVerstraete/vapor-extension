import * as vscode from "vscode";
import { getSwiftExecutable } from "./utilities/utilities";

export class VaporTaskProvider implements vscode.TaskProvider {
    private vaporPromise: Thenable<vscode.Task[]> | undefined = undefined;

    constructor(workspaceRoot: string) {
        
    }

    public provideTasks(): Thenable<vscode.Task[]> | undefined {
        if (!this.vaporPromise) {
            this.vaporPromise = createVaporTask();
        }

        return this.vaporPromise;
    }

    public resolveTask(_task: vscode.Task): vscode.Task | undefined {
		const task = _task.definition.task;

		if (task) {
            const swift = getSwiftExecutable();

            let fullCwd = task.definition.cwd;
    
            const newTask = new vscode.Task(
                task.definition,
                task.scope ?? vscode.TaskScope.Workspace,
                task.name ?? "Swift Custom Task",
                "swift",
                new vscode.ProcessExecution(swift)
            );
            newTask.group = task.group;
            newTask.presentationOptions = task.presentationOptions;
    
            return newTask;
		}
		return undefined;
    }
}

async function createVaporTask(): Promise<vscode.Task[]> {
    const result: vscode.Task[] = [];
    const swift = getSwiftExecutable();

    const task = new vscode.Task(
        { type: 'swift', task: 'swift run App routes'},
        vscode.TaskScope.Workspace,
        'run routes',
        'swift',
        new vscode.ProcessExecution(swift)
    );

    task.presentationOptions = {reveal: 1, panel: 1};
    task.group = {isDefault: true, id: 'Build'};
    result.push(task);

    return result;
}

