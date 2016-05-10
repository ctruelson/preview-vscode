"use strict";
import { workspace, window, ExtensionContext, commands,
    TextEditor, TextDocumentContentProvider, EventEmitter,
    Event, Uri, TextDocumentChangeEvent, ViewColumn,
    TextEditorSelectionChangeEvent,
    TextDocument, Disposable } from "vscode";
import * as documentContentManagerInterface from "./documentContentManagerInterface";


export class CssDocumentContentManager implements documentContentManagerInterface.DocumentContentManager {


    private COMMAND: string = "vscode.previewHtml";
    // 生成当前编辑页面的可预览代码片段
    // @Override
    public createContentSnippet(): string {
        let editor = window.activeTextEditor;

        let previewSnippet: string = this.generatePreviewSnippet(editor);
        if (previewSnippet == undefined) {
            return this.errorSnippet("Active editor doesn't show a CSS document - no properties to preview.");
        }
        return previewSnippet;
    }

    // @Override
    public sendPreviewCommand(previewUri: Uri, displayColumn: ViewColumn): Thenable<void> {
        return commands.executeCommand(this.COMMAND, previewUri, displayColumn).then((success) => {
        }, (reason) => {
            console.warn(reason);
            window.showErrorMessage(reason);
        });
    }

    // 获得错误信息对应的html代码片段
    private errorSnippet(error: string): string {

        return `
                <body>
                #${error}
                </body>
                `;
    }
    private CSSSnippet(properties: string): string {
        if (properties == undefined) {
            return this.errorSnippet(`Active editor doesn't show any css properity - no properties to preview.`);
        }
        return `<style type=\"text/css\">
                #css_property {
                    ${properties}
                    }
                </style>
                <body>
                    <div>Preview of the CSS properties</div>
                    <hr>
                    <div id=\"css_property\">Hello World</div>
                </body>
                `;

    }

    private getSelectedCSSProperity(editor: TextEditor): string {
        // 获取当前页面文本
        let text = editor.document.getText();
        // 获取当前鼠标选中段落的起始位置        
        let startPosOfSelectionText = editor.document.offsetAt(editor.selection.anchor);
        let startPosOfCSSProperity = text.lastIndexOf('{', startPosOfSelectionText);
        let endPosOfCSSProperity = text.indexOf('}', startPosOfCSSProperity);

        if (startPosOfCSSProperity === -1 || endPosOfCSSProperity === -1) {
            return this.errorSnippet("Cannot determine the rule's properties.");
        }

        var properties = text.slice(startPosOfCSSProperity + 1, endPosOfCSSProperity);
        return properties;
    }

    // 生成预览编辑页面
    private generatePreviewSnippet(editor: TextEditor): string {
        return this.CSSSnippet(this.getSelectedCSSProperity(editor));
    }

}