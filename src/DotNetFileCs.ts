import * as vscode from 'vscode';
import * as path from 'path';
import { DotNetFile, DotNetFileKind } from './DotNetFile';

export class DotNetFileCs extends DotNetFile {
    private constructor(
        public readonly absolutePath: string,
        public readonly filename: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly parent: DotNetFile
    ) {
        super(absolutePath, filename, collapsibleState, DotNetFileKind.cs, parent);

        let uri: vscode.Uri = vscode.Uri.parse(absolutePath);

        this.iconPath = {
            light: path.join(__filename, '..', '..', 'resources', 'light', 'fileCsIcon.svg'),
            dark: path.join(__filename, '..', '..', 'resources', 'dark', 'fileCsIcon.svg')
        };

        this.command = {
            "command": "dotnet-solution-explorer.openFile",
            "title": "open",
            "arguments": [uri]
        };

        if(parent.namespaceString) {
            this.namespaceString = parent.namespaceString;
        }
        
        this.namespaceString += "." + filename.replace(".cs", "");
    }

    public static createAsync(absolutePath: string, filename: string, parent: DotNetFile): DotNetFile {
        return new DotNetFileCs(absolutePath, filename, vscode.TreeItemCollapsibleState.None, parent);
    }

    public async getChildren(): Promise<DotNetFile[]> {
        if (this.children) {
            return Promise.resolve(this.children);
        }
        else {
            this.children = [];
            return Promise.resolve(this.children);
        }
    }

    public tryFosterChildren(): Promise<void> {
        return Promise.resolve();
    }
}
