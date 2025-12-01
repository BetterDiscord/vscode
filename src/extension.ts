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
import vscode = require('vscode');
import { startOpenSource } from './helpers';

class GetByKeysCodeLensProvider implements CodeLensProvider {
  provideCodeLenses(document: TextDocument) {
    const codeLenses: CodeLens[] = [];
    const text = document.getText();
    const regex = /getByKeys\s*\(([^)]*)\)/g;
    let match;
    while ((match = regex.exec(text)) !== null) {
      const strings = match[1].match(/['"]([^'"]*)['"]/g)?.map(s => s.slice(1, -1)) || [];
      if (strings.length === 0) continue;
      // checking for empty strings array to avoid creating useless code lenses
      // you cant getByKeys with no keys after all
      const query = strings.map(s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
      const pos = document.positionAt(match.index);
      const range = new Range(pos.line, 0, pos.line, 0);
      
      // CodeLense is what creates the clickable links in the editor
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
  let socket: WebSocket | null = null;

  WS.on('connection', ws => {
    socket = ws;

    ws.on('message', async data => {
      const result = JSON.parse(data.toString());
      switch (true) {
        // there has got to be a better modular way to make this happen, right?
        case !!result.source:
          startOpenSource(result.source);
          // if websocket returned source then display the source of the module source to the user.
          break;
        case !!result.message:
          window.showInformationMessage(result.message);
          // If websocket returned success
          break;
      }
    });
  });

  const sendCommand = (action: string, query: string) => {
    socket.send(JSON.stringify({ action, query }));
    // socket technically always exist but typescript is being dumb
  };

  context.subscriptions.push(
    commands.registerCommand('bdcompanion.tryFind', async (query: string) => {
      sendCommand('tryFind', query);
    }),
    commands.registerCommand('bdcompanion.openSource', async (query: string) => {
      sendCommand('openSource', query);
    }),
    languages.registerCodeLensProvider({ scheme: 'file' }, new GetByKeysCodeLensProvider()),
    new vscode.Disposable(() => WS.close())
    // woah, look at that a disposable
  );
}
