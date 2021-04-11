import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { DotNetFile } from './DotNetFile';
import { DotNetFileProject } from "./DotNetFileProject";
import { DotNetFileSolution } from "./DotNetFileSolution";
import { SolutionHelperFactory, ISolutionHelper } from './SolutionHelper';

export class DotNetSolutionExplorerProvider implements vscode.TreeDataProvider<DotNetFile> {
    constructor(private workspaceAbsolutePath: string) { }

    private root: DotNetFile | undefined;
    private solutionHelper: ISolutionHelper | undefined;

    getTreeItem(element: DotNetFile): vscode.TreeItem {
        return element;
    }

    getChildren(element?: DotNetFile): Thenable<DotNetFile[]> {
        if (!this.workspaceAbsolutePath) {
            vscode.window.showInformationMessage('No files in empty workspace');
            return Promise.resolve([]);
        }

        if (element) {
            return Promise.resolve(element.getChildren());
        }
        else {
            return this.getRoot();
        }
    }

    private async getRoot(): Promise<DotNetFile[]> {
        if (this.root) { return [this.root]; }

        let solutions = await vscode.workspace.findFiles("**/*.sln");
        let slnPathObjects = solutions.map((x) => {
            let slnFsPath = x.fsPath.toString();

            // .substring(1) to remove leading file delimiter: '/' or '\\'
            let slnFilename: string = slnFsPath
                .replace(this.workspaceAbsolutePath, "")
                .substring(1);

            return {
                "absolutePath": slnFsPath,
                "filename": slnFilename
            };
        });

        if (slnPathObjects.length === 0) {
            vscode.window.showErrorMessage("No .sln files were found within workspace");

            return [];
        }

        let selectedSolutionFilename = await vscode.window.showQuickPick(slnPathObjects.map(x => x.filename));

        if (selectedSolutionFilename) {
            let selectedSlnPathObject: any = slnPathObjects.find((x) => {
                return x.filename === selectedSolutionFilename;
            });

            if (!selectedSlnPathObject) {
                vscode.window.showErrorMessage("Could not find absolute path for chosen .sln filename");

                return [];
            }

            let selectedSolutionAbsolutePath = selectedSlnPathObject.absolutePath;

            let solutionHelperFactory = new SolutionHelperFactory();

            this.solutionHelper = await solutionHelperFactory.createSolutionHelperAsync(
                this.workspaceAbsolutePath, selectedSolutionAbsolutePath
            );

            this.root = await DotNetFileSolution.createAsync(
                selectedSolutionAbsolutePath,
                this.solutionHelper.slnFileName
            );

            for (let i = 0; i < this.solutionHelper.dotNetProjects.length; i++) {
                let dotNetFileProject: DotNetFile = await DotNetFileProject.createAsync(
                    this.solutionHelper.dotNetProjects[i].absolutePath,
                    this.solutionHelper.dotNetProjects[i].filenameNoExtension + ".csproj"
                );

                let children: DotNetFile[] = await this.root.getChildren();

                children.push(dotNetFileProject);
            }


            return [this.root];
        }
        else {
            vscode.window.showErrorMessage("Must provide an absolute path to a .sln within workspace");
            return [];
        }
    }

    private _onDidChangeTreeData: vscode.EventEmitter<DotNetFile | undefined | null | void> = new vscode.EventEmitter<DotNetFile | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<DotNetFile | undefined | null | void> = this._onDidChangeTreeData.event;

    refresh(e: DotNetFile): void {
        if (e) {
            e.overwriteChildren(undefined);
        }

        this._onDidChangeTreeData.fire();
    }
}