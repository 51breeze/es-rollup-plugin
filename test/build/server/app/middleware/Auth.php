<?php
declare (strict_types = 1);
namespace app\middleware;
include_once(__DIR__ . '/../../es/core/System.php');
use \es\core\System;
use \think\Request;
class Auth{
    public function handle(Request $request,\Closure $next){
        $path = mb_strtolower($request->pathinfo());
        if(!($path == 'login' || $path == 'logout' || $path == 'forgot/reset' || $path == 'account/create' || $path === 'account/send/code' || $path === 'verify/code')){
            $userinfo = session('userinfo');
            if(!System::condition($userinfo)){
                return json([
                    'data'=>null,
                    'code'=>401,
                    'msg'=>'Access denied.'
                ]);
            }
        }
        return $next($request);
    }
}