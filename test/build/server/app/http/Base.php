<?php
declare (strict_types = 1);
namespace app\http;
use \think\Request;
class Base{
    public function __construct(){
        $this->request=request();
    }
    protected $request=null;
    public function getUserinfo(){
        $userinfo = session('userinfo');
        return $userinfo;
    }
    protected function success($data=null){
        return json([
            'data'=>$data,
            'code'=>200,
            'msg'=>'ok'
        ],200);
    }
    protected function error(string $message,$code=1000){
        return json([
            'data'=>null,
            'code'=>$code,
            'msg'=>$message
        ],200);
    }
}