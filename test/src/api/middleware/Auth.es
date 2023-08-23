package api.middleware;

import server.kernel.Request
import server.kernel.Response

class Auth{

    handle(request:Request, next:(req:Request)=>Response){
        const path = request.pathinfo().toLowerCase();
        if( !(path == 'login' || path=='logout' || path=='forgot/reset' || path == 'account/create' || path==="account/send/code" || path==="verify/code") ){
            let userinfo = session('userinfo');
            if( !userinfo ){
                return json({
                    data:null,
                    code:401,
                    msg:'Access denied.'
                })
            }
        }
        return next(request);
    }
}





