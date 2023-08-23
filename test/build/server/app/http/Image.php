<?php
declare (strict_types = 1);
namespace app\http;
include_once(__DIR__ . '/Base.php');
include_once(__DIR__ . '/../../es/core/System.php');
use \app\http\Base;
use \es\core\System;
use \think\facade\Filesystem;
class Image extends Base{
    public function show(){
        $filename = $this->request->get('filename');
        if(System::condition($filename)){
            $filename=Filesystem::path($filename);
            if(file_exists($filename)){
                $content = file_get_contents($filename);
                return response($content,200,[])->contentType(mime_content_type($filename));
            }else{
                return response('File is not exists. file:' . $filename,2001);
            }
        }else{
            return response('File is not exists',2000);
        }
    }
}