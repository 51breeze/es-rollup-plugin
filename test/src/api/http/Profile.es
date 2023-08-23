package api.http;

import api.model.UserAccount;
import api.model.UserProfile;
import PHPMailer.PHPMailer;
import PHPMailer.Exception;

class Profile extends Base{

    @Get('/profile/info')
    profile(){
        let id = this.userinfo.userid;
        return this.success(
            UserProfile.getProfile(id)
        );
    }

    @Post('/profile/save')
    saveProfile(){
        let id = this.userinfo.userid;
        const profile = new UserProfile();
        const data = this.request.post();
        const result = profile.edit(id, data);
        if( result ){
            return this.success('ok');
        }else{
            return this.error('Save failed.');
        }
    }

    @Post('/profile/password')
    alterPassword(){
        const password = this.request.post('password');
        const new_password = this.request.post('newPassword');
        if( !password || !new_password){
            return this.error('Missing params.', 1002);
        }
        let id = this.userinfo.userid;
        const model = new UserAccount();
        const data = model.findAccountById(id);
        if( md5(password) === data.password ){
            data.password = md5(new_password);
            data.update_at = time();
            if( data.save() ){
                return this.success('ok');
            }else{
                return this.error('Save failed.');
            }
        }else{
            return this.error('Old password incorrect.', 1003);
        }
    }

}