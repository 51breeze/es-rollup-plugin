<?php
declare (strict_types = 1);
namespace app\http;
include_once(__DIR__ . '/Base.php');
use \app\http\Base;
class Account extends Base{
    public function create(){
        return $this->success('Account create successfully.');
    }
}