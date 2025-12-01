# BetterDiscord Companion (W.I.P)

A VS Code extension companion for BetterDiscord development.

## Development

This was literally made within an hour and will support all types of modules.
`getModule`, `getBulk` and more.

This is a PoC for the BetterDiscord Companion App!

### Install dependencies

```bash
bun install
```

### Build the extension

```bash
bun run build
```

### Run the extension

1. Open this folder in VS Code
2. Press `F5` to open a new VS Code window with the extension loaded
3. Find `getByKeys` in your code and make sure the `./external/index.ts` is ran in the Discord electron devTools enviroment

### Package the extension

```bash
bun run package
```

This will create a `.vsix` file that can be installed in VS Code.
---