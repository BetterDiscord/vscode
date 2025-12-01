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
import { WebSocketServer, WebSocket } from 'ws';
import vscode = require('vscode');
import { startOpenSource } from './helpers';

const regex = /getByKeys\s*\(([^)]*)\)/g;

class GetByKeysCodeLensProvider implements CodeLensProvider {
  provideCodeLenses(document: TextDocument) {
    const codeLenses: CodeLens[] = [];
    const text = document.getText();
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

const WS = new WebSocketServer({ port: 8080 });

export function activate(context: ExtensionContext) {
  let socket: WebSocket | null = null;

  window.showInformationMessage('BDCompanion: Server Started');

  WS.on('connection', ws => {
    socket = ws;
    window.showInformationMessage('BDCompanion: You connected!');

    ws.on('message', async data => {
      const result = JSON.parse(data.toString());
      switch (true) {
        // there has got to be a better modular way to make this happen, right?
        case !!result.source:
          startOpenSource(result.source, result.id);
          // if websocket returned source then display the source of the module source to the user.
          break;
        case !!result.message:
          window.showInformationMessage(result.message);
          // If websocket returned success
          break;
      }
    });

    ws.on('close', () => {
      socket = null;
      window.showInformationMessage('BDCompanion: Client Disconnected');
    });
  });

  const sendCommand = (action: string, query: string) => {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      window.showErrorMessage('BetterDiscord client not connected.');
      return;
    }
    // if the ws is ran inside of activate it DID NOT ALWAYS EXIST

    try {
      socket.send(JSON.stringify({ action, query }));
    } catch (error) {
      window.showErrorMessage(`Failed to send command: ${error}`);
    }
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
