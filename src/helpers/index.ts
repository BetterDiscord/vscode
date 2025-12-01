import vscode = require('vscode');

export async function startOpenSource(source: string) {
  const doc = await vscode.workspace.openTextDocument({
    content: source,
    language: 'javascript',
  });
  await vscode.window.showTextDocument(doc);
  await vscode.commands.executeCommand('editor.action.formatDocument');
}
