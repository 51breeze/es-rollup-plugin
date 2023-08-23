package api.http;

import server.facade.Filesystem

class Image extends Base{

    @Get('/image/show')
    show(){
        let filename = this.request.get('filename')
        if( filename ){
            filename = Filesystem.path( filename as string );
            if( file_exists(filename) ){
                const content = file_get_contents( filename ) as string;
                return response(content, 200, {
                    //'Content-Length':content.length
                }).contentType( mime_content_type(filename) );
            }else{
                return response('File is not exists. file:'+filename, 2001);
            }
        }else{
            return response('File is not exists', 2000);
        }
    }

}