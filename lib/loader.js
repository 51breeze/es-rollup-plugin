//const Compiler = require("easescript/lib/core/Compiler");
const path = require('path');
const Compiler = require( path.join(__dirname,"../easescript2/lib/core/Compiler") );
const compiler = new Compiler({diagnose:true,debug:true,autoLoadDescribeFile:true});
const rollupPluginUtils = require('rollup-pluginutils');
const decode = require('querystring/decode');

function errorHandle(context,compilation){
    return compilation.errors.filter( error=>{
        if( error.kind === 1){
            context.warn( new Error( error.toString() ) );
            return false;
        }else{
            return true;
        }
    }).map( item=>item.toString() );
}

const instances=new Map();
function getBuilder(target){
    if( !instances.has(target.builder) ){
        const instance =  compiler.getPlugin( target.builder );
        if( target.options ){
            instance.config( target.options );
        }
        instances.set(target.builder, instance);
    }
    return instances.get(target.builder);
}

function createFilter(include = [/\.es(\?(id|type)|$)/i], exclude = []) {
    const filter = rollupPluginUtils.createFilter(include, exclude);
    return id => filter(id);
}

function recursion(compilation, callback){
    callback( compilation );
    compilation.getDependencies().forEach( (depModule)=>{
        if( depModule.compilation !== compilation ){
            recursion(depModule.compilation, callback);
        }
    });
}

function RollupPlugin(options={}){
    const isEs = createFilter(options.include, options.exclude);
    const clientBuilder = getBuilder(options.client);
    const serverBuilder = getBuilder(options.server);

    return {
        name: 'EaseScript',
        resolveId(id){
            if ( !isEs(id) )return null;
            return id;
        },
        load( id ){
            if( !isEs(id) )return null;
            var query = null;
            var queryIndex = id.indexOf('?');
            var params = null;
            if( queryIndex > 0 ){
                query = id.substr(queryIndex+1);
                if( query ){
                    params = decode(query);
                    if( params && params.type ==='style' && params.file ){
                        const resourceFile = compiler.normalizePath( id );
                        const filesystem  = compiler.getOutputFileSystem( clientBuilder.name );
                        if( filesystem.existsSync( resourceFile ) ){
                            const content = filesystem.readFileSync( resourceFile );
                            return Promise.resolve({code:content.toString(), map:null});
                        }
                    }
                }
            }
            return id;
        },
        transform (code, filename ) {
            if ( !isEs(filename) ) return;
            return new Promise((resolve,reject)=>{
                const clientBuilder = getBuilder(options.client);
                var className = filename;
                var query = null;
                var queryIndex = filename.indexOf('?');
                var params = null;
                if( queryIndex > 0 ){
                    query = filename.substr(queryIndex+1);
                    if( query ){
                        params = decode(query);
                        if( params ){
                            if(params.type==="style" && params.file && code !== filename ){
                                return resolve({code:code, map:null});
                            }
                            if( params && params.id ){
                                className = params.id;
                            }
                        }
                    }
                }

                compiler.build(className, clientBuilder, (error,compilation)=>{
                    const errors = errorHandle(this, compilation);
                    if( error ){
                        errors.push( error.error.toString() );
                    }

                    if( errors && errors.length > 0 ){
                        reject( new Error( errors.join("\r\n") ) );
                    }else{
                        this.addWatchFile( compilation.file );
                        const filesystem  = compiler.getOutputFileSystem( clientBuilder.name );
                        const done =( error )=>{
                            if( error ){
                                reject( error );
                            }else{
                                const resourceFile = compilation.compiler.normalizePath( filename )
                                if( filesystem.existsSync( resourceFile ) ){
                                    const content = filesystem.readFileSync( resourceFile );
                                    resolve( {code:content.toString(), map:null} ); 
                                }else{
                                    reject( new Error(`'${resourceFile}' is not exists.` ) );
                                }
                            }
                        }
                        if(options.server && options.server.builder){
                            const task = [];
                            const serverCompilations = compilation.getServerCompilations();
                            const dependency=depCompilation=>{
                                this.addWatchFile( depCompilation.file );
                            }
                            serverCompilations.forEach( compilation=>{
                                if( !compilation.isValid() ){
                                    compilation.clear();
                                }
                                const errors = errorHandle(this,compilation);
                                if( errors.length < 1 ){
                                    if( !compilation.completed(serverBuilder.name) ){
                                        task.push( new Promise((resolve) => {
                                            try{
                                                compilation.build(serverBuilder,(error)=>{
                                                    if( !error && options.mode ==="development" ){
                                                        recursion(compilation, dependency);
                                                    }
                                                    resolve(error);
                                                },true);
                                            }catch(e){
                                                resolve(e);
                                            }
                                        }));
                                    }
                                }else{
                                    task.push( new Promise((resolve) => {
                                        resolve( new Error( errors.join("\r\n") ) );
                                    }));
                                } 

                            });
                            Promise.all(task).then( (items)=>{
                                let error = null;
                                const result = items.filter( item=>!!item );
                                if( result.length > 0 ){
                                    error = new Error( result.map( item=>item.toString() ).join("\r\n") );
                                }
                                done( error );
                            });
                        }else{
                            done();
                        }
                    }
                },true); 
            });
        }
    }
}

export default RollupPlugin;