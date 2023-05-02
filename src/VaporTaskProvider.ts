import * as vscode from "vscode";

function createPrintRoutesTask(): vscode.Task {
    return createSwiftTask('swift run App routes', 'Print All Routes', vscode.TaskGroup.Build);
}

function createSwiftTask(command: string, name: string, group?: vscode.TaskGroup): vscode.Task {
    let task = new vscode.Task(
        { type: 'vapor', task: command },
        vscode.workspace.workspaceFolders?.[0] ?? vscode.TaskScope.Workspace,
        name,
        'vapor',
        new vscode.ShellExecution(command)
    );

    task.detail = `${command}`;
    task.group = group;
    return task;
}

export class VaporTaskProvider implements vscode.TaskProvider {

    constructor(private workspaceRoot: string) { }

    async provideTasks(token: vscode.CancellationToken): Promise<vscode.Task[]> {
        let tasks = [
            createPrintRoutesTask(),
        ];

        return tasks;
    }

    resolveTask(task: vscode.Task, token: vscode.CancellationToken): vscode.Task {
        let newTask = new vscode.Task(
            task.definition,
            vscode.TaskScope.Workspace,
            task.name || 'Custom Task',
            'vapor',
            new vscode.ShellExecution(task.definition.command)
        );
        newTask.detail = task.detail ?? `${task.definition.command}`;
        newTask.group = task.group;
        return newTask;
    }
}