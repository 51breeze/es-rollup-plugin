const Compiler = require("easescript/lib/core/Compiler");
const rollupPluginUtils = require('rollup-pluginutils');
const path = require('path');
const vuePlugin=require("@vitejs/plugin-vue");
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

function parseResource(id) {
    const [resourcePath, rawQuery] = id.split(`?`, 2);
    const query = Object.fromEntries(new URLSearchParams(rawQuery));
    return {
        resourcePath,
        resource:id,
        query
    };
}

function createFilter(include = [/\.es(\?(id|type|vue)|$)/i], exclude = []) {
    const filter = rollupPluginUtils.createFilter(include, exclude);
    return id => filter(id);
}

function makePlugins(plugins){
    var plugins = null;
    var dependencies = null;
    var fsWatcher = null;
    if( Array.isArray(plugins) && plugins.length > 0 ){
        dependencies = new WeakSet();
        plugins = plugins.map( plugin=>compiler.applyPlugin(plugin) );
        const make = (compilation)=>{
            try{
                plugins.forEach( plugin=>{
                    const context = plugin.options.context;
                    if( context ){
                        if( context.exclude && context.exclude.some( rule=>rule.test(compilation.file) ) ){
                            return;
                        }
                        if( context.include && !context.include.some( rule=>rule.test(compilation.file) ) ){
                            return;
                        }
                    }
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
    return {plugins, dependencies, fsWatcher}
}

function EsPlugin(options={}){
    const filter = createFilter(options.include, options.exclude);
    Object.assign(compiler.options, options);
    const builder = compiler.applyPlugin(options.builder);
    const {plugins, dependencies} = makePlugins(options.plugins);
    const rawOpts = builder.options || {};
    const inheritPlugin = vuePlugin(Object.assign({include:/\.es$/}, rawOpts.vueOptions||{}));
    const isVueTemplate = rawOpts.format ==='vue-raw' || rawOpts.format ==='vue-template' || rawOpts.format ==='vue-jsx';
    return {
        name: 'easescript',
        handleHotUpdate(ctx) {
            if(isVueTemplate){
                return inheritPlugin.handleHotUpdate.call(this, ctx);
            }
        },
        config(config) {
            if(isVueTemplate){
                return inheritPlugin.config.call(this, config);
            }
            return config;
        },
        configResolved(config){
            if(isVueTemplate){
                inheritPlugin.configResolved.call(this, config);
            }
        },
        configureServer(server){
            if(isVueTemplate){
                inheritPlugin.configureServer.call(this, server);
            }
        },
        buildStart(){
            if(isVueTemplate){
                inheritPlugin.buildStart.call(this);
            }
        },
        async resolveId(id){
            if( filter(id) && !path.isAbsolute(id) ){
                const className = compiler.getFileClassName(id).replace(/\//g,'.');
                const desc = Namespace.globals.get(className);
                if( desc && desc.compilation ){
                    return desc.compilation.file;
                }
            }
            if(isVueTemplate){
                return await inheritPlugin.resolveId.call(this, id);
            }
            return null;
        },
        
        load( id, opt ){
            if(!isVueTemplate)return null;
            return inheritPlugin.load.call(this, id, opt);
        },
        transform(code, id, opts){
            if ( !filter(id) ) return;
            const {resourcePath,resource,query} = parseResource(id);
            return new Promise((resolve,reject)=>{
                const compilation = compiler.createCompilation(resourcePath);
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
                        
                            if(options.hot){
                                this.addWatchFile( compilation.file );
                            }

                            const resourceFile = normalizePath(compilation.file, resource, query);
                            let content = plugin.getGeneratedCodeByFile(resourceFile);
                            if( content ){
                                if( isVueTemplate ){
                                    try{
                                        if( query.vue !== void 0 && query.type){
                                            return resolve(inheritPlugin.transform.call(this, content, resource, opts));
                                        }else if( /^<(template|script|style)>/.test(content) ){
                                            return resolve(inheritPlugin.transform.call(this, content, resource, opts));
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
                                resolve({code:content, map:plugin.getGeneratedSourceMapByFile(resourceFile)||{}});
                            }else{
                                reject( new Error(`'${resourceFile}' is not exists.` ) );
                            }
                        }
                    });
                }else{
                    reject( new Error(`'${resource}' is not exists.` ) );
                }
            });
        }
    }
}

export default EsPlugin;