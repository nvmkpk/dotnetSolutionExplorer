import * as vscode from 'vscode';
import * as path from 'path';
import { DotNetFile, DotNetFileKind } from './DotNetFile';
import { ProjectHelper } from './ProjectHelper';
import { DotNetPathHelper } from './DotNetPathHelper';
import { DotNetProjectNugetPackageVersion } from './DotNetProjectNugetPackageVersion';
const fs = require('fs');


export class DotNetProjectNugetPackage extends DotNetFile {
    private constructor(
        public readonly absolutePath: string,
        public readonly filename: string,
        public readonly include: string,
        public readonly version: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly parent: DotNetFile
    ) {
        super(absolutePath, filename, collapsibleState, DotNetFileKind.nugetPackage, parent);

        let uri: vscode.Uri = vscode.Uri.parse(absolutePath);

        this.iconPath = {
            light: path.join(__filename, '..', '..', 'resources', 'light', 'fileTxtIcon.svg'),
            dark: path.join(__filename, '..', '..', 'resources', 'dark', 'fileTxtIcon.svg')
        };

        // this.command = {
        //     "command": "dotnet-solution-explorer.openFile",
        //     "title": "open",
        //     "arguments": [uri]
        // };
    }

    public static async createAsync(absolutePath: string, filename: string, include: string, version: string, parent: DotNetFile): Promise<DotNetFile> {
        return new DotNetProjectNugetPackage(absolutePath, filename, include, version, vscode.TreeItemCollapsibleState.Collapsed, parent);
    }

    public async getChildren(): Promise<DotNetFile[]> {
        if (this.children) {
            return Promise.resolve(this.children);
        }
        else {
            this.children = [];

            this.children.push(await DotNetProjectNugetPackageVersion.createAsync(this.absolutePath, this.version, this.parent));

            return Promise.resolve(this.children);
        }
    }

    public tryFosterChildren(): Promise<void> {
        return Promise.resolve();
    }

    contextValue = "dotnet-solution-explorer.nuget-package";
}

