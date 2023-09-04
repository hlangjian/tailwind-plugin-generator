import { defineConfig } from 'tsup'

export default defineConfig([
    {
        entry: {
            main: "generator.ts",
        },
        splitting: false,
        sourcemap: true,
        clean: true,
        format: ['esm'],
        dts: true
    },
    {
        entry: {
            template: "template.ts"
        },
        splitting: false,
        clean: true,
        format: ['esm'],
        dts: true
    }
])