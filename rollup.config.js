import resolve from 'rollup-plugin-node-resolve';
import cssOnly from 'rollup-plugin-css-only';
import {uglify} from 'rollup-plugin-uglify';
import image from '@rollup/plugin-image';
import replace from 'rollup-plugin-replace';
import url from '@rollup/plugin-url';
import postcss from 'rollup-plugin-postcss';
import vuePlugin from 'rollup-plugin-vue';
import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import esPlugin from './lib/loader';
import path from 'path';
const output = path.join('./test/build');
const workspace = path.join('./test/src');

const plugins=[
    {
      builder:require('../es-php'),
      options:{
        output,
        workspace
      }
    },
    {
      builder:require('../es-vue'),
      options:{
        module:'es',
        webComponent:'vue',
        webpack:true,
        useAbsolutePathImport:true,
        output,
        workspace
      }
    }
];

export default {
    input: './test/src/Index.es',
    output: {
        format: 'iife',
        file: './test/build/bundle.js',
        name: 'bundle',
        sourcemap: false,
    },
    plugins: [
        resolve({extensions:[ '.mjs', '.js','.vue','.es']}),
        esPlugin({
            mode:"development",
            client:plugins[1],
            server:plugins[0],
        }),
        vuePlugin({
            css:true,
            //compiler:true,
        }),
        babel({
            babelrc: false,
            extensions:['.js','.vue'],
            include:/node_modules\/element\-ui\/packages\//i,
            presets: [
              ['@babel/preset-env'],
              ['@vue/babel-preset-jsx'],
            ],
        }),
        commonjs(),
        postcss({
          extract: true,
          
        }),
      //  image(),
        url({
          destDir:output,
          limit:0
        }),
        replace({
          'process.env.NODE_ENV': JSON.stringify('development'),
          'process.env.VUE_ENV': JSON.stringify('browser')
        }),
        //uglify(),

        // cssOnly({
        //   output: 'bundle.css'
        // }),
    ],
    //external:[ 'vue' ]
}