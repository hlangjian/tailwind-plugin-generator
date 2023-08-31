import fg from "fast-glob";
import postcss from "postcss";
import postcssJs from "postcss-js";
import { program } from "commander";
import path from "node:path";
import chokidar from 'chokidar'
import chalk from 'chalk';
import { readFileSync, writeFileSync } from "node:fs";

program
    .option("-t, --template [path]", "tailwindcss plugin path", "@joyfour/tailwind-plugin-generator/template")
    .option("-f, --files [path]", "watch files", "**/*.css")
    .option("-i, --ignore [path]", "ignore files", "node_modules/**/tailwindcss/**/*.css")
    .option("-o, --output [path]", "path of generated plugin")
    .option("-w, --watch", "watch mode")
    .parse();

const options = program.opts<{
    template: string;
    output: string;
    files: string;
    ignore: string;
    watch: boolean
}>();

const { template, output = template.endsWith('ts') ? 'plugin.ts' : 'plugin.js', files, watch, ignore } = options;

const banner = `
// This file is auto-generated at ${new Date().toLocaleString()}
`;

const cssToJs = (css: string) => {
    const root = postcss.parse(css)
    root.walkAtRules(rule => {
        if (rule.name === 'apply') {
            rule.append('')
        }
    })

    return JSON.stringify(postcssJs.objectify(root));
}


const generatePlugin = () => {
    const filePaths = files.split(',').map(file => path.resolve(file).replace(/\\/g, '/'))
    const ignorePaths = ignore.split(',').map(file => path.resolve(file).replace(/\\/g, '/'))
    const entries = fg.globSync(filePaths, { dot: true, ignore: ignorePaths });

    const cssObjects = entries.map(entry => {
        const css = readFileSync(entry, { encoding: 'utf-8' })
        return `addComponents(${cssToJs(css)})`
    })

    const templateUrl = require.resolve(template)

    const code = readFileSync(templateUrl, { encoding: 'utf-8' });

    const pluginCode = code.replace('"--Placeholder--"', cssObjects.join(";"));

    writeFileSync(output, [banner, pluginCode].join('\n'));
}

console.log(
    chalk.magenta('tw-generator: ') +
    `Generated plugin in ${chalk.underline(path.resolve(output))}`
)

generatePlugin()

if (watch) {
    console.log(
        chalk.magenta('tw-generator: ') +
        `Watching files ${chalk.underline(path.resolve(files))}`
    )

    const watcher = chokidar.watch(files, {
        ignored: /(^|[\/\\])\../,
        persistent: true,
        ignoreInitial: true
    })

    watcher
        .on('add', () => generatePlugin())
        .on('change', () => generatePlugin())
        .on('unlink', () => generatePlugin())
}