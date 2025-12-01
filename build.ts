import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';

const result = await Bun.build({
    entrypoints: ['./src/extension.ts'],
    outdir: './dist',
    target: 'node',
    external: ['vscode'],
    minify: true,
    sourcemap: 'external'
});

if (!result.success) {
    console.error('Build failed:', result.logs);
    process.exit(1);
}

if (!existsSync('./dist')) {
    mkdirSync('./dist', { recursive: true });
}

if (existsSync('./package.json')) {
    const packageJson = JSON.parse(readFileSync('./package.json', 'utf-8'));

    packageJson.main = './extension.js';

    delete packageJson.scripts;
    delete packageJson.devDependencies;

    writeFileSync('./dist/package.json', JSON.stringify(packageJson, null, 2));
    console.log('Copied and modified package.json to dist/');
} else {
    console.log('[X] package.json not found!');
    process.exit(1);
}

const otherFiles = ['README.md', 'LICENSE'];

for (const file of otherFiles) {
    const srcPath = `./${file}`;
    const destPath = `./dist/${file}`;

    if (existsSync(srcPath)) {
        copyFileSync(srcPath, destPath);
        console.log(`Copied ${file} to dist/`);
    } else {
        console.log(`${file} not found, skipping...`);
    }
}

console.log('Build completed successfully!');