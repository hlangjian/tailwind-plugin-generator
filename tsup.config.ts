import { defineConfig } from 'tsup'

export default defineConfig({
    entry: {
        main: "generator.ts",
        template: "template.ts"
    },
    splitting: false,
    sourcemap: true,
    clean: true,
    format: ['esm', 'cjs'],
    dts: true
})