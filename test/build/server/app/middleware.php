<?php
declare (strict_types = 1);
include_once(__DIR__ . '/middleware/Auth.php');
use \app\middleware\Auth;
return ['think\\middleware\\SessionInit',Auth::class];