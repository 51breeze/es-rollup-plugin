import resolve from 'rollup-plugin-node-resolve';
// import cssOnly from 'rollup-plugin-css-only';
// import {uglify} from 'rollup-plugin-uglify';
// import image from '@rollup/plugin-image';
import replace from 'rollup-plugin-replace';
import url from '@rollup/plugin-url';
import postcss from 'rollup-plugin-postcss';
import vuePlugin from 'rollup-plugin-vue';
import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import esPlugin from './index.js';
import path from 'path';
const output = path.join('./test/build');
const workspace = path.join('./test/src');

const plugins=[
    {
      plugin:require('es-thinkphp'),
      options:{
				import:true,
				includes:[
					"api/config/*",
					"api/lang/*",
					'api/middleware.es',
					'api/http/Image.es'
				],
				context:{
					include:[
						/([\\\/]|^)api([\\\/])/,
						'PHPMailer/PHPMailer'
					],
					only:true
				},
				resolve:{
					using:['PHPMailer.**'],
					mapping:{
						folder:{
							"****.es::controller":"app/%1...",
							"****.es::model":"app/%1...",
							"****.es::router":"route",
							"*/lang/*.es::general":"app/lang",
							"*/*/lang/*.es::general":"app/%1/lang",
							"*/middleware/*.es::*":"app/middleware",
							"*/config/*.es::general":"config",
							"*/*/config/*.es::general":"app/%1/config",
							"**/middleware.es::general":"app/%1...",
						},
						namespace:{
							"PHPMailer.**":"PHPMailer.%0..."
						}
					}
				},
				output:path.join(output, "server" )
			}
    },
    {
      plugin:require('es-vue'),
      options:{
        version:2,
        useAbsolutePathImport:true,
        output,
        workspace
      }
    }
];

export default {
    input: './test/src/Index.es',
   // input: './src/index.js',
    output: {
        format: 'iife',
        file: './test/build/bundle.js',
        name: 'bundle',
        sourcemap: false,
    },
    context:"this",
    plugins: [
        resolve({extensions:[ '.mjs', '.js','.vue','.es']}),
        esPlugin({
            mode:"development",
            builder:plugins[1],
            plugins:[plugins[0]],
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