import fs from 'fs-extra'
import path from 'path'
import babel from '@rollup/plugin-babel'
import commonjs from '@rollup/plugin-commonjs'
import vue from 'rollup-plugin-vue'
import nodeResolve from '@rollup/plugin-node-resolve'
import postcss from 'rollup-plugin-postcss'
import { terser } from 'rollup-plugin-terser'
import typescript from 'rollup-plugin-typescript2'

const componentsPath = path.join(__dirname, '../packages')
const libPath = path.join(__dirname, '../lib')
const extensions = ['.js', '.jsx', '.ts', '.tsx']

const external = ['vue', '@babel/runtime']

const plugins = (name) => [
  typescript({
    tsconfig: './tsconfig.json',
    clean: true,
  }),
  babel({
    exclude: 'node_modules/**',
    extensions,
    babelHelpers: 'runtime',
    presets: ['@babel/preset-env', '@babel/preset-typescript'],
    plugins: ['@vue/babel-plugin-jsx', '@babel/plugin-transform-runtime'],
  }),
  commonjs(),
  vue(),
  nodeResolve({
    browser: true,
    extensions,
  }),
  terser(),
  postcss({
    extensions: ['.css', '.less'],
    minimize: true,
    extract: path.resolve(
      (() => {
        if (name) {
          return `./lib/${name}/index.css`
        }
        return './lib/index.css'
      })(),
    ),
  }),
]

const globals = {
  vue: 'vue',
}

const cjsOutput = {
  format: 'cjs',
  exports: 'named',
  entryFileNames: '[name]/index.js',
  dir: 'lib',
  globals,
}

export default (async () => {
  await fs.remove(libPath)
  const files = await fs.readdir(componentsPath)
  const components = await Promise.all(
    files.map(async (name) => {
      const comPath = path.join(componentsPath, name)
      const r = () => {
        if (name === 'Modal') return 'index.ts'
        return 'index.tsx'
      }
      const entry = path.join(comPath, r())
      const stat = await fs.stat(comPath)
      if (!stat.isDirectory()) return null
      const hasFile = await fs.pathExists(entry)
      if (!hasFile) return null
      return { name: name.toLowerCase(), url: entry }
    }),
  )
  return [
    ...components
      .filter((r) => r)
      .map(({ name, url }) => ({
        input: { [name]: url },
        output: [cjsOutput],
        external,
        plugins: plugins(name),
      })),
    {
      input: { index: path.join(componentsPath, 'index.ts') },
      output: [
        {
          ...cjsOutput,
          entryFileNames: 'index.js',
        },
      ],
      external,
      plugins: plugins(),
    },
  ]
})()
