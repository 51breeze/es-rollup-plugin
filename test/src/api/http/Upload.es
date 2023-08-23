package api.http;

import server.facade.Filesystem

import api.model.UserProfile

class Upload extends Base{

    @Post('/upload/image')
    image(){

        const file = this.request.file('file');
        const userinfo = this.userinfo;
        if( !userinfo ){
            return this.error('Not login.', 401); 
        }

        if( file ){
            try{
                validate({
                    file:{
                        'fileSize':1 * 1024 * 1024,
                        'fileExt':'png,jpeg,jpg,webp'
                    }
                }, {
                    file:{
                        'fileSize':'Uploaded photes maximum dimension 1024*1024 plxels.',
                        'fileExt':'Uploaded photes in JPG,JPEG,PNG,WEBP'
                    }
                }).check({file});

                const filename = Filesystem.putFile('picture', file, 'sha1');
                const profile = new UserProfile();
                const filepath = `/${filename.replace(/\\/g,'/')}`;
                if( profile.edit(userinfo.userid,{
                    picture:filepath
                }) ){
                    return this.success( filepath );
                }else{
                    return this.error('update picture failed.'); 
                }

            }catch(e){
                return this.error(e.message);
            }
        }else{
            return this.error('Not file');
        }

    }

}