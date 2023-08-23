<?php
declare (strict_types = 1);
return [
    'driver'=>env('database.driver','mysql'),
    'time_query_rule'=>[],
    'auto_timestamp'=>true,
    'datetime_format'=>'Y-m-d H:i:s',
    'datetime_field'=>'',
    'connections'=>[
        'mysql'=>[
            'type'=>env('database.type','mysql'),
            'hostname'=>env('database.hostname','127.0.0.1'),
            'database'=>env('database.database',''),
            'username'=>env('database.username','root'),
            'password'=>env('database.password',''),
            'hostport'=>env('database.hostport','3306'),
            'params'=>[],
            'charset'=>env('database.charset','utf8'),
            'prefix'=>env('database.prefix',''),
            'deploy'=>0,
            'rw_separate'=>false,
            'master_num'=>1,
            'slave_no'=>'',
            'fields_strict'=>true,
            'break_reconnect'=>false,
            'trigger_sql'=>env('app_debug',true),
            'fields_cache'=>false
        ]
    ]
];