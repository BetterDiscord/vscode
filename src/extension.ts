import {
  CodeLens,
  commands,
  languages,
  Range,
  type ExtensionContext,
  type CodeLensProvider,
  type TextDocument,
  window,
} from 'vscode';
import { WebSocketServer } from 'ws';
import vscode from 'vscode'

class GetByKeysCodeLensProvider implements CodeLensProvider {
  provideCodeLenses(document: TextDocument) {
    const codeLenses: CodeLens[] = [];
    const text = document.getText();
    const regex = /getByKeys\s*\(([^)]*)\)/g;
    let match;
    while ((match = regex.exec(text)) !== null) {
      const strings = match[1].match(/['"]([^'"]*)['"]/g)?.map(s => s.slice(1, -1)) || [];
      if (strings.length === 0) continue;
      const query = strings.map(s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
      const pos = document.positionAt(match.index);
      const range = new Range(pos.line, 0, pos.line, 0);
      codeLenses.push(
        new CodeLens(range, {
          title: 'BetterDiscord: Try to Find',
          command: 'bdcompanion.tryFind',
          arguments: [query],
        })
      );
      codeLenses.push(
        new CodeLens(range, {
          title: 'BetterDiscord: Open Module Source',
          command: 'bdcompanion.openSource',
          arguments: [query],
        })
      );
    }
    return codeLenses;
  }
}

export function activate(context: ExtensionContext) {
  const WS = new WebSocketServer({ port: 8080 });
  let socket: any = null;
  WS.on('connection', ws => {
    socket = ws;
    ws.on('message', async data => {
      const result = JSON.parse(data.toString());
      if (result.source) {
        const doc = await vscode.workspace.openTextDocument({
          content: result.source,
          language: 'javascript',
        });
        await vscode.window.showTextDocument(doc);
        await vscode.commands.executeCommand('editor.action.formatDocument');
      } else {
        window.showInformationMessage(result.message);
      }
    });
  });
  context.subscriptions.push(
    commands.registerCommand('bdcompanion.tryFind', async (query: string) => {
      socket.send(JSON.stringify({ action: 'tryFind', query }));
    }),
    commands.registerCommand('bdcompanion.openSource', async (query: string) => {
      socket.send(JSON.stringify({ action: 'openSource', query }));
    }),
    languages.registerCodeLensProvider({ scheme: 'file' }, new GetByKeysCodeLensProvider())
  );
}
