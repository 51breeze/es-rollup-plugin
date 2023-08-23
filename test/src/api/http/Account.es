package api.http;

class Account extends Base{

    @Post('/account/create')
    create(){
       
            return this.success('Account create successfully.');
       
    }

}