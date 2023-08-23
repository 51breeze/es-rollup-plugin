const Compiler = require("easescript/lib/core/Compiler");
const rollupPluginUtils = require('rollup-pluginutils');
const decode = require('querystring/decode');
const path = require('path');
const compiler = new Compiler();
compiler.initialize();
process.on('exit', (code) => {
    compiler.dispose();
});

function errorHandle(context, compilation){
    return compilation.errors.filter( error=>{
        if( error.kind === 1){
            context.warn( error.toString() )
            return false;
        }else{
            return true;
        }
    }).map( item=>item.toString() );
}

function normalizePath(file, resource, query={}){
    return query.vue == void 0 ? compiler.normalizePath(resource) : compiler.normalizePath(file)
}

var _vueLoader = null;
function getVueLoader(options){
    if(_vueLoader)return _vueLoader;
    let vueLoader = options.vueLoader;
    if( !vueLoader ){
        vueLoader = require('vue-loader').default;
    }else if( vueLoader.default ){
        vueLoader = vueLoader.default
    }
    if( typeof vueLoader !=='function' ){
        throw new Error('Vue Loader is unavailable. please try `npm install vue-loader@^17.0.0`')
    }
    _vueLoader = vueLoader;
    return _vueLoader;
}


function createFilter(include = [/\.es(\?(id|type|vue)|$)/i], exclude = []) {
    const filter = rollupPluginUtils.createFilter(include, exclude);
    return id => filter(id);
}

function RollupPlugin(options={}){
    const isEs = createFilter(options.include, options.exclude);
    Object.assign(compiler.options, options);
    var builder = compiler.applyPlugin(options.builder);
    var plugins = null;
    var dependencies = new WeakSet();
    var fsWatcher = null;
    if( Array.isArray(options.plugins) && options.plugins.length > 0 ){
        plugins = options.plugins.map( plugin=>compiler.applyPlugin(plugin) );
        const make = (compilation)=>{
            try{
                plugins.forEach( plugin=>{
                    if( compiler.isPluginInContext(plugin , compilation) ){
                        if( !dependencies.has(compilation) ){
                            dependencies.add(compilation);
                            if( fsWatcher ){
                                fsWatcher.add( compilation.file );
                            }
                        }
                        compilation.build(plugin,(error)=>{
                            if( error ){
                                console.error( error instanceof Error ? error : error.toString() );
                            }
                        },true);
                    }
                });
            }catch(e){
                console.error( e );
            }
        }
        const build=( compilation)=>{
            if(!compilation || compilation.isDescriptionType){
                return;
            }
            make(compilation);
        }
        if( options.watch ){
            fsWatcher = compiler.createWatcher();
            if( fsWatcher ){
                fsWatcher.on('change',(file)=>{
                    const compilation = compiler.createCompilation(file);
                    if( compilation && !compilation.isValid() ){
                        compilation.clear();
                        build(compilation);
                    }
                });
            }
        }
        compiler.on('onCreatedCompilation', build);
    }

    return {
        name: 'easescript',
        resolveId(id){
            if ( !isEs(id) )return null;
            return id;
        },
        load( id ){
            if( !isEs(id) )return null;
            return id;
        },
        transform(code, filename){
            if ( !isEs(filename) ) return;
            var queryIndex = filename.indexOf('?');
            var query = {};
            var file = filename;
            if( queryIndex > 0 ){
                file = filename.substr(0, queryIndex);
                query = decode(filename.substr(queryIndex+1));  
            }
            
            return new Promise((resolve,reject)=>{
                const compilation = compiler.createCompilation(file);
                if( compilation ){
                    if( !compilation.isValid() ){
                        compilation.clear();
                    }
                    compilation.build(builder, (error,compilation,plugin)=>{
                        const errors = errorHandle(this, compilation);
                        if( error ){
                            errors.push( error.toString() );
                        }
                        
                        if( errors && errors.length > 0 ){
                            reject( new Error( errors.join("\r\n") ) );
                        }else{
                        
                            this.addWatchFile( compilation.file );
                            const resourceFile = normalizePath(compilation.file, filename, query);
                            let content = plugin.getGeneratedCodeByFile(resourceFile);
                            if( content ){
                                const opts = plugin.options;
                                if( (opts.format ==='vue-raw' || opts.format ==='vue-template' || opts.format ==='vue-jsx') ){
                                    try{
                                        const vueLoader = getVueLoader(options);
                                        if( query.vue !== void 0 && query.type){
                                            resolve({code:content, map:null})
                                            return;
                                        }else if( /^<(template|script|style)>/.test(content) ){
                                            content = vueLoader.call(this, content)
                                        }
                                    }catch(e){
                                        reject(e);
                                        return;
                                    }
                                }

                                if( options.hot && plugins && !compilation.isDescriptionType && compilation.pluginScopes.local && !(query && query.type === 'style') ){
                                    let hasDep = false;
                                    const addServerDeps = (compilation)=>{
                                        const deps = compilation.getCompilationsOfDependency();
                                        deps.forEach( depComp=>{
                                            if( depComp.file && depComp.pluginScopes.local && dependencies.has(depComp) ){
                                                hasDep = true;
                                                this.addWatchFile( path.normalize(depComp.file) );
                                                addServerDeps(depComp);
                                            }
                                        });
                                    };
                                    addServerDeps(compilation);
                                    if( hasDep ){
                                        content += `\r\n/*Service hot by ${Math.random()}*/`;
                                    }
                                }
                                resolve({code:content, map:plugin.getGeneratedSourceMapByFile(resourceFile)});
                                return;
                            }else{
                                reject( new Error(`'${resourceFile}' is not exists.` ) );
                            }
                        }
                    });
                }else{
                    reject( new Error(`'${file}' is not resolve.` ) );
                }
            });
        }
    }
}

export default RollupPlugin;