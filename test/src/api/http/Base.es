package api.http;

import server.kernel.Controller;

class Base extends Controller{

    protected request:server.kernel.Request

    constructor(){
        super();
        this.request = request();
    }

    get userinfo(){
        const userinfo = session('userinfo') as {
            userid:number,
            account:string,
            status:number
        }
        return userinfo;
    }

    protected success<T>(data?:T){
        return json({
            data,
            code:200,
            msg:'ok'
        },200)
    }

    protected error(message:string, code:number=1000){
        return json({
            data:null,
            code,
            msg:message
        },200)
    }

}