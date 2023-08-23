<?php
declare (strict_types = 1);
namespace es\core;
include_once(__DIR__ . '/Iterator.php');
use \es\core\Iterator;


if( !defined('NaN') )define('NaN','NaN');
if( !defined('Infinity') )define('Infinity','Infinity');

final class IterableIterator implements Iterator{
    private $target = null;
    private $index  = 0;
    private $length = 0;
    private $isIterator = false;
    private $isObject = false;
    private $current = null;
    private $key = null;
    private $done = false;
    private $keys = null;
    public function __construct( &$target ){
        $this->target = &$target;
        $this->isObject = is_object($target);
        $this->isIterator = System::isIterator($target);
        if( !$this->isIterator && !$this->isObject && is_array($target) && !array_key_exists('length', $target) ){
            if( !System::isArray($target) ){
                $this->keys = array_keys($target);
            }
        }
    }
    public function next(){
        if( $this->isIterator ){
            return $this->target->next();
        }
        $done  = !($this->length > $this->index);
        $key   = null;
        $item  = new \stdClass;
        $item->value = null;
        $keys = &$this->keys;
        if( !$done ){
            $key = $this->index++;
            if( $keys !== null ){
                $key = $keys[$key];
            }
            if(is_scalar($this->target)){
                $item->value = $this->target[$key] ?? null;
            }else {
                if($this->isObject && isset($this->target->$key)){
                    $item->value = &$this->target->$key;
                }else if(isset($this->target[$key])){
                    $item->value = &$this->target[$key];
                }
            }
        }
        $item->key = $key;
        $item->done = $done;
        $this->current = $item->value;
        $this->key = $key;
        $this->done = $done;
        return $item;
    }
    public function rewind(){
        if( $this->isIterator ){
            $this->target->rewind();
        }else if( $this->isObject ){
            if( is_a($this->target,'\Countable') ){
                $this->length = count( $this->target );
            }else if( property_exists($this->target,'length') ){
                $this->length = $this->target->length;
            }
        }else if( is_array($this->target) ){
            $keys = &$this->keys;
            if( $keys !== null ){
                $this->length = count($keys);
            }else{
                $this->length = array_key_exists('length', $this->target) ? $this->target['length'] : count($this->target);
            }
        }else if( is_string($this->target) ){
            $this->length = mb_strlen($this->target);
        }
        $this->index = 0;
        $this->done = false;
        $this->current = null;
        $this->key = null;
    }
    public function current(){
        return $this->current;
    }
    public function key(){
        return $this->key;
    }
    public function valid(){
        return !$this->done;
    }
}

final class System{

    public static function getCoreSystemNamespace( $className ){
        static $cached= null;
        if( $cached ){
            return $className ? $cached.'\\'.$className :  $cached;
        }
        $class = new \ReflectionClass( System::class );
        $cached = $class->getNamespaceName();
        return $className ? $cached.'\\'.$className : $cached;
    }

    public static function date( string $format, $now=null){
        $moment = new \Moment\Moment( $now );
        return $moment->format($format, new \Moment\CustomFormats\MomentJs() );
    }

    public static function typeof( $obj ){
        if( is_callable( $obj ) ){
            return 'function';
        }else if( $obj === NaN || is_numeric($obj) ){
            return 'number';
        }else if( is_object($obj) && get_class($obj) === static::getCoreSystemNamespace('RegExp') ){
            return 'regexp';
        }else if( is_array($obj) ){
            return 'object';
        }
        return gettype($obj);
    }


    public static function condition( $value ){
        if( $value )return true;
        if( is_array($value) )return true;
        return false;
    }

    private static $variablesScope = [];
    public static function registerScopeVariables(string $scopeId, string $name, $data){
        $dataset = &static::$variablesScope;
        if( !isset($dataset[$scopeId]) ){
            $dataset[$scopeId] = [];
        }
        $dataset[$scopeId][$name] = $data;
    }

    public static function getScopeVariable(string $scopeId, $name){
        $dataset = &static::$variablesScope;
        $data = isset($dataset[$scopeId]) ? $dataset[$scopeId] : [];
        $num = func_num_args();
        if( $num === 1 )return $data;
        if( is_string($name) || is_numeric($name) ){
            return isset($data[$name]) ? $data[$name] : null;
        }
        return null;
    }

    public static function print(...$args){
        $to_string = function($item)use(&$to_string){
            if( $item instanceof \Closure ){
                $reflect = new \ReflectionFunction($item);
                if( !$reflect->isClosure() ){
                    return sprintf('function %s(){[local code]}', $reflect->getName());
                }else{
                    return 'function {[local code]}';
                }
            }
            if( is_object($item) ){
                if(method_exists($item,'toString'))return $item->toString();
                if(method_exists($item,'__toString'))return $item->__toString();
                return '[object '.gettype($item).']';
            }else if( is_array($item) ){
                $to_item_string=function($item)use(&$to_item_string,&$to_string){
                    if( is_array($item) ){
                        $a = [];
                        $p = [];
                        foreach($item as $key=>$value){
                            $value = $to_item_string($value);
                            if( is_numeric($key) ){
                                $a[] = $value;
                            }else{
                                $p[] = $key.': '.$value;
                            }
                        }
                        return '[ '.implode(', ',array_merge($a,$p)).' ]';
                    }else{
                        return $to_string($item);
                    }
                };
                return $to_item_string($item);
            }
            return json_encode( $item, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES );
        };
        echo PHP_EOL,implode(" ", array_map($to_string,$args));
    }

    public static function addition($left,$right){
        if( is_numeric($left) && is_numeric($right) ){
            return $left + $right;
        }
        return $left . $right;
    }

    public static function bind($callback, &$thisArg=null, $isArray=null, ...$rest){
        if( !is_callable($callback) ){
            throw new TypeError('callback is not callable');
        }
        $thisObject = $thisArg;
        $is_warp = false;
        if( $isArray===null ){
            $isArray = is_array($thisArg) && (is_numeric(array_key_first($thisArg)) || count($thisArg)===0);
        }

        $getBindThisIndex = function( $items , $comment){
            if( $comment && preg_match('/@bind\s+(\w+)/', $comment, $matching) ){
                $name = $matching[1] ?? null;
                if( $name ){
                    $len = count( $items );
                    for($i=0;$i<$len;$i++){
                        if( $items[$i]->getName() === $name){
                            return $i;
                        }
                    }
                }
            }
            return -1;
        };
        $thisIndex = null;
        if( is_array($callback) ){
            if( count($callback) === 2 ){
                if( !is_object( $callback[0] ) ){
                    $method = $callback;
                    $reflect = new \ReflectionMethod($callback[0],$callback[1]);
                    $thisIndex = $thisObject !== null ? $getBindThisIndex( $reflect->getParameters(), $reflect->getDocComment() ) : -1;
                    $is_warp = true;
                    $callback = function(...$args)use($method){
                        return call_user_func_array($method, $args);
                    };
                }else{
                    $reflect = new \ReflectionObject($callback[0]);
                    $callback = $reflect->getMethod($callback[1])->getClosure( $callback[0] );
                }
            }else{
                $callback = $callback[0];
            }
        }

        $method  =  $callback;
        if( $is_warp === false ){
            $reflect = new \ReflectionFunction($callback);
            $is_array_method = false !== stripos( $reflect->getName(), 'array_');
            if( $is_array_method ){
                $get_args=function( $args )use(&$reflect){
                    if( $reflect->getName() ==="array_splice" && count($args) > 3 ){
                        $g = array_slice($args, 2);
                        $args = array_slice($args,0,2);
                        array_push($args, $g );
                    }
                    return $args;
                };
                if( $isArray ){
                    return function(...$args)use( $callback, &$thisArg, &$get_args,&$rest){
                        return call_user_func_array($callback, array_merge([&$thisArg], $get_args($args), $rest) );
                    };
                }else if( is_array($thisArg) || is_object($thisArg) ){
                    return function(...$args)use($callback, &$thisArg, &$get_args,&$rest){
                        $is_array = is_array($thisArg);
                        $origin = (array)$thisArg;
                        $array = System::toArray( $origin );
                        $keys  = array_keys( $origin );
                        $result= call_user_func_array($callback, array_merge([&$array], $get_args($args), $rest) );
                        $diff = array_diff($keys, array_keys($array));
                        $props = [];
                        foreach($diff as $v){
                            if( !is_numeric($v) ){
                                $props[$v] = $is_array ? $thisArg[$v] : $thisArg->{$v};
                            }
                            if( $is_array ){
                                unset($thisArg[$v]);
                            }else{
                                unset($thisArg->{$v});
                            }
                        }
                        $count = 0;
                        foreach($array as $key=>$value){
                            if( is_numeric($key) ){
                                $count++;
                                if( $is_array ){
                                    $thisArg[$key] = $value;
                                }else{
                                    $thisArg->{$key} = $value;
                                }
                            }
                        }
                        foreach($props as $name=>$value){
                            if( $is_array ){
                                $thisArg[$name] = $value;
                            }else{
                                $thisArg->{$name} = $value;
                            }
                        }
                        if( $is_array ){
                            $thisArg['length'] = $count;
                        }else{
                            $thisArg->length = $count;
                        }
                        return $result;
                    };
                }
            }
            $thisIndex = $thisObject !== null ? $getBindThisIndex( $reflect->getParameters(), $reflect->getDocComment() ) : -1;
            $method = $reflect->getClosure();
        }

        if( $thisObject && is_object($thisObject) ){
            $method = \Closure::bind($method, $thisObject);
        }

        if( count($rest) > 0 ){
            return function(...$args)use($method, $thisObject, $thisIndex, $rest){
                $args = array_merge($args,$rest);
                if( $thisIndex>=0 && $thisObject){
                    array_splice($args,$thisIndex,0,[$thisObject]);
                }
                return call_user_func_array($method, $args );
            };
        }else if( $thisIndex >= 0 ){
            return function(...$args)use($method, $thisObject, $thisIndex){
                if( $thisIndex>=0 ){
                    array_splice($args,$thisIndex,0,[$thisObject]);
                }
                return call_user_func_array($method, $args);
            };
        }
        return $method;
    }

    static function toArray( $target ){
        $array = [];
        $type = 0;
        $len  = 0;
        if( is_array( $target) ){
            $type = 1;
            $target = array_filter($target, function($key){
                return is_numeric($key);
            },ARRAY_FILTER_USE_KEY);
            $len = count($target);
        } else if( static::isIterator($target) ){
            $target->rewind();
            while( ($result=$target->next()) && !$result->done ){
                $array[] = $result->value;
            }
            return $array;
        }else if( is_object($target) ){
            $type = 2;
            if( is_a($target,'\Countable') ){
                $len = count($target);
            }else{
                $len = isset($target->length) ? $target->length : 0;
            }
        }else if( is_string($target) ){
            $type = 3;
            $len = mb_strlen($target);
        }
        for($i=0;$i<$len;$i++){
            if( $type===1 ){
                $array[] = $target[ $i ];
            }else if( $type===2 ){
                $array[] = $target->{$i};
            }else if( $type===3 ){
                $array[] = mb_substr($target,$i,1);
            }
        }
        return $array;
    }

    static function isArray( $target ){
        if( !is_array($target) )return false;
        $keys = array_keys($target);
        $len = count($keys);
        for($i=0;$i<$len;$i++){
            $key = $keys[$i];
            if( $key !== $i )return false;
        }
        return true;
    }

    static function isObject($target){
        return is_object($target) || is_array($target);
    }

    static function isIterator($target){
        return is_a($target, static::getCoreSystemNamespace('Iterator') );
    }

    static function merge(&$target,...$args){
        $isObj = is_object($target);
        if( !($isObj || is_array($target)) ) {
            throw new TypeError('Cannot convert null to object');
        }
        $len = count($args);
        for ($index = 0; $index < $len; $index++) {
            $nextSource = $args[ $index ];
            if( System::isObject($nextSource) ) {
                foreach ($nextSource as $key => $value) {
                    if( $isObj ){
                        $target->{$key} = $value; 
                    }else{
                        $target[$key] = $value;
                    }
                }
            }
        }
        return $target;
    }

    static function sequences(...$args){
        return func_get_arg( func_num_args()-1 );
    }

    static function getIterator( &$target ){
        if( System::isIterator($target) ){
            return $target;
        }
        return new IterableIterator($target);
    }

    static function getQualifiedClassName( $name ){
        $name = str_replace(".",'\\',$name);
        if( !class_exists( $name, true ) ){
            throw new \Exception("is not exists ". $name );
        }
        return $name;
    }

    static function getQualifiedObjectName( $object ){
        return get_class($object);
    }
}
