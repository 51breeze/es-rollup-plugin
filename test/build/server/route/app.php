<?php
declare (strict_types = 1);
use think\facade\Route;
Route::get('image/show$', '\app\http\Image@show');
Route::post('account/create$', '\app\http\Account@create');