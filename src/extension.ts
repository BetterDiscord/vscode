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

const PATTERNS = [
  {
    regex: /getByKeys\s*\(([^)]*)\)/g,
    type: 'getAllByKeys',
  },
  {
    regex: /getByStrings\s*\(([^)]*)\)/g,
    type: 'getAllByStrings',
  },
  {
    regex: /getBySource\s*\(([^)]*)\)/g,
    type: 'getAllBySource',
  },
];

interface ParsedMatch {
  strings: string[];
  options: Record<string, any>;
}

function parseMethodCall(argsText: string): ParsedMatch {
  const strings: string[] = [];
  const options: Record<string, any> = {};

  const stringMatches = argsText.match(/['"]([^'"]*)['"]/g);
  if (stringMatches) {
    strings.push(...stringMatches.map(s => s.slice(1, -1)));
  }

  const optionsMatch = argsText.match(/\{([^}]*)\}/);
  if (optionsMatch) {
    const optionsText = optionsMatch[1];

    const keyValueRegex = /(['"]?)(\w+)\1\s*:\s*([^,}]+)/g;
    let kvMatch;

    while ((kvMatch = keyValueRegex.exec(optionsText)) !== null) {
      const key = kvMatch[2];
      let value: any = kvMatch[3].trim();

      if (value === 'true') value = true;
      else if (value === 'false') value = false;

      options[key] = value;
    }
  }

  return { strings, options };
}

class BDCodeLensProvider implements CodeLensProvider {
  provideCodeLenses(document: TextDocument) {
    const codeLenses: CodeLens[] = [];
    const text = document.getText();

    for (const pattern of PATTERNS) {
      const regex = new RegExp(pattern.regex.source, pattern.regex.flags);
      let match;

      while ((match = regex.exec(text)) !== null) {
        const parsed = parseMethodCall(match[1]);

        if (parsed.strings.length === 0) continue;

        const query = parsed.strings.map(s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
        const pos = document.positionAt(match.index);
        const range = new Range(pos.line, 0, pos.line, 0);

        codeLenses.push(
          new CodeLens(range, {
            title: `BetterDiscord: Try to Find (${pattern.type})`,
            command: 'bdcompanion.tryFind',
            arguments: [query, pattern.type, parsed.options],
          })
        );
        codeLenses.push(
          new CodeLens(range, {
            title: `BetterDiscord: Open Module Source (${pattern.type})`,
            command: 'bdcompanion.openSource',
            arguments: [query, pattern.type, parsed.options],
          })
        );
      }
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

      if (result.multiple && result.modules) {
        const items = result.modules.map((mod: any, index: number) => ({
          label: `Module ${mod.id}`,
          description: `Exports: ${mod.exports.join(', ') || 'none'}`,
          moduleData: mod,
        }));

        const selected = await window.showQuickPick(items, {
          placeHolder: `Found ${result.modules.length} modules. Select which to open:`,
        });

        // wait this is poggers???
        // showQuickPick is really nice.

        if (selected) {
          startOpenSource(selected.moduleData.source, selected.moduleData.id);
        }
      } else if (result.source) {
        startOpenSource(result.source, result.id);
      } else if (result.message) {
        if (result.error) {
          window.showErrorMessage(result.message);
        } else {
          window.showInformationMessage(result.message);
        }
      }
    });

    ws.on('close', () => {
      socket = null;
      window.showInformationMessage('BDCompanion: Client Disconnected');
    });
  });

  const sendCommand = (
    action: string,
    query: string,
    type?: string,
    options?: Record<string, any>
  ) => {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      window.showErrorMessage('BetterDiscord client not connected.');
      return;
    }

    try {
      socket.send(JSON.stringify({ action, query, type, options }));
    } catch (error) {
      window.showErrorMessage(`Failed to send command: ${error}`);
    }
  };

  context.subscriptions.push(
    commands.registerCommand(
      'bdcompanion.tryFind',
      async (query: string, type?: string, options?: Record<string, any>) => {
        sendCommand('tryFind', query, type, options);
      }
    ),
    commands.registerCommand(
      'bdcompanion.openSource',
      async (query: string, type?: string, options?: Record<string, any>) => {
        sendCommand('openSource', query, type, options);
      }
    ),
    languages.registerCodeLensProvider({ scheme: 'file' }, new BDCodeLensProvider()),
    new vscode.Disposable(() => WS.close())
    // woah, look at that a disposable
  );
}
