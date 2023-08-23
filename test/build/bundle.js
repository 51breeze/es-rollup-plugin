var bundle = (function (http, https, url, stream, assert$1, tty, util, os, zlib) {
  'use strict';

  http = http && Object.prototype.hasOwnProperty.call(http, 'default') ? http['default'] : http;
  https = https && Object.prototype.hasOwnProperty.call(https, 'default') ? https['default'] : https;
  url = url && Object.prototype.hasOwnProperty.call(url, 'default') ? url['default'] : url;
  stream = stream && Object.prototype.hasOwnProperty.call(stream, 'default') ? stream['default'] : stream;
  assert$1 = assert$1 && Object.prototype.hasOwnProperty.call(assert$1, 'default') ? assert$1['default'] : assert$1;
  tty = tty && Object.prototype.hasOwnProperty.call(tty, 'default') ? tty['default'] : tty;
  util = util && Object.prototype.hasOwnProperty.call(util, 'default') ? util['default'] : util;
  os = os && Object.prototype.hasOwnProperty.call(os, 'default') ? os['default'] : os;
  zlib = zlib && Object.prototype.hasOwnProperty.call(zlib, 'default') ? zlib['default'] : zlib;

  /*
   * EaseScript
   * Copyright © 2017 EaseScript All rights reserved.
   * Released under the MIT license
   * https://github.com/51breeze/EaseScript
   * @author Jun Ye <664371281@qq.com>
  */

  var __MODULES__=[];
  var privateKey=Symbol("privateKey");
  var Class={
      key:privateKey,
      modules:__MODULES__,
      require:function(id){
          return __MODULES__[id];
      },
      creator:function(id,moduleClass,description){
          if( description ){
              if( description.inherit ){
                  Object.defineProperty(moduleClass,'prototype',{value:Object.create(description.inherit.prototype)});
              }
              if( description.methods ){
                  Object.defineProperties(moduleClass,description.methods);
              }
              if( description.members ){
                  Object.defineProperties(moduleClass.prototype,description.members);
              }
              Object.defineProperty(moduleClass,privateKey,{value:description});
              Object.defineProperty(moduleClass,'name',{value:description.name});
              Object.defineProperty(moduleClass,'toString',{value:function toString(){
                  var name = description.ns ? description.ns+'.'+description.name : description.name;
                  var id = description.id;
                  if(id === 3){
                      return '[Enum '+name+']';
                  }else if(id ===2){
                      return '[Interface '+name+']';
                  }else {
                      return '[Class '+name+']';
                  }
              }});
              
              if( moduleClass.prototype && !Object.prototype.hasOwnProperty.call(moduleClass.prototype,'toString') ){
                  Object.defineProperty(moduleClass.prototype,'toString',{
                      configurable:false,
                      value:function toString(){
                      var name = description.ns ? description.ns+'.'+description.name : description.name;
                      return '[object '+name+']';
                  }});
              }
          }
          Object.defineProperty(moduleClass.prototype,'constructor',{value:moduleClass});
          if( id >= 0 ){
              __MODULES__[id] = moduleClass;
          }
      },
      getClassByName:function(name){
          var len = __MODULES__.length;
          var index = 0;
          for(;index<len;index++){
              var classModule = __MODULES__[index];
              var description = classModule[privateKey];
              if( description ){
                  var key = description.ns ? description.ns+'.'+description.name : description.name;
                  if( key === name){
                      return classModule;
                  }
              }
          }
          return null;
      }
  };

  Class.CONSTANT ={
      MODIFIER_PUBLIC:3,
      MODIFIER_PROTECTED:2,
      MODIFIER_PRIVATE:1,
      MODULE_CLASS:1,
      MODULE_INTERFACE:2,
      MODULE_ENUM:3,
      PROPERTY_VAR:1,
      PROPERTY_CONST:2,
      PROPERTY_FUN:3,
      PROPERTY_ACCESSOR:4,
      PROPERTY_ENUM_KEY:5,
      PROPERTY_ENUM_VALUE:6,
  };

  /*
   * Copyright © 2017 EaseScript All rights reserved.
   * Released under the MIT license
   * https://github.com/51breeze/EaseScript
   * @author Jun Ye <664371281@qq.com>
   */
  function ESEvent( type, bubbles, cancelable ){
      if( !type || typeof type !=="string" )throw new TypeError('event type is not string');
      this.type = type;
      this.bubbles = !!bubbles;
      this.cancelable = !!cancelable;
  }

  ESEvent.SUBMIT='submit';
  ESEvent.RESIZE='resize';
  ESEvent.SELECT='fetch';
  ESEvent.UNLOAD='unload';
  ESEvent.LOAD='load';
  ESEvent.LOAD_START='loadstart';
  ESEvent.PROGRESS='progress';
  ESEvent.RESET='reset';
  ESEvent.FOCUS='focus';
  ESEvent.BLUR='blur';
  ESEvent.ERROR='error';
  ESEvent.COPY='copy';
  ESEvent.BEFORECOPY='beforecopy';
  ESEvent.CUT='cut';
  ESEvent.BEFORECUT='beforecut';
  ESEvent.PASTE='paste';
  ESEvent.BEFOREPASTE='beforepaste';
  ESEvent.SELECTSTART='selectstart';
  ESEvent.READY='ready';
  ESEvent.SCROLL='scroll';
  ESEvent.INITIALIZE_COMPLETED = "initializeCompleted";
  ESEvent.ANIMATION_START="animationstart";
  ESEvent.ANIMATION_END="animationend";
  ESEvent.ANIMATION_ITERATION="animationiteration";
  ESEvent.TRANSITION_END="transitionend";

  ESEvent.isEvent=function isEvent( obj ){
      if( obj ){
          return obj instanceof ESEvent || obj instanceof Event;
      }
      return false;
  };

  /**
   * 事件原型
   * @type {Object}
   */
  ESEvent.prototype = Object.create( Object.prototype,{
      "constructor":{value:ESEvent}
  });

  ESEvent.prototype.bubbles = true;
  ESEvent.prototype.cancelable = true;
  ESEvent.prototype.currentTarget = null;
  ESEvent.prototype.target = null;
  ESEvent.prototype.defaultPrevented = false;
  ESEvent.prototype.originalEvent = null;
  ESEvent.prototype.type = null;
  ESEvent.prototype.propagationStopped = false;
  ESEvent.prototype.immediatePropagationStopped = false;
  ESEvent.prototype.altkey = false;
  ESEvent.prototype.button = false;
  ESEvent.prototype.ctrlKey = false;
  ESEvent.prototype.shiftKey = false;
  ESEvent.prototype.metaKey = false;

  /**
   * 阻止事件的默认行为
   */
  ESEvent.prototype.preventDefault = function preventDefault(){
      if( this.cancelable===true ){
          this.defaultPrevented = true;
          if ( this.originalEvent ){
              if( this.originalEvent.preventDefault ){
                  this.originalEvent.preventDefault();
              }else {
                  this.originalEvent.returnValue = false;
              }
          }
      }
  };

  /**
   * 阻止向上冒泡事件
   */
  ESEvent.prototype.stopPropagation = function stopPropagation(){
      if( this.originalEvent ){
          this.originalEvent.stopPropagation ? this.originalEvent.stopPropagation() :  this.originalEvent.cancelBubble=true;
      }
      this.propagationStopped = true;
  };

  /**
   *  阻止向上冒泡事件，并停止执行当前事件类型的所有侦听器
   */
  ESEvent.prototype.stopImmediatePropagation = function stopImmediatePropagation(){
      if( this.originalEvent && this.originalEvent.stopImmediatePropagation )this.originalEvent.stopImmediatePropagation();
      this.stopPropagation();
      this.immediatePropagationStopped = true;
  };

  /**
   * map event name
   * @internal ESEvent.fix;
   */
  ESEvent.fix={
      map:{},
      hooks:{},
      prefix:'',
      cssprefix:'',
      cssevent:{},
      eventname:{
          'DOMContentLoaded':true
      }
  };
  ESEvent.fix.map[ ESEvent.READY ]='DOMContentLoaded';
  ESEvent.fix.cssevent[ ESEvent.ANIMATION_START ]     ="AnimationStart";
  ESEvent.fix.cssevent[ ESEvent.ANIMATION_END ]       ="AnimationEnd";
  ESEvent.fix.cssevent[ ESEvent.ANIMATION_ITERATION ] ="AnimationIteration";
  ESEvent.fix.cssevent[ ESEvent.TRANSITION_END ]      ="TransitionEnd";

  /**
   * 获取统一的事件名
   * @param type
   * @param flag
   * @returns {*}
   * @internal ESEvent.type;
   */
  ESEvent.type = function type( eventType, flag ){
      if( typeof eventType !== "string" )return eventType;
      if( flag===true ){
          eventType= ESEvent.fix.prefix==='on' ? eventType.replace(/^on/i,'') : eventType;
          var lower =  eventType.toLowerCase();
          if( ESEvent.fix.cssprefix && lower.substr(0, ESEvent.fix.cssprefix.length )===ESEvent.fix.cssprefix ){
              return lower.substr(ESEvent.fix.cssprefix.length);
          }
          for(var prop in ESEvent.fix.map){
              if( ESEvent.fix.map[prop].toLowerCase() === lower ){
                  return prop;
              }
          }
          return eventType;
      }
      if( ESEvent.fix.cssevent[ eventType ] ){
          return ESEvent.fix.cssprefix ? ESEvent.fix.cssprefix+ESEvent.fix.cssevent[ eventType ] : eventType;
      }
      if( ESEvent.fix.eventname[ eventType ]===true )return eventType;
      return ESEvent.fix.map[ eventType ] ? ESEvent.fix.map[ eventType ] : ESEvent.fix.prefix+eventType.toLowerCase();
  };

  var eventModules=[];
  ESEvent.registerEvent = function registerEvent( callback ){
      eventModules.push( callback );
  };

  /*
   * 根据原型事件创建一个ESEvent
   * @param event
   * @returns {ESEvent}
   * @internal ESEvent.create;
   */
  ESEvent.create = function create( originalEvent ){
      if( !originalEvent || !ESEvent.isEvent(originalEvent) )throw new TypeError('Invalid originalEvent.');
      var event=null;
      var i=0;
      var type = originalEvent.type;
      var target = originalEvent.srcElement || originalEvent.target;
      target = target && target.nodeType===3 ? target.parentNode : target;
      var currentTarget =  originalEvent.currentTarget || target;
      if( typeof type !== "string" )throw new TypeError('Invalid event type');
      if( !(originalEvent instanceof ESEvent) ){
          type = ESEvent.type(type, true);
          while (i < eventModules.length && !(event = eventModules[i++](type, target, originalEvent)));
      }else {
          event = originalEvent;
      }
      if( !(event instanceof ESEvent) )event = new ESEvent( type );
      event.type=type;
      event.target=target;
      event.currentTarget = currentTarget;
      event.bubbles = originalEvent.bubbles;
      event.cancelable = originalEvent.cancelable;
      event.originalEvent = originalEvent;
      event.timeStamp = originalEvent.timeStamp;
      event.relatedTarget= originalEvent.relatedTarget;
      event.altkey= !!originalEvent.altkey;
      event.button= originalEvent.button;
      event.ctrlKey= !!originalEvent.ctrlKey;
      event.shiftKey= !!originalEvent.shiftKey;
      event.metaKey= !!originalEvent.metaKey;
      event.defaultPrevented= originalEvent.defaultPrevented;
      event.eventPhase= originalEvent.eventPhase;
      event.composed= originalEvent.composed;
      event.isTrusted= originalEvent.isTrusted;
      if( originalEvent.animationName ){
          event.animationName = originalEvent.animationName;
          event.elapsedTime   = originalEvent.elapsedTime;
          event.eventPhase   = originalEvent.eventPhase;
          event.isTrusted   = originalEvent.isTrusted;
      }
      return event;
  };

  ESEvent.fix.hooks[ ESEvent.READY ]=function (listener, dispatcher){
      var target=this;
      var doc = this.contentWindow ?  this.contentWindow.document : this.ownerDocument || this.document || this;
      var win=  doc && doc.nodeType===9 ? doc.defaultView || doc.parentWindow : window;
      if( !(win || doc) )return;
      var id = null;
      var has = false;
      var handle=function(event){
          if( !event ){
              switch ( doc.readyState ){
                  case 'loaded'   :
                  case 'complete' :
                  case '4'        :
                      event= new ESEvent( ESEvent.READY );
                      break;
              }
          }
          if( event && has===false){
              has = true;
              if(id){
                  window.clearInterval(id);
                  id = null;
              }
              event = event instanceof ESEvent ? event : ESEvent.create( event );
              event.currentTarget = target;
              event.target = target;
              dispatcher( event );
          }
      };
      var type = ESEvent.type(ESEvent.READY);
      doc.addEventListener ? doc.addEventListener( type, handle) : doc.attachEvent(type, handle);
      id = window.setInterval(handle,50);
      return true;
  };
  Class.creator(8,ESEvent,{
      id:1,
      name:"Event",
      dynamic:true
  });

  /*
   * EaseScript
   * Copyright © 2017 EaseScript All rights reserved.
   * Released under the MIT license
   * https://github.com/51breeze/EaseScript
   * @author Jun Ye <664371281@qq.com>
   */

  var __KEY__ = Symbol('EventDispatcher');
  function EventDispatcher( target ){
      if( !(this instanceof EventDispatcher) ){
          return new EventDispatcher( target );
      }

      if( !Object.prototype.hasOwnProperty.call(this,__KEY__) ){
          Object.defineProperty(this,__KEY__,{value:{events:{},isEvent:false,proxy:null}});
      }

      if( target ){
          if( typeof target !== 'object'){
              throw new Error('target is not object');
          }
          const data = this[__KEY__];
          data.isEvent = target instanceof EventDispatcher;
          data.proxy = target;
      }
  }

  EventDispatcher.prototype.constructor = EventDispatcher;

  /**
   * 判断是否有指定类型的侦听器
   * @param type
   * @param listener
   * @returns {boolean}
   */
  EventDispatcher.prototype.hasEventListener=function hasEventListener( type , listener ){
      var target =  this[ __KEY__ ];
      if( target.isEvent ){
          return target.proxy.hasEventListener(type, listener);
      }
      var events = target.events[type];
      if( !events )return false;
      var len = events && events.length >> 0;
      if( len > 0 && listener === void 0 )return true;
      while(len>0 && events[--len] ){
          if( events[len].callback === listener ){
              return true;
          }  
      }
      return false;
  };

  /**
   * 添加侦听器
   * @param type
   * @param listener
   * @param priority
   * @returns {EventDispatcher}
   */
  EventDispatcher.prototype.addEventListener=function addEventListener(type,callback,useCapture,priority,reference){
      if( typeof type !== 'string' )throw new TypeError('Invalid event type');
      if( typeof callback !== 'function' )throw new TypeError('Invalid callback function');
      var target =  this[ __KEY__ ];
      if( target.isEvent ){
          target.proxy.addEventListener(type,callback,useCapture,priority,reference||this);
          return this;
      }
      var listener = new Listener(type,callback,useCapture,priority,reference,this);
      var events = target.events[ type ] || ( target.events[ type ]=[] );
      if( events.length < 1 && target.proxy ){
          listener.proxyHandle = $dispatchEvent;
          listener.proxyTarget = target.proxy;
          listener.proxyType = [type];
          if( Object.prototype.hasOwnProperty.call(ESEvent.fix.hooks,type) ){
              ESEvent.fix.hooks[ type ].call(this, listener, listener.proxyHandle);
          }else {
              type = ESEvent.type(type);
              try {
                  if(target.proxy.addEventListener){
                      target.proxy.addEventListener(type, listener.proxyHandle, listener.useCapture);
                  }else {
                      listener.proxyHandle=function (e) {
                          $dispatchEvent(e, target.proxy);
                      };
                      target.proxy.attachEvent(type, listener.proxyHandle);
                  }
              }catch (e) {}
          }
      }
      events.push( listener );
      if( events.length > 1 ) events.sort(function(a,b){
          return a.priority=== b.priority ? 0 : (a.priority < b.priority ? 1 : -1);
      });
      return this;
  };

  /**
   * 移除指定类型的侦听器
   * @param type
   * @param listener
   * @returns {boolean}
   */
  EventDispatcher.prototype.removeEventListener=function removeEventListener(type,listener){
      var target =  this[ __KEY__ ];
      if(target.isEvent){
          return target.proxy.removeEventListener(type,listener);
      }
      var events = target.events[ type ];
      if(!events)return;
      var len = events && events.length >> 0;
      var ret = len;
      if( len<1 ){
          return false;
      }
      while (len > 0){
          --len;
          if ( !listener || events[len].callback === listener ){
              var result = events.splice(len, 1);
              if( result[0] && target.proxyHandle ){
                  var types = result[0].proxyType;
                  var num = types.length;
                  while ( num > 0 ){
                      $removeListener(result[0].proxyTarget, types[ --num ], result[0].proxyHandle);
                  }
              }
          }
      }
      return events.length !== ret;
  };

  /**
   * 调度指定事件
   * @param event
   * @returns {boolean}
   */
  EventDispatcher.prototype.dispatchEvent=function dispatchEvent( event ){
      if( !(event instanceof ESEvent) )throw new TypeError('Invalid event');
      var target =  this[ __KEY__ ];
      if( target.isEvent ){
          return target.proxy.dispatchEvent(event);
      }
      event.target = event.currentTarget=this;
      return $dispatchEvent( event );
  };


  function $removeListener(target, type , handle ){
      var eventType= ESEvent.type( type );
      if( target.removeEventListener ){
          target.removeEventListener(eventType,handle,false);
          target.removeEventListener(eventType,handle,true);
      }else if( target.detachEvent ){
          target.detachEvent(eventType,handle);
      }
  }

  /**
   * 调度指定侦听项
   * @param event
   * @param listeners
   * @returns {boolean}
   */
  function $dispatchEvent(e, currentTarget){
      if( !(e instanceof ESEvent) ){
          e = ESEvent.create( e );
          if(currentTarget)e.currentTarget = currentTarget;
      }
      if( !e || !e.currentTarget )throw new Error('Invalid event target');
      var target = e.currentTarget;
      var events = target[ __KEY__ ] && target[ __KEY__ ].events[ e.type ];
      if( !events || events.length < 1 )return true;
      events = events.slice(0);
      var length= 0,listener,thisArg,count=events.length;
      while( length < count ){
          listener = events[ length++ ];
          thisArg = listener.reference || listener.dispatcher;
          listener.callback.call( thisArg , e );
          if( e.immediatePropagationStopped===true ){
             return false;
          }
      }
      return true;
  }

  /**
   * 事件侦听器
   * @param type
   * @param callback
   * @param priority
   * @param capture
   * @param currentTarget
   * @param target
   * @constructor
   */
  function Listener(type,callback,useCapture,priority,reference,dispatcher){
      this.type=type;
      this.callback=callback;
      this.useCapture=!!useCapture;
      this.priority=priority>>0;
      this.reference=reference || null;
      this.dispatcher=dispatcher;
  }

  Object.defineProperty(Listener.prototype,"constructor",{value:Listener});
  Listener.prototype.useCapture=false;
  Listener.prototype.dispatcher=null;
  Listener.prototype.reference=null;
  Listener.prototype.priority=0;
  Listener.prototype.callback=null;
  Listener.prototype.type=null;
  Listener.prototype.proxyHandle = null;
  Listener.prototype.proxyTarget = null;
  Listener.prototype.proxyType = null;
  Class.creator(7,EventDispatcher,{
      id:1,
      name:"EventDispatcher"
  });

  /*
   * EaseScript
   * Copyright © 2017 EaseScript All rights reserved.
   * Released under the MIT license
   * https://github.com/51breeze/EaseScript
   * @author Jun Ye <664371281@qq.com>
   */

  function System(){
      throw new SyntaxError('System is not constructor.');
  }System.getIterator=function getIterator(object){
      if( !object )return null;
      if( object[Symbol.iterator] ){
          return object[Symbol.iterator]();
      }
      const type = typeof object;
      if( type==="object" || type ==="boolean" || type ==="number" || object.length === void 0 ){
          throw new TypeError("object is not iterator");
      }
      return (function(object){ 
          return {
              index:0,
              next:function next(){
                  if (this.index < object.length) {
                      return {index:this.index,value:object[this.index++],done:false};
                  }
                  return {value:undefined,done:true};
              }
          };
      })(object);
  };

  System.awaiter = function (thisArg, _arguments, P, generator) {
      function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
      return new (P || (P = Promise))(function (resolve, reject) {
          function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
          function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
          function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
          step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
  };

  System.generator = function (thisArg, body) {
      var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
      return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
      function verb(n) { return function (v) { return step([n, v]); }; }
      function step(op) {
          if (f) throw new TypeError("Generator is already executing.");
          while (_) try {
              if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
              if (y = 0, t) op = [op[0] & 2, t.value];
              switch (op[0]) {
                  case 0: case 1: t = op; break;
                  case 4: _.label++; return { value: op[1], done: false };
                  case 5: _.label++; y = op[1]; op = [0]; continue;
                  case 7: op = _.ops.pop(); _.trys.pop(); continue;
                  default:
                      if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                      if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                      if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                      if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                      if (t[2]) _.ops.pop();
                      _.trys.pop(); continue;
              }
              op = body.call(thisArg, _);
          } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
          if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
      }
  };

  System.is=function is(left,right){
      if(!left || !right || typeof left !== "object")return false;
      const rId = right[Class.key] ? right[Class.key].id : null;
      const description =  left.constructor ? left.constructor[Class.key] : null;
      if( rId === 0 && description && description.id === 1 ){
          return (function check(description,id){
              if( !description )return false;
              var imps = description.imps;
              var inherit = description.inherit;
              if( inherit === right )return true;
              if( imps ){
                  for(var i=0;i<imps.length;i++){
                      if( imps[i] === right || check( imps[i][Class.key], 0 ) )return true;
                  }
              }
              if( inherit && inherit[ Class.key ].id === id){
                  return check( inherit[Class.key], 0);
              }
              return false;
          })(description,1);
      }
      return left instanceof right;
  };

  System.isClass=function isClass(classObject){
      if( !classObject || !classObject.constructor)return false;
      const desc = classObject[ Class.key ];
      return desc && desc.id === Class.CONSTANT.MODULE_CLASS;
  };

  System.isInterface=function isInterface(classObject){
      const desc = classObject && classObject[ Class.key ];
      return desc && desc.id === Class.CONSTANT.MODULE_INTERFACE;
  };

  System.isFunction=function isFunction(target){
     return target && target.constructor === Function;
  };

  System.isArray=function isArray(object){
      return Array.isArray(object); 
  };

  System.toArray=function toArray(object){
      if( Array.isArray(object) ){
          return object;
      }
      if(object && typeof object ==='object' && object[Symbol.iterator] && System.isClass(object)){
          const iterable = object[Symbol.iterator]();
          iterable.rewind();
          let result = null;
          const arr = [];
          while( (result = iterable.next()) && !result.done ){
              arr.push( result.value );
          }
          return arr;
      }
      return Array.from( object );
  };

  System.forEach=function forEach(object, callback){
      if( !object )return;
      const type = typeof object;
      if( type ==='number'){
          for(let i=0; i<object;i++){
              callback(i, i, object);
          }
      }else if( type ==='string'){
          for(let i=0; i<object.length;i++){
              callback(object[i], i, object);
          }
      }else if( Array.isArray(object) || object instanceof Map ){
          object.forEach( callback );
      }else if( type ==="object" ){
          if(object[Symbol.iterator] && System.isClass(object)){
              var iterable = object[Symbol.iterator]();
              iterable.rewind();
              var result = null;
              var index = 0;
              while( (result = iterable.next()) && !result.done ){
                  callback(result.value, result.key || index, object);
                  index++;
              }
          }else if( Object.prototype.toString.call(object) === '[object Object]' ){
              for(let name in object){
                  callback(object[name], name, object);
              }
          }else {
              Array.from( object ).forEach( callback );
          }  
      }
  };

  var __EventDispatcher = null;
  System.getEventDispatcher=function getEventDispatcher(){
      if( __EventDispatcher === null ){
          __EventDispatcher = new EventDispatcher(window);
      }
      return __EventDispatcher;
  };

  /**
   * 根据指定的类名获取类的对象
   * @param name
   * @returns {Object}
   */
   System.getDefinitionByName = function getDefinitionByName(name){
       const module = Class.getClassByName(name);
       if( module ){
           return module;
       }
       throw new TypeError('"' + name + '" is not defined.');
   };
   
   System.hasClass = function hasClass(name){
       return !!Class.getClassByName(name);
   };

   System.firstUpperCase=function firstUpperCase(value){
      if(!value)return value;
      value = String(value);
      return value.substring(0,1).toUpperCase()+value.substring(1);
   };

   System.firstLowerCase=function firstLowerCase(value){
      if(!value)return value;
      value = String(value);
      return value.substring(0,1).toLowerCase()+value.substring(1);
   };

   const globalConfig = Object.create(null);
   System.setConfig=function setConfig(key, value){
      key = String(key);
      const segments = key.split('.').map( seg=>seg.trim() ).filter( seg=>!!seg );
      if( !segments.length ){
          throw new Error(`The '${key}' key-name invalid. in System.setConfig`)
      }
      let name = null;
      let object = globalConfig;
      key = segments.pop();
      while( name = segments.shift() ){
          if( !Object.prototype.hasOwnProperty.call(object,name) ){
              object = object[name] = {};
          }else {
              object = object[name];
          }
      }
      object[key] = value;
   };

   System.getConfig=function getConfig(key){
      key = String(key);
      const segments = key.split('.').map( seg=>seg.trim() ).filter( seg=>!!seg );
      if( !segments.length ){
          throw new Error(`The '${key}' key-name invalid. in System.getConfig`)
      }
      let name = null;
      let object = globalConfig;
      key = segments.pop();
      while( name = segments.shift() ){
          if( !Object.prototype.hasOwnProperty.call(object,name) ){
             return null;
          }else {
              object = object[name];
          }
      }
      return Object.prototype.hasOwnProperty.call(object,key) ? object[key] : null;
   };

   System.createHttpRoute=function createHttpRoute(url, params, flag){
      params = params || {};
      url = String(url).trim();
      url = url.replace(/(^|\/)<([^\>\?]+)(\?)?>/g, function(a,b,c,d){
          let key = c;
          let value = null;
          let prefix = b ? b : '';
          if( Object.prototype.hasOwnProperty.call(params,key) ){
              value = params[key];
              if(flag){
                  params[key]=null;
                  delete params[key];
              }
          }else if( Object.prototype.hasOwnProperty.call(params,key) || Object.prototype.hasOwnProperty.call(params,key=key.toLowerCase()) ){
              value = params[key];
              if(flag){
                  params[key]=null;
                  delete params[key];
              }
          }
          if( d && d.charCodeAt(0) === 63 ){
              if( value !== null ){
                  return prefix+value;
              }else {
                  return '';
              }
          }
          if( value === null ){
              throw new Error(`Missing params '${key}' or the value of params cannot for null.`);
          }else {
              return prefix+value;
          }
      });
      return url.replace(/\/$/,'');
   };

   var HTTP_REQUEST = null;
   System.createHttpRequest=function(Http, routeUrl, options){
      options = options || {};
      const data  = options.data;
      const params = Object.assign(Object.create(null),options.params);
      let url = routeUrl;
      let method = options.method;
      if( typeof routeUrl ==='object' ){
          if( routeUrl.param ){
              Object.assign(params, routeUrl.param);
          }
          url = System.createHttpRoute(routeUrl.url, params, true);
          if( routeUrl.allowMethod && routeUrl.allowMethod !== '*'){
              let allowMethod = routeUrl.allowMethod;
              if( !Array.isArray(allowMethod) ) {
                  allowMethod = [allowMethod];
              }
              if( !allowMethod.includes('*') ){
                  if( method ){
                      if(!allowMethod.includes(method) ){
                          throw new Error(`Http request is not allowed '${method}' methods. available methods for ${allowMethod.join(',')} on the '${url}' url`);
                      }
                  }else if( !method ){
                      if( data && allowMethod.includes('post') ){
                          method = 'post';
                      }else {
                          method = allowMethod[0];
                      }
                  }
              }
          }
      }

      let request = HTTP_REQUEST;
      let config = Object.create(null);
      if( options.config && typeof options.config ==='object' ){
          config = Object.assign(config, options.config);
      }

      config = Object.assign(config,{
          url:url,
          method:method,
          params:params,
          data:data
      });

      if( !request ){
          const initConfig = Object.assign(
              Object.create(null),
              System.getConfig('http.request')
          );
          request = HTTP_REQUEST = Http.create(initConfig);
          System.invokeHook('httpRequestCreated', request);
      }

      System.invokeHook('httpRequestSendBefore', request, config);
      return request.request(config);
  };

  const globalInvokes = Object.create(null);
  System.invokeHook=function invokeHook(type, ...args){
      const items = globalInvokes[type];
      let len = items && items.length;
      let result = args[0];
      if( len > 0 ){
          let i = 0;
          let ctx = {
              stop:false
          };
          args = args.slice(1);
          for(;i<len;i++){
              const invoke = items[i][0];
              ctx.previous = result;
              result = invoke.call(ctx, result, ...args);
              if( ctx.stop ){
                  return result;
              }
          }
      }
      return result;
  };

  System.registerHook=function registerHook(type, processer, priority){
      if( typeof processer !== 'function' ){
          throw new Error(`System.registerInvoke processer must is Function`);
      }else {
          if( typeof priority !== "number" || isNaN(priority) ){
              priority = 0;
          }
          if( !Object.prototype.hasOwnProperty.call(globalInvokes, type) ){
              globalInvokes[type] = [];
          }
          const items = globalInvokes[type];
          items.push( [processer,priority] );
          if( items.length > 1 ){
              items.sort( (a, b)=>{
                  if( a[1] == b[1] )return 0;
                  return a[1] > b[1] ? -1 : 1;
              });
          }
      }
  };

  const globalProvides = Object.create(null);
  System.registerProvide=function registerProvide(name, value, prefix='global'){
      if( name && typeof name === "string" ){
          const key = prefix+':'+name;
          if( Object.prototype.hasOwnProperty.call(globalProvides, key) ){
              throw new Error(`Provider arguments the '${name}' already exists.`);
          }else {
              globalProvides[key] = value;
          }
      }else {
          throw new Error(`Provider arguments the name is not a string.`);
      }
  };

  System.getProvide=function getProvide(name, prefix='global'){
      if( name && typeof name === "string" ){
          const key = prefix+':'+name;
          if( Object.prototype.hasOwnProperty.call(globalProvides, key) ){
              return globalProvides[key];
          }else {
             return null;
          }
      }else {
          throw new Error(`Provider arguments the name is not a string.`);
      }
  };
   
   /**
    * 返回类的完全限定类名
    * @param value 需要完全限定类名称的对象。
    * 可以将任何类型、对象实例、原始类型和类对象
    * @returns {string}
    */
   System.getQualifiedClassName = function getQualifiedClassName( target ){
       if( target == null )throw new ReferenceError( 'target is null or undefined' );
       if( target===System )return 'System';
       if( typeof target === "function" && target.prototype){
          const desc = target && target[ Class.key ];
          if( desc ){
              return desc.ns ? desc.ns+'.'+desc.name : desc.name;
          }
          var str = target.toString();
          str = str.substr(0, str.indexOf('(') );
          return str.substr(str.lastIndexOf(' ')+1);
       }
       throw new ReferenceError( 'target is not Class' );
   };
   
   /**
    * 返回对象的完全限定类名
    * @param value 需要完全限定类名称的对象。
    * 可以将任何类型、对象实例、原始类型和类对象
    * @returns {string}
    */
   System.getQualifiedObjectName = function getQualifiedObjectName( target ){
       if( target == null || typeof target !== "object"){
           throw new ReferenceError( 'target is not object or is null' );
       }
       return System.getQualifiedClassName( Object.getPrototypeOf( target ).constructor );
   };
   /**
    * 获取指定实例对象的超类名称
    * @param value
    * @returns {string}
    */
   System.getQualifiedSuperClassName =function getQualifiedSuperClassName(target){
       if( target == null )throw new ReferenceError( 'target is null or undefined' );
       const classname = System.getQualifiedClassName( Object.getPrototypeOf( target ).constructor );
       const module = Class.getClassByName(classname);
       if( module ){
           return System.getQualifiedClassName( module.inherit || Object );
       }
       return null;
   };

   (function(System){
      const env = {
          'BROWSER_IE': 'IE',
          'BROWSER_FIREFOX': 'FIREFOX',
          'BROWSER_CHROME': 'CHROME',
          'BROWSER_OPERA': 'OPERA',
          'BROWSER_SAFARI': 'SAFARI',
          'BROWSER_MOZILLA': 'MOZILLA',
          'NODE_JS': 'NODE_JS',
          'IS_CLIENT': false,
      };
      var _platform = [];
      if (typeof navigator !== "undefined"){
          let ua = navigator.userAgent.toLowerCase();
          let s;
          (s = ua.match(/msie ([\d.]+)/)) ? _platform = [env.BROWSER_IE, parseFloat(s[1])] :
          (s = ua.match(/firefox\/([\d.]+)/)) ? _platform = [env.BROWSER_FIREFOX, parseFloat(s[1])] :
          (s = ua.match(/chrome\/([\d.]+)/)) ? _platform = [env.BROWSER_CHROME, parseFloat(s[1])] :
          (s = ua.match(/opera.([\d.]+)/)) ? _platform = [env.BROWSER_OPERA, parseFloat(s[1])] :
          (s = ua.match(/version\/([\d.]+).*safari/)) ? _platform = [env.BROWSER_SAFARI, parseFloat(s[1])] :
          (s = ua.match(/^mozilla\/([\d.]+)/)) ? _platform = [env.BROWSER_MOZILLA, parseFloat(s[1])] : null;
          env.IS_CLIENT = true;
      }else {
          if(typeof process !== 'undefined' && process.versions){
              _platform = [env.NODE_JS, process.versions.node];
          }else {
              _platform = ['OTHER', 0];
          }
      }

      /**
       * 获取当前运行平台
       * @returns {*}
       */
      env.platform = function platform(name, version){
          if ( typeof name === "string" ){
              name = name.toUpperCase();
              if( version > 0 )return name == _platform[0] && env.version( version );
              return name == _platform[0];
          }
          return _platform[0];
      };

      env.setPlatform=function setPlatform(name, version, isClient=false){
          _platform=[name,version];
          if(isClient){
              env.IS_CLIENT = true;
          }
      };

      /**
       * 判断是否为指定的浏览器
       * @param type
       * @returns {string|null}
       */
      env.version = function version(value, expr) {
          var result = _platform[1];
          if (value == null)return result;
          value = parseFloat(value);
          switch (expr) {
              case '=' :
                  return result == value;
              case '!=' :
                  return result != value;
              case '>' :
                  return result > value;
              case '>=' :
                  return result >= value;
              case '<=' :
                  return result <= value;
              case '<' :
                  return result < value;
              default:
                  return result <= value;
          }
      };
      System.env = env;
  }(System));


  (function (global, undefined$1) {

      if (global.setImmediate) {
          System.setImmediate = global.setImmediate;
          System.clearImmediate = global.clearImmediate;
          return;
      }

      var nextHandle = 1; // Spec says greater than zero
      var tasksByHandle = {};
      var currentlyRunningATask = false;
      var doc = global.document;
      var registerImmediate;

      function setImmediate(callback) {
        // Callback can either be a function or a string
        if (typeof callback !== "function") {
          callback = new Function("" + callback);
        }
        // Copy function arguments
        var args = new Array(arguments.length - 1);
        for (var i = 0; i < args.length; i++) {
            args[i] = arguments[i + 1];
        }
        // Store and register the task
        var task = { callback: callback, args: args };
        tasksByHandle[nextHandle] = task;
        registerImmediate(nextHandle);
        return nextHandle++;
      }

      function clearImmediate(handle) {
          delete tasksByHandle[handle];
      }

      function run(task) {
          var callback = task.callback;
          var args = task.args;
          switch (args.length) {
          case 0:
              callback();
              break;
          case 1:
              callback(args[0]);
              break;
          case 2:
              callback(args[0], args[1]);
              break;
          case 3:
              callback(args[0], args[1], args[2]);
              break;
          default:
              callback.apply(undefined$1, args);
              break;
          }
      }

      function runIfPresent(handle) {
          // From the spec: "Wait until any invocations of this algorithm started before this one have completed."
          // So if we're currently running a task, we'll need to delay this invocation.
          if (currentlyRunningATask) {
              // Delay by doing a setTimeout. setImmediate was tried instead, but in Firefox 7 it generated a
              // "too much recursion" error.
              setTimeout(runIfPresent, 0, handle);
          } else {
              var task = tasksByHandle[handle];
              if (task) {
                  currentlyRunningATask = true;
                  try {
                      run(task);
                  } finally {
                      clearImmediate(handle);
                      currentlyRunningATask = false;
                  }
              }
          }
      }

      function installNextTickImplementation() {
          registerImmediate = function(handle) {
              process.nextTick(function () { runIfPresent(handle); });
          };
      }

      function canUsePostMessage() {
          // The test against `importScripts` prevents this implementation from being installed inside a web worker,
          // where `global.postMessage` means something completely different and can't be used for this purpose.
          if (global.postMessage && !global.importScripts) {
              var postMessageIsAsynchronous = true;
              var oldOnMessage = global.onmessage;
              global.onmessage = function() {
                  postMessageIsAsynchronous = false;
              };
              global.postMessage("", "*");
              global.onmessage = oldOnMessage;
              return postMessageIsAsynchronous;
          }
      }

      function installPostMessageImplementation() {
          // Installs an event handler on `global` for the `message` event: see
          // * https://developer.mozilla.org/en/DOM/window.postMessage
          // * http://www.whatwg.org/specs/web-apps/current-work/multipage/comms.html#crossDocumentMessages

          var messagePrefix = "setImmediate$" + Math.random() + "$";
          var onGlobalMessage = function(event) {
              if (event.source === global &&
                  typeof event.data === "string" &&
                  event.data.indexOf(messagePrefix) === 0) {
                  runIfPresent(+event.data.slice(messagePrefix.length));
              }
          };

          if (global.addEventListener) {
              global.addEventListener("message", onGlobalMessage, false);
          } else {
              global.attachEvent("onmessage", onGlobalMessage);
          }

          registerImmediate = function(handle) {
              global.postMessage(messagePrefix + handle, "*");
          };
      }

      function installMessageChannelImplementation() {
          var channel = new MessageChannel();
          channel.port1.onmessage = function(event) {
              var handle = event.data;
              runIfPresent(handle);
          };

          registerImmediate = function(handle) {
              channel.port2.postMessage(handle);
          };
      }

      function installReadyStateChangeImplementation() {
          var html = doc.documentElement;
          registerImmediate = function(handle) {
              // Create a <script> element; its readystatechange event will be fired asynchronously once it is inserted
              // into the document. Do so, thus queuing up the task. Remember to clean up once it's been called.
              var script = doc.createElement("script");
              script.onreadystatechange = function () {
                  runIfPresent(handle);
                  script.onreadystatechange = null;
                  html.removeChild(script);
                  script = null;
              };
              html.appendChild(script);
          };
      }

      function installSetTimeoutImplementation() {
          registerImmediate = function(handle) {
              setTimeout(runIfPresent, 0, handle);
          };
      }

      // Don't get fooled by e.g. browserify environments.
      if ({}.toString.call(global.process) === "[object process]") {
          // For Node.js before 0.9
          installNextTickImplementation();

      } else if (canUsePostMessage()) {
          // For non-IE10 modern browsers
          installPostMessageImplementation();

      } else if (global.MessageChannel) {
          // For web workers, where supported
          installMessageChannelImplementation();

      } else if (doc && "onreadystatechange" in doc.createElement("script")) {
          // For IE 6–8
          installReadyStateChangeImplementation();

      } else {
          // For older browsers
          installSetTimeoutImplementation();
      }

      System.setImmediate = setImmediate;
      System.clearImmediate = clearImmediate;
  }(typeof self === "undefined" ? typeof global === "undefined" ? this : global : self));
  Class.creator(6,System,{
      id:1,
      name:"System"
  });

  /*
   * EaseScript
   * Copyright © 2017 EaseScript All rights reserved.
   * Released under the MIT license
   * https://github.com/51breeze/EaseScript
   * @author Jun Ye <664371281@qq.com>
   */

  const _Reflect = (function(_Reflect){
      const _construct = _Reflect ? _Reflect.construct : function construct(theClass,args){
          if( !isFun(theClass) ){
              throw new TypeError('is not class or function');
          }
          switch ( args.length ){
              case 0 :
                  return new theClass();
              case 1 :
                  return new theClass(args[0]);
              case 2 :
                  return new theClass(args[0], args[1]);
              case 3 :
                  return new theClass(args[0], args[1], args[2]);
              case 4 :
                  return new theClass(args[0], args[1], args[2],args[3]);
              case 5 :
                  return new theClass(args[0], args[1], args[2],args[3],args[4]);
              case 6 :
                  return new theClass(args[0], args[1], args[2],args[3],args[4],args[5]);
              case 7 :
                  return new theClass(args[0], args[1], args[2],args[3],args[4],args[5],args[6]);
              case 8 :
                  return new theClass(args[0], args[1], args[2],args[3],args[4],args[5],args[6],args[7]);
              default :
                  var items = [];
                  for(var i=0;i<args.length;i++)items.push(i);
                  return Function('f,a', 'return new f(a[' + items.join('],a[') + ']);')(theClass, args);
          }
      };

      const _apply = _Reflect ? _Reflect.apply : function apply(target, thisArgument, argumentsList){
          if( typeof target !== "function" ){
              throw new TypeError('is not function');
          }
          thisArgument = thisArgument === target ? undefined : thisArgument;
          if (argumentsList != null) {
              return target.apply(thisArgument === target ? undefined : thisArgument, argumentsList);
          }
          if (thisArgument != null) {
              return target.call(thisArgument);
          }
          return target();
      };

      const hasOwn = Object.prototype.hasOwnProperty;
      function isFun(target){
          return target && target.constructor === Function
      }

      function isClass(objClass){
          if( !objClass || !objClass.constructor)return false;
          var desc = objClass[ Class.key ];
          return desc && desc.id === Reflect.MODULE_CLASS;
      }

      function inContext(context,objClass){
          if(!context)return false;
          if(context===objClass)return true;
          const obj = context[Class.key];
          return obj ? inContext(obj.inherit, objClass) : false;
      }

      function Reflect(){ 
          throw new SyntaxError('Reflect is not constructor.');
      }

      Reflect.MODIFIER_PUBLIC = Class.CONSTANT.MODIFIER_PUBLIC;
      Reflect.MODIFIER_PROTECTED = Class.CONSTANT.MODIFIER_PROTECTED;
      Reflect.MODIFIER_PRIVATE = Class.CONSTANT.MODIFIER_PRIVATE;
      Reflect.MEMBERS_ACCESSOR = Class.CONSTANT.PROPERTY_ACCESSOR;
      Reflect.MEMBERS_PROPERTY = Class.CONSTANT.PROPERTY_VAR;
      Reflect.MEMBERS_READONLY = Class.CONSTANT.PROPERTY_CONST;
      Reflect.MEMBERS_METHODS = Class.CONSTANT.PROPERTY_FUN;
      Reflect.MEMBERS_ENUM_KEY = Class.CONSTANT.PROPERTY_ENUM_KEY;
      Reflect.MEMBERS_ENUM_VALUE = Class.CONSTANT.PROPERTY_ENUM_VALUE;
      Reflect.MODULE_CLASS = Class.CONSTANT.MODULE_CLASS;
      Reflect.MODULE_INTERFACE = Class.CONSTANT.MODULE_INTERFACE;
      Reflect.MODULE_ENUM = Class.CONSTANT.MODULE_ENUM;

      Reflect.apply=function apply(target, thisArgument, argumentsList ){
          if( !isFun(target) ){
              throw new TypeError('target is not function');
          }
          if( !Array.isArray(argumentsList) ){
              argumentsList = argumentsList !== void 0 ? [argumentsList] : [];
          }
          return _apply(target, thisArgument, argumentsList);
      };

      Reflect.call=function call(scope,target,propertyKey,argumentsList,thisArgument){
          if( target == null )throw new ReferenceError('target is null or undefined');
          if( propertyKey==null ){
              return Reflect.apply(target, thisArgument, argumentsList);
          }
          return Reflect.apply( Reflect.get(scope,target,propertyKey), thisArgument||target, argumentsList);    
      };

      Reflect.construct=function construct(target, args){
          if( !isClass(target) )throw new TypeError('target is not class');
          return _construct(target, args || []);
      };

      Reflect.deleteProperty=function deleteProperty(target, propertyKey){
          if( !target || propertyKey==null )return false;
          if( propertyKey==="__proto__")return false;
          if( isClass(target) || isClass(target.constructor) ){
              return false;
          }
          if( propertyKey in target ){
              return (delete target[propertyKey]);
          }
          return false;
      };

      Reflect.has=function has(target, propertyKey){
          if( propertyKey==null || target == null )return false;
          if( propertyKey==="__proto__")return false;
          if( isClass(target) || isClass(target.constructor) ) {
              return false;
          }
          return propertyKey in target;
      };


      Reflect.get=function get(scope,target,propertyKey,receiver){
          if( propertyKey===null ||  propertyKey === void 0)return target;
          if( propertyKey === '__proto__' )return null;
          if( target == null )throw new ReferenceError('target is null or undefined');

          const desc = Reflect.getDescriptor(target, propertyKey);
          if( !desc ){
              return null;
          }

          receiver = !receiver && typeof target ==="object" ? target : null;
          if(typeof receiver !=="object" ){
              throw new ReferenceError(`Assignment receiver can only is an object.`);
          }

          let result = null;
          if( !desc.class ){
              if(desc.get){
                  result = desc.get.call(receiver);
              }else {
                  result = desc.value;
              }
          }else if( !desc.isMember ){
              throw new ReferenceError(`target.${propertyKey} is not exists`);
          }else if( (desc.modifier === Reflect.MODIFIER_PRIVATE && desc.class !== scope) || (desc.modifier === Reflect.MODIFIER_PROTECTED && !inContext(scope, desc.class)) ){
              throw new ReferenceError(`target.${propertyKey} inaccessible`);
          }else {
              if( desc.type === Reflect.MEMBERS_ACCESSOR ){
                  if( !desc.get ){
                      throw new ReferenceError(`target.${propertyKey} getter is not exists.`);
                  }else {
                      result = desc.get.call(receiver);
                  }
              }else if( desc.type === Reflect.MEMBERS_METHODS ){
                  result = desc.method;
              }else {
                  result = desc.value;
              }
          }
          
          return result === void 0 ? null : result;
      };

      Reflect.set=function(scope,target,propertyKey,value,receiver){
          if( target == null || propertyKey===null ||  propertyKey === void 0 ){
              throw new ReferenceError('target or propertyKey is null or undefined');
          }

          if( propertyKey === '__proto__' )return null;
          const desc = Reflect.getDescriptor(target, propertyKey);

          if( !desc ){
              const objClass = Reflect.getDescriptor(target);
              if(objClass){
                  if( objClass.dynamic ){
                      return target[propertyKey] = value; 
                  }else {
                      throw new ReferenceError(`target.${propertyKey} is not exists.`);
                  }
              }else {
                  return target[propertyKey] = value;
              }
          }

          receiver = !receiver && typeof target ==="object" ? target : null;
          if(typeof receiver !=="object" ){
              throw new ReferenceError(`Assignment receiver can only is an object.`);
          }

          if( !desc.class ){
              if( (desc.get && !desc.set) || !desc.writable ){
                  throw new ReferenceError(`target.${propertyKey} is readonly.`);
              }else if(desc.set){
                  desc.set.call(receiver,value);
              }else {
                  target[propertyKey] = value;
              }
          }else if( !desc.isMember ){
              throw new ReferenceError(`target.${propertyKey} is not exists`);
          }else if( (desc.modifier === Reflect.MODIFIER_PRIVATE && desc.class !== scope) || (desc.modifier === Reflect.MODIFIER_PROTECTED && !inContext(scope, desc.class)) ){
              throw new ReferenceError(`target.${propertyKey} inaccessible`);
          }else {
              if( desc.type === Reflect.MEMBERS_ACCESSOR ){
                  if( !desc.set ){
                      throw new ReferenceError(`target.${propertyKey} setter is not exists.`);
                  }else {
                      desc.set.call(receiver, value);
                  }
              }else if( desc.type === Reflect.MEMBERS_METHODS || !desc.writable ){
                  throw new ReferenceError(`target.${propertyKey} is readonly.`);
              }else {
                  let object = target;
                  if( desc.modifier === Reflect.MODIFIER_PRIVATE ){
                      object = target[desc.privateKey];
                  }
                  if( object ){
                      object[propertyKey] = value;
                  }
              }
          }
          return value;
      };

      Reflect.incre=function incre(scope,target,propertyKey,flag){
          const val = Reflect.get(scope,target,propertyKey);
          const result = val+1;
          Reflect.set(scope,target, propertyKey, result);
          return flag === true ? val : result;
      };

      Reflect.decre= function decre(scope,target, propertyKey,flag){
          const val = Reflect.get(scope,target, propertyKey);
          const result = val-1;
          Reflect.set(scope,target, propertyKey,result);
          return flag === true ? val : result;
      };

      Reflect.getDescriptor=function getDescriptor(target,name){

          if(target===null||target === void 0)return false;
          target = Object(target);
          let objClass = target;
          let description = target[ Class.key ];
          let isStatic = true;
          if( !description && target.constructor ){
              isStatic = false;
              objClass = target.constructor;
              description = target.constructor[ Class.key ];
          }

          if( !description ){
              let result = null;
              if( name ){
                  try{
                      result = Object.getOwnPropertyDescriptor(target, name);
                      if( !result && name in target){
                          const configurable = hasOwn.call(target, name);
                          result = {
                              value:target[name],
                              writable:configurable,
                              configurable:configurable,
                              enumerable:configurable
                          };
                      }
                  }catch(e){}
              }
              return result;
          }

          if( !name ){
              let d = description;
              return {
                  'isModule':true,
                  'type':d.id,
                  'class':objClass,
                  'className':d.name,
                  'namespace':d.ns || null,
                  'dynamic':!!d.dynamic,
                  'isStatic':!!d.static,
                  'privateKey':d.private || null,
                  'implements':d.imps || null,
                  'members':d.members || null,
                  'methods':d.methods || null,
                  'inherit':d.inherit || null,
              };
          }

          const privateScope = objClass;
          while( objClass && (description = objClass[ Class.key ]) ){
              let dataset = isStatic ? description.methods : description.members;
              if( dataset && hasOwn.call(dataset,name) ){
                  const desc = dataset[name];
                  const modifier = desc.m & Reflect.MODIFIER_PUBLIC;
                  const item = {
                      'isMember':true,
                      'type':desc.d,
                      'class':objClass,
                      'isStatic':isStatic,
                      'privateKey':null,
                      'modifier':modifier,
                      'enumerable':false,
                      'writable':false,
                      'configurable':false
                  };

                  if( desc.d === Reflect.MEMBERS_ACCESSOR ){
                      item.label = 'accessor';
                      item.set = null;
                      item.get = null;
                      if(desc.set){
                          item.writable = true;
                          item.set = desc.set;
                      }
                      if(desc.get){
                          item.enumerable = true;
                          item.get = desc.get;
                      }
                  }else if( desc.d === Reflect.MEMBERS_METHODS ){
                      item.label = 'method';
                      item.method = desc.value;
                  }else {
                      item.label = 'property';
                      item.writable = Reflect.MEMBERS_READONLY !== desc.d;
                      item.enumerable = true;
                      item.value = desc.value || null;
                      if( isStatic ){
                          item.value = target[name] || null;
                      }else {
                          if( item.modifier === Reflect.MODIFIER_PRIVATE ){
                              const objPrivate = target[ description.private ];
                              item.dataset = objPrivate;
                              if(objPrivate && name in objPrivate){
                                  item.value = objPrivate[name] || null;
                              }
                          }else {
                              item.value = target[name] || null;
                          }
                      }
                  }

                  if( item.modifier === Reflect.MODIFIER_PRIVATE ){
                      item.privateKey = description.private;
                      if( privateScope !== objClass ){
                          continue;
                      }
                  }
                  
                  return item;
              }
              objClass = description.inherit;
          }

          return null;
      };

      return Reflect;

  }(Reflect));
  Class.creator(12,_Reflect,{
      id:1,
      name:"Reflect"
  });

  function ComponentEvent(type,bubbles,cancelable){
      ESEvent.call(this,type,bubbles,cancelable);
  }
  const methods = {
      BEFORE_CREATE:{
          m:3,
          d:2,
          enumerable:true,
          value:'componentBeforeCreate'
      },
      BEFORE_MOUNT:{
          m:3,
          d:2,
          enumerable:true,
          value:'componentBeforeMount'
      },
      BEFORE_UPDATE:{
          m:3,
          d:2,
          enumerable:true,
          value:'componentBeforeUpdate'
      },
      BEFORE_DESTROY:{
          m:3,
          d:2,
          enumerable:true,
          value:'componentBeforeDestroy'
      },
      ERROR_CAPTURED:{
          m:3,
          d:2,
          enumerable:true,
          value:'componentErrorCaptured'
      },
      UPDATED:{
          m:3,
          d:2,
          enumerable:true,
          value:'componentUpdated'
      },
      MOUNTED:{
          m:3,
          d:2,
          enumerable:true,
          value:'componentMounted'
      },
      CREATED:{
          m:3,
          d:2,
          enumerable:true,
          value:'componentCreated'
      },
      ACTIVATED:{
          m:3,
          d:2,
          enumerable:true,
          value:'componentActivated'
      },
      DEACTIVATED:{
          m:3,
          d:2,
          enumerable:true,
          value:'componentDeactivated'
      },
      DESTROYED:{
          m:3,
          d:2,
          enumerable:true,
          value:'componentDestroyed'
      },
      RENDER_TRACKED:{
          m:3,
          d:2,
          enumerable:true,
          value:'componentRenderTracked'
      },
      RENDER_TRIGGERED:{
          m:3,
          d:2,
          enumerable:true,
          value:'componentonRenderTriggered'
      },
      SERVER_PREFETCH:{
          m:3,
          d:2,
          enumerable:true,
          value:'componentonServerPrefetch'
      }
  };
  Class.creator(15,ComponentEvent,{
      id:1,
      ns:"web.events",
      name:"ComponentEvent",
      inherit:ESEvent,
      methods:methods
  });

  /*!
   * Vue.js v2.6.14
   * (c) 2014-2021 Evan You
   * Released under the MIT License.
   */
  /*  */

  var emptyObject = Object.freeze({});

  // These helpers produce better VM code in JS engines due to their
  // explicitness and function inlining.
  function isUndef (v) {
    return v === undefined || v === null
  }

  function isDef (v) {
    return v !== undefined && v !== null
  }

  function isTrue (v) {
    return v === true
  }

  function isFalse (v) {
    return v === false
  }

  /**
   * Check if value is primitive.
   */
  function isPrimitive (value) {
    return (
      typeof value === 'string' ||
      typeof value === 'number' ||
      // $flow-disable-line
      typeof value === 'symbol' ||
      typeof value === 'boolean'
    )
  }

  /**
   * Quick object check - this is primarily used to tell
   * Objects from primitive values when we know the value
   * is a JSON-compliant type.
   */
  function isObject (obj) {
    return obj !== null && typeof obj === 'object'
  }

  /**
   * Get the raw type string of a value, e.g., [object Object].
   */
  var _toString = Object.prototype.toString;

  function toRawType (value) {
    return _toString.call(value).slice(8, -1)
  }

  /**
   * Strict object type check. Only returns true
   * for plain JavaScript objects.
   */
  function isPlainObject (obj) {
    return _toString.call(obj) === '[object Object]'
  }

  function isRegExp (v) {
    return _toString.call(v) === '[object RegExp]'
  }

  /**
   * Check if val is a valid array index.
   */
  function isValidArrayIndex (val) {
    var n = parseFloat(String(val));
    return n >= 0 && Math.floor(n) === n && isFinite(val)
  }

  function isPromise (val) {
    return (
      isDef(val) &&
      typeof val.then === 'function' &&
      typeof val.catch === 'function'
    )
  }

  /**
   * Convert a value to a string that is actually rendered.
   */
  function toString (val) {
    return val == null
      ? ''
      : Array.isArray(val) || (isPlainObject(val) && val.toString === _toString)
        ? JSON.stringify(val, null, 2)
        : String(val)
  }

  /**
   * Convert an input value to a number for persistence.
   * If the conversion fails, return original string.
   */
  function toNumber (val) {
    var n = parseFloat(val);
    return isNaN(n) ? val : n
  }

  /**
   * Make a map and return a function for checking if a key
   * is in that map.
   */
  function makeMap (
    str,
    expectsLowerCase
  ) {
    var map = Object.create(null);
    var list = str.split(',');
    for (var i = 0; i < list.length; i++) {
      map[list[i]] = true;
    }
    return expectsLowerCase
      ? function (val) { return map[val.toLowerCase()]; }
      : function (val) { return map[val]; }
  }

  /**
   * Check if a tag is a built-in tag.
   */
  var isBuiltInTag = makeMap('slot,component', true);

  /**
   * Check if an attribute is a reserved attribute.
   */
  var isReservedAttribute = makeMap('key,ref,slot,slot-scope,is');

  /**
   * Remove an item from an array.
   */
  function remove (arr, item) {
    if (arr.length) {
      var index = arr.indexOf(item);
      if (index > -1) {
        return arr.splice(index, 1)
      }
    }
  }

  /**
   * Check whether an object has the property.
   */
  var hasOwnProperty = Object.prototype.hasOwnProperty;
  function hasOwn (obj, key) {
    return hasOwnProperty.call(obj, key)
  }

  /**
   * Create a cached version of a pure function.
   */
  function cached (fn) {
    var cache = Object.create(null);
    return (function cachedFn (str) {
      var hit = cache[str];
      return hit || (cache[str] = fn(str))
    })
  }

  /**
   * Camelize a hyphen-delimited string.
   */
  var camelizeRE = /-(\w)/g;
  var camelize = cached(function (str) {
    return str.replace(camelizeRE, function (_, c) { return c ? c.toUpperCase() : ''; })
  });

  /**
   * Capitalize a string.
   */
  var capitalize = cached(function (str) {
    return str.charAt(0).toUpperCase() + str.slice(1)
  });

  /**
   * Hyphenate a camelCase string.
   */
  var hyphenateRE = /\B([A-Z])/g;
  var hyphenate = cached(function (str) {
    return str.replace(hyphenateRE, '-$1').toLowerCase()
  });

  /**
   * Simple bind polyfill for environments that do not support it,
   * e.g., PhantomJS 1.x. Technically, we don't need this anymore
   * since native bind is now performant enough in most browsers.
   * But removing it would mean breaking code that was able to run in
   * PhantomJS 1.x, so this must be kept for backward compatibility.
   */

  /* istanbul ignore next */
  function polyfillBind (fn, ctx) {
    function boundFn (a) {
      var l = arguments.length;
      return l
        ? l > 1
          ? fn.apply(ctx, arguments)
          : fn.call(ctx, a)
        : fn.call(ctx)
    }

    boundFn._length = fn.length;
    return boundFn
  }

  function nativeBind (fn, ctx) {
    return fn.bind(ctx)
  }

  var bind = Function.prototype.bind
    ? nativeBind
    : polyfillBind;

  /**
   * Convert an Array-like object to a real Array.
   */
  function toArray (list, start) {
    start = start || 0;
    var i = list.length - start;
    var ret = new Array(i);
    while (i--) {
      ret[i] = list[i + start];
    }
    return ret
  }

  /**
   * Mix properties into target object.
   */
  function extend (to, _from) {
    for (var key in _from) {
      to[key] = _from[key];
    }
    return to
  }

  /**
   * Merge an Array of Objects into a single Object.
   */
  function toObject (arr) {
    var res = {};
    for (var i = 0; i < arr.length; i++) {
      if (arr[i]) {
        extend(res, arr[i]);
      }
    }
    return res
  }

  /* eslint-disable no-unused-vars */

  /**
   * Perform no operation.
   * Stubbing args to make Flow happy without leaving useless transpiled code
   * with ...rest (https://flow.org/blog/2017/05/07/Strict-Function-Call-Arity/).
   */
  function noop (a, b, c) {}

  /**
   * Always return false.
   */
  var no = function (a, b, c) { return false; };

  /* eslint-enable no-unused-vars */

  /**
   * Return the same value.
   */
  var identity = function (_) { return _; };

  /**
   * Check if two values are loosely equal - that is,
   * if they are plain objects, do they have the same shape?
   */
  function looseEqual (a, b) {
    if (a === b) { return true }
    var isObjectA = isObject(a);
    var isObjectB = isObject(b);
    if (isObjectA && isObjectB) {
      try {
        var isArrayA = Array.isArray(a);
        var isArrayB = Array.isArray(b);
        if (isArrayA && isArrayB) {
          return a.length === b.length && a.every(function (e, i) {
            return looseEqual(e, b[i])
          })
        } else if (a instanceof Date && b instanceof Date) {
          return a.getTime() === b.getTime()
        } else if (!isArrayA && !isArrayB) {
          var keysA = Object.keys(a);
          var keysB = Object.keys(b);
          return keysA.length === keysB.length && keysA.every(function (key) {
            return looseEqual(a[key], b[key])
          })
        } else {
          /* istanbul ignore next */
          return false
        }
      } catch (e) {
        /* istanbul ignore next */
        return false
      }
    } else if (!isObjectA && !isObjectB) {
      return String(a) === String(b)
    } else {
      return false
    }
  }

  /**
   * Return the first index at which a loosely equal value can be
   * found in the array (if value is a plain object, the array must
   * contain an object of the same shape), or -1 if it is not present.
   */
  function looseIndexOf (arr, val) {
    for (var i = 0; i < arr.length; i++) {
      if (looseEqual(arr[i], val)) { return i }
    }
    return -1
  }

  /**
   * Ensure a function is called only once.
   */
  function once (fn) {
    var called = false;
    return function () {
      if (!called) {
        called = true;
        fn.apply(this, arguments);
      }
    }
  }

  var SSR_ATTR = 'data-server-rendered';

  var ASSET_TYPES = [
    'component',
    'directive',
    'filter'
  ];

  var LIFECYCLE_HOOKS = [
    'beforeCreate',
    'created',
    'beforeMount',
    'mounted',
    'beforeUpdate',
    'updated',
    'beforeDestroy',
    'destroyed',
    'activated',
    'deactivated',
    'errorCaptured',
    'serverPrefetch'
  ];

  /*  */



  var config = ({
    /**
     * Option merge strategies (used in core/util/options)
     */
    // $flow-disable-line
    optionMergeStrategies: Object.create(null),

    /**
     * Whether to suppress warnings.
     */
    silent: false,

    /**
     * Show production mode tip message on boot?
     */
    productionTip: "development" !== 'production',

    /**
     * Whether to enable devtools
     */
    devtools: "development" !== 'production',

    /**
     * Whether to record perf
     */
    performance: false,

    /**
     * Error handler for watcher errors
     */
    errorHandler: null,

    /**
     * Warn handler for watcher warns
     */
    warnHandler: null,

    /**
     * Ignore certain custom elements
     */
    ignoredElements: [],

    /**
     * Custom user key aliases for v-on
     */
    // $flow-disable-line
    keyCodes: Object.create(null),

    /**
     * Check if a tag is reserved so that it cannot be registered as a
     * component. This is platform-dependent and may be overwritten.
     */
    isReservedTag: no,

    /**
     * Check if an attribute is reserved so that it cannot be used as a component
     * prop. This is platform-dependent and may be overwritten.
     */
    isReservedAttr: no,

    /**
     * Check if a tag is an unknown element.
     * Platform-dependent.
     */
    isUnknownElement: no,

    /**
     * Get the namespace of an element
     */
    getTagNamespace: noop,

    /**
     * Parse the real tag name for the specific platform.
     */
    parsePlatformTagName: identity,

    /**
     * Check if an attribute must be bound using property, e.g. value
     * Platform-dependent.
     */
    mustUseProp: no,

    /**
     * Perform updates asynchronously. Intended to be used by Vue Test Utils
     * This will significantly reduce performance if set to false.
     */
    async: true,

    /**
     * Exposed for legacy reasons
     */
    _lifecycleHooks: LIFECYCLE_HOOKS
  });

  /*  */

  /**
   * unicode letters used for parsing html tags, component names and property paths.
   * using https://www.w3.org/TR/html53/semantics-scripting.html#potentialcustomelementname
   * skipping \u10000-\uEFFFF due to it freezing up PhantomJS
   */
  var unicodeRegExp = /a-zA-Z\u00B7\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u037D\u037F-\u1FFF\u200C-\u200D\u203F-\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD/;

  /**
   * Check if a string starts with $ or _
   */
  function isReserved (str) {
    var c = (str + '').charCodeAt(0);
    return c === 0x24 || c === 0x5F
  }

  /**
   * Define a property.
   */
  function def (obj, key, val, enumerable) {
    Object.defineProperty(obj, key, {
      value: val,
      enumerable: !!enumerable,
      writable: true,
      configurable: true
    });
  }

  /**
   * Parse simple path.
   */
  var bailRE = new RegExp(("[^" + (unicodeRegExp.source) + ".$_\\d]"));
  function parsePath (path) {
    if (bailRE.test(path)) {
      return
    }
    var segments = path.split('.');
    return function (obj) {
      for (var i = 0; i < segments.length; i++) {
        if (!obj) { return }
        obj = obj[segments[i]];
      }
      return obj
    }
  }

  /*  */

  // can we use __proto__?
  var hasProto = '__proto__' in {};

  // Browser environment sniffing
  var inBrowser = typeof window !== 'undefined';
  var inWeex = typeof WXEnvironment !== 'undefined' && !!WXEnvironment.platform;
  var weexPlatform = inWeex && WXEnvironment.platform.toLowerCase();
  var UA = inBrowser && window.navigator.userAgent.toLowerCase();
  var isIE = UA && /msie|trident/.test(UA);
  var isIE9 = UA && UA.indexOf('msie 9.0') > 0;
  var isEdge = UA && UA.indexOf('edge/') > 0;
  var isAndroid = (UA && UA.indexOf('android') > 0) || (weexPlatform === 'android');
  var isIOS = (UA && /iphone|ipad|ipod|ios/.test(UA)) || (weexPlatform === 'ios');
  var isChrome = UA && /chrome\/\d+/.test(UA) && !isEdge;
  var isPhantomJS = UA && /phantomjs/.test(UA);
  var isFF = UA && UA.match(/firefox\/(\d+)/);

  // Firefox has a "watch" function on Object.prototype...
  var nativeWatch = ({}).watch;

  var supportsPassive = false;
  if (inBrowser) {
    try {
      var opts = {};
      Object.defineProperty(opts, 'passive', ({
        get: function get () {
          /* istanbul ignore next */
          supportsPassive = true;
        }
      })); // https://github.com/facebook/flow/issues/285
      window.addEventListener('test-passive', null, opts);
    } catch (e) {}
  }

  // this needs to be lazy-evaled because vue may be required before
  // vue-server-renderer can set VUE_ENV
  var _isServer;
  var isServerRendering = function () {
    if (_isServer === undefined) {
      /* istanbul ignore if */
      if (!inBrowser && !inWeex && typeof global !== 'undefined') {
        // detect presence of vue-server-renderer and avoid
        // Webpack shimming the process
        _isServer = global['process'] && global['process'].env.VUE_ENV === 'server';
      } else {
        _isServer = false;
      }
    }
    return _isServer
  };

  // detect devtools
  var devtools = inBrowser && window.__VUE_DEVTOOLS_GLOBAL_HOOK__;

  /* istanbul ignore next */
  function isNative (Ctor) {
    return typeof Ctor === 'function' && /native code/.test(Ctor.toString())
  }

  var hasSymbol =
    typeof Symbol !== 'undefined' && isNative(Symbol) &&
    typeof Reflect !== 'undefined' && isNative(Reflect.ownKeys);

  var _Set;
  /* istanbul ignore if */ // $flow-disable-line
  if (typeof Set !== 'undefined' && isNative(Set)) {
    // use native Set when available.
    _Set = Set;
  } else {
    // a non-standard Set polyfill that only works with primitive keys.
    _Set = /*@__PURE__*/(function () {
      function Set () {
        this.set = Object.create(null);
      }
      Set.prototype.has = function has (key) {
        return this.set[key] === true
      };
      Set.prototype.add = function add (key) {
        this.set[key] = true;
      };
      Set.prototype.clear = function clear () {
        this.set = Object.create(null);
      };

      return Set;
    }());
  }

  /*  */

  var warn = noop;
  var tip = noop;
  var generateComponentTrace = (noop); // work around flow check
  var formatComponentName = (noop);

  {
    var hasConsole = typeof console !== 'undefined';
    var classifyRE = /(?:^|[-_])(\w)/g;
    var classify = function (str) { return str
      .replace(classifyRE, function (c) { return c.toUpperCase(); })
      .replace(/[-_]/g, ''); };

    warn = function (msg, vm) {
      var trace = vm ? generateComponentTrace(vm) : '';

      if (config.warnHandler) {
        config.warnHandler.call(null, msg, vm, trace);
      } else if (hasConsole && (!config.silent)) {
        console.error(("[Vue warn]: " + msg + trace));
      }
    };

    tip = function (msg, vm) {
      if (hasConsole && (!config.silent)) {
        console.warn("[Vue tip]: " + msg + (
          vm ? generateComponentTrace(vm) : ''
        ));
      }
    };

    formatComponentName = function (vm, includeFile) {
      if (vm.$root === vm) {
        return '<Root>'
      }
      var options = typeof vm === 'function' && vm.cid != null
        ? vm.options
        : vm._isVue
          ? vm.$options || vm.constructor.options
          : vm;
      var name = options.name || options._componentTag;
      var file = options.__file;
      if (!name && file) {
        var match = file.match(/([^/\\]+)\.vue$/);
        name = match && match[1];
      }

      return (
        (name ? ("<" + (classify(name)) + ">") : "<Anonymous>") +
        (file && includeFile !== false ? (" at " + file) : '')
      )
    };

    var repeat = function (str, n) {
      var res = '';
      while (n) {
        if (n % 2 === 1) { res += str; }
        if (n > 1) { str += str; }
        n >>= 1;
      }
      return res
    };

    generateComponentTrace = function (vm) {
      if (vm._isVue && vm.$parent) {
        var tree = [];
        var currentRecursiveSequence = 0;
        while (vm) {
          if (tree.length > 0) {
            var last = tree[tree.length - 1];
            if (last.constructor === vm.constructor) {
              currentRecursiveSequence++;
              vm = vm.$parent;
              continue
            } else if (currentRecursiveSequence > 0) {
              tree[tree.length - 1] = [last, currentRecursiveSequence];
              currentRecursiveSequence = 0;
            }
          }
          tree.push(vm);
          vm = vm.$parent;
        }
        return '\n\nfound in\n\n' + tree
          .map(function (vm, i) { return ("" + (i === 0 ? '---> ' : repeat(' ', 5 + i * 2)) + (Array.isArray(vm)
              ? ((formatComponentName(vm[0])) + "... (" + (vm[1]) + " recursive calls)")
              : formatComponentName(vm))); })
          .join('\n')
      } else {
        return ("\n\n(found in " + (formatComponentName(vm)) + ")")
      }
    };
  }

  /*  */

  var uid = 0;

  /**
   * A dep is an observable that can have multiple
   * directives subscribing to it.
   */
  var Dep = function Dep () {
    this.id = uid++;
    this.subs = [];
  };

  Dep.prototype.addSub = function addSub (sub) {
    this.subs.push(sub);
  };

  Dep.prototype.removeSub = function removeSub (sub) {
    remove(this.subs, sub);
  };

  Dep.prototype.depend = function depend () {
    if (Dep.target) {
      Dep.target.addDep(this);
    }
  };

  Dep.prototype.notify = function notify () {
    // stabilize the subscriber list first
    var subs = this.subs.slice();
    if ( !config.async) {
      // subs aren't sorted in scheduler if not running async
      // we need to sort them now to make sure they fire in correct
      // order
      subs.sort(function (a, b) { return a.id - b.id; });
    }
    for (var i = 0, l = subs.length; i < l; i++) {
      subs[i].update();
    }
  };

  // The current target watcher being evaluated.
  // This is globally unique because only one watcher
  // can be evaluated at a time.
  Dep.target = null;
  var targetStack = [];

  function pushTarget (target) {
    targetStack.push(target);
    Dep.target = target;
  }

  function popTarget () {
    targetStack.pop();
    Dep.target = targetStack[targetStack.length - 1];
  }

  /*  */

  var VNode = function VNode (
    tag,
    data,
    children,
    text,
    elm,
    context,
    componentOptions,
    asyncFactory
  ) {
    this.tag = tag;
    this.data = data;
    this.children = children;
    this.text = text;
    this.elm = elm;
    this.ns = undefined;
    this.context = context;
    this.fnContext = undefined;
    this.fnOptions = undefined;
    this.fnScopeId = undefined;
    this.key = data && data.key;
    this.componentOptions = componentOptions;
    this.componentInstance = undefined;
    this.parent = undefined;
    this.raw = false;
    this.isStatic = false;
    this.isRootInsert = true;
    this.isComment = false;
    this.isCloned = false;
    this.isOnce = false;
    this.asyncFactory = asyncFactory;
    this.asyncMeta = undefined;
    this.isAsyncPlaceholder = false;
  };

  var prototypeAccessors = { child: { configurable: true } };

  // DEPRECATED: alias for componentInstance for backwards compat.
  /* istanbul ignore next */
  prototypeAccessors.child.get = function () {
    return this.componentInstance
  };

  Object.defineProperties( VNode.prototype, prototypeAccessors );

  var createEmptyVNode = function (text) {
    if ( text === void 0 ) text = '';

    var node = new VNode();
    node.text = text;
    node.isComment = true;
    return node
  };

  function createTextVNode (val) {
    return new VNode(undefined, undefined, undefined, String(val))
  }

  // optimized shallow clone
  // used for static nodes and slot nodes because they may be reused across
  // multiple renders, cloning them avoids errors when DOM manipulations rely
  // on their elm reference.
  function cloneVNode (vnode) {
    var cloned = new VNode(
      vnode.tag,
      vnode.data,
      // #7975
      // clone children array to avoid mutating original in case of cloning
      // a child.
      vnode.children && vnode.children.slice(),
      vnode.text,
      vnode.elm,
      vnode.context,
      vnode.componentOptions,
      vnode.asyncFactory
    );
    cloned.ns = vnode.ns;
    cloned.isStatic = vnode.isStatic;
    cloned.key = vnode.key;
    cloned.isComment = vnode.isComment;
    cloned.fnContext = vnode.fnContext;
    cloned.fnOptions = vnode.fnOptions;
    cloned.fnScopeId = vnode.fnScopeId;
    cloned.asyncMeta = vnode.asyncMeta;
    cloned.isCloned = true;
    return cloned
  }

  /*
   * not type checking this file because flow doesn't play well with
   * dynamically accessing methods on Array prototype
   */

  var arrayProto = Array.prototype;
  var arrayMethods = Object.create(arrayProto);

  var methodsToPatch = [
    'push',
    'pop',
    'shift',
    'unshift',
    'splice',
    'sort',
    'reverse'
  ];

  /**
   * Intercept mutating methods and emit events
   */
  methodsToPatch.forEach(function (method) {
    // cache original method
    var original = arrayProto[method];
    def(arrayMethods, method, function mutator () {
      var args = [], len = arguments.length;
      while ( len-- ) args[ len ] = arguments[ len ];

      var result = original.apply(this, args);
      var ob = this.__ob__;
      var inserted;
      switch (method) {
        case 'push':
        case 'unshift':
          inserted = args;
          break
        case 'splice':
          inserted = args.slice(2);
          break
      }
      if (inserted) { ob.observeArray(inserted); }
      // notify change
      ob.dep.notify();
      return result
    });
  });

  /*  */

  var arrayKeys = Object.getOwnPropertyNames(arrayMethods);

  /**
   * In some cases we may want to disable observation inside a component's
   * update computation.
   */
  var shouldObserve = true;

  function toggleObserving (value) {
    shouldObserve = value;
  }

  /**
   * Observer class that is attached to each observed
   * object. Once attached, the observer converts the target
   * object's property keys into getter/setters that
   * collect dependencies and dispatch updates.
   */
  var Observer = function Observer (value) {
    this.value = value;
    this.dep = new Dep();
    this.vmCount = 0;
    def(value, '__ob__', this);
    if (Array.isArray(value)) {
      if (hasProto) {
        protoAugment(value, arrayMethods);
      } else {
        copyAugment(value, arrayMethods, arrayKeys);
      }
      this.observeArray(value);
    } else {
      this.walk(value);
    }
  };

  /**
   * Walk through all properties and convert them into
   * getter/setters. This method should only be called when
   * value type is Object.
   */
  Observer.prototype.walk = function walk (obj) {
    var keys = Object.keys(obj);
    for (var i = 0; i < keys.length; i++) {
      defineReactive$$1(obj, keys[i]);
    }
  };

  /**
   * Observe a list of Array items.
   */
  Observer.prototype.observeArray = function observeArray (items) {
    for (var i = 0, l = items.length; i < l; i++) {
      observe(items[i]);
    }
  };

  // helpers

  /**
   * Augment a target Object or Array by intercepting
   * the prototype chain using __proto__
   */
  function protoAugment (target, src) {
    /* eslint-disable no-proto */
    target.__proto__ = src;
    /* eslint-enable no-proto */
  }

  /**
   * Augment a target Object or Array by defining
   * hidden properties.
   */
  /* istanbul ignore next */
  function copyAugment (target, src, keys) {
    for (var i = 0, l = keys.length; i < l; i++) {
      var key = keys[i];
      def(target, key, src[key]);
    }
  }

  /**
   * Attempt to create an observer instance for a value,
   * returns the new observer if successfully observed,
   * or the existing observer if the value already has one.
   */
  function observe (value, asRootData) {
    if (!isObject(value) || value instanceof VNode) {
      return
    }
    var ob;
    if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
      ob = value.__ob__;
    } else if (
      shouldObserve &&
      !isServerRendering() &&
      (Array.isArray(value) || isPlainObject(value)) &&
      Object.isExtensible(value) &&
      !value._isVue
    ) {
      ob = new Observer(value);
    }
    if (asRootData && ob) {
      ob.vmCount++;
    }
    return ob
  }

  /**
   * Define a reactive property on an Object.
   */
  function defineReactive$$1 (
    obj,
    key,
    val,
    customSetter,
    shallow
  ) {
    var dep = new Dep();

    var property = Object.getOwnPropertyDescriptor(obj, key);
    if (property && property.configurable === false) {
      return
    }

    // cater for pre-defined getter/setters
    var getter = property && property.get;
    var setter = property && property.set;
    if ((!getter || setter) && arguments.length === 2) {
      val = obj[key];
    }

    var childOb = !shallow && observe(val);
    Object.defineProperty(obj, key, {
      enumerable: true,
      configurable: true,
      get: function reactiveGetter () {
        var value = getter ? getter.call(obj) : val;
        if (Dep.target) {
          dep.depend();
          if (childOb) {
            childOb.dep.depend();
            if (Array.isArray(value)) {
              dependArray(value);
            }
          }
        }
        return value
      },
      set: function reactiveSetter (newVal) {
        var value = getter ? getter.call(obj) : val;
        /* eslint-disable no-self-compare */
        if (newVal === value || (newVal !== newVal && value !== value)) {
          return
        }
        /* eslint-enable no-self-compare */
        if ( customSetter) {
          customSetter();
        }
        // #7981: for accessor properties without setter
        if (getter && !setter) { return }
        if (setter) {
          setter.call(obj, newVal);
        } else {
          val = newVal;
        }
        childOb = !shallow && observe(newVal);
        dep.notify();
      }
    });
  }

  /**
   * Set a property on an object. Adds the new property and
   * triggers change notification if the property doesn't
   * already exist.
   */
  function set (target, key, val) {
    if (
      (isUndef(target) || isPrimitive(target))
    ) {
      warn(("Cannot set reactive property on undefined, null, or primitive value: " + ((target))));
    }
    if (Array.isArray(target) && isValidArrayIndex(key)) {
      target.length = Math.max(target.length, key);
      target.splice(key, 1, val);
      return val
    }
    if (key in target && !(key in Object.prototype)) {
      target[key] = val;
      return val
    }
    var ob = (target).__ob__;
    if (target._isVue || (ob && ob.vmCount)) {
       warn(
        'Avoid adding reactive properties to a Vue instance or its root $data ' +
        'at runtime - declare it upfront in the data option.'
      );
      return val
    }
    if (!ob) {
      target[key] = val;
      return val
    }
    defineReactive$$1(ob.value, key, val);
    ob.dep.notify();
    return val
  }

  /**
   * Delete a property and trigger change if necessary.
   */
  function del (target, key) {
    if (
      (isUndef(target) || isPrimitive(target))
    ) {
      warn(("Cannot delete reactive property on undefined, null, or primitive value: " + ((target))));
    }
    if (Array.isArray(target) && isValidArrayIndex(key)) {
      target.splice(key, 1);
      return
    }
    var ob = (target).__ob__;
    if (target._isVue || (ob && ob.vmCount)) {
       warn(
        'Avoid deleting properties on a Vue instance or its root $data ' +
        '- just set it to null.'
      );
      return
    }
    if (!hasOwn(target, key)) {
      return
    }
    delete target[key];
    if (!ob) {
      return
    }
    ob.dep.notify();
  }

  /**
   * Collect dependencies on array elements when the array is touched, since
   * we cannot intercept array element access like property getters.
   */
  function dependArray (value) {
    for (var e = (void 0), i = 0, l = value.length; i < l; i++) {
      e = value[i];
      e && e.__ob__ && e.__ob__.dep.depend();
      if (Array.isArray(e)) {
        dependArray(e);
      }
    }
  }

  /*  */

  /**
   * Option overwriting strategies are functions that handle
   * how to merge a parent option value and a child option
   * value into the final value.
   */
  var strats = config.optionMergeStrategies;

  /**
   * Options with restrictions
   */
  {
    strats.el = strats.propsData = function (parent, child, vm, key) {
      if (!vm) {
        warn(
          "option \"" + key + "\" can only be used during instance " +
          'creation with the `new` keyword.'
        );
      }
      return defaultStrat(parent, child)
    };
  }

  /**
   * Helper that recursively merges two data objects together.
   */
  function mergeData (to, from) {
    if (!from) { return to }
    var key, toVal, fromVal;

    var keys = hasSymbol
      ? Reflect.ownKeys(from)
      : Object.keys(from);

    for (var i = 0; i < keys.length; i++) {
      key = keys[i];
      // in case the object is already observed...
      if (key === '__ob__') { continue }
      toVal = to[key];
      fromVal = from[key];
      if (!hasOwn(to, key)) {
        set(to, key, fromVal);
      } else if (
        toVal !== fromVal &&
        isPlainObject(toVal) &&
        isPlainObject(fromVal)
      ) {
        mergeData(toVal, fromVal);
      }
    }
    return to
  }

  /**
   * Data
   */
  function mergeDataOrFn (
    parentVal,
    childVal,
    vm
  ) {
    if (!vm) {
      // in a Vue.extend merge, both should be functions
      if (!childVal) {
        return parentVal
      }
      if (!parentVal) {
        return childVal
      }
      // when parentVal & childVal are both present,
      // we need to return a function that returns the
      // merged result of both functions... no need to
      // check if parentVal is a function here because
      // it has to be a function to pass previous merges.
      return function mergedDataFn () {
        return mergeData(
          typeof childVal === 'function' ? childVal.call(this, this) : childVal,
          typeof parentVal === 'function' ? parentVal.call(this, this) : parentVal
        )
      }
    } else {
      return function mergedInstanceDataFn () {
        // instance merge
        var instanceData = typeof childVal === 'function'
          ? childVal.call(vm, vm)
          : childVal;
        var defaultData = typeof parentVal === 'function'
          ? parentVal.call(vm, vm)
          : parentVal;
        if (instanceData) {
          return mergeData(instanceData, defaultData)
        } else {
          return defaultData
        }
      }
    }
  }

  strats.data = function (
    parentVal,
    childVal,
    vm
  ) {
    if (!vm) {
      if (childVal && typeof childVal !== 'function') {
         warn(
          'The "data" option should be a function ' +
          'that returns a per-instance value in component ' +
          'definitions.',
          vm
        );

        return parentVal
      }
      return mergeDataOrFn(parentVal, childVal)
    }

    return mergeDataOrFn(parentVal, childVal, vm)
  };

  /**
   * Hooks and props are merged as arrays.
   */
  function mergeHook (
    parentVal,
    childVal
  ) {
    var res = childVal
      ? parentVal
        ? parentVal.concat(childVal)
        : Array.isArray(childVal)
          ? childVal
          : [childVal]
      : parentVal;
    return res
      ? dedupeHooks(res)
      : res
  }

  function dedupeHooks (hooks) {
    var res = [];
    for (var i = 0; i < hooks.length; i++) {
      if (res.indexOf(hooks[i]) === -1) {
        res.push(hooks[i]);
      }
    }
    return res
  }

  LIFECYCLE_HOOKS.forEach(function (hook) {
    strats[hook] = mergeHook;
  });

  /**
   * Assets
   *
   * When a vm is present (instance creation), we need to do
   * a three-way merge between constructor options, instance
   * options and parent options.
   */
  function mergeAssets (
    parentVal,
    childVal,
    vm,
    key
  ) {
    var res = Object.create(parentVal || null);
    if (childVal) {
       assertObjectType(key, childVal, vm);
      return extend(res, childVal)
    } else {
      return res
    }
  }

  ASSET_TYPES.forEach(function (type) {
    strats[type + 's'] = mergeAssets;
  });

  /**
   * Watchers.
   *
   * Watchers hashes should not overwrite one
   * another, so we merge them as arrays.
   */
  strats.watch = function (
    parentVal,
    childVal,
    vm,
    key
  ) {
    // work around Firefox's Object.prototype.watch...
    if (parentVal === nativeWatch) { parentVal = undefined; }
    if (childVal === nativeWatch) { childVal = undefined; }
    /* istanbul ignore if */
    if (!childVal) { return Object.create(parentVal || null) }
    {
      assertObjectType(key, childVal, vm);
    }
    if (!parentVal) { return childVal }
    var ret = {};
    extend(ret, parentVal);
    for (var key$1 in childVal) {
      var parent = ret[key$1];
      var child = childVal[key$1];
      if (parent && !Array.isArray(parent)) {
        parent = [parent];
      }
      ret[key$1] = parent
        ? parent.concat(child)
        : Array.isArray(child) ? child : [child];
    }
    return ret
  };

  /**
   * Other object hashes.
   */
  strats.props =
  strats.methods =
  strats.inject =
  strats.computed = function (
    parentVal,
    childVal,
    vm,
    key
  ) {
    if (childVal && "development" !== 'production') {
      assertObjectType(key, childVal, vm);
    }
    if (!parentVal) { return childVal }
    var ret = Object.create(null);
    extend(ret, parentVal);
    if (childVal) { extend(ret, childVal); }
    return ret
  };
  strats.provide = mergeDataOrFn;

  /**
   * Default strategy.
   */
  var defaultStrat = function (parentVal, childVal) {
    return childVal === undefined
      ? parentVal
      : childVal
  };

  /**
   * Validate component names
   */
  function checkComponents (options) {
    for (var key in options.components) {
      validateComponentName(key);
    }
  }

  function validateComponentName (name) {
    if (!new RegExp(("^[a-zA-Z][\\-\\.0-9_" + (unicodeRegExp.source) + "]*$")).test(name)) {
      warn(
        'Invalid component name: "' + name + '". Component names ' +
        'should conform to valid custom element name in html5 specification.'
      );
    }
    if (isBuiltInTag(name) || config.isReservedTag(name)) {
      warn(
        'Do not use built-in or reserved HTML elements as component ' +
        'id: ' + name
      );
    }
  }

  /**
   * Ensure all props option syntax are normalized into the
   * Object-based format.
   */
  function normalizeProps (options, vm) {
    var props = options.props;
    if (!props) { return }
    var res = {};
    var i, val, name;
    if (Array.isArray(props)) {
      i = props.length;
      while (i--) {
        val = props[i];
        if (typeof val === 'string') {
          name = camelize(val);
          res[name] = { type: null };
        } else {
          warn('props must be strings when using array syntax.');
        }
      }
    } else if (isPlainObject(props)) {
      for (var key in props) {
        val = props[key];
        name = camelize(key);
        res[name] = isPlainObject(val)
          ? val
          : { type: val };
      }
    } else {
      warn(
        "Invalid value for option \"props\": expected an Array or an Object, " +
        "but got " + (toRawType(props)) + ".",
        vm
      );
    }
    options.props = res;
  }

  /**
   * Normalize all injections into Object-based format
   */
  function normalizeInject (options, vm) {
    var inject = options.inject;
    if (!inject) { return }
    var normalized = options.inject = {};
    if (Array.isArray(inject)) {
      for (var i = 0; i < inject.length; i++) {
        normalized[inject[i]] = { from: inject[i] };
      }
    } else if (isPlainObject(inject)) {
      for (var key in inject) {
        var val = inject[key];
        normalized[key] = isPlainObject(val)
          ? extend({ from: key }, val)
          : { from: val };
      }
    } else {
      warn(
        "Invalid value for option \"inject\": expected an Array or an Object, " +
        "but got " + (toRawType(inject)) + ".",
        vm
      );
    }
  }

  /**
   * Normalize raw function directives into object format.
   */
  function normalizeDirectives (options) {
    var dirs = options.directives;
    if (dirs) {
      for (var key in dirs) {
        var def$$1 = dirs[key];
        if (typeof def$$1 === 'function') {
          dirs[key] = { bind: def$$1, update: def$$1 };
        }
      }
    }
  }

  function assertObjectType (name, value, vm) {
    if (!isPlainObject(value)) {
      warn(
        "Invalid value for option \"" + name + "\": expected an Object, " +
        "but got " + (toRawType(value)) + ".",
        vm
      );
    }
  }

  /**
   * Merge two option objects into a new one.
   * Core utility used in both instantiation and inheritance.
   */
  function mergeOptions (
    parent,
    child,
    vm
  ) {
    {
      checkComponents(child);
    }

    if (typeof child === 'function') {
      child = child.options;
    }

    normalizeProps(child, vm);
    normalizeInject(child, vm);
    normalizeDirectives(child);

    // Apply extends and mixins on the child options,
    // but only if it is a raw options object that isn't
    // the result of another mergeOptions call.
    // Only merged options has the _base property.
    if (!child._base) {
      if (child.extends) {
        parent = mergeOptions(parent, child.extends, vm);
      }
      if (child.mixins) {
        for (var i = 0, l = child.mixins.length; i < l; i++) {
          parent = mergeOptions(parent, child.mixins[i], vm);
        }
      }
    }

    var options = {};
    var key;
    for (key in parent) {
      mergeField(key);
    }
    for (key in child) {
      if (!hasOwn(parent, key)) {
        mergeField(key);
      }
    }
    function mergeField (key) {
      var strat = strats[key] || defaultStrat;
      options[key] = strat(parent[key], child[key], vm, key);
    }
    return options
  }

  /**
   * Resolve an asset.
   * This function is used because child instances need access
   * to assets defined in its ancestor chain.
   */
  function resolveAsset (
    options,
    type,
    id,
    warnMissing
  ) {
    /* istanbul ignore if */
    if (typeof id !== 'string') {
      return
    }
    var assets = options[type];
    // check local registration variations first
    if (hasOwn(assets, id)) { return assets[id] }
    var camelizedId = camelize(id);
    if (hasOwn(assets, camelizedId)) { return assets[camelizedId] }
    var PascalCaseId = capitalize(camelizedId);
    if (hasOwn(assets, PascalCaseId)) { return assets[PascalCaseId] }
    // fallback to prototype chain
    var res = assets[id] || assets[camelizedId] || assets[PascalCaseId];
    if ( warnMissing && !res) {
      warn(
        'Failed to resolve ' + type.slice(0, -1) + ': ' + id,
        options
      );
    }
    return res
  }

  /*  */



  function validateProp (
    key,
    propOptions,
    propsData,
    vm
  ) {
    var prop = propOptions[key];
    var absent = !hasOwn(propsData, key);
    var value = propsData[key];
    // boolean casting
    var booleanIndex = getTypeIndex(Boolean, prop.type);
    if (booleanIndex > -1) {
      if (absent && !hasOwn(prop, 'default')) {
        value = false;
      } else if (value === '' || value === hyphenate(key)) {
        // only cast empty string / same name to boolean if
        // boolean has higher priority
        var stringIndex = getTypeIndex(String, prop.type);
        if (stringIndex < 0 || booleanIndex < stringIndex) {
          value = true;
        }
      }
    }
    // check default value
    if (value === undefined) {
      value = getPropDefaultValue(vm, prop, key);
      // since the default value is a fresh copy,
      // make sure to observe it.
      var prevShouldObserve = shouldObserve;
      toggleObserving(true);
      observe(value);
      toggleObserving(prevShouldObserve);
    }
    {
      assertProp(prop, key, value, vm, absent);
    }
    return value
  }

  /**
   * Get the default value of a prop.
   */
  function getPropDefaultValue (vm, prop, key) {
    // no default, return undefined
    if (!hasOwn(prop, 'default')) {
      return undefined
    }
    var def = prop.default;
    // warn against non-factory defaults for Object & Array
    if ( isObject(def)) {
      warn(
        'Invalid default value for prop "' + key + '": ' +
        'Props with type Object/Array must use a factory function ' +
        'to return the default value.',
        vm
      );
    }
    // the raw prop value was also undefined from previous render,
    // return previous default value to avoid unnecessary watcher trigger
    if (vm && vm.$options.propsData &&
      vm.$options.propsData[key] === undefined &&
      vm._props[key] !== undefined
    ) {
      return vm._props[key]
    }
    // call factory function for non-Function types
    // a value is Function if its prototype is function even across different execution context
    return typeof def === 'function' && getType(prop.type) !== 'Function'
      ? def.call(vm)
      : def
  }

  /**
   * Assert whether a prop is valid.
   */
  function assertProp (
    prop,
    name,
    value,
    vm,
    absent
  ) {
    if (prop.required && absent) {
      warn(
        'Missing required prop: "' + name + '"',
        vm
      );
      return
    }
    if (value == null && !prop.required) {
      return
    }
    var type = prop.type;
    var valid = !type || type === true;
    var expectedTypes = [];
    if (type) {
      if (!Array.isArray(type)) {
        type = [type];
      }
      for (var i = 0; i < type.length && !valid; i++) {
        var assertedType = assertType(value, type[i], vm);
        expectedTypes.push(assertedType.expectedType || '');
        valid = assertedType.valid;
      }
    }

    var haveExpectedTypes = expectedTypes.some(function (t) { return t; });
    if (!valid && haveExpectedTypes) {
      warn(
        getInvalidTypeMessage(name, value, expectedTypes),
        vm
      );
      return
    }
    var validator = prop.validator;
    if (validator) {
      if (!validator(value)) {
        warn(
          'Invalid prop: custom validator check failed for prop "' + name + '".',
          vm
        );
      }
    }
  }

  var simpleCheckRE = /^(String|Number|Boolean|Function|Symbol|BigInt)$/;

  function assertType (value, type, vm) {
    var valid;
    var expectedType = getType(type);
    if (simpleCheckRE.test(expectedType)) {
      var t = typeof value;
      valid = t === expectedType.toLowerCase();
      // for primitive wrapper objects
      if (!valid && t === 'object') {
        valid = value instanceof type;
      }
    } else if (expectedType === 'Object') {
      valid = isPlainObject(value);
    } else if (expectedType === 'Array') {
      valid = Array.isArray(value);
    } else {
      try {
        valid = value instanceof type;
      } catch (e) {
        warn('Invalid prop type: "' + String(type) + '" is not a constructor', vm);
        valid = false;
      }
    }
    return {
      valid: valid,
      expectedType: expectedType
    }
  }

  var functionTypeCheckRE = /^\s*function (\w+)/;

  /**
   * Use function string name to check built-in types,
   * because a simple equality check will fail when running
   * across different vms / iframes.
   */
  function getType (fn) {
    var match = fn && fn.toString().match(functionTypeCheckRE);
    return match ? match[1] : ''
  }

  function isSameType (a, b) {
    return getType(a) === getType(b)
  }

  function getTypeIndex (type, expectedTypes) {
    if (!Array.isArray(expectedTypes)) {
      return isSameType(expectedTypes, type) ? 0 : -1
    }
    for (var i = 0, len = expectedTypes.length; i < len; i++) {
      if (isSameType(expectedTypes[i], type)) {
        return i
      }
    }
    return -1
  }

  function getInvalidTypeMessage (name, value, expectedTypes) {
    var message = "Invalid prop: type check failed for prop \"" + name + "\"." +
      " Expected " + (expectedTypes.map(capitalize).join(', '));
    var expectedType = expectedTypes[0];
    var receivedType = toRawType(value);
    // check if we need to specify expected value
    if (
      expectedTypes.length === 1 &&
      isExplicable(expectedType) &&
      isExplicable(typeof value) &&
      !isBoolean(expectedType, receivedType)
    ) {
      message += " with value " + (styleValue(value, expectedType));
    }
    message += ", got " + receivedType + " ";
    // check if we need to specify received value
    if (isExplicable(receivedType)) {
      message += "with value " + (styleValue(value, receivedType)) + ".";
    }
    return message
  }

  function styleValue (value, type) {
    if (type === 'String') {
      return ("\"" + value + "\"")
    } else if (type === 'Number') {
      return ("" + (Number(value)))
    } else {
      return ("" + value)
    }
  }

  var EXPLICABLE_TYPES = ['string', 'number', 'boolean'];
  function isExplicable (value) {
    return EXPLICABLE_TYPES.some(function (elem) { return value.toLowerCase() === elem; })
  }

  function isBoolean () {
    var args = [], len = arguments.length;
    while ( len-- ) args[ len ] = arguments[ len ];

    return args.some(function (elem) { return elem.toLowerCase() === 'boolean'; })
  }

  /*  */

  function handleError (err, vm, info) {
    // Deactivate deps tracking while processing error handler to avoid possible infinite rendering.
    // See: https://github.com/vuejs/vuex/issues/1505
    pushTarget();
    try {
      if (vm) {
        var cur = vm;
        while ((cur = cur.$parent)) {
          var hooks = cur.$options.errorCaptured;
          if (hooks) {
            for (var i = 0; i < hooks.length; i++) {
              try {
                var capture = hooks[i].call(cur, err, vm, info) === false;
                if (capture) { return }
              } catch (e) {
                globalHandleError(e, cur, 'errorCaptured hook');
              }
            }
          }
        }
      }
      globalHandleError(err, vm, info);
    } finally {
      popTarget();
    }
  }

  function invokeWithErrorHandling (
    handler,
    context,
    args,
    vm,
    info
  ) {
    var res;
    try {
      res = args ? handler.apply(context, args) : handler.call(context);
      if (res && !res._isVue && isPromise(res) && !res._handled) {
        res.catch(function (e) { return handleError(e, vm, info + " (Promise/async)"); });
        // issue #9511
        // avoid catch triggering multiple times when nested calls
        res._handled = true;
      }
    } catch (e) {
      handleError(e, vm, info);
    }
    return res
  }

  function globalHandleError (err, vm, info) {
    if (config.errorHandler) {
      try {
        return config.errorHandler.call(null, err, vm, info)
      } catch (e) {
        // if the user intentionally throws the original error in the handler,
        // do not log it twice
        if (e !== err) {
          logError(e, null, 'config.errorHandler');
        }
      }
    }
    logError(err, vm, info);
  }

  function logError (err, vm, info) {
    {
      warn(("Error in " + info + ": \"" + (err.toString()) + "\""), vm);
    }
    /* istanbul ignore else */
    if ((inBrowser || inWeex) && typeof console !== 'undefined') {
      console.error(err);
    } else {
      throw err
    }
  }

  /*  */

  var isUsingMicroTask = false;

  var callbacks = [];
  var pending = false;

  function flushCallbacks () {
    pending = false;
    var copies = callbacks.slice(0);
    callbacks.length = 0;
    for (var i = 0; i < copies.length; i++) {
      copies[i]();
    }
  }

  // Here we have async deferring wrappers using microtasks.
  // In 2.5 we used (macro) tasks (in combination with microtasks).
  // However, it has subtle problems when state is changed right before repaint
  // (e.g. #6813, out-in transitions).
  // Also, using (macro) tasks in event handler would cause some weird behaviors
  // that cannot be circumvented (e.g. #7109, #7153, #7546, #7834, #8109).
  // So we now use microtasks everywhere, again.
  // A major drawback of this tradeoff is that there are some scenarios
  // where microtasks have too high a priority and fire in between supposedly
  // sequential events (e.g. #4521, #6690, which have workarounds)
  // or even between bubbling of the same event (#6566).
  var timerFunc;

  // The nextTick behavior leverages the microtask queue, which can be accessed
  // via either native Promise.then or MutationObserver.
  // MutationObserver has wider support, however it is seriously bugged in
  // UIWebView in iOS >= 9.3.3 when triggered in touch event handlers. It
  // completely stops working after triggering a few times... so, if native
  // Promise is available, we will use it:
  /* istanbul ignore next, $flow-disable-line */
  if (typeof Promise !== 'undefined' && isNative(Promise)) {
    var p = Promise.resolve();
    timerFunc = function () {
      p.then(flushCallbacks);
      // In problematic UIWebViews, Promise.then doesn't completely break, but
      // it can get stuck in a weird state where callbacks are pushed into the
      // microtask queue but the queue isn't being flushed, until the browser
      // needs to do some other work, e.g. handle a timer. Therefore we can
      // "force" the microtask queue to be flushed by adding an empty timer.
      if (isIOS) { setTimeout(noop); }
    };
    isUsingMicroTask = true;
  } else if (!isIE && typeof MutationObserver !== 'undefined' && (
    isNative(MutationObserver) ||
    // PhantomJS and iOS 7.x
    MutationObserver.toString() === '[object MutationObserverConstructor]'
  )) {
    // Use MutationObserver where native Promise is not available,
    // e.g. PhantomJS, iOS7, Android 4.4
    // (#6466 MutationObserver is unreliable in IE11)
    var counter = 1;
    var observer = new MutationObserver(flushCallbacks);
    var textNode = document.createTextNode(String(counter));
    observer.observe(textNode, {
      characterData: true
    });
    timerFunc = function () {
      counter = (counter + 1) % 2;
      textNode.data = String(counter);
    };
    isUsingMicroTask = true;
  } else if (typeof setImmediate !== 'undefined' && isNative(setImmediate)) {
    // Fallback to setImmediate.
    // Technically it leverages the (macro) task queue,
    // but it is still a better choice than setTimeout.
    timerFunc = function () {
      setImmediate(flushCallbacks);
    };
  } else {
    // Fallback to setTimeout.
    timerFunc = function () {
      setTimeout(flushCallbacks, 0);
    };
  }

  function nextTick (cb, ctx) {
    var _resolve;
    callbacks.push(function () {
      if (cb) {
        try {
          cb.call(ctx);
        } catch (e) {
          handleError(e, ctx, 'nextTick');
        }
      } else if (_resolve) {
        _resolve(ctx);
      }
    });
    if (!pending) {
      pending = true;
      timerFunc();
    }
    // $flow-disable-line
    if (!cb && typeof Promise !== 'undefined') {
      return new Promise(function (resolve) {
        _resolve = resolve;
      })
    }
  }

  /*  */

  /* not type checking this file because flow doesn't play well with Proxy */

  var initProxy;

  {
    var allowedGlobals = makeMap(
      'Infinity,undefined,NaN,isFinite,isNaN,' +
      'parseFloat,parseInt,decodeURI,decodeURIComponent,encodeURI,encodeURIComponent,' +
      'Math,Number,Date,Array,Object,Boolean,String,RegExp,Map,Set,JSON,Intl,BigInt,' +
      'require' // for Webpack/Browserify
    );

    var warnNonPresent = function (target, key) {
      warn(
        "Property or method \"" + key + "\" is not defined on the instance but " +
        'referenced during render. Make sure that this property is reactive, ' +
        'either in the data option, or for class-based components, by ' +
        'initializing the property. ' +
        'See: https://vuejs.org/v2/guide/reactivity.html#Declaring-Reactive-Properties.',
        target
      );
    };

    var warnReservedPrefix = function (target, key) {
      warn(
        "Property \"" + key + "\" must be accessed with \"$data." + key + "\" because " +
        'properties starting with "$" or "_" are not proxied in the Vue instance to ' +
        'prevent conflicts with Vue internals. ' +
        'See: https://vuejs.org/v2/api/#data',
        target
      );
    };

    var hasProxy =
      typeof Proxy !== 'undefined' && isNative(Proxy);

    if (hasProxy) {
      var isBuiltInModifier = makeMap('stop,prevent,self,ctrl,shift,alt,meta,exact');
      config.keyCodes = new Proxy(config.keyCodes, {
        set: function set (target, key, value) {
          if (isBuiltInModifier(key)) {
            warn(("Avoid overwriting built-in modifier in config.keyCodes: ." + key));
            return false
          } else {
            target[key] = value;
            return true
          }
        }
      });
    }

    var hasHandler = {
      has: function has (target, key) {
        var has = key in target;
        var isAllowed = allowedGlobals(key) ||
          (typeof key === 'string' && key.charAt(0) === '_' && !(key in target.$data));
        if (!has && !isAllowed) {
          if (key in target.$data) { warnReservedPrefix(target, key); }
          else { warnNonPresent(target, key); }
        }
        return has || !isAllowed
      }
    };

    var getHandler = {
      get: function get (target, key) {
        if (typeof key === 'string' && !(key in target)) {
          if (key in target.$data) { warnReservedPrefix(target, key); }
          else { warnNonPresent(target, key); }
        }
        return target[key]
      }
    };

    initProxy = function initProxy (vm) {
      if (hasProxy) {
        // determine which proxy handler to use
        var options = vm.$options;
        var handlers = options.render && options.render._withStripped
          ? getHandler
          : hasHandler;
        vm._renderProxy = new Proxy(vm, handlers);
      } else {
        vm._renderProxy = vm;
      }
    };
  }

  /*  */

  var seenObjects = new _Set();

  /**
   * Recursively traverse an object to evoke all converted
   * getters, so that every nested property inside the object
   * is collected as a "deep" dependency.
   */
  function traverse (val) {
    _traverse(val, seenObjects);
    seenObjects.clear();
  }

  function _traverse (val, seen) {
    var i, keys;
    var isA = Array.isArray(val);
    if ((!isA && !isObject(val)) || Object.isFrozen(val) || val instanceof VNode) {
      return
    }
    if (val.__ob__) {
      var depId = val.__ob__.dep.id;
      if (seen.has(depId)) {
        return
      }
      seen.add(depId);
    }
    if (isA) {
      i = val.length;
      while (i--) { _traverse(val[i], seen); }
    } else {
      keys = Object.keys(val);
      i = keys.length;
      while (i--) { _traverse(val[keys[i]], seen); }
    }
  }

  var mark;
  var measure;

  {
    var perf = inBrowser && window.performance;
    /* istanbul ignore if */
    if (
      perf &&
      perf.mark &&
      perf.measure &&
      perf.clearMarks &&
      perf.clearMeasures
    ) {
      mark = function (tag) { return perf.mark(tag); };
      measure = function (name, startTag, endTag) {
        perf.measure(name, startTag, endTag);
        perf.clearMarks(startTag);
        perf.clearMarks(endTag);
        // perf.clearMeasures(name)
      };
    }
  }

  /*  */

  var normalizeEvent = cached(function (name) {
    var passive = name.charAt(0) === '&';
    name = passive ? name.slice(1) : name;
    var once$$1 = name.charAt(0) === '~'; // Prefixed last, checked first
    name = once$$1 ? name.slice(1) : name;
    var capture = name.charAt(0) === '!';
    name = capture ? name.slice(1) : name;
    return {
      name: name,
      once: once$$1,
      capture: capture,
      passive: passive
    }
  });

  function createFnInvoker (fns, vm) {
    function invoker () {
      var arguments$1 = arguments;

      var fns = invoker.fns;
      if (Array.isArray(fns)) {
        var cloned = fns.slice();
        for (var i = 0; i < cloned.length; i++) {
          invokeWithErrorHandling(cloned[i], null, arguments$1, vm, "v-on handler");
        }
      } else {
        // return handler return value for single handlers
        return invokeWithErrorHandling(fns, null, arguments, vm, "v-on handler")
      }
    }
    invoker.fns = fns;
    return invoker
  }

  function updateListeners (
    on,
    oldOn,
    add,
    remove$$1,
    createOnceHandler,
    vm
  ) {
    var name, def$$1, cur, old, event;
    for (name in on) {
      def$$1 = cur = on[name];
      old = oldOn[name];
      event = normalizeEvent(name);
      if (isUndef(cur)) {
         warn(
          "Invalid handler for event \"" + (event.name) + "\": got " + String(cur),
          vm
        );
      } else if (isUndef(old)) {
        if (isUndef(cur.fns)) {
          cur = on[name] = createFnInvoker(cur, vm);
        }
        if (isTrue(event.once)) {
          cur = on[name] = createOnceHandler(event.name, cur, event.capture);
        }
        add(event.name, cur, event.capture, event.passive, event.params);
      } else if (cur !== old) {
        old.fns = cur;
        on[name] = old;
      }
    }
    for (name in oldOn) {
      if (isUndef(on[name])) {
        event = normalizeEvent(name);
        remove$$1(event.name, oldOn[name], event.capture);
      }
    }
  }

  /*  */

  function mergeVNodeHook (def, hookKey, hook) {
    if (def instanceof VNode) {
      def = def.data.hook || (def.data.hook = {});
    }
    var invoker;
    var oldHook = def[hookKey];

    function wrappedHook () {
      hook.apply(this, arguments);
      // important: remove merged hook to ensure it's called only once
      // and prevent memory leak
      remove(invoker.fns, wrappedHook);
    }

    if (isUndef(oldHook)) {
      // no existing hook
      invoker = createFnInvoker([wrappedHook]);
    } else {
      /* istanbul ignore if */
      if (isDef(oldHook.fns) && isTrue(oldHook.merged)) {
        // already a merged invoker
        invoker = oldHook;
        invoker.fns.push(wrappedHook);
      } else {
        // existing plain hook
        invoker = createFnInvoker([oldHook, wrappedHook]);
      }
    }

    invoker.merged = true;
    def[hookKey] = invoker;
  }

  /*  */

  function extractPropsFromVNodeData (
    data,
    Ctor,
    tag
  ) {
    // we are only extracting raw values here.
    // validation and default values are handled in the child
    // component itself.
    var propOptions = Ctor.options.props;
    if (isUndef(propOptions)) {
      return
    }
    var res = {};
    var attrs = data.attrs;
    var props = data.props;
    if (isDef(attrs) || isDef(props)) {
      for (var key in propOptions) {
        var altKey = hyphenate(key);
        {
          var keyInLowerCase = key.toLowerCase();
          if (
            key !== keyInLowerCase &&
            attrs && hasOwn(attrs, keyInLowerCase)
          ) {
            tip(
              "Prop \"" + keyInLowerCase + "\" is passed to component " +
              (formatComponentName(tag || Ctor)) + ", but the declared prop name is" +
              " \"" + key + "\". " +
              "Note that HTML attributes are case-insensitive and camelCased " +
              "props need to use their kebab-case equivalents when using in-DOM " +
              "templates. You should probably use \"" + altKey + "\" instead of \"" + key + "\"."
            );
          }
        }
        checkProp(res, props, key, altKey, true) ||
        checkProp(res, attrs, key, altKey, false);
      }
    }
    return res
  }

  function checkProp (
    res,
    hash,
    key,
    altKey,
    preserve
  ) {
    if (isDef(hash)) {
      if (hasOwn(hash, key)) {
        res[key] = hash[key];
        if (!preserve) {
          delete hash[key];
        }
        return true
      } else if (hasOwn(hash, altKey)) {
        res[key] = hash[altKey];
        if (!preserve) {
          delete hash[altKey];
        }
        return true
      }
    }
    return false
  }

  /*  */

  // The template compiler attempts to minimize the need for normalization by
  // statically analyzing the template at compile time.
  //
  // For plain HTML markup, normalization can be completely skipped because the
  // generated render function is guaranteed to return Array<VNode>. There are
  // two cases where extra normalization is needed:

  // 1. When the children contains components - because a functional component
  // may return an Array instead of a single root. In this case, just a simple
  // normalization is needed - if any child is an Array, we flatten the whole
  // thing with Array.prototype.concat. It is guaranteed to be only 1-level deep
  // because functional components already normalize their own children.
  function simpleNormalizeChildren (children) {
    for (var i = 0; i < children.length; i++) {
      if (Array.isArray(children[i])) {
        return Array.prototype.concat.apply([], children)
      }
    }
    return children
  }

  // 2. When the children contains constructs that always generated nested Arrays,
  // e.g. <template>, <slot>, v-for, or when the children is provided by user
  // with hand-written render functions / JSX. In such cases a full normalization
  // is needed to cater to all possible types of children values.
  function normalizeChildren (children) {
    return isPrimitive(children)
      ? [createTextVNode(children)]
      : Array.isArray(children)
        ? normalizeArrayChildren(children)
        : undefined
  }

  function isTextNode (node) {
    return isDef(node) && isDef(node.text) && isFalse(node.isComment)
  }

  function normalizeArrayChildren (children, nestedIndex) {
    var res = [];
    var i, c, lastIndex, last;
    for (i = 0; i < children.length; i++) {
      c = children[i];
      if (isUndef(c) || typeof c === 'boolean') { continue }
      lastIndex = res.length - 1;
      last = res[lastIndex];
      //  nested
      if (Array.isArray(c)) {
        if (c.length > 0) {
          c = normalizeArrayChildren(c, ((nestedIndex || '') + "_" + i));
          // merge adjacent text nodes
          if (isTextNode(c[0]) && isTextNode(last)) {
            res[lastIndex] = createTextVNode(last.text + (c[0]).text);
            c.shift();
          }
          res.push.apply(res, c);
        }
      } else if (isPrimitive(c)) {
        if (isTextNode(last)) {
          // merge adjacent text nodes
          // this is necessary for SSR hydration because text nodes are
          // essentially merged when rendered to HTML strings
          res[lastIndex] = createTextVNode(last.text + c);
        } else if (c !== '') {
          // convert primitive to vnode
          res.push(createTextVNode(c));
        }
      } else {
        if (isTextNode(c) && isTextNode(last)) {
          // merge adjacent text nodes
          res[lastIndex] = createTextVNode(last.text + c.text);
        } else {
          // default key for nested array children (likely generated by v-for)
          if (isTrue(children._isVList) &&
            isDef(c.tag) &&
            isUndef(c.key) &&
            isDef(nestedIndex)) {
            c.key = "__vlist" + nestedIndex + "_" + i + "__";
          }
          res.push(c);
        }
      }
    }
    return res
  }

  /*  */

  function initProvide (vm) {
    var provide = vm.$options.provide;
    if (provide) {
      vm._provided = typeof provide === 'function'
        ? provide.call(vm)
        : provide;
    }
  }

  function initInjections (vm) {
    var result = resolveInject(vm.$options.inject, vm);
    if (result) {
      toggleObserving(false);
      Object.keys(result).forEach(function (key) {
        /* istanbul ignore else */
        {
          defineReactive$$1(vm, key, result[key], function () {
            warn(
              "Avoid mutating an injected value directly since the changes will be " +
              "overwritten whenever the provided component re-renders. " +
              "injection being mutated: \"" + key + "\"",
              vm
            );
          });
        }
      });
      toggleObserving(true);
    }
  }

  function resolveInject (inject, vm) {
    if (inject) {
      // inject is :any because flow is not smart enough to figure out cached
      var result = Object.create(null);
      var keys = hasSymbol
        ? Reflect.ownKeys(inject)
        : Object.keys(inject);

      for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        // #6574 in case the inject object is observed...
        if (key === '__ob__') { continue }
        var provideKey = inject[key].from;
        var source = vm;
        while (source) {
          if (source._provided && hasOwn(source._provided, provideKey)) {
            result[key] = source._provided[provideKey];
            break
          }
          source = source.$parent;
        }
        if (!source) {
          if ('default' in inject[key]) {
            var provideDefault = inject[key].default;
            result[key] = typeof provideDefault === 'function'
              ? provideDefault.call(vm)
              : provideDefault;
          } else {
            warn(("Injection \"" + key + "\" not found"), vm);
          }
        }
      }
      return result
    }
  }

  /*  */



  /**
   * Runtime helper for resolving raw children VNodes into a slot object.
   */
  function resolveSlots (
    children,
    context
  ) {
    if (!children || !children.length) {
      return {}
    }
    var slots = {};
    for (var i = 0, l = children.length; i < l; i++) {
      var child = children[i];
      var data = child.data;
      // remove slot attribute if the node is resolved as a Vue slot node
      if (data && data.attrs && data.attrs.slot) {
        delete data.attrs.slot;
      }
      // named slots should only be respected if the vnode was rendered in the
      // same context.
      if ((child.context === context || child.fnContext === context) &&
        data && data.slot != null
      ) {
        var name = data.slot;
        var slot = (slots[name] || (slots[name] = []));
        if (child.tag === 'template') {
          slot.push.apply(slot, child.children || []);
        } else {
          slot.push(child);
        }
      } else {
        (slots.default || (slots.default = [])).push(child);
      }
    }
    // ignore slots that contains only whitespace
    for (var name$1 in slots) {
      if (slots[name$1].every(isWhitespace)) {
        delete slots[name$1];
      }
    }
    return slots
  }

  function isWhitespace (node) {
    return (node.isComment && !node.asyncFactory) || node.text === ' '
  }

  /*  */

  function isAsyncPlaceholder (node) {
    return node.isComment && node.asyncFactory
  }

  /*  */

  function normalizeScopedSlots (
    slots,
    normalSlots,
    prevSlots
  ) {
    var res;
    var hasNormalSlots = Object.keys(normalSlots).length > 0;
    var isStable = slots ? !!slots.$stable : !hasNormalSlots;
    var key = slots && slots.$key;
    if (!slots) {
      res = {};
    } else if (slots._normalized) {
      // fast path 1: child component re-render only, parent did not change
      return slots._normalized
    } else if (
      isStable &&
      prevSlots &&
      prevSlots !== emptyObject &&
      key === prevSlots.$key &&
      !hasNormalSlots &&
      !prevSlots.$hasNormal
    ) {
      // fast path 2: stable scoped slots w/ no normal slots to proxy,
      // only need to normalize once
      return prevSlots
    } else {
      res = {};
      for (var key$1 in slots) {
        if (slots[key$1] && key$1[0] !== '$') {
          res[key$1] = normalizeScopedSlot(normalSlots, key$1, slots[key$1]);
        }
      }
    }
    // expose normal slots on scopedSlots
    for (var key$2 in normalSlots) {
      if (!(key$2 in res)) {
        res[key$2] = proxyNormalSlot(normalSlots, key$2);
      }
    }
    // avoriaz seems to mock a non-extensible $scopedSlots object
    // and when that is passed down this would cause an error
    if (slots && Object.isExtensible(slots)) {
      (slots)._normalized = res;
    }
    def(res, '$stable', isStable);
    def(res, '$key', key);
    def(res, '$hasNormal', hasNormalSlots);
    return res
  }

  function normalizeScopedSlot(normalSlots, key, fn) {
    var normalized = function () {
      var res = arguments.length ? fn.apply(null, arguments) : fn({});
      res = res && typeof res === 'object' && !Array.isArray(res)
        ? [res] // single vnode
        : normalizeChildren(res);
      var vnode = res && res[0];
      return res && (
        !vnode ||
        (res.length === 1 && vnode.isComment && !isAsyncPlaceholder(vnode)) // #9658, #10391
      ) ? undefined
        : res
    };
    // this is a slot using the new v-slot syntax without scope. although it is
    // compiled as a scoped slot, render fn users would expect it to be present
    // on this.$slots because the usage is semantically a normal slot.
    if (fn.proxy) {
      Object.defineProperty(normalSlots, key, {
        get: normalized,
        enumerable: true,
        configurable: true
      });
    }
    return normalized
  }

  function proxyNormalSlot(slots, key) {
    return function () { return slots[key]; }
  }

  /*  */

  /**
   * Runtime helper for rendering v-for lists.
   */
  function renderList (
    val,
    render
  ) {
    var ret, i, l, keys, key;
    if (Array.isArray(val) || typeof val === 'string') {
      ret = new Array(val.length);
      for (i = 0, l = val.length; i < l; i++) {
        ret[i] = render(val[i], i);
      }
    } else if (typeof val === 'number') {
      ret = new Array(val);
      for (i = 0; i < val; i++) {
        ret[i] = render(i + 1, i);
      }
    } else if (isObject(val)) {
      if (hasSymbol && val[Symbol.iterator]) {
        ret = [];
        var iterator = val[Symbol.iterator]();
        var result = iterator.next();
        while (!result.done) {
          ret.push(render(result.value, ret.length));
          result = iterator.next();
        }
      } else {
        keys = Object.keys(val);
        ret = new Array(keys.length);
        for (i = 0, l = keys.length; i < l; i++) {
          key = keys[i];
          ret[i] = render(val[key], key, i);
        }
      }
    }
    if (!isDef(ret)) {
      ret = [];
    }
    (ret)._isVList = true;
    return ret
  }

  /*  */

  /**
   * Runtime helper for rendering <slot>
   */
  function renderSlot (
    name,
    fallbackRender,
    props,
    bindObject
  ) {
    var scopedSlotFn = this.$scopedSlots[name];
    var nodes;
    if (scopedSlotFn) {
      // scoped slot
      props = props || {};
      if (bindObject) {
        if ( !isObject(bindObject)) {
          warn('slot v-bind without argument expects an Object', this);
        }
        props = extend(extend({}, bindObject), props);
      }
      nodes =
        scopedSlotFn(props) ||
        (typeof fallbackRender === 'function' ? fallbackRender() : fallbackRender);
    } else {
      nodes =
        this.$slots[name] ||
        (typeof fallbackRender === 'function' ? fallbackRender() : fallbackRender);
    }

    var target = props && props.slot;
    if (target) {
      return this.$createElement('template', { slot: target }, nodes)
    } else {
      return nodes
    }
  }

  /*  */

  /**
   * Runtime helper for resolving filters
   */
  function resolveFilter (id) {
    return resolveAsset(this.$options, 'filters', id, true) || identity
  }

  /*  */

  function isKeyNotMatch (expect, actual) {
    if (Array.isArray(expect)) {
      return expect.indexOf(actual) === -1
    } else {
      return expect !== actual
    }
  }

  /**
   * Runtime helper for checking keyCodes from config.
   * exposed as Vue.prototype._k
   * passing in eventKeyName as last argument separately for backwards compat
   */
  function checkKeyCodes (
    eventKeyCode,
    key,
    builtInKeyCode,
    eventKeyName,
    builtInKeyName
  ) {
    var mappedKeyCode = config.keyCodes[key] || builtInKeyCode;
    if (builtInKeyName && eventKeyName && !config.keyCodes[key]) {
      return isKeyNotMatch(builtInKeyName, eventKeyName)
    } else if (mappedKeyCode) {
      return isKeyNotMatch(mappedKeyCode, eventKeyCode)
    } else if (eventKeyName) {
      return hyphenate(eventKeyName) !== key
    }
    return eventKeyCode === undefined
  }

  /*  */

  /**
   * Runtime helper for merging v-bind="object" into a VNode's data.
   */
  function bindObjectProps (
    data,
    tag,
    value,
    asProp,
    isSync
  ) {
    if (value) {
      if (!isObject(value)) {
         warn(
          'v-bind without argument expects an Object or Array value',
          this
        );
      } else {
        if (Array.isArray(value)) {
          value = toObject(value);
        }
        var hash;
        var loop = function ( key ) {
          if (
            key === 'class' ||
            key === 'style' ||
            isReservedAttribute(key)
          ) {
            hash = data;
          } else {
            var type = data.attrs && data.attrs.type;
            hash = asProp || config.mustUseProp(tag, type, key)
              ? data.domProps || (data.domProps = {})
              : data.attrs || (data.attrs = {});
          }
          var camelizedKey = camelize(key);
          var hyphenatedKey = hyphenate(key);
          if (!(camelizedKey in hash) && !(hyphenatedKey in hash)) {
            hash[key] = value[key];

            if (isSync) {
              var on = data.on || (data.on = {});
              on[("update:" + key)] = function ($event) {
                value[key] = $event;
              };
            }
          }
        };

        for (var key in value) loop( key );
      }
    }
    return data
  }

  /*  */

  /**
   * Runtime helper for rendering static trees.
   */
  function renderStatic (
    index,
    isInFor
  ) {
    var cached = this._staticTrees || (this._staticTrees = []);
    var tree = cached[index];
    // if has already-rendered static tree and not inside v-for,
    // we can reuse the same tree.
    if (tree && !isInFor) {
      return tree
    }
    // otherwise, render a fresh tree.
    tree = cached[index] = this.$options.staticRenderFns[index].call(
      this._renderProxy,
      null,
      this // for render fns generated for functional component templates
    );
    markStatic(tree, ("__static__" + index), false);
    return tree
  }

  /**
   * Runtime helper for v-once.
   * Effectively it means marking the node as static with a unique key.
   */
  function markOnce (
    tree,
    index,
    key
  ) {
    markStatic(tree, ("__once__" + index + (key ? ("_" + key) : "")), true);
    return tree
  }

  function markStatic (
    tree,
    key,
    isOnce
  ) {
    if (Array.isArray(tree)) {
      for (var i = 0; i < tree.length; i++) {
        if (tree[i] && typeof tree[i] !== 'string') {
          markStaticNode(tree[i], (key + "_" + i), isOnce);
        }
      }
    } else {
      markStaticNode(tree, key, isOnce);
    }
  }

  function markStaticNode (node, key, isOnce) {
    node.isStatic = true;
    node.key = key;
    node.isOnce = isOnce;
  }

  /*  */

  function bindObjectListeners (data, value) {
    if (value) {
      if (!isPlainObject(value)) {
         warn(
          'v-on without argument expects an Object value',
          this
        );
      } else {
        var on = data.on = data.on ? extend({}, data.on) : {};
        for (var key in value) {
          var existing = on[key];
          var ours = value[key];
          on[key] = existing ? [].concat(existing, ours) : ours;
        }
      }
    }
    return data
  }

  /*  */

  function resolveScopedSlots (
    fns, // see flow/vnode
    res,
    // the following are added in 2.6
    hasDynamicKeys,
    contentHashKey
  ) {
    res = res || { $stable: !hasDynamicKeys };
    for (var i = 0; i < fns.length; i++) {
      var slot = fns[i];
      if (Array.isArray(slot)) {
        resolveScopedSlots(slot, res, hasDynamicKeys);
      } else if (slot) {
        // marker for reverse proxying v-slot without scope on this.$slots
        if (slot.proxy) {
          slot.fn.proxy = true;
        }
        res[slot.key] = slot.fn;
      }
    }
    if (contentHashKey) {
      (res).$key = contentHashKey;
    }
    return res
  }

  /*  */

  function bindDynamicKeys (baseObj, values) {
    for (var i = 0; i < values.length; i += 2) {
      var key = values[i];
      if (typeof key === 'string' && key) {
        baseObj[values[i]] = values[i + 1];
      } else if ( key !== '' && key !== null) {
        // null is a special value for explicitly removing a binding
        warn(
          ("Invalid value for dynamic directive argument (expected string or null): " + key),
          this
        );
      }
    }
    return baseObj
  }

  // helper to dynamically append modifier runtime markers to event names.
  // ensure only append when value is already string, otherwise it will be cast
  // to string and cause the type check to miss.
  function prependModifier (value, symbol) {
    return typeof value === 'string' ? symbol + value : value
  }

  /*  */

  function installRenderHelpers (target) {
    target._o = markOnce;
    target._n = toNumber;
    target._s = toString;
    target._l = renderList;
    target._t = renderSlot;
    target._q = looseEqual;
    target._i = looseIndexOf;
    target._m = renderStatic;
    target._f = resolveFilter;
    target._k = checkKeyCodes;
    target._b = bindObjectProps;
    target._v = createTextVNode;
    target._e = createEmptyVNode;
    target._u = resolveScopedSlots;
    target._g = bindObjectListeners;
    target._d = bindDynamicKeys;
    target._p = prependModifier;
  }

  /*  */

  function FunctionalRenderContext (
    data,
    props,
    children,
    parent,
    Ctor
  ) {
    var this$1 = this;

    var options = Ctor.options;
    // ensure the createElement function in functional components
    // gets a unique context - this is necessary for correct named slot check
    var contextVm;
    if (hasOwn(parent, '_uid')) {
      contextVm = Object.create(parent);
      // $flow-disable-line
      contextVm._original = parent;
    } else {
      // the context vm passed in is a functional context as well.
      // in this case we want to make sure we are able to get a hold to the
      // real context instance.
      contextVm = parent;
      // $flow-disable-line
      parent = parent._original;
    }
    var isCompiled = isTrue(options._compiled);
    var needNormalization = !isCompiled;

    this.data = data;
    this.props = props;
    this.children = children;
    this.parent = parent;
    this.listeners = data.on || emptyObject;
    this.injections = resolveInject(options.inject, parent);
    this.slots = function () {
      if (!this$1.$slots) {
        normalizeScopedSlots(
          data.scopedSlots,
          this$1.$slots = resolveSlots(children, parent)
        );
      }
      return this$1.$slots
    };

    Object.defineProperty(this, 'scopedSlots', ({
      enumerable: true,
      get: function get () {
        return normalizeScopedSlots(data.scopedSlots, this.slots())
      }
    }));

    // support for compiled functional template
    if (isCompiled) {
      // exposing $options for renderStatic()
      this.$options = options;
      // pre-resolve slots for renderSlot()
      this.$slots = this.slots();
      this.$scopedSlots = normalizeScopedSlots(data.scopedSlots, this.$slots);
    }

    if (options._scopeId) {
      this._c = function (a, b, c, d) {
        var vnode = createElement(contextVm, a, b, c, d, needNormalization);
        if (vnode && !Array.isArray(vnode)) {
          vnode.fnScopeId = options._scopeId;
          vnode.fnContext = parent;
        }
        return vnode
      };
    } else {
      this._c = function (a, b, c, d) { return createElement(contextVm, a, b, c, d, needNormalization); };
    }
  }

  installRenderHelpers(FunctionalRenderContext.prototype);

  function createFunctionalComponent (
    Ctor,
    propsData,
    data,
    contextVm,
    children
  ) {
    var options = Ctor.options;
    var props = {};
    var propOptions = options.props;
    if (isDef(propOptions)) {
      for (var key in propOptions) {
        props[key] = validateProp(key, propOptions, propsData || emptyObject);
      }
    } else {
      if (isDef(data.attrs)) { mergeProps(props, data.attrs); }
      if (isDef(data.props)) { mergeProps(props, data.props); }
    }

    var renderContext = new FunctionalRenderContext(
      data,
      props,
      children,
      contextVm,
      Ctor
    );

    var vnode = options.render.call(null, renderContext._c, renderContext);

    if (vnode instanceof VNode) {
      return cloneAndMarkFunctionalResult(vnode, data, renderContext.parent, options, renderContext)
    } else if (Array.isArray(vnode)) {
      var vnodes = normalizeChildren(vnode) || [];
      var res = new Array(vnodes.length);
      for (var i = 0; i < vnodes.length; i++) {
        res[i] = cloneAndMarkFunctionalResult(vnodes[i], data, renderContext.parent, options, renderContext);
      }
      return res
    }
  }

  function cloneAndMarkFunctionalResult (vnode, data, contextVm, options, renderContext) {
    // #7817 clone node before setting fnContext, otherwise if the node is reused
    // (e.g. it was from a cached normal slot) the fnContext causes named slots
    // that should not be matched to match.
    var clone = cloneVNode(vnode);
    clone.fnContext = contextVm;
    clone.fnOptions = options;
    {
      (clone.devtoolsMeta = clone.devtoolsMeta || {}).renderContext = renderContext;
    }
    if (data.slot) {
      (clone.data || (clone.data = {})).slot = data.slot;
    }
    return clone
  }

  function mergeProps (to, from) {
    for (var key in from) {
      to[camelize(key)] = from[key];
    }
  }

  /*  */

  /*  */

  /*  */

  /*  */

  // inline hooks to be invoked on component VNodes during patch
  var componentVNodeHooks = {
    init: function init (vnode, hydrating) {
      if (
        vnode.componentInstance &&
        !vnode.componentInstance._isDestroyed &&
        vnode.data.keepAlive
      ) {
        // kept-alive components, treat as a patch
        var mountedNode = vnode; // work around flow
        componentVNodeHooks.prepatch(mountedNode, mountedNode);
      } else {
        var child = vnode.componentInstance = createComponentInstanceForVnode(
          vnode,
          activeInstance
        );
        child.$mount(hydrating ? vnode.elm : undefined, hydrating);
      }
    },

    prepatch: function prepatch (oldVnode, vnode) {
      var options = vnode.componentOptions;
      var child = vnode.componentInstance = oldVnode.componentInstance;
      updateChildComponent(
        child,
        options.propsData, // updated props
        options.listeners, // updated listeners
        vnode, // new parent vnode
        options.children // new children
      );
    },

    insert: function insert (vnode) {
      var context = vnode.context;
      var componentInstance = vnode.componentInstance;
      if (!componentInstance._isMounted) {
        componentInstance._isMounted = true;
        callHook(componentInstance, 'mounted');
      }
      if (vnode.data.keepAlive) {
        if (context._isMounted) {
          // vue-router#1212
          // During updates, a kept-alive component's child components may
          // change, so directly walking the tree here may call activated hooks
          // on incorrect children. Instead we push them into a queue which will
          // be processed after the whole patch process ended.
          queueActivatedComponent(componentInstance);
        } else {
          activateChildComponent(componentInstance, true /* direct */);
        }
      }
    },

    destroy: function destroy (vnode) {
      var componentInstance = vnode.componentInstance;
      if (!componentInstance._isDestroyed) {
        if (!vnode.data.keepAlive) {
          componentInstance.$destroy();
        } else {
          deactivateChildComponent(componentInstance, true /* direct */);
        }
      }
    }
  };

  var hooksToMerge = Object.keys(componentVNodeHooks);

  function createComponent (
    Ctor,
    data,
    context,
    children,
    tag
  ) {
    if (isUndef(Ctor)) {
      return
    }

    var baseCtor = context.$options._base;

    // plain options object: turn it into a constructor
    if (isObject(Ctor)) {
      Ctor = baseCtor.extend(Ctor);
    }

    // if at this stage it's not a constructor or an async component factory,
    // reject.
    if (typeof Ctor !== 'function') {
      {
        warn(("Invalid Component definition: " + (String(Ctor))), context);
      }
      return
    }

    // async component
    var asyncFactory;
    if (isUndef(Ctor.cid)) {
      asyncFactory = Ctor;
      Ctor = resolveAsyncComponent(asyncFactory, baseCtor);
      if (Ctor === undefined) {
        // return a placeholder node for async component, which is rendered
        // as a comment node but preserves all the raw information for the node.
        // the information will be used for async server-rendering and hydration.
        return createAsyncPlaceholder(
          asyncFactory,
          data,
          context,
          children,
          tag
        )
      }
    }

    data = data || {};

    // resolve constructor options in case global mixins are applied after
    // component constructor creation
    resolveConstructorOptions(Ctor);

    // transform component v-model data into props & events
    if (isDef(data.model)) {
      transformModel(Ctor.options, data);
    }

    // extract props
    var propsData = extractPropsFromVNodeData(data, Ctor, tag);

    // functional component
    if (isTrue(Ctor.options.functional)) {
      return createFunctionalComponent(Ctor, propsData, data, context, children)
    }

    // extract listeners, since these needs to be treated as
    // child component listeners instead of DOM listeners
    var listeners = data.on;
    // replace with listeners with .native modifier
    // so it gets processed during parent component patch.
    data.on = data.nativeOn;

    if (isTrue(Ctor.options.abstract)) {
      // abstract components do not keep anything
      // other than props & listeners & slot

      // work around flow
      var slot = data.slot;
      data = {};
      if (slot) {
        data.slot = slot;
      }
    }

    // install component management hooks onto the placeholder node
    installComponentHooks(data);

    // return a placeholder vnode
    var name = Ctor.options.name || tag;
    var vnode = new VNode(
      ("vue-component-" + (Ctor.cid) + (name ? ("-" + name) : '')),
      data, undefined, undefined, undefined, context,
      { Ctor: Ctor, propsData: propsData, listeners: listeners, tag: tag, children: children },
      asyncFactory
    );

    return vnode
  }

  function createComponentInstanceForVnode (
    // we know it's MountedComponentVNode but flow doesn't
    vnode,
    // activeInstance in lifecycle state
    parent
  ) {
    var options = {
      _isComponent: true,
      _parentVnode: vnode,
      parent: parent
    };
    // check inline-template render functions
    var inlineTemplate = vnode.data.inlineTemplate;
    if (isDef(inlineTemplate)) {
      options.render = inlineTemplate.render;
      options.staticRenderFns = inlineTemplate.staticRenderFns;
    }
    return new vnode.componentOptions.Ctor(options)
  }

  function installComponentHooks (data) {
    var hooks = data.hook || (data.hook = {});
    for (var i = 0; i < hooksToMerge.length; i++) {
      var key = hooksToMerge[i];
      var existing = hooks[key];
      var toMerge = componentVNodeHooks[key];
      if (existing !== toMerge && !(existing && existing._merged)) {
        hooks[key] = existing ? mergeHook$1(toMerge, existing) : toMerge;
      }
    }
  }

  function mergeHook$1 (f1, f2) {
    var merged = function (a, b) {
      // flow complains about extra args which is why we use any
      f1(a, b);
      f2(a, b);
    };
    merged._merged = true;
    return merged
  }

  // transform component v-model info (value and callback) into
  // prop and event handler respectively.
  function transformModel (options, data) {
    var prop = (options.model && options.model.prop) || 'value';
    var event = (options.model && options.model.event) || 'input'
    ;(data.attrs || (data.attrs = {}))[prop] = data.model.value;
    var on = data.on || (data.on = {});
    var existing = on[event];
    var callback = data.model.callback;
    if (isDef(existing)) {
      if (
        Array.isArray(existing)
          ? existing.indexOf(callback) === -1
          : existing !== callback
      ) {
        on[event] = [callback].concat(existing);
      }
    } else {
      on[event] = callback;
    }
  }

  /*  */

  var SIMPLE_NORMALIZE = 1;
  var ALWAYS_NORMALIZE = 2;

  // wrapper function for providing a more flexible interface
  // without getting yelled at by flow
  function createElement (
    context,
    tag,
    data,
    children,
    normalizationType,
    alwaysNormalize
  ) {
    if (Array.isArray(data) || isPrimitive(data)) {
      normalizationType = children;
      children = data;
      data = undefined;
    }
    if (isTrue(alwaysNormalize)) {
      normalizationType = ALWAYS_NORMALIZE;
    }
    return _createElement(context, tag, data, children, normalizationType)
  }

  function _createElement (
    context,
    tag,
    data,
    children,
    normalizationType
  ) {
    if (isDef(data) && isDef((data).__ob__)) {
       warn(
        "Avoid using observed data object as vnode data: " + (JSON.stringify(data)) + "\n" +
        'Always create fresh vnode data objects in each render!',
        context
      );
      return createEmptyVNode()
    }
    // object syntax in v-bind
    if (isDef(data) && isDef(data.is)) {
      tag = data.is;
    }
    if (!tag) {
      // in case of component :is set to falsy value
      return createEmptyVNode()
    }
    // warn against non-primitive key
    if (
      isDef(data) && isDef(data.key) && !isPrimitive(data.key)
    ) {
      {
        warn(
          'Avoid using non-primitive value as key, ' +
          'use string/number value instead.',
          context
        );
      }
    }
    // support single function children as default scoped slot
    if (Array.isArray(children) &&
      typeof children[0] === 'function'
    ) {
      data = data || {};
      data.scopedSlots = { default: children[0] };
      children.length = 0;
    }
    if (normalizationType === ALWAYS_NORMALIZE) {
      children = normalizeChildren(children);
    } else if (normalizationType === SIMPLE_NORMALIZE) {
      children = simpleNormalizeChildren(children);
    }
    var vnode, ns;
    if (typeof tag === 'string') {
      var Ctor;
      ns = (context.$vnode && context.$vnode.ns) || config.getTagNamespace(tag);
      if (config.isReservedTag(tag)) {
        // platform built-in elements
        if ( isDef(data) && isDef(data.nativeOn) && data.tag !== 'component') {
          warn(
            ("The .native modifier for v-on is only valid on components but it was used on <" + tag + ">."),
            context
          );
        }
        vnode = new VNode(
          config.parsePlatformTagName(tag), data, children,
          undefined, undefined, context
        );
      } else if ((!data || !data.pre) && isDef(Ctor = resolveAsset(context.$options, 'components', tag))) {
        // component
        vnode = createComponent(Ctor, data, context, children, tag);
      } else {
        // unknown or unlisted namespaced elements
        // check at runtime because it may get assigned a namespace when its
        // parent normalizes children
        vnode = new VNode(
          tag, data, children,
          undefined, undefined, context
        );
      }
    } else {
      // direct component options / constructor
      vnode = createComponent(tag, data, context, children);
    }
    if (Array.isArray(vnode)) {
      return vnode
    } else if (isDef(vnode)) {
      if (isDef(ns)) { applyNS(vnode, ns); }
      if (isDef(data)) { registerDeepBindings(data); }
      return vnode
    } else {
      return createEmptyVNode()
    }
  }

  function applyNS (vnode, ns, force) {
    vnode.ns = ns;
    if (vnode.tag === 'foreignObject') {
      // use default namespace inside foreignObject
      ns = undefined;
      force = true;
    }
    if (isDef(vnode.children)) {
      for (var i = 0, l = vnode.children.length; i < l; i++) {
        var child = vnode.children[i];
        if (isDef(child.tag) && (
          isUndef(child.ns) || (isTrue(force) && child.tag !== 'svg'))) {
          applyNS(child, ns, force);
        }
      }
    }
  }

  // ref #5318
  // necessary to ensure parent re-render when deep bindings like :style and
  // :class are used on slot nodes
  function registerDeepBindings (data) {
    if (isObject(data.style)) {
      traverse(data.style);
    }
    if (isObject(data.class)) {
      traverse(data.class);
    }
  }

  /*  */

  function initRender (vm) {
    vm._vnode = null; // the root of the child tree
    vm._staticTrees = null; // v-once cached trees
    var options = vm.$options;
    var parentVnode = vm.$vnode = options._parentVnode; // the placeholder node in parent tree
    var renderContext = parentVnode && parentVnode.context;
    vm.$slots = resolveSlots(options._renderChildren, renderContext);
    vm.$scopedSlots = emptyObject;
    // bind the createElement fn to this instance
    // so that we get proper render context inside it.
    // args order: tag, data, children, normalizationType, alwaysNormalize
    // internal version is used by render functions compiled from templates
    vm._c = function (a, b, c, d) { return createElement(vm, a, b, c, d, false); };
    // normalization is always applied for the public version, used in
    // user-written render functions.
    vm.$createElement = function (a, b, c, d) { return createElement(vm, a, b, c, d, true); };

    // $attrs & $listeners are exposed for easier HOC creation.
    // they need to be reactive so that HOCs using them are always updated
    var parentData = parentVnode && parentVnode.data;

    /* istanbul ignore else */
    {
      defineReactive$$1(vm, '$attrs', parentData && parentData.attrs || emptyObject, function () {
        !isUpdatingChildComponent && warn("$attrs is readonly.", vm);
      }, true);
      defineReactive$$1(vm, '$listeners', options._parentListeners || emptyObject, function () {
        !isUpdatingChildComponent && warn("$listeners is readonly.", vm);
      }, true);
    }
  }

  var currentRenderingInstance = null;

  function renderMixin (Vue) {
    // install runtime convenience helpers
    installRenderHelpers(Vue.prototype);

    Vue.prototype.$nextTick = function (fn) {
      return nextTick(fn, this)
    };

    Vue.prototype._render = function () {
      var vm = this;
      var ref = vm.$options;
      var render = ref.render;
      var _parentVnode = ref._parentVnode;

      if (_parentVnode) {
        vm.$scopedSlots = normalizeScopedSlots(
          _parentVnode.data.scopedSlots,
          vm.$slots,
          vm.$scopedSlots
        );
      }

      // set parent vnode. this allows render functions to have access
      // to the data on the placeholder node.
      vm.$vnode = _parentVnode;
      // render self
      var vnode;
      try {
        // There's no need to maintain a stack because all render fns are called
        // separately from one another. Nested component's render fns are called
        // when parent component is patched.
        currentRenderingInstance = vm;
        vnode = render.call(vm._renderProxy, vm.$createElement);
      } catch (e) {
        handleError(e, vm, "render");
        // return error render result,
        // or previous vnode to prevent render error causing blank component
        /* istanbul ignore else */
        if ( vm.$options.renderError) {
          try {
            vnode = vm.$options.renderError.call(vm._renderProxy, vm.$createElement, e);
          } catch (e) {
            handleError(e, vm, "renderError");
            vnode = vm._vnode;
          }
        } else {
          vnode = vm._vnode;
        }
      } finally {
        currentRenderingInstance = null;
      }
      // if the returned array contains only a single node, allow it
      if (Array.isArray(vnode) && vnode.length === 1) {
        vnode = vnode[0];
      }
      // return empty vnode in case the render function errored out
      if (!(vnode instanceof VNode)) {
        if ( Array.isArray(vnode)) {
          warn(
            'Multiple root nodes returned from render function. Render function ' +
            'should return a single root node.',
            vm
          );
        }
        vnode = createEmptyVNode();
      }
      // set parent
      vnode.parent = _parentVnode;
      return vnode
    };
  }

  /*  */

  function ensureCtor (comp, base) {
    if (
      comp.__esModule ||
      (hasSymbol && comp[Symbol.toStringTag] === 'Module')
    ) {
      comp = comp.default;
    }
    return isObject(comp)
      ? base.extend(comp)
      : comp
  }

  function createAsyncPlaceholder (
    factory,
    data,
    context,
    children,
    tag
  ) {
    var node = createEmptyVNode();
    node.asyncFactory = factory;
    node.asyncMeta = { data: data, context: context, children: children, tag: tag };
    return node
  }

  function resolveAsyncComponent (
    factory,
    baseCtor
  ) {
    if (isTrue(factory.error) && isDef(factory.errorComp)) {
      return factory.errorComp
    }

    if (isDef(factory.resolved)) {
      return factory.resolved
    }

    var owner = currentRenderingInstance;
    if (owner && isDef(factory.owners) && factory.owners.indexOf(owner) === -1) {
      // already pending
      factory.owners.push(owner);
    }

    if (isTrue(factory.loading) && isDef(factory.loadingComp)) {
      return factory.loadingComp
    }

    if (owner && !isDef(factory.owners)) {
      var owners = factory.owners = [owner];
      var sync = true;
      var timerLoading = null;
      var timerTimeout = null

      ;(owner).$on('hook:destroyed', function () { return remove(owners, owner); });

      var forceRender = function (renderCompleted) {
        for (var i = 0, l = owners.length; i < l; i++) {
          (owners[i]).$forceUpdate();
        }

        if (renderCompleted) {
          owners.length = 0;
          if (timerLoading !== null) {
            clearTimeout(timerLoading);
            timerLoading = null;
          }
          if (timerTimeout !== null) {
            clearTimeout(timerTimeout);
            timerTimeout = null;
          }
        }
      };

      var resolve = once(function (res) {
        // cache resolved
        factory.resolved = ensureCtor(res, baseCtor);
        // invoke callbacks only if this is not a synchronous resolve
        // (async resolves are shimmed as synchronous during SSR)
        if (!sync) {
          forceRender(true);
        } else {
          owners.length = 0;
        }
      });

      var reject = once(function (reason) {
         warn(
          "Failed to resolve async component: " + (String(factory)) +
          (reason ? ("\nReason: " + reason) : '')
        );
        if (isDef(factory.errorComp)) {
          factory.error = true;
          forceRender(true);
        }
      });

      var res = factory(resolve, reject);

      if (isObject(res)) {
        if (isPromise(res)) {
          // () => Promise
          if (isUndef(factory.resolved)) {
            res.then(resolve, reject);
          }
        } else if (isPromise(res.component)) {
          res.component.then(resolve, reject);

          if (isDef(res.error)) {
            factory.errorComp = ensureCtor(res.error, baseCtor);
          }

          if (isDef(res.loading)) {
            factory.loadingComp = ensureCtor(res.loading, baseCtor);
            if (res.delay === 0) {
              factory.loading = true;
            } else {
              timerLoading = setTimeout(function () {
                timerLoading = null;
                if (isUndef(factory.resolved) && isUndef(factory.error)) {
                  factory.loading = true;
                  forceRender(false);
                }
              }, res.delay || 200);
            }
          }

          if (isDef(res.timeout)) {
            timerTimeout = setTimeout(function () {
              timerTimeout = null;
              if (isUndef(factory.resolved)) {
                reject(
                   ("timeout (" + (res.timeout) + "ms)")
                    
                );
              }
            }, res.timeout);
          }
        }
      }

      sync = false;
      // return in case resolved synchronously
      return factory.loading
        ? factory.loadingComp
        : factory.resolved
    }
  }

  /*  */

  function getFirstComponentChild (children) {
    if (Array.isArray(children)) {
      for (var i = 0; i < children.length; i++) {
        var c = children[i];
        if (isDef(c) && (isDef(c.componentOptions) || isAsyncPlaceholder(c))) {
          return c
        }
      }
    }
  }

  /*  */

  /*  */

  function initEvents (vm) {
    vm._events = Object.create(null);
    vm._hasHookEvent = false;
    // init parent attached events
    var listeners = vm.$options._parentListeners;
    if (listeners) {
      updateComponentListeners(vm, listeners);
    }
  }

  var target;

  function add (event, fn) {
    target.$on(event, fn);
  }

  function remove$1 (event, fn) {
    target.$off(event, fn);
  }

  function createOnceHandler (event, fn) {
    var _target = target;
    return function onceHandler () {
      var res = fn.apply(null, arguments);
      if (res !== null) {
        _target.$off(event, onceHandler);
      }
    }
  }

  function updateComponentListeners (
    vm,
    listeners,
    oldListeners
  ) {
    target = vm;
    updateListeners(listeners, oldListeners || {}, add, remove$1, createOnceHandler, vm);
    target = undefined;
  }

  function eventsMixin (Vue) {
    var hookRE = /^hook:/;
    Vue.prototype.$on = function (event, fn) {
      var vm = this;
      if (Array.isArray(event)) {
        for (var i = 0, l = event.length; i < l; i++) {
          vm.$on(event[i], fn);
        }
      } else {
        (vm._events[event] || (vm._events[event] = [])).push(fn);
        // optimize hook:event cost by using a boolean flag marked at registration
        // instead of a hash lookup
        if (hookRE.test(event)) {
          vm._hasHookEvent = true;
        }
      }
      return vm
    };

    Vue.prototype.$once = function (event, fn) {
      var vm = this;
      function on () {
        vm.$off(event, on);
        fn.apply(vm, arguments);
      }
      on.fn = fn;
      vm.$on(event, on);
      return vm
    };

    Vue.prototype.$off = function (event, fn) {
      var vm = this;
      // all
      if (!arguments.length) {
        vm._events = Object.create(null);
        return vm
      }
      // array of events
      if (Array.isArray(event)) {
        for (var i$1 = 0, l = event.length; i$1 < l; i$1++) {
          vm.$off(event[i$1], fn);
        }
        return vm
      }
      // specific event
      var cbs = vm._events[event];
      if (!cbs) {
        return vm
      }
      if (!fn) {
        vm._events[event] = null;
        return vm
      }
      // specific handler
      var cb;
      var i = cbs.length;
      while (i--) {
        cb = cbs[i];
        if (cb === fn || cb.fn === fn) {
          cbs.splice(i, 1);
          break
        }
      }
      return vm
    };

    Vue.prototype.$emit = function (event) {
      var vm = this;
      {
        var lowerCaseEvent = event.toLowerCase();
        if (lowerCaseEvent !== event && vm._events[lowerCaseEvent]) {
          tip(
            "Event \"" + lowerCaseEvent + "\" is emitted in component " +
            (formatComponentName(vm)) + " but the handler is registered for \"" + event + "\". " +
            "Note that HTML attributes are case-insensitive and you cannot use " +
            "v-on to listen to camelCase events when using in-DOM templates. " +
            "You should probably use \"" + (hyphenate(event)) + "\" instead of \"" + event + "\"."
          );
        }
      }
      var cbs = vm._events[event];
      if (cbs) {
        cbs = cbs.length > 1 ? toArray(cbs) : cbs;
        var args = toArray(arguments, 1);
        var info = "event handler for \"" + event + "\"";
        for (var i = 0, l = cbs.length; i < l; i++) {
          invokeWithErrorHandling(cbs[i], vm, args, vm, info);
        }
      }
      return vm
    };
  }

  /*  */

  var activeInstance = null;
  var isUpdatingChildComponent = false;

  function setActiveInstance(vm) {
    var prevActiveInstance = activeInstance;
    activeInstance = vm;
    return function () {
      activeInstance = prevActiveInstance;
    }
  }

  function initLifecycle (vm) {
    var options = vm.$options;

    // locate first non-abstract parent
    var parent = options.parent;
    if (parent && !options.abstract) {
      while (parent.$options.abstract && parent.$parent) {
        parent = parent.$parent;
      }
      parent.$children.push(vm);
    }

    vm.$parent = parent;
    vm.$root = parent ? parent.$root : vm;

    vm.$children = [];
    vm.$refs = {};

    vm._watcher = null;
    vm._inactive = null;
    vm._directInactive = false;
    vm._isMounted = false;
    vm._isDestroyed = false;
    vm._isBeingDestroyed = false;
  }

  function lifecycleMixin (Vue) {
    Vue.prototype._update = function (vnode, hydrating) {
      var vm = this;
      var prevEl = vm.$el;
      var prevVnode = vm._vnode;
      var restoreActiveInstance = setActiveInstance(vm);
      vm._vnode = vnode;
      // Vue.prototype.__patch__ is injected in entry points
      // based on the rendering backend used.
      if (!prevVnode) {
        // initial render
        vm.$el = vm.__patch__(vm.$el, vnode, hydrating, false /* removeOnly */);
      } else {
        // updates
        vm.$el = vm.__patch__(prevVnode, vnode);
      }
      restoreActiveInstance();
      // update __vue__ reference
      if (prevEl) {
        prevEl.__vue__ = null;
      }
      if (vm.$el) {
        vm.$el.__vue__ = vm;
      }
      // if parent is an HOC, update its $el as well
      if (vm.$vnode && vm.$parent && vm.$vnode === vm.$parent._vnode) {
        vm.$parent.$el = vm.$el;
      }
      // updated hook is called by the scheduler to ensure that children are
      // updated in a parent's updated hook.
    };

    Vue.prototype.$forceUpdate = function () {
      var vm = this;
      if (vm._watcher) {
        vm._watcher.update();
      }
    };

    Vue.prototype.$destroy = function () {
      var vm = this;
      if (vm._isBeingDestroyed) {
        return
      }
      callHook(vm, 'beforeDestroy');
      vm._isBeingDestroyed = true;
      // remove self from parent
      var parent = vm.$parent;
      if (parent && !parent._isBeingDestroyed && !vm.$options.abstract) {
        remove(parent.$children, vm);
      }
      // teardown watchers
      if (vm._watcher) {
        vm._watcher.teardown();
      }
      var i = vm._watchers.length;
      while (i--) {
        vm._watchers[i].teardown();
      }
      // remove reference from data ob
      // frozen object may not have observer.
      if (vm._data.__ob__) {
        vm._data.__ob__.vmCount--;
      }
      // call the last hook...
      vm._isDestroyed = true;
      // invoke destroy hooks on current rendered tree
      vm.__patch__(vm._vnode, null);
      // fire destroyed hook
      callHook(vm, 'destroyed');
      // turn off all instance listeners.
      vm.$off();
      // remove __vue__ reference
      if (vm.$el) {
        vm.$el.__vue__ = null;
      }
      // release circular reference (#6759)
      if (vm.$vnode) {
        vm.$vnode.parent = null;
      }
    };
  }

  function mountComponent (
    vm,
    el,
    hydrating
  ) {
    vm.$el = el;
    if (!vm.$options.render) {
      vm.$options.render = createEmptyVNode;
      {
        /* istanbul ignore if */
        if ((vm.$options.template && vm.$options.template.charAt(0) !== '#') ||
          vm.$options.el || el) {
          warn(
            'You are using the runtime-only build of Vue where the template ' +
            'compiler is not available. Either pre-compile the templates into ' +
            'render functions, or use the compiler-included build.',
            vm
          );
        } else {
          warn(
            'Failed to mount component: template or render function not defined.',
            vm
          );
        }
      }
    }
    callHook(vm, 'beforeMount');

    var updateComponent;
    /* istanbul ignore if */
    if ( config.performance && mark) {
      updateComponent = function () {
        var name = vm._name;
        var id = vm._uid;
        var startTag = "vue-perf-start:" + id;
        var endTag = "vue-perf-end:" + id;

        mark(startTag);
        var vnode = vm._render();
        mark(endTag);
        measure(("vue " + name + " render"), startTag, endTag);

        mark(startTag);
        vm._update(vnode, hydrating);
        mark(endTag);
        measure(("vue " + name + " patch"), startTag, endTag);
      };
    } else {
      updateComponent = function () {
        vm._update(vm._render(), hydrating);
      };
    }

    // we set this to vm._watcher inside the watcher's constructor
    // since the watcher's initial patch may call $forceUpdate (e.g. inside child
    // component's mounted hook), which relies on vm._watcher being already defined
    new Watcher(vm, updateComponent, noop, {
      before: function before () {
        if (vm._isMounted && !vm._isDestroyed) {
          callHook(vm, 'beforeUpdate');
        }
      }
    }, true /* isRenderWatcher */);
    hydrating = false;

    // manually mounted instance, call mounted on self
    // mounted is called for render-created child components in its inserted hook
    if (vm.$vnode == null) {
      vm._isMounted = true;
      callHook(vm, 'mounted');
    }
    return vm
  }

  function updateChildComponent (
    vm,
    propsData,
    listeners,
    parentVnode,
    renderChildren
  ) {
    {
      isUpdatingChildComponent = true;
    }

    // determine whether component has slot children
    // we need to do this before overwriting $options._renderChildren.

    // check if there are dynamic scopedSlots (hand-written or compiled but with
    // dynamic slot names). Static scoped slots compiled from template has the
    // "$stable" marker.
    var newScopedSlots = parentVnode.data.scopedSlots;
    var oldScopedSlots = vm.$scopedSlots;
    var hasDynamicScopedSlot = !!(
      (newScopedSlots && !newScopedSlots.$stable) ||
      (oldScopedSlots !== emptyObject && !oldScopedSlots.$stable) ||
      (newScopedSlots && vm.$scopedSlots.$key !== newScopedSlots.$key) ||
      (!newScopedSlots && vm.$scopedSlots.$key)
    );

    // Any static slot children from the parent may have changed during parent's
    // update. Dynamic scoped slots may also have changed. In such cases, a forced
    // update is necessary to ensure correctness.
    var needsForceUpdate = !!(
      renderChildren ||               // has new static slots
      vm.$options._renderChildren ||  // has old static slots
      hasDynamicScopedSlot
    );

    vm.$options._parentVnode = parentVnode;
    vm.$vnode = parentVnode; // update vm's placeholder node without re-render

    if (vm._vnode) { // update child tree's parent
      vm._vnode.parent = parentVnode;
    }
    vm.$options._renderChildren = renderChildren;

    // update $attrs and $listeners hash
    // these are also reactive so they may trigger child update if the child
    // used them during render
    vm.$attrs = parentVnode.data.attrs || emptyObject;
    vm.$listeners = listeners || emptyObject;

    // update props
    if (propsData && vm.$options.props) {
      toggleObserving(false);
      var props = vm._props;
      var propKeys = vm.$options._propKeys || [];
      for (var i = 0; i < propKeys.length; i++) {
        var key = propKeys[i];
        var propOptions = vm.$options.props; // wtf flow?
        props[key] = validateProp(key, propOptions, propsData, vm);
      }
      toggleObserving(true);
      // keep a copy of raw propsData
      vm.$options.propsData = propsData;
    }

    // update listeners
    listeners = listeners || emptyObject;
    var oldListeners = vm.$options._parentListeners;
    vm.$options._parentListeners = listeners;
    updateComponentListeners(vm, listeners, oldListeners);

    // resolve slots + force update if has children
    if (needsForceUpdate) {
      vm.$slots = resolveSlots(renderChildren, parentVnode.context);
      vm.$forceUpdate();
    }

    {
      isUpdatingChildComponent = false;
    }
  }

  function isInInactiveTree (vm) {
    while (vm && (vm = vm.$parent)) {
      if (vm._inactive) { return true }
    }
    return false
  }

  function activateChildComponent (vm, direct) {
    if (direct) {
      vm._directInactive = false;
      if (isInInactiveTree(vm)) {
        return
      }
    } else if (vm._directInactive) {
      return
    }
    if (vm._inactive || vm._inactive === null) {
      vm._inactive = false;
      for (var i = 0; i < vm.$children.length; i++) {
        activateChildComponent(vm.$children[i]);
      }
      callHook(vm, 'activated');
    }
  }

  function deactivateChildComponent (vm, direct) {
    if (direct) {
      vm._directInactive = true;
      if (isInInactiveTree(vm)) {
        return
      }
    }
    if (!vm._inactive) {
      vm._inactive = true;
      for (var i = 0; i < vm.$children.length; i++) {
        deactivateChildComponent(vm.$children[i]);
      }
      callHook(vm, 'deactivated');
    }
  }

  function callHook (vm, hook) {
    // #7573 disable dep collection when invoking lifecycle hooks
    pushTarget();
    var handlers = vm.$options[hook];
    var info = hook + " hook";
    if (handlers) {
      for (var i = 0, j = handlers.length; i < j; i++) {
        invokeWithErrorHandling(handlers[i], vm, null, vm, info);
      }
    }
    if (vm._hasHookEvent) {
      vm.$emit('hook:' + hook);
    }
    popTarget();
  }

  /*  */

  var MAX_UPDATE_COUNT = 100;

  var queue = [];
  var activatedChildren = [];
  var has = {};
  var circular = {};
  var waiting = false;
  var flushing = false;
  var index = 0;

  /**
   * Reset the scheduler's state.
   */
  function resetSchedulerState () {
    index = queue.length = activatedChildren.length = 0;
    has = {};
    {
      circular = {};
    }
    waiting = flushing = false;
  }

  // Async edge case #6566 requires saving the timestamp when event listeners are
  // attached. However, calling performance.now() has a perf overhead especially
  // if the page has thousands of event listeners. Instead, we take a timestamp
  // every time the scheduler flushes and use that for all event listeners
  // attached during that flush.
  var currentFlushTimestamp = 0;

  // Async edge case fix requires storing an event listener's attach timestamp.
  var getNow = Date.now;

  // Determine what event timestamp the browser is using. Annoyingly, the
  // timestamp can either be hi-res (relative to page load) or low-res
  // (relative to UNIX epoch), so in order to compare time we have to use the
  // same timestamp type when saving the flush timestamp.
  // All IE versions use low-res event timestamps, and have problematic clock
  // implementations (#9632)
  if (inBrowser && !isIE) {
    var performance = window.performance;
    if (
      performance &&
      typeof performance.now === 'function' &&
      getNow() > document.createEvent('Event').timeStamp
    ) {
      // if the event timestamp, although evaluated AFTER the Date.now(), is
      // smaller than it, it means the event is using a hi-res timestamp,
      // and we need to use the hi-res version for event listener timestamps as
      // well.
      getNow = function () { return performance.now(); };
    }
  }

  /**
   * Flush both queues and run the watchers.
   */
  function flushSchedulerQueue () {
    currentFlushTimestamp = getNow();
    flushing = true;
    var watcher, id;

    // Sort queue before flush.
    // This ensures that:
    // 1. Components are updated from parent to child. (because parent is always
    //    created before the child)
    // 2. A component's user watchers are run before its render watcher (because
    //    user watchers are created before the render watcher)
    // 3. If a component is destroyed during a parent component's watcher run,
    //    its watchers can be skipped.
    queue.sort(function (a, b) { return a.id - b.id; });

    // do not cache length because more watchers might be pushed
    // as we run existing watchers
    for (index = 0; index < queue.length; index++) {
      watcher = queue[index];
      if (watcher.before) {
        watcher.before();
      }
      id = watcher.id;
      has[id] = null;
      watcher.run();
      // in dev build, check and stop circular updates.
      if ( has[id] != null) {
        circular[id] = (circular[id] || 0) + 1;
        if (circular[id] > MAX_UPDATE_COUNT) {
          warn(
            'You may have an infinite update loop ' + (
              watcher.user
                ? ("in watcher with expression \"" + (watcher.expression) + "\"")
                : "in a component render function."
            ),
            watcher.vm
          );
          break
        }
      }
    }

    // keep copies of post queues before resetting state
    var activatedQueue = activatedChildren.slice();
    var updatedQueue = queue.slice();

    resetSchedulerState();

    // call component updated and activated hooks
    callActivatedHooks(activatedQueue);
    callUpdatedHooks(updatedQueue);

    // devtool hook
    /* istanbul ignore if */
    if (devtools && config.devtools) {
      devtools.emit('flush');
    }
  }

  function callUpdatedHooks (queue) {
    var i = queue.length;
    while (i--) {
      var watcher = queue[i];
      var vm = watcher.vm;
      if (vm._watcher === watcher && vm._isMounted && !vm._isDestroyed) {
        callHook(vm, 'updated');
      }
    }
  }

  /**
   * Queue a kept-alive component that was activated during patch.
   * The queue will be processed after the entire tree has been patched.
   */
  function queueActivatedComponent (vm) {
    // setting _inactive to false here so that a render function can
    // rely on checking whether it's in an inactive tree (e.g. router-view)
    vm._inactive = false;
    activatedChildren.push(vm);
  }

  function callActivatedHooks (queue) {
    for (var i = 0; i < queue.length; i++) {
      queue[i]._inactive = true;
      activateChildComponent(queue[i], true /* true */);
    }
  }

  /**
   * Push a watcher into the watcher queue.
   * Jobs with duplicate IDs will be skipped unless it's
   * pushed when the queue is being flushed.
   */
  function queueWatcher (watcher) {
    var id = watcher.id;
    if (has[id] == null) {
      has[id] = true;
      if (!flushing) {
        queue.push(watcher);
      } else {
        // if already flushing, splice the watcher based on its id
        // if already past its id, it will be run next immediately.
        var i = queue.length - 1;
        while (i > index && queue[i].id > watcher.id) {
          i--;
        }
        queue.splice(i + 1, 0, watcher);
      }
      // queue the flush
      if (!waiting) {
        waiting = true;

        if ( !config.async) {
          flushSchedulerQueue();
          return
        }
        nextTick(flushSchedulerQueue);
      }
    }
  }

  /*  */



  var uid$2 = 0;

  /**
   * A watcher parses an expression, collects dependencies,
   * and fires callback when the expression value changes.
   * This is used for both the $watch() api and directives.
   */
  var Watcher = function Watcher (
    vm,
    expOrFn,
    cb,
    options,
    isRenderWatcher
  ) {
    this.vm = vm;
    if (isRenderWatcher) {
      vm._watcher = this;
    }
    vm._watchers.push(this);
    // options
    if (options) {
      this.deep = !!options.deep;
      this.user = !!options.user;
      this.lazy = !!options.lazy;
      this.sync = !!options.sync;
      this.before = options.before;
    } else {
      this.deep = this.user = this.lazy = this.sync = false;
    }
    this.cb = cb;
    this.id = ++uid$2; // uid for batching
    this.active = true;
    this.dirty = this.lazy; // for lazy watchers
    this.deps = [];
    this.newDeps = [];
    this.depIds = new _Set();
    this.newDepIds = new _Set();
    this.expression =  expOrFn.toString()
      ;
    // parse expression for getter
    if (typeof expOrFn === 'function') {
      this.getter = expOrFn;
    } else {
      this.getter = parsePath(expOrFn);
      if (!this.getter) {
        this.getter = noop;
         warn(
          "Failed watching path: \"" + expOrFn + "\" " +
          'Watcher only accepts simple dot-delimited paths. ' +
          'For full control, use a function instead.',
          vm
        );
      }
    }
    this.value = this.lazy
      ? undefined
      : this.get();
  };

  /**
   * Evaluate the getter, and re-collect dependencies.
   */
  Watcher.prototype.get = function get () {
    pushTarget(this);
    var value;
    var vm = this.vm;
    try {
      value = this.getter.call(vm, vm);
    } catch (e) {
      if (this.user) {
        handleError(e, vm, ("getter for watcher \"" + (this.expression) + "\""));
      } else {
        throw e
      }
    } finally {
      // "touch" every property so they are all tracked as
      // dependencies for deep watching
      if (this.deep) {
        traverse(value);
      }
      popTarget();
      this.cleanupDeps();
    }
    return value
  };

  /**
   * Add a dependency to this directive.
   */
  Watcher.prototype.addDep = function addDep (dep) {
    var id = dep.id;
    if (!this.newDepIds.has(id)) {
      this.newDepIds.add(id);
      this.newDeps.push(dep);
      if (!this.depIds.has(id)) {
        dep.addSub(this);
      }
    }
  };

  /**
   * Clean up for dependency collection.
   */
  Watcher.prototype.cleanupDeps = function cleanupDeps () {
    var i = this.deps.length;
    while (i--) {
      var dep = this.deps[i];
      if (!this.newDepIds.has(dep.id)) {
        dep.removeSub(this);
      }
    }
    var tmp = this.depIds;
    this.depIds = this.newDepIds;
    this.newDepIds = tmp;
    this.newDepIds.clear();
    tmp = this.deps;
    this.deps = this.newDeps;
    this.newDeps = tmp;
    this.newDeps.length = 0;
  };

  /**
   * Subscriber interface.
   * Will be called when a dependency changes.
   */
  Watcher.prototype.update = function update () {
    /* istanbul ignore else */
    if (this.lazy) {
      this.dirty = true;
    } else if (this.sync) {
      this.run();
    } else {
      queueWatcher(this);
    }
  };

  /**
   * Scheduler job interface.
   * Will be called by the scheduler.
   */
  Watcher.prototype.run = function run () {
    if (this.active) {
      var value = this.get();
      if (
        value !== this.value ||
        // Deep watchers and watchers on Object/Arrays should fire even
        // when the value is the same, because the value may
        // have mutated.
        isObject(value) ||
        this.deep
      ) {
        // set new value
        var oldValue = this.value;
        this.value = value;
        if (this.user) {
          var info = "callback for watcher \"" + (this.expression) + "\"";
          invokeWithErrorHandling(this.cb, this.vm, [value, oldValue], this.vm, info);
        } else {
          this.cb.call(this.vm, value, oldValue);
        }
      }
    }
  };

  /**
   * Evaluate the value of the watcher.
   * This only gets called for lazy watchers.
   */
  Watcher.prototype.evaluate = function evaluate () {
    this.value = this.get();
    this.dirty = false;
  };

  /**
   * Depend on all deps collected by this watcher.
   */
  Watcher.prototype.depend = function depend () {
    var i = this.deps.length;
    while (i--) {
      this.deps[i].depend();
    }
  };

  /**
   * Remove self from all dependencies' subscriber list.
   */
  Watcher.prototype.teardown = function teardown () {
    if (this.active) {
      // remove self from vm's watcher list
      // this is a somewhat expensive operation so we skip it
      // if the vm is being destroyed.
      if (!this.vm._isBeingDestroyed) {
        remove(this.vm._watchers, this);
      }
      var i = this.deps.length;
      while (i--) {
        this.deps[i].removeSub(this);
      }
      this.active = false;
    }
  };

  /*  */

  var sharedPropertyDefinition = {
    enumerable: true,
    configurable: true,
    get: noop,
    set: noop
  };

  function proxy (target, sourceKey, key) {
    sharedPropertyDefinition.get = function proxyGetter () {
      return this[sourceKey][key]
    };
    sharedPropertyDefinition.set = function proxySetter (val) {
      this[sourceKey][key] = val;
    };
    Object.defineProperty(target, key, sharedPropertyDefinition);
  }

  function initState (vm) {
    vm._watchers = [];
    var opts = vm.$options;
    if (opts.props) { initProps(vm, opts.props); }
    if (opts.methods) { initMethods(vm, opts.methods); }
    if (opts.data) {
      initData(vm);
    } else {
      observe(vm._data = {}, true /* asRootData */);
    }
    if (opts.computed) { initComputed(vm, opts.computed); }
    if (opts.watch && opts.watch !== nativeWatch) {
      initWatch(vm, opts.watch);
    }
  }

  function initProps (vm, propsOptions) {
    var propsData = vm.$options.propsData || {};
    var props = vm._props = {};
    // cache prop keys so that future props updates can iterate using Array
    // instead of dynamic object key enumeration.
    var keys = vm.$options._propKeys = [];
    var isRoot = !vm.$parent;
    // root instance props should be converted
    if (!isRoot) {
      toggleObserving(false);
    }
    var loop = function ( key ) {
      keys.push(key);
      var value = validateProp(key, propsOptions, propsData, vm);
      /* istanbul ignore else */
      {
        var hyphenatedKey = hyphenate(key);
        if (isReservedAttribute(hyphenatedKey) ||
            config.isReservedAttr(hyphenatedKey)) {
          warn(
            ("\"" + hyphenatedKey + "\" is a reserved attribute and cannot be used as component prop."),
            vm
          );
        }
        defineReactive$$1(props, key, value, function () {
          if (!isRoot && !isUpdatingChildComponent) {
            warn(
              "Avoid mutating a prop directly since the value will be " +
              "overwritten whenever the parent component re-renders. " +
              "Instead, use a data or computed property based on the prop's " +
              "value. Prop being mutated: \"" + key + "\"",
              vm
            );
          }
        });
      }
      // static props are already proxied on the component's prototype
      // during Vue.extend(). We only need to proxy props defined at
      // instantiation here.
      if (!(key in vm)) {
        proxy(vm, "_props", key);
      }
    };

    for (var key in propsOptions) loop( key );
    toggleObserving(true);
  }

  function initData (vm) {
    var data = vm.$options.data;
    data = vm._data = typeof data === 'function'
      ? getData(data, vm)
      : data || {};
    if (!isPlainObject(data)) {
      data = {};
       warn(
        'data functions should return an object:\n' +
        'https://vuejs.org/v2/guide/components.html#data-Must-Be-a-Function',
        vm
      );
    }
    // proxy data on instance
    var keys = Object.keys(data);
    var props = vm.$options.props;
    var methods = vm.$options.methods;
    var i = keys.length;
    while (i--) {
      var key = keys[i];
      {
        if (methods && hasOwn(methods, key)) {
          warn(
            ("Method \"" + key + "\" has already been defined as a data property."),
            vm
          );
        }
      }
      if (props && hasOwn(props, key)) {
         warn(
          "The data property \"" + key + "\" is already declared as a prop. " +
          "Use prop default value instead.",
          vm
        );
      } else if (!isReserved(key)) {
        proxy(vm, "_data", key);
      }
    }
    // observe data
    observe(data, true /* asRootData */);
  }

  function getData (data, vm) {
    // #7573 disable dep collection when invoking data getters
    pushTarget();
    try {
      return data.call(vm, vm)
    } catch (e) {
      handleError(e, vm, "data()");
      return {}
    } finally {
      popTarget();
    }
  }

  var computedWatcherOptions = { lazy: true };

  function initComputed (vm, computed) {
    // $flow-disable-line
    var watchers = vm._computedWatchers = Object.create(null);
    // computed properties are just getters during SSR
    var isSSR = isServerRendering();

    for (var key in computed) {
      var userDef = computed[key];
      var getter = typeof userDef === 'function' ? userDef : userDef.get;
      if ( getter == null) {
        warn(
          ("Getter is missing for computed property \"" + key + "\"."),
          vm
        );
      }

      if (!isSSR) {
        // create internal watcher for the computed property.
        watchers[key] = new Watcher(
          vm,
          getter || noop,
          noop,
          computedWatcherOptions
        );
      }

      // component-defined computed properties are already defined on the
      // component prototype. We only need to define computed properties defined
      // at instantiation here.
      if (!(key in vm)) {
        defineComputed(vm, key, userDef);
      } else {
        if (key in vm.$data) {
          warn(("The computed property \"" + key + "\" is already defined in data."), vm);
        } else if (vm.$options.props && key in vm.$options.props) {
          warn(("The computed property \"" + key + "\" is already defined as a prop."), vm);
        } else if (vm.$options.methods && key in vm.$options.methods) {
          warn(("The computed property \"" + key + "\" is already defined as a method."), vm);
        }
      }
    }
  }

  function defineComputed (
    target,
    key,
    userDef
  ) {
    var shouldCache = !isServerRendering();
    if (typeof userDef === 'function') {
      sharedPropertyDefinition.get = shouldCache
        ? createComputedGetter(key)
        : createGetterInvoker(userDef);
      sharedPropertyDefinition.set = noop;
    } else {
      sharedPropertyDefinition.get = userDef.get
        ? shouldCache && userDef.cache !== false
          ? createComputedGetter(key)
          : createGetterInvoker(userDef.get)
        : noop;
      sharedPropertyDefinition.set = userDef.set || noop;
    }
    if (
        sharedPropertyDefinition.set === noop) {
      sharedPropertyDefinition.set = function () {
        warn(
          ("Computed property \"" + key + "\" was assigned to but it has no setter."),
          this
        );
      };
    }
    Object.defineProperty(target, key, sharedPropertyDefinition);
  }

  function createComputedGetter (key) {
    return function computedGetter () {
      var watcher = this._computedWatchers && this._computedWatchers[key];
      if (watcher) {
        if (watcher.dirty) {
          watcher.evaluate();
        }
        if (Dep.target) {
          watcher.depend();
        }
        return watcher.value
      }
    }
  }

  function createGetterInvoker(fn) {
    return function computedGetter () {
      return fn.call(this, this)
    }
  }

  function initMethods (vm, methods) {
    var props = vm.$options.props;
    for (var key in methods) {
      {
        if (typeof methods[key] !== 'function') {
          warn(
            "Method \"" + key + "\" has type \"" + (typeof methods[key]) + "\" in the component definition. " +
            "Did you reference the function correctly?",
            vm
          );
        }
        if (props && hasOwn(props, key)) {
          warn(
            ("Method \"" + key + "\" has already been defined as a prop."),
            vm
          );
        }
        if ((key in vm) && isReserved(key)) {
          warn(
            "Method \"" + key + "\" conflicts with an existing Vue instance method. " +
            "Avoid defining component methods that start with _ or $."
          );
        }
      }
      vm[key] = typeof methods[key] !== 'function' ? noop : bind(methods[key], vm);
    }
  }

  function initWatch (vm, watch) {
    for (var key in watch) {
      var handler = watch[key];
      if (Array.isArray(handler)) {
        for (var i = 0; i < handler.length; i++) {
          createWatcher(vm, key, handler[i]);
        }
      } else {
        createWatcher(vm, key, handler);
      }
    }
  }

  function createWatcher (
    vm,
    expOrFn,
    handler,
    options
  ) {
    if (isPlainObject(handler)) {
      options = handler;
      handler = handler.handler;
    }
    if (typeof handler === 'string') {
      handler = vm[handler];
    }
    return vm.$watch(expOrFn, handler, options)
  }

  function stateMixin (Vue) {
    // flow somehow has problems with directly declared definition object
    // when using Object.defineProperty, so we have to procedurally build up
    // the object here.
    var dataDef = {};
    dataDef.get = function () { return this._data };
    var propsDef = {};
    propsDef.get = function () { return this._props };
    {
      dataDef.set = function () {
        warn(
          'Avoid replacing instance root $data. ' +
          'Use nested data properties instead.',
          this
        );
      };
      propsDef.set = function () {
        warn("$props is readonly.", this);
      };
    }
    Object.defineProperty(Vue.prototype, '$data', dataDef);
    Object.defineProperty(Vue.prototype, '$props', propsDef);

    Vue.prototype.$set = set;
    Vue.prototype.$delete = del;

    Vue.prototype.$watch = function (
      expOrFn,
      cb,
      options
    ) {
      var vm = this;
      if (isPlainObject(cb)) {
        return createWatcher(vm, expOrFn, cb, options)
      }
      options = options || {};
      options.user = true;
      var watcher = new Watcher(vm, expOrFn, cb, options);
      if (options.immediate) {
        var info = "callback for immediate watcher \"" + (watcher.expression) + "\"";
        pushTarget();
        invokeWithErrorHandling(cb, vm, [watcher.value], vm, info);
        popTarget();
      }
      return function unwatchFn () {
        watcher.teardown();
      }
    };
  }

  /*  */

  var uid$3 = 0;

  function initMixin (Vue) {
    Vue.prototype._init = function (options) {
      var vm = this;
      // a uid
      vm._uid = uid$3++;

      var startTag, endTag;
      /* istanbul ignore if */
      if ( config.performance && mark) {
        startTag = "vue-perf-start:" + (vm._uid);
        endTag = "vue-perf-end:" + (vm._uid);
        mark(startTag);
      }

      // a flag to avoid this being observed
      vm._isVue = true;
      // merge options
      if (options && options._isComponent) {
        // optimize internal component instantiation
        // since dynamic options merging is pretty slow, and none of the
        // internal component options needs special treatment.
        initInternalComponent(vm, options);
      } else {
        vm.$options = mergeOptions(
          resolveConstructorOptions(vm.constructor),
          options || {},
          vm
        );
      }
      /* istanbul ignore else */
      {
        initProxy(vm);
      }
      // expose real self
      vm._self = vm;
      initLifecycle(vm);
      initEvents(vm);
      initRender(vm);
      callHook(vm, 'beforeCreate');
      initInjections(vm); // resolve injections before data/props
      initState(vm);
      initProvide(vm); // resolve provide after data/props
      callHook(vm, 'created');

      /* istanbul ignore if */
      if ( config.performance && mark) {
        vm._name = formatComponentName(vm, false);
        mark(endTag);
        measure(("vue " + (vm._name) + " init"), startTag, endTag);
      }

      if (vm.$options.el) {
        vm.$mount(vm.$options.el);
      }
    };
  }

  function initInternalComponent (vm, options) {
    var opts = vm.$options = Object.create(vm.constructor.options);
    // doing this because it's faster than dynamic enumeration.
    var parentVnode = options._parentVnode;
    opts.parent = options.parent;
    opts._parentVnode = parentVnode;

    var vnodeComponentOptions = parentVnode.componentOptions;
    opts.propsData = vnodeComponentOptions.propsData;
    opts._parentListeners = vnodeComponentOptions.listeners;
    opts._renderChildren = vnodeComponentOptions.children;
    opts._componentTag = vnodeComponentOptions.tag;

    if (options.render) {
      opts.render = options.render;
      opts.staticRenderFns = options.staticRenderFns;
    }
  }

  function resolveConstructorOptions (Ctor) {
    var options = Ctor.options;
    if (Ctor.super) {
      var superOptions = resolveConstructorOptions(Ctor.super);
      var cachedSuperOptions = Ctor.superOptions;
      if (superOptions !== cachedSuperOptions) {
        // super option changed,
        // need to resolve new options.
        Ctor.superOptions = superOptions;
        // check if there are any late-modified/attached options (#4976)
        var modifiedOptions = resolveModifiedOptions(Ctor);
        // update base extend options
        if (modifiedOptions) {
          extend(Ctor.extendOptions, modifiedOptions);
        }
        options = Ctor.options = mergeOptions(superOptions, Ctor.extendOptions);
        if (options.name) {
          options.components[options.name] = Ctor;
        }
      }
    }
    return options
  }

  function resolveModifiedOptions (Ctor) {
    var modified;
    var latest = Ctor.options;
    var sealed = Ctor.sealedOptions;
    for (var key in latest) {
      if (latest[key] !== sealed[key]) {
        if (!modified) { modified = {}; }
        modified[key] = latest[key];
      }
    }
    return modified
  }

  function Vue (options) {
    if (
      !(this instanceof Vue)
    ) {
      warn('Vue is a constructor and should be called with the `new` keyword');
    }
    this._init(options);
  }

  initMixin(Vue);
  stateMixin(Vue);
  eventsMixin(Vue);
  lifecycleMixin(Vue);
  renderMixin(Vue);

  /*  */

  function initUse (Vue) {
    Vue.use = function (plugin) {
      var installedPlugins = (this._installedPlugins || (this._installedPlugins = []));
      if (installedPlugins.indexOf(plugin) > -1) {
        return this
      }

      // additional parameters
      var args = toArray(arguments, 1);
      args.unshift(this);
      if (typeof plugin.install === 'function') {
        plugin.install.apply(plugin, args);
      } else if (typeof plugin === 'function') {
        plugin.apply(null, args);
      }
      installedPlugins.push(plugin);
      return this
    };
  }

  /*  */

  function initMixin$1 (Vue) {
    Vue.mixin = function (mixin) {
      this.options = mergeOptions(this.options, mixin);
      return this
    };
  }

  /*  */

  function initExtend (Vue) {
    /**
     * Each instance constructor, including Vue, has a unique
     * cid. This enables us to create wrapped "child
     * constructors" for prototypal inheritance and cache them.
     */
    Vue.cid = 0;
    var cid = 1;

    /**
     * Class inheritance
     */
    Vue.extend = function (extendOptions) {
      extendOptions = extendOptions || {};
      var Super = this;
      var SuperId = Super.cid;
      var cachedCtors = extendOptions._Ctor || (extendOptions._Ctor = {});
      if (cachedCtors[SuperId]) {
        return cachedCtors[SuperId]
      }

      var name = extendOptions.name || Super.options.name;
      if ( name) {
        validateComponentName(name);
      }

      var Sub = function VueComponent (options) {
        this._init(options);
      };
      Sub.prototype = Object.create(Super.prototype);
      Sub.prototype.constructor = Sub;
      Sub.cid = cid++;
      Sub.options = mergeOptions(
        Super.options,
        extendOptions
      );
      Sub['super'] = Super;

      // For props and computed properties, we define the proxy getters on
      // the Vue instances at extension time, on the extended prototype. This
      // avoids Object.defineProperty calls for each instance created.
      if (Sub.options.props) {
        initProps$1(Sub);
      }
      if (Sub.options.computed) {
        initComputed$1(Sub);
      }

      // allow further extension/mixin/plugin usage
      Sub.extend = Super.extend;
      Sub.mixin = Super.mixin;
      Sub.use = Super.use;

      // create asset registers, so extended classes
      // can have their private assets too.
      ASSET_TYPES.forEach(function (type) {
        Sub[type] = Super[type];
      });
      // enable recursive self-lookup
      if (name) {
        Sub.options.components[name] = Sub;
      }

      // keep a reference to the super options at extension time.
      // later at instantiation we can check if Super's options have
      // been updated.
      Sub.superOptions = Super.options;
      Sub.extendOptions = extendOptions;
      Sub.sealedOptions = extend({}, Sub.options);

      // cache constructor
      cachedCtors[SuperId] = Sub;
      return Sub
    };
  }

  function initProps$1 (Comp) {
    var props = Comp.options.props;
    for (var key in props) {
      proxy(Comp.prototype, "_props", key);
    }
  }

  function initComputed$1 (Comp) {
    var computed = Comp.options.computed;
    for (var key in computed) {
      defineComputed(Comp.prototype, key, computed[key]);
    }
  }

  /*  */

  function initAssetRegisters (Vue) {
    /**
     * Create asset registration methods.
     */
    ASSET_TYPES.forEach(function (type) {
      Vue[type] = function (
        id,
        definition
      ) {
        if (!definition) {
          return this.options[type + 's'][id]
        } else {
          /* istanbul ignore if */
          if ( type === 'component') {
            validateComponentName(id);
          }
          if (type === 'component' && isPlainObject(definition)) {
            definition.name = definition.name || id;
            definition = this.options._base.extend(definition);
          }
          if (type === 'directive' && typeof definition === 'function') {
            definition = { bind: definition, update: definition };
          }
          this.options[type + 's'][id] = definition;
          return definition
        }
      };
    });
  }

  /*  */





  function getComponentName (opts) {
    return opts && (opts.Ctor.options.name || opts.tag)
  }

  function matches (pattern, name) {
    if (Array.isArray(pattern)) {
      return pattern.indexOf(name) > -1
    } else if (typeof pattern === 'string') {
      return pattern.split(',').indexOf(name) > -1
    } else if (isRegExp(pattern)) {
      return pattern.test(name)
    }
    /* istanbul ignore next */
    return false
  }

  function pruneCache (keepAliveInstance, filter) {
    var cache = keepAliveInstance.cache;
    var keys = keepAliveInstance.keys;
    var _vnode = keepAliveInstance._vnode;
    for (var key in cache) {
      var entry = cache[key];
      if (entry) {
        var name = entry.name;
        if (name && !filter(name)) {
          pruneCacheEntry(cache, key, keys, _vnode);
        }
      }
    }
  }

  function pruneCacheEntry (
    cache,
    key,
    keys,
    current
  ) {
    var entry = cache[key];
    if (entry && (!current || entry.tag !== current.tag)) {
      entry.componentInstance.$destroy();
    }
    cache[key] = null;
    remove(keys, key);
  }

  var patternTypes = [String, RegExp, Array];

  var KeepAlive = {
    name: 'keep-alive',
    abstract: true,

    props: {
      include: patternTypes,
      exclude: patternTypes,
      max: [String, Number]
    },

    methods: {
      cacheVNode: function cacheVNode() {
        var ref = this;
        var cache = ref.cache;
        var keys = ref.keys;
        var vnodeToCache = ref.vnodeToCache;
        var keyToCache = ref.keyToCache;
        if (vnodeToCache) {
          var tag = vnodeToCache.tag;
          var componentInstance = vnodeToCache.componentInstance;
          var componentOptions = vnodeToCache.componentOptions;
          cache[keyToCache] = {
            name: getComponentName(componentOptions),
            tag: tag,
            componentInstance: componentInstance,
          };
          keys.push(keyToCache);
          // prune oldest entry
          if (this.max && keys.length > parseInt(this.max)) {
            pruneCacheEntry(cache, keys[0], keys, this._vnode);
          }
          this.vnodeToCache = null;
        }
      }
    },

    created: function created () {
      this.cache = Object.create(null);
      this.keys = [];
    },

    destroyed: function destroyed () {
      for (var key in this.cache) {
        pruneCacheEntry(this.cache, key, this.keys);
      }
    },

    mounted: function mounted () {
      var this$1 = this;

      this.cacheVNode();
      this.$watch('include', function (val) {
        pruneCache(this$1, function (name) { return matches(val, name); });
      });
      this.$watch('exclude', function (val) {
        pruneCache(this$1, function (name) { return !matches(val, name); });
      });
    },

    updated: function updated () {
      this.cacheVNode();
    },

    render: function render () {
      var slot = this.$slots.default;
      var vnode = getFirstComponentChild(slot);
      var componentOptions = vnode && vnode.componentOptions;
      if (componentOptions) {
        // check pattern
        var name = getComponentName(componentOptions);
        var ref = this;
        var include = ref.include;
        var exclude = ref.exclude;
        if (
          // not included
          (include && (!name || !matches(include, name))) ||
          // excluded
          (exclude && name && matches(exclude, name))
        ) {
          return vnode
        }

        var ref$1 = this;
        var cache = ref$1.cache;
        var keys = ref$1.keys;
        var key = vnode.key == null
          // same constructor may get registered as different local components
          // so cid alone is not enough (#3269)
          ? componentOptions.Ctor.cid + (componentOptions.tag ? ("::" + (componentOptions.tag)) : '')
          : vnode.key;
        if (cache[key]) {
          vnode.componentInstance = cache[key].componentInstance;
          // make current key freshest
          remove(keys, key);
          keys.push(key);
        } else {
          // delay setting the cache until update
          this.vnodeToCache = vnode;
          this.keyToCache = key;
        }

        vnode.data.keepAlive = true;
      }
      return vnode || (slot && slot[0])
    }
  };

  var builtInComponents = {
    KeepAlive: KeepAlive
  };

  /*  */

  function initGlobalAPI (Vue) {
    // config
    var configDef = {};
    configDef.get = function () { return config; };
    {
      configDef.set = function () {
        warn(
          'Do not replace the Vue.config object, set individual fields instead.'
        );
      };
    }
    Object.defineProperty(Vue, 'config', configDef);

    // exposed util methods.
    // NOTE: these are not considered part of the public API - avoid relying on
    // them unless you are aware of the risk.
    Vue.util = {
      warn: warn,
      extend: extend,
      mergeOptions: mergeOptions,
      defineReactive: defineReactive$$1
    };

    Vue.set = set;
    Vue.delete = del;
    Vue.nextTick = nextTick;

    // 2.6 explicit observable API
    Vue.observable = function (obj) {
      observe(obj);
      return obj
    };

    Vue.options = Object.create(null);
    ASSET_TYPES.forEach(function (type) {
      Vue.options[type + 's'] = Object.create(null);
    });

    // this is used to identify the "base" constructor to extend all plain-object
    // components with in Weex's multi-instance scenarios.
    Vue.options._base = Vue;

    extend(Vue.options.components, builtInComponents);

    initUse(Vue);
    initMixin$1(Vue);
    initExtend(Vue);
    initAssetRegisters(Vue);
  }

  initGlobalAPI(Vue);

  Object.defineProperty(Vue.prototype, '$isServer', {
    get: isServerRendering
  });

  Object.defineProperty(Vue.prototype, '$ssrContext', {
    get: function get () {
      /* istanbul ignore next */
      return this.$vnode && this.$vnode.ssrContext
    }
  });

  // expose FunctionalRenderContext for ssr runtime helper installation
  Object.defineProperty(Vue, 'FunctionalRenderContext', {
    value: FunctionalRenderContext
  });

  Vue.version = '2.6.14';

  /*  */

  // these are reserved for web because they are directly compiled away
  // during template compilation
  var isReservedAttr = makeMap('style,class');

  // attributes that should be using props for binding
  var acceptValue = makeMap('input,textarea,option,select,progress');
  var mustUseProp = function (tag, type, attr) {
    return (
      (attr === 'value' && acceptValue(tag)) && type !== 'button' ||
      (attr === 'selected' && tag === 'option') ||
      (attr === 'checked' && tag === 'input') ||
      (attr === 'muted' && tag === 'video')
    )
  };

  var isEnumeratedAttr = makeMap('contenteditable,draggable,spellcheck');

  var isValidContentEditableValue = makeMap('events,caret,typing,plaintext-only');

  var convertEnumeratedValue = function (key, value) {
    return isFalsyAttrValue(value) || value === 'false'
      ? 'false'
      // allow arbitrary string value for contenteditable
      : key === 'contenteditable' && isValidContentEditableValue(value)
        ? value
        : 'true'
  };

  var isBooleanAttr = makeMap(
    'allowfullscreen,async,autofocus,autoplay,checked,compact,controls,declare,' +
    'default,defaultchecked,defaultmuted,defaultselected,defer,disabled,' +
    'enabled,formnovalidate,hidden,indeterminate,inert,ismap,itemscope,loop,multiple,' +
    'muted,nohref,noresize,noshade,novalidate,nowrap,open,pauseonexit,readonly,' +
    'required,reversed,scoped,seamless,selected,sortable,' +
    'truespeed,typemustmatch,visible'
  );

  var xlinkNS = 'http://www.w3.org/1999/xlink';

  var isXlink = function (name) {
    return name.charAt(5) === ':' && name.slice(0, 5) === 'xlink'
  };

  var getXlinkProp = function (name) {
    return isXlink(name) ? name.slice(6, name.length) : ''
  };

  var isFalsyAttrValue = function (val) {
    return val == null || val === false
  };

  /*  */

  function genClassForVnode (vnode) {
    var data = vnode.data;
    var parentNode = vnode;
    var childNode = vnode;
    while (isDef(childNode.componentInstance)) {
      childNode = childNode.componentInstance._vnode;
      if (childNode && childNode.data) {
        data = mergeClassData(childNode.data, data);
      }
    }
    while (isDef(parentNode = parentNode.parent)) {
      if (parentNode && parentNode.data) {
        data = mergeClassData(data, parentNode.data);
      }
    }
    return renderClass(data.staticClass, data.class)
  }

  function mergeClassData (child, parent) {
    return {
      staticClass: concat(child.staticClass, parent.staticClass),
      class: isDef(child.class)
        ? [child.class, parent.class]
        : parent.class
    }
  }

  function renderClass (
    staticClass,
    dynamicClass
  ) {
    if (isDef(staticClass) || isDef(dynamicClass)) {
      return concat(staticClass, stringifyClass(dynamicClass))
    }
    /* istanbul ignore next */
    return ''
  }

  function concat (a, b) {
    return a ? b ? (a + ' ' + b) : a : (b || '')
  }

  function stringifyClass (value) {
    if (Array.isArray(value)) {
      return stringifyArray(value)
    }
    if (isObject(value)) {
      return stringifyObject(value)
    }
    if (typeof value === 'string') {
      return value
    }
    /* istanbul ignore next */
    return ''
  }

  function stringifyArray (value) {
    var res = '';
    var stringified;
    for (var i = 0, l = value.length; i < l; i++) {
      if (isDef(stringified = stringifyClass(value[i])) && stringified !== '') {
        if (res) { res += ' '; }
        res += stringified;
      }
    }
    return res
  }

  function stringifyObject (value) {
    var res = '';
    for (var key in value) {
      if (value[key]) {
        if (res) { res += ' '; }
        res += key;
      }
    }
    return res
  }

  /*  */

  var namespaceMap = {
    svg: 'http://www.w3.org/2000/svg',
    math: 'http://www.w3.org/1998/Math/MathML'
  };

  var isHTMLTag = makeMap(
    'html,body,base,head,link,meta,style,title,' +
    'address,article,aside,footer,header,h1,h2,h3,h4,h5,h6,hgroup,nav,section,' +
    'div,dd,dl,dt,figcaption,figure,picture,hr,img,li,main,ol,p,pre,ul,' +
    'a,b,abbr,bdi,bdo,br,cite,code,data,dfn,em,i,kbd,mark,q,rp,rt,rtc,ruby,' +
    's,samp,small,span,strong,sub,sup,time,u,var,wbr,area,audio,map,track,video,' +
    'embed,object,param,source,canvas,script,noscript,del,ins,' +
    'caption,col,colgroup,table,thead,tbody,td,th,tr,' +
    'button,datalist,fieldset,form,input,label,legend,meter,optgroup,option,' +
    'output,progress,select,textarea,' +
    'details,dialog,menu,menuitem,summary,' +
    'content,element,shadow,template,blockquote,iframe,tfoot'
  );

  // this map is intentionally selective, only covering SVG elements that may
  // contain child elements.
  var isSVG = makeMap(
    'svg,animate,circle,clippath,cursor,defs,desc,ellipse,filter,font-face,' +
    'foreignobject,g,glyph,image,line,marker,mask,missing-glyph,path,pattern,' +
    'polygon,polyline,rect,switch,symbol,text,textpath,tspan,use,view',
    true
  );

  var isReservedTag = function (tag) {
    return isHTMLTag(tag) || isSVG(tag)
  };

  function getTagNamespace (tag) {
    if (isSVG(tag)) {
      return 'svg'
    }
    // basic support for MathML
    // note it doesn't support other MathML elements being component roots
    if (tag === 'math') {
      return 'math'
    }
  }

  var unknownElementCache = Object.create(null);
  function isUnknownElement (tag) {
    /* istanbul ignore if */
    if (!inBrowser) {
      return true
    }
    if (isReservedTag(tag)) {
      return false
    }
    tag = tag.toLowerCase();
    /* istanbul ignore if */
    if (unknownElementCache[tag] != null) {
      return unknownElementCache[tag]
    }
    var el = document.createElement(tag);
    if (tag.indexOf('-') > -1) {
      // http://stackoverflow.com/a/28210364/1070244
      return (unknownElementCache[tag] = (
        el.constructor === window.HTMLUnknownElement ||
        el.constructor === window.HTMLElement
      ))
    } else {
      return (unknownElementCache[tag] = /HTMLUnknownElement/.test(el.toString()))
    }
  }

  var isTextInputType = makeMap('text,number,password,search,email,tel,url');

  /*  */

  /**
   * Query an element selector if it's not an element already.
   */
  function query (el) {
    if (typeof el === 'string') {
      var selected = document.querySelector(el);
      if (!selected) {
         warn(
          'Cannot find element: ' + el
        );
        return document.createElement('div')
      }
      return selected
    } else {
      return el
    }
  }

  /*  */

  function createElement$1 (tagName, vnode) {
    var elm = document.createElement(tagName);
    if (tagName !== 'select') {
      return elm
    }
    // false or null will remove the attribute but undefined will not
    if (vnode.data && vnode.data.attrs && vnode.data.attrs.multiple !== undefined) {
      elm.setAttribute('multiple', 'multiple');
    }
    return elm
  }

  function createElementNS (namespace, tagName) {
    return document.createElementNS(namespaceMap[namespace], tagName)
  }

  function createTextNode (text) {
    return document.createTextNode(text)
  }

  function createComment (text) {
    return document.createComment(text)
  }

  function insertBefore (parentNode, newNode, referenceNode) {
    parentNode.insertBefore(newNode, referenceNode);
  }

  function removeChild (node, child) {
    node.removeChild(child);
  }

  function appendChild (node, child) {
    node.appendChild(child);
  }

  function parentNode (node) {
    return node.parentNode
  }

  function nextSibling (node) {
    return node.nextSibling
  }

  function tagName (node) {
    return node.tagName
  }

  function setTextContent (node, text) {
    node.textContent = text;
  }

  function setStyleScope (node, scopeId) {
    node.setAttribute(scopeId, '');
  }

  var nodeOps = /*#__PURE__*/Object.freeze({
    createElement: createElement$1,
    createElementNS: createElementNS,
    createTextNode: createTextNode,
    createComment: createComment,
    insertBefore: insertBefore,
    removeChild: removeChild,
    appendChild: appendChild,
    parentNode: parentNode,
    nextSibling: nextSibling,
    tagName: tagName,
    setTextContent: setTextContent,
    setStyleScope: setStyleScope
  });

  /*  */

  var ref = {
    create: function create (_, vnode) {
      registerRef(vnode);
    },
    update: function update (oldVnode, vnode) {
      if (oldVnode.data.ref !== vnode.data.ref) {
        registerRef(oldVnode, true);
        registerRef(vnode);
      }
    },
    destroy: function destroy (vnode) {
      registerRef(vnode, true);
    }
  };

  function registerRef (vnode, isRemoval) {
    var key = vnode.data.ref;
    if (!isDef(key)) { return }

    var vm = vnode.context;
    var ref = vnode.componentInstance || vnode.elm;
    var refs = vm.$refs;
    if (isRemoval) {
      if (Array.isArray(refs[key])) {
        remove(refs[key], ref);
      } else if (refs[key] === ref) {
        refs[key] = undefined;
      }
    } else {
      if (vnode.data.refInFor) {
        if (!Array.isArray(refs[key])) {
          refs[key] = [ref];
        } else if (refs[key].indexOf(ref) < 0) {
          // $flow-disable-line
          refs[key].push(ref);
        }
      } else {
        refs[key] = ref;
      }
    }
  }

  /**
   * Virtual DOM patching algorithm based on Snabbdom by
   * Simon Friis Vindum (@paldepind)
   * Licensed under the MIT License
   * https://github.com/paldepind/snabbdom/blob/master/LICENSE
   *
   * modified by Evan You (@yyx990803)
   *
   * Not type-checking this because this file is perf-critical and the cost
   * of making flow understand it is not worth it.
   */

  var emptyNode = new VNode('', {}, []);

  var hooks = ['create', 'activate', 'update', 'remove', 'destroy'];

  function sameVnode (a, b) {
    return (
      a.key === b.key &&
      a.asyncFactory === b.asyncFactory && (
        (
          a.tag === b.tag &&
          a.isComment === b.isComment &&
          isDef(a.data) === isDef(b.data) &&
          sameInputType(a, b)
        ) || (
          isTrue(a.isAsyncPlaceholder) &&
          isUndef(b.asyncFactory.error)
        )
      )
    )
  }

  function sameInputType (a, b) {
    if (a.tag !== 'input') { return true }
    var i;
    var typeA = isDef(i = a.data) && isDef(i = i.attrs) && i.type;
    var typeB = isDef(i = b.data) && isDef(i = i.attrs) && i.type;
    return typeA === typeB || isTextInputType(typeA) && isTextInputType(typeB)
  }

  function createKeyToOldIdx (children, beginIdx, endIdx) {
    var i, key;
    var map = {};
    for (i = beginIdx; i <= endIdx; ++i) {
      key = children[i].key;
      if (isDef(key)) { map[key] = i; }
    }
    return map
  }

  function createPatchFunction (backend) {
    var i, j;
    var cbs = {};

    var modules = backend.modules;
    var nodeOps = backend.nodeOps;

    for (i = 0; i < hooks.length; ++i) {
      cbs[hooks[i]] = [];
      for (j = 0; j < modules.length; ++j) {
        if (isDef(modules[j][hooks[i]])) {
          cbs[hooks[i]].push(modules[j][hooks[i]]);
        }
      }
    }

    function emptyNodeAt (elm) {
      return new VNode(nodeOps.tagName(elm).toLowerCase(), {}, [], undefined, elm)
    }

    function createRmCb (childElm, listeners) {
      function remove$$1 () {
        if (--remove$$1.listeners === 0) {
          removeNode(childElm);
        }
      }
      remove$$1.listeners = listeners;
      return remove$$1
    }

    function removeNode (el) {
      var parent = nodeOps.parentNode(el);
      // element may have already been removed due to v-html / v-text
      if (isDef(parent)) {
        nodeOps.removeChild(parent, el);
      }
    }

    function isUnknownElement$$1 (vnode, inVPre) {
      return (
        !inVPre &&
        !vnode.ns &&
        !(
          config.ignoredElements.length &&
          config.ignoredElements.some(function (ignore) {
            return isRegExp(ignore)
              ? ignore.test(vnode.tag)
              : ignore === vnode.tag
          })
        ) &&
        config.isUnknownElement(vnode.tag)
      )
    }

    var creatingElmInVPre = 0;

    function createElm (
      vnode,
      insertedVnodeQueue,
      parentElm,
      refElm,
      nested,
      ownerArray,
      index
    ) {
      if (isDef(vnode.elm) && isDef(ownerArray)) {
        // This vnode was used in a previous render!
        // now it's used as a new node, overwriting its elm would cause
        // potential patch errors down the road when it's used as an insertion
        // reference node. Instead, we clone the node on-demand before creating
        // associated DOM element for it.
        vnode = ownerArray[index] = cloneVNode(vnode);
      }

      vnode.isRootInsert = !nested; // for transition enter check
      if (createComponent(vnode, insertedVnodeQueue, parentElm, refElm)) {
        return
      }

      var data = vnode.data;
      var children = vnode.children;
      var tag = vnode.tag;
      if (isDef(tag)) {
        {
          if (data && data.pre) {
            creatingElmInVPre++;
          }
          if (isUnknownElement$$1(vnode, creatingElmInVPre)) {
            warn(
              'Unknown custom element: <' + tag + '> - did you ' +
              'register the component correctly? For recursive components, ' +
              'make sure to provide the "name" option.',
              vnode.context
            );
          }
        }

        vnode.elm = vnode.ns
          ? nodeOps.createElementNS(vnode.ns, tag)
          : nodeOps.createElement(tag, vnode);
        setScope(vnode);

        /* istanbul ignore if */
        {
          createChildren(vnode, children, insertedVnodeQueue);
          if (isDef(data)) {
            invokeCreateHooks(vnode, insertedVnodeQueue);
          }
          insert(parentElm, vnode.elm, refElm);
        }

        if ( data && data.pre) {
          creatingElmInVPre--;
        }
      } else if (isTrue(vnode.isComment)) {
        vnode.elm = nodeOps.createComment(vnode.text);
        insert(parentElm, vnode.elm, refElm);
      } else {
        vnode.elm = nodeOps.createTextNode(vnode.text);
        insert(parentElm, vnode.elm, refElm);
      }
    }

    function createComponent (vnode, insertedVnodeQueue, parentElm, refElm) {
      var i = vnode.data;
      if (isDef(i)) {
        var isReactivated = isDef(vnode.componentInstance) && i.keepAlive;
        if (isDef(i = i.hook) && isDef(i = i.init)) {
          i(vnode, false /* hydrating */);
        }
        // after calling the init hook, if the vnode is a child component
        // it should've created a child instance and mounted it. the child
        // component also has set the placeholder vnode's elm.
        // in that case we can just return the element and be done.
        if (isDef(vnode.componentInstance)) {
          initComponent(vnode, insertedVnodeQueue);
          insert(parentElm, vnode.elm, refElm);
          if (isTrue(isReactivated)) {
            reactivateComponent(vnode, insertedVnodeQueue, parentElm, refElm);
          }
          return true
        }
      }
    }

    function initComponent (vnode, insertedVnodeQueue) {
      if (isDef(vnode.data.pendingInsert)) {
        insertedVnodeQueue.push.apply(insertedVnodeQueue, vnode.data.pendingInsert);
        vnode.data.pendingInsert = null;
      }
      vnode.elm = vnode.componentInstance.$el;
      if (isPatchable(vnode)) {
        invokeCreateHooks(vnode, insertedVnodeQueue);
        setScope(vnode);
      } else {
        // empty component root.
        // skip all element-related modules except for ref (#3455)
        registerRef(vnode);
        // make sure to invoke the insert hook
        insertedVnodeQueue.push(vnode);
      }
    }

    function reactivateComponent (vnode, insertedVnodeQueue, parentElm, refElm) {
      var i;
      // hack for #4339: a reactivated component with inner transition
      // does not trigger because the inner node's created hooks are not called
      // again. It's not ideal to involve module-specific logic in here but
      // there doesn't seem to be a better way to do it.
      var innerNode = vnode;
      while (innerNode.componentInstance) {
        innerNode = innerNode.componentInstance._vnode;
        if (isDef(i = innerNode.data) && isDef(i = i.transition)) {
          for (i = 0; i < cbs.activate.length; ++i) {
            cbs.activate[i](emptyNode, innerNode);
          }
          insertedVnodeQueue.push(innerNode);
          break
        }
      }
      // unlike a newly created component,
      // a reactivated keep-alive component doesn't insert itself
      insert(parentElm, vnode.elm, refElm);
    }

    function insert (parent, elm, ref$$1) {
      if (isDef(parent)) {
        if (isDef(ref$$1)) {
          if (nodeOps.parentNode(ref$$1) === parent) {
            nodeOps.insertBefore(parent, elm, ref$$1);
          }
        } else {
          nodeOps.appendChild(parent, elm);
        }
      }
    }

    function createChildren (vnode, children, insertedVnodeQueue) {
      if (Array.isArray(children)) {
        {
          checkDuplicateKeys(children);
        }
        for (var i = 0; i < children.length; ++i) {
          createElm(children[i], insertedVnodeQueue, vnode.elm, null, true, children, i);
        }
      } else if (isPrimitive(vnode.text)) {
        nodeOps.appendChild(vnode.elm, nodeOps.createTextNode(String(vnode.text)));
      }
    }

    function isPatchable (vnode) {
      while (vnode.componentInstance) {
        vnode = vnode.componentInstance._vnode;
      }
      return isDef(vnode.tag)
    }

    function invokeCreateHooks (vnode, insertedVnodeQueue) {
      for (var i$1 = 0; i$1 < cbs.create.length; ++i$1) {
        cbs.create[i$1](emptyNode, vnode);
      }
      i = vnode.data.hook; // Reuse variable
      if (isDef(i)) {
        if (isDef(i.create)) { i.create(emptyNode, vnode); }
        if (isDef(i.insert)) { insertedVnodeQueue.push(vnode); }
      }
    }

    // set scope id attribute for scoped CSS.
    // this is implemented as a special case to avoid the overhead
    // of going through the normal attribute patching process.
    function setScope (vnode) {
      var i;
      if (isDef(i = vnode.fnScopeId)) {
        nodeOps.setStyleScope(vnode.elm, i);
      } else {
        var ancestor = vnode;
        while (ancestor) {
          if (isDef(i = ancestor.context) && isDef(i = i.$options._scopeId)) {
            nodeOps.setStyleScope(vnode.elm, i);
          }
          ancestor = ancestor.parent;
        }
      }
      // for slot content they should also get the scopeId from the host instance.
      if (isDef(i = activeInstance) &&
        i !== vnode.context &&
        i !== vnode.fnContext &&
        isDef(i = i.$options._scopeId)
      ) {
        nodeOps.setStyleScope(vnode.elm, i);
      }
    }

    function addVnodes (parentElm, refElm, vnodes, startIdx, endIdx, insertedVnodeQueue) {
      for (; startIdx <= endIdx; ++startIdx) {
        createElm(vnodes[startIdx], insertedVnodeQueue, parentElm, refElm, false, vnodes, startIdx);
      }
    }

    function invokeDestroyHook (vnode) {
      var i, j;
      var data = vnode.data;
      if (isDef(data)) {
        if (isDef(i = data.hook) && isDef(i = i.destroy)) { i(vnode); }
        for (i = 0; i < cbs.destroy.length; ++i) { cbs.destroy[i](vnode); }
      }
      if (isDef(i = vnode.children)) {
        for (j = 0; j < vnode.children.length; ++j) {
          invokeDestroyHook(vnode.children[j]);
        }
      }
    }

    function removeVnodes (vnodes, startIdx, endIdx) {
      for (; startIdx <= endIdx; ++startIdx) {
        var ch = vnodes[startIdx];
        if (isDef(ch)) {
          if (isDef(ch.tag)) {
            removeAndInvokeRemoveHook(ch);
            invokeDestroyHook(ch);
          } else { // Text node
            removeNode(ch.elm);
          }
        }
      }
    }

    function removeAndInvokeRemoveHook (vnode, rm) {
      if (isDef(rm) || isDef(vnode.data)) {
        var i;
        var listeners = cbs.remove.length + 1;
        if (isDef(rm)) {
          // we have a recursively passed down rm callback
          // increase the listeners count
          rm.listeners += listeners;
        } else {
          // directly removing
          rm = createRmCb(vnode.elm, listeners);
        }
        // recursively invoke hooks on child component root node
        if (isDef(i = vnode.componentInstance) && isDef(i = i._vnode) && isDef(i.data)) {
          removeAndInvokeRemoveHook(i, rm);
        }
        for (i = 0; i < cbs.remove.length; ++i) {
          cbs.remove[i](vnode, rm);
        }
        if (isDef(i = vnode.data.hook) && isDef(i = i.remove)) {
          i(vnode, rm);
        } else {
          rm();
        }
      } else {
        removeNode(vnode.elm);
      }
    }

    function updateChildren (parentElm, oldCh, newCh, insertedVnodeQueue, removeOnly) {
      var oldStartIdx = 0;
      var newStartIdx = 0;
      var oldEndIdx = oldCh.length - 1;
      var oldStartVnode = oldCh[0];
      var oldEndVnode = oldCh[oldEndIdx];
      var newEndIdx = newCh.length - 1;
      var newStartVnode = newCh[0];
      var newEndVnode = newCh[newEndIdx];
      var oldKeyToIdx, idxInOld, vnodeToMove, refElm;

      // removeOnly is a special flag used only by <transition-group>
      // to ensure removed elements stay in correct relative positions
      // during leaving transitions
      var canMove = !removeOnly;

      {
        checkDuplicateKeys(newCh);
      }

      while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
        if (isUndef(oldStartVnode)) {
          oldStartVnode = oldCh[++oldStartIdx]; // Vnode has been moved left
        } else if (isUndef(oldEndVnode)) {
          oldEndVnode = oldCh[--oldEndIdx];
        } else if (sameVnode(oldStartVnode, newStartVnode)) {
          patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue, newCh, newStartIdx);
          oldStartVnode = oldCh[++oldStartIdx];
          newStartVnode = newCh[++newStartIdx];
        } else if (sameVnode(oldEndVnode, newEndVnode)) {
          patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue, newCh, newEndIdx);
          oldEndVnode = oldCh[--oldEndIdx];
          newEndVnode = newCh[--newEndIdx];
        } else if (sameVnode(oldStartVnode, newEndVnode)) { // Vnode moved right
          patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue, newCh, newEndIdx);
          canMove && nodeOps.insertBefore(parentElm, oldStartVnode.elm, nodeOps.nextSibling(oldEndVnode.elm));
          oldStartVnode = oldCh[++oldStartIdx];
          newEndVnode = newCh[--newEndIdx];
        } else if (sameVnode(oldEndVnode, newStartVnode)) { // Vnode moved left
          patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue, newCh, newStartIdx);
          canMove && nodeOps.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm);
          oldEndVnode = oldCh[--oldEndIdx];
          newStartVnode = newCh[++newStartIdx];
        } else {
          if (isUndef(oldKeyToIdx)) { oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx); }
          idxInOld = isDef(newStartVnode.key)
            ? oldKeyToIdx[newStartVnode.key]
            : findIdxInOld(newStartVnode, oldCh, oldStartIdx, oldEndIdx);
          if (isUndef(idxInOld)) { // New element
            createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm, false, newCh, newStartIdx);
          } else {
            vnodeToMove = oldCh[idxInOld];
            if (sameVnode(vnodeToMove, newStartVnode)) {
              patchVnode(vnodeToMove, newStartVnode, insertedVnodeQueue, newCh, newStartIdx);
              oldCh[idxInOld] = undefined;
              canMove && nodeOps.insertBefore(parentElm, vnodeToMove.elm, oldStartVnode.elm);
            } else {
              // same key but different element. treat as new element
              createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm, false, newCh, newStartIdx);
            }
          }
          newStartVnode = newCh[++newStartIdx];
        }
      }
      if (oldStartIdx > oldEndIdx) {
        refElm = isUndef(newCh[newEndIdx + 1]) ? null : newCh[newEndIdx + 1].elm;
        addVnodes(parentElm, refElm, newCh, newStartIdx, newEndIdx, insertedVnodeQueue);
      } else if (newStartIdx > newEndIdx) {
        removeVnodes(oldCh, oldStartIdx, oldEndIdx);
      }
    }

    function checkDuplicateKeys (children) {
      var seenKeys = {};
      for (var i = 0; i < children.length; i++) {
        var vnode = children[i];
        var key = vnode.key;
        if (isDef(key)) {
          if (seenKeys[key]) {
            warn(
              ("Duplicate keys detected: '" + key + "'. This may cause an update error."),
              vnode.context
            );
          } else {
            seenKeys[key] = true;
          }
        }
      }
    }

    function findIdxInOld (node, oldCh, start, end) {
      for (var i = start; i < end; i++) {
        var c = oldCh[i];
        if (isDef(c) && sameVnode(node, c)) { return i }
      }
    }

    function patchVnode (
      oldVnode,
      vnode,
      insertedVnodeQueue,
      ownerArray,
      index,
      removeOnly
    ) {
      if (oldVnode === vnode) {
        return
      }

      if (isDef(vnode.elm) && isDef(ownerArray)) {
        // clone reused vnode
        vnode = ownerArray[index] = cloneVNode(vnode);
      }

      var elm = vnode.elm = oldVnode.elm;

      if (isTrue(oldVnode.isAsyncPlaceholder)) {
        if (isDef(vnode.asyncFactory.resolved)) {
          hydrate(oldVnode.elm, vnode, insertedVnodeQueue);
        } else {
          vnode.isAsyncPlaceholder = true;
        }
        return
      }

      // reuse element for static trees.
      // note we only do this if the vnode is cloned -
      // if the new node is not cloned it means the render functions have been
      // reset by the hot-reload-api and we need to do a proper re-render.
      if (isTrue(vnode.isStatic) &&
        isTrue(oldVnode.isStatic) &&
        vnode.key === oldVnode.key &&
        (isTrue(vnode.isCloned) || isTrue(vnode.isOnce))
      ) {
        vnode.componentInstance = oldVnode.componentInstance;
        return
      }

      var i;
      var data = vnode.data;
      if (isDef(data) && isDef(i = data.hook) && isDef(i = i.prepatch)) {
        i(oldVnode, vnode);
      }

      var oldCh = oldVnode.children;
      var ch = vnode.children;
      if (isDef(data) && isPatchable(vnode)) {
        for (i = 0; i < cbs.update.length; ++i) { cbs.update[i](oldVnode, vnode); }
        if (isDef(i = data.hook) && isDef(i = i.update)) { i(oldVnode, vnode); }
      }
      if (isUndef(vnode.text)) {
        if (isDef(oldCh) && isDef(ch)) {
          if (oldCh !== ch) { updateChildren(elm, oldCh, ch, insertedVnodeQueue, removeOnly); }
        } else if (isDef(ch)) {
          {
            checkDuplicateKeys(ch);
          }
          if (isDef(oldVnode.text)) { nodeOps.setTextContent(elm, ''); }
          addVnodes(elm, null, ch, 0, ch.length - 1, insertedVnodeQueue);
        } else if (isDef(oldCh)) {
          removeVnodes(oldCh, 0, oldCh.length - 1);
        } else if (isDef(oldVnode.text)) {
          nodeOps.setTextContent(elm, '');
        }
      } else if (oldVnode.text !== vnode.text) {
        nodeOps.setTextContent(elm, vnode.text);
      }
      if (isDef(data)) {
        if (isDef(i = data.hook) && isDef(i = i.postpatch)) { i(oldVnode, vnode); }
      }
    }

    function invokeInsertHook (vnode, queue, initial) {
      // delay insert hooks for component root nodes, invoke them after the
      // element is really inserted
      if (isTrue(initial) && isDef(vnode.parent)) {
        vnode.parent.data.pendingInsert = queue;
      } else {
        for (var i = 0; i < queue.length; ++i) {
          queue[i].data.hook.insert(queue[i]);
        }
      }
    }

    var hydrationBailed = false;
    // list of modules that can skip create hook during hydration because they
    // are already rendered on the client or has no need for initialization
    // Note: style is excluded because it relies on initial clone for future
    // deep updates (#7063).
    var isRenderedModule = makeMap('attrs,class,staticClass,staticStyle,key');

    // Note: this is a browser-only function so we can assume elms are DOM nodes.
    function hydrate (elm, vnode, insertedVnodeQueue, inVPre) {
      var i;
      var tag = vnode.tag;
      var data = vnode.data;
      var children = vnode.children;
      inVPre = inVPre || (data && data.pre);
      vnode.elm = elm;

      if (isTrue(vnode.isComment) && isDef(vnode.asyncFactory)) {
        vnode.isAsyncPlaceholder = true;
        return true
      }
      // assert node match
      {
        if (!assertNodeMatch(elm, vnode, inVPre)) {
          return false
        }
      }
      if (isDef(data)) {
        if (isDef(i = data.hook) && isDef(i = i.init)) { i(vnode, true /* hydrating */); }
        if (isDef(i = vnode.componentInstance)) {
          // child component. it should have hydrated its own tree.
          initComponent(vnode, insertedVnodeQueue);
          return true
        }
      }
      if (isDef(tag)) {
        if (isDef(children)) {
          // empty element, allow client to pick up and populate children
          if (!elm.hasChildNodes()) {
            createChildren(vnode, children, insertedVnodeQueue);
          } else {
            // v-html and domProps: innerHTML
            if (isDef(i = data) && isDef(i = i.domProps) && isDef(i = i.innerHTML)) {
              if (i !== elm.innerHTML) {
                /* istanbul ignore if */
                if (
                  typeof console !== 'undefined' &&
                  !hydrationBailed
                ) {
                  hydrationBailed = true;
                  console.warn('Parent: ', elm);
                  console.warn('server innerHTML: ', i);
                  console.warn('client innerHTML: ', elm.innerHTML);
                }
                return false
              }
            } else {
              // iterate and compare children lists
              var childrenMatch = true;
              var childNode = elm.firstChild;
              for (var i$1 = 0; i$1 < children.length; i$1++) {
                if (!childNode || !hydrate(childNode, children[i$1], insertedVnodeQueue, inVPre)) {
                  childrenMatch = false;
                  break
                }
                childNode = childNode.nextSibling;
              }
              // if childNode is not null, it means the actual childNodes list is
              // longer than the virtual children list.
              if (!childrenMatch || childNode) {
                /* istanbul ignore if */
                if (
                  typeof console !== 'undefined' &&
                  !hydrationBailed
                ) {
                  hydrationBailed = true;
                  console.warn('Parent: ', elm);
                  console.warn('Mismatching childNodes vs. VNodes: ', elm.childNodes, children);
                }
                return false
              }
            }
          }
        }
        if (isDef(data)) {
          var fullInvoke = false;
          for (var key in data) {
            if (!isRenderedModule(key)) {
              fullInvoke = true;
              invokeCreateHooks(vnode, insertedVnodeQueue);
              break
            }
          }
          if (!fullInvoke && data['class']) {
            // ensure collecting deps for deep class bindings for future updates
            traverse(data['class']);
          }
        }
      } else if (elm.data !== vnode.text) {
        elm.data = vnode.text;
      }
      return true
    }

    function assertNodeMatch (node, vnode, inVPre) {
      if (isDef(vnode.tag)) {
        return vnode.tag.indexOf('vue-component') === 0 || (
          !isUnknownElement$$1(vnode, inVPre) &&
          vnode.tag.toLowerCase() === (node.tagName && node.tagName.toLowerCase())
        )
      } else {
        return node.nodeType === (vnode.isComment ? 8 : 3)
      }
    }

    return function patch (oldVnode, vnode, hydrating, removeOnly) {
      if (isUndef(vnode)) {
        if (isDef(oldVnode)) { invokeDestroyHook(oldVnode); }
        return
      }

      var isInitialPatch = false;
      var insertedVnodeQueue = [];

      if (isUndef(oldVnode)) {
        // empty mount (likely as component), create new root element
        isInitialPatch = true;
        createElm(vnode, insertedVnodeQueue);
      } else {
        var isRealElement = isDef(oldVnode.nodeType);
        if (!isRealElement && sameVnode(oldVnode, vnode)) {
          // patch existing root node
          patchVnode(oldVnode, vnode, insertedVnodeQueue, null, null, removeOnly);
        } else {
          if (isRealElement) {
            // mounting to a real element
            // check if this is server-rendered content and if we can perform
            // a successful hydration.
            if (oldVnode.nodeType === 1 && oldVnode.hasAttribute(SSR_ATTR)) {
              oldVnode.removeAttribute(SSR_ATTR);
              hydrating = true;
            }
            if (isTrue(hydrating)) {
              if (hydrate(oldVnode, vnode, insertedVnodeQueue)) {
                invokeInsertHook(vnode, insertedVnodeQueue, true);
                return oldVnode
              } else {
                warn(
                  'The client-side rendered virtual DOM tree is not matching ' +
                  'server-rendered content. This is likely caused by incorrect ' +
                  'HTML markup, for example nesting block-level elements inside ' +
                  '<p>, or missing <tbody>. Bailing hydration and performing ' +
                  'full client-side render.'
                );
              }
            }
            // either not server-rendered, or hydration failed.
            // create an empty node and replace it
            oldVnode = emptyNodeAt(oldVnode);
          }

          // replacing existing element
          var oldElm = oldVnode.elm;
          var parentElm = nodeOps.parentNode(oldElm);

          // create new node
          createElm(
            vnode,
            insertedVnodeQueue,
            // extremely rare edge case: do not insert if old element is in a
            // leaving transition. Only happens when combining transition +
            // keep-alive + HOCs. (#4590)
            oldElm._leaveCb ? null : parentElm,
            nodeOps.nextSibling(oldElm)
          );

          // update parent placeholder node element, recursively
          if (isDef(vnode.parent)) {
            var ancestor = vnode.parent;
            var patchable = isPatchable(vnode);
            while (ancestor) {
              for (var i = 0; i < cbs.destroy.length; ++i) {
                cbs.destroy[i](ancestor);
              }
              ancestor.elm = vnode.elm;
              if (patchable) {
                for (var i$1 = 0; i$1 < cbs.create.length; ++i$1) {
                  cbs.create[i$1](emptyNode, ancestor);
                }
                // #6513
                // invoke insert hooks that may have been merged by create hooks.
                // e.g. for directives that uses the "inserted" hook.
                var insert = ancestor.data.hook.insert;
                if (insert.merged) {
                  // start at index 1 to avoid re-invoking component mounted hook
                  for (var i$2 = 1; i$2 < insert.fns.length; i$2++) {
                    insert.fns[i$2]();
                  }
                }
              } else {
                registerRef(ancestor);
              }
              ancestor = ancestor.parent;
            }
          }

          // destroy old node
          if (isDef(parentElm)) {
            removeVnodes([oldVnode], 0, 0);
          } else if (isDef(oldVnode.tag)) {
            invokeDestroyHook(oldVnode);
          }
        }
      }

      invokeInsertHook(vnode, insertedVnodeQueue, isInitialPatch);
      return vnode.elm
    }
  }

  /*  */

  var directives = {
    create: updateDirectives,
    update: updateDirectives,
    destroy: function unbindDirectives (vnode) {
      updateDirectives(vnode, emptyNode);
    }
  };

  function updateDirectives (oldVnode, vnode) {
    if (oldVnode.data.directives || vnode.data.directives) {
      _update(oldVnode, vnode);
    }
  }

  function _update (oldVnode, vnode) {
    var isCreate = oldVnode === emptyNode;
    var isDestroy = vnode === emptyNode;
    var oldDirs = normalizeDirectives$1(oldVnode.data.directives, oldVnode.context);
    var newDirs = normalizeDirectives$1(vnode.data.directives, vnode.context);

    var dirsWithInsert = [];
    var dirsWithPostpatch = [];

    var key, oldDir, dir;
    for (key in newDirs) {
      oldDir = oldDirs[key];
      dir = newDirs[key];
      if (!oldDir) {
        // new directive, bind
        callHook$1(dir, 'bind', vnode, oldVnode);
        if (dir.def && dir.def.inserted) {
          dirsWithInsert.push(dir);
        }
      } else {
        // existing directive, update
        dir.oldValue = oldDir.value;
        dir.oldArg = oldDir.arg;
        callHook$1(dir, 'update', vnode, oldVnode);
        if (dir.def && dir.def.componentUpdated) {
          dirsWithPostpatch.push(dir);
        }
      }
    }

    if (dirsWithInsert.length) {
      var callInsert = function () {
        for (var i = 0; i < dirsWithInsert.length; i++) {
          callHook$1(dirsWithInsert[i], 'inserted', vnode, oldVnode);
        }
      };
      if (isCreate) {
        mergeVNodeHook(vnode, 'insert', callInsert);
      } else {
        callInsert();
      }
    }

    if (dirsWithPostpatch.length) {
      mergeVNodeHook(vnode, 'postpatch', function () {
        for (var i = 0; i < dirsWithPostpatch.length; i++) {
          callHook$1(dirsWithPostpatch[i], 'componentUpdated', vnode, oldVnode);
        }
      });
    }

    if (!isCreate) {
      for (key in oldDirs) {
        if (!newDirs[key]) {
          // no longer present, unbind
          callHook$1(oldDirs[key], 'unbind', oldVnode, oldVnode, isDestroy);
        }
      }
    }
  }

  var emptyModifiers = Object.create(null);

  function normalizeDirectives$1 (
    dirs,
    vm
  ) {
    var res = Object.create(null);
    if (!dirs) {
      // $flow-disable-line
      return res
    }
    var i, dir;
    for (i = 0; i < dirs.length; i++) {
      dir = dirs[i];
      if (!dir.modifiers) {
        // $flow-disable-line
        dir.modifiers = emptyModifiers;
      }
      res[getRawDirName(dir)] = dir;
      dir.def = resolveAsset(vm.$options, 'directives', dir.name, true);
    }
    // $flow-disable-line
    return res
  }

  function getRawDirName (dir) {
    return dir.rawName || ((dir.name) + "." + (Object.keys(dir.modifiers || {}).join('.')))
  }

  function callHook$1 (dir, hook, vnode, oldVnode, isDestroy) {
    var fn = dir.def && dir.def[hook];
    if (fn) {
      try {
        fn(vnode.elm, dir, vnode, oldVnode, isDestroy);
      } catch (e) {
        handleError(e, vnode.context, ("directive " + (dir.name) + " " + hook + " hook"));
      }
    }
  }

  var baseModules = [
    ref,
    directives
  ];

  /*  */

  function updateAttrs (oldVnode, vnode) {
    var opts = vnode.componentOptions;
    if (isDef(opts) && opts.Ctor.options.inheritAttrs === false) {
      return
    }
    if (isUndef(oldVnode.data.attrs) && isUndef(vnode.data.attrs)) {
      return
    }
    var key, cur, old;
    var elm = vnode.elm;
    var oldAttrs = oldVnode.data.attrs || {};
    var attrs = vnode.data.attrs || {};
    // clone observed objects, as the user probably wants to mutate it
    if (isDef(attrs.__ob__)) {
      attrs = vnode.data.attrs = extend({}, attrs);
    }

    for (key in attrs) {
      cur = attrs[key];
      old = oldAttrs[key];
      if (old !== cur) {
        setAttr(elm, key, cur, vnode.data.pre);
      }
    }
    // #4391: in IE9, setting type can reset value for input[type=radio]
    // #6666: IE/Edge forces progress value down to 1 before setting a max
    /* istanbul ignore if */
    if ((isIE || isEdge) && attrs.value !== oldAttrs.value) {
      setAttr(elm, 'value', attrs.value);
    }
    for (key in oldAttrs) {
      if (isUndef(attrs[key])) {
        if (isXlink(key)) {
          elm.removeAttributeNS(xlinkNS, getXlinkProp(key));
        } else if (!isEnumeratedAttr(key)) {
          elm.removeAttribute(key);
        }
      }
    }
  }

  function setAttr (el, key, value, isInPre) {
    if (isInPre || el.tagName.indexOf('-') > -1) {
      baseSetAttr(el, key, value);
    } else if (isBooleanAttr(key)) {
      // set attribute for blank value
      // e.g. <option disabled>Select one</option>
      if (isFalsyAttrValue(value)) {
        el.removeAttribute(key);
      } else {
        // technically allowfullscreen is a boolean attribute for <iframe>,
        // but Flash expects a value of "true" when used on <embed> tag
        value = key === 'allowfullscreen' && el.tagName === 'EMBED'
          ? 'true'
          : key;
        el.setAttribute(key, value);
      }
    } else if (isEnumeratedAttr(key)) {
      el.setAttribute(key, convertEnumeratedValue(key, value));
    } else if (isXlink(key)) {
      if (isFalsyAttrValue(value)) {
        el.removeAttributeNS(xlinkNS, getXlinkProp(key));
      } else {
        el.setAttributeNS(xlinkNS, key, value);
      }
    } else {
      baseSetAttr(el, key, value);
    }
  }

  function baseSetAttr (el, key, value) {
    if (isFalsyAttrValue(value)) {
      el.removeAttribute(key);
    } else {
      // #7138: IE10 & 11 fires input event when setting placeholder on
      // <textarea>... block the first input event and remove the blocker
      // immediately.
      /* istanbul ignore if */
      if (
        isIE && !isIE9 &&
        el.tagName === 'TEXTAREA' &&
        key === 'placeholder' && value !== '' && !el.__ieph
      ) {
        var blocker = function (e) {
          e.stopImmediatePropagation();
          el.removeEventListener('input', blocker);
        };
        el.addEventListener('input', blocker);
        // $flow-disable-line
        el.__ieph = true; /* IE placeholder patched */
      }
      el.setAttribute(key, value);
    }
  }

  var attrs = {
    create: updateAttrs,
    update: updateAttrs
  };

  /*  */

  function updateClass (oldVnode, vnode) {
    var el = vnode.elm;
    var data = vnode.data;
    var oldData = oldVnode.data;
    if (
      isUndef(data.staticClass) &&
      isUndef(data.class) && (
        isUndef(oldData) || (
          isUndef(oldData.staticClass) &&
          isUndef(oldData.class)
        )
      )
    ) {
      return
    }

    var cls = genClassForVnode(vnode);

    // handle transition classes
    var transitionClass = el._transitionClasses;
    if (isDef(transitionClass)) {
      cls = concat(cls, stringifyClass(transitionClass));
    }

    // set the class
    if (cls !== el._prevClass) {
      el.setAttribute('class', cls);
      el._prevClass = cls;
    }
  }

  var klass = {
    create: updateClass,
    update: updateClass
  };

  /*  */

  /*  */

  /*  */

  /*  */

  // in some cases, the event used has to be determined at runtime
  // so we used some reserved tokens during compile.
  var RANGE_TOKEN = '__r';
  var CHECKBOX_RADIO_TOKEN = '__c';

  /*  */

  // normalize v-model event tokens that can only be determined at runtime.
  // it's important to place the event as the first in the array because
  // the whole point is ensuring the v-model callback gets called before
  // user-attached handlers.
  function normalizeEvents (on) {
    /* istanbul ignore if */
    if (isDef(on[RANGE_TOKEN])) {
      // IE input[type=range] only supports `change` event
      var event = isIE ? 'change' : 'input';
      on[event] = [].concat(on[RANGE_TOKEN], on[event] || []);
      delete on[RANGE_TOKEN];
    }
    // This was originally intended to fix #4521 but no longer necessary
    // after 2.5. Keeping it for backwards compat with generated code from < 2.4
    /* istanbul ignore if */
    if (isDef(on[CHECKBOX_RADIO_TOKEN])) {
      on.change = [].concat(on[CHECKBOX_RADIO_TOKEN], on.change || []);
      delete on[CHECKBOX_RADIO_TOKEN];
    }
  }

  var target$1;

  function createOnceHandler$1 (event, handler, capture) {
    var _target = target$1; // save current target element in closure
    return function onceHandler () {
      var res = handler.apply(null, arguments);
      if (res !== null) {
        remove$2(event, onceHandler, capture, _target);
      }
    }
  }

  // #9446: Firefox <= 53 (in particular, ESR 52) has incorrect Event.timeStamp
  // implementation and does not fire microtasks in between event propagation, so
  // safe to exclude.
  var useMicrotaskFix = isUsingMicroTask && !(isFF && Number(isFF[1]) <= 53);

  function add$1 (
    name,
    handler,
    capture,
    passive
  ) {
    // async edge case #6566: inner click event triggers patch, event handler
    // attached to outer element during patch, and triggered again. This
    // happens because browsers fire microtask ticks between event propagation.
    // the solution is simple: we save the timestamp when a handler is attached,
    // and the handler would only fire if the event passed to it was fired
    // AFTER it was attached.
    if (useMicrotaskFix) {
      var attachedTimestamp = currentFlushTimestamp;
      var original = handler;
      handler = original._wrapper = function (e) {
        if (
          // no bubbling, should always fire.
          // this is just a safety net in case event.timeStamp is unreliable in
          // certain weird environments...
          e.target === e.currentTarget ||
          // event is fired after handler attachment
          e.timeStamp >= attachedTimestamp ||
          // bail for environments that have buggy event.timeStamp implementations
          // #9462 iOS 9 bug: event.timeStamp is 0 after history.pushState
          // #9681 QtWebEngine event.timeStamp is negative value
          e.timeStamp <= 0 ||
          // #9448 bail if event is fired in another document in a multi-page
          // electron/nw.js app, since event.timeStamp will be using a different
          // starting reference
          e.target.ownerDocument !== document
        ) {
          return original.apply(this, arguments)
        }
      };
    }
    target$1.addEventListener(
      name,
      handler,
      supportsPassive
        ? { capture: capture, passive: passive }
        : capture
    );
  }

  function remove$2 (
    name,
    handler,
    capture,
    _target
  ) {
    (_target || target$1).removeEventListener(
      name,
      handler._wrapper || handler,
      capture
    );
  }

  function updateDOMListeners (oldVnode, vnode) {
    if (isUndef(oldVnode.data.on) && isUndef(vnode.data.on)) {
      return
    }
    var on = vnode.data.on || {};
    var oldOn = oldVnode.data.on || {};
    target$1 = vnode.elm;
    normalizeEvents(on);
    updateListeners(on, oldOn, add$1, remove$2, createOnceHandler$1, vnode.context);
    target$1 = undefined;
  }

  var events = {
    create: updateDOMListeners,
    update: updateDOMListeners
  };

  /*  */

  var svgContainer;

  function updateDOMProps (oldVnode, vnode) {
    if (isUndef(oldVnode.data.domProps) && isUndef(vnode.data.domProps)) {
      return
    }
    var key, cur;
    var elm = vnode.elm;
    var oldProps = oldVnode.data.domProps || {};
    var props = vnode.data.domProps || {};
    // clone observed objects, as the user probably wants to mutate it
    if (isDef(props.__ob__)) {
      props = vnode.data.domProps = extend({}, props);
    }

    for (key in oldProps) {
      if (!(key in props)) {
        elm[key] = '';
      }
    }

    for (key in props) {
      cur = props[key];
      // ignore children if the node has textContent or innerHTML,
      // as these will throw away existing DOM nodes and cause removal errors
      // on subsequent patches (#3360)
      if (key === 'textContent' || key === 'innerHTML') {
        if (vnode.children) { vnode.children.length = 0; }
        if (cur === oldProps[key]) { continue }
        // #6601 work around Chrome version <= 55 bug where single textNode
        // replaced by innerHTML/textContent retains its parentNode property
        if (elm.childNodes.length === 1) {
          elm.removeChild(elm.childNodes[0]);
        }
      }

      if (key === 'value' && elm.tagName !== 'PROGRESS') {
        // store value as _value as well since
        // non-string values will be stringified
        elm._value = cur;
        // avoid resetting cursor position when value is the same
        var strCur = isUndef(cur) ? '' : String(cur);
        if (shouldUpdateValue(elm, strCur)) {
          elm.value = strCur;
        }
      } else if (key === 'innerHTML' && isSVG(elm.tagName) && isUndef(elm.innerHTML)) {
        // IE doesn't support innerHTML for SVG elements
        svgContainer = svgContainer || document.createElement('div');
        svgContainer.innerHTML = "<svg>" + cur + "</svg>";
        var svg = svgContainer.firstChild;
        while (elm.firstChild) {
          elm.removeChild(elm.firstChild);
        }
        while (svg.firstChild) {
          elm.appendChild(svg.firstChild);
        }
      } else if (
        // skip the update if old and new VDOM state is the same.
        // `value` is handled separately because the DOM value may be temporarily
        // out of sync with VDOM state due to focus, composition and modifiers.
        // This  #4521 by skipping the unnecessary `checked` update.
        cur !== oldProps[key]
      ) {
        // some property updates can throw
        // e.g. `value` on <progress> w/ non-finite value
        try {
          elm[key] = cur;
        } catch (e) {}
      }
    }
  }

  // check platforms/web/util/attrs.js acceptValue


  function shouldUpdateValue (elm, checkVal) {
    return (!elm.composing && (
      elm.tagName === 'OPTION' ||
      isNotInFocusAndDirty(elm, checkVal) ||
      isDirtyWithModifiers(elm, checkVal)
    ))
  }

  function isNotInFocusAndDirty (elm, checkVal) {
    // return true when textbox (.number and .trim) loses focus and its value is
    // not equal to the updated value
    var notInFocus = true;
    // #6157
    // work around IE bug when accessing document.activeElement in an iframe
    try { notInFocus = document.activeElement !== elm; } catch (e) {}
    return notInFocus && elm.value !== checkVal
  }

  function isDirtyWithModifiers (elm, newVal) {
    var value = elm.value;
    var modifiers = elm._vModifiers; // injected by v-model runtime
    if (isDef(modifiers)) {
      if (modifiers.number) {
        return toNumber(value) !== toNumber(newVal)
      }
      if (modifiers.trim) {
        return value.trim() !== newVal.trim()
      }
    }
    return value !== newVal
  }

  var domProps = {
    create: updateDOMProps,
    update: updateDOMProps
  };

  /*  */

  var parseStyleText = cached(function (cssText) {
    var res = {};
    var listDelimiter = /;(?![^(]*\))/g;
    var propertyDelimiter = /:(.+)/;
    cssText.split(listDelimiter).forEach(function (item) {
      if (item) {
        var tmp = item.split(propertyDelimiter);
        tmp.length > 1 && (res[tmp[0].trim()] = tmp[1].trim());
      }
    });
    return res
  });

  // merge static and dynamic style data on the same vnode
  function normalizeStyleData (data) {
    var style = normalizeStyleBinding(data.style);
    // static style is pre-processed into an object during compilation
    // and is always a fresh object, so it's safe to merge into it
    return data.staticStyle
      ? extend(data.staticStyle, style)
      : style
  }

  // normalize possible array / string values into Object
  function normalizeStyleBinding (bindingStyle) {
    if (Array.isArray(bindingStyle)) {
      return toObject(bindingStyle)
    }
    if (typeof bindingStyle === 'string') {
      return parseStyleText(bindingStyle)
    }
    return bindingStyle
  }

  /**
   * parent component style should be after child's
   * so that parent component's style could override it
   */
  function getStyle (vnode, checkChild) {
    var res = {};
    var styleData;

    if (checkChild) {
      var childNode = vnode;
      while (childNode.componentInstance) {
        childNode = childNode.componentInstance._vnode;
        if (
          childNode && childNode.data &&
          (styleData = normalizeStyleData(childNode.data))
        ) {
          extend(res, styleData);
        }
      }
    }

    if ((styleData = normalizeStyleData(vnode.data))) {
      extend(res, styleData);
    }

    var parentNode = vnode;
    while ((parentNode = parentNode.parent)) {
      if (parentNode.data && (styleData = normalizeStyleData(parentNode.data))) {
        extend(res, styleData);
      }
    }
    return res
  }

  /*  */

  var cssVarRE = /^--/;
  var importantRE = /\s*!important$/;
  var setProp = function (el, name, val) {
    /* istanbul ignore if */
    if (cssVarRE.test(name)) {
      el.style.setProperty(name, val);
    } else if (importantRE.test(val)) {
      el.style.setProperty(hyphenate(name), val.replace(importantRE, ''), 'important');
    } else {
      var normalizedName = normalize(name);
      if (Array.isArray(val)) {
        // Support values array created by autoprefixer, e.g.
        // {display: ["-webkit-box", "-ms-flexbox", "flex"]}
        // Set them one by one, and the browser will only set those it can recognize
        for (var i = 0, len = val.length; i < len; i++) {
          el.style[normalizedName] = val[i];
        }
      } else {
        el.style[normalizedName] = val;
      }
    }
  };

  var vendorNames = ['Webkit', 'Moz', 'ms'];

  var emptyStyle;
  var normalize = cached(function (prop) {
    emptyStyle = emptyStyle || document.createElement('div').style;
    prop = camelize(prop);
    if (prop !== 'filter' && (prop in emptyStyle)) {
      return prop
    }
    var capName = prop.charAt(0).toUpperCase() + prop.slice(1);
    for (var i = 0; i < vendorNames.length; i++) {
      var name = vendorNames[i] + capName;
      if (name in emptyStyle) {
        return name
      }
    }
  });

  function updateStyle (oldVnode, vnode) {
    var data = vnode.data;
    var oldData = oldVnode.data;

    if (isUndef(data.staticStyle) && isUndef(data.style) &&
      isUndef(oldData.staticStyle) && isUndef(oldData.style)
    ) {
      return
    }

    var cur, name;
    var el = vnode.elm;
    var oldStaticStyle = oldData.staticStyle;
    var oldStyleBinding = oldData.normalizedStyle || oldData.style || {};

    // if static style exists, stylebinding already merged into it when doing normalizeStyleData
    var oldStyle = oldStaticStyle || oldStyleBinding;

    var style = normalizeStyleBinding(vnode.data.style) || {};

    // store normalized style under a different key for next diff
    // make sure to clone it if it's reactive, since the user likely wants
    // to mutate it.
    vnode.data.normalizedStyle = isDef(style.__ob__)
      ? extend({}, style)
      : style;

    var newStyle = getStyle(vnode, true);

    for (name in oldStyle) {
      if (isUndef(newStyle[name])) {
        setProp(el, name, '');
      }
    }
    for (name in newStyle) {
      cur = newStyle[name];
      if (cur !== oldStyle[name]) {
        // ie9 setting to null has no effect, must use empty string
        setProp(el, name, cur == null ? '' : cur);
      }
    }
  }

  var style = {
    create: updateStyle,
    update: updateStyle
  };

  /*  */

  var whitespaceRE = /\s+/;

  /**
   * Add class with compatibility for SVG since classList is not supported on
   * SVG elements in IE
   */
  function addClass (el, cls) {
    /* istanbul ignore if */
    if (!cls || !(cls = cls.trim())) {
      return
    }

    /* istanbul ignore else */
    if (el.classList) {
      if (cls.indexOf(' ') > -1) {
        cls.split(whitespaceRE).forEach(function (c) { return el.classList.add(c); });
      } else {
        el.classList.add(cls);
      }
    } else {
      var cur = " " + (el.getAttribute('class') || '') + " ";
      if (cur.indexOf(' ' + cls + ' ') < 0) {
        el.setAttribute('class', (cur + cls).trim());
      }
    }
  }

  /**
   * Remove class with compatibility for SVG since classList is not supported on
   * SVG elements in IE
   */
  function removeClass (el, cls) {
    /* istanbul ignore if */
    if (!cls || !(cls = cls.trim())) {
      return
    }

    /* istanbul ignore else */
    if (el.classList) {
      if (cls.indexOf(' ') > -1) {
        cls.split(whitespaceRE).forEach(function (c) { return el.classList.remove(c); });
      } else {
        el.classList.remove(cls);
      }
      if (!el.classList.length) {
        el.removeAttribute('class');
      }
    } else {
      var cur = " " + (el.getAttribute('class') || '') + " ";
      var tar = ' ' + cls + ' ';
      while (cur.indexOf(tar) >= 0) {
        cur = cur.replace(tar, ' ');
      }
      cur = cur.trim();
      if (cur) {
        el.setAttribute('class', cur);
      } else {
        el.removeAttribute('class');
      }
    }
  }

  /*  */

  function resolveTransition (def$$1) {
    if (!def$$1) {
      return
    }
    /* istanbul ignore else */
    if (typeof def$$1 === 'object') {
      var res = {};
      if (def$$1.css !== false) {
        extend(res, autoCssTransition(def$$1.name || 'v'));
      }
      extend(res, def$$1);
      return res
    } else if (typeof def$$1 === 'string') {
      return autoCssTransition(def$$1)
    }
  }

  var autoCssTransition = cached(function (name) {
    return {
      enterClass: (name + "-enter"),
      enterToClass: (name + "-enter-to"),
      enterActiveClass: (name + "-enter-active"),
      leaveClass: (name + "-leave"),
      leaveToClass: (name + "-leave-to"),
      leaveActiveClass: (name + "-leave-active")
    }
  });

  var hasTransition = inBrowser && !isIE9;
  var TRANSITION = 'transition';
  var ANIMATION = 'animation';

  // Transition property/event sniffing
  var transitionProp = 'transition';
  var transitionEndEvent = 'transitionend';
  var animationProp = 'animation';
  var animationEndEvent = 'animationend';
  if (hasTransition) {
    /* istanbul ignore if */
    if (window.ontransitionend === undefined &&
      window.onwebkittransitionend !== undefined
    ) {
      transitionProp = 'WebkitTransition';
      transitionEndEvent = 'webkitTransitionEnd';
    }
    if (window.onanimationend === undefined &&
      window.onwebkitanimationend !== undefined
    ) {
      animationProp = 'WebkitAnimation';
      animationEndEvent = 'webkitAnimationEnd';
    }
  }

  // binding to window is necessary to make hot reload work in IE in strict mode
  var raf = inBrowser
    ? window.requestAnimationFrame
      ? window.requestAnimationFrame.bind(window)
      : setTimeout
    : /* istanbul ignore next */ function (fn) { return fn(); };

  function nextFrame (fn) {
    raf(function () {
      raf(fn);
    });
  }

  function addTransitionClass (el, cls) {
    var transitionClasses = el._transitionClasses || (el._transitionClasses = []);
    if (transitionClasses.indexOf(cls) < 0) {
      transitionClasses.push(cls);
      addClass(el, cls);
    }
  }

  function removeTransitionClass (el, cls) {
    if (el._transitionClasses) {
      remove(el._transitionClasses, cls);
    }
    removeClass(el, cls);
  }

  function whenTransitionEnds (
    el,
    expectedType,
    cb
  ) {
    var ref = getTransitionInfo(el, expectedType);
    var type = ref.type;
    var timeout = ref.timeout;
    var propCount = ref.propCount;
    if (!type) { return cb() }
    var event = type === TRANSITION ? transitionEndEvent : animationEndEvent;
    var ended = 0;
    var end = function () {
      el.removeEventListener(event, onEnd);
      cb();
    };
    var onEnd = function (e) {
      if (e.target === el) {
        if (++ended >= propCount) {
          end();
        }
      }
    };
    setTimeout(function () {
      if (ended < propCount) {
        end();
      }
    }, timeout + 1);
    el.addEventListener(event, onEnd);
  }

  var transformRE = /\b(transform|all)(,|$)/;

  function getTransitionInfo (el, expectedType) {
    var styles = window.getComputedStyle(el);
    // JSDOM may return undefined for transition properties
    var transitionDelays = (styles[transitionProp + 'Delay'] || '').split(', ');
    var transitionDurations = (styles[transitionProp + 'Duration'] || '').split(', ');
    var transitionTimeout = getTimeout(transitionDelays, transitionDurations);
    var animationDelays = (styles[animationProp + 'Delay'] || '').split(', ');
    var animationDurations = (styles[animationProp + 'Duration'] || '').split(', ');
    var animationTimeout = getTimeout(animationDelays, animationDurations);

    var type;
    var timeout = 0;
    var propCount = 0;
    /* istanbul ignore if */
    if (expectedType === TRANSITION) {
      if (transitionTimeout > 0) {
        type = TRANSITION;
        timeout = transitionTimeout;
        propCount = transitionDurations.length;
      }
    } else if (expectedType === ANIMATION) {
      if (animationTimeout > 0) {
        type = ANIMATION;
        timeout = animationTimeout;
        propCount = animationDurations.length;
      }
    } else {
      timeout = Math.max(transitionTimeout, animationTimeout);
      type = timeout > 0
        ? transitionTimeout > animationTimeout
          ? TRANSITION
          : ANIMATION
        : null;
      propCount = type
        ? type === TRANSITION
          ? transitionDurations.length
          : animationDurations.length
        : 0;
    }
    var hasTransform =
      type === TRANSITION &&
      transformRE.test(styles[transitionProp + 'Property']);
    return {
      type: type,
      timeout: timeout,
      propCount: propCount,
      hasTransform: hasTransform
    }
  }

  function getTimeout (delays, durations) {
    /* istanbul ignore next */
    while (delays.length < durations.length) {
      delays = delays.concat(delays);
    }

    return Math.max.apply(null, durations.map(function (d, i) {
      return toMs(d) + toMs(delays[i])
    }))
  }

  // Old versions of Chromium (below 61.0.3163.100) formats floating pointer numbers
  // in a locale-dependent way, using a comma instead of a dot.
  // If comma is not replaced with a dot, the input will be rounded down (i.e. acting
  // as a floor function) causing unexpected behaviors
  function toMs (s) {
    return Number(s.slice(0, -1).replace(',', '.')) * 1000
  }

  /*  */

  function enter (vnode, toggleDisplay) {
    var el = vnode.elm;

    // call leave callback now
    if (isDef(el._leaveCb)) {
      el._leaveCb.cancelled = true;
      el._leaveCb();
    }

    var data = resolveTransition(vnode.data.transition);
    if (isUndef(data)) {
      return
    }

    /* istanbul ignore if */
    if (isDef(el._enterCb) || el.nodeType !== 1) {
      return
    }

    var css = data.css;
    var type = data.type;
    var enterClass = data.enterClass;
    var enterToClass = data.enterToClass;
    var enterActiveClass = data.enterActiveClass;
    var appearClass = data.appearClass;
    var appearToClass = data.appearToClass;
    var appearActiveClass = data.appearActiveClass;
    var beforeEnter = data.beforeEnter;
    var enter = data.enter;
    var afterEnter = data.afterEnter;
    var enterCancelled = data.enterCancelled;
    var beforeAppear = data.beforeAppear;
    var appear = data.appear;
    var afterAppear = data.afterAppear;
    var appearCancelled = data.appearCancelled;
    var duration = data.duration;

    // activeInstance will always be the <transition> component managing this
    // transition. One edge case to check is when the <transition> is placed
    // as the root node of a child component. In that case we need to check
    // <transition>'s parent for appear check.
    var context = activeInstance;
    var transitionNode = activeInstance.$vnode;
    while (transitionNode && transitionNode.parent) {
      context = transitionNode.context;
      transitionNode = transitionNode.parent;
    }

    var isAppear = !context._isMounted || !vnode.isRootInsert;

    if (isAppear && !appear && appear !== '') {
      return
    }

    var startClass = isAppear && appearClass
      ? appearClass
      : enterClass;
    var activeClass = isAppear && appearActiveClass
      ? appearActiveClass
      : enterActiveClass;
    var toClass = isAppear && appearToClass
      ? appearToClass
      : enterToClass;

    var beforeEnterHook = isAppear
      ? (beforeAppear || beforeEnter)
      : beforeEnter;
    var enterHook = isAppear
      ? (typeof appear === 'function' ? appear : enter)
      : enter;
    var afterEnterHook = isAppear
      ? (afterAppear || afterEnter)
      : afterEnter;
    var enterCancelledHook = isAppear
      ? (appearCancelled || enterCancelled)
      : enterCancelled;

    var explicitEnterDuration = toNumber(
      isObject(duration)
        ? duration.enter
        : duration
    );

    if ( explicitEnterDuration != null) {
      checkDuration(explicitEnterDuration, 'enter', vnode);
    }

    var expectsCSS = css !== false && !isIE9;
    var userWantsControl = getHookArgumentsLength(enterHook);

    var cb = el._enterCb = once(function () {
      if (expectsCSS) {
        removeTransitionClass(el, toClass);
        removeTransitionClass(el, activeClass);
      }
      if (cb.cancelled) {
        if (expectsCSS) {
          removeTransitionClass(el, startClass);
        }
        enterCancelledHook && enterCancelledHook(el);
      } else {
        afterEnterHook && afterEnterHook(el);
      }
      el._enterCb = null;
    });

    if (!vnode.data.show) {
      // remove pending leave element on enter by injecting an insert hook
      mergeVNodeHook(vnode, 'insert', function () {
        var parent = el.parentNode;
        var pendingNode = parent && parent._pending && parent._pending[vnode.key];
        if (pendingNode &&
          pendingNode.tag === vnode.tag &&
          pendingNode.elm._leaveCb
        ) {
          pendingNode.elm._leaveCb();
        }
        enterHook && enterHook(el, cb);
      });
    }

    // start enter transition
    beforeEnterHook && beforeEnterHook(el);
    if (expectsCSS) {
      addTransitionClass(el, startClass);
      addTransitionClass(el, activeClass);
      nextFrame(function () {
        removeTransitionClass(el, startClass);
        if (!cb.cancelled) {
          addTransitionClass(el, toClass);
          if (!userWantsControl) {
            if (isValidDuration(explicitEnterDuration)) {
              setTimeout(cb, explicitEnterDuration);
            } else {
              whenTransitionEnds(el, type, cb);
            }
          }
        }
      });
    }

    if (vnode.data.show) {
      toggleDisplay && toggleDisplay();
      enterHook && enterHook(el, cb);
    }

    if (!expectsCSS && !userWantsControl) {
      cb();
    }
  }

  function leave (vnode, rm) {
    var el = vnode.elm;

    // call enter callback now
    if (isDef(el._enterCb)) {
      el._enterCb.cancelled = true;
      el._enterCb();
    }

    var data = resolveTransition(vnode.data.transition);
    if (isUndef(data) || el.nodeType !== 1) {
      return rm()
    }

    /* istanbul ignore if */
    if (isDef(el._leaveCb)) {
      return
    }

    var css = data.css;
    var type = data.type;
    var leaveClass = data.leaveClass;
    var leaveToClass = data.leaveToClass;
    var leaveActiveClass = data.leaveActiveClass;
    var beforeLeave = data.beforeLeave;
    var leave = data.leave;
    var afterLeave = data.afterLeave;
    var leaveCancelled = data.leaveCancelled;
    var delayLeave = data.delayLeave;
    var duration = data.duration;

    var expectsCSS = css !== false && !isIE9;
    var userWantsControl = getHookArgumentsLength(leave);

    var explicitLeaveDuration = toNumber(
      isObject(duration)
        ? duration.leave
        : duration
    );

    if ( isDef(explicitLeaveDuration)) {
      checkDuration(explicitLeaveDuration, 'leave', vnode);
    }

    var cb = el._leaveCb = once(function () {
      if (el.parentNode && el.parentNode._pending) {
        el.parentNode._pending[vnode.key] = null;
      }
      if (expectsCSS) {
        removeTransitionClass(el, leaveToClass);
        removeTransitionClass(el, leaveActiveClass);
      }
      if (cb.cancelled) {
        if (expectsCSS) {
          removeTransitionClass(el, leaveClass);
        }
        leaveCancelled && leaveCancelled(el);
      } else {
        rm();
        afterLeave && afterLeave(el);
      }
      el._leaveCb = null;
    });

    if (delayLeave) {
      delayLeave(performLeave);
    } else {
      performLeave();
    }

    function performLeave () {
      // the delayed leave may have already been cancelled
      if (cb.cancelled) {
        return
      }
      // record leaving element
      if (!vnode.data.show && el.parentNode) {
        (el.parentNode._pending || (el.parentNode._pending = {}))[(vnode.key)] = vnode;
      }
      beforeLeave && beforeLeave(el);
      if (expectsCSS) {
        addTransitionClass(el, leaveClass);
        addTransitionClass(el, leaveActiveClass);
        nextFrame(function () {
          removeTransitionClass(el, leaveClass);
          if (!cb.cancelled) {
            addTransitionClass(el, leaveToClass);
            if (!userWantsControl) {
              if (isValidDuration(explicitLeaveDuration)) {
                setTimeout(cb, explicitLeaveDuration);
              } else {
                whenTransitionEnds(el, type, cb);
              }
            }
          }
        });
      }
      leave && leave(el, cb);
      if (!expectsCSS && !userWantsControl) {
        cb();
      }
    }
  }

  // only used in dev mode
  function checkDuration (val, name, vnode) {
    if (typeof val !== 'number') {
      warn(
        "<transition> explicit " + name + " duration is not a valid number - " +
        "got " + (JSON.stringify(val)) + ".",
        vnode.context
      );
    } else if (isNaN(val)) {
      warn(
        "<transition> explicit " + name + " duration is NaN - " +
        'the duration expression might be incorrect.',
        vnode.context
      );
    }
  }

  function isValidDuration (val) {
    return typeof val === 'number' && !isNaN(val)
  }

  /**
   * Normalize a transition hook's argument length. The hook may be:
   * - a merged hook (invoker) with the original in .fns
   * - a wrapped component method (check ._length)
   * - a plain function (.length)
   */
  function getHookArgumentsLength (fn) {
    if (isUndef(fn)) {
      return false
    }
    var invokerFns = fn.fns;
    if (isDef(invokerFns)) {
      // invoker
      return getHookArgumentsLength(
        Array.isArray(invokerFns)
          ? invokerFns[0]
          : invokerFns
      )
    } else {
      return (fn._length || fn.length) > 1
    }
  }

  function _enter (_, vnode) {
    if (vnode.data.show !== true) {
      enter(vnode);
    }
  }

  var transition = inBrowser ? {
    create: _enter,
    activate: _enter,
    remove: function remove$$1 (vnode, rm) {
      /* istanbul ignore else */
      if (vnode.data.show !== true) {
        leave(vnode, rm);
      } else {
        rm();
      }
    }
  } : {};

  var platformModules = [
    attrs,
    klass,
    events,
    domProps,
    style,
    transition
  ];

  /*  */

  // the directive module should be applied last, after all
  // built-in modules have been applied.
  var modules = platformModules.concat(baseModules);

  var patch = createPatchFunction({ nodeOps: nodeOps, modules: modules });

  /**
   * Not type checking this file because flow doesn't like attaching
   * properties to Elements.
   */

  /* istanbul ignore if */
  if (isIE9) {
    // http://www.matts411.com/post/internet-explorer-9-oninput/
    document.addEventListener('selectionchange', function () {
      var el = document.activeElement;
      if (el && el.vmodel) {
        trigger(el, 'input');
      }
    });
  }

  var directive = {
    inserted: function inserted (el, binding, vnode, oldVnode) {
      if (vnode.tag === 'select') {
        // #6903
        if (oldVnode.elm && !oldVnode.elm._vOptions) {
          mergeVNodeHook(vnode, 'postpatch', function () {
            directive.componentUpdated(el, binding, vnode);
          });
        } else {
          setSelected(el, binding, vnode.context);
        }
        el._vOptions = [].map.call(el.options, getValue);
      } else if (vnode.tag === 'textarea' || isTextInputType(el.type)) {
        el._vModifiers = binding.modifiers;
        if (!binding.modifiers.lazy) {
          el.addEventListener('compositionstart', onCompositionStart);
          el.addEventListener('compositionend', onCompositionEnd);
          // Safari < 10.2 & UIWebView doesn't fire compositionend when
          // switching focus before confirming composition choice
          // this also fixes the issue where some browsers e.g. iOS Chrome
          // fires "change" instead of "input" on autocomplete.
          el.addEventListener('change', onCompositionEnd);
          /* istanbul ignore if */
          if (isIE9) {
            el.vmodel = true;
          }
        }
      }
    },

    componentUpdated: function componentUpdated (el, binding, vnode) {
      if (vnode.tag === 'select') {
        setSelected(el, binding, vnode.context);
        // in case the options rendered by v-for have changed,
        // it's possible that the value is out-of-sync with the rendered options.
        // detect such cases and filter out values that no longer has a matching
        // option in the DOM.
        var prevOptions = el._vOptions;
        var curOptions = el._vOptions = [].map.call(el.options, getValue);
        if (curOptions.some(function (o, i) { return !looseEqual(o, prevOptions[i]); })) {
          // trigger change event if
          // no matching option found for at least one value
          var needReset = el.multiple
            ? binding.value.some(function (v) { return hasNoMatchingOption(v, curOptions); })
            : binding.value !== binding.oldValue && hasNoMatchingOption(binding.value, curOptions);
          if (needReset) {
            trigger(el, 'change');
          }
        }
      }
    }
  };

  function setSelected (el, binding, vm) {
    actuallySetSelected(el, binding, vm);
    /* istanbul ignore if */
    if (isIE || isEdge) {
      setTimeout(function () {
        actuallySetSelected(el, binding, vm);
      }, 0);
    }
  }

  function actuallySetSelected (el, binding, vm) {
    var value = binding.value;
    var isMultiple = el.multiple;
    if (isMultiple && !Array.isArray(value)) {
       warn(
        "<select multiple v-model=\"" + (binding.expression) + "\"> " +
        "expects an Array value for its binding, but got " + (Object.prototype.toString.call(value).slice(8, -1)),
        vm
      );
      return
    }
    var selected, option;
    for (var i = 0, l = el.options.length; i < l; i++) {
      option = el.options[i];
      if (isMultiple) {
        selected = looseIndexOf(value, getValue(option)) > -1;
        if (option.selected !== selected) {
          option.selected = selected;
        }
      } else {
        if (looseEqual(getValue(option), value)) {
          if (el.selectedIndex !== i) {
            el.selectedIndex = i;
          }
          return
        }
      }
    }
    if (!isMultiple) {
      el.selectedIndex = -1;
    }
  }

  function hasNoMatchingOption (value, options) {
    return options.every(function (o) { return !looseEqual(o, value); })
  }

  function getValue (option) {
    return '_value' in option
      ? option._value
      : option.value
  }

  function onCompositionStart (e) {
    e.target.composing = true;
  }

  function onCompositionEnd (e) {
    // prevent triggering an input event for no reason
    if (!e.target.composing) { return }
    e.target.composing = false;
    trigger(e.target, 'input');
  }

  function trigger (el, type) {
    var e = document.createEvent('HTMLEvents');
    e.initEvent(type, true, true);
    el.dispatchEvent(e);
  }

  /*  */

  // recursively search for possible transition defined inside the component root
  function locateNode (vnode) {
    return vnode.componentInstance && (!vnode.data || !vnode.data.transition)
      ? locateNode(vnode.componentInstance._vnode)
      : vnode
  }

  var show = {
    bind: function bind (el, ref, vnode) {
      var value = ref.value;

      vnode = locateNode(vnode);
      var transition$$1 = vnode.data && vnode.data.transition;
      var originalDisplay = el.__vOriginalDisplay =
        el.style.display === 'none' ? '' : el.style.display;
      if (value && transition$$1) {
        vnode.data.show = true;
        enter(vnode, function () {
          el.style.display = originalDisplay;
        });
      } else {
        el.style.display = value ? originalDisplay : 'none';
      }
    },

    update: function update (el, ref, vnode) {
      var value = ref.value;
      var oldValue = ref.oldValue;

      /* istanbul ignore if */
      if (!value === !oldValue) { return }
      vnode = locateNode(vnode);
      var transition$$1 = vnode.data && vnode.data.transition;
      if (transition$$1) {
        vnode.data.show = true;
        if (value) {
          enter(vnode, function () {
            el.style.display = el.__vOriginalDisplay;
          });
        } else {
          leave(vnode, function () {
            el.style.display = 'none';
          });
        }
      } else {
        el.style.display = value ? el.__vOriginalDisplay : 'none';
      }
    },

    unbind: function unbind (
      el,
      binding,
      vnode,
      oldVnode,
      isDestroy
    ) {
      if (!isDestroy) {
        el.style.display = el.__vOriginalDisplay;
      }
    }
  };

  var platformDirectives = {
    model: directive,
    show: show
  };

  /*  */

  var transitionProps = {
    name: String,
    appear: Boolean,
    css: Boolean,
    mode: String,
    type: String,
    enterClass: String,
    leaveClass: String,
    enterToClass: String,
    leaveToClass: String,
    enterActiveClass: String,
    leaveActiveClass: String,
    appearClass: String,
    appearActiveClass: String,
    appearToClass: String,
    duration: [Number, String, Object]
  };

  // in case the child is also an abstract component, e.g. <keep-alive>
  // we want to recursively retrieve the real component to be rendered
  function getRealChild (vnode) {
    var compOptions = vnode && vnode.componentOptions;
    if (compOptions && compOptions.Ctor.options.abstract) {
      return getRealChild(getFirstComponentChild(compOptions.children))
    } else {
      return vnode
    }
  }

  function extractTransitionData (comp) {
    var data = {};
    var options = comp.$options;
    // props
    for (var key in options.propsData) {
      data[key] = comp[key];
    }
    // events.
    // extract listeners and pass them directly to the transition methods
    var listeners = options._parentListeners;
    for (var key$1 in listeners) {
      data[camelize(key$1)] = listeners[key$1];
    }
    return data
  }

  function placeholder (h, rawChild) {
    if (/\d-keep-alive$/.test(rawChild.tag)) {
      return h('keep-alive', {
        props: rawChild.componentOptions.propsData
      })
    }
  }

  function hasParentTransition (vnode) {
    while ((vnode = vnode.parent)) {
      if (vnode.data.transition) {
        return true
      }
    }
  }

  function isSameChild (child, oldChild) {
    return oldChild.key === child.key && oldChild.tag === child.tag
  }

  var isNotTextNode = function (c) { return c.tag || isAsyncPlaceholder(c); };

  var isVShowDirective = function (d) { return d.name === 'show'; };

  var Transition = {
    name: 'transition',
    props: transitionProps,
    abstract: true,

    render: function render (h) {
      var this$1 = this;

      var children = this.$slots.default;
      if (!children) {
        return
      }

      // filter out text nodes (possible whitespaces)
      children = children.filter(isNotTextNode);
      /* istanbul ignore if */
      if (!children.length) {
        return
      }

      // warn multiple elements
      if ( children.length > 1) {
        warn(
          '<transition> can only be used on a single element. Use ' +
          '<transition-group> for lists.',
          this.$parent
        );
      }

      var mode = this.mode;

      // warn invalid mode
      if (
        mode && mode !== 'in-out' && mode !== 'out-in'
      ) {
        warn(
          'invalid <transition> mode: ' + mode,
          this.$parent
        );
      }

      var rawChild = children[0];

      // if this is a component root node and the component's
      // parent container node also has transition, skip.
      if (hasParentTransition(this.$vnode)) {
        return rawChild
      }

      // apply transition data to child
      // use getRealChild() to ignore abstract components e.g. keep-alive
      var child = getRealChild(rawChild);
      /* istanbul ignore if */
      if (!child) {
        return rawChild
      }

      if (this._leaving) {
        return placeholder(h, rawChild)
      }

      // ensure a key that is unique to the vnode type and to this transition
      // component instance. This key will be used to remove pending leaving nodes
      // during entering.
      var id = "__transition-" + (this._uid) + "-";
      child.key = child.key == null
        ? child.isComment
          ? id + 'comment'
          : id + child.tag
        : isPrimitive(child.key)
          ? (String(child.key).indexOf(id) === 0 ? child.key : id + child.key)
          : child.key;

      var data = (child.data || (child.data = {})).transition = extractTransitionData(this);
      var oldRawChild = this._vnode;
      var oldChild = getRealChild(oldRawChild);

      // mark v-show
      // so that the transition module can hand over the control to the directive
      if (child.data.directives && child.data.directives.some(isVShowDirective)) {
        child.data.show = true;
      }

      if (
        oldChild &&
        oldChild.data &&
        !isSameChild(child, oldChild) &&
        !isAsyncPlaceholder(oldChild) &&
        // #6687 component root is a comment node
        !(oldChild.componentInstance && oldChild.componentInstance._vnode.isComment)
      ) {
        // replace old child transition data with fresh one
        // important for dynamic transitions!
        var oldData = oldChild.data.transition = extend({}, data);
        // handle transition mode
        if (mode === 'out-in') {
          // return placeholder node and queue update when leave finishes
          this._leaving = true;
          mergeVNodeHook(oldData, 'afterLeave', function () {
            this$1._leaving = false;
            this$1.$forceUpdate();
          });
          return placeholder(h, rawChild)
        } else if (mode === 'in-out') {
          if (isAsyncPlaceholder(child)) {
            return oldRawChild
          }
          var delayedLeave;
          var performLeave = function () { delayedLeave(); };
          mergeVNodeHook(data, 'afterEnter', performLeave);
          mergeVNodeHook(data, 'enterCancelled', performLeave);
          mergeVNodeHook(oldData, 'delayLeave', function (leave) { delayedLeave = leave; });
        }
      }

      return rawChild
    }
  };

  /*  */

  var props = extend({
    tag: String,
    moveClass: String
  }, transitionProps);

  delete props.mode;

  var TransitionGroup = {
    props: props,

    beforeMount: function beforeMount () {
      var this$1 = this;

      var update = this._update;
      this._update = function (vnode, hydrating) {
        var restoreActiveInstance = setActiveInstance(this$1);
        // force removing pass
        this$1.__patch__(
          this$1._vnode,
          this$1.kept,
          false, // hydrating
          true // removeOnly (!important, avoids unnecessary moves)
        );
        this$1._vnode = this$1.kept;
        restoreActiveInstance();
        update.call(this$1, vnode, hydrating);
      };
    },

    render: function render (h) {
      var tag = this.tag || this.$vnode.data.tag || 'span';
      var map = Object.create(null);
      var prevChildren = this.prevChildren = this.children;
      var rawChildren = this.$slots.default || [];
      var children = this.children = [];
      var transitionData = extractTransitionData(this);

      for (var i = 0; i < rawChildren.length; i++) {
        var c = rawChildren[i];
        if (c.tag) {
          if (c.key != null && String(c.key).indexOf('__vlist') !== 0) {
            children.push(c);
            map[c.key] = c
            ;(c.data || (c.data = {})).transition = transitionData;
          } else {
            var opts = c.componentOptions;
            var name = opts ? (opts.Ctor.options.name || opts.tag || '') : c.tag;
            warn(("<transition-group> children must be keyed: <" + name + ">"));
          }
        }
      }

      if (prevChildren) {
        var kept = [];
        var removed = [];
        for (var i$1 = 0; i$1 < prevChildren.length; i$1++) {
          var c$1 = prevChildren[i$1];
          c$1.data.transition = transitionData;
          c$1.data.pos = c$1.elm.getBoundingClientRect();
          if (map[c$1.key]) {
            kept.push(c$1);
          } else {
            removed.push(c$1);
          }
        }
        this.kept = h(tag, null, kept);
        this.removed = removed;
      }

      return h(tag, null, children)
    },

    updated: function updated () {
      var children = this.prevChildren;
      var moveClass = this.moveClass || ((this.name || 'v') + '-move');
      if (!children.length || !this.hasMove(children[0].elm, moveClass)) {
        return
      }

      // we divide the work into three loops to avoid mixing DOM reads and writes
      // in each iteration - which helps prevent layout thrashing.
      children.forEach(callPendingCbs);
      children.forEach(recordPosition);
      children.forEach(applyTranslation);

      // force reflow to put everything in position
      // assign to this to avoid being removed in tree-shaking
      // $flow-disable-line
      this._reflow = document.body.offsetHeight;

      children.forEach(function (c) {
        if (c.data.moved) {
          var el = c.elm;
          var s = el.style;
          addTransitionClass(el, moveClass);
          s.transform = s.WebkitTransform = s.transitionDuration = '';
          el.addEventListener(transitionEndEvent, el._moveCb = function cb (e) {
            if (e && e.target !== el) {
              return
            }
            if (!e || /transform$/.test(e.propertyName)) {
              el.removeEventListener(transitionEndEvent, cb);
              el._moveCb = null;
              removeTransitionClass(el, moveClass);
            }
          });
        }
      });
    },

    methods: {
      hasMove: function hasMove (el, moveClass) {
        /* istanbul ignore if */
        if (!hasTransition) {
          return false
        }
        /* istanbul ignore if */
        if (this._hasMove) {
          return this._hasMove
        }
        // Detect whether an element with the move class applied has
        // CSS transitions. Since the element may be inside an entering
        // transition at this very moment, we make a clone of it and remove
        // all other transition classes applied to ensure only the move class
        // is applied.
        var clone = el.cloneNode();
        if (el._transitionClasses) {
          el._transitionClasses.forEach(function (cls) { removeClass(clone, cls); });
        }
        addClass(clone, moveClass);
        clone.style.display = 'none';
        this.$el.appendChild(clone);
        var info = getTransitionInfo(clone);
        this.$el.removeChild(clone);
        return (this._hasMove = info.hasTransform)
      }
    }
  };

  function callPendingCbs (c) {
    /* istanbul ignore if */
    if (c.elm._moveCb) {
      c.elm._moveCb();
    }
    /* istanbul ignore if */
    if (c.elm._enterCb) {
      c.elm._enterCb();
    }
  }

  function recordPosition (c) {
    c.data.newPos = c.elm.getBoundingClientRect();
  }

  function applyTranslation (c) {
    var oldPos = c.data.pos;
    var newPos = c.data.newPos;
    var dx = oldPos.left - newPos.left;
    var dy = oldPos.top - newPos.top;
    if (dx || dy) {
      c.data.moved = true;
      var s = c.elm.style;
      s.transform = s.WebkitTransform = "translate(" + dx + "px," + dy + "px)";
      s.transitionDuration = '0s';
    }
  }

  var platformComponents = {
    Transition: Transition,
    TransitionGroup: TransitionGroup
  };

  /*  */

  // install platform specific utils
  Vue.config.mustUseProp = mustUseProp;
  Vue.config.isReservedTag = isReservedTag;
  Vue.config.isReservedAttr = isReservedAttr;
  Vue.config.getTagNamespace = getTagNamespace;
  Vue.config.isUnknownElement = isUnknownElement;

  // install platform runtime directives & components
  extend(Vue.options.directives, platformDirectives);
  extend(Vue.options.components, platformComponents);

  // install platform patch function
  Vue.prototype.__patch__ = inBrowser ? patch : noop;

  // public mount method
  Vue.prototype.$mount = function (
    el,
    hydrating
  ) {
    el = el && inBrowser ? query(el) : undefined;
    return mountComponent(this, el, hydrating)
  };

  // devtools global hook
  /* istanbul ignore next */
  if (inBrowser) {
    setTimeout(function () {
      if (config.devtools) {
        if (devtools) {
          devtools.emit('init', Vue);
        } else {
          console[console.info ? 'info' : 'log'](
            'Download the Vue Devtools extension for a better development experience:\n' +
            'https://github.com/vuejs/vue-devtools'
          );
        }
      }
      if (
        config.productionTip !== false &&
        typeof console !== 'undefined'
      ) {
        console[console.info ? 'info' : 'log'](
          "You are running Vue in development mode.\n" +
          "Make sure to turn on production mode when deploying for production.\n" +
          "See more tips at https://vuejs.org/guide/deployment.html"
        );
      }
    }, 0);
  }

  /*
   * Copyright © 2017 EaseScript All rights reserved.
   * Released under the MIT license
   * https://github.com/51breeze/EaseScript
   * @author Jun Ye <664371281@qq.com>
   */
  var key = Symbol('private');
  var hasOwn$1 = Object.prototype.hasOwnProperty;
  var emptyObject$1 = Object.create(null);

  function defineProps(vm, obj, prop, name, propsData){
      const cache = vm[key];
      let value = null;
      if( propsData && hasOwn$1.call(propsData,name) && vm.beforeReceiveProp(propsData[name],name) ){
          value =vm.receivePropValue(propsData[name],name);
          const descriptor = _Reflect.getDescriptor(vm, name);
          if( descriptor && descriptor.isMember){
              if(descriptor.type === _Reflect.MEMBERS_ACCESSOR && descriptor.modifier === _Reflect.MODIFIER_PUBLIC){
                  const setter = descriptor.set;
                  if( setter ){
                      cache.propsUpdating = true;
                      setter.call(vm, value);
                      cache.propsUpdating = false;
                  }
              }
          }
      }else if(prop.default !== void 0){
          value = prop.default;
          if( value && typeof value ==='function' && prop.type !== Function ){
              value = value.call(vm);
          }
      }

      if( !hasOwn$1.call(cache.states, name) ){
          cache.statePrevious[name]=value;
          Vue.util.defineReactive(cache.states, name, value);
      }

      Object.defineProperty(obj, name, {
          enumerable: true,
          configurable: true,
          get:function(){
              return value;
          },
          set:function(newValue){
              if( vm.beforeReceiveProp(newValue,name) ){
                  cache.propsUpdating = true;
                  vm[name] = value = vm.receivePropValue(newValue,name);
                  cache.propsUpdating = false;
              }
          }
      });
  }

  var mixins = [{
      render(){
          return this.render.apply(this, Array.prototype.slice.call(arguments));
      },
      beforeCreate(){
          this[key].props = this.$options.props;
          this.$options.props = null;
      },
      beforeMount(){
          if( this.hasEventListener(ComponentEvent.BEFORE_MOUNT) ){
              this.dispatchEvent( new ComponentEvent( ComponentEvent.BEFORE_MOUNT ) );
          }
          this.onBeforeMount();
      },
      mounted(){
          if( this.hasEventListener(ComponentEvent.MOUNTED) ){
              this.dispatchEvent( new ComponentEvent( ComponentEvent.MOUNTED ) );
          }
          this.onMounted();
      },
      beforeUpdate(){
          if( this.hasEventListener(ComponentEvent.BEFORE_UPDATE) ){
              this.dispatchEvent( new ComponentEvent( ComponentEvent.BEFORE_UPDATE ) );
          }
          this.onBeforeUpdate();
      },
      updated(){
          if( this.hasEventListener(ComponentEvent.UPDATED) ){
              this.dispatchEvent( new ComponentEvent( ComponentEvent.UPDATED ) );
          }
          this.onUpdated();
      },
      beforeDestroy(){
          if( this.hasEventListener(ComponentEvent.BEFORE_DESTROY) ){
              this.dispatchEvent( new ComponentEvent( ComponentEvent.BEFORE_DESTROY ) );
          }
          this.onBeforeUnmount();
      },
      destroyed(){
          if( this.hasEventListener(ComponentEvent.DESTROYED) ){
              this.dispatchEvent( new ComponentEvent( ComponentEvent.DESTROYED ) );
          }
          this.onUnmounted();
      },
      errorCaptured(){
          if( this.hasEventListener(ComponentEvent.ERROR_CAPTURED) ){
              this.dispatchEvent( new ComponentEvent( ComponentEvent.ERROR_CAPTURED ) );
          }
          this.onErrorCaptured();
      },
      activated(){
          if( this.hasEventListener(ComponentEvent.ACTIVATED) ){
              this.dispatchEvent( new ComponentEvent( ComponentEvent.ACTIVATED ) );
          }
          this.onActivated();
      },
      deactivated(){
          if( this.hasEventListener(ComponentEvent.DEACTIVATED) ){
              this.dispatchEvent( new ComponentEvent( ComponentEvent.DEACTIVATED ) );
          }
          this.onDeactivated();
      }
  }];

  function Component(){}
  Component.prototype = Object.create(Vue.prototype);
  Component.prototype.constructor = Component;
  Component.options = Vue.options;

  var proto = Component.prototype;
  function initPrivate(target){
      if( !hasOwn$1.call(target,key) ){
          target[key] = Object.create(null);
          target[key].event=new EventDispatcher();
          target[key].initialized=false;
          target[key].states=Object.create(null);
          target[key].statePrevious = Object.create(null);
          target[key].preventedProps = Object.create(null);
      }
      return target[key];
  }

  Object.defineProperty( proto, '_init', {value:function _init(options, propsData){
      var target = initPrivate(this);
      if( !target.initialized ){
          Vue.prototype._init.call(this,options);
          var _propsData = arguments.lenght > 1 && typeof propsData ==="object" ? propsData :  null;
          var context = options && options._parentVnode || {};
          var keys = this.$options._propKeys = [];
          var props = this[key].props;
          target.propsUpdating = false;
          target.context = options;
          target.options = context.componentOptions || {};
          target.config = context.data || {};

          const {hasTemplate, esHandle, esPrivateKey} = this.$options;
          if( hasTemplate ){
              this[esHandle||'esInstance'] = this;
              if( esPrivateKey ){
                  const descriptor = _Reflect.getDescriptor(this);
                  this[esPrivateKey] = descriptor.privateKey;
              }
          }

          this._props = {};
          if( props ){
              if( _propsData ){
                  propsData = this.$options.propsData = _propsData;
              }else {
                  propsData = this.$options.propsData || {};
              }
              this.$options.props = props;
              for(var name in props){
                  keys.push(name);
                  defineProps(this, this._props, props[name], name, propsData);
              }
          }
          var _provided = emptyObject$1;
          if( this.$parent ){
              if( this.$parent[key] ){
                  _provided = this.$parent[key].provides;
              }else {
                  _provided = this.$parent._provided;
              }
          }
          target.provides = _provided;
      }
  }});

  Object.defineProperty( proto, '_initialized', {value: function _initialized(){
      const target = this[key];
      if( !target.initialized ){
          target.initialized=true;
          if( this.hasEventListener('componentInitialized') ){
              this.dispatchEvent( new ComponentEvent( 'componentInitialized' ) );
          }
      }
      this.onInitialized();
  }});

  Object.defineProperty( proto, 'render', {value: function render(){return null}});

  Object.defineProperty( proto, 'getConfig', {value:function getConfig(){
      return this[key].config;
  }});

  Object.defineProperty( proto, 'isWebComponent', {value:true});

  Object.defineProperty( proto, 'getInitProps', {value: function getInitProps(options){
      var context = (options ? options._parentVnode : null) || {};
      var options = context.componentOptions || {};
      return Object.assign( Object.create(null), options.propsData || {});
  }});

  Object.defineProperty( proto, 'receivePropValue', {value: function receivePropValue(value,name){
      return value;
  }});

  Object.defineProperty( proto, 'beforeReceiveProp', {value: function beforeReceiveProp(value,name){
      return this[key].preventedProps[name] !== true;
  }});

  Object.defineProperty( proto, 'onInitialized', {value:function onInitialized(){}});

  Object.defineProperty( proto, 'onBeforeMount', {value:function onBeforeMount(){}});

  Object.defineProperty( proto, 'onMounted', {value:function onMounted(){}});

  Object.defineProperty( proto, 'onBeforeUpdate', {value:function onBeforeUpdate(){}});

  Object.defineProperty( proto, 'onUpdated', {value:function onUpdated(){}});

  Object.defineProperty( proto, 'onBeforeUnmount', {value:function onBeforeUnmount(){}});

  Object.defineProperty( proto, 'onUnmounted', {value:function onUnmounted(){}});

  Object.defineProperty( proto, 'onErrorCaptured', {value:function onErrorCaptured(e){}});

  Object.defineProperty( proto, 'onActivated', {value:function onActivated(){}});

  Object.defineProperty( proto, 'onDeactivated', {value:function onDeactivated(){}});

  Object.defineProperty( proto, 'provide', {value:function provide(name, provider){
      if( typeof provider !=='function' ){
          throw new Error(`Provider '${name}' must is function. give `+(typeof provider));
      }else {
          var _provided = null;
          if( this.$parent ){
              if( this.$parent[key] ){
                  _provided = this.$parent[key].provides;
              }else {
                  _provided = this.$parent._provided;
              }
          }
          if( this[key].provides === _provided ){
              this[key].provides = Object.create( this[key].provides );
          }else if( this[key].provides === emptyObject$1 ){
              this[key].provides = Object.create(null);
          }
          this[key].provides[name] = provider;
      }
  }});

  Object.defineProperty( proto, 'inject', {value:function inject(name, from, defaultValue){
      const descriptor =_Reflect.getDescriptor(this, name);
      if( !descriptor ){
          throw new Error(`Injector property '${name}' is not exists.`);
      }
      const provides = this[key].provides || emtyObject;
      let value = void 0;
      from = from || name;
      if( from in provides ){
          value = provides[from];
          if( typeof value ==='function' ){
              value = value.call(this);
          }
      }else {
          const _res = System.getProvide(from, 'global:vue:application');
          if( _res !== null ){
              value = _res;
              if( typeof value ==='function' ){
                  value = value.call(this);
              }
          }else if( defaultValue !== void 0 ){
              value = defaultValue;
          }
      }
      if( value !== void 0 ){
          value = this.receivePropValue(value, name);
          if(descriptor.type === _Reflect.MEMBERS_ACCESSOR){
              if( descriptor.set ){
                  descriptor.set.call(this,value);
              }else {
                  throw new Error(`Injector property '${name}' is readonly.`);
              }
          }else if(descriptor.type === _Reflect.MEMBERS_METHODS){
              descriptor.method.call(this, value);
          }else if( descriptor.type === _Reflect.MEMBERS_PROPERTY ){
              let target = this;
              if( descriptor.modifier === _Reflect.MODIFIER_PRIVATE ){
                  target = descriptor.dataset;
              }
              if( target ){
                  target[name] = value;
              }
          }
      }
      return value;
  }});

  Object.defineProperty( proto, 'reactive', {value:function reactive(name, value, initValue){
      var isWrite = arguments.length === 2;
      var cache = this[key];
      var states = cache.states;
      var props = cache.props;
      var _propsData = this.$options && this.$options.propsData;
      var propsData = _propsData ? _propsData : cache.options.propsData;
      var isProp = props && hasOwn$1.call(props,name);
      var isPropData = isProp && propsData && hasOwn$1.call(propsData,name);
      if( !hasOwn$1.call(states, name) ){
          initValue = arguments.length === 3 ? initValue : value;
          if( typeof initValue === "function" ){
              initValue = initValue();
          }
          Vue.util.defineReactive(states, name, value=initValue);
          cache.statePrevious[name] = value;
      }
      if( !isWrite ){
          if( cache.propsUpdating ){
              return cache.statePrevious[name];
          }
          return states[name];
      }else {
          if(!cache.propsUpdating){
              cache.preventedProps[name] = true;
          }
          if( isPropData ){
              propsData[name] = value;
          }
          cache.statePrevious[name] = value;
          states[name] = value;
          return value;
      }
  }});

  Object.defineProperty( proto, 'forceUpdate', {value:function forceUpdate(){
      this.$forceUpdate();
  }});

  Object.defineProperty( proto, 'observable', {value:function observable(object){
      return Vue.observable( object );
  }});

  function makeChildren(name, children, context){
      children = Array.isArray(children) ? children : [children];
      return children.map( child=>{
          if( typeof child ==="object" ){
              return child;
          }
          return context.createVNode('span', {slot:name}, [child]);
      })
  }

  Object.defineProperty( proto, 'slot', {value:function slot(name,scoped,args,fallback){
      if( scoped === true ){
          if( args && typeof args ==='function' ){
              fallback = args;
          }
          var value = this.$scopedSlots[name] || fallback;
          var isFun = value && typeof value === "function";
          var isArr = Array.isArray(args);
          if( args===true || isArr){
              if( isFun ){
                  return makeChildren(name, value.apply(null, isArr ? args : [] ), this );
              }
          }
          return value;
      }else if( scoped && typeof scoped ==="function" ){
          fallback = scoped;
      }
      var result = this.$slots[name];
      if( result ){
          return makeChildren(name, result, this);
      }else if( fallback ){
          return makeChildren(name, fallback(), this);
      }
      return [];
  }});

  Object.defineProperty( proto, 'element', {get:function element(){
      return this.$el;
  }});

  Object.defineProperty( proto, 'parent', {get:function parent(){
      return this.$parent;
  }});

  Object.defineProperty( proto, 'children', {get:function children(){
      return this.$children;
  }});

  Object.defineProperty( proto, 'getParentComponent', {value:function getParentComponent( filter ){
      var parent = this.$parent;
      var isFn = typeof filter === 'function';
      while( parent ){
          if( isFn ){
              if( filter( parent ) ){
                  return parent;
              }
          }else if( filter === true ){
              if(parent instanceof Component){
                  return parent;
              }
          }else {
              return parent;
          }
          parent = parent.$parent;
      }
      return null;
  }});

  Object.defineProperty( proto, 'createVNode', {value:function createVNode(name,config,children){
      return this.$createElement(name, config, children);
  }});

  Object.defineProperty( proto, 'getRefs', {value:function getRefs(name){
      return this.$refs[name];
  }});

  Object.defineProperty( proto, 'addEventListener', {value:function addEventListener(type, listener,useCapture,priority,reference){
      initPrivate(this);
      return this[key].event.addEventListener(type,listener,useCapture,priority,reference);
  }});

  Object.defineProperty( proto, 'dispatchEvent', {value:function dispatchEvent(event){
      initPrivate(this);
      return this[key].event.dispatchEvent(event);
  }});

  Object.defineProperty( proto, 'removeEventListener', {value:function removeEventListener(type, listener){
      initPrivate(this);
      return this[key].event.removeEventListener(type, listener);
  }});

  Object.defineProperty( proto, 'hasEventListener', {value:function hasEventListener(type, listener){
      initPrivate(this);
      return this[key].event.hasEventListener(type, listener);
  }});

  Object.defineProperty( proto, 'on', {value:function on(type, listener){
      return this.$on(type,listener);
  }});

  Object.defineProperty( proto, 'off', {value:function off(type, listener){
      return this.$off( type, listener);
  }});

  Object.defineProperty( proto, 'emit', {value:function emit(type){
      var args = Array.from(arguments);
      return this.$emit.apply(this, args);
  }});

  Object.defineProperty( proto, 'watch', {value:function watch(name, callback, options){
      var segs = String(name).split('.');
      var first = segs[0].trim();
      var descriptor = _Reflect.getDescriptor(this,first);
      options = options === true ? {deep:true} : options;
      if( descriptor && descriptor.isMember ){
          if( descriptor.modifier === _Reflect.MODIFIER_PRIVATE ){
              const _privateKey = descriptor.privateKey;
              name = ()=>{
                  var obj = this[_privateKey];
                  for (var i = 0; i < segs.length; i++) {
                      if (!obj) { return }
                      obj = obj[ segs[i] ];
                  }
                  return obj;
              };
          }
          const isProperty = (descriptor.type ===_Reflect.MEMBERS_ACCESSOR && descriptor.get) || (descriptor.type === _Reflect.MEMBERS_PROPERTY);
          if( !isProperty ){
              throw new Error(`Watching '${name}' is not properties.`);
          }
          return this.$watch(name, callback, options);
      }else {
          throw new Error(`Watching property '${name}' is not exists.`);
      }
  }});

  Object.defineProperty( proto, 'nextTick', {value:function nextTick(callback){
      return this.$nextTick(callback);
  }});

  Object.defineProperty( proto, 'getAttribute', {value:function getAttribute(name){
      return this['$'+name] || this[name];
  }});

  Object.defineProperty( Component, 'getAttribute', {value:function getAttribute(target,name){
      if( target instanceof Vue){
          return target['$'+name] || target[name];
      }
      return null;
  }});

  const directiveClassMaps={};
  Object.defineProperty( Component, 'resolveDirective', {value:function resolveDirective(config,context){
      if( !config )return function(){};
      var name = config.name;
      var dire = name;
      var directive = {
          name:'',
          value:config.value
      };
      if( config.modifier ){
          directive.modifiers = config.modifier;
      }
      if( config.arg ){
          directive.arg = config.arg;
      }
      if( config.directiveClass ){
          if( System.isClass( config.directiveClass ) ){
              directive.rawName = name;
              directive.name = name;
              if( hasOwn$1.call(directiveClassMaps, name) ){
                  dire = directiveClassMaps[name];
              }else {
                  const result = _Reflect.getDescriptor(config.directiveClass, 'directive');
                  if( result && result.isStatic && result.label === 'accessor' && result.get ){
                      dire = result.get.call(this);
                  }else {
                      dire = new config.directiveClass( context );
                  }
                  directiveClassMaps[name] = dire;
              }
          }else {
              const result = config.directiveClass.directive;
              if( result  ){
                  dire = result;
              }else {
                  dire = config.directiveClass;
              }
          }
          directive.def = dire;
      }else if( typeof name === "string" ){
          directive.name = name;
      }else {
          directive.def = name;
      }
      return directive;
  }});

  Object.defineProperty( Component, 'createComponent', {value:function createComponent(options){
      options = options || {};
      if( Array.isArray(options.mixins) ){
          options.mixins.push( ...mixins );
      }else {
          options.mixins = mixins;
      }
      return Vue.extend( options );
  }});

  System.registerHook('polyfills:value',function(value, property, className){
      if( property ==="size" ){
          if(value ==="large")return ''
      }
      return value;
  },-500);
  Class.creator(13,Component,{
      id:1,
      ns:"web.components",
      name:"Component"
  });

  const esPrivate = Symbol("private");
  function Skin(hostComponent){
      EventDispatcher.call(this);
      Object.defineProperty(this,esPrivate,{
          configurable:true,
          value:{
              _hostComponent:null,
              _event:null
          }
      });
      this[esPrivate]._hostComponent=hostComponent;
  }
  const members = {
      _hostComponent:{
          m:1,
          d:1,
          writable:true,
          value:null
      },
      _event:{
          m:1,
          d:1,
          writable:true,
          value:null
      },
      hostComponent:{
          m:3,
          d:4,
          enumerable:true,
          get:function hostComponent(){
              return this[esPrivate]._hostComponent;
          }
      },
      reactive:{
          m:3,
          d:3,
          value:function reactive(name,value){
              return this.hostComponent.reactive(name,value);
          }
      },
      forceUpdate:{
          m:3,
          d:3,
          value:function forceUpdate(){
              return this.hostComponent.forceUpdate();
          }
      },
      getElementByRefName:{
          m:3,
          d:3,
          value:function getElementByRefName(name){
              return this.hostComponent.getRefs(name);
          }
      },
      slot:{
          m:3,
          d:3,
          value:function slot(name,scope,called,params){
              return this.hostComponent.slot(name,scope,called,params);
          }
      },
      createElement:{
          m:3,
          d:3,
          value:function createElement(name,data,children){
              return this.hostComponent.createVNode(name,data,children);
          }
      },
      render:{
          m:3,
          d:3,
          value:function render(){
              return this.hostComponent.createVNode('div');
          }
      }
  };
  Class.creator(11,Skin,{
      id:1,
      ns:"web",
      name:"Skin",
      private:esPrivate,
      inherit:EventDispatcher,
      members:members
  });

  const MySkin = Component.createComponent({
      name:"es-MySkin",
      props:{
          name:{
              type:String
          },
          value:{
              type:String
          }
      }
  });
  const members$1 = {
      render:{
          m:3,
          d:3,
          value:function render(){
              const createElement = this.createVNode.bind(this);
              return createElement("div",null,[
                  this.name ? createElement("div",{
                      class:'bg'
                  },["1"]) : !(this.name) ? createElement("div",null,["2"]) : createElement("div",null,["399999"])
              ].concat(
                  ['china'].concat(this.list).map((item,key)=>createElement("div",null,[
                      createElement("div",null,[item]),
                      createElement("div",{
                          class:"ssss"
                      },[
                          createElement("div",null,[
                              createElement("span",null,[].concat(
                                  this.slot("default")
                              ))
                          ])
                      ])
                  ])),
                  createElement("div",{
                      ref:'iss',
                      refInFor:false,
                      class:""
                  },[
                      createElement("div",null,[
                          "item =====MySkin==== ",
                          this.name,
                          "====="
                      ])
                  ]),
                  createElement(input,{
                      attrs:{
                          value:this.value
                      },
                      on:{
                          input:(function(event){
                              this.value=event && event.target && event.target.nodeType===1 ? event.target.value : event;
                          }).bind(this),
                          change:this.onChange.bind(this)
                      },
                      directives:[{
                          name:"model",
                          value:this.value
                      }]
                  }),
                  createElement(input,{
                      attrs:{
                          value:this.value
                      }
                  }),
                  this.slot("foot",true,[this.list],(props)=>[
                      createElement("div",{
                          slot:"foot"
                      },["===============the is foot slot =============="])
                  ])
              ));
          }
      },
      name:{
          m:3,
          d:4,
          enumerable:true,
          get:function name(){
              return this.hostComponent.name;
          },
          set:function name(value){
              this.reactive('name',value);
          }
      },
      list:{
          m:3,
          d:4,
          enumerable:true,
          get:function list(){
              return ['one','two','three','four','five'];
          }
      },
      onChange:{
          m:3,
          d:3,
          value:function onChange(){}
      },
      value:{
          m:3,
          d:4,
          enumerable:true,
          get:function value(){
              return this.reactive('value') || '9999';
          },
          set:function value(val){
              this.reactive('value',val);
          }
      }
  };
  Class.creator(3,MySkin,{
      id:1,
      name:"MySkin",
      inherit:Skin,
      members:members$1
  });

  const esPrivate$1 = Symbol("private");
  const View = Component.createComponent({
      name:"es-View",
      props:{
          skinClass:{
              type:null
          }
      }
  });
  const members$2 = {
      _init:{
          m:3,
          d:3,
          value:function _init(options){
              (function(){
                  Object.defineProperty(this,esPrivate$1,{
                      configurable:true,
                      value:{
                          _skinClass:null
                      }
                  });
                  Component.prototype._init.call(this,arguments[1]);
              }).call(this,null,options);
              this._initialized();
          }
      },
      enter:{
          m:3,
          d:3,
          value:function enter(to,from){}
      },
      leave:{
          m:3,
          d:3,
          value:function leave(){}
      },
      skin:{
          m:3,
          d:4,
          enumerable:true,
          get:function skin(){
              return new this.skinClass(this);
          }
      },
      _skinClass:{
          m:1,
          d:1,
          writable:true,
          value:null
      },
      skinClass:{
          m:3,
          d:4,
          enumerable:true,
          get:function skinClass(){
              return this[esPrivate$1]._skinClass;
          },
          set:function skinClass(value){
              this[esPrivate$1]._skinClass=value;
          }
      },
      render:{
          m:3,
          d:3,
          value:function render(){
              return this.skin.render();
          }
      }
  };
  Class.creator(10,View,{
      id:1,
      ns:"web",
      name:"View",
      private:esPrivate$1,
      inherit:Component,
      members:members$2
  });

  const MyView = Component.createComponent({
      name:"es-MyView"
  });
  const members$3 = {
      test:{
          m:3,
          d:3,
          value:function test(){}
      },
      name:{
          m:3,
          d:4,
          enumerable:true,
          get:function name(){
              return '=========MyView of MySkin=============';
          }
      },
      nameMyView:{
          m:3,
          d:4,
          enumerable:true,
          get:function nameMyView(){
              return 'name';
          }
      }
  };
  Class.creator(1,MyView,{
      id:1,
      name:"MyView",
      inherit:View,
      members:members$3
  });

  /*!
    * vue-router v3.5.3
    * (c) 2021 Evan You
    * @license MIT
    */
  /*  */

  function assert (condition, message) {
    if (!condition) {
      throw new Error(("[vue-router] " + message))
    }
  }

  function warn$1 (condition, message) {
    if (!condition) {
      typeof console !== 'undefined' && console.warn(("[vue-router] " + message));
    }
  }

  function extend$1 (a, b) {
    for (var key in b) {
      a[key] = b[key];
    }
    return a
  }

  /*  */

  var encodeReserveRE = /[!'()*]/g;
  var encodeReserveReplacer = function (c) { return '%' + c.charCodeAt(0).toString(16); };
  var commaRE = /%2C/g;

  // fixed encodeURIComponent which is more conformant to RFC3986:
  // - escapes [!'()*]
  // - preserve commas
  var encode = function (str) { return encodeURIComponent(str)
      .replace(encodeReserveRE, encodeReserveReplacer)
      .replace(commaRE, ','); };

  function decode (str) {
    try {
      return decodeURIComponent(str)
    } catch (err) {
      {
        warn$1(false, ("Error decoding \"" + str + "\". Leaving it intact."));
      }
    }
    return str
  }

  function resolveQuery (
    query,
    extraQuery,
    _parseQuery
  ) {
    if ( extraQuery === void 0 ) extraQuery = {};

    var parse = _parseQuery || parseQuery;
    var parsedQuery;
    try {
      parsedQuery = parse(query || '');
    } catch (e) {
       warn$1(false, e.message);
      parsedQuery = {};
    }
    for (var key in extraQuery) {
      var value = extraQuery[key];
      parsedQuery[key] = Array.isArray(value)
        ? value.map(castQueryParamValue)
        : castQueryParamValue(value);
    }
    return parsedQuery
  }

  var castQueryParamValue = function (value) { return (value == null || typeof value === 'object' ? value : String(value)); };

  function parseQuery (query) {
    var res = {};

    query = query.trim().replace(/^(\?|#|&)/, '');

    if (!query) {
      return res
    }

    query.split('&').forEach(function (param) {
      var parts = param.replace(/\+/g, ' ').split('=');
      var key = decode(parts.shift());
      var val = parts.length > 0 ? decode(parts.join('=')) : null;

      if (res[key] === undefined) {
        res[key] = val;
      } else if (Array.isArray(res[key])) {
        res[key].push(val);
      } else {
        res[key] = [res[key], val];
      }
    });

    return res
  }

  function stringifyQuery (obj) {
    var res = obj
      ? Object.keys(obj)
        .map(function (key) {
          var val = obj[key];

          if (val === undefined) {
            return ''
          }

          if (val === null) {
            return encode(key)
          }

          if (Array.isArray(val)) {
            var result = [];
            val.forEach(function (val2) {
              if (val2 === undefined) {
                return
              }
              if (val2 === null) {
                result.push(encode(key));
              } else {
                result.push(encode(key) + '=' + encode(val2));
              }
            });
            return result.join('&')
          }

          return encode(key) + '=' + encode(val)
        })
        .filter(function (x) { return x.length > 0; })
        .join('&')
      : null;
    return res ? ("?" + res) : ''
  }

  /*  */

  var trailingSlashRE = /\/?$/;

  function createRoute (
    record,
    location,
    redirectedFrom,
    router
  ) {
    var stringifyQuery = router && router.options.stringifyQuery;

    var query = location.query || {};
    try {
      query = clone(query);
    } catch (e) {}

    var route = {
      name: location.name || (record && record.name),
      meta: (record && record.meta) || {},
      path: location.path || '/',
      hash: location.hash || '',
      query: query,
      params: location.params || {},
      fullPath: getFullPath(location, stringifyQuery),
      matched: record ? formatMatch(record) : []
    };
    if (redirectedFrom) {
      route.redirectedFrom = getFullPath(redirectedFrom, stringifyQuery);
    }
    return Object.freeze(route)
  }

  function clone (value) {
    if (Array.isArray(value)) {
      return value.map(clone)
    } else if (value && typeof value === 'object') {
      var res = {};
      for (var key in value) {
        res[key] = clone(value[key]);
      }
      return res
    } else {
      return value
    }
  }

  // the starting route that represents the initial state
  var START = createRoute(null, {
    path: '/'
  });

  function formatMatch (record) {
    var res = [];
    while (record) {
      res.unshift(record);
      record = record.parent;
    }
    return res
  }

  function getFullPath (
    ref,
    _stringifyQuery
  ) {
    var path = ref.path;
    var query = ref.query; if ( query === void 0 ) query = {};
    var hash = ref.hash; if ( hash === void 0 ) hash = '';

    var stringify = _stringifyQuery || stringifyQuery;
    return (path || '/') + stringify(query) + hash
  }

  function isSameRoute (a, b, onlyPath) {
    if (b === START) {
      return a === b
    } else if (!b) {
      return false
    } else if (a.path && b.path) {
      return a.path.replace(trailingSlashRE, '') === b.path.replace(trailingSlashRE, '') && (onlyPath ||
        a.hash === b.hash &&
        isObjectEqual(a.query, b.query))
    } else if (a.name && b.name) {
      return (
        a.name === b.name &&
        (onlyPath || (
          a.hash === b.hash &&
        isObjectEqual(a.query, b.query) &&
        isObjectEqual(a.params, b.params))
        )
      )
    } else {
      return false
    }
  }

  function isObjectEqual (a, b) {
    if ( a === void 0 ) a = {};
    if ( b === void 0 ) b = {};

    // handle null value #1566
    if (!a || !b) { return a === b }
    var aKeys = Object.keys(a).sort();
    var bKeys = Object.keys(b).sort();
    if (aKeys.length !== bKeys.length) {
      return false
    }
    return aKeys.every(function (key, i) {
      var aVal = a[key];
      var bKey = bKeys[i];
      if (bKey !== key) { return false }
      var bVal = b[key];
      // query values can be null and undefined
      if (aVal == null || bVal == null) { return aVal === bVal }
      // check nested equality
      if (typeof aVal === 'object' && typeof bVal === 'object') {
        return isObjectEqual(aVal, bVal)
      }
      return String(aVal) === String(bVal)
    })
  }

  function isIncludedRoute (current, target) {
    return (
      current.path.replace(trailingSlashRE, '/').indexOf(
        target.path.replace(trailingSlashRE, '/')
      ) === 0 &&
      (!target.hash || current.hash === target.hash) &&
      queryIncludes(current.query, target.query)
    )
  }

  function queryIncludes (current, target) {
    for (var key in target) {
      if (!(key in current)) {
        return false
      }
    }
    return true
  }

  function handleRouteEntered (route) {
    for (var i = 0; i < route.matched.length; i++) {
      var record = route.matched[i];
      for (var name in record.instances) {
        var instance = record.instances[name];
        var cbs = record.enteredCbs[name];
        if (!instance || !cbs) { continue }
        delete record.enteredCbs[name];
        for (var i$1 = 0; i$1 < cbs.length; i$1++) {
          if (!instance._isBeingDestroyed) { cbs[i$1](instance); }
        }
      }
    }
  }

  var View$1 = {
    name: 'RouterView',
    functional: true,
    props: {
      name: {
        type: String,
        default: 'default'
      }
    },
    render: function render (_, ref) {
      var props = ref.props;
      var children = ref.children;
      var parent = ref.parent;
      var data = ref.data;

      // used by devtools to display a router-view badge
      data.routerView = true;

      // directly use parent context's createElement() function
      // so that components rendered by router-view can resolve named slots
      var h = parent.$createElement;
      var name = props.name;
      var route = parent.$route;
      var cache = parent._routerViewCache || (parent._routerViewCache = {});

      // determine current view depth, also check to see if the tree
      // has been toggled inactive but kept-alive.
      var depth = 0;
      var inactive = false;
      while (parent && parent._routerRoot !== parent) {
        var vnodeData = parent.$vnode ? parent.$vnode.data : {};
        if (vnodeData.routerView) {
          depth++;
        }
        if (vnodeData.keepAlive && parent._directInactive && parent._inactive) {
          inactive = true;
        }
        parent = parent.$parent;
      }
      data.routerViewDepth = depth;

      // render previous view if the tree is inactive and kept-alive
      if (inactive) {
        var cachedData = cache[name];
        var cachedComponent = cachedData && cachedData.component;
        if (cachedComponent) {
          // #2301
          // pass props
          if (cachedData.configProps) {
            fillPropsinData(cachedComponent, data, cachedData.route, cachedData.configProps);
          }
          return h(cachedComponent, data, children)
        } else {
          // render previous empty view
          return h()
        }
      }

      var matched = route.matched[depth];
      var component = matched && matched.components[name];

      // render empty node if no matched route or no config component
      if (!matched || !component) {
        cache[name] = null;
        return h()
      }

      // cache component
      cache[name] = { component: component };

      // attach instance registration hook
      // this will be called in the instance's injected lifecycle hooks
      data.registerRouteInstance = function (vm, val) {
        // val could be undefined for unregistration
        var current = matched.instances[name];
        if (
          (val && current !== vm) ||
          (!val && current === vm)
        ) {
          matched.instances[name] = val;
        }
      }

      // also register instance in prepatch hook
      // in case the same component instance is reused across different routes
      ;(data.hook || (data.hook = {})).prepatch = function (_, vnode) {
        matched.instances[name] = vnode.componentInstance;
      };

      // register instance in init hook
      // in case kept-alive component be actived when routes changed
      data.hook.init = function (vnode) {
        if (vnode.data.keepAlive &&
          vnode.componentInstance &&
          vnode.componentInstance !== matched.instances[name]
        ) {
          matched.instances[name] = vnode.componentInstance;
        }

        // if the route transition has already been confirmed then we weren't
        // able to call the cbs during confirmation as the component was not
        // registered yet, so we call it here.
        handleRouteEntered(route);
      };

      var configProps = matched.props && matched.props[name];
      // save route and configProps in cache
      if (configProps) {
        extend$1(cache[name], {
          route: route,
          configProps: configProps
        });
        fillPropsinData(component, data, route, configProps);
      }

      return h(component, data, children)
    }
  };

  function fillPropsinData (component, data, route, configProps) {
    // resolve props
    var propsToPass = data.props = resolveProps(route, configProps);
    if (propsToPass) {
      // clone to prevent mutation
      propsToPass = data.props = extend$1({}, propsToPass);
      // pass non-declared props as attrs
      var attrs = data.attrs = data.attrs || {};
      for (var key in propsToPass) {
        if (!component.props || !(key in component.props)) {
          attrs[key] = propsToPass[key];
          delete propsToPass[key];
        }
      }
    }
  }

  function resolveProps (route, config) {
    switch (typeof config) {
      case 'undefined':
        return
      case 'object':
        return config
      case 'function':
        return config(route)
      case 'boolean':
        return config ? route.params : undefined
      default:
        {
          warn$1(
            false,
            "props in \"" + (route.path) + "\" is a " + (typeof config) + ", " +
            "expecting an object, function or boolean."
          );
        }
    }
  }

  /*  */

  function resolvePath (
    relative,
    base,
    append
  ) {
    var firstChar = relative.charAt(0);
    if (firstChar === '/') {
      return relative
    }

    if (firstChar === '?' || firstChar === '#') {
      return base + relative
    }

    var stack = base.split('/');

    // remove trailing segment if:
    // - not appending
    // - appending to trailing slash (last segment is empty)
    if (!append || !stack[stack.length - 1]) {
      stack.pop();
    }

    // resolve relative path
    var segments = relative.replace(/^\//, '').split('/');
    for (var i = 0; i < segments.length; i++) {
      var segment = segments[i];
      if (segment === '..') {
        stack.pop();
      } else if (segment !== '.') {
        stack.push(segment);
      }
    }

    // ensure leading slash
    if (stack[0] !== '') {
      stack.unshift('');
    }

    return stack.join('/')
  }

  function parsePath$1 (path) {
    var hash = '';
    var query = '';

    var hashIndex = path.indexOf('#');
    if (hashIndex >= 0) {
      hash = path.slice(hashIndex);
      path = path.slice(0, hashIndex);
    }

    var queryIndex = path.indexOf('?');
    if (queryIndex >= 0) {
      query = path.slice(queryIndex + 1);
      path = path.slice(0, queryIndex);
    }

    return {
      path: path,
      query: query,
      hash: hash
    }
  }

  function cleanPath (path) {
    return path.replace(/\/+/g, '/')
  }

  var isarray = Array.isArray || function (arr) {
    return Object.prototype.toString.call(arr) == '[object Array]';
  };

  /**
   * Expose `pathToRegexp`.
   */
  var pathToRegexp_1 = pathToRegexp;
  var parse_1 = parse;
  var compile_1 = compile;
  var tokensToFunction_1 = tokensToFunction;
  var tokensToRegExp_1 = tokensToRegExp;

  /**
   * The main path matching regexp utility.
   *
   * @type {RegExp}
   */
  var PATH_REGEXP = new RegExp([
    // Match escaped characters that would otherwise appear in future matches.
    // This allows the user to escape special characters that won't transform.
    '(\\\\.)',
    // Match Express-style parameters and un-named parameters with a prefix
    // and optional suffixes. Matches appear as:
    //
    // "/:test(\\d+)?" => ["/", "test", "\d+", undefined, "?", undefined]
    // "/route(\\d+)"  => [undefined, undefined, undefined, "\d+", undefined, undefined]
    // "/*"            => ["/", undefined, undefined, undefined, undefined, "*"]
    '([\\/.])?(?:(?:\\:(\\w+)(?:\\(((?:\\\\.|[^\\\\()])+)\\))?|\\(((?:\\\\.|[^\\\\()])+)\\))([+*?])?|(\\*))'
  ].join('|'), 'g');

  /**
   * Parse a string for the raw tokens.
   *
   * @param  {string}  str
   * @param  {Object=} options
   * @return {!Array}
   */
  function parse (str, options) {
    var tokens = [];
    var key = 0;
    var index = 0;
    var path = '';
    var defaultDelimiter = options && options.delimiter || '/';
    var res;

    while ((res = PATH_REGEXP.exec(str)) != null) {
      var m = res[0];
      var escaped = res[1];
      var offset = res.index;
      path += str.slice(index, offset);
      index = offset + m.length;

      // Ignore already escaped sequences.
      if (escaped) {
        path += escaped[1];
        continue
      }

      var next = str[index];
      var prefix = res[2];
      var name = res[3];
      var capture = res[4];
      var group = res[5];
      var modifier = res[6];
      var asterisk = res[7];

      // Push the current path onto the tokens.
      if (path) {
        tokens.push(path);
        path = '';
      }

      var partial = prefix != null && next != null && next !== prefix;
      var repeat = modifier === '+' || modifier === '*';
      var optional = modifier === '?' || modifier === '*';
      var delimiter = res[2] || defaultDelimiter;
      var pattern = capture || group;

      tokens.push({
        name: name || key++,
        prefix: prefix || '',
        delimiter: delimiter,
        optional: optional,
        repeat: repeat,
        partial: partial,
        asterisk: !!asterisk,
        pattern: pattern ? escapeGroup(pattern) : (asterisk ? '.*' : '[^' + escapeString(delimiter) + ']+?')
      });
    }

    // Match any characters still remaining.
    if (index < str.length) {
      path += str.substr(index);
    }

    // If the path exists, push it onto the end.
    if (path) {
      tokens.push(path);
    }

    return tokens
  }

  /**
   * Compile a string to a template function for the path.
   *
   * @param  {string}             str
   * @param  {Object=}            options
   * @return {!function(Object=, Object=)}
   */
  function compile (str, options) {
    return tokensToFunction(parse(str, options), options)
  }

  /**
   * Prettier encoding of URI path segments.
   *
   * @param  {string}
   * @return {string}
   */
  function encodeURIComponentPretty (str) {
    return encodeURI(str).replace(/[\/?#]/g, function (c) {
      return '%' + c.charCodeAt(0).toString(16).toUpperCase()
    })
  }

  /**
   * Encode the asterisk parameter. Similar to `pretty`, but allows slashes.
   *
   * @param  {string}
   * @return {string}
   */
  function encodeAsterisk (str) {
    return encodeURI(str).replace(/[?#]/g, function (c) {
      return '%' + c.charCodeAt(0).toString(16).toUpperCase()
    })
  }

  /**
   * Expose a method for transforming tokens into the path function.
   */
  function tokensToFunction (tokens, options) {
    // Compile all the tokens into regexps.
    var matches = new Array(tokens.length);

    // Compile all the patterns before compilation.
    for (var i = 0; i < tokens.length; i++) {
      if (typeof tokens[i] === 'object') {
        matches[i] = new RegExp('^(?:' + tokens[i].pattern + ')$', flags(options));
      }
    }

    return function (obj, opts) {
      var path = '';
      var data = obj || {};
      var options = opts || {};
      var encode = options.pretty ? encodeURIComponentPretty : encodeURIComponent;

      for (var i = 0; i < tokens.length; i++) {
        var token = tokens[i];

        if (typeof token === 'string') {
          path += token;

          continue
        }

        var value = data[token.name];
        var segment;

        if (value == null) {
          if (token.optional) {
            // Prepend partial segment prefixes.
            if (token.partial) {
              path += token.prefix;
            }

            continue
          } else {
            throw new TypeError('Expected "' + token.name + '" to be defined')
          }
        }

        if (isarray(value)) {
          if (!token.repeat) {
            throw new TypeError('Expected "' + token.name + '" to not repeat, but received `' + JSON.stringify(value) + '`')
          }

          if (value.length === 0) {
            if (token.optional) {
              continue
            } else {
              throw new TypeError('Expected "' + token.name + '" to not be empty')
            }
          }

          for (var j = 0; j < value.length; j++) {
            segment = encode(value[j]);

            if (!matches[i].test(segment)) {
              throw new TypeError('Expected all "' + token.name + '" to match "' + token.pattern + '", but received `' + JSON.stringify(segment) + '`')
            }

            path += (j === 0 ? token.prefix : token.delimiter) + segment;
          }

          continue
        }

        segment = token.asterisk ? encodeAsterisk(value) : encode(value);

        if (!matches[i].test(segment)) {
          throw new TypeError('Expected "' + token.name + '" to match "' + token.pattern + '", but received "' + segment + '"')
        }

        path += token.prefix + segment;
      }

      return path
    }
  }

  /**
   * Escape a regular expression string.
   *
   * @param  {string} str
   * @return {string}
   */
  function escapeString (str) {
    return str.replace(/([.+*?=^!:${}()[\]|\/\\])/g, '\\$1')
  }

  /**
   * Escape the capturing group by escaping special characters and meaning.
   *
   * @param  {string} group
   * @return {string}
   */
  function escapeGroup (group) {
    return group.replace(/([=!:$\/()])/g, '\\$1')
  }

  /**
   * Attach the keys as a property of the regexp.
   *
   * @param  {!RegExp} re
   * @param  {Array}   keys
   * @return {!RegExp}
   */
  function attachKeys (re, keys) {
    re.keys = keys;
    return re
  }

  /**
   * Get the flags for a regexp from the options.
   *
   * @param  {Object} options
   * @return {string}
   */
  function flags (options) {
    return options && options.sensitive ? '' : 'i'
  }

  /**
   * Pull out keys from a regexp.
   *
   * @param  {!RegExp} path
   * @param  {!Array}  keys
   * @return {!RegExp}
   */
  function regexpToRegexp (path, keys) {
    // Use a negative lookahead to match only capturing groups.
    var groups = path.source.match(/\((?!\?)/g);

    if (groups) {
      for (var i = 0; i < groups.length; i++) {
        keys.push({
          name: i,
          prefix: null,
          delimiter: null,
          optional: false,
          repeat: false,
          partial: false,
          asterisk: false,
          pattern: null
        });
      }
    }

    return attachKeys(path, keys)
  }

  /**
   * Transform an array into a regexp.
   *
   * @param  {!Array}  path
   * @param  {Array}   keys
   * @param  {!Object} options
   * @return {!RegExp}
   */
  function arrayToRegexp (path, keys, options) {
    var parts = [];

    for (var i = 0; i < path.length; i++) {
      parts.push(pathToRegexp(path[i], keys, options).source);
    }

    var regexp = new RegExp('(?:' + parts.join('|') + ')', flags(options));

    return attachKeys(regexp, keys)
  }

  /**
   * Create a path regexp from string input.
   *
   * @param  {string}  path
   * @param  {!Array}  keys
   * @param  {!Object} options
   * @return {!RegExp}
   */
  function stringToRegexp (path, keys, options) {
    return tokensToRegExp(parse(path, options), keys, options)
  }

  /**
   * Expose a function for taking tokens and returning a RegExp.
   *
   * @param  {!Array}          tokens
   * @param  {(Array|Object)=} keys
   * @param  {Object=}         options
   * @return {!RegExp}
   */
  function tokensToRegExp (tokens, keys, options) {
    if (!isarray(keys)) {
      options = /** @type {!Object} */ (keys || options);
      keys = [];
    }

    options = options || {};

    var strict = options.strict;
    var end = options.end !== false;
    var route = '';

    // Iterate over the tokens and create our regexp string.
    for (var i = 0; i < tokens.length; i++) {
      var token = tokens[i];

      if (typeof token === 'string') {
        route += escapeString(token);
      } else {
        var prefix = escapeString(token.prefix);
        var capture = '(?:' + token.pattern + ')';

        keys.push(token);

        if (token.repeat) {
          capture += '(?:' + prefix + capture + ')*';
        }

        if (token.optional) {
          if (!token.partial) {
            capture = '(?:' + prefix + '(' + capture + '))?';
          } else {
            capture = prefix + '(' + capture + ')?';
          }
        } else {
          capture = prefix + '(' + capture + ')';
        }

        route += capture;
      }
    }

    var delimiter = escapeString(options.delimiter || '/');
    var endsWithDelimiter = route.slice(-delimiter.length) === delimiter;

    // In non-strict mode we allow a slash at the end of match. If the path to
    // match already ends with a slash, we remove it for consistency. The slash
    // is valid at the end of a path match, not in the middle. This is important
    // in non-ending mode, where "/test/" shouldn't match "/test//route".
    if (!strict) {
      route = (endsWithDelimiter ? route.slice(0, -delimiter.length) : route) + '(?:' + delimiter + '(?=$))?';
    }

    if (end) {
      route += '$';
    } else {
      // In non-ending mode, we need the capturing groups to match as much as
      // possible by using a positive lookahead to the end or next path segment.
      route += strict && endsWithDelimiter ? '' : '(?=' + delimiter + '|$)';
    }

    return attachKeys(new RegExp('^' + route, flags(options)), keys)
  }

  /**
   * Normalize the given path string, returning a regular expression.
   *
   * An empty array can be passed in for the keys, which will hold the
   * placeholder key descriptions. For example, using `/user/:id`, `keys` will
   * contain `[{ name: 'id', delimiter: '/', optional: false, repeat: false }]`.
   *
   * @param  {(string|RegExp|Array)} path
   * @param  {(Array|Object)=}       keys
   * @param  {Object=}               options
   * @return {!RegExp}
   */
  function pathToRegexp (path, keys, options) {
    if (!isarray(keys)) {
      options = /** @type {!Object} */ (keys || options);
      keys = [];
    }

    options = options || {};

    if (path instanceof RegExp) {
      return regexpToRegexp(path, /** @type {!Array} */ (keys))
    }

    if (isarray(path)) {
      return arrayToRegexp(/** @type {!Array} */ (path), /** @type {!Array} */ (keys), options)
    }

    return stringToRegexp(/** @type {string} */ (path), /** @type {!Array} */ (keys), options)
  }
  pathToRegexp_1.parse = parse_1;
  pathToRegexp_1.compile = compile_1;
  pathToRegexp_1.tokensToFunction = tokensToFunction_1;
  pathToRegexp_1.tokensToRegExp = tokensToRegExp_1;

  /*  */

  // $flow-disable-line
  var regexpCompileCache = Object.create(null);

  function fillParams (
    path,
    params,
    routeMsg
  ) {
    params = params || {};
    try {
      var filler =
        regexpCompileCache[path] ||
        (regexpCompileCache[path] = pathToRegexp_1.compile(path));

      // Fix #2505 resolving asterisk routes { name: 'not-found', params: { pathMatch: '/not-found' }}
      // and fix #3106 so that you can work with location descriptor object having params.pathMatch equal to empty string
      if (typeof params.pathMatch === 'string') { params[0] = params.pathMatch; }

      return filler(params, { pretty: true })
    } catch (e) {
      {
        // Fix #3072 no warn if `pathMatch` is string
        warn$1(typeof params.pathMatch === 'string', ("missing param for " + routeMsg + ": " + (e.message)));
      }
      return ''
    } finally {
      // delete the 0 if it was added
      delete params[0];
    }
  }

  /*  */

  function normalizeLocation (
    raw,
    current,
    append,
    router
  ) {
    var next = typeof raw === 'string' ? { path: raw } : raw;
    // named target
    if (next._normalized) {
      return next
    } else if (next.name) {
      next = extend$1({}, raw);
      var params = next.params;
      if (params && typeof params === 'object') {
        next.params = extend$1({}, params);
      }
      return next
    }

    // relative params
    if (!next.path && next.params && current) {
      next = extend$1({}, next);
      next._normalized = true;
      var params$1 = extend$1(extend$1({}, current.params), next.params);
      if (current.name) {
        next.name = current.name;
        next.params = params$1;
      } else if (current.matched.length) {
        var rawPath = current.matched[current.matched.length - 1].path;
        next.path = fillParams(rawPath, params$1, ("path " + (current.path)));
      } else {
        warn$1(false, "relative params navigation requires a current route.");
      }
      return next
    }

    var parsedPath = parsePath$1(next.path || '');
    var basePath = (current && current.path) || '/';
    var path = parsedPath.path
      ? resolvePath(parsedPath.path, basePath, append || next.append)
      : basePath;

    var query = resolveQuery(
      parsedPath.query,
      next.query,
      router && router.options.parseQuery
    );

    var hash = next.hash || parsedPath.hash;
    if (hash && hash.charAt(0) !== '#') {
      hash = "#" + hash;
    }

    return {
      _normalized: true,
      path: path,
      query: query,
      hash: hash
    }
  }

  /*  */

  // work around weird flow bug
  var toTypes = [String, Object];
  var eventTypes = [String, Array];

  var noop$1 = function () {};

  var warnedCustomSlot;
  var warnedTagProp;
  var warnedEventProp;

  var Link = {
    name: 'RouterLink',
    props: {
      to: {
        type: toTypes,
        required: true
      },
      tag: {
        type: String,
        default: 'a'
      },
      custom: Boolean,
      exact: Boolean,
      exactPath: Boolean,
      append: Boolean,
      replace: Boolean,
      activeClass: String,
      exactActiveClass: String,
      ariaCurrentValue: {
        type: String,
        default: 'page'
      },
      event: {
        type: eventTypes,
        default: 'click'
      }
    },
    render: function render (h) {
      var this$1 = this;

      var router = this.$router;
      var current = this.$route;
      var ref = router.resolve(
        this.to,
        current,
        this.append
      );
      var location = ref.location;
      var route = ref.route;
      var href = ref.href;

      var classes = {};
      var globalActiveClass = router.options.linkActiveClass;
      var globalExactActiveClass = router.options.linkExactActiveClass;
      // Support global empty active class
      var activeClassFallback =
        globalActiveClass == null ? 'router-link-active' : globalActiveClass;
      var exactActiveClassFallback =
        globalExactActiveClass == null
          ? 'router-link-exact-active'
          : globalExactActiveClass;
      var activeClass =
        this.activeClass == null ? activeClassFallback : this.activeClass;
      var exactActiveClass =
        this.exactActiveClass == null
          ? exactActiveClassFallback
          : this.exactActiveClass;

      var compareTarget = route.redirectedFrom
        ? createRoute(null, normalizeLocation(route.redirectedFrom), null, router)
        : route;

      classes[exactActiveClass] = isSameRoute(current, compareTarget, this.exactPath);
      classes[activeClass] = this.exact || this.exactPath
        ? classes[exactActiveClass]
        : isIncludedRoute(current, compareTarget);

      var ariaCurrentValue = classes[exactActiveClass] ? this.ariaCurrentValue : null;

      var handler = function (e) {
        if (guardEvent(e)) {
          if (this$1.replace) {
            router.replace(location, noop$1);
          } else {
            router.push(location, noop$1);
          }
        }
      };

      var on = { click: guardEvent };
      if (Array.isArray(this.event)) {
        this.event.forEach(function (e) {
          on[e] = handler;
        });
      } else {
        on[this.event] = handler;
      }

      var data = { class: classes };

      var scopedSlot =
        !this.$scopedSlots.$hasNormal &&
        this.$scopedSlots.default &&
        this.$scopedSlots.default({
          href: href,
          route: route,
          navigate: handler,
          isActive: classes[activeClass],
          isExactActive: classes[exactActiveClass]
        });

      if (scopedSlot) {
        if ( !this.custom) {
          !warnedCustomSlot && warn$1(false, 'In Vue Router 4, the v-slot API will by default wrap its content with an <a> element. Use the custom prop to remove this warning:\n<router-link v-slot="{ navigate, href }" custom></router-link>\n');
          warnedCustomSlot = true;
        }
        if (scopedSlot.length === 1) {
          return scopedSlot[0]
        } else if (scopedSlot.length > 1 || !scopedSlot.length) {
          {
            warn$1(
              false,
              ("<router-link> with to=\"" + (this.to) + "\" is trying to use a scoped slot but it didn't provide exactly one child. Wrapping the content with a span element.")
            );
          }
          return scopedSlot.length === 0 ? h() : h('span', {}, scopedSlot)
        }
      }

      {
        if ('tag' in this.$options.propsData && !warnedTagProp) {
          warn$1(
            false,
            "<router-link>'s tag prop is deprecated and has been removed in Vue Router 4. Use the v-slot API to remove this warning: https://next.router.vuejs.org/guide/migration/#removal-of-event-and-tag-props-in-router-link."
          );
          warnedTagProp = true;
        }
        if ('event' in this.$options.propsData && !warnedEventProp) {
          warn$1(
            false,
            "<router-link>'s event prop is deprecated and has been removed in Vue Router 4. Use the v-slot API to remove this warning: https://next.router.vuejs.org/guide/migration/#removal-of-event-and-tag-props-in-router-link."
          );
          warnedEventProp = true;
        }
      }

      if (this.tag === 'a') {
        data.on = on;
        data.attrs = { href: href, 'aria-current': ariaCurrentValue };
      } else {
        // find the first <a> child and apply listener and href
        var a = findAnchor(this.$slots.default);
        if (a) {
          // in case the <a> is a static node
          a.isStatic = false;
          var aData = (a.data = extend$1({}, a.data));
          aData.on = aData.on || {};
          // transform existing events in both objects into arrays so we can push later
          for (var event in aData.on) {
            var handler$1 = aData.on[event];
            if (event in on) {
              aData.on[event] = Array.isArray(handler$1) ? handler$1 : [handler$1];
            }
          }
          // append new listeners for router-link
          for (var event$1 in on) {
            if (event$1 in aData.on) {
              // on[event] is always a function
              aData.on[event$1].push(on[event$1]);
            } else {
              aData.on[event$1] = handler;
            }
          }

          var aAttrs = (a.data.attrs = extend$1({}, a.data.attrs));
          aAttrs.href = href;
          aAttrs['aria-current'] = ariaCurrentValue;
        } else {
          // doesn't have <a> child, apply listener to self
          data.on = on;
        }
      }

      return h(this.tag, data, this.$slots.default)
    }
  };

  function guardEvent (e) {
    // don't redirect with control keys
    if (e.metaKey || e.altKey || e.ctrlKey || e.shiftKey) { return }
    // don't redirect when preventDefault called
    if (e.defaultPrevented) { return }
    // don't redirect on right click
    if (e.button !== undefined && e.button !== 0) { return }
    // don't redirect if `target="_blank"`
    if (e.currentTarget && e.currentTarget.getAttribute) {
      var target = e.currentTarget.getAttribute('target');
      if (/\b_blank\b/i.test(target)) { return }
    }
    // this may be a Weex event which doesn't have this method
    if (e.preventDefault) {
      e.preventDefault();
    }
    return true
  }

  function findAnchor (children) {
    if (children) {
      var child;
      for (var i = 0; i < children.length; i++) {
        child = children[i];
        if (child.tag === 'a') {
          return child
        }
        if (child.children && (child = findAnchor(child.children))) {
          return child
        }
      }
    }
  }

  var _Vue;

  function install (Vue) {
    if (install.installed && _Vue === Vue) { return }
    install.installed = true;

    _Vue = Vue;

    var isDef = function (v) { return v !== undefined; };

    var registerInstance = function (vm, callVal) {
      var i = vm.$options._parentVnode;
      if (isDef(i) && isDef(i = i.data) && isDef(i = i.registerRouteInstance)) {
        i(vm, callVal);
      }
    };

    Vue.mixin({
      beforeCreate: function beforeCreate () {
        if (isDef(this.$options.router)) {
          this._routerRoot = this;
          this._router = this.$options.router;
          this._router.init(this);
          Vue.util.defineReactive(this, '_route', this._router.history.current);
        } else {
          this._routerRoot = (this.$parent && this.$parent._routerRoot) || this;
        }
        registerInstance(this, this);
      },
      destroyed: function destroyed () {
        registerInstance(this);
      }
    });

    Object.defineProperty(Vue.prototype, '$router', {
      get: function get () { return this._routerRoot._router }
    });

    Object.defineProperty(Vue.prototype, '$route', {
      get: function get () { return this._routerRoot._route }
    });

    Vue.component('RouterView', View$1);
    Vue.component('RouterLink', Link);

    var strats = Vue.config.optionMergeStrategies;
    // use the same hook merging strategy for route hooks
    strats.beforeRouteEnter = strats.beforeRouteLeave = strats.beforeRouteUpdate = strats.created;
  }

  /*  */

  var inBrowser$1 = typeof window !== 'undefined';

  /*  */

  function createRouteMap (
    routes,
    oldPathList,
    oldPathMap,
    oldNameMap,
    parentRoute
  ) {
    // the path list is used to control path matching priority
    var pathList = oldPathList || [];
    // $flow-disable-line
    var pathMap = oldPathMap || Object.create(null);
    // $flow-disable-line
    var nameMap = oldNameMap || Object.create(null);

    routes.forEach(function (route) {
      addRouteRecord(pathList, pathMap, nameMap, route, parentRoute);
    });

    // ensure wildcard routes are always at the end
    for (var i = 0, l = pathList.length; i < l; i++) {
      if (pathList[i] === '*') {
        pathList.push(pathList.splice(i, 1)[0]);
        l--;
        i--;
      }
    }

    {
      // warn if routes do not include leading slashes
      var found = pathList
      // check for missing leading slash
        .filter(function (path) { return path && path.charAt(0) !== '*' && path.charAt(0) !== '/'; });

      if (found.length > 0) {
        var pathNames = found.map(function (path) { return ("- " + path); }).join('\n');
        warn$1(false, ("Non-nested routes must include a leading slash character. Fix the following routes: \n" + pathNames));
      }
    }

    return {
      pathList: pathList,
      pathMap: pathMap,
      nameMap: nameMap
    }
  }

  function addRouteRecord (
    pathList,
    pathMap,
    nameMap,
    route,
    parent,
    matchAs
  ) {
    var path = route.path;
    var name = route.name;
    {
      assert(path != null, "\"path\" is required in a route configuration.");
      assert(
        typeof route.component !== 'string',
        "route config \"component\" for path: " + (String(
          path || name
        )) + " cannot be a " + "string id. Use an actual component instead."
      );

      warn$1(
        // eslint-disable-next-line no-control-regex
        !/[^\u0000-\u007F]+/.test(path),
        "Route with path \"" + path + "\" contains unencoded characters, make sure " +
          "your path is correctly encoded before passing it to the router. Use " +
          "encodeURI to encode static segments of your path."
      );
    }

    var pathToRegexpOptions =
      route.pathToRegexpOptions || {};
    var normalizedPath = normalizePath(path, parent, pathToRegexpOptions.strict);

    if (typeof route.caseSensitive === 'boolean') {
      pathToRegexpOptions.sensitive = route.caseSensitive;
    }

    var record = {
      path: normalizedPath,
      regex: compileRouteRegex(normalizedPath, pathToRegexpOptions),
      components: route.components || { default: route.component },
      alias: route.alias
        ? typeof route.alias === 'string'
          ? [route.alias]
          : route.alias
        : [],
      instances: {},
      enteredCbs: {},
      name: name,
      parent: parent,
      matchAs: matchAs,
      redirect: route.redirect,
      beforeEnter: route.beforeEnter,
      meta: route.meta || {},
      props:
        route.props == null
          ? {}
          : route.components
            ? route.props
            : { default: route.props }
    };

    if (route.children) {
      // Warn if route is named, does not redirect and has a default child route.
      // If users navigate to this route by name, the default child will
      // not be rendered (GH Issue #629)
      {
        if (
          route.name &&
          !route.redirect &&
          route.children.some(function (child) { return /^\/?$/.test(child.path); })
        ) {
          warn$1(
            false,
            "Named Route '" + (route.name) + "' has a default child route. " +
              "When navigating to this named route (:to=\"{name: '" + (route.name) + "'\"), " +
              "the default child route will not be rendered. Remove the name from " +
              "this route and use the name of the default child route for named " +
              "links instead."
          );
        }
      }
      route.children.forEach(function (child) {
        var childMatchAs = matchAs
          ? cleanPath((matchAs + "/" + (child.path)))
          : undefined;
        addRouteRecord(pathList, pathMap, nameMap, child, record, childMatchAs);
      });
    }

    if (!pathMap[record.path]) {
      pathList.push(record.path);
      pathMap[record.path] = record;
    }

    if (route.alias !== undefined) {
      var aliases = Array.isArray(route.alias) ? route.alias : [route.alias];
      for (var i = 0; i < aliases.length; ++i) {
        var alias = aliases[i];
        if ( alias === path) {
          warn$1(
            false,
            ("Found an alias with the same value as the path: \"" + path + "\". You have to remove that alias. It will be ignored in development.")
          );
          // skip in dev to make it work
          continue
        }

        var aliasRoute = {
          path: alias,
          children: route.children
        };
        addRouteRecord(
          pathList,
          pathMap,
          nameMap,
          aliasRoute,
          parent,
          record.path || '/' // matchAs
        );
      }
    }

    if (name) {
      if (!nameMap[name]) {
        nameMap[name] = record;
      } else if ( !matchAs) {
        warn$1(
          false,
          "Duplicate named routes definition: " +
            "{ name: \"" + name + "\", path: \"" + (record.path) + "\" }"
        );
      }
    }
  }

  function compileRouteRegex (
    path,
    pathToRegexpOptions
  ) {
    var regex = pathToRegexp_1(path, [], pathToRegexpOptions);
    {
      var keys = Object.create(null);
      regex.keys.forEach(function (key) {
        warn$1(
          !keys[key.name],
          ("Duplicate param keys in route with path: \"" + path + "\"")
        );
        keys[key.name] = true;
      });
    }
    return regex
  }

  function normalizePath (
    path,
    parent,
    strict
  ) {
    if (!strict) { path = path.replace(/\/$/, ''); }
    if (path[0] === '/') { return path }
    if (parent == null) { return path }
    return cleanPath(((parent.path) + "/" + path))
  }

  /*  */



  function createMatcher (
    routes,
    router
  ) {
    var ref = createRouteMap(routes);
    var pathList = ref.pathList;
    var pathMap = ref.pathMap;
    var nameMap = ref.nameMap;

    function addRoutes (routes) {
      createRouteMap(routes, pathList, pathMap, nameMap);
    }

    function addRoute (parentOrRoute, route) {
      var parent = (typeof parentOrRoute !== 'object') ? nameMap[parentOrRoute] : undefined;
      // $flow-disable-line
      createRouteMap([route || parentOrRoute], pathList, pathMap, nameMap, parent);

      // add aliases of parent
      if (parent && parent.alias.length) {
        createRouteMap(
          // $flow-disable-line route is defined if parent is
          parent.alias.map(function (alias) { return ({ path: alias, children: [route] }); }),
          pathList,
          pathMap,
          nameMap,
          parent
        );
      }
    }

    function getRoutes () {
      return pathList.map(function (path) { return pathMap[path]; })
    }

    function match (
      raw,
      currentRoute,
      redirectedFrom
    ) {
      var location = normalizeLocation(raw, currentRoute, false, router);
      var name = location.name;

      if (name) {
        var record = nameMap[name];
        {
          warn$1(record, ("Route with name '" + name + "' does not exist"));
        }
        if (!record) { return _createRoute(null, location) }
        var paramNames = record.regex.keys
          .filter(function (key) { return !key.optional; })
          .map(function (key) { return key.name; });

        if (typeof location.params !== 'object') {
          location.params = {};
        }

        if (currentRoute && typeof currentRoute.params === 'object') {
          for (var key in currentRoute.params) {
            if (!(key in location.params) && paramNames.indexOf(key) > -1) {
              location.params[key] = currentRoute.params[key];
            }
          }
        }

        location.path = fillParams(record.path, location.params, ("named route \"" + name + "\""));
        return _createRoute(record, location, redirectedFrom)
      } else if (location.path) {
        location.params = {};
        for (var i = 0; i < pathList.length; i++) {
          var path = pathList[i];
          var record$1 = pathMap[path];
          if (matchRoute(record$1.regex, location.path, location.params)) {
            return _createRoute(record$1, location, redirectedFrom)
          }
        }
      }
      // no match
      return _createRoute(null, location)
    }

    function redirect (
      record,
      location
    ) {
      var originalRedirect = record.redirect;
      var redirect = typeof originalRedirect === 'function'
        ? originalRedirect(createRoute(record, location, null, router))
        : originalRedirect;

      if (typeof redirect === 'string') {
        redirect = { path: redirect };
      }

      if (!redirect || typeof redirect !== 'object') {
        {
          warn$1(
            false, ("invalid redirect option: " + (JSON.stringify(redirect)))
          );
        }
        return _createRoute(null, location)
      }

      var re = redirect;
      var name = re.name;
      var path = re.path;
      var query = location.query;
      var hash = location.hash;
      var params = location.params;
      query = re.hasOwnProperty('query') ? re.query : query;
      hash = re.hasOwnProperty('hash') ? re.hash : hash;
      params = re.hasOwnProperty('params') ? re.params : params;

      if (name) {
        // resolved named direct
        var targetRecord = nameMap[name];
        {
          assert(targetRecord, ("redirect failed: named route \"" + name + "\" not found."));
        }
        return match({
          _normalized: true,
          name: name,
          query: query,
          hash: hash,
          params: params
        }, undefined, location)
      } else if (path) {
        // 1. resolve relative redirect
        var rawPath = resolveRecordPath(path, record);
        // 2. resolve params
        var resolvedPath = fillParams(rawPath, params, ("redirect route with path \"" + rawPath + "\""));
        // 3. rematch with existing query and hash
        return match({
          _normalized: true,
          path: resolvedPath,
          query: query,
          hash: hash
        }, undefined, location)
      } else {
        {
          warn$1(false, ("invalid redirect option: " + (JSON.stringify(redirect))));
        }
        return _createRoute(null, location)
      }
    }

    function alias (
      record,
      location,
      matchAs
    ) {
      var aliasedPath = fillParams(matchAs, location.params, ("aliased route with path \"" + matchAs + "\""));
      var aliasedMatch = match({
        _normalized: true,
        path: aliasedPath
      });
      if (aliasedMatch) {
        var matched = aliasedMatch.matched;
        var aliasedRecord = matched[matched.length - 1];
        location.params = aliasedMatch.params;
        return _createRoute(aliasedRecord, location)
      }
      return _createRoute(null, location)
    }

    function _createRoute (
      record,
      location,
      redirectedFrom
    ) {
      if (record && record.redirect) {
        return redirect(record, redirectedFrom || location)
      }
      if (record && record.matchAs) {
        return alias(record, location, record.matchAs)
      }
      return createRoute(record, location, redirectedFrom, router)
    }

    return {
      match: match,
      addRoute: addRoute,
      getRoutes: getRoutes,
      addRoutes: addRoutes
    }
  }

  function matchRoute (
    regex,
    path,
    params
  ) {
    var m = path.match(regex);

    if (!m) {
      return false
    } else if (!params) {
      return true
    }

    for (var i = 1, len = m.length; i < len; ++i) {
      var key = regex.keys[i - 1];
      if (key) {
        // Fix #1994: using * with props: true generates a param named 0
        params[key.name || 'pathMatch'] = typeof m[i] === 'string' ? decode(m[i]) : m[i];
      }
    }

    return true
  }

  function resolveRecordPath (path, record) {
    return resolvePath(path, record.parent ? record.parent.path : '/', true)
  }

  /*  */

  // use User Timing api (if present) for more accurate key precision
  var Time =
    inBrowser$1 && window.performance && window.performance.now
      ? window.performance
      : Date;

  function genStateKey () {
    return Time.now().toFixed(3)
  }

  var _key = genStateKey();

  function getStateKey () {
    return _key
  }

  function setStateKey (key) {
    return (_key = key)
  }

  /*  */

  var positionStore = Object.create(null);

  function setupScroll () {
    // Prevent browser scroll behavior on History popstate
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    // Fix for #1585 for Firefox
    // Fix for #2195 Add optional third attribute to workaround a bug in safari https://bugs.webkit.org/show_bug.cgi?id=182678
    // Fix for #2774 Support for apps loaded from Windows file shares not mapped to network drives: replaced location.origin with
    // window.location.protocol + '//' + window.location.host
    // location.host contains the port and location.hostname doesn't
    var protocolAndPath = window.location.protocol + '//' + window.location.host;
    var absolutePath = window.location.href.replace(protocolAndPath, '');
    // preserve existing history state as it could be overriden by the user
    var stateCopy = extend$1({}, window.history.state);
    stateCopy.key = getStateKey();
    window.history.replaceState(stateCopy, '', absolutePath);
    window.addEventListener('popstate', handlePopState);
    return function () {
      window.removeEventListener('popstate', handlePopState);
    }
  }

  function handleScroll (
    router,
    to,
    from,
    isPop
  ) {
    if (!router.app) {
      return
    }

    var behavior = router.options.scrollBehavior;
    if (!behavior) {
      return
    }

    {
      assert(typeof behavior === 'function', "scrollBehavior must be a function");
    }

    // wait until re-render finishes before scrolling
    router.app.$nextTick(function () {
      var position = getScrollPosition();
      var shouldScroll = behavior.call(
        router,
        to,
        from,
        isPop ? position : null
      );

      if (!shouldScroll) {
        return
      }

      if (typeof shouldScroll.then === 'function') {
        shouldScroll
          .then(function (shouldScroll) {
            scrollToPosition((shouldScroll), position);
          })
          .catch(function (err) {
            {
              assert(false, err.toString());
            }
          });
      } else {
        scrollToPosition(shouldScroll, position);
      }
    });
  }

  function saveScrollPosition () {
    var key = getStateKey();
    if (key) {
      positionStore[key] = {
        x: window.pageXOffset,
        y: window.pageYOffset
      };
    }
  }

  function handlePopState (e) {
    saveScrollPosition();
    if (e.state && e.state.key) {
      setStateKey(e.state.key);
    }
  }

  function getScrollPosition () {
    var key = getStateKey();
    if (key) {
      return positionStore[key]
    }
  }

  function getElementPosition (el, offset) {
    var docEl = document.documentElement;
    var docRect = docEl.getBoundingClientRect();
    var elRect = el.getBoundingClientRect();
    return {
      x: elRect.left - docRect.left - offset.x,
      y: elRect.top - docRect.top - offset.y
    }
  }

  function isValidPosition (obj) {
    return isNumber(obj.x) || isNumber(obj.y)
  }

  function normalizePosition (obj) {
    return {
      x: isNumber(obj.x) ? obj.x : window.pageXOffset,
      y: isNumber(obj.y) ? obj.y : window.pageYOffset
    }
  }

  function normalizeOffset (obj) {
    return {
      x: isNumber(obj.x) ? obj.x : 0,
      y: isNumber(obj.y) ? obj.y : 0
    }
  }

  function isNumber (v) {
    return typeof v === 'number'
  }

  var hashStartsWithNumberRE = /^#\d/;

  function scrollToPosition (shouldScroll, position) {
    var isObject = typeof shouldScroll === 'object';
    if (isObject && typeof shouldScroll.selector === 'string') {
      // getElementById would still fail if the selector contains a more complicated query like #main[data-attr]
      // but at the same time, it doesn't make much sense to select an element with an id and an extra selector
      var el = hashStartsWithNumberRE.test(shouldScroll.selector) // $flow-disable-line
        ? document.getElementById(shouldScroll.selector.slice(1)) // $flow-disable-line
        : document.querySelector(shouldScroll.selector);

      if (el) {
        var offset =
          shouldScroll.offset && typeof shouldScroll.offset === 'object'
            ? shouldScroll.offset
            : {};
        offset = normalizeOffset(offset);
        position = getElementPosition(el, offset);
      } else if (isValidPosition(shouldScroll)) {
        position = normalizePosition(shouldScroll);
      }
    } else if (isObject && isValidPosition(shouldScroll)) {
      position = normalizePosition(shouldScroll);
    }

    if (position) {
      // $flow-disable-line
      if ('scrollBehavior' in document.documentElement.style) {
        window.scrollTo({
          left: position.x,
          top: position.y,
          // $flow-disable-line
          behavior: shouldScroll.behavior
        });
      } else {
        window.scrollTo(position.x, position.y);
      }
    }
  }

  /*  */

  var supportsPushState =
    inBrowser$1 &&
    (function () {
      var ua = window.navigator.userAgent;

      if (
        (ua.indexOf('Android 2.') !== -1 || ua.indexOf('Android 4.0') !== -1) &&
        ua.indexOf('Mobile Safari') !== -1 &&
        ua.indexOf('Chrome') === -1 &&
        ua.indexOf('Windows Phone') === -1
      ) {
        return false
      }

      return window.history && typeof window.history.pushState === 'function'
    })();

  function pushState (url, replace) {
    saveScrollPosition();
    // try...catch the pushState call to get around Safari
    // DOM Exception 18 where it limits to 100 pushState calls
    var history = window.history;
    try {
      if (replace) {
        // preserve existing history state as it could be overriden by the user
        var stateCopy = extend$1({}, history.state);
        stateCopy.key = getStateKey();
        history.replaceState(stateCopy, '', url);
      } else {
        history.pushState({ key: setStateKey(genStateKey()) }, '', url);
      }
    } catch (e) {
      window.location[replace ? 'replace' : 'assign'](url);
    }
  }

  function replaceState (url) {
    pushState(url, true);
  }

  /*  */

  function runQueue (queue, fn, cb) {
    var step = function (index) {
      if (index >= queue.length) {
        cb();
      } else {
        if (queue[index]) {
          fn(queue[index], function () {
            step(index + 1);
          });
        } else {
          step(index + 1);
        }
      }
    };
    step(0);
  }

  // When changing thing, also edit router.d.ts
  var NavigationFailureType = {
    redirected: 2,
    aborted: 4,
    cancelled: 8,
    duplicated: 16
  };

  function createNavigationRedirectedError (from, to) {
    return createRouterError(
      from,
      to,
      NavigationFailureType.redirected,
      ("Redirected when going from \"" + (from.fullPath) + "\" to \"" + (stringifyRoute(
        to
      )) + "\" via a navigation guard.")
    )
  }

  function createNavigationDuplicatedError (from, to) {
    var error = createRouterError(
      from,
      to,
      NavigationFailureType.duplicated,
      ("Avoided redundant navigation to current location: \"" + (from.fullPath) + "\".")
    );
    // backwards compatible with the first introduction of Errors
    error.name = 'NavigationDuplicated';
    return error
  }

  function createNavigationCancelledError (from, to) {
    return createRouterError(
      from,
      to,
      NavigationFailureType.cancelled,
      ("Navigation cancelled from \"" + (from.fullPath) + "\" to \"" + (to.fullPath) + "\" with a new navigation.")
    )
  }

  function createNavigationAbortedError (from, to) {
    return createRouterError(
      from,
      to,
      NavigationFailureType.aborted,
      ("Navigation aborted from \"" + (from.fullPath) + "\" to \"" + (to.fullPath) + "\" via a navigation guard.")
    )
  }

  function createRouterError (from, to, type, message) {
    var error = new Error(message);
    error._isRouter = true;
    error.from = from;
    error.to = to;
    error.type = type;

    return error
  }

  var propertiesToLog = ['params', 'query', 'hash'];

  function stringifyRoute (to) {
    if (typeof to === 'string') { return to }
    if ('path' in to) { return to.path }
    var location = {};
    propertiesToLog.forEach(function (key) {
      if (key in to) { location[key] = to[key]; }
    });
    return JSON.stringify(location, null, 2)
  }

  function isError (err) {
    return Object.prototype.toString.call(err).indexOf('Error') > -1
  }

  function isNavigationFailure (err, errorType) {
    return (
      isError(err) &&
      err._isRouter &&
      (errorType == null || err.type === errorType)
    )
  }

  /*  */

  function resolveAsyncComponents (matched) {
    return function (to, from, next) {
      var hasAsync = false;
      var pending = 0;
      var error = null;

      flatMapComponents(matched, function (def, _, match, key) {
        // if it's a function and doesn't have cid attached,
        // assume it's an async component resolve function.
        // we are not using Vue's default async resolving mechanism because
        // we want to halt the navigation until the incoming component has been
        // resolved.
        if (typeof def === 'function' && def.cid === undefined) {
          hasAsync = true;
          pending++;

          var resolve = once$1(function (resolvedDef) {
            if (isESModule(resolvedDef)) {
              resolvedDef = resolvedDef.default;
            }
            // save resolved on async factory in case it's used elsewhere
            def.resolved = typeof resolvedDef === 'function'
              ? resolvedDef
              : _Vue.extend(resolvedDef);
            match.components[key] = resolvedDef;
            pending--;
            if (pending <= 0) {
              next();
            }
          });

          var reject = once$1(function (reason) {
            var msg = "Failed to resolve async component " + key + ": " + reason;
             warn$1(false, msg);
            if (!error) {
              error = isError(reason)
                ? reason
                : new Error(msg);
              next(error);
            }
          });

          var res;
          try {
            res = def(resolve, reject);
          } catch (e) {
            reject(e);
          }
          if (res) {
            if (typeof res.then === 'function') {
              res.then(resolve, reject);
            } else {
              // new syntax in Vue 2.3
              var comp = res.component;
              if (comp && typeof comp.then === 'function') {
                comp.then(resolve, reject);
              }
            }
          }
        }
      });

      if (!hasAsync) { next(); }
    }
  }

  function flatMapComponents (
    matched,
    fn
  ) {
    return flatten(matched.map(function (m) {
      return Object.keys(m.components).map(function (key) { return fn(
        m.components[key],
        m.instances[key],
        m, key
      ); })
    }))
  }

  function flatten (arr) {
    return Array.prototype.concat.apply([], arr)
  }

  var hasSymbol$1 =
    typeof Symbol === 'function' &&
    typeof Symbol.toStringTag === 'symbol';

  function isESModule (obj) {
    return obj.__esModule || (hasSymbol$1 && obj[Symbol.toStringTag] === 'Module')
  }

  // in Webpack 2, require.ensure now also returns a Promise
  // so the resolve/reject functions may get called an extra time
  // if the user uses an arrow function shorthand that happens to
  // return that Promise.
  function once$1 (fn) {
    var called = false;
    return function () {
      var args = [], len = arguments.length;
      while ( len-- ) args[ len ] = arguments[ len ];

      if (called) { return }
      called = true;
      return fn.apply(this, args)
    }
  }

  /*  */

  var History = function History (router, base) {
    this.router = router;
    this.base = normalizeBase(base);
    // start with a route object that stands for "nowhere"
    this.current = START;
    this.pending = null;
    this.ready = false;
    this.readyCbs = [];
    this.readyErrorCbs = [];
    this.errorCbs = [];
    this.listeners = [];
  };

  History.prototype.listen = function listen (cb) {
    this.cb = cb;
  };

  History.prototype.onReady = function onReady (cb, errorCb) {
    if (this.ready) {
      cb();
    } else {
      this.readyCbs.push(cb);
      if (errorCb) {
        this.readyErrorCbs.push(errorCb);
      }
    }
  };

  History.prototype.onError = function onError (errorCb) {
    this.errorCbs.push(errorCb);
  };

  History.prototype.transitionTo = function transitionTo (
    location,
    onComplete,
    onAbort
  ) {
      var this$1 = this;

    var route;
    // catch redirect option https://github.com/vuejs/vue-router/issues/3201
    try {
      route = this.router.match(location, this.current);
    } catch (e) {
      this.errorCbs.forEach(function (cb) {
        cb(e);
      });
      // Exception should still be thrown
      throw e
    }
    var prev = this.current;
    this.confirmTransition(
      route,
      function () {
        this$1.updateRoute(route);
        onComplete && onComplete(route);
        this$1.ensureURL();
        this$1.router.afterHooks.forEach(function (hook) {
          hook && hook(route, prev);
        });

        // fire ready cbs once
        if (!this$1.ready) {
          this$1.ready = true;
          this$1.readyCbs.forEach(function (cb) {
            cb(route);
          });
        }
      },
      function (err) {
        if (onAbort) {
          onAbort(err);
        }
        if (err && !this$1.ready) {
          // Initial redirection should not mark the history as ready yet
          // because it's triggered by the redirection instead
          // https://github.com/vuejs/vue-router/issues/3225
          // https://github.com/vuejs/vue-router/issues/3331
          if (!isNavigationFailure(err, NavigationFailureType.redirected) || prev !== START) {
            this$1.ready = true;
            this$1.readyErrorCbs.forEach(function (cb) {
              cb(err);
            });
          }
        }
      }
    );
  };

  History.prototype.confirmTransition = function confirmTransition (route, onComplete, onAbort) {
      var this$1 = this;

    var current = this.current;
    this.pending = route;
    var abort = function (err) {
      // changed after adding errors with
      // https://github.com/vuejs/vue-router/pull/3047 before that change,
      // redirect and aborted navigation would produce an err == null
      if (!isNavigationFailure(err) && isError(err)) {
        if (this$1.errorCbs.length) {
          this$1.errorCbs.forEach(function (cb) {
            cb(err);
          });
        } else {
          {
            warn$1(false, 'uncaught error during route navigation:');
          }
          console.error(err);
        }
      }
      onAbort && onAbort(err);
    };
    var lastRouteIndex = route.matched.length - 1;
    var lastCurrentIndex = current.matched.length - 1;
    if (
      isSameRoute(route, current) &&
      // in the case the route map has been dynamically appended to
      lastRouteIndex === lastCurrentIndex &&
      route.matched[lastRouteIndex] === current.matched[lastCurrentIndex]
    ) {
      this.ensureURL();
      if (route.hash) {
        handleScroll(this.router, current, route, false);
      }
      return abort(createNavigationDuplicatedError(current, route))
    }

    var ref = resolveQueue(
      this.current.matched,
      route.matched
    );
      var updated = ref.updated;
      var deactivated = ref.deactivated;
      var activated = ref.activated;

    var queue = [].concat(
      // in-component leave guards
      extractLeaveGuards(deactivated),
      // global before hooks
      this.router.beforeHooks,
      // in-component update hooks
      extractUpdateHooks(updated),
      // in-config enter guards
      activated.map(function (m) { return m.beforeEnter; }),
      // async components
      resolveAsyncComponents(activated)
    );

    var iterator = function (hook, next) {
      if (this$1.pending !== route) {
        return abort(createNavigationCancelledError(current, route))
      }
      try {
        hook(route, current, function (to) {
          if (to === false) {
            // next(false) -> abort navigation, ensure current URL
            this$1.ensureURL(true);
            abort(createNavigationAbortedError(current, route));
          } else if (isError(to)) {
            this$1.ensureURL(true);
            abort(to);
          } else if (
            typeof to === 'string' ||
            (typeof to === 'object' &&
              (typeof to.path === 'string' || typeof to.name === 'string'))
          ) {
            // next('/') or next({ path: '/' }) -> redirect
            abort(createNavigationRedirectedError(current, route));
            if (typeof to === 'object' && to.replace) {
              this$1.replace(to);
            } else {
              this$1.push(to);
            }
          } else {
            // confirm transition and pass on the value
            next(to);
          }
        });
      } catch (e) {
        abort(e);
      }
    };

    runQueue(queue, iterator, function () {
      // wait until async components are resolved before
      // extracting in-component enter guards
      var enterGuards = extractEnterGuards(activated);
      var queue = enterGuards.concat(this$1.router.resolveHooks);
      runQueue(queue, iterator, function () {
        if (this$1.pending !== route) {
          return abort(createNavigationCancelledError(current, route))
        }
        this$1.pending = null;
        onComplete(route);
        if (this$1.router.app) {
          this$1.router.app.$nextTick(function () {
            handleRouteEntered(route);
          });
        }
      });
    });
  };

  History.prototype.updateRoute = function updateRoute (route) {
    this.current = route;
    this.cb && this.cb(route);
  };

  History.prototype.setupListeners = function setupListeners () {
    // Default implementation is empty
  };

  History.prototype.teardown = function teardown () {
    // clean up event listeners
    // https://github.com/vuejs/vue-router/issues/2341
    this.listeners.forEach(function (cleanupListener) {
      cleanupListener();
    });
    this.listeners = [];

    // reset current history route
    // https://github.com/vuejs/vue-router/issues/3294
    this.current = START;
    this.pending = null;
  };

  function normalizeBase (base) {
    if (!base) {
      if (inBrowser$1) {
        // respect <base> tag
        var baseEl = document.querySelector('base');
        base = (baseEl && baseEl.getAttribute('href')) || '/';
        // strip full URL origin
        base = base.replace(/^https?:\/\/[^\/]+/, '');
      } else {
        base = '/';
      }
    }
    // make sure there's the starting slash
    if (base.charAt(0) !== '/') {
      base = '/' + base;
    }
    // remove trailing slash
    return base.replace(/\/$/, '')
  }

  function resolveQueue (
    current,
    next
  ) {
    var i;
    var max = Math.max(current.length, next.length);
    for (i = 0; i < max; i++) {
      if (current[i] !== next[i]) {
        break
      }
    }
    return {
      updated: next.slice(0, i),
      activated: next.slice(i),
      deactivated: current.slice(i)
    }
  }

  function extractGuards (
    records,
    name,
    bind,
    reverse
  ) {
    var guards = flatMapComponents(records, function (def, instance, match, key) {
      var guard = extractGuard(def, name);
      if (guard) {
        return Array.isArray(guard)
          ? guard.map(function (guard) { return bind(guard, instance, match, key); })
          : bind(guard, instance, match, key)
      }
    });
    return flatten(reverse ? guards.reverse() : guards)
  }

  function extractGuard (
    def,
    key
  ) {
    if (typeof def !== 'function') {
      // extend now so that global mixins are applied.
      def = _Vue.extend(def);
    }
    return def.options[key]
  }

  function extractLeaveGuards (deactivated) {
    return extractGuards(deactivated, 'beforeRouteLeave', bindGuard, true)
  }

  function extractUpdateHooks (updated) {
    return extractGuards(updated, 'beforeRouteUpdate', bindGuard)
  }

  function bindGuard (guard, instance) {
    if (instance) {
      return function boundRouteGuard () {
        return guard.apply(instance, arguments)
      }
    }
  }

  function extractEnterGuards (
    activated
  ) {
    return extractGuards(
      activated,
      'beforeRouteEnter',
      function (guard, _, match, key) {
        return bindEnterGuard(guard, match, key)
      }
    )
  }

  function bindEnterGuard (
    guard,
    match,
    key
  ) {
    return function routeEnterGuard (to, from, next) {
      return guard(to, from, function (cb) {
        if (typeof cb === 'function') {
          if (!match.enteredCbs[key]) {
            match.enteredCbs[key] = [];
          }
          match.enteredCbs[key].push(cb);
        }
        next(cb);
      })
    }
  }

  /*  */

  var HTML5History = /*@__PURE__*/(function (History) {
    function HTML5History (router, base) {
      History.call(this, router, base);

      this._startLocation = getLocation(this.base);
    }

    if ( History ) HTML5History.__proto__ = History;
    HTML5History.prototype = Object.create( History && History.prototype );
    HTML5History.prototype.constructor = HTML5History;

    HTML5History.prototype.setupListeners = function setupListeners () {
      var this$1 = this;

      if (this.listeners.length > 0) {
        return
      }

      var router = this.router;
      var expectScroll = router.options.scrollBehavior;
      var supportsScroll = supportsPushState && expectScroll;

      if (supportsScroll) {
        this.listeners.push(setupScroll());
      }

      var handleRoutingEvent = function () {
        var current = this$1.current;

        // Avoiding first `popstate` event dispatched in some browsers but first
        // history route not updated since async guard at the same time.
        var location = getLocation(this$1.base);
        if (this$1.current === START && location === this$1._startLocation) {
          return
        }

        this$1.transitionTo(location, function (route) {
          if (supportsScroll) {
            handleScroll(router, route, current, true);
          }
        });
      };
      window.addEventListener('popstate', handleRoutingEvent);
      this.listeners.push(function () {
        window.removeEventListener('popstate', handleRoutingEvent);
      });
    };

    HTML5History.prototype.go = function go (n) {
      window.history.go(n);
    };

    HTML5History.prototype.push = function push (location, onComplete, onAbort) {
      var this$1 = this;

      var ref = this;
      var fromRoute = ref.current;
      this.transitionTo(location, function (route) {
        pushState(cleanPath(this$1.base + route.fullPath));
        handleScroll(this$1.router, route, fromRoute, false);
        onComplete && onComplete(route);
      }, onAbort);
    };

    HTML5History.prototype.replace = function replace (location, onComplete, onAbort) {
      var this$1 = this;

      var ref = this;
      var fromRoute = ref.current;
      this.transitionTo(location, function (route) {
        replaceState(cleanPath(this$1.base + route.fullPath));
        handleScroll(this$1.router, route, fromRoute, false);
        onComplete && onComplete(route);
      }, onAbort);
    };

    HTML5History.prototype.ensureURL = function ensureURL (push) {
      if (getLocation(this.base) !== this.current.fullPath) {
        var current = cleanPath(this.base + this.current.fullPath);
        push ? pushState(current) : replaceState(current);
      }
    };

    HTML5History.prototype.getCurrentLocation = function getCurrentLocation () {
      return getLocation(this.base)
    };

    return HTML5History;
  }(History));

  function getLocation (base) {
    var path = window.location.pathname;
    var pathLowerCase = path.toLowerCase();
    var baseLowerCase = base.toLowerCase();
    // base="/a" shouldn't turn path="/app" into "/a/pp"
    // https://github.com/vuejs/vue-router/issues/3555
    // so we ensure the trailing slash in the base
    if (base && ((pathLowerCase === baseLowerCase) ||
      (pathLowerCase.indexOf(cleanPath(baseLowerCase + '/')) === 0))) {
      path = path.slice(base.length);
    }
    return (path || '/') + window.location.search + window.location.hash
  }

  /*  */

  var HashHistory = /*@__PURE__*/(function (History) {
    function HashHistory (router, base, fallback) {
      History.call(this, router, base);
      // check history fallback deeplinking
      if (fallback && checkFallback(this.base)) {
        return
      }
      ensureSlash();
    }

    if ( History ) HashHistory.__proto__ = History;
    HashHistory.prototype = Object.create( History && History.prototype );
    HashHistory.prototype.constructor = HashHistory;

    // this is delayed until the app mounts
    // to avoid the hashchange listener being fired too early
    HashHistory.prototype.setupListeners = function setupListeners () {
      var this$1 = this;

      if (this.listeners.length > 0) {
        return
      }

      var router = this.router;
      var expectScroll = router.options.scrollBehavior;
      var supportsScroll = supportsPushState && expectScroll;

      if (supportsScroll) {
        this.listeners.push(setupScroll());
      }

      var handleRoutingEvent = function () {
        var current = this$1.current;
        if (!ensureSlash()) {
          return
        }
        this$1.transitionTo(getHash(), function (route) {
          if (supportsScroll) {
            handleScroll(this$1.router, route, current, true);
          }
          if (!supportsPushState) {
            replaceHash(route.fullPath);
          }
        });
      };
      var eventType = supportsPushState ? 'popstate' : 'hashchange';
      window.addEventListener(
        eventType,
        handleRoutingEvent
      );
      this.listeners.push(function () {
        window.removeEventListener(eventType, handleRoutingEvent);
      });
    };

    HashHistory.prototype.push = function push (location, onComplete, onAbort) {
      var this$1 = this;

      var ref = this;
      var fromRoute = ref.current;
      this.transitionTo(
        location,
        function (route) {
          pushHash(route.fullPath);
          handleScroll(this$1.router, route, fromRoute, false);
          onComplete && onComplete(route);
        },
        onAbort
      );
    };

    HashHistory.prototype.replace = function replace (location, onComplete, onAbort) {
      var this$1 = this;

      var ref = this;
      var fromRoute = ref.current;
      this.transitionTo(
        location,
        function (route) {
          replaceHash(route.fullPath);
          handleScroll(this$1.router, route, fromRoute, false);
          onComplete && onComplete(route);
        },
        onAbort
      );
    };

    HashHistory.prototype.go = function go (n) {
      window.history.go(n);
    };

    HashHistory.prototype.ensureURL = function ensureURL (push) {
      var current = this.current.fullPath;
      if (getHash() !== current) {
        push ? pushHash(current) : replaceHash(current);
      }
    };

    HashHistory.prototype.getCurrentLocation = function getCurrentLocation () {
      return getHash()
    };

    return HashHistory;
  }(History));

  function checkFallback (base) {
    var location = getLocation(base);
    if (!/^\/#/.test(location)) {
      window.location.replace(cleanPath(base + '/#' + location));
      return true
    }
  }

  function ensureSlash () {
    var path = getHash();
    if (path.charAt(0) === '/') {
      return true
    }
    replaceHash('/' + path);
    return false
  }

  function getHash () {
    // We can't use window.location.hash here because it's not
    // consistent across browsers - Firefox will pre-decode it!
    var href = window.location.href;
    var index = href.indexOf('#');
    // empty path
    if (index < 0) { return '' }

    href = href.slice(index + 1);

    return href
  }

  function getUrl (path) {
    var href = window.location.href;
    var i = href.indexOf('#');
    var base = i >= 0 ? href.slice(0, i) : href;
    return (base + "#" + path)
  }

  function pushHash (path) {
    if (supportsPushState) {
      pushState(getUrl(path));
    } else {
      window.location.hash = path;
    }
  }

  function replaceHash (path) {
    if (supportsPushState) {
      replaceState(getUrl(path));
    } else {
      window.location.replace(getUrl(path));
    }
  }

  /*  */

  var AbstractHistory = /*@__PURE__*/(function (History) {
    function AbstractHistory (router, base) {
      History.call(this, router, base);
      this.stack = [];
      this.index = -1;
    }

    if ( History ) AbstractHistory.__proto__ = History;
    AbstractHistory.prototype = Object.create( History && History.prototype );
    AbstractHistory.prototype.constructor = AbstractHistory;

    AbstractHistory.prototype.push = function push (location, onComplete, onAbort) {
      var this$1 = this;

      this.transitionTo(
        location,
        function (route) {
          this$1.stack = this$1.stack.slice(0, this$1.index + 1).concat(route);
          this$1.index++;
          onComplete && onComplete(route);
        },
        onAbort
      );
    };

    AbstractHistory.prototype.replace = function replace (location, onComplete, onAbort) {
      var this$1 = this;

      this.transitionTo(
        location,
        function (route) {
          this$1.stack = this$1.stack.slice(0, this$1.index).concat(route);
          onComplete && onComplete(route);
        },
        onAbort
      );
    };

    AbstractHistory.prototype.go = function go (n) {
      var this$1 = this;

      var targetIndex = this.index + n;
      if (targetIndex < 0 || targetIndex >= this.stack.length) {
        return
      }
      var route = this.stack[targetIndex];
      this.confirmTransition(
        route,
        function () {
          var prev = this$1.current;
          this$1.index = targetIndex;
          this$1.updateRoute(route);
          this$1.router.afterHooks.forEach(function (hook) {
            hook && hook(route, prev);
          });
        },
        function (err) {
          if (isNavigationFailure(err, NavigationFailureType.duplicated)) {
            this$1.index = targetIndex;
          }
        }
      );
    };

    AbstractHistory.prototype.getCurrentLocation = function getCurrentLocation () {
      var current = this.stack[this.stack.length - 1];
      return current ? current.fullPath : '/'
    };

    AbstractHistory.prototype.ensureURL = function ensureURL () {
      // noop
    };

    return AbstractHistory;
  }(History));

  /*  */

  var VueRouter = function VueRouter (options) {
    if ( options === void 0 ) options = {};

    {
      warn$1(this instanceof VueRouter, "Router must be called with the new operator.");
    }
    this.app = null;
    this.apps = [];
    this.options = options;
    this.beforeHooks = [];
    this.resolveHooks = [];
    this.afterHooks = [];
    this.matcher = createMatcher(options.routes || [], this);

    var mode = options.mode || 'hash';
    this.fallback =
      mode === 'history' && !supportsPushState && options.fallback !== false;
    if (this.fallback) {
      mode = 'hash';
    }
    if (!inBrowser$1) {
      mode = 'abstract';
    }
    this.mode = mode;

    switch (mode) {
      case 'history':
        this.history = new HTML5History(this, options.base);
        break
      case 'hash':
        this.history = new HashHistory(this, options.base, this.fallback);
        break
      case 'abstract':
        this.history = new AbstractHistory(this, options.base);
        break
      default:
        {
          assert(false, ("invalid mode: " + mode));
        }
    }
  };

  var prototypeAccessors$1 = { currentRoute: { configurable: true } };

  VueRouter.prototype.match = function match (raw, current, redirectedFrom) {
    return this.matcher.match(raw, current, redirectedFrom)
  };

  prototypeAccessors$1.currentRoute.get = function () {
    return this.history && this.history.current
  };

  VueRouter.prototype.init = function init (app /* Vue component instance */) {
      var this$1 = this;

    
      assert(
        install.installed,
        "not installed. Make sure to call `Vue.use(VueRouter)` " +
          "before creating root instance."
      );

    this.apps.push(app);

    // set up app destroyed handler
    // https://github.com/vuejs/vue-router/issues/2639
    app.$once('hook:destroyed', function () {
      // clean out app from this.apps array once destroyed
      var index = this$1.apps.indexOf(app);
      if (index > -1) { this$1.apps.splice(index, 1); }
      // ensure we still have a main app or null if no apps
      // we do not release the router so it can be reused
      if (this$1.app === app) { this$1.app = this$1.apps[0] || null; }

      if (!this$1.app) { this$1.history.teardown(); }
    });

    // main app previously initialized
    // return as we don't need to set up new history listener
    if (this.app) {
      return
    }

    this.app = app;

    var history = this.history;

    if (history instanceof HTML5History || history instanceof HashHistory) {
      var handleInitialScroll = function (routeOrError) {
        var from = history.current;
        var expectScroll = this$1.options.scrollBehavior;
        var supportsScroll = supportsPushState && expectScroll;

        if (supportsScroll && 'fullPath' in routeOrError) {
          handleScroll(this$1, routeOrError, from, false);
        }
      };
      var setupListeners = function (routeOrError) {
        history.setupListeners();
        handleInitialScroll(routeOrError);
      };
      history.transitionTo(
        history.getCurrentLocation(),
        setupListeners,
        setupListeners
      );
    }

    history.listen(function (route) {
      this$1.apps.forEach(function (app) {
        app._route = route;
      });
    });
  };

  VueRouter.prototype.beforeEach = function beforeEach (fn) {
    return registerHook(this.beforeHooks, fn)
  };

  VueRouter.prototype.beforeResolve = function beforeResolve (fn) {
    return registerHook(this.resolveHooks, fn)
  };

  VueRouter.prototype.afterEach = function afterEach (fn) {
    return registerHook(this.afterHooks, fn)
  };

  VueRouter.prototype.onReady = function onReady (cb, errorCb) {
    this.history.onReady(cb, errorCb);
  };

  VueRouter.prototype.onError = function onError (errorCb) {
    this.history.onError(errorCb);
  };

  VueRouter.prototype.push = function push (location, onComplete, onAbort) {
      var this$1 = this;

    // $flow-disable-line
    if (!onComplete && !onAbort && typeof Promise !== 'undefined') {
      return new Promise(function (resolve, reject) {
        this$1.history.push(location, resolve, reject);
      })
    } else {
      this.history.push(location, onComplete, onAbort);
    }
  };

  VueRouter.prototype.replace = function replace (location, onComplete, onAbort) {
      var this$1 = this;

    // $flow-disable-line
    if (!onComplete && !onAbort && typeof Promise !== 'undefined') {
      return new Promise(function (resolve, reject) {
        this$1.history.replace(location, resolve, reject);
      })
    } else {
      this.history.replace(location, onComplete, onAbort);
    }
  };

  VueRouter.prototype.go = function go (n) {
    this.history.go(n);
  };

  VueRouter.prototype.back = function back () {
    this.go(-1);
  };

  VueRouter.prototype.forward = function forward () {
    this.go(1);
  };

  VueRouter.prototype.getMatchedComponents = function getMatchedComponents (to) {
    var route = to
      ? to.matched
        ? to
        : this.resolve(to).route
      : this.currentRoute;
    if (!route) {
      return []
    }
    return [].concat.apply(
      [],
      route.matched.map(function (m) {
        return Object.keys(m.components).map(function (key) {
          return m.components[key]
        })
      })
    )
  };

  VueRouter.prototype.resolve = function resolve (
    to,
    current,
    append
  ) {
    current = current || this.history.current;
    var location = normalizeLocation(to, current, append, this);
    var route = this.match(location, current);
    var fullPath = route.redirectedFrom || route.fullPath;
    var base = this.history.base;
    var href = createHref(base, fullPath, this.mode);
    return {
      location: location,
      route: route,
      href: href,
      // for backwards compat
      normalizedTo: location,
      resolved: route
    }
  };

  VueRouter.prototype.getRoutes = function getRoutes () {
    return this.matcher.getRoutes()
  };

  VueRouter.prototype.addRoute = function addRoute (parentOrRoute, route) {
    this.matcher.addRoute(parentOrRoute, route);
    if (this.history.current !== START) {
      this.history.transitionTo(this.history.getCurrentLocation());
    }
  };

  VueRouter.prototype.addRoutes = function addRoutes (routes) {
    {
      warn$1(false, 'router.addRoutes() is deprecated and has been removed in Vue Router 4. Use router.addRoute() instead.');
    }
    this.matcher.addRoutes(routes);
    if (this.history.current !== START) {
      this.history.transitionTo(this.history.getCurrentLocation());
    }
  };

  Object.defineProperties( VueRouter.prototype, prototypeAccessors$1 );

  function registerHook (list, fn) {
    list.push(fn);
    return function () {
      var i = list.indexOf(fn);
      if (i > -1) { list.splice(i, 1); }
    }
  }

  function createHref (base, fullPath, mode) {
    var path = mode === 'hash' ? '#' + fullPath : fullPath;
    return base ? cleanPath(base + '/' + path) : path
  }

  VueRouter.install = install;
  VueRouter.version = '3.5.3';
  VueRouter.isNavigationFailure = isNavigationFailure;
  VueRouter.NavigationFailureType = NavigationFailureType;
  VueRouter.START_LOCATION = START;

  if (inBrowser$1 && window.Vue) {
    window.Vue.use(VueRouter);
  }

  /*
   * Copyright © 2017 EaseScript All rights reserved.
   * Released under the MIT license
   * https://github.com/51breeze/EaseScript
   * @author Jun Ye <664371281@qq.com>
   */
  Vue.use(VueRouter);

  function _typeof(obj) {
    "@babel/helpers - typeof";

    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
      return typeof obj;
    } : function (obj) {
      return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    }, _typeof(obj);
  }
  function _defineProperty(obj, key, value) {
    key = _toPropertyKey(key);
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }
    return obj;
  }
  function _toPrimitive(input, hint) {
    if (typeof input !== "object" || input === null) return input;
    var prim = input[Symbol.toPrimitive];
    if (prim !== undefined) {
      var res = prim.call(input, hint || "default");
      if (typeof res !== "object") return res;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return (hint === "string" ? String : Number)(input);
  }
  function _toPropertyKey(arg) {
    var key = _toPrimitive(arg, "string");
    return typeof key === "symbol" ? key : String(key);
  }

  function broadcast(componentName, eventName, params) {
    this.$children.forEach(child => {
      var name = child.$options.componentName;

      if (name === componentName) {
        child.$emit.apply(child, [eventName].concat(params));
      } else {
        broadcast.apply(child, [componentName, eventName].concat([params]));
      }
    });
  }
  var Emitter = {
    methods: {
      dispatch(componentName, eventName, params) {
        var parent = this.$parent || this.$root;
        var name = parent.$options.componentName;

        while (parent && (!name || name !== componentName)) {
          parent = parent.$parent;

          if (parent) {
            name = parent.$options.componentName;
          }
        }
        if (parent) {
          parent.$emit.apply(parent, [eventName].concat(params));
        }
      },
      broadcast(componentName, eventName, params) {
        broadcast.call(this, componentName, eventName, params);
      }
    }
  };

  if (typeof /./ !== 'function' && typeof Int8Array !== 'object' && (Vue.prototype.$isServer || typeof document.childNodes !== 'function')) ;

  const hasOwnProperty$1 = Object.prototype.hasOwnProperty;

  function hasOwn$2(obj, key) {
    return hasOwnProperty$1.call(obj, key);
  }
  function extend$2(to, _from) {
    for (let key in _from) {
      to[key] = _from[key];
    }
    return to;
  }
  function toObject$1(arr) {
    var res = {};
    for (let i = 0; i < arr.length; i++) {
      if (arr[i]) {
        extend$2(res, arr[i]);
      }
    }
    return res;
  }
  const getValueByPath = function(object, prop) {
    prop = prop || '';
    const paths = prop.split('.');
    let current = object;
    let result = null;
    for (let i = 0, j = paths.length; i < j; i++) {
      const path = paths[i];
      if (!current) break;

      if (i === j - 1) {
        result = current[path];
        break;
      }
      current = current[path];
    }
    return result;
  };

  const valueEquals = (a, b) => {
    // see: https://stackoverflow.com/questions/3115982/how-to-check-if-two-arrays-are-equal-with-javascript
    if (a === b) return true;
    if (!(a instanceof Array)) return false;
    if (!(b instanceof Array)) return false;
    if (a.length !== b.length) return false;
    for (let i = 0; i !== a.length; ++i) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  };

  const escapeRegexpString = (value = '') => String(value).replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');

  const isIE$1 = function() {
    return !Vue.prototype.$isServer && !isNaN(Number(document.documentMode));
  };

  const isEdge$1 = function() {
    return !Vue.prototype.$isServer && navigator.userAgent.indexOf('Edge') > -1;
  };

  const kebabCase = function(str) {
    const hyphenateRE = /([^-])([A-Z])/g;
    return str
      .replace(hyphenateRE, '$1-$2')
      .replace(hyphenateRE, '$1-$2')
      .toLowerCase();
  };

  var script = {
    mixins: [Emitter],
    name: 'ElOption',
    componentName: 'ElOption',
    inject: ['select'],
    props: {
      value: {
        required: true
      },
      label: [String, Number],
      created: Boolean,
      disabled: {
        type: Boolean,
        "default": false
      }
    },
    data: function data() {
      return {
        index: -1,
        groupDisabled: false,
        visible: true,
        hitState: false,
        hover: false
      };
    },
    computed: {
      isObject: function isObject() {
        return Object.prototype.toString.call(this.value).toLowerCase() === '[object object]';
      },
      currentLabel: function currentLabel() {
        return this.label || (this.isObject ? '' : this.value);
      },
      currentValue: function currentValue() {
        return this.value || this.label || '';
      },
      itemSelected: function itemSelected() {
        if (!this.select.multiple) {
          return this.isEqual(this.value, this.select.value);
        } else {
          return this.contains(this.select.value, this.value);
        }
      },
      limitReached: function limitReached() {
        if (this.select.multiple) {
          return !this.itemSelected && (this.select.value || []).length >= this.select.multipleLimit && this.select.multipleLimit > 0;
        } else {
          return false;
        }
      }
    },
    watch: {
      currentLabel: function currentLabel() {
        if (!this.created && !this.select.remote) this.dispatch('ElSelect', 'setSelected');
      },
      value: function value(val, oldVal) {
        var _this$select = this.select,
          remote = _this$select.remote,
          valueKey = _this$select.valueKey;
        if (!this.created && !remote) {
          if (valueKey && _typeof(val) === 'object' && _typeof(oldVal) === 'object' && val[valueKey] === oldVal[valueKey]) {
            return;
          }
          this.dispatch('ElSelect', 'setSelected');
        }
      }
    },
    methods: {
      isEqual: function isEqual(a, b) {
        if (!this.isObject) {
          return a === b;
        } else {
          var valueKey = this.select.valueKey;
          return getValueByPath(a, valueKey) === getValueByPath(b, valueKey);
        }
      },
      contains: function contains() {
        var arr = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
        var target = arguments.length > 1 ? arguments[1] : undefined;
        if (!this.isObject) {
          return arr && arr.indexOf(target) > -1;
        } else {
          var valueKey = this.select.valueKey;
          return arr && arr.some(function (item) {
            return getValueByPath(item, valueKey) === getValueByPath(target, valueKey);
          });
        }
      },
      handleGroupDisabled: function handleGroupDisabled(val) {
        this.groupDisabled = val;
      },
      hoverItem: function hoverItem() {
        if (!this.disabled && !this.groupDisabled) {
          this.select.hoverIndex = this.select.options.indexOf(this);
        }
      },
      selectOptionClick: function selectOptionClick() {
        if (this.disabled !== true && this.groupDisabled !== true) {
          this.dispatch('ElSelect', 'handleOptionClick', [this, true]);
        }
      },
      queryChange: function queryChange(query) {
        this.visible = new RegExp(escapeRegexpString(query), 'i').test(this.currentLabel) || this.created;
        if (!this.visible) {
          this.select.filteredOptionsCount--;
        }
      }
    },
    created: function created() {
      this.select.options.push(this);
      this.select.cachedOptions.push(this);
      this.select.optionsCount++;
      this.select.filteredOptionsCount++;
      this.$on('queryChange', this.queryChange);
      this.$on('handleGroupDisabled', this.handleGroupDisabled);
    },
    beforeDestroy: function beforeDestroy() {
      var _this$select2 = this.select,
        selected = _this$select2.selected,
        multiple = _this$select2.multiple;
      var selectedOptions = multiple ? selected : [selected];
      var index = this.select.cachedOptions.indexOf(this);
      var selectedIndex = selectedOptions.indexOf(this);

      // if option is not selected, remove it from cache
      if (index > -1 && selectedIndex < 0) {
        this.select.cachedOptions.splice(index, 1);
      }
      this.select.onOptionDestroy(this.select.options.indexOf(this));
    }
  };

  function normalizeComponent(template, style, script, scopeId, isFunctionalTemplate, moduleIdentifier /* server only */, shadowMode, createInjector, createInjectorSSR, createInjectorShadow) {
      if (typeof shadowMode !== 'boolean') {
          createInjectorSSR = createInjector;
          createInjector = shadowMode;
          shadowMode = false;
      }
      // Vue.extend constructor export interop.
      const options = typeof script === 'function' ? script.options : script;
      // render functions
      if (template && template.render) {
          options.render = template.render;
          options.staticRenderFns = template.staticRenderFns;
          options._compiled = true;
          // functional template
          if (isFunctionalTemplate) {
              options.functional = true;
          }
      }
      // scopedId
      if (scopeId) {
          options._scopeId = scopeId;
      }
      let hook;
      if (moduleIdentifier) {
          // server build
          hook = function (context) {
              // 2.3 injection
              context =
                  context || // cached call
                      (this.$vnode && this.$vnode.ssrContext) || // stateful
                      (this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext); // functional
              // 2.2 with runInNewContext: true
              if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
                  context = __VUE_SSR_CONTEXT__;
              }
              // inject component styles
              if (style) {
                  style.call(this, createInjectorSSR(context));
              }
              // register component module identifier for async chunk inference
              if (context && context._registeredComponents) {
                  context._registeredComponents.add(moduleIdentifier);
              }
          };
          // used by ssr in case component is cached and beforeCreate
          // never gets called
          options._ssrRegister = hook;
      }
      else if (style) {
          hook = shadowMode
              ? function (context) {
                  style.call(this, createInjectorShadow(context, this.$root.$options.shadowRoot));
              }
              : function (context) {
                  style.call(this, createInjector(context));
              };
      }
      if (hook) {
          if (options.functional) {
              // register for functional component in vue file
              const originalRender = options.render;
              options.render = function renderWithStyleInjection(h, context) {
                  hook.call(context);
                  return originalRender(h, context);
              };
          }
          else {
              // inject component registration as beforeCreate hook
              const existing = options.beforeCreate;
              options.beforeCreate = existing ? [].concat(existing, hook) : [hook];
          }
      }
      return script;
  }

  /* script */
  var __vue_script__ = script;

  /* template */
  var __vue_render__ = function __vue_render__() {
    var _vm = this;
    var _h = _vm.$createElement;
    var _c = _vm._self._c || _h;
    return _c("li", {
      directives: [{
        name: "show",
        rawName: "v-show",
        value: _vm.visible,
        expression: "visible"
      }],
      staticClass: "el-select-dropdown__item",
      "class": {
        selected: _vm.itemSelected,
        "is-disabled": _vm.disabled || _vm.groupDisabled || _vm.limitReached,
        hover: _vm.hover
      },
      on: {
        mouseenter: _vm.hoverItem,
        click: function click($event) {
          $event.stopPropagation();
          return _vm.selectOptionClick.apply(null, arguments);
        }
      }
    }, [_vm._t("default", function () {
      return [_c("span", [_vm._v(_vm._s(_vm.currentLabel))])];
    })], 2);
  };
  var __vue_staticRenderFns__ = [];
  __vue_render__._withStripped = true;

  /* style */
  var __vue_inject_styles__ = undefined;
  /* scoped */
  var __vue_scope_id__ = undefined;
  /* module identifier */
  var __vue_module_identifier__ = undefined;
  /* functional template */
  var __vue_is_functional_template__ = false;
  /* style inject */

  /* style inject SSR */

  /* style inject shadow dom */

  var __vue_component__ = /*#__PURE__*/normalizeComponent({
    render: __vue_render__,
    staticRenderFns: __vue_staticRenderFns__
  }, __vue_inject_styles__, __vue_script__, __vue_scope_id__, __vue_is_functional_template__, __vue_module_identifier__, false, undefined, undefined, undefined);

  /* istanbul ignore next */
  __vue_component__.install = function (Vue) {
    Vue.component(__vue_component__.name, __vue_component__);
  };

  const MyOption = Component.createComponent({
      name:"es-MyOption"
  });
  const members$4 = {
      render:{
          m:3,
          d:3,
          value:function render(){
              return this.createVNode(__vue_component__,this.getConfig(),this.slot('default'));
          }
      }
  };
  Class.creator(9,MyOption,{
      id:1,
      name:"MyOption",
      inherit:Component,
      members:members$4
  });

  /*
   * Copyright © 2017 EaseScript All rights reserved.
   * Released under the MIT license
   * https://github.com/51breeze/EaseScript
   * @author Jun Ye <664371281@qq.com>
   */
  Vue.use( VueRouter );
  var Link$1 = Vue.component('RouterLink');

  /*
   * Copyright © 2017 EaseScript All rights reserved.
   * Released under the MIT license
   * https://github.com/51breeze/EaseScript
   * @author Jun Ye <664371281@qq.com>
   */
  var KeepAlive$1 = Vue.component('KeepAlive');

  /*
   * Copyright © 2017 EaseScript All rights reserved.
   * Released under the MIT license
   * https://github.com/51breeze/EaseScript
   * @author Jun Ye <664371281@qq.com>
   */
  Vue.use( VueRouter );
  var Viewport = Vue.component('RouterView');

  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //

  var typeMap = {
    success: 'success',
    info: 'info',
    warning: 'warning',
    error: 'error'
  };
  var script$1 = {
    data: function data() {
      return {
        visible: false,
        title: '',
        message: '',
        duration: 4500,
        type: '',
        showClose: true,
        customClass: '',
        iconClass: '',
        onClose: null,
        onClick: null,
        closed: false,
        verticalOffset: 0,
        timer: null,
        dangerouslyUseHTMLString: false,
        position: 'top-right'
      };
    },
    computed: {
      typeClass: function typeClass() {
        return this.type && typeMap[this.type] ? "el-icon-".concat(typeMap[this.type]) : '';
      },
      horizontalClass: function horizontalClass() {
        return this.position.indexOf('right') > -1 ? 'right' : 'left';
      },
      verticalProperty: function verticalProperty() {
        return /^top-/.test(this.position) ? 'top' : 'bottom';
      },
      positionStyle: function positionStyle() {
        return _defineProperty({}, this.verticalProperty, "".concat(this.verticalOffset, "px"));
      }
    },
    watch: {
      closed: function closed(newVal) {
        if (newVal) {
          this.visible = false;
          this.$el.addEventListener('transitionend', this.destroyElement);
        }
      }
    },
    methods: {
      destroyElement: function destroyElement() {
        this.$el.removeEventListener('transitionend', this.destroyElement);
        this.$destroy(true);
        this.$el.parentNode.removeChild(this.$el);
      },
      click: function click() {
        if (typeof this.onClick === 'function') {
          this.onClick();
        }
      },
      close: function close() {
        this.closed = true;
        if (typeof this.onClose === 'function') {
          this.onClose();
        }
      },
      clearTimer: function clearTimer() {
        clearTimeout(this.timer);
      },
      startTimer: function startTimer() {
        var _this = this;
        if (this.duration > 0) {
          this.timer = setTimeout(function () {
            if (!_this.closed) {
              _this.close();
            }
          }, this.duration);
        }
      },
      keydown: function keydown(e) {
        if (e.keyCode === 46 || e.keyCode === 8) {
          this.clearTimer(); // detele 取消倒计时
        } else if (e.keyCode === 27) {
          // esc关闭消息
          if (!this.closed) {
            this.close();
          }
        } else {
          this.startTimer(); // 恢复倒计时
        }
      }
    },
    mounted: function mounted() {
      var _this2 = this;
      if (this.duration > 0) {
        this.timer = setTimeout(function () {
          if (!_this2.closed) {
            _this2.close();
          }
        }, this.duration);
      }
      document.addEventListener('keydown', this.keydown);
    },
    beforeDestroy: function beforeDestroy() {
      document.removeEventListener('keydown', this.keydown);
    }
  };

  /* script */
  var __vue_script__$1 = script$1;

  /* template */
  var __vue_render__$1 = function __vue_render__() {
    var _vm = this;
    var _h = _vm.$createElement;
    var _c = _vm._self._c || _h;
    return _c("transition", {
      attrs: {
        name: "el-notification-fade"
      }
    }, [_c("div", {
      directives: [{
        name: "show",
        rawName: "v-show",
        value: _vm.visible,
        expression: "visible"
      }],
      "class": ["el-notification", _vm.customClass, _vm.horizontalClass],
      style: _vm.positionStyle,
      attrs: {
        role: "alert"
      },
      on: {
        mouseenter: function mouseenter($event) {
          return _vm.clearTimer();
        },
        mouseleave: function mouseleave($event) {
          return _vm.startTimer();
        },
        click: _vm.click
      }
    }, [_vm.type || _vm.iconClass ? _c("i", {
      staticClass: "el-notification__icon",
      "class": [_vm.typeClass, _vm.iconClass]
    }) : _vm._e(), _vm._v(" "), _c("div", {
      staticClass: "el-notification__group",
      "class": {
        "is-with-icon": _vm.typeClass || _vm.iconClass
      }
    }, [_c("h2", {
      staticClass: "el-notification__title",
      domProps: {
        textContent: _vm._s(_vm.title)
      }
    }), _vm._v(" "), _c("div", {
      directives: [{
        name: "show",
        rawName: "v-show",
        value: _vm.message,
        expression: "message"
      }],
      staticClass: "el-notification__content"
    }, [_vm._t("default", function () {
      return [!_vm.dangerouslyUseHTMLString ? _c("p", [_vm._v(_vm._s(_vm.message))]) : _c("p", {
        domProps: {
          innerHTML: _vm._s(_vm.message)
        }
      })];
    })], 2), _vm._v(" "), _vm.showClose ? _c("div", {
      staticClass: "el-notification__closeBtn el-icon-close",
      on: {
        click: function click($event) {
          $event.stopPropagation();
          return _vm.close.apply(null, arguments);
        }
      }
    }) : _vm._e()])])]);
  };
  var __vue_staticRenderFns__$1 = [];
  __vue_render__$1._withStripped = true;

  /* style */
  var __vue_inject_styles__$1 = undefined;
  /* scoped */
  var __vue_scope_id__$1 = undefined;
  /* module identifier */
  var __vue_module_identifier__$1 = undefined;
  /* functional template */
  var __vue_is_functional_template__$1 = false;
  /* style inject */

  /* style inject SSR */

  /* style inject shadow dom */

  var __vue_component__$1 = /*#__PURE__*/normalizeComponent({
    render: __vue_render__$1,
    staticRenderFns: __vue_staticRenderFns__$1
  }, __vue_inject_styles__$1, __vue_script__$1, __vue_scope_id__$1, __vue_is_functional_template__$1, __vue_module_identifier__$1, false, undefined, undefined, undefined);

  function merge(target) {
    for (let i = 1, j = arguments.length; i < j; i++) {
      let source = arguments[i] || {};
      for (let prop in source) {
        if (source.hasOwnProperty(prop)) {
          let value = source[prop];
          if (value !== undefined) {
            target[prop] = value;
          }
        }
      }
    }

    return target;
  }

  /* istanbul ignore next */

  const isServer = Vue.prototype.$isServer;

  /* istanbul ignore next */
  const trim = function(string) {
    return (string || '').replace(/^[\s\uFEFF]+|[\s\uFEFF]+$/g, '');
  };

  /* istanbul ignore next */
  const on = (function() {
    if (!isServer && document.addEventListener) {
      return function(element, event, handler) {
        if (element && event && handler) {
          element.addEventListener(event, handler, false);
        }
      };
    } else {
      return function(element, event, handler) {
        if (element && event && handler) {
          element.attachEvent('on' + event, handler);
        }
      };
    }
  })();

  /* istanbul ignore next */
  const off = (function() {
    if (!isServer && document.removeEventListener) {
      return function(element, event, handler) {
        if (element && event) {
          element.removeEventListener(event, handler, false);
        }
      };
    } else {
      return function(element, event, handler) {
        if (element && event) {
          element.detachEvent('on' + event, handler);
        }
      };
    }
  })();

  /* istanbul ignore next */
  function hasClass(el, cls) {
    if (!el || !cls) return false;
    if (cls.indexOf(' ') !== -1) throw new Error('className should not contain space.');
    if (el.classList) {
      return el.classList.contains(cls);
    } else {
      return (' ' + el.className + ' ').indexOf(' ' + cls + ' ') > -1;
    }
  }
  /* istanbul ignore next */
  function addClass$1(el, cls) {
    if (!el) return;
    var curClass = el.className;
    var classes = (cls || '').split(' ');

    for (var i = 0, j = classes.length; i < j; i++) {
      var clsName = classes[i];
      if (!clsName) continue;

      if (el.classList) {
        el.classList.add(clsName);
      } else if (!hasClass(el, clsName)) {
        curClass += ' ' + clsName;
      }
    }
    if (!el.classList) {
      el.setAttribute('class', curClass);
    }
  }
  /* istanbul ignore next */
  function removeClass$1(el, cls) {
    if (!el || !cls) return;
    var classes = cls.split(' ');
    var curClass = ' ' + el.className + ' ';

    for (var i = 0, j = classes.length; i < j; i++) {
      var clsName = classes[i];
      if (!clsName) continue;

      if (el.classList) {
        el.classList.remove(clsName);
      } else if (hasClass(el, clsName)) {
        curClass = curClass.replace(' ' + clsName + ' ', ' ');
      }
    }
    if (!el.classList) {
      el.setAttribute('class', trim(curClass));
    }
  }

  let hasModal = false;
  let hasInitZIndex = false;
  let zIndex;

  const getModal = function() {
    if (Vue.prototype.$isServer) return;
    let modalDom = PopupManager.modalDom;
    if (modalDom) {
      hasModal = true;
    } else {
      hasModal = false;
      modalDom = document.createElement('div');
      PopupManager.modalDom = modalDom;

      modalDom.addEventListener('touchmove', function(event) {
        event.preventDefault();
        event.stopPropagation();
      });

      modalDom.addEventListener('click', function() {
        PopupManager.doOnModalClick && PopupManager.doOnModalClick();
      });
    }

    return modalDom;
  };

  const instances = {};

  const PopupManager = {
    modalFade: true,

    getInstance: function(id) {
      return instances[id];
    },

    register: function(id, instance) {
      if (id && instance) {
        instances[id] = instance;
      }
    },

    deregister: function(id) {
      if (id) {
        instances[id] = null;
        delete instances[id];
      }
    },

    nextZIndex: function() {
      return PopupManager.zIndex++;
    },

    modalStack: [],

    doOnModalClick: function() {
      const topItem = PopupManager.modalStack[PopupManager.modalStack.length - 1];
      if (!topItem) return;

      const instance = PopupManager.getInstance(topItem.id);
      if (instance && instance.closeOnClickModal) {
        instance.close();
      }
    },

    openModal: function(id, zIndex, dom, modalClass, modalFade) {
      if (Vue.prototype.$isServer) return;
      if (!id || zIndex === undefined) return;
      this.modalFade = modalFade;

      const modalStack = this.modalStack;

      for (let i = 0, j = modalStack.length; i < j; i++) {
        const item = modalStack[i];
        if (item.id === id) {
          return;
        }
      }

      const modalDom = getModal();

      addClass$1(modalDom, 'v-modal');
      if (this.modalFade && !hasModal) {
        addClass$1(modalDom, 'v-modal-enter');
      }
      if (modalClass) {
        let classArr = modalClass.trim().split(/\s+/);
        classArr.forEach(item => addClass$1(modalDom, item));
      }
      setTimeout(() => {
        removeClass$1(modalDom, 'v-modal-enter');
      }, 200);

      if (dom && dom.parentNode && dom.parentNode.nodeType !== 11) {
        dom.parentNode.appendChild(modalDom);
      } else {
        document.body.appendChild(modalDom);
      }

      if (zIndex) {
        modalDom.style.zIndex = zIndex;
      }
      modalDom.tabIndex = 0;
      modalDom.style.display = '';

      this.modalStack.push({ id: id, zIndex: zIndex, modalClass: modalClass });
    },

    closeModal: function(id) {
      const modalStack = this.modalStack;
      const modalDom = getModal();

      if (modalStack.length > 0) {
        const topItem = modalStack[modalStack.length - 1];
        if (topItem.id === id) {
          if (topItem.modalClass) {
            let classArr = topItem.modalClass.trim().split(/\s+/);
            classArr.forEach(item => removeClass$1(modalDom, item));
          }

          modalStack.pop();
          if (modalStack.length > 0) {
            modalDom.style.zIndex = modalStack[modalStack.length - 1].zIndex;
          }
        } else {
          for (let i = modalStack.length - 1; i >= 0; i--) {
            if (modalStack[i].id === id) {
              modalStack.splice(i, 1);
              break;
            }
          }
        }
      }

      if (modalStack.length === 0) {
        if (this.modalFade) {
          addClass$1(modalDom, 'v-modal-leave');
        }
        setTimeout(() => {
          if (modalStack.length === 0) {
            if (modalDom.parentNode) modalDom.parentNode.removeChild(modalDom);
            modalDom.style.display = 'none';
            PopupManager.modalDom = undefined;
          }
          removeClass$1(modalDom, 'v-modal-leave');
        }, 200);
      }
    }
  };

  Object.defineProperty(PopupManager, 'zIndex', {
    configurable: true,
    get() {
      if (!hasInitZIndex) {
        zIndex = zIndex || (Vue.prototype.$ELEMENT || {}).zIndex || 2000;
        hasInitZIndex = true;
      }
      return zIndex;
    },
    set(value) {
      zIndex = value;
    }
  });

  const getTopPopup = function() {
    if (Vue.prototype.$isServer) return;
    if (PopupManager.modalStack.length > 0) {
      const topPopup = PopupManager.modalStack[PopupManager.modalStack.length - 1];
      if (!topPopup) return;
      const instance = PopupManager.getInstance(topPopup.id);

      return instance;
    }
  };

  if (!Vue.prototype.$isServer) {
    // handle `esc` key when the popup is shown
    window.addEventListener('keydown', function(event) {
      if (event.keyCode === 27) {
        const topPopup = getTopPopup();

        if (topPopup && topPopup.closeOnPressEscape) {
          topPopup.handleClose
            ? topPopup.handleClose()
            : (topPopup.handleAction ? topPopup.handleAction('cancel') : topPopup.close());
        }
      }
    });
  }

  let scrollBarWidth;

  function scrollbarWidth() {
    if (Vue.prototype.$isServer) return 0;
    if (scrollBarWidth !== undefined) return scrollBarWidth;

    const outer = document.createElement('div');
    outer.className = 'el-scrollbar__wrap';
    outer.style.visibility = 'hidden';
    outer.style.width = '100px';
    outer.style.position = 'absolute';
    outer.style.top = '-9999px';
    document.body.appendChild(outer);

    const widthNoScroll = outer.offsetWidth;
    outer.style.overflow = 'scroll';

    const inner = document.createElement('div');
    inner.style.width = '100%';
    outer.appendChild(inner);

    const widthWithScroll = inner.offsetWidth;
    outer.parentNode.removeChild(outer);
    scrollBarWidth = widthNoScroll - widthWithScroll;

    return scrollBarWidth;
  }

  function isVNode(node) {
    return node !== null && typeof node === 'object' && hasOwn$2(node, 'componentOptions');
  }

  var NotificationConstructor = Vue.extend(__vue_component__$1);
  var instance;
  var instances$1 = [];
  var seed = 1;
  var Notification = function Notification(options) {
    if (Vue.prototype.$isServer) return;
    options = merge({}, options);
    var userOnClose = options.onClose;
    var id = 'notification_' + seed++;
    var position = options.position || 'top-right';
    options.onClose = function () {
      Notification.close(id, userOnClose);
    };
    instance = new NotificationConstructor({
      data: options
    });
    if (isVNode(options.message)) {
      instance.$slots["default"] = [options.message];
      options.message = 'REPLACED_BY_VNODE';
    }
    instance.id = id;
    instance.$mount();
    document.body.appendChild(instance.$el);
    instance.visible = true;
    instance.dom = instance.$el;
    instance.dom.style.zIndex = PopupManager.nextZIndex();
    var verticalOffset = options.offset || 0;
    instances$1.filter(function (item) {
      return item.position === position;
    }).forEach(function (item) {
      verticalOffset += item.$el.offsetHeight + 16;
    });
    verticalOffset += 16;
    instance.verticalOffset = verticalOffset;
    instances$1.push(instance);
    return instance;
  };
  ['success', 'warning', 'info', 'error'].forEach(function (type) {
    Notification[type] = function (options) {
      if (typeof options === 'string' || isVNode(options)) {
        options = {
          message: options
        };
      }
      options.type = type;
      return Notification(options);
    };
  });
  Notification.close = function (id, userOnClose) {
    var index = -1;
    var len = instances$1.length;
    var instance = instances$1.filter(function (instance, i) {
      if (instance.id === id) {
        index = i;
        return true;
      }
      return false;
    })[0];
    if (!instance) return;
    if (typeof userOnClose === 'function') {
      userOnClose(instance);
    }
    instances$1.splice(index, 1);
    if (len <= 1) return;
    var position = instance.position;
    var removedHeight = instance.dom.offsetHeight;
    for (var i = index; i < len - 1; i++) {
      if (instances$1[i].position === position) {
        instances$1[i].dom.style[instance.verticalProperty] = parseInt(instances$1[i].dom.style[instance.verticalProperty], 10) - removedHeight - 16 + 'px';
      }
    }
  };
  Notification.closeAll = function () {
    for (var i = instances$1.length - 1; i >= 0; i--) {
      instances$1[i].close();
    }
  };

  function Focus(ref) {
    return {
      methods: {
        focus() {
          this.$refs[ref].focus();
        }
      }
    };
  }

  var defaultLang = {
    el: {
      colorpicker: {
        confirm: '确定',
        clear: '清空'
      },
      datepicker: {
        now: '此刻',
        today: '今天',
        cancel: '取消',
        clear: '清空',
        confirm: '确定',
        selectDate: '选择日期',
        selectTime: '选择时间',
        startDate: '开始日期',
        startTime: '开始时间',
        endDate: '结束日期',
        endTime: '结束时间',
        prevYear: '前一年',
        nextYear: '后一年',
        prevMonth: '上个月',
        nextMonth: '下个月',
        year: '年',
        month1: '1 月',
        month2: '2 月',
        month3: '3 月',
        month4: '4 月',
        month5: '5 月',
        month6: '6 月',
        month7: '7 月',
        month8: '8 月',
        month9: '9 月',
        month10: '10 月',
        month11: '11 月',
        month12: '12 月',
        // week: '周次',
        weeks: {
          sun: '日',
          mon: '一',
          tue: '二',
          wed: '三',
          thu: '四',
          fri: '五',
          sat: '六'
        },
        months: {
          jan: '一月',
          feb: '二月',
          mar: '三月',
          apr: '四月',
          may: '五月',
          jun: '六月',
          jul: '七月',
          aug: '八月',
          sep: '九月',
          oct: '十月',
          nov: '十一月',
          dec: '十二月'
        }
      },
      select: {
        loading: '加载中',
        noMatch: '无匹配数据',
        noData: '无数据',
        placeholder: '请选择'
      },
      cascader: {
        noMatch: '无匹配数据',
        loading: '加载中',
        placeholder: '请选择',
        noData: '暂无数据'
      },
      pagination: {
        goto: '前往',
        pagesize: '条/页',
        total: '共 {total} 条',
        pageClassifier: '页'
      },
      messagebox: {
        title: '提示',
        confirm: '确定',
        cancel: '取消',
        error: '输入的数据不合法!'
      },
      upload: {
        deleteTip: '按 delete 键可删除',
        delete: '删除',
        preview: '查看图片',
        continue: '继续上传'
      },
      table: {
        emptyText: '暂无数据',
        confirmFilter: '筛选',
        resetFilter: '重置',
        clearFilter: '全部',
        sumText: '合计'
      },
      tree: {
        emptyText: '暂无数据'
      },
      transfer: {
        noMatch: '无匹配数据',
        noData: '无数据',
        titles: ['列表 1', '列表 2'],
        filterPlaceholder: '请输入搜索内容',
        noCheckedFormat: '共 {total} 项',
        hasCheckedFormat: '已选 {checked}/{total} 项'
      },
      image: {
        error: '加载失败'
      },
      pageHeader: {
        title: '返回'
      },
      popconfirm: {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      },
      empty: {
        description: '暂无数据'
      }
    }
  };

  var isMergeableObject = function isMergeableObject(value) {
  	return isNonNullObject(value)
  		&& !isSpecial(value)
  };

  function isNonNullObject(value) {
  	return !!value && typeof value === 'object'
  }

  function isSpecial(value) {
  	var stringValue = Object.prototype.toString.call(value);

  	return stringValue === '[object RegExp]'
  		|| stringValue === '[object Date]'
  		|| isReactElement(value)
  }

  // see https://github.com/facebook/react/blob/b5ac963fb791d1298e7f396236383bc955f916c1/src/isomorphic/classic/element/ReactElement.js#L21-L25
  var canUseSymbol = typeof Symbol === 'function' && Symbol.for;
  var REACT_ELEMENT_TYPE = canUseSymbol ? Symbol.for('react.element') : 0xeac7;

  function isReactElement(value) {
  	return value.$$typeof === REACT_ELEMENT_TYPE
  }

  function emptyTarget(val) {
      return Array.isArray(val) ? [] : {}
  }

  function cloneIfNecessary(value, optionsArgument) {
      var clone = optionsArgument && optionsArgument.clone === true;
      return (clone && isMergeableObject(value)) ? deepmerge(emptyTarget(value), value, optionsArgument) : value
  }

  function defaultArrayMerge(target, source, optionsArgument) {
      var destination = target.slice();
      source.forEach(function(e, i) {
          if (typeof destination[i] === 'undefined') {
              destination[i] = cloneIfNecessary(e, optionsArgument);
          } else if (isMergeableObject(e)) {
              destination[i] = deepmerge(target[i], e, optionsArgument);
          } else if (target.indexOf(e) === -1) {
              destination.push(cloneIfNecessary(e, optionsArgument));
          }
      });
      return destination
  }

  function mergeObject(target, source, optionsArgument) {
      var destination = {};
      if (isMergeableObject(target)) {
          Object.keys(target).forEach(function(key) {
              destination[key] = cloneIfNecessary(target[key], optionsArgument);
          });
      }
      Object.keys(source).forEach(function(key) {
          if (!isMergeableObject(source[key]) || !target[key]) {
              destination[key] = cloneIfNecessary(source[key], optionsArgument);
          } else {
              destination[key] = deepmerge(target[key], source[key], optionsArgument);
          }
      });
      return destination
  }

  function deepmerge(target, source, optionsArgument) {
      var sourceIsArray = Array.isArray(source);
      var targetIsArray = Array.isArray(target);
      var options = optionsArgument || { arrayMerge: defaultArrayMerge };
      var sourceAndTargetTypesMatch = sourceIsArray === targetIsArray;

      if (!sourceAndTargetTypesMatch) {
          return cloneIfNecessary(source, optionsArgument)
      } else if (sourceIsArray) {
          var arrayMerge = options.arrayMerge || defaultArrayMerge;
          return arrayMerge(target, source, optionsArgument)
      } else {
          return mergeObject(target, source, optionsArgument)
      }
  }

  deepmerge.all = function deepmergeAll(array, optionsArgument) {
      if (!Array.isArray(array) || array.length < 2) {
          throw new Error('first argument should be an array with at least two elements')
      }

      // we are sure there are at least 2 values, so it is safe to have no initial value
      return array.reduce(function(prev, next) {
          return deepmerge(prev, next, optionsArgument)
      })
  };

  var deepmerge_1 = deepmerge;

  const RE_NARGS = /(%|)\{([0-9a-zA-Z_]+)\}/g;
  /**
   *  String format template
   *  - Inspired:
   *    https://github.com/Matt-Esch/string-template/index.js
   */
  function Format(Vue) {

    /**
     * template
     *
     * @param {String} string
     * @param {Array} ...args
     * @return {String}
     */

    function template(string, ...args) {
      if (args.length === 1 && typeof args[0] === 'object') {
        args = args[0];
      }

      if (!args || !args.hasOwnProperty) {
        args = {};
      }

      return string.replace(RE_NARGS, (match, prefix, i, index) => {
        let result;

        if (string[index - 1] === '{' &&
          string[index + match.length] === '}') {
          return i;
        } else {
          result = hasOwn$2(args, i) ? args[i] : null;
          if (result === null || result === undefined) {
            return '';
          }

          return result;
        }
      });
    }

    return template;
  }

  const format = Format();
  let lang = defaultLang;
  let merged = false;
  let i18nHandler = function() {
    const vuei18n = Object.getPrototypeOf(this || Vue).$t;
    if (typeof vuei18n === 'function' && !!Vue.locale) {
      if (!merged) {
        merged = true;
        Vue.locale(
          Vue.config.lang,
          deepmerge_1(lang, Vue.locale(Vue.config.lang) || {}, { clone: true })
        );
      }
      return vuei18n.apply(this, arguments);
    }
  };

  const t = function(path, options) {
    let value = i18nHandler.apply(this, arguments);
    if (value !== null && value !== undefined) return value;

    const array = path.split('.');
    let current = lang;

    for (let i = 0, j = array.length; i < j; i++) {
      const property = array[i];
      value = current[property];
      if (i === j - 1) return format(value, options);
      if (!value) return '';
      current = value;
    }
    return '';
  };

  var Locale = {
    methods: {
      t(...args) {
        return t.apply(this, args);
      }
    }
  };

  /**
   * Show migrating guide in browser console.
   *
   * Usage:
   * import Migrating from 'element-ui/src/mixins/migrating';
   *
   * mixins: [Migrating]
   *
   * add getMigratingConfig method for your component.
   *  getMigratingConfig() {
   *    return {
   *      props: {
   *        'allow-no-selection': 'allow-no-selection is removed.',
   *        'selection-mode': 'selection-mode is removed.'
   *      },
   *      events: {
   *        selectionchange: 'selectionchange is renamed to selection-change.'
   *      }
   *    };
   *  },
   */
  var Migrating = {
    mounted() {
      if (!this.$vnode) return;
      const { props = {}, events = {} } = this.getMigratingConfig();
      const { data, componentOptions } = this.$vnode;
      const definedProps = data.attrs || {};
      const definedEvents = componentOptions.listeners || {};

      for (let propName in definedProps) {
        propName = kebabCase(propName); // compatible with camel case
        if (props[propName]) {
          console.warn(`[Element Migrating][${this.$options.name}][Attribute]: ${props[propName]}`);
        }
      }

      for (let eventName in definedEvents) {
        eventName = kebabCase(eventName); // compatible with camel case
        if (events[eventName]) {
          console.warn(`[Element Migrating][${this.$options.name}][Event]: ${events[eventName]}`);
        }
      }
    },
    methods: {
      getMigratingConfig() {
        return {
          props: {},
          events: {}
        };
      }
    }
  };

  var hiddenTextarea;
  var HIDDEN_STYLE = "\n  height:0 !important;\n  visibility:hidden !important;\n  overflow:hidden !important;\n  position:absolute !important;\n  z-index:-1000 !important;\n  top:0 !important;\n  right:0 !important\n";
  var CONTEXT_STYLE = ['letter-spacing', 'line-height', 'padding-top', 'padding-bottom', 'font-family', 'font-weight', 'font-size', 'text-rendering', 'text-transform', 'width', 'text-indent', 'padding-left', 'padding-right', 'border-width', 'box-sizing'];
  function calculateNodeStyling(targetElement) {
    var style = window.getComputedStyle(targetElement);
    var boxSizing = style.getPropertyValue('box-sizing');
    var paddingSize = parseFloat(style.getPropertyValue('padding-bottom')) + parseFloat(style.getPropertyValue('padding-top'));
    var borderSize = parseFloat(style.getPropertyValue('border-bottom-width')) + parseFloat(style.getPropertyValue('border-top-width'));
    var contextStyle = CONTEXT_STYLE.map(function (name) {
      return "".concat(name, ":").concat(style.getPropertyValue(name));
    }).join(';');
    return {
      contextStyle: contextStyle,
      paddingSize: paddingSize,
      borderSize: borderSize,
      boxSizing: boxSizing
    };
  }
  function calcTextareaHeight(targetElement) {
    var minRows = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
    var maxRows = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
    if (!hiddenTextarea) {
      hiddenTextarea = document.createElement('textarea');
      document.body.appendChild(hiddenTextarea);
    }
    var _calculateNodeStyling = calculateNodeStyling(targetElement),
      paddingSize = _calculateNodeStyling.paddingSize,
      borderSize = _calculateNodeStyling.borderSize,
      boxSizing = _calculateNodeStyling.boxSizing,
      contextStyle = _calculateNodeStyling.contextStyle;
    hiddenTextarea.setAttribute('style', "".concat(contextStyle, ";").concat(HIDDEN_STYLE));
    hiddenTextarea.value = targetElement.value || targetElement.placeholder || '';
    var height = hiddenTextarea.scrollHeight;
    var result = {};
    if (boxSizing === 'border-box') {
      height = height + borderSize;
    } else if (boxSizing === 'content-box') {
      height = height - paddingSize;
    }
    hiddenTextarea.value = '';
    var singleRowHeight = hiddenTextarea.scrollHeight - paddingSize;
    if (minRows !== null) {
      var minHeight = singleRowHeight * minRows;
      if (boxSizing === 'border-box') {
        minHeight = minHeight + paddingSize + borderSize;
      }
      height = Math.max(minHeight, height);
      result.minHeight = "".concat(minHeight, "px");
    }
    if (maxRows !== null) {
      var maxHeight = singleRowHeight * maxRows;
      if (boxSizing === 'border-box') {
        maxHeight = maxHeight + paddingSize + borderSize;
      }
      height = Math.min(maxHeight, height);
    }
    result.height = "".concat(height, "px");
    hiddenTextarea.parentNode && hiddenTextarea.parentNode.removeChild(hiddenTextarea);
    hiddenTextarea = null;
    return result;
  }

  function isKorean(text) {
    const reg = /([(\uAC00-\uD7AF)|(\u3130-\u318F)])+/gi;
    return reg.test(text);
  }

  //
  var script$2 = {
    name: 'ElInput',
    componentName: 'ElInput',
    mixins: [Emitter, Migrating],
    inheritAttrs: false,
    inject: {
      elForm: {
        "default": ''
      },
      elFormItem: {
        "default": ''
      }
    },
    data: function data() {
      return {
        textareaCalcStyle: {},
        hovering: false,
        focused: false,
        isComposing: false,
        passwordVisible: false
      };
    },
    props: {
      value: [String, Number],
      size: String,
      resize: String,
      form: String,
      disabled: Boolean,
      readonly: Boolean,
      type: {
        type: String,
        "default": 'text'
      },
      autosize: {
        type: [Boolean, Object],
        "default": false
      },
      autocomplete: {
        type: String,
        "default": 'off'
      },
      /** @Deprecated in next major version */
      autoComplete: {
        type: String,
        validator: function validator(val) {
           console.warn('[Element Warn][Input]\'auto-complete\' property will be deprecated in next major version. please use \'autocomplete\' instead.');
          return true;
        }
      },
      validateEvent: {
        type: Boolean,
        "default": true
      },
      suffixIcon: String,
      prefixIcon: String,
      label: String,
      clearable: {
        type: Boolean,
        "default": false
      },
      showPassword: {
        type: Boolean,
        "default": false
      },
      showWordLimit: {
        type: Boolean,
        "default": false
      },
      tabindex: String
    },
    computed: {
      _elFormItemSize: function _elFormItemSize() {
        return (this.elFormItem || {}).elFormItemSize;
      },
      validateState: function validateState() {
        return this.elFormItem ? this.elFormItem.validateState : '';
      },
      needStatusIcon: function needStatusIcon() {
        return this.elForm ? this.elForm.statusIcon : false;
      },
      validateIcon: function validateIcon() {
        return {
          validating: 'el-icon-loading',
          success: 'el-icon-circle-check',
          error: 'el-icon-circle-close'
        }[this.validateState];
      },
      textareaStyle: function textareaStyle() {
        return merge({}, this.textareaCalcStyle, {
          resize: this.resize
        });
      },
      inputSize: function inputSize() {
        return this.size || this._elFormItemSize || (this.$ELEMENT || {}).size;
      },
      inputDisabled: function inputDisabled() {
        return this.disabled || (this.elForm || {}).disabled;
      },
      nativeInputValue: function nativeInputValue() {
        return this.value === null || this.value === undefined ? '' : String(this.value);
      },
      showClear: function showClear() {
        return this.clearable && !this.inputDisabled && !this.readonly && this.nativeInputValue && (this.focused || this.hovering);
      },
      showPwdVisible: function showPwdVisible() {
        return this.showPassword && !this.inputDisabled && !this.readonly && (!!this.nativeInputValue || this.focused);
      },
      isWordLimitVisible: function isWordLimitVisible() {
        return this.showWordLimit && this.$attrs.maxlength && (this.type === 'text' || this.type === 'textarea') && !this.inputDisabled && !this.readonly && !this.showPassword;
      },
      upperLimit: function upperLimit() {
        return this.$attrs.maxlength;
      },
      textLength: function textLength() {
        if (typeof this.value === 'number') {
          return String(this.value).length;
        }
        return (this.value || '').length;
      },
      inputExceed: function inputExceed() {
        // show exceed style if length of initial value greater then maxlength
        return this.isWordLimitVisible && this.textLength > this.upperLimit;
      }
    },
    watch: {
      value: function value(val) {
        this.$nextTick(this.resizeTextarea);
        if (this.validateEvent) {
          this.dispatch('ElFormItem', 'el.form.change', [val]);
        }
      },
      // native input value is set explicitly
      // do not use v-model / :value in template
      // see: https://github.com/ElemeFE/element/issues/14521
      nativeInputValue: function nativeInputValue() {
        this.setNativeInputValue();
      },
      // when change between <input> and <textarea>,
      // update DOM dependent value and styles
      // https://github.com/ElemeFE/element/issues/14857
      type: function type() {
        var _this = this;
        this.$nextTick(function () {
          _this.setNativeInputValue();
          _this.resizeTextarea();
          _this.updateIconOffset();
        });
      }
    },
    methods: {
      focus: function focus() {
        this.getInput().focus();
      },
      blur: function blur() {
        this.getInput().blur();
      },
      getMigratingConfig: function getMigratingConfig() {
        return {
          props: {
            'icon': 'icon is removed, use suffix-icon / prefix-icon instead.',
            'on-icon-click': 'on-icon-click is removed.'
          },
          events: {
            'click': 'click is removed.'
          }
        };
      },
      handleBlur: function handleBlur(event) {
        this.focused = false;
        this.$emit('blur', event);
        if (this.validateEvent) {
          this.dispatch('ElFormItem', 'el.form.blur', [this.value]);
        }
      },
      select: function select() {
        this.getInput().select();
      },
      resizeTextarea: function resizeTextarea() {
        if (this.$isServer) return;
        var autosize = this.autosize,
          type = this.type;
        if (type !== 'textarea') return;
        if (!autosize) {
          this.textareaCalcStyle = {
            minHeight: calcTextareaHeight(this.$refs.textarea).minHeight
          };
          return;
        }
        var minRows = autosize.minRows;
        var maxRows = autosize.maxRows;
        this.textareaCalcStyle = calcTextareaHeight(this.$refs.textarea, minRows, maxRows);
      },
      setNativeInputValue: function setNativeInputValue() {
        var input = this.getInput();
        if (!input) return;
        if (input.value === this.nativeInputValue) return;
        input.value = this.nativeInputValue;
      },
      handleFocus: function handleFocus(event) {
        this.focused = true;
        this.$emit('focus', event);
      },
      handleCompositionStart: function handleCompositionStart(event) {
        this.$emit('compositionstart', event);
        this.isComposing = true;
      },
      handleCompositionUpdate: function handleCompositionUpdate(event) {
        this.$emit('compositionupdate', event);
        var text = event.target.value;
        var lastCharacter = text[text.length - 1] || '';
        this.isComposing = !isKorean(lastCharacter);
      },
      handleCompositionEnd: function handleCompositionEnd(event) {
        this.$emit('compositionend', event);
        if (this.isComposing) {
          this.isComposing = false;
          this.handleInput(event);
        }
      },
      handleInput: function handleInput(event) {
        // should not emit input during composition
        // see: https://github.com/ElemeFE/element/issues/10516
        if (this.isComposing) return;

        // hack for https://github.com/ElemeFE/element/issues/8548
        // should remove the following line when we don't support IE
        if (event.target.value === this.nativeInputValue) return;
        this.$emit('input', event.target.value);

        // ensure native input value is controlled
        // see: https://github.com/ElemeFE/element/issues/12850
        this.$nextTick(this.setNativeInputValue);
      },
      handleChange: function handleChange(event) {
        this.$emit('change', event.target.value);
      },
      calcIconOffset: function calcIconOffset(place) {
        var elList = [].slice.call(this.$el.querySelectorAll(".el-input__".concat(place)) || []);
        if (!elList.length) return;
        var el = null;
        for (var i = 0; i < elList.length; i++) {
          if (elList[i].parentNode === this.$el) {
            el = elList[i];
            break;
          }
        }
        if (!el) return;
        var pendantMap = {
          suffix: 'append',
          prefix: 'prepend'
        };
        var pendant = pendantMap[place];
        if (this.$slots[pendant]) {
          el.style.transform = "translateX(".concat(place === 'suffix' ? '-' : '').concat(this.$el.querySelector(".el-input-group__".concat(pendant)).offsetWidth, "px)");
        } else {
          el.removeAttribute('style');
        }
      },
      updateIconOffset: function updateIconOffset() {
        this.calcIconOffset('prefix');
        this.calcIconOffset('suffix');
      },
      clear: function clear() {
        this.$emit('input', '');
        this.$emit('change', '');
        this.$emit('clear');
      },
      handlePasswordVisible: function handlePasswordVisible() {
        var _this2 = this;
        this.passwordVisible = !this.passwordVisible;
        this.$nextTick(function () {
          _this2.focus();
        });
      },
      getInput: function getInput() {
        return this.$refs.input || this.$refs.textarea;
      },
      getSuffixVisible: function getSuffixVisible() {
        return this.$slots.suffix || this.suffixIcon || this.showClear || this.showPassword || this.isWordLimitVisible || this.validateState && this.needStatusIcon;
      }
    },
    created: function created() {
      this.$on('inputSelect', this.select);
    },
    mounted: function mounted() {
      this.setNativeInputValue();
      this.resizeTextarea();
      this.updateIconOffset();
    },
    updated: function updated() {
      this.$nextTick(this.updateIconOffset);
    }
  };

  /* script */
  var __vue_script__$2 = script$2;

  /* template */
  var __vue_render__$2 = function __vue_render__() {
    var _vm = this;
    var _h = _vm.$createElement;
    var _c = _vm._self._c || _h;
    return _c("div", {
      "class": [_vm.type === "textarea" ? "el-textarea" : "el-input", _vm.inputSize ? "el-input--" + _vm.inputSize : "", {
        "is-disabled": _vm.inputDisabled,
        "is-exceed": _vm.inputExceed,
        "el-input-group": _vm.$slots.prepend || _vm.$slots.append,
        "el-input-group--append": _vm.$slots.append,
        "el-input-group--prepend": _vm.$slots.prepend,
        "el-input--prefix": _vm.$slots.prefix || _vm.prefixIcon,
        "el-input--suffix": _vm.$slots.suffix || _vm.suffixIcon || _vm.clearable || _vm.showPassword
      }],
      on: {
        mouseenter: function mouseenter($event) {
          _vm.hovering = true;
        },
        mouseleave: function mouseleave($event) {
          _vm.hovering = false;
        }
      }
    }, [_vm.type !== "textarea" ? [_vm.$slots.prepend ? _c("div", {
      staticClass: "el-input-group__prepend"
    }, [_vm._t("prepend")], 2) : _vm._e(), _vm._v(" "), _vm.type !== "textarea" ? _c("input", _vm._b({
      ref: "input",
      staticClass: "el-input__inner",
      attrs: {
        tabindex: _vm.tabindex,
        type: _vm.showPassword ? _vm.passwordVisible ? "text" : "password" : _vm.type,
        disabled: _vm.inputDisabled,
        readonly: _vm.readonly,
        autocomplete: _vm.autoComplete || _vm.autocomplete,
        "aria-label": _vm.label
      },
      on: {
        compositionstart: _vm.handleCompositionStart,
        compositionupdate: _vm.handleCompositionUpdate,
        compositionend: _vm.handleCompositionEnd,
        input: _vm.handleInput,
        focus: _vm.handleFocus,
        blur: _vm.handleBlur,
        change: _vm.handleChange
      }
    }, "input", _vm.$attrs, false)) : _vm._e(), _vm._v(" "), _vm.$slots.prefix || _vm.prefixIcon ? _c("span", {
      staticClass: "el-input__prefix"
    }, [_vm._t("prefix"), _vm._v(" "), _vm.prefixIcon ? _c("i", {
      staticClass: "el-input__icon",
      "class": _vm.prefixIcon
    }) : _vm._e()], 2) : _vm._e(), _vm._v(" "), _vm.getSuffixVisible() ? _c("span", {
      staticClass: "el-input__suffix"
    }, [_c("span", {
      staticClass: "el-input__suffix-inner"
    }, [!_vm.showClear || !_vm.showPwdVisible || !_vm.isWordLimitVisible ? [_vm._t("suffix"), _vm._v(" "), _vm.suffixIcon ? _c("i", {
      staticClass: "el-input__icon",
      "class": _vm.suffixIcon
    }) : _vm._e()] : _vm._e(), _vm._v(" "), _vm.showClear ? _c("i", {
      staticClass: "el-input__icon el-icon-circle-close el-input__clear",
      on: {
        mousedown: function mousedown($event) {
          $event.preventDefault();
        },
        click: _vm.clear
      }
    }) : _vm._e(), _vm._v(" "), _vm.showPwdVisible ? _c("i", {
      staticClass: "el-input__icon el-icon-view el-input__clear",
      on: {
        click: _vm.handlePasswordVisible
      }
    }) : _vm._e(), _vm._v(" "), _vm.isWordLimitVisible ? _c("span", {
      staticClass: "el-input__count"
    }, [_c("span", {
      staticClass: "el-input__count-inner"
    }, [_vm._v("\n            " + _vm._s(_vm.textLength) + "/" + _vm._s(_vm.upperLimit) + "\n          ")])]) : _vm._e()], 2), _vm._v(" "), _vm.validateState ? _c("i", {
      staticClass: "el-input__icon",
      "class": ["el-input__validateIcon", _vm.validateIcon]
    }) : _vm._e()]) : _vm._e(), _vm._v(" "), _vm.$slots.append ? _c("div", {
      staticClass: "el-input-group__append"
    }, [_vm._t("append")], 2) : _vm._e()] : _c("textarea", _vm._b({
      ref: "textarea",
      staticClass: "el-textarea__inner",
      style: _vm.textareaStyle,
      attrs: {
        tabindex: _vm.tabindex,
        disabled: _vm.inputDisabled,
        readonly: _vm.readonly,
        autocomplete: _vm.autoComplete || _vm.autocomplete,
        "aria-label": _vm.label
      },
      on: {
        compositionstart: _vm.handleCompositionStart,
        compositionupdate: _vm.handleCompositionUpdate,
        compositionend: _vm.handleCompositionEnd,
        input: _vm.handleInput,
        focus: _vm.handleFocus,
        blur: _vm.handleBlur,
        change: _vm.handleChange
      }
    }, "textarea", _vm.$attrs, false)), _vm._v(" "), _vm.isWordLimitVisible && _vm.type === "textarea" ? _c("span", {
      staticClass: "el-input__count"
    }, [_vm._v(_vm._s(_vm.textLength) + "/" + _vm._s(_vm.upperLimit))]) : _vm._e()], 2);
  };
  var __vue_staticRenderFns__$2 = [];
  __vue_render__$2._withStripped = true;

  /* style */
  var __vue_inject_styles__$2 = undefined;
  /* scoped */
  var __vue_scope_id__$2 = undefined;
  /* module identifier */
  var __vue_module_identifier__$2 = undefined;
  /* functional template */
  var __vue_is_functional_template__$2 = false;
  /* style inject */

  /* style inject SSR */

  /* style inject shadow dom */

  var __vue_component__$2 = /*#__PURE__*/normalizeComponent({
    render: __vue_render__$2,
    staticRenderFns: __vue_staticRenderFns__$2
  }, __vue_inject_styles__$2, __vue_script__$2, __vue_scope_id__$2, __vue_is_functional_template__$2, __vue_module_identifier__$2, false, undefined, undefined, undefined);

  /* istanbul ignore next */
  __vue_component__$2.install = function (Vue) {
    Vue.component(__vue_component__$2.name, __vue_component__$2);
  };

  const PopperJS = Vue.prototype.$isServer ? function() {} : require('./popper');
  const stop = e => e.stopPropagation();

  /**
   * @param {HTMLElement} [reference=$refs.reference] - The reference element used to position the popper.
   * @param {HTMLElement} [popper=$refs.popper] - The HTML element used as popper, or a configuration used to generate the popper.
   * @param {String} [placement=button] - Placement of the popper accepted values: top(-start, -end), right(-start, -end), bottom(-start, -end), left(-start, -end)
   * @param {Number} [offset=0] - Amount of pixels the popper will be shifted (can be negative).
   * @param {Boolean} [visible=false] Visibility of the popup element.
   * @param {Boolean} [visible-arrow=false] Visibility of the arrow, no style.
   */
  var Popper = {
    props: {
      transformOrigin: {
        type: [Boolean, String],
        default: true
      },
      placement: {
        type: String,
        default: 'bottom'
      },
      boundariesPadding: {
        type: Number,
        default: 5
      },
      reference: {},
      popper: {},
      offset: {
        default: 0
      },
      value: Boolean,
      visibleArrow: Boolean,
      arrowOffset: {
        type: Number,
        default: 35
      },
      appendToBody: {
        type: Boolean,
        default: true
      },
      popperOptions: {
        type: Object,
        default() {
          return {
            gpuAcceleration: false
          };
        }
      }
    },

    data() {
      return {
        showPopper: false,
        currentPlacement: ''
      };
    },

    watch: {
      value: {
        immediate: true,
        handler(val) {
          this.showPopper = val;
          this.$emit('input', val);
        }
      },

      showPopper(val) {
        if (this.disabled) return;
        val ? this.updatePopper() : this.destroyPopper();
        this.$emit('input', val);
      }
    },

    methods: {
      createPopper() {
        if (this.$isServer) return;
        this.currentPlacement = this.currentPlacement || this.placement;
        if (!/^(top|bottom|left|right)(-start|-end)?$/g.test(this.currentPlacement)) {
          return;
        }

        const options = this.popperOptions;
        const popper = this.popperElm = this.popperElm || this.popper || this.$refs.popper;
        let reference = this.referenceElm = this.referenceElm || this.reference || this.$refs.reference;

        if (!reference &&
          this.$slots.reference &&
          this.$slots.reference[0]) {
          reference = this.referenceElm = this.$slots.reference[0].elm;
        }

        if (!popper || !reference) return;
        if (this.visibleArrow) this.appendArrow(popper);
        if (this.appendToBody) document.body.appendChild(this.popperElm);
        if (this.popperJS && this.popperJS.destroy) {
          this.popperJS.destroy();
        }

        options.placement = this.currentPlacement;
        options.offset = this.offset;
        options.arrowOffset = this.arrowOffset;
        this.popperJS = new PopperJS(reference, popper, options);
        this.popperJS.onCreate(_ => {
          this.$emit('created', this);
          this.resetTransformOrigin();
          this.$nextTick(this.updatePopper);
        });
        if (typeof options.onUpdate === 'function') {
          this.popperJS.onUpdate(options.onUpdate);
        }
        this.popperJS._popper.style.zIndex = PopupManager.nextZIndex();
        this.popperElm.addEventListener('click', stop);
      },

      updatePopper() {
        const popperJS = this.popperJS;
        if (popperJS) {
          popperJS.update();
          if (popperJS._popper) {
            popperJS._popper.style.zIndex = PopupManager.nextZIndex();
          }
        } else {
          this.createPopper();
        }
      },

      doDestroy(forceDestroy) {
        /* istanbul ignore if */
        if (!this.popperJS || (this.showPopper && !forceDestroy)) return;
        this.popperJS.destroy();
        this.popperJS = null;
      },

      destroyPopper() {
        if (this.popperJS) {
          this.resetTransformOrigin();
        }
      },

      resetTransformOrigin() {
        if (!this.transformOrigin) return;
        let placementMap = {
          top: 'bottom',
          bottom: 'top',
          left: 'right',
          right: 'left'
        };
        let placement = this.popperJS._popper.getAttribute('x-placement').split('-')[0];
        let origin = placementMap[placement];
        this.popperJS._popper.style.transformOrigin = typeof this.transformOrigin === 'string'
          ? this.transformOrigin
          : ['top', 'bottom'].indexOf(placement) > -1 ? `center ${ origin }` : `${ origin } center`;
      },

      appendArrow(element) {
        let hash;
        if (this.appended) {
          return;
        }

        this.appended = true;

        for (let item in element.attributes) {
          if (/^_v-/.test(element.attributes[item].name)) {
            hash = element.attributes[item].name;
            break;
          }
        }

        const arrow = document.createElement('div');

        if (hash) {
          arrow.setAttribute(hash, '');
        }
        arrow.setAttribute('x-arrow', '');
        arrow.className = 'popper__arrow';
        element.appendChild(arrow);
      }
    },

    beforeDestroy() {
      this.doDestroy(true);
      if (this.popperElm && this.popperElm.parentNode === document.body) {
        this.popperElm.removeEventListener('click', stop);
        document.body.removeChild(this.popperElm);
      }
    },

    // call destroy in keep-alive mode
    deactivated() {
      this.$options.beforeDestroy[0].call(this);
    }
  };

  //
  var script$3 = {
    name: 'ElSelectDropdown',
    componentName: 'ElSelectDropdown',
    mixins: [Popper],
    props: {
      placement: {
        "default": 'bottom-start'
      },
      boundariesPadding: {
        "default": 0
      },
      popperOptions: {
        "default": function _default() {
          return {
            gpuAcceleration: false
          };
        }
      },
      visibleArrow: {
        "default": true
      },
      appendToBody: {
        type: Boolean,
        "default": true
      }
    },
    data: function data() {
      return {
        minWidth: ''
      };
    },
    computed: {
      popperClass: function popperClass() {
        return this.$parent.popperClass;
      }
    },
    watch: {
      '$parent.inputWidth': function $parentInputWidth() {
        this.minWidth = this.$parent.$el.getBoundingClientRect().width + 'px';
      }
    },
    mounted: function mounted() {
      var _this = this;
      this.referenceElm = this.$parent.$refs.reference.$el;
      this.$parent.popperElm = this.popperElm = this.$el;
      this.$on('updatePopper', function () {
        if (_this.$parent.visible) _this.updatePopper();
      });
      this.$on('destroyPopper', this.destroyPopper);
    }
  };

  /* script */
  var __vue_script__$3 = script$3;

  /* template */
  var __vue_render__$3 = function __vue_render__() {
    var _vm = this;
    var _h = _vm.$createElement;
    var _c = _vm._self._c || _h;
    return _c("div", {
      staticClass: "el-select-dropdown el-popper",
      "class": [{
        "is-multiple": _vm.$parent.multiple
      }, _vm.popperClass],
      style: {
        minWidth: _vm.minWidth
      }
    }, [_vm._t("default")], 2);
  };
  var __vue_staticRenderFns__$3 = [];
  __vue_render__$3._withStripped = true;

  /* style */
  var __vue_inject_styles__$3 = undefined;
  /* scoped */
  var __vue_scope_id__$3 = undefined;
  /* module identifier */
  var __vue_module_identifier__$3 = undefined;
  /* functional template */
  var __vue_is_functional_template__$3 = false;
  /* style inject */

  /* style inject SSR */

  /* style inject shadow dom */

  var __vue_component__$3 = /*#__PURE__*/normalizeComponent({
    render: __vue_render__$3,
    staticRenderFns: __vue_staticRenderFns__$3
  }, __vue_inject_styles__$3, __vue_script__$3, __vue_scope_id__$3, __vue_is_functional_template__$3, __vue_module_identifier__$3, false, undefined, undefined, undefined);

  var script$4 = {
    name: 'ElTag',
    props: {
      text: String,
      closable: Boolean,
      type: String,
      hit: Boolean,
      disableTransitions: Boolean,
      color: String,
      size: String,
      effect: {
        type: String,
        "default": 'light',
        validator: function validator(val) {
          return ['dark', 'light', 'plain'].indexOf(val) !== -1;
        }
      }
    },
    methods: {
      handleClose: function handleClose(event) {
        event.stopPropagation();
        this.$emit('close', event);
      },
      handleClick: function handleClick(event) {
        this.$emit('click', event);
      }
    },
    computed: {
      tagSize: function tagSize() {
        return this.size || (this.$ELEMENT || {}).size;
      }
    },
    render: function render(h) {
      var type = this.type,
        tagSize = this.tagSize,
        hit = this.hit,
        effect = this.effect;
      var classes = ['el-tag', type ? "el-tag--".concat(type) : '', tagSize ? "el-tag--".concat(tagSize) : '', effect ? "el-tag--".concat(effect) : '', hit && 'is-hit'];
      var tagEl = h("span", {
        "class": classes,
        "style": {
          backgroundColor: this.color
        },
        "on": {
          "click": this.handleClick
        }
      }, [this.$slots["default"], this.closable && h("i", {
        "class": "el-tag__close el-icon-close",
        "on": {
          "click": this.handleClose
        }
      })]);
      return this.disableTransitions ? tagEl : h("transition", {
        "attrs": {
          "name": "el-zoom-in-center"
        }
      }, [tagEl]);
    }
  };

  /* script */
  var __vue_script__$4 = script$4;

  /* template */

  /* style */
  var __vue_inject_styles__$4 = undefined;
  /* scoped */
  var __vue_scope_id__$4 = undefined;
  /* module identifier */
  var __vue_module_identifier__$4 = undefined;
  /* functional template */
  var __vue_is_functional_template__$4 = undefined;
  /* style inject */

  /* style inject SSR */

  /* style inject shadow dom */

  var __vue_component__$4 = /*#__PURE__*/normalizeComponent({}, __vue_inject_styles__$4, __vue_script__$4, __vue_scope_id__$4, __vue_is_functional_template__$4, __vue_module_identifier__$4, false, undefined, undefined, undefined);

  /* istanbul ignore next */
  __vue_component__$4.install = function (Vue) {
    Vue.component(__vue_component__$4.name, __vue_component__$4);
  };

  /**
   * A collection of shims that provide minimal functionality of the ES6 collections.
   *
   * These implementations are not meant to be used outside of the ResizeObserver
   * modules as they cover only a limited range of use cases.
   */
  /* eslint-disable require-jsdoc, valid-jsdoc */
  var MapShim = (function () {
      if (typeof Map !== 'undefined') {
          return Map;
      }
      /**
       * Returns index in provided array that matches the specified key.
       *
       * @param {Array<Array>} arr
       * @param {*} key
       * @returns {number}
       */
      function getIndex(arr, key) {
          var result = -1;
          arr.some(function (entry, index) {
              if (entry[0] === key) {
                  result = index;
                  return true;
              }
              return false;
          });
          return result;
      }
      return /** @class */ (function () {
          function class_1() {
              this.__entries__ = [];
          }
          Object.defineProperty(class_1.prototype, "size", {
              /**
               * @returns {boolean}
               */
              get: function () {
                  return this.__entries__.length;
              },
              enumerable: true,
              configurable: true
          });
          /**
           * @param {*} key
           * @returns {*}
           */
          class_1.prototype.get = function (key) {
              var index = getIndex(this.__entries__, key);
              var entry = this.__entries__[index];
              return entry && entry[1];
          };
          /**
           * @param {*} key
           * @param {*} value
           * @returns {void}
           */
          class_1.prototype.set = function (key, value) {
              var index = getIndex(this.__entries__, key);
              if (~index) {
                  this.__entries__[index][1] = value;
              }
              else {
                  this.__entries__.push([key, value]);
              }
          };
          /**
           * @param {*} key
           * @returns {void}
           */
          class_1.prototype.delete = function (key) {
              var entries = this.__entries__;
              var index = getIndex(entries, key);
              if (~index) {
                  entries.splice(index, 1);
              }
          };
          /**
           * @param {*} key
           * @returns {void}
           */
          class_1.prototype.has = function (key) {
              return !!~getIndex(this.__entries__, key);
          };
          /**
           * @returns {void}
           */
          class_1.prototype.clear = function () {
              this.__entries__.splice(0);
          };
          /**
           * @param {Function} callback
           * @param {*} [ctx=null]
           * @returns {void}
           */
          class_1.prototype.forEach = function (callback, ctx) {
              if (ctx === void 0) { ctx = null; }
              for (var _i = 0, _a = this.__entries__; _i < _a.length; _i++) {
                  var entry = _a[_i];
                  callback.call(ctx, entry[1], entry[0]);
              }
          };
          return class_1;
      }());
  })();

  /**
   * Detects whether window and document objects are available in current environment.
   */
  var isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined' && window.document === document;

  // Returns global object of a current environment.
  var global$1 = (function () {
      if (typeof global !== 'undefined' && global.Math === Math) {
          return global;
      }
      if (typeof self !== 'undefined' && self.Math === Math) {
          return self;
      }
      if (typeof window !== 'undefined' && window.Math === Math) {
          return window;
      }
      // eslint-disable-next-line no-new-func
      return Function('return this')();
  })();

  /**
   * A shim for the requestAnimationFrame which falls back to the setTimeout if
   * first one is not supported.
   *
   * @returns {number} Requests' identifier.
   */
  var requestAnimationFrame$1 = (function () {
      if (typeof requestAnimationFrame === 'function') {
          // It's required to use a bounded function because IE sometimes throws
          // an "Invalid calling object" error if rAF is invoked without the global
          // object on the left hand side.
          return requestAnimationFrame.bind(global$1);
      }
      return function (callback) { return setTimeout(function () { return callback(Date.now()); }, 1000 / 60); };
  })();

  // Defines minimum timeout before adding a trailing call.
  var trailingTimeout = 2;
  /**
   * Creates a wrapper function which ensures that provided callback will be
   * invoked only once during the specified delay period.
   *
   * @param {Function} callback - Function to be invoked after the delay period.
   * @param {number} delay - Delay after which to invoke callback.
   * @returns {Function}
   */
  function throttle (callback, delay) {
      var leadingCall = false, trailingCall = false, lastCallTime = 0;
      /**
       * Invokes the original callback function and schedules new invocation if
       * the "proxy" was called during current request.
       *
       * @returns {void}
       */
      function resolvePending() {
          if (leadingCall) {
              leadingCall = false;
              callback();
          }
          if (trailingCall) {
              proxy();
          }
      }
      /**
       * Callback invoked after the specified delay. It will further postpone
       * invocation of the original function delegating it to the
       * requestAnimationFrame.
       *
       * @returns {void}
       */
      function timeoutCallback() {
          requestAnimationFrame$1(resolvePending);
      }
      /**
       * Schedules invocation of the original function.
       *
       * @returns {void}
       */
      function proxy() {
          var timeStamp = Date.now();
          if (leadingCall) {
              // Reject immediately following calls.
              if (timeStamp - lastCallTime < trailingTimeout) {
                  return;
              }
              // Schedule new call to be in invoked when the pending one is resolved.
              // This is important for "transitions" which never actually start
              // immediately so there is a chance that we might miss one if change
              // happens amids the pending invocation.
              trailingCall = true;
          }
          else {
              leadingCall = true;
              trailingCall = false;
              setTimeout(timeoutCallback, delay);
          }
          lastCallTime = timeStamp;
      }
      return proxy;
  }

  // Minimum delay before invoking the update of observers.
  var REFRESH_DELAY = 20;
  // A list of substrings of CSS properties used to find transition events that
  // might affect dimensions of observed elements.
  var transitionKeys = ['top', 'right', 'bottom', 'left', 'width', 'height', 'size', 'weight'];
  // Check if MutationObserver is available.
  var mutationObserverSupported = typeof MutationObserver !== 'undefined';
  /**
   * Singleton controller class which handles updates of ResizeObserver instances.
   */
  var ResizeObserverController = /** @class */ (function () {
      /**
       * Creates a new instance of ResizeObserverController.
       *
       * @private
       */
      function ResizeObserverController() {
          /**
           * Indicates whether DOM listeners have been added.
           *
           * @private {boolean}
           */
          this.connected_ = false;
          /**
           * Tells that controller has subscribed for Mutation Events.
           *
           * @private {boolean}
           */
          this.mutationEventsAdded_ = false;
          /**
           * Keeps reference to the instance of MutationObserver.
           *
           * @private {MutationObserver}
           */
          this.mutationsObserver_ = null;
          /**
           * A list of connected observers.
           *
           * @private {Array<ResizeObserverSPI>}
           */
          this.observers_ = [];
          this.onTransitionEnd_ = this.onTransitionEnd_.bind(this);
          this.refresh = throttle(this.refresh.bind(this), REFRESH_DELAY);
      }
      /**
       * Adds observer to observers list.
       *
       * @param {ResizeObserverSPI} observer - Observer to be added.
       * @returns {void}
       */
      ResizeObserverController.prototype.addObserver = function (observer) {
          if (!~this.observers_.indexOf(observer)) {
              this.observers_.push(observer);
          }
          // Add listeners if they haven't been added yet.
          if (!this.connected_) {
              this.connect_();
          }
      };
      /**
       * Removes observer from observers list.
       *
       * @param {ResizeObserverSPI} observer - Observer to be removed.
       * @returns {void}
       */
      ResizeObserverController.prototype.removeObserver = function (observer) {
          var observers = this.observers_;
          var index = observers.indexOf(observer);
          // Remove observer if it's present in registry.
          if (~index) {
              observers.splice(index, 1);
          }
          // Remove listeners if controller has no connected observers.
          if (!observers.length && this.connected_) {
              this.disconnect_();
          }
      };
      /**
       * Invokes the update of observers. It will continue running updates insofar
       * it detects changes.
       *
       * @returns {void}
       */
      ResizeObserverController.prototype.refresh = function () {
          var changesDetected = this.updateObservers_();
          // Continue running updates if changes have been detected as there might
          // be future ones caused by CSS transitions.
          if (changesDetected) {
              this.refresh();
          }
      };
      /**
       * Updates every observer from observers list and notifies them of queued
       * entries.
       *
       * @private
       * @returns {boolean} Returns "true" if any observer has detected changes in
       *      dimensions of it's elements.
       */
      ResizeObserverController.prototype.updateObservers_ = function () {
          // Collect observers that have active observations.
          var activeObservers = this.observers_.filter(function (observer) {
              return observer.gatherActive(), observer.hasActive();
          });
          // Deliver notifications in a separate cycle in order to avoid any
          // collisions between observers, e.g. when multiple instances of
          // ResizeObserver are tracking the same element and the callback of one
          // of them changes content dimensions of the observed target. Sometimes
          // this may result in notifications being blocked for the rest of observers.
          activeObservers.forEach(function (observer) { return observer.broadcastActive(); });
          return activeObservers.length > 0;
      };
      /**
       * Initializes DOM listeners.
       *
       * @private
       * @returns {void}
       */
      ResizeObserverController.prototype.connect_ = function () {
          // Do nothing if running in a non-browser environment or if listeners
          // have been already added.
          if (!isBrowser || this.connected_) {
              return;
          }
          // Subscription to the "Transitionend" event is used as a workaround for
          // delayed transitions. This way it's possible to capture at least the
          // final state of an element.
          document.addEventListener('transitionend', this.onTransitionEnd_);
          window.addEventListener('resize', this.refresh);
          if (mutationObserverSupported) {
              this.mutationsObserver_ = new MutationObserver(this.refresh);
              this.mutationsObserver_.observe(document, {
                  attributes: true,
                  childList: true,
                  characterData: true,
                  subtree: true
              });
          }
          else {
              document.addEventListener('DOMSubtreeModified', this.refresh);
              this.mutationEventsAdded_ = true;
          }
          this.connected_ = true;
      };
      /**
       * Removes DOM listeners.
       *
       * @private
       * @returns {void}
       */
      ResizeObserverController.prototype.disconnect_ = function () {
          // Do nothing if running in a non-browser environment or if listeners
          // have been already removed.
          if (!isBrowser || !this.connected_) {
              return;
          }
          document.removeEventListener('transitionend', this.onTransitionEnd_);
          window.removeEventListener('resize', this.refresh);
          if (this.mutationsObserver_) {
              this.mutationsObserver_.disconnect();
          }
          if (this.mutationEventsAdded_) {
              document.removeEventListener('DOMSubtreeModified', this.refresh);
          }
          this.mutationsObserver_ = null;
          this.mutationEventsAdded_ = false;
          this.connected_ = false;
      };
      /**
       * "Transitionend" event handler.
       *
       * @private
       * @param {TransitionEvent} event
       * @returns {void}
       */
      ResizeObserverController.prototype.onTransitionEnd_ = function (_a) {
          var _b = _a.propertyName, propertyName = _b === void 0 ? '' : _b;
          // Detect whether transition may affect dimensions of an element.
          var isReflowProperty = transitionKeys.some(function (key) {
              return !!~propertyName.indexOf(key);
          });
          if (isReflowProperty) {
              this.refresh();
          }
      };
      /**
       * Returns instance of the ResizeObserverController.
       *
       * @returns {ResizeObserverController}
       */
      ResizeObserverController.getInstance = function () {
          if (!this.instance_) {
              this.instance_ = new ResizeObserverController();
          }
          return this.instance_;
      };
      /**
       * Holds reference to the controller's instance.
       *
       * @private {ResizeObserverController}
       */
      ResizeObserverController.instance_ = null;
      return ResizeObserverController;
  }());

  /**
   * Defines non-writable/enumerable properties of the provided target object.
   *
   * @param {Object} target - Object for which to define properties.
   * @param {Object} props - Properties to be defined.
   * @returns {Object} Target object.
   */
  var defineConfigurable = (function (target, props) {
      for (var _i = 0, _a = Object.keys(props); _i < _a.length; _i++) {
          var key = _a[_i];
          Object.defineProperty(target, key, {
              value: props[key],
              enumerable: false,
              writable: false,
              configurable: true
          });
      }
      return target;
  });

  /**
   * Returns the global object associated with provided element.
   *
   * @param {Object} target
   * @returns {Object}
   */
  var getWindowOf = (function (target) {
      // Assume that the element is an instance of Node, which means that it
      // has the "ownerDocument" property from which we can retrieve a
      // corresponding global object.
      var ownerGlobal = target && target.ownerDocument && target.ownerDocument.defaultView;
      // Return the local global object if it's not possible extract one from
      // provided element.
      return ownerGlobal || global$1;
  });

  // Placeholder of an empty content rectangle.
  var emptyRect = createRectInit(0, 0, 0, 0);
  /**
   * Converts provided string to a number.
   *
   * @param {number|string} value
   * @returns {number}
   */
  function toFloat(value) {
      return parseFloat(value) || 0;
  }
  /**
   * Extracts borders size from provided styles.
   *
   * @param {CSSStyleDeclaration} styles
   * @param {...string} positions - Borders positions (top, right, ...)
   * @returns {number}
   */
  function getBordersSize(styles) {
      var positions = [];
      for (var _i = 1; _i < arguments.length; _i++) {
          positions[_i - 1] = arguments[_i];
      }
      return positions.reduce(function (size, position) {
          var value = styles['border-' + position + '-width'];
          return size + toFloat(value);
      }, 0);
  }
  /**
   * Extracts paddings sizes from provided styles.
   *
   * @param {CSSStyleDeclaration} styles
   * @returns {Object} Paddings box.
   */
  function getPaddings(styles) {
      var positions = ['top', 'right', 'bottom', 'left'];
      var paddings = {};
      for (var _i = 0, positions_1 = positions; _i < positions_1.length; _i++) {
          var position = positions_1[_i];
          var value = styles['padding-' + position];
          paddings[position] = toFloat(value);
      }
      return paddings;
  }
  /**
   * Calculates content rectangle of provided SVG element.
   *
   * @param {SVGGraphicsElement} target - Element content rectangle of which needs
   *      to be calculated.
   * @returns {DOMRectInit}
   */
  function getSVGContentRect(target) {
      var bbox = target.getBBox();
      return createRectInit(0, 0, bbox.width, bbox.height);
  }
  /**
   * Calculates content rectangle of provided HTMLElement.
   *
   * @param {HTMLElement} target - Element for which to calculate the content rectangle.
   * @returns {DOMRectInit}
   */
  function getHTMLElementContentRect(target) {
      // Client width & height properties can't be
      // used exclusively as they provide rounded values.
      var clientWidth = target.clientWidth, clientHeight = target.clientHeight;
      // By this condition we can catch all non-replaced inline, hidden and
      // detached elements. Though elements with width & height properties less
      // than 0.5 will be discarded as well.
      //
      // Without it we would need to implement separate methods for each of
      // those cases and it's not possible to perform a precise and performance
      // effective test for hidden elements. E.g. even jQuery's ':visible' filter
      // gives wrong results for elements with width & height less than 0.5.
      if (!clientWidth && !clientHeight) {
          return emptyRect;
      }
      var styles = getWindowOf(target).getComputedStyle(target);
      var paddings = getPaddings(styles);
      var horizPad = paddings.left + paddings.right;
      var vertPad = paddings.top + paddings.bottom;
      // Computed styles of width & height are being used because they are the
      // only dimensions available to JS that contain non-rounded values. It could
      // be possible to utilize the getBoundingClientRect if only it's data wasn't
      // affected by CSS transformations let alone paddings, borders and scroll bars.
      var width = toFloat(styles.width), height = toFloat(styles.height);
      // Width & height include paddings and borders when the 'border-box' box
      // model is applied (except for IE).
      if (styles.boxSizing === 'border-box') {
          // Following conditions are required to handle Internet Explorer which
          // doesn't include paddings and borders to computed CSS dimensions.
          //
          // We can say that if CSS dimensions + paddings are equal to the "client"
          // properties then it's either IE, and thus we don't need to subtract
          // anything, or an element merely doesn't have paddings/borders styles.
          if (Math.round(width + horizPad) !== clientWidth) {
              width -= getBordersSize(styles, 'left', 'right') + horizPad;
          }
          if (Math.round(height + vertPad) !== clientHeight) {
              height -= getBordersSize(styles, 'top', 'bottom') + vertPad;
          }
      }
      // Following steps can't be applied to the document's root element as its
      // client[Width/Height] properties represent viewport area of the window.
      // Besides, it's as well not necessary as the <html> itself neither has
      // rendered scroll bars nor it can be clipped.
      if (!isDocumentElement(target)) {
          // In some browsers (only in Firefox, actually) CSS width & height
          // include scroll bars size which can be removed at this step as scroll
          // bars are the only difference between rounded dimensions + paddings
          // and "client" properties, though that is not always true in Chrome.
          var vertScrollbar = Math.round(width + horizPad) - clientWidth;
          var horizScrollbar = Math.round(height + vertPad) - clientHeight;
          // Chrome has a rather weird rounding of "client" properties.
          // E.g. for an element with content width of 314.2px it sometimes gives
          // the client width of 315px and for the width of 314.7px it may give
          // 314px. And it doesn't happen all the time. So just ignore this delta
          // as a non-relevant.
          if (Math.abs(vertScrollbar) !== 1) {
              width -= vertScrollbar;
          }
          if (Math.abs(horizScrollbar) !== 1) {
              height -= horizScrollbar;
          }
      }
      return createRectInit(paddings.left, paddings.top, width, height);
  }
  /**
   * Checks whether provided element is an instance of the SVGGraphicsElement.
   *
   * @param {Element} target - Element to be checked.
   * @returns {boolean}
   */
  var isSVGGraphicsElement = (function () {
      // Some browsers, namely IE and Edge, don't have the SVGGraphicsElement
      // interface.
      if (typeof SVGGraphicsElement !== 'undefined') {
          return function (target) { return target instanceof getWindowOf(target).SVGGraphicsElement; };
      }
      // If it's so, then check that element is at least an instance of the
      // SVGElement and that it has the "getBBox" method.
      // eslint-disable-next-line no-extra-parens
      return function (target) { return (target instanceof getWindowOf(target).SVGElement &&
          typeof target.getBBox === 'function'); };
  })();
  /**
   * Checks whether provided element is a document element (<html>).
   *
   * @param {Element} target - Element to be checked.
   * @returns {boolean}
   */
  function isDocumentElement(target) {
      return target === getWindowOf(target).document.documentElement;
  }
  /**
   * Calculates an appropriate content rectangle for provided html or svg element.
   *
   * @param {Element} target - Element content rectangle of which needs to be calculated.
   * @returns {DOMRectInit}
   */
  function getContentRect(target) {
      if (!isBrowser) {
          return emptyRect;
      }
      if (isSVGGraphicsElement(target)) {
          return getSVGContentRect(target);
      }
      return getHTMLElementContentRect(target);
  }
  /**
   * Creates rectangle with an interface of the DOMRectReadOnly.
   * Spec: https://drafts.fxtf.org/geometry/#domrectreadonly
   *
   * @param {DOMRectInit} rectInit - Object with rectangle's x/y coordinates and dimensions.
   * @returns {DOMRectReadOnly}
   */
  function createReadOnlyRect(_a) {
      var x = _a.x, y = _a.y, width = _a.width, height = _a.height;
      // If DOMRectReadOnly is available use it as a prototype for the rectangle.
      var Constr = typeof DOMRectReadOnly !== 'undefined' ? DOMRectReadOnly : Object;
      var rect = Object.create(Constr.prototype);
      // Rectangle's properties are not writable and non-enumerable.
      defineConfigurable(rect, {
          x: x, y: y, width: width, height: height,
          top: y,
          right: x + width,
          bottom: height + y,
          left: x
      });
      return rect;
  }
  /**
   * Creates DOMRectInit object based on the provided dimensions and the x/y coordinates.
   * Spec: https://drafts.fxtf.org/geometry/#dictdef-domrectinit
   *
   * @param {number} x - X coordinate.
   * @param {number} y - Y coordinate.
   * @param {number} width - Rectangle's width.
   * @param {number} height - Rectangle's height.
   * @returns {DOMRectInit}
   */
  function createRectInit(x, y, width, height) {
      return { x: x, y: y, width: width, height: height };
  }

  /**
   * Class that is responsible for computations of the content rectangle of
   * provided DOM element and for keeping track of it's changes.
   */
  var ResizeObservation = /** @class */ (function () {
      /**
       * Creates an instance of ResizeObservation.
       *
       * @param {Element} target - Element to be observed.
       */
      function ResizeObservation(target) {
          /**
           * Broadcasted width of content rectangle.
           *
           * @type {number}
           */
          this.broadcastWidth = 0;
          /**
           * Broadcasted height of content rectangle.
           *
           * @type {number}
           */
          this.broadcastHeight = 0;
          /**
           * Reference to the last observed content rectangle.
           *
           * @private {DOMRectInit}
           */
          this.contentRect_ = createRectInit(0, 0, 0, 0);
          this.target = target;
      }
      /**
       * Updates content rectangle and tells whether it's width or height properties
       * have changed since the last broadcast.
       *
       * @returns {boolean}
       */
      ResizeObservation.prototype.isActive = function () {
          var rect = getContentRect(this.target);
          this.contentRect_ = rect;
          return (rect.width !== this.broadcastWidth ||
              rect.height !== this.broadcastHeight);
      };
      /**
       * Updates 'broadcastWidth' and 'broadcastHeight' properties with a data
       * from the corresponding properties of the last observed content rectangle.
       *
       * @returns {DOMRectInit} Last observed content rectangle.
       */
      ResizeObservation.prototype.broadcastRect = function () {
          var rect = this.contentRect_;
          this.broadcastWidth = rect.width;
          this.broadcastHeight = rect.height;
          return rect;
      };
      return ResizeObservation;
  }());

  var ResizeObserverEntry = /** @class */ (function () {
      /**
       * Creates an instance of ResizeObserverEntry.
       *
       * @param {Element} target - Element that is being observed.
       * @param {DOMRectInit} rectInit - Data of the element's content rectangle.
       */
      function ResizeObserverEntry(target, rectInit) {
          var contentRect = createReadOnlyRect(rectInit);
          // According to the specification following properties are not writable
          // and are also not enumerable in the native implementation.
          //
          // Property accessors are not being used as they'd require to define a
          // private WeakMap storage which may cause memory leaks in browsers that
          // don't support this type of collections.
          defineConfigurable(this, { target: target, contentRect: contentRect });
      }
      return ResizeObserverEntry;
  }());

  var ResizeObserverSPI = /** @class */ (function () {
      /**
       * Creates a new instance of ResizeObserver.
       *
       * @param {ResizeObserverCallback} callback - Callback function that is invoked
       *      when one of the observed elements changes it's content dimensions.
       * @param {ResizeObserverController} controller - Controller instance which
       *      is responsible for the updates of observer.
       * @param {ResizeObserver} callbackCtx - Reference to the public
       *      ResizeObserver instance which will be passed to callback function.
       */
      function ResizeObserverSPI(callback, controller, callbackCtx) {
          /**
           * Collection of resize observations that have detected changes in dimensions
           * of elements.
           *
           * @private {Array<ResizeObservation>}
           */
          this.activeObservations_ = [];
          /**
           * Registry of the ResizeObservation instances.
           *
           * @private {Map<Element, ResizeObservation>}
           */
          this.observations_ = new MapShim();
          if (typeof callback !== 'function') {
              throw new TypeError('The callback provided as parameter 1 is not a function.');
          }
          this.callback_ = callback;
          this.controller_ = controller;
          this.callbackCtx_ = callbackCtx;
      }
      /**
       * Starts observing provided element.
       *
       * @param {Element} target - Element to be observed.
       * @returns {void}
       */
      ResizeObserverSPI.prototype.observe = function (target) {
          if (!arguments.length) {
              throw new TypeError('1 argument required, but only 0 present.');
          }
          // Do nothing if current environment doesn't have the Element interface.
          if (typeof Element === 'undefined' || !(Element instanceof Object)) {
              return;
          }
          if (!(target instanceof getWindowOf(target).Element)) {
              throw new TypeError('parameter 1 is not of type "Element".');
          }
          var observations = this.observations_;
          // Do nothing if element is already being observed.
          if (observations.has(target)) {
              return;
          }
          observations.set(target, new ResizeObservation(target));
          this.controller_.addObserver(this);
          // Force the update of observations.
          this.controller_.refresh();
      };
      /**
       * Stops observing provided element.
       *
       * @param {Element} target - Element to stop observing.
       * @returns {void}
       */
      ResizeObserverSPI.prototype.unobserve = function (target) {
          if (!arguments.length) {
              throw new TypeError('1 argument required, but only 0 present.');
          }
          // Do nothing if current environment doesn't have the Element interface.
          if (typeof Element === 'undefined' || !(Element instanceof Object)) {
              return;
          }
          if (!(target instanceof getWindowOf(target).Element)) {
              throw new TypeError('parameter 1 is not of type "Element".');
          }
          var observations = this.observations_;
          // Do nothing if element is not being observed.
          if (!observations.has(target)) {
              return;
          }
          observations.delete(target);
          if (!observations.size) {
              this.controller_.removeObserver(this);
          }
      };
      /**
       * Stops observing all elements.
       *
       * @returns {void}
       */
      ResizeObserverSPI.prototype.disconnect = function () {
          this.clearActive();
          this.observations_.clear();
          this.controller_.removeObserver(this);
      };
      /**
       * Collects observation instances the associated element of which has changed
       * it's content rectangle.
       *
       * @returns {void}
       */
      ResizeObserverSPI.prototype.gatherActive = function () {
          var _this = this;
          this.clearActive();
          this.observations_.forEach(function (observation) {
              if (observation.isActive()) {
                  _this.activeObservations_.push(observation);
              }
          });
      };
      /**
       * Invokes initial callback function with a list of ResizeObserverEntry
       * instances collected from active resize observations.
       *
       * @returns {void}
       */
      ResizeObserverSPI.prototype.broadcastActive = function () {
          // Do nothing if observer doesn't have active observations.
          if (!this.hasActive()) {
              return;
          }
          var ctx = this.callbackCtx_;
          // Create ResizeObserverEntry instance for every active observation.
          var entries = this.activeObservations_.map(function (observation) {
              return new ResizeObserverEntry(observation.target, observation.broadcastRect());
          });
          this.callback_.call(ctx, entries, ctx);
          this.clearActive();
      };
      /**
       * Clears the collection of active observations.
       *
       * @returns {void}
       */
      ResizeObserverSPI.prototype.clearActive = function () {
          this.activeObservations_.splice(0);
      };
      /**
       * Tells whether observer has active observations.
       *
       * @returns {boolean}
       */
      ResizeObserverSPI.prototype.hasActive = function () {
          return this.activeObservations_.length > 0;
      };
      return ResizeObserverSPI;
  }());

  // Registry of internal observers. If WeakMap is not available use current shim
  // for the Map collection as it has all required methods and because WeakMap
  // can't be fully polyfilled anyway.
  var observers = typeof WeakMap !== 'undefined' ? new WeakMap() : new MapShim();
  /**
   * ResizeObserver API. Encapsulates the ResizeObserver SPI implementation
   * exposing only those methods and properties that are defined in the spec.
   */
  var ResizeObserver = /** @class */ (function () {
      /**
       * Creates a new instance of ResizeObserver.
       *
       * @param {ResizeObserverCallback} callback - Callback that is invoked when
       *      dimensions of the observed elements change.
       */
      function ResizeObserver(callback) {
          if (!(this instanceof ResizeObserver)) {
              throw new TypeError('Cannot call a class as a function.');
          }
          if (!arguments.length) {
              throw new TypeError('1 argument required, but only 0 present.');
          }
          var controller = ResizeObserverController.getInstance();
          var observer = new ResizeObserverSPI(callback, controller, this);
          observers.set(this, observer);
      }
      return ResizeObserver;
  }());
  // Expose public methods of ResizeObserver.
  [
      'observe',
      'unobserve',
      'disconnect'
  ].forEach(function (method) {
      ResizeObserver.prototype[method] = function () {
          var _a;
          return (_a = observers.get(this))[method].apply(_a, arguments);
      };
  });

  var index$1 = (function () {
      // Export existing implementation if available.
      if (typeof global$1.ResizeObserver !== 'undefined') {
          return global$1.ResizeObserver;
      }
      return ResizeObserver;
  })();

  /* eslint-disable no-undefined,no-param-reassign,no-shadow */

  /**
   * Throttle execution of a function. Especially useful for rate limiting
   * execution of handlers on events like resize and scroll.
   *
   * @param  {Number}    delay          A zero-or-greater delay in milliseconds. For event callbacks, values around 100 or 250 (or even higher) are most useful.
   * @param  {Boolean}   [noTrailing]   Optional, defaults to false. If noTrailing is true, callback will only execute every `delay` milliseconds while the
   *                                    throttled-function is being called. If noTrailing is false or unspecified, callback will be executed one final time
   *                                    after the last throttled-function call. (After the throttled-function has not been called for `delay` milliseconds,
   *                                    the internal counter is reset)
   * @param  {Function}  callback       A function to be executed after delay milliseconds. The `this` context and all arguments are passed through, as-is,
   *                                    to `callback` when the throttled-function is executed.
   * @param  {Boolean}   [debounceMode] If `debounceMode` is true (at begin), schedule `clear` to execute after `delay` ms. If `debounceMode` is false (at end),
   *                                    schedule `callback` to execute after `delay` ms.
   *
   * @return {Function}  A new, throttled, function.
   */
  var throttle$1 = function ( delay, noTrailing, callback, debounceMode ) {

  	// After wrapper has stopped being called, this timeout ensures that
  	// `callback` is executed at the proper times in `throttle` and `end`
  	// debounce modes.
  	var timeoutID;

  	// Keep track of the last time `callback` was executed.
  	var lastExec = 0;

  	// `noTrailing` defaults to falsy.
  	if ( typeof noTrailing !== 'boolean' ) {
  		debounceMode = callback;
  		callback = noTrailing;
  		noTrailing = undefined;
  	}

  	// The `wrapper` function encapsulates all of the throttling / debouncing
  	// functionality and when executed will limit the rate at which `callback`
  	// is executed.
  	function wrapper () {

  		var self = this;
  		var elapsed = Number(new Date()) - lastExec;
  		var args = arguments;

  		// Execute `callback` and update the `lastExec` timestamp.
  		function exec () {
  			lastExec = Number(new Date());
  			callback.apply(self, args);
  		}

  		// If `debounceMode` is true (at begin) this is used to clear the flag
  		// to allow future `callback` executions.
  		function clear () {
  			timeoutID = undefined;
  		}

  		if ( debounceMode && !timeoutID ) {
  			// Since `wrapper` is being called for the first time and
  			// `debounceMode` is true (at begin), execute `callback`.
  			exec();
  		}

  		// Clear any existing timeout.
  		if ( timeoutID ) {
  			clearTimeout(timeoutID);
  		}

  		if ( debounceMode === undefined && elapsed > delay ) {
  			// In throttle mode, if `delay` time has been exceeded, execute
  			// `callback`.
  			exec();

  		} else if ( noTrailing !== true ) {
  			// In trailing throttle mode, since `delay` time has not been
  			// exceeded, schedule `callback` to execute `delay` ms after most
  			// recent execution.
  			//
  			// If `debounceMode` is true (at begin), schedule `clear` to execute
  			// after `delay` ms.
  			//
  			// If `debounceMode` is false (at end), schedule `callback` to
  			// execute after `delay` ms.
  			timeoutID = setTimeout(debounceMode ? clear : exec, debounceMode === undefined ? delay - elapsed : delay);
  		}

  	}

  	// Return the wrapper function.
  	return wrapper;

  };

  /* eslint-disable no-undefined */



  /**
   * Debounce execution of a function. Debouncing, unlike throttling,
   * guarantees that a function is only executed a single time, either at the
   * very beginning of a series of calls, or at the very end.
   *
   * @param  {Number}   delay         A zero-or-greater delay in milliseconds. For event callbacks, values around 100 or 250 (or even higher) are most useful.
   * @param  {Boolean}  [atBegin]     Optional, defaults to false. If atBegin is false or unspecified, callback will only be executed `delay` milliseconds
   *                                  after the last debounced-function call. If atBegin is true, callback will be executed only at the first debounced-function call.
   *                                  (After the throttled-function has not been called for `delay` milliseconds, the internal counter is reset).
   * @param  {Function} callback      A function to be executed after delay milliseconds. The `this` context and all arguments are passed through, as-is,
   *                                  to `callback` when the debounced-function is executed.
   *
   * @return {Function} A new, debounced function.
   */
  var debounce = function ( delay, atBegin, callback ) {
  	return callback === undefined ? throttle$1(delay, atBegin, false) : throttle$1(delay, callback, atBegin !== false);
  };

  var throttleDebounce = {
  	throttle: throttle$1,
  	debounce: debounce
  };
  var throttleDebounce_2 = throttleDebounce.debounce;

  const isServer$1 = typeof window === 'undefined';

  /* istanbul ignore next */
  const resizeHandler = function(entries) {
    for (let entry of entries) {
      const listeners = entry.target.__resizeListeners__ || [];
      if (listeners.length) {
        listeners.forEach(fn => {
          fn();
        });
      }
    }
  };

  /* istanbul ignore next */
  const addResizeListener = function(element, fn) {
    if (isServer$1) return;
    if (!element.__resizeListeners__) {
      element.__resizeListeners__ = [];
      element.__ro__ = new index$1(throttleDebounce_2(16, resizeHandler));
      element.__ro__.observe(element);
    }
    element.__resizeListeners__.push(fn);
  };

  /* istanbul ignore next */
  const removeResizeListener = function(element, fn) {
    if (!element || !element.__resizeListeners__) return;
    element.__resizeListeners__.splice(element.__resizeListeners__.indexOf(fn), 1);
    if (!element.__resizeListeners__.length) {
      element.__ro__.disconnect();
    }
  };

  var BAR_MAP = {
    vertical: {
      offset: 'offsetHeight',
      scroll: 'scrollTop',
      scrollSize: 'scrollHeight',
      size: 'height',
      key: 'vertical',
      axis: 'Y',
      client: 'clientY',
      direction: 'top'
    },
    horizontal: {
      offset: 'offsetWidth',
      scroll: 'scrollLeft',
      scrollSize: 'scrollWidth',
      size: 'width',
      key: 'horizontal',
      axis: 'X',
      client: 'clientX',
      direction: 'left'
    }
  };
  function renderThumbStyle(_ref) {
    var move = _ref.move,
      size = _ref.size,
      bar = _ref.bar;
    var style = {};
    var translate = "translate".concat(bar.axis, "(").concat(move, "%)");
    style[bar.size] = size;
    style.transform = translate;
    style.msTransform = translate;
    style.webkitTransform = translate;
    return style;
  }

  /* istanbul ignore next */
  var Bar = {
    name: 'Bar',
    props: {
      vertical: Boolean,
      size: String,
      move: Number
    },
    computed: {
      bar: function bar() {
        return BAR_MAP[this.vertical ? 'vertical' : 'horizontal'];
      },
      wrap: function wrap() {
        return this.$parent.wrap;
      }
    },
    render: function render(h) {
      var size = this.size,
        move = this.move,
        bar = this.bar;
      return h("div", {
        "class": ['el-scrollbar__bar', 'is-' + bar.key],
        "on": {
          "mousedown": this.clickTrackHandler
        }
      }, [h("div", {
        "ref": "thumb",
        "class": "el-scrollbar__thumb",
        "on": {
          "mousedown": this.clickThumbHandler
        },
        "style": renderThumbStyle({
          size: size,
          move: move,
          bar: bar
        })
      })]);
    },
    methods: {
      clickThumbHandler: function clickThumbHandler(e) {
        // prevent click event of right button
        if (e.ctrlKey || e.button === 2) {
          return;
        }
        this.startDrag(e);
        this[this.bar.axis] = e.currentTarget[this.bar.offset] - (e[this.bar.client] - e.currentTarget.getBoundingClientRect()[this.bar.direction]);
      },
      clickTrackHandler: function clickTrackHandler(e) {
        var offset = Math.abs(e.target.getBoundingClientRect()[this.bar.direction] - e[this.bar.client]);
        var thumbHalf = this.$refs.thumb[this.bar.offset] / 2;
        var thumbPositionPercentage = (offset - thumbHalf) * 100 / this.$el[this.bar.offset];
        this.wrap[this.bar.scroll] = thumbPositionPercentage * this.wrap[this.bar.scrollSize] / 100;
      },
      startDrag: function startDrag(e) {
        e.stopImmediatePropagation();
        this.cursorDown = true;
        on(document, 'mousemove', this.mouseMoveDocumentHandler);
        on(document, 'mouseup', this.mouseUpDocumentHandler);
        document.onselectstart = function () {
          return false;
        };
      },
      mouseMoveDocumentHandler: function mouseMoveDocumentHandler(e) {
        if (this.cursorDown === false) return;
        var prevPage = this[this.bar.axis];
        if (!prevPage) return;
        var offset = (this.$el.getBoundingClientRect()[this.bar.direction] - e[this.bar.client]) * -1;
        var thumbClickPosition = this.$refs.thumb[this.bar.offset] - prevPage;
        var thumbPositionPercentage = (offset - thumbClickPosition) * 100 / this.$el[this.bar.offset];
        this.wrap[this.bar.scroll] = thumbPositionPercentage * this.wrap[this.bar.scrollSize] / 100;
      },
      mouseUpDocumentHandler: function mouseUpDocumentHandler(e) {
        this.cursorDown = false;
        this[this.bar.axis] = 0;
        off(document, 'mousemove', this.mouseMoveDocumentHandler);
        document.onselectstart = null;
      }
    },
    destroyed: function destroyed() {
      off(document, 'mouseup', this.mouseUpDocumentHandler);
    }
  };

  // reference https://github.com/noeldelgado/gemini-scrollbar/blob/master/index.js

  /* istanbul ignore next */
  var Scrollbar = {
    name: 'ElScrollbar',
    components: {
      Bar: Bar
    },
    props: {
      "native": Boolean,
      wrapStyle: {},
      wrapClass: {},
      viewClass: {},
      viewStyle: {},
      noresize: Boolean,
      // 如果 container 尺寸不会发生变化，最好设置它可以优化性能
      tag: {
        type: String,
        "default": 'div'
      }
    },
    data: function data() {
      return {
        sizeWidth: '0',
        sizeHeight: '0',
        moveX: 0,
        moveY: 0
      };
    },
    computed: {
      wrap: function wrap() {
        return this.$refs.wrap;
      }
    },
    render: function render(h) {
      var gutter = scrollbarWidth();
      var style = this.wrapStyle;
      if (gutter) {
        var gutterWith = "-".concat(gutter, "px");
        var gutterStyle = "margin-bottom: ".concat(gutterWith, "; margin-right: ").concat(gutterWith, ";");
        if (Array.isArray(this.wrapStyle)) {
          style = toObject$1(this.wrapStyle);
          style.marginRight = style.marginBottom = gutterWith;
        } else if (typeof this.wrapStyle === 'string') {
          style += gutterStyle;
        } else {
          style = gutterStyle;
        }
      }
      var view = h(this.tag, {
        "class": ['el-scrollbar__view', this.viewClass],
        style: this.viewStyle,
        ref: 'resize'
      }, this.$slots["default"]);
      var wrap = h("div", {
        "ref": "wrap",
        "style": style,
        "on": {
          "scroll": this.handleScroll
        },
        "class": [this.wrapClass, 'el-scrollbar__wrap', gutter ? '' : 'el-scrollbar__wrap--hidden-default']
      }, [[view]]);
      var nodes;
      if (!this["native"]) {
        nodes = [wrap, h(Bar, {
          "attrs": {
            "move": this.moveX,
            "size": this.sizeWidth
          }
        }), h(Bar, {
          "attrs": {
            "vertical": true,
            "move": this.moveY,
            "size": this.sizeHeight
          }
        })];
      } else {
        nodes = [h("div", {
          "ref": "wrap",
          "class": [this.wrapClass, 'el-scrollbar__wrap'],
          "style": style
        }, [[view]])];
      }
      return h('div', {
        "class": 'el-scrollbar'
      }, nodes);
    },
    methods: {
      handleScroll: function handleScroll() {
        var wrap = this.wrap;
        this.moveY = wrap.scrollTop * 100 / wrap.clientHeight;
        this.moveX = wrap.scrollLeft * 100 / wrap.clientWidth;
      },
      update: function update() {
        var heightPercentage, widthPercentage;
        var wrap = this.wrap;
        if (!wrap) return;
        heightPercentage = wrap.clientHeight * 100 / wrap.scrollHeight;
        widthPercentage = wrap.clientWidth * 100 / wrap.scrollWidth;
        this.sizeHeight = heightPercentage < 100 ? heightPercentage + '%' : '';
        this.sizeWidth = widthPercentage < 100 ? widthPercentage + '%' : '';
      }
    },
    mounted: function mounted() {
      if (this["native"]) return;
      this.$nextTick(this.update);
      !this.noresize && addResizeListener(this.$refs.resize, this.update);
    },
    beforeDestroy: function beforeDestroy() {
      if (this["native"]) return;
      !this.noresize && removeResizeListener(this.$refs.resize, this.update);
    }
  };

  /* istanbul ignore next */
  Scrollbar.install = function (Vue) {
    Vue.component(Scrollbar.name, Scrollbar);
  };

  const nodeList = [];
  const ctx = '@@clickoutsideContext';

  let startClick;
  let seed$1 = 0;

  !Vue.prototype.$isServer && on(document, 'mousedown', e => (startClick = e));

  !Vue.prototype.$isServer && on(document, 'mouseup', e => {
    nodeList.forEach(node => node[ctx].documentHandler(e, startClick));
  });

  function createDocumentHandler(el, binding, vnode) {
    return function(mouseup = {}, mousedown = {}) {
      if (!vnode ||
        !vnode.context ||
        !mouseup.target ||
        !mousedown.target ||
        el.contains(mouseup.target) ||
        el.contains(mousedown.target) ||
        el === mouseup.target ||
        (vnode.context.popperElm &&
        (vnode.context.popperElm.contains(mouseup.target) ||
        vnode.context.popperElm.contains(mousedown.target)))) return;

      if (binding.expression &&
        el[ctx].methodName &&
        vnode.context[el[ctx].methodName]) {
        vnode.context[el[ctx].methodName]();
      } else {
        el[ctx].bindingFn && el[ctx].bindingFn();
      }
    };
  }

  /**
   * v-clickoutside
   * @desc 点击元素外面才会触发的事件
   * @example
   * ```vue
   * <div v-element-clickoutside="handleClose">
   * ```
   */
  var Clickoutside = {
    bind(el, binding, vnode) {
      nodeList.push(el);
      const id = seed$1++;
      el[ctx] = {
        id,
        documentHandler: createDocumentHandler(el, binding, vnode),
        methodName: binding.expression,
        bindingFn: binding.value
      };
    },

    update(el, binding, vnode) {
      el[ctx].documentHandler = createDocumentHandler(el, binding, vnode);
      el[ctx].methodName = binding.expression;
      el[ctx].bindingFn = binding.value;
    },

    unbind(el) {
      let len = nodeList.length;

      for (let i = 0; i < len; i++) {
        if (nodeList[i][ctx].id === el[ctx].id) {
          nodeList.splice(i, 1);
          break;
        }
      }
      delete el[ctx];
    }
  };

  function scrollIntoView(container, selected) {
    if (Vue.prototype.$isServer) return;

    if (!selected) {
      container.scrollTop = 0;
      return;
    }

    const offsetParents = [];
    let pointer = selected.offsetParent;
    while (pointer && container !== pointer && container.contains(pointer)) {
      offsetParents.push(pointer);
      pointer = pointer.offsetParent;
    }
    const top = selected.offsetTop + offsetParents.reduce((prev, curr) => (prev + curr.offsetTop), 0);
    const bottom = top + selected.offsetHeight;
    const viewRectTop = container.scrollTop;
    const viewRectBottom = viewRectTop + container.clientHeight;

    if (top < viewRectTop) {
      container.scrollTop = top;
    } else if (bottom > viewRectBottom) {
      container.scrollTop = bottom - container.clientHeight;
    }
  }

  var NavigationMixin = {
    data: function data() {
      return {
        hoverOption: -1
      };
    },
    computed: {
      optionsAllDisabled: function optionsAllDisabled() {
        return this.options.filter(function (option) {
          return option.visible;
        }).every(function (option) {
          return option.disabled;
        });
      }
    },
    watch: {
      hoverIndex: function hoverIndex(val) {
        var _this = this;
        if (typeof val === 'number' && val > -1) {
          this.hoverOption = this.options[val] || {};
        }
        this.options.forEach(function (option) {
          option.hover = _this.hoverOption === option;
        });
      }
    },
    methods: {
      navigateOptions: function navigateOptions(direction) {
        var _this2 = this;
        if (!this.visible) {
          this.visible = true;
          return;
        }
        if (this.options.length === 0 || this.filteredOptionsCount === 0) return;
        if (!this.optionsAllDisabled) {
          if (direction === 'next') {
            this.hoverIndex++;
            if (this.hoverIndex === this.options.length) {
              this.hoverIndex = 0;
            }
          } else if (direction === 'prev') {
            this.hoverIndex--;
            if (this.hoverIndex < 0) {
              this.hoverIndex = this.options.length - 1;
            }
          }
          var option = this.options[this.hoverIndex];
          if (option.disabled === true || option.groupDisabled === true || !option.visible) {
            this.navigateOptions(direction);
          }
          this.$nextTick(function () {
            return _this2.scrollToOption(_this2.hoverOption);
          });
        }
      }
    }
  };

  //
  var script$5 = {
    mixins: [Emitter, Locale, Focus('reference'), NavigationMixin],
    name: 'ElSelect',
    componentName: 'ElSelect',
    inject: {
      elForm: {
        "default": ''
      },
      elFormItem: {
        "default": ''
      }
    },
    provide: function provide() {
      return {
        'select': this
      };
    },
    computed: {
      _elFormItemSize: function _elFormItemSize() {
        return (this.elFormItem || {}).elFormItemSize;
      },
      readonly: function readonly() {
        return !this.filterable || this.multiple || !isIE$1() && !isEdge$1() && !this.visible;
      },
      showClose: function showClose() {
        var hasValue = this.multiple ? Array.isArray(this.value) && this.value.length > 0 : this.value !== undefined && this.value !== null && this.value !== '';
        var criteria = this.clearable && !this.selectDisabled && this.inputHovering && hasValue;
        return criteria;
      },
      iconClass: function iconClass() {
        return this.remote && this.filterable ? '' : this.visible ? 'arrow-up is-reverse' : 'arrow-up';
      },
      debounce: function debounce() {
        return this.remote ? 300 : 0;
      },
      emptyText: function emptyText() {
        if (this.loading) {
          return this.loadingText || this.t('el.select.loading');
        } else {
          if (this.remote && this.query === '' && this.options.length === 0) return false;
          if (this.filterable && this.query && this.options.length > 0 && this.filteredOptionsCount === 0) {
            return this.noMatchText || this.t('el.select.noMatch');
          }
          if (this.options.length === 0) {
            return this.noDataText || this.t('el.select.noData');
          }
        }
        return null;
      },
      showNewOption: function showNewOption() {
        var _this = this;
        var hasExistingOption = this.options.filter(function (option) {
          return !option.created;
        }).some(function (option) {
          return option.currentLabel === _this.query;
        });
        return this.filterable && this.allowCreate && this.query !== '' && !hasExistingOption;
      },
      selectSize: function selectSize() {
        return this.size || this._elFormItemSize || (this.$ELEMENT || {}).size;
      },
      selectDisabled: function selectDisabled() {
        return this.disabled || (this.elForm || {}).disabled;
      },
      collapseTagSize: function collapseTagSize() {
        return ['small', 'mini'].indexOf(this.selectSize) > -1 ? 'mini' : 'small';
      },
      propPlaceholder: function propPlaceholder() {
        return typeof this.placeholder !== 'undefined' ? this.placeholder : this.t('el.select.placeholder');
      }
    },
    components: {
      ElInput: __vue_component__$2,
      ElSelectMenu: __vue_component__$3,
      ElOption: __vue_component__,
      ElTag: __vue_component__$4,
      ElScrollbar: Scrollbar
    },
    directives: {
      Clickoutside: Clickoutside
    },
    props: {
      name: String,
      id: String,
      value: {
        required: true
      },
      autocomplete: {
        type: String,
        "default": 'off'
      },
      /** @Deprecated in next major version */
      autoComplete: {
        type: String,
        validator: function validator(val) {
           console.warn('[Element Warn][Select]\'auto-complete\' property will be deprecated in next major version. please use \'autocomplete\' instead.');
          return true;
        }
      },
      automaticDropdown: Boolean,
      size: String,
      disabled: Boolean,
      clearable: Boolean,
      filterable: Boolean,
      allowCreate: Boolean,
      loading: Boolean,
      popperClass: String,
      remote: Boolean,
      loadingText: String,
      noMatchText: String,
      noDataText: String,
      remoteMethod: Function,
      filterMethod: Function,
      multiple: Boolean,
      multipleLimit: {
        type: Number,
        "default": 0
      },
      placeholder: {
        type: String,
        required: false
      },
      defaultFirstOption: Boolean,
      reserveKeyword: Boolean,
      valueKey: {
        type: String,
        "default": 'value'
      },
      collapseTags: Boolean,
      popperAppendToBody: {
        type: Boolean,
        "default": true
      }
    },
    data: function data() {
      return {
        options: [],
        cachedOptions: [],
        createdLabel: null,
        createdSelected: false,
        selected: this.multiple ? [] : {},
        inputLength: 20,
        inputWidth: 0,
        initialInputHeight: 0,
        cachedPlaceHolder: '',
        optionsCount: 0,
        filteredOptionsCount: 0,
        visible: false,
        softFocus: false,
        selectedLabel: '',
        hoverIndex: -1,
        query: '',
        previousQuery: null,
        inputHovering: false,
        currentPlaceholder: '',
        menuVisibleOnFocus: false,
        isOnComposition: false,
        isSilentBlur: false
      };
    },
    watch: {
      selectDisabled: function selectDisabled() {
        var _this2 = this;
        this.$nextTick(function () {
          _this2.resetInputHeight();
        });
      },
      propPlaceholder: function propPlaceholder(val) {
        this.cachedPlaceHolder = this.currentPlaceholder = val;
      },
      value: function value(val, oldVal) {
        if (this.multiple) {
          this.resetInputHeight();
          if (val && val.length > 0 || this.$refs.input && this.query !== '') {
            this.currentPlaceholder = '';
          } else {
            this.currentPlaceholder = this.cachedPlaceHolder;
          }
          if (this.filterable && !this.reserveKeyword) {
            this.query = '';
            this.handleQueryChange(this.query);
          }
        }
        this.setSelected();
        if (this.filterable && !this.multiple) {
          this.inputLength = 20;
        }
        if (!valueEquals(val, oldVal)) {
          this.dispatch('ElFormItem', 'el.form.change', val);
        }
      },
      visible: function visible(val) {
        var _this3 = this;
        if (!val) {
          this.broadcast('ElSelectDropdown', 'destroyPopper');
          if (this.$refs.input) {
            this.$refs.input.blur();
          }
          this.query = '';
          this.previousQuery = null;
          this.selectedLabel = '';
          this.inputLength = 20;
          this.menuVisibleOnFocus = false;
          this.resetHoverIndex();
          this.$nextTick(function () {
            if (_this3.$refs.input && _this3.$refs.input.value === '' && _this3.selected.length === 0) {
              _this3.currentPlaceholder = _this3.cachedPlaceHolder;
            }
          });
          if (!this.multiple) {
            if (this.selected) {
              if (this.filterable && this.allowCreate && this.createdSelected && this.createdLabel) {
                this.selectedLabel = this.createdLabel;
              } else {
                this.selectedLabel = this.selected.currentLabel;
              }
              if (this.filterable) this.query = this.selectedLabel;
            }
            if (this.filterable) {
              this.currentPlaceholder = this.cachedPlaceHolder;
            }
          }
        } else {
          this.broadcast('ElSelectDropdown', 'updatePopper');
          if (this.filterable) {
            this.query = this.remote ? '' : this.selectedLabel;
            this.handleQueryChange(this.query);
            if (this.multiple) {
              this.$refs.input.focus();
            } else {
              if (!this.remote) {
                this.broadcast('ElOption', 'queryChange', '');
                this.broadcast('ElOptionGroup', 'queryChange');
              }
              if (this.selectedLabel) {
                this.currentPlaceholder = this.selectedLabel;
                this.selectedLabel = '';
              }
            }
          }
        }
        this.$emit('visible-change', val);
      },
      options: function options() {
        var _this4 = this;
        if (this.$isServer) return;
        this.$nextTick(function () {
          _this4.broadcast('ElSelectDropdown', 'updatePopper');
        });
        if (this.multiple) {
          this.resetInputHeight();
        }
        var inputs = this.$el.querySelectorAll('input');
        if ([].indexOf.call(inputs, document.activeElement) === -1) {
          this.setSelected();
        }
        if (this.defaultFirstOption && (this.filterable || this.remote) && this.filteredOptionsCount) {
          this.checkDefaultFirstOption();
        }
      }
    },
    methods: {
      handleNavigate: function handleNavigate(direction) {
        if (this.isOnComposition) return;
        this.navigateOptions(direction);
      },
      handleComposition: function handleComposition(event) {
        var _this5 = this;
        var text = event.target.value;
        if (event.type === 'compositionend') {
          this.isOnComposition = false;
          this.$nextTick(function (_) {
            return _this5.handleQueryChange(text);
          });
        } else {
          var lastCharacter = text[text.length - 1] || '';
          this.isOnComposition = !isKorean(lastCharacter);
        }
      },
      handleQueryChange: function handleQueryChange(val) {
        var _this6 = this;
        if (this.previousQuery === val || this.isOnComposition) return;
        if (this.previousQuery === null && (typeof this.filterMethod === 'function' || typeof this.remoteMethod === 'function')) {
          this.previousQuery = val;
          return;
        }
        this.previousQuery = val;
        this.$nextTick(function () {
          if (_this6.visible) _this6.broadcast('ElSelectDropdown', 'updatePopper');
        });
        this.hoverIndex = -1;
        if (this.multiple && this.filterable) {
          this.$nextTick(function () {
            var length = _this6.$refs.input.value.length * 15 + 20;
            _this6.inputLength = _this6.collapseTags ? Math.min(50, length) : length;
            _this6.managePlaceholder();
            _this6.resetInputHeight();
          });
        }
        if (this.remote && typeof this.remoteMethod === 'function') {
          this.hoverIndex = -1;
          this.remoteMethod(val);
        } else if (typeof this.filterMethod === 'function') {
          this.filterMethod(val);
          this.broadcast('ElOptionGroup', 'queryChange');
        } else {
          this.filteredOptionsCount = this.optionsCount;
          this.broadcast('ElOption', 'queryChange', val);
          this.broadcast('ElOptionGroup', 'queryChange');
        }
        if (this.defaultFirstOption && (this.filterable || this.remote) && this.filteredOptionsCount) {
          this.checkDefaultFirstOption();
        }
      },
      scrollToOption: function scrollToOption(option) {
        var target = Array.isArray(option) && option[0] ? option[0].$el : option.$el;
        if (this.$refs.popper && target) {
          var menu = this.$refs.popper.$el.querySelector('.el-select-dropdown__wrap');
          scrollIntoView(menu, target);
        }
        this.$refs.scrollbar && this.$refs.scrollbar.handleScroll();
      },
      handleMenuEnter: function handleMenuEnter() {
        var _this7 = this;
        this.$nextTick(function () {
          return _this7.scrollToOption(_this7.selected);
        });
      },
      emitChange: function emitChange(val) {
        if (!valueEquals(this.value, val)) {
          this.$emit('change', val);
        }
      },
      getOption: function getOption(value) {
        var option;
        var isObject = Object.prototype.toString.call(value).toLowerCase() === '[object object]';
        var isNull = Object.prototype.toString.call(value).toLowerCase() === '[object null]';
        var isUndefined = Object.prototype.toString.call(value).toLowerCase() === '[object undefined]';
        for (var i = this.cachedOptions.length - 1; i >= 0; i--) {
          var cachedOption = this.cachedOptions[i];
          var isEqual = isObject ? getValueByPath(cachedOption.value, this.valueKey) === getValueByPath(value, this.valueKey) : cachedOption.value === value;
          if (isEqual) {
            option = cachedOption;
            break;
          }
        }
        if (option) return option;
        var label = !isObject && !isNull && !isUndefined ? String(value) : '';
        var newOption = {
          value: value,
          currentLabel: label
        };
        if (this.multiple) {
          newOption.hitState = false;
        }
        return newOption;
      },
      setSelected: function setSelected() {
        var _this8 = this;
        if (!this.multiple) {
          var option = this.getOption(this.value);
          if (option.created) {
            this.createdLabel = option.currentLabel;
            this.createdSelected = true;
          } else {
            this.createdSelected = false;
          }
          this.selectedLabel = option.currentLabel;
          this.selected = option;
          if (this.filterable) this.query = this.selectedLabel;
          return;
        }
        var result = [];
        if (Array.isArray(this.value)) {
          this.value.forEach(function (value) {
            result.push(_this8.getOption(value));
          });
        }
        this.selected = result;
        this.$nextTick(function () {
          _this8.resetInputHeight();
        });
      },
      handleFocus: function handleFocus(event) {
        if (!this.softFocus) {
          if (this.automaticDropdown || this.filterable) {
            if (this.filterable && !this.visible) {
              this.menuVisibleOnFocus = true;
            }
            this.visible = true;
          }
          this.$emit('focus', event);
        } else {
          this.softFocus = false;
        }
      },
      blur: function blur() {
        this.visible = false;
        this.$refs.reference.blur();
      },
      handleBlur: function handleBlur(event) {
        var _this9 = this;
        setTimeout(function () {
          if (_this9.isSilentBlur) {
            _this9.isSilentBlur = false;
          } else {
            _this9.$emit('blur', event);
          }
        }, 50);
        this.softFocus = false;
      },
      handleClearClick: function handleClearClick(event) {
        this.deleteSelected(event);
      },
      doDestroy: function doDestroy() {
        this.$refs.popper && this.$refs.popper.doDestroy();
      },
      handleClose: function handleClose() {
        this.visible = false;
      },
      toggleLastOptionHitState: function toggleLastOptionHitState(hit) {
        if (!Array.isArray(this.selected)) return;
        var option = this.selected[this.selected.length - 1];
        if (!option) return;
        if (hit === true || hit === false) {
          option.hitState = hit;
          return hit;
        }
        option.hitState = !option.hitState;
        return option.hitState;
      },
      deletePrevTag: function deletePrevTag(e) {
        if (e.target.value.length <= 0 && !this.toggleLastOptionHitState()) {
          var value = this.value.slice();
          value.pop();
          this.$emit('input', value);
          this.emitChange(value);
        }
      },
      managePlaceholder: function managePlaceholder() {
        if (this.currentPlaceholder !== '') {
          this.currentPlaceholder = this.$refs.input.value ? '' : this.cachedPlaceHolder;
        }
      },
      resetInputState: function resetInputState(e) {
        if (e.keyCode !== 8) this.toggleLastOptionHitState(false);
        this.inputLength = this.$refs.input.value.length * 15 + 20;
        this.resetInputHeight();
      },
      resetInputHeight: function resetInputHeight() {
        var _this10 = this;
        if (this.collapseTags && !this.filterable) return;
        this.$nextTick(function () {
          if (!_this10.$refs.reference) return;
          var inputChildNodes = _this10.$refs.reference.$el.childNodes;
          var input = [].filter.call(inputChildNodes, function (item) {
            return item.tagName === 'INPUT';
          })[0];
          var tags = _this10.$refs.tags;
          var tagsHeight = tags ? Math.round(tags.getBoundingClientRect().height) : 0;
          var sizeInMap = _this10.initialInputHeight || 40;
          input.style.height = _this10.selected.length === 0 ? sizeInMap + 'px' : Math.max(tags ? tagsHeight + (tagsHeight > sizeInMap ? 6 : 0) : 0, sizeInMap) + 'px';
          if (_this10.visible && _this10.emptyText !== false) {
            _this10.broadcast('ElSelectDropdown', 'updatePopper');
          }
        });
      },
      resetHoverIndex: function resetHoverIndex() {
        var _this11 = this;
        setTimeout(function () {
          if (!_this11.multiple) {
            _this11.hoverIndex = _this11.options.indexOf(_this11.selected);
          } else {
            if (_this11.selected.length > 0) {
              _this11.hoverIndex = Math.min.apply(null, _this11.selected.map(function (item) {
                return _this11.options.indexOf(item);
              }));
            } else {
              _this11.hoverIndex = -1;
            }
          }
        }, 300);
      },
      handleOptionSelect: function handleOptionSelect(option, byClick) {
        var _this12 = this;
        if (this.multiple) {
          var value = (this.value || []).slice();
          var optionIndex = this.getValueIndex(value, option.value);
          if (optionIndex > -1) {
            value.splice(optionIndex, 1);
          } else if (this.multipleLimit <= 0 || value.length < this.multipleLimit) {
            value.push(option.value);
          }
          this.$emit('input', value);
          this.emitChange(value);
          if (option.created) {
            this.query = '';
            this.handleQueryChange('');
            this.inputLength = 20;
          }
          if (this.filterable) this.$refs.input.focus();
        } else {
          this.$emit('input', option.value);
          this.emitChange(option.value);
          this.visible = false;
        }
        this.isSilentBlur = byClick;
        this.setSoftFocus();
        if (this.visible) return;
        this.$nextTick(function () {
          _this12.scrollToOption(option);
        });
      },
      setSoftFocus: function setSoftFocus() {
        this.softFocus = true;
        var input = this.$refs.input || this.$refs.reference;
        if (input) {
          input.focus();
        }
      },
      getValueIndex: function getValueIndex() {
        var arr = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
        var value = arguments.length > 1 ? arguments[1] : undefined;
        var isObject = Object.prototype.toString.call(value).toLowerCase() === '[object object]';
        if (!isObject) {
          return arr.indexOf(value);
        } else {
          var valueKey = this.valueKey;
          var index = -1;
          arr.some(function (item, i) {
            if (getValueByPath(item, valueKey) === getValueByPath(value, valueKey)) {
              index = i;
              return true;
            }
            return false;
          });
          return index;
        }
      },
      toggleMenu: function toggleMenu() {
        if (!this.selectDisabled) {
          if (this.menuVisibleOnFocus) {
            this.menuVisibleOnFocus = false;
          } else {
            this.visible = !this.visible;
          }
          if (this.visible) {
            (this.$refs.input || this.$refs.reference).focus();
          }
        }
      },
      selectOption: function selectOption() {
        if (!this.visible) {
          this.toggleMenu();
        } else {
          if (this.options[this.hoverIndex]) {
            this.handleOptionSelect(this.options[this.hoverIndex]);
          }
        }
      },
      deleteSelected: function deleteSelected(event) {
        event.stopPropagation();
        var value = this.multiple ? [] : '';
        this.$emit('input', value);
        this.emitChange(value);
        this.visible = false;
        this.$emit('clear');
      },
      deleteTag: function deleteTag(event, tag) {
        var index = this.selected.indexOf(tag);
        if (index > -1 && !this.selectDisabled) {
          var value = this.value.slice();
          value.splice(index, 1);
          this.$emit('input', value);
          this.emitChange(value);
          this.$emit('remove-tag', tag.value);
        }
        event.stopPropagation();
      },
      onInputChange: function onInputChange() {
        if (this.filterable && this.query !== this.selectedLabel) {
          this.query = this.selectedLabel;
          this.handleQueryChange(this.query);
        }
      },
      onOptionDestroy: function onOptionDestroy(index) {
        if (index > -1) {
          this.optionsCount--;
          this.filteredOptionsCount--;
          this.options.splice(index, 1);
        }
      },
      resetInputWidth: function resetInputWidth() {
        this.inputWidth = this.$refs.reference.$el.getBoundingClientRect().width;
      },
      handleResize: function handleResize() {
        this.resetInputWidth();
        if (this.multiple) this.resetInputHeight();
      },
      checkDefaultFirstOption: function checkDefaultFirstOption() {
        this.hoverIndex = -1;
        // highlight the created option
        var hasCreated = false;
        for (var i = this.options.length - 1; i >= 0; i--) {
          if (this.options[i].created) {
            hasCreated = true;
            this.hoverIndex = i;
            break;
          }
        }
        if (hasCreated) return;
        for (var _i = 0; _i !== this.options.length; ++_i) {
          var option = this.options[_i];
          if (this.query) {
            // highlight first options that passes the filter
            if (!option.disabled && !option.groupDisabled && option.visible) {
              this.hoverIndex = _i;
              break;
            }
          } else {
            // highlight currently selected option
            if (option.itemSelected) {
              this.hoverIndex = _i;
              break;
            }
          }
        }
      },
      getValueKey: function getValueKey(item) {
        if (Object.prototype.toString.call(item.value).toLowerCase() !== '[object object]') {
          return item.value;
        } else {
          return getValueByPath(item.value, this.valueKey);
        }
      }
    },
    created: function created() {
      var _this13 = this;
      this.cachedPlaceHolder = this.currentPlaceholder = this.propPlaceholder;
      if (this.multiple && !Array.isArray(this.value)) {
        this.$emit('input', []);
      }
      if (!this.multiple && Array.isArray(this.value)) {
        this.$emit('input', '');
      }
      this.debouncedOnInputChange = debounce(this.debounce, function () {
        _this13.onInputChange();
      });
      this.debouncedQueryChange = debounce(this.debounce, function (e) {
        _this13.handleQueryChange(e.target.value);
      });
      this.$on('handleOptionClick', this.handleOptionSelect);
      this.$on('setSelected', this.setSelected);
    },
    mounted: function mounted() {
      var _this14 = this;
      if (this.multiple && Array.isArray(this.value) && this.value.length > 0) {
        this.currentPlaceholder = '';
      }
      addResizeListener(this.$el, this.handleResize);
      var reference = this.$refs.reference;
      if (reference && reference.$el) {
        var sizeMap = {
          medium: 36,
          small: 32,
          mini: 28
        };
        var input = reference.$el.querySelector('input');
        this.initialInputHeight = input.getBoundingClientRect().height || sizeMap[this.selectSize];
      }
      if (this.remote && this.multiple) {
        this.resetInputHeight();
      }
      this.$nextTick(function () {
        if (reference && reference.$el) {
          _this14.inputWidth = reference.$el.getBoundingClientRect().width;
        }
      });
      this.setSelected();
    },
    beforeDestroy: function beforeDestroy() {
      if (this.$el && this.handleResize) removeResizeListener(this.$el, this.handleResize);
    }
  };

  /* script */
  var __vue_script__$5 = script$5;

  /* template */
  var __vue_render__$4 = function __vue_render__() {
    var _vm = this;
    var _h = _vm.$createElement;
    var _c = _vm._self._c || _h;
    return _c("div", {
      directives: [{
        name: "clickoutside",
        rawName: "v-clickoutside",
        value: _vm.handleClose,
        expression: "handleClose"
      }],
      staticClass: "el-select",
      "class": [_vm.selectSize ? "el-select--" + _vm.selectSize : ""],
      on: {
        click: function click($event) {
          $event.stopPropagation();
          return _vm.toggleMenu.apply(null, arguments);
        }
      }
    }, [_vm.multiple ? _c("div", {
      ref: "tags",
      staticClass: "el-select__tags",
      style: {
        "max-width": _vm.inputWidth - 32 + "px",
        width: "100%"
      }
    }, [_vm.collapseTags && _vm.selected.length ? _c("span", [_c("el-tag", {
      attrs: {
        closable: !_vm.selectDisabled,
        size: _vm.collapseTagSize,
        hit: _vm.selected[0].hitState,
        type: "info",
        "disable-transitions": ""
      },
      on: {
        close: function close($event) {
          return _vm.deleteTag($event, _vm.selected[0]);
        }
      }
    }, [_c("span", {
      staticClass: "el-select__tags-text"
    }, [_vm._v(_vm._s(_vm.selected[0].currentLabel))])]), _vm._v(" "), _vm.selected.length > 1 ? _c("el-tag", {
      attrs: {
        closable: false,
        size: _vm.collapseTagSize,
        type: "info",
        "disable-transitions": ""
      }
    }, [_c("span", {
      staticClass: "el-select__tags-text"
    }, [_vm._v("+ " + _vm._s(_vm.selected.length - 1))])]) : _vm._e()], 1) : _vm._e(), _vm._v(" "), !_vm.collapseTags ? _c("transition-group", {
      on: {
        "after-leave": _vm.resetInputHeight
      }
    }, _vm._l(_vm.selected, function (item) {
      return _c("el-tag", {
        key: _vm.getValueKey(item),
        attrs: {
          closable: !_vm.selectDisabled,
          size: _vm.collapseTagSize,
          hit: item.hitState,
          type: "info",
          "disable-transitions": ""
        },
        on: {
          close: function close($event) {
            return _vm.deleteTag($event, item);
          }
        }
      }, [_c("span", {
        staticClass: "el-select__tags-text"
      }, [_vm._v(_vm._s(item.currentLabel))])]);
    }), 1) : _vm._e(), _vm._v(" "), _vm.filterable ? _c("input", {
      directives: [{
        name: "model",
        rawName: "v-model",
        value: _vm.query,
        expression: "query"
      }],
      ref: "input",
      staticClass: "el-select__input",
      "class": [_vm.selectSize ? "is-" + _vm.selectSize : ""],
      style: {
        "flex-grow": "1",
        width: _vm.inputLength / (_vm.inputWidth - 32) + "%",
        "max-width": _vm.inputWidth - 42 + "px"
      },
      attrs: {
        type: "text",
        disabled: _vm.selectDisabled,
        autocomplete: _vm.autoComplete || _vm.autocomplete
      },
      domProps: {
        value: _vm.query
      },
      on: {
        focus: _vm.handleFocus,
        blur: function blur($event) {
          _vm.softFocus = false;
        },
        keyup: _vm.managePlaceholder,
        keydown: [_vm.resetInputState, function ($event) {
          if (!$event.type.indexOf("key") && _vm._k($event.keyCode, "down", 40, $event.key, ["Down", "ArrowDown"])) {
            return null;
          }
          $event.preventDefault();
          return _vm.handleNavigate("next");
        }, function ($event) {
          if (!$event.type.indexOf("key") && _vm._k($event.keyCode, "up", 38, $event.key, ["Up", "ArrowUp"])) {
            return null;
          }
          $event.preventDefault();
          return _vm.handleNavigate("prev");
        }, function ($event) {
          if (!$event.type.indexOf("key") && _vm._k($event.keyCode, "enter", 13, $event.key, "Enter")) {
            return null;
          }
          $event.preventDefault();
          return _vm.selectOption.apply(null, arguments);
        }, function ($event) {
          if (!$event.type.indexOf("key") && _vm._k($event.keyCode, "esc", 27, $event.key, ["Esc", "Escape"])) {
            return null;
          }
          $event.stopPropagation();
          $event.preventDefault();
          _vm.visible = false;
        }, function ($event) {
          if (!$event.type.indexOf("key") && _vm._k($event.keyCode, "delete", [8, 46], $event.key, ["Backspace", "Delete", "Del"])) {
            return null;
          }
          return _vm.deletePrevTag.apply(null, arguments);
        }, function ($event) {
          if (!$event.type.indexOf("key") && _vm._k($event.keyCode, "tab", 9, $event.key, "Tab")) {
            return null;
          }
          _vm.visible = false;
        }],
        compositionstart: _vm.handleComposition,
        compositionupdate: _vm.handleComposition,
        compositionend: _vm.handleComposition,
        input: [function ($event) {
          if ($event.target.composing) {
            return;
          }
          _vm.query = $event.target.value;
        }, _vm.debouncedQueryChange]
      }
    }) : _vm._e()], 1) : _vm._e(), _vm._v(" "), _c("el-input", {
      ref: "reference",
      "class": {
        "is-focus": _vm.visible
      },
      attrs: {
        type: "text",
        placeholder: _vm.currentPlaceholder,
        name: _vm.name,
        id: _vm.id,
        autocomplete: _vm.autoComplete || _vm.autocomplete,
        size: _vm.selectSize,
        disabled: _vm.selectDisabled,
        readonly: _vm.readonly,
        "validate-event": false,
        tabindex: _vm.multiple && _vm.filterable ? "-1" : null
      },
      on: {
        focus: _vm.handleFocus,
        blur: _vm.handleBlur,
        input: _vm.debouncedOnInputChange,
        compositionstart: _vm.handleComposition,
        compositionupdate: _vm.handleComposition,
        compositionend: _vm.handleComposition
      },
      nativeOn: {
        keydown: [function ($event) {
          if (!$event.type.indexOf("key") && _vm._k($event.keyCode, "down", 40, $event.key, ["Down", "ArrowDown"])) {
            return null;
          }
          $event.stopPropagation();
          $event.preventDefault();
          return _vm.handleNavigate("next");
        }, function ($event) {
          if (!$event.type.indexOf("key") && _vm._k($event.keyCode, "up", 38, $event.key, ["Up", "ArrowUp"])) {
            return null;
          }
          $event.stopPropagation();
          $event.preventDefault();
          return _vm.handleNavigate("prev");
        }, function ($event) {
          if (!$event.type.indexOf("key") && _vm._k($event.keyCode, "enter", 13, $event.key, "Enter")) {
            return null;
          }
          $event.preventDefault();
          return _vm.selectOption.apply(null, arguments);
        }, function ($event) {
          if (!$event.type.indexOf("key") && _vm._k($event.keyCode, "esc", 27, $event.key, ["Esc", "Escape"])) {
            return null;
          }
          $event.stopPropagation();
          $event.preventDefault();
          _vm.visible = false;
        }, function ($event) {
          if (!$event.type.indexOf("key") && _vm._k($event.keyCode, "tab", 9, $event.key, "Tab")) {
            return null;
          }
          _vm.visible = false;
        }],
        mouseenter: function mouseenter($event) {
          _vm.inputHovering = true;
        },
        mouseleave: function mouseleave($event) {
          _vm.inputHovering = false;
        }
      },
      model: {
        value: _vm.selectedLabel,
        callback: function callback($$v) {
          _vm.selectedLabel = $$v;
        },
        expression: "selectedLabel"
      }
    }, [_vm.$slots.prefix ? _c("template", {
      slot: "prefix"
    }, [_vm._t("prefix")], 2) : _vm._e(), _vm._v(" "), _c("template", {
      slot: "suffix"
    }, [_c("i", {
      directives: [{
        name: "show",
        rawName: "v-show",
        value: !_vm.showClose,
        expression: "!showClose"
      }],
      "class": ["el-select__caret", "el-input__icon", "el-icon-" + _vm.iconClass]
    }), _vm._v(" "), _vm.showClose ? _c("i", {
      staticClass: "el-select__caret el-input__icon el-icon-circle-close",
      on: {
        click: _vm.handleClearClick
      }
    }) : _vm._e()])], 2), _vm._v(" "), _c("transition", {
      attrs: {
        name: "el-zoom-in-top"
      },
      on: {
        "before-enter": _vm.handleMenuEnter,
        "after-leave": _vm.doDestroy
      }
    }, [_c("el-select-menu", {
      directives: [{
        name: "show",
        rawName: "v-show",
        value: _vm.visible && _vm.emptyText !== false,
        expression: "visible && emptyText !== false"
      }],
      ref: "popper",
      attrs: {
        "append-to-body": _vm.popperAppendToBody
      }
    }, [_c("el-scrollbar", {
      directives: [{
        name: "show",
        rawName: "v-show",
        value: _vm.options.length > 0 && !_vm.loading,
        expression: "options.length > 0 && !loading"
      }],
      ref: "scrollbar",
      "class": {
        "is-empty": !_vm.allowCreate && _vm.query && _vm.filteredOptionsCount === 0
      },
      attrs: {
        tag: "ul",
        "wrap-class": "el-select-dropdown__wrap",
        "view-class": "el-select-dropdown__list"
      }
    }, [_vm.showNewOption ? _c("el-option", {
      attrs: {
        value: _vm.query,
        created: ""
      }
    }) : _vm._e(), _vm._v(" "), _vm._t("default")], 2), _vm._v(" "), _vm.emptyText && (!_vm.allowCreate || _vm.loading || _vm.allowCreate && _vm.options.length === 0) ? [_vm.$slots.empty ? _vm._t("empty") : _c("p", {
      staticClass: "el-select-dropdown__empty"
    }, [_vm._v("\n          " + _vm._s(_vm.emptyText) + "\n        ")])] : _vm._e()], 2)], 1)], 1);
  };
  var __vue_staticRenderFns__$4 = [];
  __vue_render__$4._withStripped = true;

  /* style */
  var __vue_inject_styles__$5 = undefined;
  /* scoped */
  var __vue_scope_id__$5 = undefined;
  /* module identifier */
  var __vue_module_identifier__$5 = undefined;
  /* functional template */
  var __vue_is_functional_template__$5 = false;
  /* style inject */

  /* style inject SSR */

  /* style inject shadow dom */

  var __vue_component__$5 = /*#__PURE__*/normalizeComponent({
    render: __vue_render__$4,
    staticRenderFns: __vue_staticRenderFns__$4
  }, __vue_inject_styles__$5, __vue_script__$5, __vue_scope_id__$5, __vue_is_functional_template__$5, __vue_module_identifier__$5, false, undefined, undefined, undefined);

  /* istanbul ignore next */
  __vue_component__$5.install = function (Vue) {
    Vue.component(__vue_component__$5.name, __vue_component__$5);
  };

  const Test = Component.createComponent({
      name:"es-Test",
      props:{
          address:{
              type:String
          },
          name:{
              type:String
          },
          value:{
              type:String
          },
          childElements:{
              type:null
          },
          isShow:{
              type:Boolean,
              default:true
          }
      }
  });
  const members$5 = {
      _init:{
          m:3,
          d:3,
          value:function _init(options){
              (function(options){
                  Component.prototype._init.call(this,arguments[1],options);
              }).call(this,arguments.length > 1 ? arguments[1] : this.getInitProps(options),options);
              this._initialized();
          }
      },
      onInitialized:{
          m:3,
          d:3,
          value:function onInitialized(){
              console.log('====onInitialized========');
          }
      },
      address:{
          m:3,
          d:4,
          enumerable:true,
          get:function address(){
              return this.reactive("address");
          },
          set:function address(value){
              this.reactive("address",value);
          }
      },
      onBeforeMount:{
          m:3,
          d:3,
          value:function onBeforeMount(){
              console.log('=====beforeMount======');
          }
      },
      name:{
          m:3,
          d:4,
          enumerable:true,
          get:function name(){
              return this.reactive('name');
          },
          set:function name(value){
              this.reactive('name',value);
          }
      },
      value:{
          m:3,
          d:4,
          enumerable:true,
          get:function value(){
              return this.reactive('value');
          },
          set:function value(val){
              console.log('=====ssssssssss======');
              this.reactive('value',val);
          }
      },
      tips:{
          m:3,
          d:3,
          value:function tips(){
              Notification({
                  title:'提示成功',
                  message:'这是提示文案这是提示文案这是提示文案这是提示文案这是提示文案这是提示文案这是提示文案这是提示文案'
              });
          }
      },
      skin:{
          m:3,
          d:4,
          enumerable:true,
          get:function skin(){
              return null;
          }
      },
      childElements:{
          m:3,
          d:4,
          enumerable:true,
          get:function childElements(){
              return this.reactive('children');
          },
          set:function childElements(value){
              this.reactive('children',value);
          }
      },
      render:{
          m:3,
          d:3,
          value:function render(){
              const createElement = this.createVNode.bind(this);
              return createElement("div",null,[
                  createElement("p",null,[
                      createElement("h5",{
                          on:{
                              click:this.tips.bind(this).bind(this)
                          }
                      },[
                          "点击这里提示 "
                      ].concat(
                          this.name
                      )),
                      createElement(__vue_component__$5,{
                          props:{
                              value:this.value,
                              name:"name",
                              size:System.invokeHook("polyfills:value","mini","size","web.ui.Select")
                          },
                          on:{
                              input:(function(event){
                                  this.value=event && event.target && event.target.nodeType===1 ? event.target.value : event;
                              }).bind(this)
                          },
                          directives:[{
                              name:"model",
                              value:this.value
                          }]
                      },[
                          createElement(MyOption,{
                              attrs:{
                                  value:"深圳"
                              }
                          })
                      ].concat(
                          createElement(MyOption,{
                              attrs:{
                                  value:"长沙"
                              }
                          }),
                          this.slot("prefix",()=>[
                              createElement("div",{
                                  slot:"prefix"
                              },["6666"])
                          ])
                      ))
                  ]),
                  createElement(Link$1,{
                      props:{
                          to:'/test'
                      }
                  },["测试页面"]),
                  createElement("br"),
                  createElement(Link$1,{
                      props:{
                          to:'/index'
                      }
                  },["首页面"]),
                  createElement("div",null,[
                      createElement(KeepAlive$1,null,[
                          createElement(Viewport)
                      ])
                  ])
              ]);
          }
      },
      beforeEnter:{
          m:3,
          d:3,
          value:function beforeEnter(...args){
              console.log(args);
          }
      },
      isShow:{
          m:3,
          d:4,
          enumerable:true,
          get:function isShow(){
              return this.reactive("isShow",void 0,function(){
                  return true;
              });
          },
          set:function isShow(value){
              this.reactive("isShow",value);
          }
      },
      toggle:{
          m:3,
          d:3,
          value:function toggle(){
              this.isShow=!this.isShow;
              console.log('--------',this.isShow);
          }
      }
  };
  Class.creator(4,Test,{
      id:1,
      name:"Test",
      inherit:Component,
      members:members$5
  });

  /*
   * Copyright © 2017 EaseScript All rights reserved.
   * Released under the MIT license
   * https://github.com/51breeze/EaseScript
   * @author Jun Ye <664371281@qq.com>
   */
  var TransitionGroup$1 = Vue.component('TransitionGroup');

  function TransitionEvent(){}
  const methods$1 = {
      BEFORE_ENTER:{
          m:3,
          d:2,
          enumerable:true,
          value:'before-enter'
      },
      BEFORE_LEAVE:{
          m:3,
          d:2,
          enumerable:true,
          value:'before-leave'
      },
      BEFORE_APPEAR:{
          m:3,
          d:2,
          enumerable:true,
          value:'before-appear'
      },
      ENTER:{
          m:3,
          d:2,
          enumerable:true,
          value:'enter'
      },
      LEAVE:{
          m:3,
          d:2,
          enumerable:true,
          value:'leave'
      },
      APPEAR:{
          m:3,
          d:2,
          enumerable:true,
          value:'appear'
      },
      AFTER_ENTER:{
          m:3,
          d:2,
          enumerable:true,
          value:'after-enter'
      },
      AFTER_LEAVE:{
          m:3,
          d:2,
          enumerable:true,
          value:'after-leave'
      },
      AFTER_APPEAR:{
          m:3,
          d:2,
          enumerable:true,
          value:'after-appear'
      },
      ENTER_CANELLED:{
          m:3,
          d:2,
          enumerable:true,
          value:'enter-cancelled'
      },
      LEAVE_CANELLED:{
          m:3,
          d:2,
          enumerable:true,
          value:'leave-cancelled'
      },
      APPEAR_CANCELLED:{
          m:3,
          d:2,
          enumerable:true,
          value:'appear-cancelled'
      }
  };
  Class.creator(14,TransitionEvent,{
      id:1,
      ns:"web.events",
      name:"TransitionEvent",
      methods:methods$1
  });

  const PersonSkin = Component.createComponent({
      name:"es-PersonSkin",
      props:{
          address:{
              type:String,
              default:'address'
          },
          name:{
              type:String
          },
          value:{
              type:String
          },
          isShow:{
              type:Boolean,
              default:true
          }
      }
  });
  const members$6 = {
      render:{
          m:3,
          d:3,
          value:function render(){
              const createElement = this.createVNode.bind(this);
              return createElement("div",null,[
                  this.name ? createElement("div",{
                      class:'bg'
                  },["1"]) : !(this.name) ? createElement("div",null,["2"]) : createElement("div",null,["399999"])
              ].concat(
                  ['china'].concat(this.list).map((item,key)=>createElement("div",null,[
                      createElement("div",null,[item]),
                      createElement("div",{
                          class:"ssss"
                      },[
                          createElement("div",null,[
                              createElement("span",null,[].concat(
                                  this.slot("default")
                              ))
                          ])
                      ])
                  ])),
                  createElement("div",{
                      ref:'iss',
                      refInFor:false,
                      class:""
                  },[
                      createElement("div",null,[
                          "item =====PersonSkin==== ",
                          this.name,
                          "====="
                      ])
                  ]),
                  createElement(input,{
                      attrs:{
                          value:this.value
                      },
                      on:{
                          input:(function(event){
                              this.value=event && event.target && event.target.nodeType===1 ? event.target.value : event;
                          }).bind(this),
                          change:this.onChange.bind(this)
                      },
                      directives:[{
                          name:"model",
                          value:this.value
                      }]
                  }),
                  createElement(input,{
                      attrs:{
                          value:this.value
                      }
                  }),
                  this.slot("foot",true,[this.list],(props)=>[
                      createElement("div",{
                          slot:"foot"
                      },["===============the is foot slot =============="])
                  ]),
                  createElement("div",{
                      directives:[{
                          name:"show",
                          value:this.isShow
                      }]
                  },[
                      "the is property "
                  ].concat(
                      this.address
                  )),
                  createElement("button",{
                      on:{
                          click:(function(){
                              this.isShow=!this.isShow;
                          }).bind(this)
                      }
                  },["Toggle "]),
                  createElement(TransitionGroup$1,{
                      props:{
                          name:"fade"
                      },
                      on:{
                          [TransitionEvent.BEFORE_ENTER]:this.beforeEnter.bind(this).bind(this)
                      }
                  },[
                      this.isShow ? createElement("p",{
                          key:"1"
                      },["hello"]) : null,
                      this.isShow ? createElement("p",{
                          key:"2"
                      },["hello"]) : null,
                      this.isShow ? createElement("p",{
                          key:"3"
                      },["hello"]) : null
                  ]),
                  this.isShow ? [
                      createElement("div",null,["the is a group condition"]),
                      createElement("div",null,["the is a group condition"]),
                      createElement("div",null,["the is a group condition"]),
                      createElement("div",null,["the is a group condition"]),
                      createElement("div",null,["the is a group condition"]),
                      createElement("div",null,["the is a group condition"])
                  ] : [
                      createElement("div",null,["the is a group elseif"])
                  ],
                  this.list.map((item,index)=>[
                      createElement("div",null,[
                          "====each==",
                          item,
                          "=",
                          index
                      ]),
                      createElement("div",null,[
                          "===22=each==",
                          item,
                          "="
                      ])
                  ]).reduce((acc,item)=>acc.concat(item),[]),
                  ((_refs)=>{
                      var __refs = [];
                      System.forEach(_refs,(item,keyName)=>{
                          __refs=__refs.concat([
                              createElement("div",null,[
                                  "====for===",
                                  item,
                                  ",",
                                  keyName
                              ]),
                              createElement("div",null,[
                                  "===222=for===",
                                  item,
                                  ",",
                                  keyName
                              ])
                          ]);
                      });
                      return __refs;
                  })(this.list),
                  createElement("div",{
                      directives:[{
                          name:"show",
                          value:this.isShow
                      }]
                  },["====show=="]),
                  createElement("div",{
                      directives:[{
                          name:"show",
                          value:this.isShow
                      }]
                  },["===222=show==="])
              ));
          }
      },
      address:{
          m:3,
          d:4,
          enumerable:true,
          get:function address(){
              return this.reactive("address",void 0,function(){
                  return 'address';
              });
          },
          set:function address(value){
              this.reactive("address",value);
          }
      },
      name:{
          m:3,
          d:4,
          enumerable:true,
          get:function name(){
              return this.reactive('name');
          },
          set:function name(value){
              this.reactive('name',value);
          }
      },
      list:{
          m:3,
          d:4,
          enumerable:true,
          get:function list(){
              return ['one','two','three','four','five'];
          }
      },
      onChange:{
          m:3,
          d:3,
          value:function onChange(e){
              this.address=_Reflect.get(PersonSkin,_Reflect.get(PersonSkin,e,"target"),"value") + '---';
          }
      },
      value:{
          m:3,
          d:4,
          enumerable:true,
          get:function value(){
              return this.reactive('value') || '9999';
          },
          set:function value(val){
              this.reactive('value',val);
          }
      },
      beforeEnter:{
          m:3,
          d:3,
          value:function beforeEnter(){
              console.log('=========PersonSkin=====enter');
          }
      },
      isShow:{
          m:3,
          d:4,
          enumerable:true,
          get:function isShow(){
              return this.reactive("isShow",void 0,function(){
                  return true;
              });
          },
          set:function isShow(value){
              this.reactive("isShow",value);
          }
      }
  };
  Class.creator(5,PersonSkin,{
      id:1,
      name:"PersonSkin",
      inherit:Component,
      members:members$6
  });

  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //

  var script$6 = {
    name: 'ElButton',
    inject: {
      elForm: {
        "default": ''
      },
      elFormItem: {
        "default": ''
      }
    },
    props: {
      type: {
        type: String,
        "default": 'default'
      },
      size: String,
      icon: {
        type: String,
        "default": ''
      },
      nativeType: {
        type: String,
        "default": 'button'
      },
      loading: Boolean,
      disabled: Boolean,
      plain: Boolean,
      autofocus: Boolean,
      round: Boolean,
      circle: Boolean
    },
    computed: {
      _elFormItemSize: function _elFormItemSize() {
        return (this.elFormItem || {}).elFormItemSize;
      },
      buttonSize: function buttonSize() {
        return this.size || this._elFormItemSize || (this.$ELEMENT || {}).size;
      },
      buttonDisabled: function buttonDisabled() {
        return this.$options.propsData.hasOwnProperty('disabled') ? this.disabled : (this.elForm || {}).disabled;
      }
    },
    methods: {
      handleClick: function handleClick(evt) {
        this.$emit('click', evt);
      }
    }
  };

  /* script */
  var __vue_script__$6 = script$6;

  /* template */
  var __vue_render__$5 = function __vue_render__() {
    var _vm = this;
    var _h = _vm.$createElement;
    var _c = _vm._self._c || _h;
    return _c("button", {
      staticClass: "el-button",
      "class": [_vm.type ? "el-button--" + _vm.type : "", _vm.buttonSize ? "el-button--" + _vm.buttonSize : "", {
        "is-disabled": _vm.buttonDisabled,
        "is-loading": _vm.loading,
        "is-plain": _vm.plain,
        "is-round": _vm.round,
        "is-circle": _vm.circle
      }],
      attrs: {
        disabled: _vm.buttonDisabled || _vm.loading,
        autofocus: _vm.autofocus,
        type: _vm.nativeType
      },
      on: {
        click: _vm.handleClick
      }
    }, [_vm.loading ? _c("i", {
      staticClass: "el-icon-loading"
    }) : _vm._e(), _vm._v(" "), _vm.icon && !_vm.loading ? _c("i", {
      "class": _vm.icon
    }) : _vm._e(), _vm._v(" "), _vm.$slots["default"] ? _c("span", [_vm._t("default")], 2) : _vm._e()]);
  };
  var __vue_staticRenderFns__$5 = [];
  __vue_render__$5._withStripped = true;

  /* style */
  var __vue_inject_styles__$6 = undefined;
  /* scoped */
  var __vue_scope_id__$6 = undefined;
  /* module identifier */
  var __vue_module_identifier__$6 = undefined;
  /* functional template */
  var __vue_is_functional_template__$6 = false;
  /* style inject */

  /* style inject SSR */

  /* style inject shadow dom */

  var __vue_component__$6 = /*#__PURE__*/normalizeComponent({
    render: __vue_render__$5,
    staticRenderFns: __vue_staticRenderFns__$5
  }, __vue_inject_styles__$6, __vue_script__$6, __vue_scope_id__$6, __vue_is_functional_template__$6, __vue_module_identifier__$6, false, undefined, undefined, undefined);

  /* istanbul ignore next */
  __vue_component__$6.install = function (Vue) {
    Vue.component(__vue_component__$6.name, __vue_component__$6);
  };

  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //

  var script$7 = {
    name: 'ElLink',
    props: {
      type: {
        type: String,
        "default": 'default'
      },
      underline: {
        type: Boolean,
        "default": true
      },
      disabled: Boolean,
      href: String,
      icon: String
    },
    methods: {
      handleClick: function handleClick(event) {
        if (!this.disabled) {
          if (!this.href) {
            this.$emit('click', event);
          }
        }
      }
    }
  };

  /* script */
  var __vue_script__$7 = script$7;

  /* template */
  var __vue_render__$6 = function __vue_render__() {
    var _vm = this;
    var _h = _vm.$createElement;
    var _c = _vm._self._c || _h;
    return _c("a", _vm._b({
      "class": ["el-link", _vm.type ? "el-link--" + _vm.type : "", _vm.disabled && "is-disabled", _vm.underline && !_vm.disabled && "is-underline"],
      attrs: {
        href: _vm.disabled ? null : _vm.href
      },
      on: {
        click: _vm.handleClick
      }
    }, "a", _vm.$attrs, false), [_vm.icon ? _c("i", {
      "class": _vm.icon
    }) : _vm._e(), _vm._v(" "), _vm.$slots["default"] ? _c("span", {
      staticClass: "el-link--inner"
    }, [_vm._t("default")], 2) : _vm._e(), _vm._v(" "), _vm.$slots.icon ? [_vm.$slots.icon ? _vm._t("icon") : _vm._e()] : _vm._e()], 2);
  };
  var __vue_staticRenderFns__$6 = [];
  __vue_render__$6._withStripped = true;

  /* style */
  var __vue_inject_styles__$7 = undefined;
  /* scoped */
  var __vue_scope_id__$7 = undefined;
  /* module identifier */
  var __vue_module_identifier__$7 = undefined;
  /* functional template */
  var __vue_is_functional_template__$7 = false;
  /* style inject */

  /* style inject SSR */

  /* style inject shadow dom */

  var __vue_component__$7 = /*#__PURE__*/normalizeComponent({
    render: __vue_render__$6,
    staticRenderFns: __vue_staticRenderFns__$6
  }, __vue_inject_styles__$7, __vue_script__$7, __vue_scope_id__$7, __vue_is_functional_template__$7, __vue_module_identifier__$7, false, undefined, undefined, undefined);

  /* istanbul ignore next */
  __vue_component__$7.install = function (Vue) {
    Vue.component(__vue_component__$7.name, __vue_component__$7);
  };

  function _extends(){return _extends=Object.assign||function(a){for(var b,c=1;c<arguments.length;c++)for(var d in b=arguments[c],b)Object.prototype.hasOwnProperty.call(b,d)&&(a[d]=b[d]);return a},_extends.apply(this,arguments)}var normalMerge=["attrs","props","domProps"],toArrayMerge=["class","style","directives"],functionalMerge=["on","nativeOn"],mergeJsxProps=function(a){return a.reduce(function(c,a){for(var b in a)if(!c[b])c[b]=a[b];else if(-1!==normalMerge.indexOf(b))c[b]=_extends({},c[b],a[b]);else if(-1!==toArrayMerge.indexOf(b)){var d=c[b]instanceof Array?c[b]:[c[b]],e=a[b]instanceof Array?a[b]:[a[b]];c[b]=d.concat(e);}else if(-1!==functionalMerge.indexOf(b)){for(var f in a[b])if(c[b][f]){var g=c[b][f]instanceof Array?c[b][f]:[c[b][f]],h=a[b][f]instanceof Array?a[b][f]:[a[b][f]];c[b][f]=g.concat(h);}else c[b][f]=a[b][f];}else if("hook"==b)for(var i in a[b])c[b][i]=c[b][i]?mergeFn(c[b][i],a[b][i]):a[b][i];else c[b]=a[b];return c},{})},mergeFn=function(a,b){return function(){a&&a.apply(this,arguments),b&&b.apply(this,arguments);}};var helper=mergeJsxProps;

  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //

  var script$8 = {
    name: 'ElProgress',
    props: {
      type: {
        type: String,
        "default": 'line',
        validator: function validator(val) {
          return ['line', 'circle', 'dashboard'].indexOf(val) > -1;
        }
      },
      percentage: {
        type: Number,
        "default": 0,
        required: true,
        validator: function validator(val) {
          return val >= 0 && val <= 100;
        }
      },
      status: {
        type: String,
        validator: function validator(val) {
          return ['success', 'exception', 'warning'].indexOf(val) > -1;
        }
      },
      strokeWidth: {
        type: Number,
        "default": 6
      },
      strokeLinecap: {
        type: String,
        "default": 'round'
      },
      textInside: {
        type: Boolean,
        "default": false
      },
      width: {
        type: Number,
        "default": 126
      },
      showText: {
        type: Boolean,
        "default": true
      },
      color: {
        type: [String, Array, Function],
        "default": ''
      },
      format: Function
    },
    computed: {
      barStyle: function barStyle() {
        var style = {};
        style.width = this.percentage + '%';
        style.backgroundColor = this.getCurrentColor(this.percentage);
        return style;
      },
      relativeStrokeWidth: function relativeStrokeWidth() {
        return (this.strokeWidth / this.width * 100).toFixed(1);
      },
      radius: function radius() {
        if (this.type === 'circle' || this.type === 'dashboard') {
          return parseInt(50 - parseFloat(this.relativeStrokeWidth) / 2, 10);
        } else {
          return 0;
        }
      },
      trackPath: function trackPath() {
        var radius = this.radius;
        var isDashboard = this.type === 'dashboard';
        return "\n        M 50 50\n        m 0 ".concat(isDashboard ? '' : '-').concat(radius, "\n        a ").concat(radius, " ").concat(radius, " 0 1 1 0 ").concat(isDashboard ? '-' : '').concat(radius * 2, "\n        a ").concat(radius, " ").concat(radius, " 0 1 1 0 ").concat(isDashboard ? '' : '-').concat(radius * 2, "\n        ");
      },
      perimeter: function perimeter() {
        return 2 * Math.PI * this.radius;
      },
      rate: function rate() {
        return this.type === 'dashboard' ? 0.75 : 1;
      },
      strokeDashoffset: function strokeDashoffset() {
        var offset = -1 * this.perimeter * (1 - this.rate) / 2;
        return "".concat(offset, "px");
      },
      trailPathStyle: function trailPathStyle() {
        return {
          strokeDasharray: "".concat(this.perimeter * this.rate, "px, ").concat(this.perimeter, "px"),
          strokeDashoffset: this.strokeDashoffset
        };
      },
      circlePathStyle: function circlePathStyle() {
        return {
          strokeDasharray: "".concat(this.perimeter * this.rate * (this.percentage / 100), "px, ").concat(this.perimeter, "px"),
          strokeDashoffset: this.strokeDashoffset,
          transition: 'stroke-dasharray 0.6s ease 0s, stroke 0.6s ease'
        };
      },
      stroke: function stroke() {
        var ret;
        if (this.color) {
          ret = this.getCurrentColor(this.percentage);
        } else {
          switch (this.status) {
            case 'success':
              ret = '#13ce66';
              break;
            case 'exception':
              ret = '#ff4949';
              break;
            case 'warning':
              ret = '#e6a23c';
              break;
            default:
              ret = '#20a0ff';
          }
        }
        return ret;
      },
      iconClass: function iconClass() {
        if (this.status === 'warning') {
          return 'el-icon-warning';
        }
        if (this.type === 'line') {
          return this.status === 'success' ? 'el-icon-circle-check' : 'el-icon-circle-close';
        } else {
          return this.status === 'success' ? 'el-icon-check' : 'el-icon-close';
        }
      },
      progressTextSize: function progressTextSize() {
        return this.type === 'line' ? 12 + this.strokeWidth * 0.4 : this.width * 0.111111 + 2;
      },
      content: function content() {
        if (typeof this.format === 'function') {
          return this.format(this.percentage) || '';
        } else {
          return "".concat(this.percentage, "%");
        }
      }
    },
    methods: {
      getCurrentColor: function getCurrentColor(percentage) {
        if (typeof this.color === 'function') {
          return this.color(percentage);
        } else if (typeof this.color === 'string') {
          return this.color;
        } else {
          return this.getLevelColor(percentage);
        }
      },
      getLevelColor: function getLevelColor(percentage) {
        var colorArray = this.getColorArray().sort(function (a, b) {
          return a.percentage - b.percentage;
        });
        for (var i = 0; i < colorArray.length; i++) {
          if (colorArray[i].percentage > percentage) {
            return colorArray[i].color;
          }
        }
        return colorArray[colorArray.length - 1].color;
      },
      getColorArray: function getColorArray() {
        var color = this.color;
        var span = 100 / color.length;
        return color.map(function (seriesColor, index) {
          if (typeof seriesColor === 'string') {
            return {
              color: seriesColor,
              percentage: (index + 1) * span
            };
          }
          return seriesColor;
        });
      }
    }
  };

  /* script */
  var __vue_script__$8 = script$8;

  /* template */
  var __vue_render__$7 = function __vue_render__() {
    var _vm = this;
    var _h = _vm.$createElement;
    var _c = _vm._self._c || _h;
    return _c("div", {
      staticClass: "el-progress",
      "class": ["el-progress--" + _vm.type, _vm.status ? "is-" + _vm.status : "", {
        "el-progress--without-text": !_vm.showText,
        "el-progress--text-inside": _vm.textInside
      }],
      attrs: {
        role: "progressbar",
        "aria-valuenow": _vm.percentage,
        "aria-valuemin": "0",
        "aria-valuemax": "100"
      }
    }, [_vm.type === "line" ? _c("div", {
      staticClass: "el-progress-bar"
    }, [_c("div", {
      staticClass: "el-progress-bar__outer",
      style: {
        height: _vm.strokeWidth + "px"
      }
    }, [_c("div", {
      staticClass: "el-progress-bar__inner",
      style: _vm.barStyle
    }, [_vm.showText && _vm.textInside ? _c("div", {
      staticClass: "el-progress-bar__innerText"
    }, [_vm._v(_vm._s(_vm.content))]) : _vm._e()])])]) : _c("div", {
      staticClass: "el-progress-circle",
      style: {
        height: _vm.width + "px",
        width: _vm.width + "px"
      }
    }, [_c("svg", {
      attrs: {
        viewBox: "0 0 100 100"
      }
    }, [_c("path", {
      staticClass: "el-progress-circle__track",
      style: _vm.trailPathStyle,
      attrs: {
        d: _vm.trackPath,
        stroke: "#e5e9f2",
        "stroke-width": _vm.relativeStrokeWidth,
        fill: "none"
      }
    }), _vm._v(" "), _c("path", {
      staticClass: "el-progress-circle__path",
      style: _vm.circlePathStyle,
      attrs: {
        d: _vm.trackPath,
        stroke: _vm.stroke,
        fill: "none",
        "stroke-linecap": _vm.strokeLinecap,
        "stroke-width": _vm.percentage ? _vm.relativeStrokeWidth : 0
      }
    })])]), _vm._v(" "), _vm.showText && !_vm.textInside ? _c("div", {
      staticClass: "el-progress__text",
      style: {
        fontSize: _vm.progressTextSize + "px"
      }
    }, [!_vm.status ? [_vm._v(_vm._s(_vm.content))] : _c("i", {
      "class": _vm.iconClass
    })], 2) : _vm._e()]);
  };
  var __vue_staticRenderFns__$7 = [];
  __vue_render__$7._withStripped = true;

  /* style */
  var __vue_inject_styles__$8 = undefined;
  /* scoped */
  var __vue_scope_id__$8 = undefined;
  /* module identifier */
  var __vue_module_identifier__$8 = undefined;
  /* functional template */
  var __vue_is_functional_template__$8 = false;
  /* style inject */

  /* style inject SSR */

  /* style inject shadow dom */

  var __vue_component__$8 = /*#__PURE__*/normalizeComponent({
    render: __vue_render__$7,
    staticRenderFns: __vue_staticRenderFns__$7
  }, __vue_inject_styles__$8, __vue_script__$8, __vue_scope_id__$8, __vue_is_functional_template__$8, __vue_module_identifier__$8, false, undefined, undefined, undefined);

  /* istanbul ignore next */
  __vue_component__$8.install = function (Vue) {
    Vue.component(__vue_component__$8.name, __vue_component__$8);
  };

  //
  var script$9 = {
    name: 'ElUploadList',
    mixins: [Locale],
    data: function data() {
      return {
        focusing: false
      };
    },
    components: {
      ElProgress: __vue_component__$8
    },
    props: {
      files: {
        type: Array,
        "default": function _default() {
          return [];
        }
      },
      disabled: {
        type: Boolean,
        "default": false
      },
      handlePreview: Function,
      listType: String
    },
    methods: {
      parsePercentage: function parsePercentage(val) {
        return parseInt(val, 10);
      },
      handleClick: function handleClick(file) {
        this.handlePreview && this.handlePreview(file);
      }
    }
  };

  /* script */
  var __vue_script__$9 = script$9;

  /* template */
  var __vue_render__$8 = function __vue_render__() {
    var _vm = this;
    var _h = _vm.$createElement;
    var _c = _vm._self._c || _h;
    return _c("transition-group", {
      "class": ["el-upload-list", "el-upload-list--" + _vm.listType, {
        "is-disabled": _vm.disabled
      }],
      attrs: {
        tag: "ul",
        name: "el-list"
      }
    }, _vm._l(_vm.files, function (file) {
      return _c("li", {
        key: file.uid,
        "class": ["el-upload-list__item", "is-" + file.status, _vm.focusing ? "focusing" : ""],
        attrs: {
          tabindex: "0"
        },
        on: {
          keydown: function keydown($event) {
            if (!$event.type.indexOf("key") && _vm._k($event.keyCode, "delete", [8, 46], $event.key, ["Backspace", "Delete", "Del"])) {
              return null;
            }
            !_vm.disabled && _vm.$emit("remove", file);
          },
          focus: function focus($event) {
            _vm.focusing = true;
          },
          blur: function blur($event) {
            _vm.focusing = false;
          },
          click: function click($event) {
            _vm.focusing = false;
          }
        }
      }, [_vm._t("default", function () {
        return [file.status !== "uploading" && ["picture-card", "picture"].indexOf(_vm.listType) > -1 ? _c("img", {
          staticClass: "el-upload-list__item-thumbnail",
          attrs: {
            src: file.url,
            alt: ""
          }
        }) : _vm._e(), _vm._v(" "), _c("a", {
          staticClass: "el-upload-list__item-name",
          on: {
            click: function click($event) {
              return _vm.handleClick(file);
            }
          }
        }, [_c("i", {
          staticClass: "el-icon-document"
        }), _vm._v(_vm._s(file.name) + "\n      ")]), _vm._v(" "), _c("label", {
          staticClass: "el-upload-list__item-status-label"
        }, [_c("i", {
          "class": {
            "el-icon-upload-success": true,
            "el-icon-circle-check": _vm.listType === "text",
            "el-icon-check": ["picture-card", "picture"].indexOf(_vm.listType) > -1
          }
        })]), _vm._v(" "), !_vm.disabled ? _c("i", {
          staticClass: "el-icon-close",
          on: {
            click: function click($event) {
              return _vm.$emit("remove", file);
            }
          }
        }) : _vm._e(), _vm._v(" "), !_vm.disabled ? _c("i", {
          staticClass: "el-icon-close-tip"
        }, [_vm._v(_vm._s(_vm.t("el.upload.deleteTip")))]) : _vm._e(), _vm._v(" "), file.status === "uploading" ? _c("el-progress", {
          attrs: {
            type: _vm.listType === "picture-card" ? "circle" : "line",
            "stroke-width": _vm.listType === "picture-card" ? 6 : 2,
            percentage: _vm.parsePercentage(file.percentage)
          }
        }) : _vm._e(), _vm._v(" "), _vm.listType === "picture-card" ? _c("span", {
          staticClass: "el-upload-list__item-actions"
        }, [_vm.handlePreview && _vm.listType === "picture-card" ? _c("span", {
          staticClass: "el-upload-list__item-preview",
          on: {
            click: function click($event) {
              return _vm.handlePreview(file);
            }
          }
        }, [_c("i", {
          staticClass: "el-icon-zoom-in"
        })]) : _vm._e(), _vm._v(" "), !_vm.disabled ? _c("span", {
          staticClass: "el-upload-list__item-delete",
          on: {
            click: function click($event) {
              return _vm.$emit("remove", file);
            }
          }
        }, [_c("i", {
          staticClass: "el-icon-delete"
        })]) : _vm._e()]) : _vm._e()];
      }, {
        file: file
      })], 2);
    }), 0);
  };
  var __vue_staticRenderFns__$8 = [];
  __vue_render__$8._withStripped = true;

  /* style */
  var __vue_inject_styles__$9 = undefined;
  /* scoped */
  var __vue_scope_id__$9 = undefined;
  /* module identifier */
  var __vue_module_identifier__$9 = undefined;
  /* functional template */
  var __vue_is_functional_template__$9 = false;
  /* style inject */

  /* style inject SSR */

  /* style inject shadow dom */

  var __vue_component__$9 = /*#__PURE__*/normalizeComponent({
    render: __vue_render__$8,
    staticRenderFns: __vue_staticRenderFns__$8
  }, __vue_inject_styles__$9, __vue_script__$9, __vue_scope_id__$9, __vue_is_functional_template__$9, __vue_module_identifier__$9, false, undefined, undefined, undefined);

  function getError(action, option, xhr) {
    var msg;
    if (xhr.response) {
      msg = "".concat(xhr.response.error || xhr.response);
    } else if (xhr.responseText) {
      msg = "".concat(xhr.responseText);
    } else {
      msg = "fail to post ".concat(action, " ").concat(xhr.status);
    }
    var err = new Error(msg);
    err.status = xhr.status;
    err.method = 'post';
    err.url = action;
    return err;
  }
  function getBody(xhr) {
    var text = xhr.responseText || xhr.response;
    if (!text) {
      return text;
    }
    try {
      return JSON.parse(text);
    } catch (e) {
      return text;
    }
  }
  function upload(option) {
    if (typeof XMLHttpRequest === 'undefined') {
      return;
    }
    var xhr = new XMLHttpRequest();
    var action = option.action;
    if (xhr.upload) {
      xhr.upload.onprogress = function progress(e) {
        if (e.total > 0) {
          e.percent = e.loaded / e.total * 100;
        }
        option.onProgress(e);
      };
    }
    var formData = new FormData();
    if (option.data) {
      Object.keys(option.data).forEach(function (key) {
        formData.append(key, option.data[key]);
      });
    }
    formData.append(option.filename, option.file, option.file.name);
    xhr.onerror = function error(e) {
      option.onError(e);
    };
    xhr.onload = function onload() {
      if (xhr.status < 200 || xhr.status >= 300) {
        return option.onError(getError(action, option, xhr));
      }
      option.onSuccess(getBody(xhr));
    };
    xhr.open('post', action, true);
    if (option.withCredentials && 'withCredentials' in xhr) {
      xhr.withCredentials = true;
    }
    var headers = option.headers || {};
    for (var item in headers) {
      if (headers.hasOwnProperty(item) && headers[item] !== null) {
        xhr.setRequestHeader(item, headers[item]);
      }
    }
    xhr.send(formData);
    return xhr;
  }

  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //

  var script$a = {
    name: 'ElUploadDrag',
    props: {
      disabled: Boolean
    },
    inject: {
      uploader: {
        "default": ''
      }
    },
    data: function data() {
      return {
        dragover: false
      };
    },
    methods: {
      onDragover: function onDragover() {
        if (!this.disabled) {
          this.dragover = true;
        }
      },
      onDrop: function onDrop(e) {
        if (this.disabled || !this.uploader) return;
        var accept = this.uploader.accept;
        this.dragover = false;
        if (!accept) {
          this.$emit('file', e.dataTransfer.files);
          return;
        }
        this.$emit('file', [].slice.call(e.dataTransfer.files).filter(function (file) {
          var type = file.type,
            name = file.name;
          var extension = name.indexOf('.') > -1 ? ".".concat(name.split('.').pop()) : '';
          var baseType = type.replace(/\/.*$/, '');
          return accept.split(',').map(function (type) {
            return type.trim();
          }).filter(function (type) {
            return type;
          }).some(function (acceptedType) {
            if (/\..+$/.test(acceptedType)) {
              return extension === acceptedType;
            }
            if (/\/\*$/.test(acceptedType)) {
              return baseType === acceptedType.replace(/\/\*$/, '');
            }
            if (/^[^\/]+\/[^\/]+$/.test(acceptedType)) {
              return type === acceptedType;
            }
            return false;
          });
        }));
      }
    }
  };

  /* script */
  var __vue_script__$a = script$a;

  /* template */
  var __vue_render__$9 = function __vue_render__() {
    var _vm = this;
    var _h = _vm.$createElement;
    var _c = _vm._self._c || _h;
    return _c("div", {
      staticClass: "el-upload-dragger",
      "class": {
        "is-dragover": _vm.dragover
      },
      on: {
        drop: function drop($event) {
          $event.preventDefault();
          return _vm.onDrop.apply(null, arguments);
        },
        dragover: function dragover($event) {
          $event.preventDefault();
          return _vm.onDragover.apply(null, arguments);
        },
        dragleave: function dragleave($event) {
          $event.preventDefault();
          _vm.dragover = false;
        }
      }
    }, [_vm._t("default")], 2);
  };
  var __vue_staticRenderFns__$9 = [];
  __vue_render__$9._withStripped = true;

  /* style */
  var __vue_inject_styles__$a = undefined;
  /* scoped */
  var __vue_scope_id__$a = undefined;
  /* module identifier */
  var __vue_module_identifier__$a = undefined;
  /* functional template */
  var __vue_is_functional_template__$a = false;
  /* style inject */

  /* style inject SSR */

  /* style inject shadow dom */

  var __vue_component__$a = /*#__PURE__*/normalizeComponent({
    render: __vue_render__$9,
    staticRenderFns: __vue_staticRenderFns__$9
  }, __vue_inject_styles__$a, __vue_script__$a, __vue_scope_id__$a, __vue_is_functional_template__$a, __vue_module_identifier__$a, false, undefined, undefined, undefined);

  var script$b = {
    inject: ['uploader'],
    components: {
      UploadDragger: __vue_component__$a
    },
    props: {
      type: String,
      action: {
        type: String,
        required: true
      },
      name: {
        type: String,
        "default": 'file'
      },
      data: Object,
      headers: Object,
      withCredentials: Boolean,
      multiple: Boolean,
      accept: String,
      onStart: Function,
      onProgress: Function,
      onSuccess: Function,
      onError: Function,
      beforeUpload: Function,
      drag: Boolean,
      onPreview: {
        type: Function,
        "default": function _default() {}
      },
      onRemove: {
        type: Function,
        "default": function _default() {}
      },
      fileList: Array,
      autoUpload: Boolean,
      listType: String,
      httpRequest: {
        type: Function,
        "default": upload
      },
      disabled: Boolean,
      limit: Number,
      onExceed: Function
    },
    data: function data() {
      return {
        mouseover: false,
        reqs: {}
      };
    },
    methods: {
      isImage: function isImage(str) {
        return str.indexOf('image') !== -1;
      },
      handleChange: function handleChange(ev) {
        var files = ev.target.files;
        if (!files) return;
        this.uploadFiles(files);
      },
      uploadFiles: function uploadFiles(files) {
        var _this = this;
        if (this.limit && this.fileList.length + files.length > this.limit) {
          this.onExceed && this.onExceed(files, this.fileList);
          return;
        }
        var postFiles = Array.prototype.slice.call(files);
        if (!this.multiple) {
          postFiles = postFiles.slice(0, 1);
        }
        if (postFiles.length === 0) {
          return;
        }
        postFiles.forEach(function (rawFile) {
          _this.onStart(rawFile);
          if (_this.autoUpload) _this.upload(rawFile);
        });
      },
      upload: function upload(rawFile) {
        var _this2 = this;
        this.$refs.input.value = null;
        if (!this.beforeUpload) {
          return this.post(rawFile);
        }
        var before = this.beforeUpload(rawFile);
        if (before && before.then) {
          before.then(function (processedFile) {
            var fileType = Object.prototype.toString.call(processedFile);
            if (fileType === '[object File]' || fileType === '[object Blob]') {
              if (fileType === '[object Blob]') {
                processedFile = new File([processedFile], rawFile.name, {
                  type: rawFile.type
                });
              }
              for (var p in rawFile) {
                if (rawFile.hasOwnProperty(p)) {
                  processedFile[p] = rawFile[p];
                }
              }
              _this2.post(processedFile);
            } else {
              _this2.post(rawFile);
            }
          }, function () {
            _this2.onRemove(null, rawFile);
          });
        } else if (before !== false) {
          this.post(rawFile);
        } else {
          this.onRemove(null, rawFile);
        }
      },
      abort: function abort(file) {
        var reqs = this.reqs;
        if (file) {
          var uid = file;
          if (file.uid) uid = file.uid;
          if (reqs[uid]) {
            reqs[uid].abort();
          }
        } else {
          Object.keys(reqs).forEach(function (uid) {
            if (reqs[uid]) reqs[uid].abort();
            delete reqs[uid];
          });
        }
      },
      post: function post(rawFile) {
        var _this3 = this;
        var uid = rawFile.uid;
        var options = {
          headers: this.headers,
          withCredentials: this.withCredentials,
          file: rawFile,
          data: this.data,
          filename: this.name,
          action: this.action,
          onProgress: function onProgress(e) {
            _this3.onProgress(e, rawFile);
          },
          onSuccess: function onSuccess(res) {
            _this3.onSuccess(res, rawFile);
            delete _this3.reqs[uid];
          },
          onError: function onError(err) {
            _this3.onError(err, rawFile);
            delete _this3.reqs[uid];
          }
        };
        var req = this.httpRequest(options);
        this.reqs[uid] = req;
        if (req && req.then) {
          req.then(options.onSuccess, options.onError);
        }
      },
      handleClick: function handleClick() {
        if (!this.disabled) {
          this.$refs.input.value = null;
          this.$refs.input.click();
        }
      },
      handleKeydown: function handleKeydown(e) {
        if (e.target !== e.currentTarget) return;
        if (e.keyCode === 13 || e.keyCode === 32) {
          this.handleClick();
        }
      }
    },
    render: function render(h) {
      var handleClick = this.handleClick,
        drag = this.drag,
        name = this.name,
        handleChange = this.handleChange,
        multiple = this.multiple,
        accept = this.accept,
        listType = this.listType,
        uploadFiles = this.uploadFiles,
        disabled = this.disabled,
        handleKeydown = this.handleKeydown;
      var data = {
        "class": {
          'el-upload': true
        },
        on: {
          click: handleClick,
          keydown: handleKeydown
        }
      };
      data["class"]["el-upload--".concat(listType)] = true;
      return h("div", helper([{}, data, {
        "attrs": {
          "tabindex": "0"
        }
      }]), [drag ? h("upload-dragger", {
        "attrs": {
          "disabled": disabled
        },
        "on": {
          "file": uploadFiles
        }
      }, [this.$slots["default"]]) : this.$slots["default"], h("input", {
        "class": "el-upload__input",
        "attrs": {
          "type": "file",
          "name": name,
          "multiple": multiple,
          "accept": accept
        },
        "ref": "input",
        "on": {
          "change": handleChange
        }
      })]);
    }
  };

  /* script */
  var __vue_script__$b = script$b;

  /* template */

  /* style */
  var __vue_inject_styles__$b = undefined;
  /* scoped */
  var __vue_scope_id__$b = undefined;
  /* module identifier */
  var __vue_module_identifier__$b = undefined;
  /* functional template */
  var __vue_is_functional_template__$b = undefined;
  /* style inject */

  /* style inject SSR */

  /* style inject shadow dom */

  var __vue_component__$b = /*#__PURE__*/normalizeComponent({}, __vue_inject_styles__$b, __vue_script__$b, __vue_scope_id__$b, __vue_is_functional_template__$b, __vue_module_identifier__$b, false, undefined, undefined, undefined);

  function noop$2() {}
  var script$c = {
    name: 'ElUpload',
    mixins: [Migrating],
    components: {
      ElProgress: __vue_component__$8,
      UploadList: __vue_component__$9,
      Upload: __vue_component__$b
    },
    provide: function provide() {
      return {
        uploader: this
      };
    },
    inject: {
      elForm: {
        "default": ''
      }
    },
    props: {
      action: {
        type: String,
        required: true
      },
      headers: {
        type: Object,
        "default": function _default() {
          return {};
        }
      },
      data: Object,
      multiple: Boolean,
      name: {
        type: String,
        "default": 'file'
      },
      drag: Boolean,
      dragger: Boolean,
      withCredentials: Boolean,
      showFileList: {
        type: Boolean,
        "default": true
      },
      accept: String,
      type: {
        type: String,
        "default": 'select'
      },
      beforeUpload: Function,
      beforeRemove: Function,
      onRemove: {
        type: Function,
        "default": noop$2
      },
      onChange: {
        type: Function,
        "default": noop$2
      },
      onPreview: {
        type: Function
      },
      onSuccess: {
        type: Function,
        "default": noop$2
      },
      onProgress: {
        type: Function,
        "default": noop$2
      },
      onError: {
        type: Function,
        "default": noop$2
      },
      fileList: {
        type: Array,
        "default": function _default() {
          return [];
        }
      },
      autoUpload: {
        type: Boolean,
        "default": true
      },
      listType: {
        type: String,
        "default": 'text' // text,picture,picture-card
      },

      httpRequest: Function,
      disabled: Boolean,
      limit: Number,
      onExceed: {
        type: Function,
        "default": noop$2
      }
    },
    data: function data() {
      return {
        uploadFiles: [],
        dragOver: false,
        draging: false,
        tempIndex: 1
      };
    },
    computed: {
      uploadDisabled: function uploadDisabled() {
        return this.disabled || (this.elForm || {}).disabled;
      }
    },
    watch: {
      listType: function listType(type) {
        if (type === 'picture-card' || type === 'picture') {
          this.uploadFiles = this.uploadFiles.map(function (file) {
            if (!file.url && file.raw) {
              try {
                file.url = URL.createObjectURL(file.raw);
              } catch (err) {
                console.error('[Element Error][Upload]', err);
              }
            }
            return file;
          });
        }
      },
      fileList: {
        immediate: true,
        handler: function handler(fileList) {
          var _this = this;
          this.uploadFiles = fileList.map(function (item) {
            item.uid = item.uid || Date.now() + _this.tempIndex++;
            item.status = item.status || 'success';
            return item;
          });
        }
      }
    },
    methods: {
      handleStart: function handleStart(rawFile) {
        rawFile.uid = Date.now() + this.tempIndex++;
        var file = {
          status: 'ready',
          name: rawFile.name,
          size: rawFile.size,
          percentage: 0,
          uid: rawFile.uid,
          raw: rawFile
        };
        if (this.listType === 'picture-card' || this.listType === 'picture') {
          try {
            file.url = URL.createObjectURL(rawFile);
          } catch (err) {
            console.error('[Element Error][Upload]', err);
            return;
          }
        }
        this.uploadFiles.push(file);
        this.onChange(file, this.uploadFiles);
      },
      handleProgress: function handleProgress(ev, rawFile) {
        var file = this.getFile(rawFile);
        this.onProgress(ev, file, this.uploadFiles);
        file.status = 'uploading';
        file.percentage = ev.percent || 0;
      },
      handleSuccess: function handleSuccess(res, rawFile) {
        var file = this.getFile(rawFile);
        if (file) {
          file.status = 'success';
          file.response = res;
          this.onSuccess(res, file, this.uploadFiles);
          this.onChange(file, this.uploadFiles);
        }
      },
      handleError: function handleError(err, rawFile) {
        var file = this.getFile(rawFile);
        var fileList = this.uploadFiles;
        file.status = 'fail';
        fileList.splice(fileList.indexOf(file), 1);
        this.onError(err, file, this.uploadFiles);
        this.onChange(file, this.uploadFiles);
      },
      handleRemove: function handleRemove(file, raw) {
        var _this2 = this;
        if (raw) {
          file = this.getFile(raw);
        }
        var doRemove = function doRemove() {
          _this2.abort(file);
          var fileList = _this2.uploadFiles;
          fileList.splice(fileList.indexOf(file), 1);
          _this2.onRemove(file, fileList);
        };
        if (!this.beforeRemove) {
          doRemove();
        } else if (typeof this.beforeRemove === 'function') {
          var before = this.beforeRemove(file, this.uploadFiles);
          if (before && before.then) {
            before.then(function () {
              doRemove();
            }, noop$2);
          } else if (before !== false) {
            doRemove();
          }
        }
      },
      getFile: function getFile(rawFile) {
        var fileList = this.uploadFiles;
        var target;
        fileList.every(function (item) {
          target = rawFile.uid === item.uid ? item : null;
          return !target;
        });
        return target;
      },
      abort: function abort(file) {
        this.$refs['upload-inner'].abort(file);
      },
      clearFiles: function clearFiles() {
        this.uploadFiles = [];
      },
      submit: function submit() {
        var _this3 = this;
        this.uploadFiles.filter(function (file) {
          return file.status === 'ready';
        }).forEach(function (file) {
          _this3.$refs['upload-inner'].upload(file.raw);
        });
      },
      getMigratingConfig: function getMigratingConfig() {
        return {
          props: {
            'default-file-list': 'default-file-list is renamed to file-list.',
            'show-upload-list': 'show-upload-list is renamed to show-file-list.',
            'thumbnail-mode': 'thumbnail-mode has been deprecated, you can implement the same effect according to this case: http://element.eleme.io/#/zh-CN/component/upload#yong-hu-tou-xiang-shang-chuan'
          }
        };
      }
    },
    beforeDestroy: function beforeDestroy() {
      this.uploadFiles.forEach(function (file) {
        if (file.url && file.url.indexOf('blob:') === 0) {
          URL.revokeObjectURL(file.url);
        }
      });
    },
    render: function render(h) {
      var _this4 = this;
      var uploadList;
      if (this.showFileList) {
        uploadList = h(__vue_component__$9, {
          "attrs": {
            "disabled": this.uploadDisabled,
            "listType": this.listType,
            "files": this.uploadFiles,
            "handlePreview": this.onPreview
          },
          "on": {
            "remove": this.handleRemove
          }
        }, [function (props) {
          if (_this4.$scopedSlots.file) {
            return _this4.$scopedSlots.file({
              file: props.file
            });
          }
        }]);
      }
      var uploadData = {
        props: {
          type: this.type,
          drag: this.drag,
          action: this.action,
          multiple: this.multiple,
          'before-upload': this.beforeUpload,
          'with-credentials': this.withCredentials,
          headers: this.headers,
          name: this.name,
          data: this.data,
          accept: this.accept,
          fileList: this.uploadFiles,
          autoUpload: this.autoUpload,
          listType: this.listType,
          disabled: this.uploadDisabled,
          limit: this.limit,
          'on-exceed': this.onExceed,
          'on-start': this.handleStart,
          'on-progress': this.handleProgress,
          'on-success': this.handleSuccess,
          'on-error': this.handleError,
          'on-preview': this.onPreview,
          'on-remove': this.handleRemove,
          'http-request': this.httpRequest
        },
        ref: 'upload-inner'
      };
      var trigger = this.$slots.trigger || this.$slots["default"];
      var uploadComponent = h("upload", helper([{}, uploadData]), [trigger]);
      return h("div", [this.listType === 'picture-card' ? uploadList : '', this.$slots.trigger ? [uploadComponent, this.$slots["default"]] : uploadComponent, this.$slots.tip, this.listType !== 'picture-card' ? uploadList : '']);
    }
  };

  /* script */
  var __vue_script__$c = script$c;

  /* template */

  /* style */
  var __vue_inject_styles__$c = undefined;
  /* scoped */
  var __vue_scope_id__$c = undefined;
  /* module identifier */
  var __vue_module_identifier__$c = undefined;
  /* functional template */
  var __vue_is_functional_template__$c = undefined;
  /* style inject */

  /* style inject SSR */

  /* style inject shadow dom */

  var __vue_component__$c = /*#__PURE__*/normalizeComponent({}, __vue_inject_styles__$c, __vue_script__$c, __vue_scope_id__$c, __vue_is_functional_template__$c, __vue_module_identifier__$c, false, undefined, undefined, undefined);

  /* istanbul ignore next */
  __vue_component__$c.install = function (Vue) {
    Vue.component(__vue_component__$c.name, __vue_component__$c);
  };

  const Person = Component.createComponent({
      name:"es-Person",
      props:{
          name:{
              type:String
          }
      }
  });
  const members$7 = {
      _init:{
          m:3,
          d:3,
          value:function _init(options){
              (function(options){
                  Component.prototype._init.call(this,arguments[1],options);
              }).call(this,arguments.length > 1 ? arguments[1] : this.getInitProps(options),options);
              this._initialized();
          }
      },
      name:{
          m:3,
          d:4,
          enumerable:true,
          get:function name(){
              return this.reactive('name');
          },
          set:function name(value){
              this.reactive('name',value);
          }
      },
      onMounted:{
          m:3,
          d:3,
          value:function onMounted(){
              setTimeout(()=>{
                  this.reactive('name','=====手动设置不再接收上级的值 66666=====');
              },1000);
          }
      },
      render:{
          m:3,
          d:3,
          value:function render(){
              const createElement = this.createVNode.bind(this);
              return createElement("div",null,[
                  createElement(PersonSkin,{
                      props:{
                          name:this.name
                      },
                      scopedSlots:{
                          foot:this.slot("foot",true,(props)=>[
                              createElement("div",{
                                  slot:"foot"
                              },["====the is PersonSkin child===="]),
                              createElement("div",{
                                  slot:"foot"
                              },[
                                  "the scope value:"
                              ].concat(
                                  props.props
                              ))
                          ])
                      }
                  },[].concat(
                      this.slot("default",()=>["================== "])
                  )),
                  createElement("div",{
                      attrs:{
                          id:"person-root-child"
                      }
                  },["Person page"]),
                  createElement(__vue_component__$6,null,["button "]),
                  createElement(__vue_component__$7,{
                      props:{
                          type:'primary'
                      }
                  },["text link "]),
                  createElement(__vue_component__$c,{
                      props:{
                          action:'http://sss.com/upload',
                          data:{
                              name:'yejun'
                          },
                          drag:true
                      }
                  },[
                      this.slot("trigger",()=>[
                          createElement("div",{
                              slot:"trigger"
                          },["==========="])
                      ])
                  ].concat(
                      "Upload "
                  ))
              ]);
          }
      }
  };
  Class.creator(2,Person,{
      id:1,
      name:"Person",
      inherit:Component,
      members:members$7
  });

  var logo = "1a6ace377133f14a.png";

  var bind$1 = function bind(fn, thisArg) {
    return function wrap() {
      var args = new Array(arguments.length);
      for (var i = 0; i < args.length; i++) {
        args[i] = arguments[i];
      }
      return fn.apply(thisArg, args);
    };
  };

  // utils is a library of generic helper functions non-specific to axios

  var toString$1 = Object.prototype.toString;

  /**
   * Determine if a value is an Array
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is an Array, otherwise false
   */
  function isArray(val) {
    return Array.isArray(val);
  }

  /**
   * Determine if a value is undefined
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if the value is undefined, otherwise false
   */
  function isUndefined(val) {
    return typeof val === 'undefined';
  }

  /**
   * Determine if a value is a Buffer
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is a Buffer, otherwise false
   */
  function isBuffer(val) {
    return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor)
      && typeof val.constructor.isBuffer === 'function' && val.constructor.isBuffer(val);
  }

  /**
   * Determine if a value is an ArrayBuffer
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is an ArrayBuffer, otherwise false
   */
  function isArrayBuffer(val) {
    return toString$1.call(val) === '[object ArrayBuffer]';
  }

  /**
   * Determine if a value is a FormData
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is an FormData, otherwise false
   */
  function isFormData(val) {
    return toString$1.call(val) === '[object FormData]';
  }

  /**
   * Determine if a value is a view on an ArrayBuffer
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
   */
  function isArrayBufferView(val) {
    var result;
    if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
      result = ArrayBuffer.isView(val);
    } else {
      result = (val) && (val.buffer) && (isArrayBuffer(val.buffer));
    }
    return result;
  }

  /**
   * Determine if a value is a String
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is a String, otherwise false
   */
  function isString(val) {
    return typeof val === 'string';
  }

  /**
   * Determine if a value is a Number
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is a Number, otherwise false
   */
  function isNumber$1(val) {
    return typeof val === 'number';
  }

  /**
   * Determine if a value is an Object
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is an Object, otherwise false
   */
  function isObject$1(val) {
    return val !== null && typeof val === 'object';
  }

  /**
   * Determine if a value is a plain Object
   *
   * @param {Object} val The value to test
   * @return {boolean} True if value is a plain Object, otherwise false
   */
  function isPlainObject$1(val) {
    if (toString$1.call(val) !== '[object Object]') {
      return false;
    }

    var prototype = Object.getPrototypeOf(val);
    return prototype === null || prototype === Object.prototype;
  }

  /**
   * Determine if a value is a Date
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is a Date, otherwise false
   */
  function isDate(val) {
    return toString$1.call(val) === '[object Date]';
  }

  /**
   * Determine if a value is a File
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is a File, otherwise false
   */
  function isFile(val) {
    return toString$1.call(val) === '[object File]';
  }

  /**
   * Determine if a value is a Blob
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is a Blob, otherwise false
   */
  function isBlob(val) {
    return toString$1.call(val) === '[object Blob]';
  }

  /**
   * Determine if a value is a Function
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is a Function, otherwise false
   */
  function isFunction(val) {
    return toString$1.call(val) === '[object Function]';
  }

  /**
   * Determine if a value is a Stream
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is a Stream, otherwise false
   */
  function isStream(val) {
    return isObject$1(val) && isFunction(val.pipe);
  }

  /**
   * Determine if a value is a URLSearchParams object
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is a URLSearchParams object, otherwise false
   */
  function isURLSearchParams(val) {
    return toString$1.call(val) === '[object URLSearchParams]';
  }

  /**
   * Trim excess whitespace off the beginning and end of a string
   *
   * @param {String} str The String to trim
   * @returns {String} The String freed of excess whitespace
   */
  function trim$1(str) {
    return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, '');
  }

  /**
   * Determine if we're running in a standard browser environment
   *
   * This allows axios to run in a web worker, and react-native.
   * Both environments support XMLHttpRequest, but not fully standard globals.
   *
   * web workers:
   *  typeof window -> undefined
   *  typeof document -> undefined
   *
   * react-native:
   *  navigator.product -> 'ReactNative'
   * nativescript
   *  navigator.product -> 'NativeScript' or 'NS'
   */
  function isStandardBrowserEnv() {
    if (typeof navigator !== 'undefined' && (navigator.product === 'ReactNative' ||
                                             navigator.product === 'NativeScript' ||
                                             navigator.product === 'NS')) {
      return false;
    }
    return (
      typeof window !== 'undefined' &&
      typeof document !== 'undefined'
    );
  }

  /**
   * Iterate over an Array or an Object invoking a function for each item.
   *
   * If `obj` is an Array callback will be called passing
   * the value, index, and complete array for each item.
   *
   * If 'obj' is an Object callback will be called passing
   * the value, key, and complete object for each property.
   *
   * @param {Object|Array} obj The object to iterate
   * @param {Function} fn The callback to invoke for each item
   */
  function forEach(obj, fn) {
    // Don't bother if no value provided
    if (obj === null || typeof obj === 'undefined') {
      return;
    }

    // Force an array if not already something iterable
    if (typeof obj !== 'object') {
      /*eslint no-param-reassign:0*/
      obj = [obj];
    }

    if (isArray(obj)) {
      // Iterate over array values
      for (var i = 0, l = obj.length; i < l; i++) {
        fn.call(null, obj[i], i, obj);
      }
    } else {
      // Iterate over object keys
      for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          fn.call(null, obj[key], key, obj);
        }
      }
    }
  }

  /**
   * Accepts varargs expecting each argument to be an object, then
   * immutably merges the properties of each object and returns result.
   *
   * When multiple objects contain the same key the later object in
   * the arguments list will take precedence.
   *
   * Example:
   *
   * ```js
   * var result = merge({foo: 123}, {foo: 456});
   * console.log(result.foo); // outputs 456
   * ```
   *
   * @param {Object} obj1 Object to merge
   * @returns {Object} Result of all merge properties
   */
  function merge$1(/* obj1, obj2, obj3, ... */) {
    var result = {};
    function assignValue(val, key) {
      if (isPlainObject$1(result[key]) && isPlainObject$1(val)) {
        result[key] = merge$1(result[key], val);
      } else if (isPlainObject$1(val)) {
        result[key] = merge$1({}, val);
      } else if (isArray(val)) {
        result[key] = val.slice();
      } else {
        result[key] = val;
      }
    }

    for (var i = 0, l = arguments.length; i < l; i++) {
      forEach(arguments[i], assignValue);
    }
    return result;
  }

  /**
   * Extends object a by mutably adding to it the properties of object b.
   *
   * @param {Object} a The object to be extended
   * @param {Object} b The object to copy properties from
   * @param {Object} thisArg The object to bind function to
   * @return {Object} The resulting value of object a
   */
  function extend$3(a, b, thisArg) {
    forEach(b, function assignValue(val, key) {
      if (thisArg && typeof val === 'function') {
        a[key] = bind$1(val, thisArg);
      } else {
        a[key] = val;
      }
    });
    return a;
  }

  /**
   * Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
   *
   * @param {string} content with BOM
   * @return {string} content value without BOM
   */
  function stripBOM(content) {
    if (content.charCodeAt(0) === 0xFEFF) {
      content = content.slice(1);
    }
    return content;
  }

  var utils = {
    isArray: isArray,
    isArrayBuffer: isArrayBuffer,
    isBuffer: isBuffer,
    isFormData: isFormData,
    isArrayBufferView: isArrayBufferView,
    isString: isString,
    isNumber: isNumber$1,
    isObject: isObject$1,
    isPlainObject: isPlainObject$1,
    isUndefined: isUndefined,
    isDate: isDate,
    isFile: isFile,
    isBlob: isBlob,
    isFunction: isFunction,
    isStream: isStream,
    isURLSearchParams: isURLSearchParams,
    isStandardBrowserEnv: isStandardBrowserEnv,
    forEach: forEach,
    merge: merge$1,
    extend: extend$3,
    trim: trim$1,
    stripBOM: stripBOM
  };

  function encode$1(val) {
    return encodeURIComponent(val).
      replace(/%3A/gi, ':').
      replace(/%24/g, '$').
      replace(/%2C/gi, ',').
      replace(/%20/g, '+').
      replace(/%5B/gi, '[').
      replace(/%5D/gi, ']');
  }

  /**
   * Build a URL by appending params to the end
   *
   * @param {string} url The base of the url (e.g., http://www.google.com)
   * @param {object} [params] The params to be appended
   * @returns {string} The formatted url
   */
  var buildURL = function buildURL(url, params, paramsSerializer) {
    /*eslint no-param-reassign:0*/
    if (!params) {
      return url;
    }

    var serializedParams;
    if (paramsSerializer) {
      serializedParams = paramsSerializer(params);
    } else if (utils.isURLSearchParams(params)) {
      serializedParams = params.toString();
    } else {
      var parts = [];

      utils.forEach(params, function serialize(val, key) {
        if (val === null || typeof val === 'undefined') {
          return;
        }

        if (utils.isArray(val)) {
          key = key + '[]';
        } else {
          val = [val];
        }

        utils.forEach(val, function parseValue(v) {
          if (utils.isDate(v)) {
            v = v.toISOString();
          } else if (utils.isObject(v)) {
            v = JSON.stringify(v);
          }
          parts.push(encode$1(key) + '=' + encode$1(v));
        });
      });

      serializedParams = parts.join('&');
    }

    if (serializedParams) {
      var hashmarkIndex = url.indexOf('#');
      if (hashmarkIndex !== -1) {
        url = url.slice(0, hashmarkIndex);
      }

      url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
    }

    return url;
  };

  function InterceptorManager() {
    this.handlers = [];
  }

  /**
   * Add a new interceptor to the stack
   *
   * @param {Function} fulfilled The function to handle `then` for a `Promise`
   * @param {Function} rejected The function to handle `reject` for a `Promise`
   *
   * @return {Number} An ID used to remove interceptor later
   */
  InterceptorManager.prototype.use = function use(fulfilled, rejected, options) {
    this.handlers.push({
      fulfilled: fulfilled,
      rejected: rejected,
      synchronous: options ? options.synchronous : false,
      runWhen: options ? options.runWhen : null
    });
    return this.handlers.length - 1;
  };

  /**
   * Remove an interceptor from the stack
   *
   * @param {Number} id The ID that was returned by `use`
   */
  InterceptorManager.prototype.eject = function eject(id) {
    if (this.handlers[id]) {
      this.handlers[id] = null;
    }
  };

  /**
   * Iterate over all the registered interceptors
   *
   * This method is particularly useful for skipping over any
   * interceptors that may have become `null` calling `eject`.
   *
   * @param {Function} fn The function to call for each interceptor
   */
  InterceptorManager.prototype.forEach = function forEach(fn) {
    utils.forEach(this.handlers, function forEachHandler(h) {
      if (h !== null) {
        fn(h);
      }
    });
  };

  var InterceptorManager_1 = InterceptorManager;

  var normalizeHeaderName = function normalizeHeaderName(headers, normalizedName) {
    utils.forEach(headers, function processHeader(value, name) {
      if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
        headers[normalizedName] = value;
        delete headers[name];
      }
    });
  };

  /**
   * Update an Error with the specified config, error code, and response.
   *
   * @param {Error} error The error to update.
   * @param {Object} config The config.
   * @param {string} [code] The error code (for example, 'ECONNABORTED').
   * @param {Object} [request] The request.
   * @param {Object} [response] The response.
   * @returns {Error} The error.
   */
  var enhanceError = function enhanceError(error, config, code, request, response) {
    error.config = config;
    if (code) {
      error.code = code;
    }

    error.request = request;
    error.response = response;
    error.isAxiosError = true;

    error.toJSON = function toJSON() {
      return {
        // Standard
        message: this.message,
        name: this.name,
        // Microsoft
        description: this.description,
        number: this.number,
        // Mozilla
        fileName: this.fileName,
        lineNumber: this.lineNumber,
        columnNumber: this.columnNumber,
        stack: this.stack,
        // Axios
        config: this.config,
        code: this.code,
        status: this.response && this.response.status ? this.response.status : null
      };
    };
    return error;
  };

  var transitional = {
    silentJSONParsing: true,
    forcedJSONParsing: true,
    clarifyTimeoutError: false
  };

  /**
   * Create an Error with the specified message, config, error code, request and response.
   *
   * @param {string} message The error message.
   * @param {Object} config The config.
   * @param {string} [code] The error code (for example, 'ECONNABORTED').
   * @param {Object} [request] The request.
   * @param {Object} [response] The response.
   * @returns {Error} The created error.
   */
  var createError = function createError(message, config, code, request, response) {
    var error = new Error(message);
    return enhanceError(error, config, code, request, response);
  };

  /**
   * Resolve or reject a Promise based on response status.
   *
   * @param {Function} resolve A function that resolves the promise.
   * @param {Function} reject A function that rejects the promise.
   * @param {object} response The response.
   */
  var settle = function settle(resolve, reject, response) {
    var validateStatus = response.config.validateStatus;
    if (!response.status || !validateStatus || validateStatus(response.status)) {
      resolve(response);
    } else {
      reject(createError(
        'Request failed with status code ' + response.status,
        response.config,
        null,
        response.request,
        response
      ));
    }
  };

  var cookies = (
    utils.isStandardBrowserEnv() ?

    // Standard browser envs support document.cookie
      (function standardBrowserEnv() {
        return {
          write: function write(name, value, expires, path, domain, secure) {
            var cookie = [];
            cookie.push(name + '=' + encodeURIComponent(value));

            if (utils.isNumber(expires)) {
              cookie.push('expires=' + new Date(expires).toGMTString());
            }

            if (utils.isString(path)) {
              cookie.push('path=' + path);
            }

            if (utils.isString(domain)) {
              cookie.push('domain=' + domain);
            }

            if (secure === true) {
              cookie.push('secure');
            }

            document.cookie = cookie.join('; ');
          },

          read: function read(name) {
            var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
            return (match ? decodeURIComponent(match[3]) : null);
          },

          remove: function remove(name) {
            this.write(name, '', Date.now() - 86400000);
          }
        };
      })() :

    // Non standard browser env (web workers, react-native) lack needed support.
      (function nonStandardBrowserEnv() {
        return {
          write: function write() {},
          read: function read() { return null; },
          remove: function remove() {}
        };
      })()
  );

  /**
   * Determines whether the specified URL is absolute
   *
   * @param {string} url The URL to test
   * @returns {boolean} True if the specified URL is absolute, otherwise false
   */
  var isAbsoluteURL = function isAbsoluteURL(url) {
    // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
    // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
    // by any combination of letters, digits, plus, period, or hyphen.
    return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(url);
  };

  /**
   * Creates a new URL by combining the specified URLs
   *
   * @param {string} baseURL The base URL
   * @param {string} relativeURL The relative URL
   * @returns {string} The combined URL
   */
  var combineURLs = function combineURLs(baseURL, relativeURL) {
    return relativeURL
      ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
      : baseURL;
  };

  /**
   * Creates a new URL by combining the baseURL with the requestedURL,
   * only when the requestedURL is not already an absolute URL.
   * If the requestURL is absolute, this function returns the requestedURL untouched.
   *
   * @param {string} baseURL The base URL
   * @param {string} requestedURL Absolute or relative URL to combine
   * @returns {string} The combined full path
   */
  var buildFullPath = function buildFullPath(baseURL, requestedURL) {
    if (baseURL && !isAbsoluteURL(requestedURL)) {
      return combineURLs(baseURL, requestedURL);
    }
    return requestedURL;
  };

  // Headers whose duplicates are ignored by node
  // c.f. https://nodejs.org/api/http.html#http_message_headers
  var ignoreDuplicateOf = [
    'age', 'authorization', 'content-length', 'content-type', 'etag',
    'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since',
    'last-modified', 'location', 'max-forwards', 'proxy-authorization',
    'referer', 'retry-after', 'user-agent'
  ];

  /**
   * Parse headers into an object
   *
   * ```
   * Date: Wed, 27 Aug 2014 08:58:49 GMT
   * Content-Type: application/json
   * Connection: keep-alive
   * Transfer-Encoding: chunked
   * ```
   *
   * @param {String} headers Headers needing to be parsed
   * @returns {Object} Headers parsed into an object
   */
  var parseHeaders = function parseHeaders(headers) {
    var parsed = {};
    var key;
    var val;
    var i;

    if (!headers) { return parsed; }

    utils.forEach(headers.split('\n'), function parser(line) {
      i = line.indexOf(':');
      key = utils.trim(line.substr(0, i)).toLowerCase();
      val = utils.trim(line.substr(i + 1));

      if (key) {
        if (parsed[key] && ignoreDuplicateOf.indexOf(key) >= 0) {
          return;
        }
        if (key === 'set-cookie') {
          parsed[key] = (parsed[key] ? parsed[key] : []).concat([val]);
        } else {
          parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
        }
      }
    });

    return parsed;
  };

  var isURLSameOrigin = (
    utils.isStandardBrowserEnv() ?

    // Standard browser envs have full support of the APIs needed to test
    // whether the request URL is of the same origin as current location.
      (function standardBrowserEnv() {
        var msie = /(msie|trident)/i.test(navigator.userAgent);
        var urlParsingNode = document.createElement('a');
        var originURL;

        /**
      * Parse a URL to discover it's components
      *
      * @param {String} url The URL to be parsed
      * @returns {Object}
      */
        function resolveURL(url) {
          var href = url;

          if (msie) {
          // IE needs attribute set twice to normalize properties
            urlParsingNode.setAttribute('href', href);
            href = urlParsingNode.href;
          }

          urlParsingNode.setAttribute('href', href);

          // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
          return {
            href: urlParsingNode.href,
            protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
            host: urlParsingNode.host,
            search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
            hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
            hostname: urlParsingNode.hostname,
            port: urlParsingNode.port,
            pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
              urlParsingNode.pathname :
              '/' + urlParsingNode.pathname
          };
        }

        originURL = resolveURL(window.location.href);

        /**
      * Determine if a URL shares the same origin as the current location
      *
      * @param {String} requestURL The URL to test
      * @returns {boolean} True if URL shares the same origin, otherwise false
      */
        return function isURLSameOrigin(requestURL) {
          var parsed = (utils.isString(requestURL)) ? resolveURL(requestURL) : requestURL;
          return (parsed.protocol === originURL.protocol &&
              parsed.host === originURL.host);
        };
      })() :

    // Non standard browser envs (web workers, react-native) lack needed support.
      (function nonStandardBrowserEnv() {
        return function isURLSameOrigin() {
          return true;
        };
      })()
  );

  /**
   * A `Cancel` is an object that is thrown when an operation is canceled.
   *
   * @class
   * @param {string=} message The message.
   */
  function Cancel(message) {
    this.message = message;
  }

  Cancel.prototype.toString = function toString() {
    return 'Cancel' + (this.message ? ': ' + this.message : '');
  };

  Cancel.prototype.__CANCEL__ = true;

  var Cancel_1 = Cancel;

  var xhr = function xhrAdapter(config) {
    return new Promise(function dispatchXhrRequest(resolve, reject) {
      var requestData = config.data;
      var requestHeaders = config.headers;
      var responseType = config.responseType;
      var onCanceled;
      function done() {
        if (config.cancelToken) {
          config.cancelToken.unsubscribe(onCanceled);
        }

        if (config.signal) {
          config.signal.removeEventListener('abort', onCanceled);
        }
      }

      if (utils.isFormData(requestData)) {
        delete requestHeaders['Content-Type']; // Let the browser set it
      }

      var request = new XMLHttpRequest();

      // HTTP basic authentication
      if (config.auth) {
        var username = config.auth.username || '';
        var password = config.auth.password ? unescape(encodeURIComponent(config.auth.password)) : '';
        requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password);
      }

      var fullPath = buildFullPath(config.baseURL, config.url);
      request.open(config.method.toUpperCase(), buildURL(fullPath, config.params, config.paramsSerializer), true);

      // Set the request timeout in MS
      request.timeout = config.timeout;

      function onloadend() {
        if (!request) {
          return;
        }
        // Prepare the response
        var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
        var responseData = !responseType || responseType === 'text' ||  responseType === 'json' ?
          request.responseText : request.response;
        var response = {
          data: responseData,
          status: request.status,
          statusText: request.statusText,
          headers: responseHeaders,
          config: config,
          request: request
        };

        settle(function _resolve(value) {
          resolve(value);
          done();
        }, function _reject(err) {
          reject(err);
          done();
        }, response);

        // Clean up request
        request = null;
      }

      if ('onloadend' in request) {
        // Use onloadend if available
        request.onloadend = onloadend;
      } else {
        // Listen for ready state to emulate onloadend
        request.onreadystatechange = function handleLoad() {
          if (!request || request.readyState !== 4) {
            return;
          }

          // The request errored out and we didn't get a response, this will be
          // handled by onerror instead
          // With one exception: request that using file: protocol, most browsers
          // will return status as 0 even though it's a successful request
          if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
            return;
          }
          // readystate handler is calling before onerror or ontimeout handlers,
          // so we should call onloadend on the next 'tick'
          setTimeout(onloadend);
        };
      }

      // Handle browser request cancellation (as opposed to a manual cancellation)
      request.onabort = function handleAbort() {
        if (!request) {
          return;
        }

        reject(createError('Request aborted', config, 'ECONNABORTED', request));

        // Clean up request
        request = null;
      };

      // Handle low level network errors
      request.onerror = function handleError() {
        // Real errors are hidden from us by the browser
        // onerror should only fire if it's a network error
        reject(createError('Network Error', config, null, request));

        // Clean up request
        request = null;
      };

      // Handle timeout
      request.ontimeout = function handleTimeout() {
        var timeoutErrorMessage = config.timeout ? 'timeout of ' + config.timeout + 'ms exceeded' : 'timeout exceeded';
        var transitional$1 = config.transitional || transitional;
        if (config.timeoutErrorMessage) {
          timeoutErrorMessage = config.timeoutErrorMessage;
        }
        reject(createError(
          timeoutErrorMessage,
          config,
          transitional$1.clarifyTimeoutError ? 'ETIMEDOUT' : 'ECONNABORTED',
          request));

        // Clean up request
        request = null;
      };

      // Add xsrf header
      // This is only done if running in a standard browser environment.
      // Specifically not if we're in a web worker, or react-native.
      if (utils.isStandardBrowserEnv()) {
        // Add xsrf header
        var xsrfValue = (config.withCredentials || isURLSameOrigin(fullPath)) && config.xsrfCookieName ?
          cookies.read(config.xsrfCookieName) :
          undefined;

        if (xsrfValue) {
          requestHeaders[config.xsrfHeaderName] = xsrfValue;
        }
      }

      // Add headers to the request
      if ('setRequestHeader' in request) {
        utils.forEach(requestHeaders, function setRequestHeader(val, key) {
          if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
            // Remove Content-Type if data is undefined
            delete requestHeaders[key];
          } else {
            // Otherwise add header to the request
            request.setRequestHeader(key, val);
          }
        });
      }

      // Add withCredentials to request if needed
      if (!utils.isUndefined(config.withCredentials)) {
        request.withCredentials = !!config.withCredentials;
      }

      // Add responseType to request if needed
      if (responseType && responseType !== 'json') {
        request.responseType = config.responseType;
      }

      // Handle progress if needed
      if (typeof config.onDownloadProgress === 'function') {
        request.addEventListener('progress', config.onDownloadProgress);
      }

      // Not all browsers support upload events
      if (typeof config.onUploadProgress === 'function' && request.upload) {
        request.upload.addEventListener('progress', config.onUploadProgress);
      }

      if (config.cancelToken || config.signal) {
        // Handle cancellation
        // eslint-disable-next-line func-names
        onCanceled = function(cancel) {
          if (!request) {
            return;
          }
          reject(!cancel || (cancel && cancel.type) ? new Cancel_1('canceled') : cancel);
          request.abort();
          request = null;
        };

        config.cancelToken && config.cancelToken.subscribe(onCanceled);
        if (config.signal) {
          config.signal.aborted ? onCanceled() : config.signal.addEventListener('abort', onCanceled);
        }
      }

      if (!requestData) {
        requestData = null;
      }

      // Send the request
      request.send(requestData);
    });
  };

  function createCommonjsModule(fn, module) {
  	return module = { exports: {} }, fn(module, module.exports), module.exports;
  }

  /**
   * Helpers.
   */

  var s = 1000;
  var m = s * 60;
  var h = m * 60;
  var d = h * 24;
  var w = d * 7;
  var y = d * 365.25;

  /**
   * Parse or format the given `val`.
   *
   * Options:
   *
   *  - `long` verbose formatting [false]
   *
   * @param {String|Number} val
   * @param {Object} [options]
   * @throws {Error} throw an error if val is not a non-empty string or a number
   * @return {String|Number}
   * @api public
   */

  var ms = function(val, options) {
    options = options || {};
    var type = typeof val;
    if (type === 'string' && val.length > 0) {
      return parse$1(val);
    } else if (type === 'number' && isFinite(val)) {
      return options.long ? fmtLong(val) : fmtShort(val);
    }
    throw new Error(
      'val is not a non-empty string or a valid number. val=' +
        JSON.stringify(val)
    );
  };

  /**
   * Parse the given `str` and return milliseconds.
   *
   * @param {String} str
   * @return {Number}
   * @api private
   */

  function parse$1(str) {
    str = String(str);
    if (str.length > 100) {
      return;
    }
    var match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
      str
    );
    if (!match) {
      return;
    }
    var n = parseFloat(match[1]);
    var type = (match[2] || 'ms').toLowerCase();
    switch (type) {
      case 'years':
      case 'year':
      case 'yrs':
      case 'yr':
      case 'y':
        return n * y;
      case 'weeks':
      case 'week':
      case 'w':
        return n * w;
      case 'days':
      case 'day':
      case 'd':
        return n * d;
      case 'hours':
      case 'hour':
      case 'hrs':
      case 'hr':
      case 'h':
        return n * h;
      case 'minutes':
      case 'minute':
      case 'mins':
      case 'min':
      case 'm':
        return n * m;
      case 'seconds':
      case 'second':
      case 'secs':
      case 'sec':
      case 's':
        return n * s;
      case 'milliseconds':
      case 'millisecond':
      case 'msecs':
      case 'msec':
      case 'ms':
        return n;
      default:
        return undefined;
    }
  }

  /**
   * Short format for `ms`.
   *
   * @param {Number} ms
   * @return {String}
   * @api private
   */

  function fmtShort(ms) {
    var msAbs = Math.abs(ms);
    if (msAbs >= d) {
      return Math.round(ms / d) + 'd';
    }
    if (msAbs >= h) {
      return Math.round(ms / h) + 'h';
    }
    if (msAbs >= m) {
      return Math.round(ms / m) + 'm';
    }
    if (msAbs >= s) {
      return Math.round(ms / s) + 's';
    }
    return ms + 'ms';
  }

  /**
   * Long format for `ms`.
   *
   * @param {Number} ms
   * @return {String}
   * @api private
   */

  function fmtLong(ms) {
    var msAbs = Math.abs(ms);
    if (msAbs >= d) {
      return plural(ms, msAbs, d, 'day');
    }
    if (msAbs >= h) {
      return plural(ms, msAbs, h, 'hour');
    }
    if (msAbs >= m) {
      return plural(ms, msAbs, m, 'minute');
    }
    if (msAbs >= s) {
      return plural(ms, msAbs, s, 'second');
    }
    return ms + ' ms';
  }

  /**
   * Pluralization helper.
   */

  function plural(ms, msAbs, n, name) {
    var isPlural = msAbs >= n * 1.5;
    return Math.round(ms / n) + ' ' + name + (isPlural ? 's' : '');
  }

  /**
   * This is the common logic for both the Node.js and web browser
   * implementations of `debug()`.
   */

  function setup(env) {
  	createDebug.debug = createDebug;
  	createDebug.default = createDebug;
  	createDebug.coerce = coerce;
  	createDebug.disable = disable;
  	createDebug.enable = enable;
  	createDebug.enabled = enabled;
  	createDebug.humanize = ms;
  	createDebug.destroy = destroy;

  	Object.keys(env).forEach(key => {
  		createDebug[key] = env[key];
  	});

  	/**
  	* The currently active debug mode names, and names to skip.
  	*/

  	createDebug.names = [];
  	createDebug.skips = [];

  	/**
  	* Map of special "%n" handling functions, for the debug "format" argument.
  	*
  	* Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
  	*/
  	createDebug.formatters = {};

  	/**
  	* Selects a color for a debug namespace
  	* @param {String} namespace The namespace string for the debug instance to be colored
  	* @return {Number|String} An ANSI color code for the given namespace
  	* @api private
  	*/
  	function selectColor(namespace) {
  		let hash = 0;

  		for (let i = 0; i < namespace.length; i++) {
  			hash = ((hash << 5) - hash) + namespace.charCodeAt(i);
  			hash |= 0; // Convert to 32bit integer
  		}

  		return createDebug.colors[Math.abs(hash) % createDebug.colors.length];
  	}
  	createDebug.selectColor = selectColor;

  	/**
  	* Create a debugger with the given `namespace`.
  	*
  	* @param {String} namespace
  	* @return {Function}
  	* @api public
  	*/
  	function createDebug(namespace) {
  		let prevTime;
  		let enableOverride = null;
  		let namespacesCache;
  		let enabledCache;

  		function debug(...args) {
  			// Disabled?
  			if (!debug.enabled) {
  				return;
  			}

  			const self = debug;

  			// Set `diff` timestamp
  			const curr = Number(new Date());
  			const ms = curr - (prevTime || curr);
  			self.diff = ms;
  			self.prev = prevTime;
  			self.curr = curr;
  			prevTime = curr;

  			args[0] = createDebug.coerce(args[0]);

  			if (typeof args[0] !== 'string') {
  				// Anything else let's inspect with %O
  				args.unshift('%O');
  			}

  			// Apply any `formatters` transformations
  			let index = 0;
  			args[0] = args[0].replace(/%([a-zA-Z%])/g, (match, format) => {
  				// If we encounter an escaped % then don't increase the array index
  				if (match === '%%') {
  					return '%';
  				}
  				index++;
  				const formatter = createDebug.formatters[format];
  				if (typeof formatter === 'function') {
  					const val = args[index];
  					match = formatter.call(self, val);

  					// Now we need to remove `args[index]` since it's inlined in the `format`
  					args.splice(index, 1);
  					index--;
  				}
  				return match;
  			});

  			// Apply env-specific formatting (colors, etc.)
  			createDebug.formatArgs.call(self, args);

  			const logFn = self.log || createDebug.log;
  			logFn.apply(self, args);
  		}

  		debug.namespace = namespace;
  		debug.useColors = createDebug.useColors();
  		debug.color = createDebug.selectColor(namespace);
  		debug.extend = extend;
  		debug.destroy = createDebug.destroy; // XXX Temporary. Will be removed in the next major release.

  		Object.defineProperty(debug, 'enabled', {
  			enumerable: true,
  			configurable: false,
  			get: () => {
  				if (enableOverride !== null) {
  					return enableOverride;
  				}
  				if (namespacesCache !== createDebug.namespaces) {
  					namespacesCache = createDebug.namespaces;
  					enabledCache = createDebug.enabled(namespace);
  				}

  				return enabledCache;
  			},
  			set: v => {
  				enableOverride = v;
  			}
  		});

  		// Env-specific initialization logic for debug instances
  		if (typeof createDebug.init === 'function') {
  			createDebug.init(debug);
  		}

  		return debug;
  	}

  	function extend(namespace, delimiter) {
  		const newDebug = createDebug(this.namespace + (typeof delimiter === 'undefined' ? ':' : delimiter) + namespace);
  		newDebug.log = this.log;
  		return newDebug;
  	}

  	/**
  	* Enables a debug mode by namespaces. This can include modes
  	* separated by a colon and wildcards.
  	*
  	* @param {String} namespaces
  	* @api public
  	*/
  	function enable(namespaces) {
  		createDebug.save(namespaces);
  		createDebug.namespaces = namespaces;

  		createDebug.names = [];
  		createDebug.skips = [];

  		let i;
  		const split = (typeof namespaces === 'string' ? namespaces : '').split(/[\s,]+/);
  		const len = split.length;

  		for (i = 0; i < len; i++) {
  			if (!split[i]) {
  				// ignore empty strings
  				continue;
  			}

  			namespaces = split[i].replace(/\*/g, '.*?');

  			if (namespaces[0] === '-') {
  				createDebug.skips.push(new RegExp('^' + namespaces.slice(1) + '$'));
  			} else {
  				createDebug.names.push(new RegExp('^' + namespaces + '$'));
  			}
  		}
  	}

  	/**
  	* Disable debug output.
  	*
  	* @return {String} namespaces
  	* @api public
  	*/
  	function disable() {
  		const namespaces = [
  			...createDebug.names.map(toNamespace),
  			...createDebug.skips.map(toNamespace).map(namespace => '-' + namespace)
  		].join(',');
  		createDebug.enable('');
  		return namespaces;
  	}

  	/**
  	* Returns true if the given mode name is enabled, false otherwise.
  	*
  	* @param {String} name
  	* @return {Boolean}
  	* @api public
  	*/
  	function enabled(name) {
  		if (name[name.length - 1] === '*') {
  			return true;
  		}

  		let i;
  		let len;

  		for (i = 0, len = createDebug.skips.length; i < len; i++) {
  			if (createDebug.skips[i].test(name)) {
  				return false;
  			}
  		}

  		for (i = 0, len = createDebug.names.length; i < len; i++) {
  			if (createDebug.names[i].test(name)) {
  				return true;
  			}
  		}

  		return false;
  	}

  	/**
  	* Convert regexp to namespace
  	*
  	* @param {RegExp} regxep
  	* @return {String} namespace
  	* @api private
  	*/
  	function toNamespace(regexp) {
  		return regexp.toString()
  			.substring(2, regexp.toString().length - 2)
  			.replace(/\.\*\?$/, '*');
  	}

  	/**
  	* Coerce `val`.
  	*
  	* @param {Mixed} val
  	* @return {Mixed}
  	* @api private
  	*/
  	function coerce(val) {
  		if (val instanceof Error) {
  			return val.stack || val.message;
  		}
  		return val;
  	}

  	/**
  	* XXX DO NOT USE. This is a temporary stub function.
  	* XXX It WILL be removed in the next major release.
  	*/
  	function destroy() {
  		console.warn('Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.');
  	}

  	createDebug.enable(createDebug.load());

  	return createDebug;
  }

  var common = setup;

  var browser = createCommonjsModule(function (module, exports) {
  /* eslint-env browser */

  /**
   * This is the web browser implementation of `debug()`.
   */

  exports.formatArgs = formatArgs;
  exports.save = save;
  exports.load = load;
  exports.useColors = useColors;
  exports.storage = localstorage();
  exports.destroy = (() => {
  	let warned = false;

  	return () => {
  		if (!warned) {
  			warned = true;
  			console.warn('Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.');
  		}
  	};
  })();

  /**
   * Colors.
   */

  exports.colors = [
  	'#0000CC',
  	'#0000FF',
  	'#0033CC',
  	'#0033FF',
  	'#0066CC',
  	'#0066FF',
  	'#0099CC',
  	'#0099FF',
  	'#00CC00',
  	'#00CC33',
  	'#00CC66',
  	'#00CC99',
  	'#00CCCC',
  	'#00CCFF',
  	'#3300CC',
  	'#3300FF',
  	'#3333CC',
  	'#3333FF',
  	'#3366CC',
  	'#3366FF',
  	'#3399CC',
  	'#3399FF',
  	'#33CC00',
  	'#33CC33',
  	'#33CC66',
  	'#33CC99',
  	'#33CCCC',
  	'#33CCFF',
  	'#6600CC',
  	'#6600FF',
  	'#6633CC',
  	'#6633FF',
  	'#66CC00',
  	'#66CC33',
  	'#9900CC',
  	'#9900FF',
  	'#9933CC',
  	'#9933FF',
  	'#99CC00',
  	'#99CC33',
  	'#CC0000',
  	'#CC0033',
  	'#CC0066',
  	'#CC0099',
  	'#CC00CC',
  	'#CC00FF',
  	'#CC3300',
  	'#CC3333',
  	'#CC3366',
  	'#CC3399',
  	'#CC33CC',
  	'#CC33FF',
  	'#CC6600',
  	'#CC6633',
  	'#CC9900',
  	'#CC9933',
  	'#CCCC00',
  	'#CCCC33',
  	'#FF0000',
  	'#FF0033',
  	'#FF0066',
  	'#FF0099',
  	'#FF00CC',
  	'#FF00FF',
  	'#FF3300',
  	'#FF3333',
  	'#FF3366',
  	'#FF3399',
  	'#FF33CC',
  	'#FF33FF',
  	'#FF6600',
  	'#FF6633',
  	'#FF9900',
  	'#FF9933',
  	'#FFCC00',
  	'#FFCC33'
  ];

  /**
   * Currently only WebKit-based Web Inspectors, Firefox >= v31,
   * and the Firebug extension (any Firefox version) are known
   * to support "%c" CSS customizations.
   *
   * TODO: add a `localStorage` variable to explicitly enable/disable colors
   */

  // eslint-disable-next-line complexity
  function useColors() {
  	// NB: In an Electron preload script, document will be defined but not fully
  	// initialized. Since we know we're in Chrome, we'll just detect this case
  	// explicitly
  	if (typeof window !== 'undefined' && window.process && (window.process.type === 'renderer' || window.process.__nwjs)) {
  		return true;
  	}

  	// Internet Explorer and Edge do not support colors.
  	if (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
  		return false;
  	}

  	// Is webkit? http://stackoverflow.com/a/16459606/376773
  	// document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
  	return (typeof document !== 'undefined' && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance) ||
  		// Is firebug? http://stackoverflow.com/a/398120/376773
  		(typeof window !== 'undefined' && window.console && (window.console.firebug || (window.console.exception && window.console.table))) ||
  		// Is firefox >= v31?
  		// https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
  		(typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31) ||
  		// Double check webkit in userAgent just in case we are in a worker
  		(typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/));
  }

  /**
   * Colorize log arguments if enabled.
   *
   * @api public
   */

  function formatArgs(args) {
  	args[0] = (this.useColors ? '%c' : '') +
  		this.namespace +
  		(this.useColors ? ' %c' : ' ') +
  		args[0] +
  		(this.useColors ? '%c ' : ' ') +
  		'+' + module.exports.humanize(this.diff);

  	if (!this.useColors) {
  		return;
  	}

  	const c = 'color: ' + this.color;
  	args.splice(1, 0, c, 'color: inherit');

  	// The final "%c" is somewhat tricky, because there could be other
  	// arguments passed either before or after the %c, so we need to
  	// figure out the correct index to insert the CSS into
  	let index = 0;
  	let lastC = 0;
  	args[0].replace(/%[a-zA-Z%]/g, match => {
  		if (match === '%%') {
  			return;
  		}
  		index++;
  		if (match === '%c') {
  			// We only are interested in the *last* %c
  			// (the user may have provided their own)
  			lastC = index;
  		}
  	});

  	args.splice(lastC, 0, c);
  }

  /**
   * Invokes `console.debug()` when available.
   * No-op when `console.debug` is not a "function".
   * If `console.debug` is not available, falls back
   * to `console.log`.
   *
   * @api public
   */
  exports.log = console.debug || console.log || (() => {});

  /**
   * Save `namespaces`.
   *
   * @param {String} namespaces
   * @api private
   */
  function save(namespaces) {
  	try {
  		if (namespaces) {
  			exports.storage.setItem('debug', namespaces);
  		} else {
  			exports.storage.removeItem('debug');
  		}
  	} catch (error) {
  		// Swallow
  		// XXX (@Qix-) should we be logging these?
  	}
  }

  /**
   * Load `namespaces`.
   *
   * @return {String} returns the previously persisted debug modes
   * @api private
   */
  function load() {
  	let r;
  	try {
  		r = exports.storage.getItem('debug');
  	} catch (error) {
  		// Swallow
  		// XXX (@Qix-) should we be logging these?
  	}

  	// If debug isn't set in LS, and we're in Electron, try to load $DEBUG
  	if (!r && typeof process !== 'undefined' && 'env' in process) {
  		r = process.env.DEBUG;
  	}

  	return r;
  }

  /**
   * Localstorage attempts to return the localstorage.
   *
   * This is necessary because safari throws
   * when a user disables cookies/localstorage
   * and you attempt to access it.
   *
   * @return {LocalStorage}
   * @api private
   */

  function localstorage() {
  	try {
  		// TVMLKit (Apple TV JS Runtime) does not have a window object, just localStorage in the global context
  		// The Browser also has localStorage in the global context.
  		return localStorage;
  	} catch (error) {
  		// Swallow
  		// XXX (@Qix-) should we be logging these?
  	}
  }

  module.exports = common(exports);

  const {formatters} = module.exports;

  /**
   * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
   */

  formatters.j = function (v) {
  	try {
  		return JSON.stringify(v);
  	} catch (error) {
  		return '[UnexpectedJSONParseError]: ' + error.message;
  	}
  };
  });
  var browser_1 = browser.formatArgs;
  var browser_2 = browser.save;
  var browser_3 = browser.load;
  var browser_4 = browser.useColors;
  var browser_5 = browser.storage;
  var browser_6 = browser.destroy;
  var browser_7 = browser.colors;
  var browser_8 = browser.log;

  var hasFlag = (flag, argv) => {
  	argv = argv || process.argv;
  	const prefix = flag.startsWith('-') ? '' : (flag.length === 1 ? '-' : '--');
  	const pos = argv.indexOf(prefix + flag);
  	const terminatorPos = argv.indexOf('--');
  	return pos !== -1 && (terminatorPos === -1 ? true : pos < terminatorPos);
  };

  const env = process.env;

  let forceColor;
  if (hasFlag('no-color') ||
  	hasFlag('no-colors') ||
  	hasFlag('color=false')) {
  	forceColor = false;
  } else if (hasFlag('color') ||
  	hasFlag('colors') ||
  	hasFlag('color=true') ||
  	hasFlag('color=always')) {
  	forceColor = true;
  }
  if ('FORCE_COLOR' in env) {
  	forceColor = env.FORCE_COLOR.length === 0 || parseInt(env.FORCE_COLOR, 10) !== 0;
  }

  function translateLevel(level) {
  	if (level === 0) {
  		return false;
  	}

  	return {
  		level,
  		hasBasic: true,
  		has256: level >= 2,
  		has16m: level >= 3
  	};
  }

  function supportsColor(stream) {
  	if (forceColor === false) {
  		return 0;
  	}

  	if (hasFlag('color=16m') ||
  		hasFlag('color=full') ||
  		hasFlag('color=truecolor')) {
  		return 3;
  	}

  	if (hasFlag('color=256')) {
  		return 2;
  	}

  	if (stream && !stream.isTTY && forceColor !== true) {
  		return 0;
  	}

  	const min = forceColor ? 1 : 0;

  	if (process.platform === 'win32') {
  		// Node.js 7.5.0 is the first version of Node.js to include a patch to
  		// libuv that enables 256 color output on Windows. Anything earlier and it
  		// won't work. However, here we target Node.js 8 at minimum as it is an LTS
  		// release, and Node.js 7 is not. Windows 10 build 10586 is the first Windows
  		// release that supports 256 colors. Windows 10 build 14931 is the first release
  		// that supports 16m/TrueColor.
  		const osRelease = os.release().split('.');
  		if (
  			Number(process.versions.node.split('.')[0]) >= 8 &&
  			Number(osRelease[0]) >= 10 &&
  			Number(osRelease[2]) >= 10586
  		) {
  			return Number(osRelease[2]) >= 14931 ? 3 : 2;
  		}

  		return 1;
  	}

  	if ('CI' in env) {
  		if (['TRAVIS', 'CIRCLECI', 'APPVEYOR', 'GITLAB_CI'].some(sign => sign in env) || env.CI_NAME === 'codeship') {
  			return 1;
  		}

  		return min;
  	}

  	if ('TEAMCITY_VERSION' in env) {
  		return /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(env.TEAMCITY_VERSION) ? 1 : 0;
  	}

  	if (env.COLORTERM === 'truecolor') {
  		return 3;
  	}

  	if ('TERM_PROGRAM' in env) {
  		const version = parseInt((env.TERM_PROGRAM_VERSION || '').split('.')[0], 10);

  		switch (env.TERM_PROGRAM) {
  			case 'iTerm.app':
  				return version >= 3 ? 3 : 2;
  			case 'Apple_Terminal':
  				return 2;
  			// No default
  		}
  	}

  	if (/-256(color)?$/i.test(env.TERM)) {
  		return 2;
  	}

  	if (/^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(env.TERM)) {
  		return 1;
  	}

  	if ('COLORTERM' in env) {
  		return 1;
  	}

  	if (env.TERM === 'dumb') {
  		return min;
  	}

  	return min;
  }

  function getSupportLevel(stream) {
  	const level = supportsColor(stream);
  	return translateLevel(level);
  }

  var supportsColor_1 = {
  	supportsColor: getSupportLevel,
  	stdout: getSupportLevel(process.stdout),
  	stderr: getSupportLevel(process.stderr)
  };

  var node = createCommonjsModule(function (module, exports) {
  /**
   * Module dependencies.
   */




  /**
   * This is the Node.js implementation of `debug()`.
   */

  exports.init = init;
  exports.log = log;
  exports.formatArgs = formatArgs;
  exports.save = save;
  exports.load = load;
  exports.useColors = useColors;
  exports.destroy = util.deprecate(
  	() => {},
  	'Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.'
  );

  /**
   * Colors.
   */

  exports.colors = [6, 2, 3, 4, 5, 1];

  try {
  	// Optional dependency (as in, doesn't need to be installed, NOT like optionalDependencies in package.json)
  	// eslint-disable-next-line import/no-extraneous-dependencies
  	const supportsColor = supportsColor_1;

  	if (supportsColor && (supportsColor.stderr || supportsColor).level >= 2) {
  		exports.colors = [
  			20,
  			21,
  			26,
  			27,
  			32,
  			33,
  			38,
  			39,
  			40,
  			41,
  			42,
  			43,
  			44,
  			45,
  			56,
  			57,
  			62,
  			63,
  			68,
  			69,
  			74,
  			75,
  			76,
  			77,
  			78,
  			79,
  			80,
  			81,
  			92,
  			93,
  			98,
  			99,
  			112,
  			113,
  			128,
  			129,
  			134,
  			135,
  			148,
  			149,
  			160,
  			161,
  			162,
  			163,
  			164,
  			165,
  			166,
  			167,
  			168,
  			169,
  			170,
  			171,
  			172,
  			173,
  			178,
  			179,
  			184,
  			185,
  			196,
  			197,
  			198,
  			199,
  			200,
  			201,
  			202,
  			203,
  			204,
  			205,
  			206,
  			207,
  			208,
  			209,
  			214,
  			215,
  			220,
  			221
  		];
  	}
  } catch (error) {
  	// Swallow - we only care if `supports-color` is available; it doesn't have to be.
  }

  /**
   * Build up the default `inspectOpts` object from the environment variables.
   *
   *   $ DEBUG_COLORS=no DEBUG_DEPTH=10 DEBUG_SHOW_HIDDEN=enabled node script.js
   */

  exports.inspectOpts = Object.keys(process.env).filter(key => {
  	return /^debug_/i.test(key);
  }).reduce((obj, key) => {
  	// Camel-case
  	const prop = key
  		.substring(6)
  		.toLowerCase()
  		.replace(/_([a-z])/g, (_, k) => {
  			return k.toUpperCase();
  		});

  	// Coerce string value into JS value
  	let val = process.env[key];
  	if (/^(yes|on|true|enabled)$/i.test(val)) {
  		val = true;
  	} else if (/^(no|off|false|disabled)$/i.test(val)) {
  		val = false;
  	} else if (val === 'null') {
  		val = null;
  	} else {
  		val = Number(val);
  	}

  	obj[prop] = val;
  	return obj;
  }, {});

  /**
   * Is stdout a TTY? Colored output is enabled when `true`.
   */

  function useColors() {
  	return 'colors' in exports.inspectOpts ?
  		Boolean(exports.inspectOpts.colors) :
  		tty.isatty(process.stderr.fd);
  }

  /**
   * Adds ANSI color escape codes if enabled.
   *
   * @api public
   */

  function formatArgs(args) {
  	const {namespace: name, useColors} = this;

  	if (useColors) {
  		const c = this.color;
  		const colorCode = '\u001B[3' + (c < 8 ? c : '8;5;' + c);
  		const prefix = `  ${colorCode};1m${name} \u001B[0m`;

  		args[0] = prefix + args[0].split('\n').join('\n' + prefix);
  		args.push(colorCode + 'm+' + module.exports.humanize(this.diff) + '\u001B[0m');
  	} else {
  		args[0] = getDate() + name + ' ' + args[0];
  	}
  }

  function getDate() {
  	if (exports.inspectOpts.hideDate) {
  		return '';
  	}
  	return new Date().toISOString() + ' ';
  }

  /**
   * Invokes `util.format()` with the specified arguments and writes to stderr.
   */

  function log(...args) {
  	return process.stderr.write(util.format(...args) + '\n');
  }

  /**
   * Save `namespaces`.
   *
   * @param {String} namespaces
   * @api private
   */
  function save(namespaces) {
  	if (namespaces) {
  		process.env.DEBUG = namespaces;
  	} else {
  		// If you set a process.env field to null or undefined, it gets cast to the
  		// string 'null' or 'undefined'. Just delete instead.
  		delete process.env.DEBUG;
  	}
  }

  /**
   * Load `namespaces`.
   *
   * @return {String} returns the previously persisted debug modes
   * @api private
   */

  function load() {
  	return process.env.DEBUG;
  }

  /**
   * Init logic for `debug` instances.
   *
   * Create a new `inspectOpts` object in case `useColors` is set
   * differently for a particular `debug` instance.
   */

  function init(debug) {
  	debug.inspectOpts = {};

  	const keys = Object.keys(exports.inspectOpts);
  	for (let i = 0; i < keys.length; i++) {
  		debug.inspectOpts[keys[i]] = exports.inspectOpts[keys[i]];
  	}
  }

  module.exports = common(exports);

  const {formatters} = module.exports;

  /**
   * Map %o to `util.inspect()`, all on a single line.
   */

  formatters.o = function (v) {
  	this.inspectOpts.colors = this.useColors;
  	return util.inspect(v, this.inspectOpts)
  		.split('\n')
  		.map(str => str.trim())
  		.join(' ');
  };

  /**
   * Map %O to `util.inspect()`, allowing multiple lines if needed.
   */

  formatters.O = function (v) {
  	this.inspectOpts.colors = this.useColors;
  	return util.inspect(v, this.inspectOpts);
  };
  });
  var node_1 = node.init;
  var node_2 = node.log;
  var node_3 = node.formatArgs;
  var node_4 = node.save;
  var node_5 = node.load;
  var node_6 = node.useColors;
  var node_7 = node.destroy;
  var node_8 = node.colors;
  var node_9 = node.inspectOpts;

  var src = createCommonjsModule(function (module) {
  /**
   * Detect Electron renderer / nwjs process, which is node, but we should
   * treat as a browser.
   */

  if (typeof process === 'undefined' || process.type === 'renderer' || process.browser === true || process.__nwjs) {
  	module.exports = browser;
  } else {
  	module.exports = node;
  }
  });

  var debug;

  var debug_1 = function () {
    if (!debug) {
      try {
        /* eslint global-require: off */
        debug = src("follow-redirects");
      }
      catch (error) { /* */ }
      if (typeof debug !== "function") {
        debug = function () { /* */ };
      }
    }
    debug.apply(null, arguments);
  };

  var URL$1 = url.URL;


  var Writable = stream.Writable;



  // Create handlers that pass events from native requests
  var events$1 = ["abort", "aborted", "connect", "error", "socket", "timeout"];
  var eventHandlers = Object.create(null);
  events$1.forEach(function (event) {
    eventHandlers[event] = function (arg1, arg2, arg3) {
      this._redirectable.emit(event, arg1, arg2, arg3);
    };
  });

  // Error types with codes
  var RedirectionError = createErrorType(
    "ERR_FR_REDIRECTION_FAILURE",
    "Redirected request failed"
  );
  var TooManyRedirectsError = createErrorType(
    "ERR_FR_TOO_MANY_REDIRECTS",
    "Maximum number of redirects exceeded"
  );
  var MaxBodyLengthExceededError = createErrorType(
    "ERR_FR_MAX_BODY_LENGTH_EXCEEDED",
    "Request body larger than maxBodyLength limit"
  );
  var WriteAfterEndError = createErrorType(
    "ERR_STREAM_WRITE_AFTER_END",
    "write after end"
  );

  // An HTTP(S) request that can be redirected
  function RedirectableRequest(options, responseCallback) {
    // Initialize the request
    Writable.call(this);
    this._sanitizeOptions(options);
    this._options = options;
    this._ended = false;
    this._ending = false;
    this._redirectCount = 0;
    this._redirects = [];
    this._requestBodyLength = 0;
    this._requestBodyBuffers = [];

    // Attach a callback if passed
    if (responseCallback) {
      this.on("response", responseCallback);
    }

    // React to responses of native requests
    var self = this;
    this._onNativeResponse = function (response) {
      self._processResponse(response);
    };

    // Perform the first request
    this._performRequest();
  }
  RedirectableRequest.prototype = Object.create(Writable.prototype);

  RedirectableRequest.prototype.abort = function () {
    abortRequest(this._currentRequest);
    this.emit("abort");
  };

  // Writes buffered data to the current native request
  RedirectableRequest.prototype.write = function (data, encoding, callback) {
    // Writing is not allowed if end has been called
    if (this._ending) {
      throw new WriteAfterEndError();
    }

    // Validate input and shift parameters if necessary
    if (!(typeof data === "string" || typeof data === "object" && ("length" in data))) {
      throw new TypeError("data should be a string, Buffer or Uint8Array");
    }
    if (typeof encoding === "function") {
      callback = encoding;
      encoding = null;
    }

    // Ignore empty buffers, since writing them doesn't invoke the callback
    // https://github.com/nodejs/node/issues/22066
    if (data.length === 0) {
      if (callback) {
        callback();
      }
      return;
    }
    // Only write when we don't exceed the maximum body length
    if (this._requestBodyLength + data.length <= this._options.maxBodyLength) {
      this._requestBodyLength += data.length;
      this._requestBodyBuffers.push({ data: data, encoding: encoding });
      this._currentRequest.write(data, encoding, callback);
    }
    // Error when we exceed the maximum body length
    else {
      this.emit("error", new MaxBodyLengthExceededError());
      this.abort();
    }
  };

  // Ends the current native request
  RedirectableRequest.prototype.end = function (data, encoding, callback) {
    // Shift parameters if necessary
    if (typeof data === "function") {
      callback = data;
      data = encoding = null;
    }
    else if (typeof encoding === "function") {
      callback = encoding;
      encoding = null;
    }

    // Write data if needed and end
    if (!data) {
      this._ended = this._ending = true;
      this._currentRequest.end(null, null, callback);
    }
    else {
      var self = this;
      var currentRequest = this._currentRequest;
      this.write(data, encoding, function () {
        self._ended = true;
        currentRequest.end(null, null, callback);
      });
      this._ending = true;
    }
  };

  // Sets a header value on the current native request
  RedirectableRequest.prototype.setHeader = function (name, value) {
    this._options.headers[name] = value;
    this._currentRequest.setHeader(name, value);
  };

  // Clears a header value on the current native request
  RedirectableRequest.prototype.removeHeader = function (name) {
    delete this._options.headers[name];
    this._currentRequest.removeHeader(name);
  };

  // Global timeout for all underlying requests
  RedirectableRequest.prototype.setTimeout = function (msecs, callback) {
    var self = this;

    // Destroys the socket on timeout
    function destroyOnTimeout(socket) {
      socket.setTimeout(msecs);
      socket.removeListener("timeout", socket.destroy);
      socket.addListener("timeout", socket.destroy);
    }

    // Sets up a timer to trigger a timeout event
    function startTimer(socket) {
      if (self._timeout) {
        clearTimeout(self._timeout);
      }
      self._timeout = setTimeout(function () {
        self.emit("timeout");
        clearTimer();
      }, msecs);
      destroyOnTimeout(socket);
    }

    // Stops a timeout from triggering
    function clearTimer() {
      // Clear the timeout
      if (self._timeout) {
        clearTimeout(self._timeout);
        self._timeout = null;
      }

      // Clean up all attached listeners
      self.removeListener("abort", clearTimer);
      self.removeListener("error", clearTimer);
      self.removeListener("response", clearTimer);
      if (callback) {
        self.removeListener("timeout", callback);
      }
      if (!self.socket) {
        self._currentRequest.removeListener("socket", startTimer);
      }
    }

    // Attach callback if passed
    if (callback) {
      this.on("timeout", callback);
    }

    // Start the timer if or when the socket is opened
    if (this.socket) {
      startTimer(this.socket);
    }
    else {
      this._currentRequest.once("socket", startTimer);
    }

    // Clean up on events
    this.on("socket", destroyOnTimeout);
    this.on("abort", clearTimer);
    this.on("error", clearTimer);
    this.on("response", clearTimer);

    return this;
  };

  // Proxy all other public ClientRequest methods
  [
    "flushHeaders", "getHeader",
    "setNoDelay", "setSocketKeepAlive",
  ].forEach(function (method) {
    RedirectableRequest.prototype[method] = function (a, b) {
      return this._currentRequest[method](a, b);
    };
  });

  // Proxy all public ClientRequest properties
  ["aborted", "connection", "socket"].forEach(function (property) {
    Object.defineProperty(RedirectableRequest.prototype, property, {
      get: function () { return this._currentRequest[property]; },
    });
  });

  RedirectableRequest.prototype._sanitizeOptions = function (options) {
    // Ensure headers are always present
    if (!options.headers) {
      options.headers = {};
    }

    // Since http.request treats host as an alias of hostname,
    // but the url module interprets host as hostname plus port,
    // eliminate the host property to avoid confusion.
    if (options.host) {
      // Use hostname if set, because it has precedence
      if (!options.hostname) {
        options.hostname = options.host;
      }
      delete options.host;
    }

    // Complete the URL object when necessary
    if (!options.pathname && options.path) {
      var searchPos = options.path.indexOf("?");
      if (searchPos < 0) {
        options.pathname = options.path;
      }
      else {
        options.pathname = options.path.substring(0, searchPos);
        options.search = options.path.substring(searchPos);
      }
    }
  };


  // Executes the next native request (initial or redirect)
  RedirectableRequest.prototype._performRequest = function () {
    // Load the native protocol
    var protocol = this._options.protocol;
    var nativeProtocol = this._options.nativeProtocols[protocol];
    if (!nativeProtocol) {
      this.emit("error", new TypeError("Unsupported protocol " + protocol));
      return;
    }

    // If specified, use the agent corresponding to the protocol
    // (HTTP and HTTPS use different types of agents)
    if (this._options.agents) {
      var scheme = protocol.substr(0, protocol.length - 1);
      this._options.agent = this._options.agents[scheme];
    }

    // Create the native request
    var request = this._currentRequest =
          nativeProtocol.request(this._options, this._onNativeResponse);
    this._currentUrl = url.format(this._options);

    // Set up event handlers
    request._redirectable = this;
    for (var e = 0; e < events$1.length; e++) {
      request.on(events$1[e], eventHandlers[events$1[e]]);
    }

    // End a redirected request
    // (The first request must be ended explicitly with RedirectableRequest#end)
    if (this._isRedirect) {
      // Write the request entity and end.
      var i = 0;
      var self = this;
      var buffers = this._requestBodyBuffers;
      (function writeNext(error) {
        // Only write if this request has not been redirected yet
        /* istanbul ignore else */
        if (request === self._currentRequest) {
          // Report any write errors
          /* istanbul ignore if */
          if (error) {
            self.emit("error", error);
          }
          // Write the next buffer if there are still left
          else if (i < buffers.length) {
            var buffer = buffers[i++];
            /* istanbul ignore else */
            if (!request.finished) {
              request.write(buffer.data, buffer.encoding, writeNext);
            }
          }
          // End the request if `end` has been called on us
          else if (self._ended) {
            request.end();
          }
        }
      }());
    }
  };

  // Processes a response from the current native request
  RedirectableRequest.prototype._processResponse = function (response) {
    // Store the redirected response
    var statusCode = response.statusCode;
    if (this._options.trackRedirects) {
      this._redirects.push({
        url: this._currentUrl,
        headers: response.headers,
        statusCode: statusCode,
      });
    }

    // RFC7231§6.4: The 3xx (Redirection) class of status code indicates
    // that further action needs to be taken by the user agent in order to
    // fulfill the request. If a Location header field is provided,
    // the user agent MAY automatically redirect its request to the URI
    // referenced by the Location field value,
    // even if the specific status code is not understood.

    // If the response is not a redirect; return it as-is
    var location = response.headers.location;
    if (!location || this._options.followRedirects === false ||
        statusCode < 300 || statusCode >= 400) {
      response.responseUrl = this._currentUrl;
      response.redirects = this._redirects;
      this.emit("response", response);

      // Clean up
      this._requestBodyBuffers = [];
      return;
    }

    // The response is a redirect, so abort the current request
    abortRequest(this._currentRequest);
    // Discard the remainder of the response to avoid waiting for data
    response.destroy();

    // RFC7231§6.4: A client SHOULD detect and intervene
    // in cyclical redirections (i.e., "infinite" redirection loops).
    if (++this._redirectCount > this._options.maxRedirects) {
      this.emit("error", new TooManyRedirectsError());
      return;
    }

    // RFC7231§6.4: Automatic redirection needs to done with
    // care for methods not known to be safe, […]
    // RFC7231§6.4.2–3: For historical reasons, a user agent MAY change
    // the request method from POST to GET for the subsequent request.
    if ((statusCode === 301 || statusCode === 302) && this._options.method === "POST" ||
        // RFC7231§6.4.4: The 303 (See Other) status code indicates that
        // the server is redirecting the user agent to a different resource […]
        // A user agent can perform a retrieval request targeting that URI
        // (a GET or HEAD request if using HTTP) […]
        (statusCode === 303) && !/^(?:GET|HEAD)$/.test(this._options.method)) {
      this._options.method = "GET";
      // Drop a possible entity and headers related to it
      this._requestBodyBuffers = [];
      removeMatchingHeaders(/^content-/i, this._options.headers);
    }

    // Drop the Host header, as the redirect might lead to a different host
    var currentHostHeader = removeMatchingHeaders(/^host$/i, this._options.headers);

    // If the redirect is relative, carry over the host of the last request
    var currentUrlParts = url.parse(this._currentUrl);
    var currentHost = currentHostHeader || currentUrlParts.host;
    var currentUrl = /^\w+:/.test(location) ? this._currentUrl :
      url.format(Object.assign(currentUrlParts, { host: currentHost }));

    // Determine the URL of the redirection
    var redirectUrl;
    try {
      redirectUrl = url.resolve(currentUrl, location);
    }
    catch (cause) {
      this.emit("error", new RedirectionError(cause));
      return;
    }

    // Create the redirected request
    debug_1("redirecting to", redirectUrl);
    this._isRedirect = true;
    var redirectUrlParts = url.parse(redirectUrl);
    Object.assign(this._options, redirectUrlParts);

    // Drop confidential headers when redirecting to a less secure protocol
    // or to a different domain that is not a superdomain
    if (redirectUrlParts.protocol !== currentUrlParts.protocol &&
       redirectUrlParts.protocol !== "https:" ||
       redirectUrlParts.host !== currentHost &&
       !isSubdomain(redirectUrlParts.host, currentHost)) {
      removeMatchingHeaders(/^(?:authorization|cookie)$/i, this._options.headers);
    }

    // Evaluate the beforeRedirect callback
    if (typeof this._options.beforeRedirect === "function") {
      var responseDetails = { headers: response.headers };
      try {
        this._options.beforeRedirect.call(null, this._options, responseDetails);
      }
      catch (err) {
        this.emit("error", err);
        return;
      }
      this._sanitizeOptions(this._options);
    }

    // Perform the redirected request
    try {
      this._performRequest();
    }
    catch (cause) {
      this.emit("error", new RedirectionError(cause));
    }
  };

  // Wraps the key/value object of protocols with redirect functionality
  function wrap(protocols) {
    // Default settings
    var exports = {
      maxRedirects: 21,
      maxBodyLength: 10 * 1024 * 1024,
    };

    // Wrap each protocol
    var nativeProtocols = {};
    Object.keys(protocols).forEach(function (scheme) {
      var protocol = scheme + ":";
      var nativeProtocol = nativeProtocols[protocol] = protocols[scheme];
      var wrappedProtocol = exports[scheme] = Object.create(nativeProtocol);

      // Executes a request, following redirects
      function request(input, options, callback) {
        // Parse parameters
        if (typeof input === "string") {
          var urlStr = input;
          try {
            input = urlToOptions(new URL$1(urlStr));
          }
          catch (err) {
            /* istanbul ignore next */
            input = url.parse(urlStr);
          }
        }
        else if (URL$1 && (input instanceof URL$1)) {
          input = urlToOptions(input);
        }
        else {
          callback = options;
          options = input;
          input = { protocol: protocol };
        }
        if (typeof options === "function") {
          callback = options;
          options = null;
        }

        // Set defaults
        options = Object.assign({
          maxRedirects: exports.maxRedirects,
          maxBodyLength: exports.maxBodyLength,
        }, input, options);
        options.nativeProtocols = nativeProtocols;

        assert$1.equal(options.protocol, protocol, "protocol mismatch");
        debug_1("options", options);
        return new RedirectableRequest(options, callback);
      }

      // Executes a GET request, following redirects
      function get(input, options, callback) {
        var wrappedRequest = wrappedProtocol.request(input, options, callback);
        wrappedRequest.end();
        return wrappedRequest;
      }

      // Expose the properties on the wrapped protocol
      Object.defineProperties(wrappedProtocol, {
        request: { value: request, configurable: true, enumerable: true, writable: true },
        get: { value: get, configurable: true, enumerable: true, writable: true },
      });
    });
    return exports;
  }

  /* istanbul ignore next */
  function noop$3() { /* empty */ }

  // from https://github.com/nodejs/node/blob/master/lib/internal/url.js
  function urlToOptions(urlObject) {
    var options = {
      protocol: urlObject.protocol,
      hostname: urlObject.hostname.startsWith("[") ?
        /* istanbul ignore next */
        urlObject.hostname.slice(1, -1) :
        urlObject.hostname,
      hash: urlObject.hash,
      search: urlObject.search,
      pathname: urlObject.pathname,
      path: urlObject.pathname + urlObject.search,
      href: urlObject.href,
    };
    if (urlObject.port !== "") {
      options.port = Number(urlObject.port);
    }
    return options;
  }

  function removeMatchingHeaders(regex, headers) {
    var lastValue;
    for (var header in headers) {
      if (regex.test(header)) {
        lastValue = headers[header];
        delete headers[header];
      }
    }
    return (lastValue === null || typeof lastValue === "undefined") ?
      undefined : String(lastValue).trim();
  }

  function createErrorType(code, defaultMessage) {
    function CustomError(cause) {
      Error.captureStackTrace(this, this.constructor);
      if (!cause) {
        this.message = defaultMessage;
      }
      else {
        this.message = defaultMessage + ": " + cause.message;
        this.cause = cause;
      }
    }
    CustomError.prototype = new Error();
    CustomError.prototype.constructor = CustomError;
    CustomError.prototype.name = "Error [" + code + "]";
    CustomError.prototype.code = code;
    return CustomError;
  }

  function abortRequest(request) {
    for (var e = 0; e < events$1.length; e++) {
      request.removeListener(events$1[e], eventHandlers[events$1[e]]);
    }
    request.on("error", noop$3);
    request.abort();
  }

  function isSubdomain(subdomain, domain) {
    const dot = subdomain.length - domain.length - 1;
    return dot > 0 && subdomain[dot] === "." && subdomain.endsWith(domain);
  }

  // Exports
  var followRedirects = wrap({ http: http, https: https });
  var wrap_1 = wrap;
  followRedirects.wrap = wrap_1;

  var data = {
    "version": "0.26.1"
  };

  var httpFollow = followRedirects.http;
  var httpsFollow = followRedirects.https;


  var VERSION = data.version;





  var isHttps = /https:?/;

  /**
   *
   * @param {http.ClientRequestArgs} options
   * @param {AxiosProxyConfig} proxy
   * @param {string} location
   */
  function setProxy(options, proxy, location) {
    options.hostname = proxy.host;
    options.host = proxy.host;
    options.port = proxy.port;
    options.path = location;

    // Basic proxy authorization
    if (proxy.auth) {
      var base64 = Buffer.from(proxy.auth.username + ':' + proxy.auth.password, 'utf8').toString('base64');
      options.headers['Proxy-Authorization'] = 'Basic ' + base64;
    }

    // If a proxy is used, any redirects must also pass through the proxy
    options.beforeRedirect = function beforeRedirect(redirection) {
      redirection.headers.host = redirection.host;
      setProxy(redirection, proxy, redirection.href);
    };
  }

  /*eslint consistent-return:0*/
  var http_1 = function httpAdapter(config) {
    return new Promise(function dispatchHttpRequest(resolvePromise, rejectPromise) {
      var onCanceled;
      function done() {
        if (config.cancelToken) {
          config.cancelToken.unsubscribe(onCanceled);
        }

        if (config.signal) {
          config.signal.removeEventListener('abort', onCanceled);
        }
      }
      var resolve = function resolve(value) {
        done();
        resolvePromise(value);
      };
      var rejected = false;
      var reject = function reject(value) {
        done();
        rejected = true;
        rejectPromise(value);
      };
      var data = config.data;
      var headers = config.headers;
      var headerNames = {};

      Object.keys(headers).forEach(function storeLowerName(name) {
        headerNames[name.toLowerCase()] = name;
      });

      // Set User-Agent (required by some servers)
      // See https://github.com/axios/axios/issues/69
      if ('user-agent' in headerNames) {
        // User-Agent is specified; handle case where no UA header is desired
        if (!headers[headerNames['user-agent']]) {
          delete headers[headerNames['user-agent']];
        }
        // Otherwise, use specified value
      } else {
        // Only set header if it hasn't been set in config
        headers['User-Agent'] = 'axios/' + VERSION;
      }

      if (data && !utils.isStream(data)) {
        if (Buffer.isBuffer(data)) ; else if (utils.isArrayBuffer(data)) {
          data = Buffer.from(new Uint8Array(data));
        } else if (utils.isString(data)) {
          data = Buffer.from(data, 'utf-8');
        } else {
          return reject(createError(
            'Data after transformation must be a string, an ArrayBuffer, a Buffer, or a Stream',
            config
          ));
        }

        if (config.maxBodyLength > -1 && data.length > config.maxBodyLength) {
          return reject(createError('Request body larger than maxBodyLength limit', config));
        }

        // Add Content-Length header if data exists
        if (!headerNames['content-length']) {
          headers['Content-Length'] = data.length;
        }
      }

      // HTTP basic authentication
      var auth = undefined;
      if (config.auth) {
        var username = config.auth.username || '';
        var password = config.auth.password || '';
        auth = username + ':' + password;
      }

      // Parse url
      var fullPath = buildFullPath(config.baseURL, config.url);
      var parsed = url.parse(fullPath);
      var protocol = parsed.protocol || 'http:';

      if (!auth && parsed.auth) {
        var urlAuth = parsed.auth.split(':');
        var urlUsername = urlAuth[0] || '';
        var urlPassword = urlAuth[1] || '';
        auth = urlUsername + ':' + urlPassword;
      }

      if (auth && headerNames.authorization) {
        delete headers[headerNames.authorization];
      }

      var isHttpsRequest = isHttps.test(protocol);
      var agent = isHttpsRequest ? config.httpsAgent : config.httpAgent;

      try {
        buildURL(parsed.path, config.params, config.paramsSerializer).replace(/^\?/, '');
      } catch (err) {
        var customErr = new Error(err.message);
        customErr.config = config;
        customErr.url = config.url;
        customErr.exists = true;
        reject(customErr);
      }

      var options = {
        path: buildURL(parsed.path, config.params, config.paramsSerializer).replace(/^\?/, ''),
        method: config.method.toUpperCase(),
        headers: headers,
        agent: agent,
        agents: { http: config.httpAgent, https: config.httpsAgent },
        auth: auth
      };

      if (config.socketPath) {
        options.socketPath = config.socketPath;
      } else {
        options.hostname = parsed.hostname;
        options.port = parsed.port;
      }

      var proxy = config.proxy;
      if (!proxy && proxy !== false) {
        var proxyEnv = protocol.slice(0, -1) + '_proxy';
        var proxyUrl = process.env[proxyEnv] || process.env[proxyEnv.toUpperCase()];
        if (proxyUrl) {
          var parsedProxyUrl = url.parse(proxyUrl);
          var noProxyEnv = process.env.no_proxy || process.env.NO_PROXY;
          var shouldProxy = true;

          if (noProxyEnv) {
            var noProxy = noProxyEnv.split(',').map(function trim(s) {
              return s.trim();
            });

            shouldProxy = !noProxy.some(function proxyMatch(proxyElement) {
              if (!proxyElement) {
                return false;
              }
              if (proxyElement === '*') {
                return true;
              }
              if (proxyElement[0] === '.' &&
                  parsed.hostname.substr(parsed.hostname.length - proxyElement.length) === proxyElement) {
                return true;
              }

              return parsed.hostname === proxyElement;
            });
          }

          if (shouldProxy) {
            proxy = {
              host: parsedProxyUrl.hostname,
              port: parsedProxyUrl.port,
              protocol: parsedProxyUrl.protocol
            };

            if (parsedProxyUrl.auth) {
              var proxyUrlAuth = parsedProxyUrl.auth.split(':');
              proxy.auth = {
                username: proxyUrlAuth[0],
                password: proxyUrlAuth[1]
              };
            }
          }
        }
      }

      if (proxy) {
        options.headers.host = parsed.hostname + (parsed.port ? ':' + parsed.port : '');
        setProxy(options, proxy, protocol + '//' + parsed.hostname + (parsed.port ? ':' + parsed.port : '') + options.path);
      }

      var transport;
      var isHttpsProxy = isHttpsRequest && (proxy ? isHttps.test(proxy.protocol) : true);
      if (config.transport) {
        transport = config.transport;
      } else if (config.maxRedirects === 0) {
        transport = isHttpsProxy ? https : http;
      } else {
        if (config.maxRedirects) {
          options.maxRedirects = config.maxRedirects;
        }
        transport = isHttpsProxy ? httpsFollow : httpFollow;
      }

      if (config.maxBodyLength > -1) {
        options.maxBodyLength = config.maxBodyLength;
      }

      if (config.insecureHTTPParser) {
        options.insecureHTTPParser = config.insecureHTTPParser;
      }

      // Create the request
      var req = transport.request(options, function handleResponse(res) {
        if (req.aborted) return;

        // uncompress the response body transparently if required
        var stream = res;

        // return the last request in case of redirects
        var lastRequest = res.req || req;


        // if no content, is HEAD request or decompress disabled we should not decompress
        if (res.statusCode !== 204 && lastRequest.method !== 'HEAD' && config.decompress !== false) {
          switch (res.headers['content-encoding']) {
          /*eslint default-case:0*/
          case 'gzip':
          case 'compress':
          case 'deflate':
          // add the unzipper to the body stream processing pipeline
            stream = stream.pipe(zlib.createUnzip());

            // remove the content-encoding in order to not confuse downstream operations
            delete res.headers['content-encoding'];
            break;
          }
        }

        var response = {
          status: res.statusCode,
          statusText: res.statusMessage,
          headers: res.headers,
          config: config,
          request: lastRequest
        };

        if (config.responseType === 'stream') {
          response.data = stream;
          settle(resolve, reject, response);
        } else {
          var responseBuffer = [];
          var totalResponseBytes = 0;
          stream.on('data', function handleStreamData(chunk) {
            responseBuffer.push(chunk);
            totalResponseBytes += chunk.length;

            // make sure the content length is not over the maxContentLength if specified
            if (config.maxContentLength > -1 && totalResponseBytes > config.maxContentLength) {
              // stream.destoy() emit aborted event before calling reject() on Node.js v16
              rejected = true;
              stream.destroy();
              reject(createError('maxContentLength size of ' + config.maxContentLength + ' exceeded',
                config, null, lastRequest));
            }
          });

          stream.on('aborted', function handlerStreamAborted() {
            if (rejected) {
              return;
            }
            stream.destroy();
            reject(createError('error request aborted', config, 'ERR_REQUEST_ABORTED', lastRequest));
          });

          stream.on('error', function handleStreamError(err) {
            if (req.aborted) return;
            reject(enhanceError(err, config, null, lastRequest));
          });

          stream.on('end', function handleStreamEnd() {
            try {
              var responseData = responseBuffer.length === 1 ? responseBuffer[0] : Buffer.concat(responseBuffer);
              if (config.responseType !== 'arraybuffer') {
                responseData = responseData.toString(config.responseEncoding);
                if (!config.responseEncoding || config.responseEncoding === 'utf8') {
                  responseData = utils.stripBOM(responseData);
                }
              }
              response.data = responseData;
            } catch (err) {
              reject(enhanceError(err, config, err.code, response.request, response));
            }
            settle(resolve, reject, response);
          });
        }
      });

      // Handle errors
      req.on('error', function handleRequestError(err) {
        if (req.aborted && err.code !== 'ERR_FR_TOO_MANY_REDIRECTS') return;
        reject(enhanceError(err, config, null, req));
      });

      // set tcp keep alive to prevent drop connection by peer
      req.on('socket', function handleRequestSocket(socket) {
        // default interval of sending ack packet is 1 minute
        socket.setKeepAlive(true, 1000 * 60);
      });

      // Handle request timeout
      if (config.timeout) {
        // This is forcing a int timeout to avoid problems if the `req` interface doesn't handle other types.
        var timeout = parseInt(config.timeout, 10);

        if (isNaN(timeout)) {
          reject(createError(
            'error trying to parse `config.timeout` to int',
            config,
            'ERR_PARSE_TIMEOUT',
            req
          ));

          return;
        }

        // Sometime, the response will be very slow, and does not respond, the connect event will be block by event loop system.
        // And timer callback will be fired, and abort() will be invoked before connection, then get "socket hang up" and code ECONNRESET.
        // At this time, if we have a large number of request, nodejs will hang up some socket on background. and the number will up and up.
        // And then these socket which be hang up will devoring CPU little by little.
        // ClientRequest.setTimeout will be fired on the specify milliseconds, and can make sure that abort() will be fired after connect.
        req.setTimeout(timeout, function handleRequestTimeout() {
          req.abort();
          var timeoutErrorMessage = '';
          if (config.timeoutErrorMessage) {
            timeoutErrorMessage = config.timeoutErrorMessage;
          } else {
            timeoutErrorMessage = 'timeout of ' + config.timeout + 'ms exceeded';
          }
          var transitional$1 = config.transitional || transitional;
          reject(createError(
            timeoutErrorMessage,
            config,
            transitional$1.clarifyTimeoutError ? 'ETIMEDOUT' : 'ECONNABORTED',
            req
          ));
        });
      }

      if (config.cancelToken || config.signal) {
        // Handle cancellation
        // eslint-disable-next-line func-names
        onCanceled = function(cancel) {
          if (req.aborted) return;

          req.abort();
          reject(!cancel || (cancel && cancel.type) ? new Cancel_1('canceled') : cancel);
        };

        config.cancelToken && config.cancelToken.subscribe(onCanceled);
        if (config.signal) {
          config.signal.aborted ? onCanceled() : config.signal.addEventListener('abort', onCanceled);
        }
      }


      // Send the request
      if (utils.isStream(data)) {
        data.on('error', function handleStreamError(err) {
          reject(enhanceError(err, config, null, req));
        }).pipe(req);
      } else {
        req.end(data);
      }
    });
  };

  var DEFAULT_CONTENT_TYPE = {
    'Content-Type': 'application/x-www-form-urlencoded'
  };

  function setContentTypeIfUnset(headers, value) {
    if (!utils.isUndefined(headers) && utils.isUndefined(headers['Content-Type'])) {
      headers['Content-Type'] = value;
    }
  }

  function getDefaultAdapter() {
    var adapter;
    if (typeof XMLHttpRequest !== 'undefined') {
      // For browsers use XHR adapter
      adapter = xhr;
    } else if (typeof process !== 'undefined' && Object.prototype.toString.call(process) === '[object process]') {
      // For node use HTTP adapter
      adapter = http_1;
    }
    return adapter;
  }

  function stringifySafely(rawValue, parser, encoder) {
    if (utils.isString(rawValue)) {
      try {
        (parser || JSON.parse)(rawValue);
        return utils.trim(rawValue);
      } catch (e) {
        if (e.name !== 'SyntaxError') {
          throw e;
        }
      }
    }

    return (encoder || JSON.stringify)(rawValue);
  }

  var defaults = {

    transitional: transitional,

    adapter: getDefaultAdapter(),

    transformRequest: [function transformRequest(data, headers) {
      normalizeHeaderName(headers, 'Accept');
      normalizeHeaderName(headers, 'Content-Type');

      if (utils.isFormData(data) ||
        utils.isArrayBuffer(data) ||
        utils.isBuffer(data) ||
        utils.isStream(data) ||
        utils.isFile(data) ||
        utils.isBlob(data)
      ) {
        return data;
      }
      if (utils.isArrayBufferView(data)) {
        return data.buffer;
      }
      if (utils.isURLSearchParams(data)) {
        setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
        return data.toString();
      }
      if (utils.isObject(data) || (headers && headers['Content-Type'] === 'application/json')) {
        setContentTypeIfUnset(headers, 'application/json');
        return stringifySafely(data);
      }
      return data;
    }],

    transformResponse: [function transformResponse(data) {
      var transitional = this.transitional || defaults.transitional;
      var silentJSONParsing = transitional && transitional.silentJSONParsing;
      var forcedJSONParsing = transitional && transitional.forcedJSONParsing;
      var strictJSONParsing = !silentJSONParsing && this.responseType === 'json';

      if (strictJSONParsing || (forcedJSONParsing && utils.isString(data) && data.length)) {
        try {
          return JSON.parse(data);
        } catch (e) {
          if (strictJSONParsing) {
            if (e.name === 'SyntaxError') {
              throw enhanceError(e, this, 'E_JSON_PARSE');
            }
            throw e;
          }
        }
      }

      return data;
    }],

    /**
     * A timeout in milliseconds to abort a request. If set to 0 (default) a
     * timeout is not created.
     */
    timeout: 0,

    xsrfCookieName: 'XSRF-TOKEN',
    xsrfHeaderName: 'X-XSRF-TOKEN',

    maxContentLength: -1,
    maxBodyLength: -1,

    validateStatus: function validateStatus(status) {
      return status >= 200 && status < 300;
    },

    headers: {
      common: {
        'Accept': 'application/json, text/plain, */*'
      }
    }
  };

  utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
    defaults.headers[method] = {};
  });

  utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
    defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
  });

  var defaults_1 = defaults;

  /**
   * Transform the data for a request or a response
   *
   * @param {Object|String} data The data to be transformed
   * @param {Array} headers The headers for the request or response
   * @param {Array|Function} fns A single function or Array of functions
   * @returns {*} The resulting transformed data
   */
  var transformData = function transformData(data, headers, fns) {
    var context = this || defaults_1;
    /*eslint no-param-reassign:0*/
    utils.forEach(fns, function transform(fn) {
      data = fn.call(context, data, headers);
    });

    return data;
  };

  var isCancel = function isCancel(value) {
    return !!(value && value.__CANCEL__);
  };

  /**
   * Throws a `Cancel` if cancellation has been requested.
   */
  function throwIfCancellationRequested(config) {
    if (config.cancelToken) {
      config.cancelToken.throwIfRequested();
    }

    if (config.signal && config.signal.aborted) {
      throw new Cancel_1('canceled');
    }
  }

  /**
   * Dispatch a request to the server using the configured adapter.
   *
   * @param {object} config The config that is to be used for the request
   * @returns {Promise} The Promise to be fulfilled
   */
  var dispatchRequest = function dispatchRequest(config) {
    throwIfCancellationRequested(config);

    // Ensure headers exist
    config.headers = config.headers || {};

    // Transform request data
    config.data = transformData.call(
      config,
      config.data,
      config.headers,
      config.transformRequest
    );

    // Flatten headers
    config.headers = utils.merge(
      config.headers.common || {},
      config.headers[config.method] || {},
      config.headers
    );

    utils.forEach(
      ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
      function cleanHeaderConfig(method) {
        delete config.headers[method];
      }
    );

    var adapter = config.adapter || defaults_1.adapter;

    return adapter(config).then(function onAdapterResolution(response) {
      throwIfCancellationRequested(config);

      // Transform response data
      response.data = transformData.call(
        config,
        response.data,
        response.headers,
        config.transformResponse
      );

      return response;
    }, function onAdapterRejection(reason) {
      if (!isCancel(reason)) {
        throwIfCancellationRequested(config);

        // Transform response data
        if (reason && reason.response) {
          reason.response.data = transformData.call(
            config,
            reason.response.data,
            reason.response.headers,
            config.transformResponse
          );
        }
      }

      return Promise.reject(reason);
    });
  };

  /**
   * Config-specific merge-function which creates a new config-object
   * by merging two configuration objects together.
   *
   * @param {Object} config1
   * @param {Object} config2
   * @returns {Object} New object resulting from merging config2 to config1
   */
  var mergeConfig = function mergeConfig(config1, config2) {
    // eslint-disable-next-line no-param-reassign
    config2 = config2 || {};
    var config = {};

    function getMergedValue(target, source) {
      if (utils.isPlainObject(target) && utils.isPlainObject(source)) {
        return utils.merge(target, source);
      } else if (utils.isPlainObject(source)) {
        return utils.merge({}, source);
      } else if (utils.isArray(source)) {
        return source.slice();
      }
      return source;
    }

    // eslint-disable-next-line consistent-return
    function mergeDeepProperties(prop) {
      if (!utils.isUndefined(config2[prop])) {
        return getMergedValue(config1[prop], config2[prop]);
      } else if (!utils.isUndefined(config1[prop])) {
        return getMergedValue(undefined, config1[prop]);
      }
    }

    // eslint-disable-next-line consistent-return
    function valueFromConfig2(prop) {
      if (!utils.isUndefined(config2[prop])) {
        return getMergedValue(undefined, config2[prop]);
      }
    }

    // eslint-disable-next-line consistent-return
    function defaultToConfig2(prop) {
      if (!utils.isUndefined(config2[prop])) {
        return getMergedValue(undefined, config2[prop]);
      } else if (!utils.isUndefined(config1[prop])) {
        return getMergedValue(undefined, config1[prop]);
      }
    }

    // eslint-disable-next-line consistent-return
    function mergeDirectKeys(prop) {
      if (prop in config2) {
        return getMergedValue(config1[prop], config2[prop]);
      } else if (prop in config1) {
        return getMergedValue(undefined, config1[prop]);
      }
    }

    var mergeMap = {
      'url': valueFromConfig2,
      'method': valueFromConfig2,
      'data': valueFromConfig2,
      'baseURL': defaultToConfig2,
      'transformRequest': defaultToConfig2,
      'transformResponse': defaultToConfig2,
      'paramsSerializer': defaultToConfig2,
      'timeout': defaultToConfig2,
      'timeoutMessage': defaultToConfig2,
      'withCredentials': defaultToConfig2,
      'adapter': defaultToConfig2,
      'responseType': defaultToConfig2,
      'xsrfCookieName': defaultToConfig2,
      'xsrfHeaderName': defaultToConfig2,
      'onUploadProgress': defaultToConfig2,
      'onDownloadProgress': defaultToConfig2,
      'decompress': defaultToConfig2,
      'maxContentLength': defaultToConfig2,
      'maxBodyLength': defaultToConfig2,
      'transport': defaultToConfig2,
      'httpAgent': defaultToConfig2,
      'httpsAgent': defaultToConfig2,
      'cancelToken': defaultToConfig2,
      'socketPath': defaultToConfig2,
      'responseEncoding': defaultToConfig2,
      'validateStatus': mergeDirectKeys
    };

    utils.forEach(Object.keys(config1).concat(Object.keys(config2)), function computeConfigValue(prop) {
      var merge = mergeMap[prop] || mergeDeepProperties;
      var configValue = merge(prop);
      (utils.isUndefined(configValue) && merge !== mergeDirectKeys) || (config[prop] = configValue);
    });

    return config;
  };

  var VERSION$1 = data.version;

  var validators = {};

  // eslint-disable-next-line func-names
  ['object', 'boolean', 'number', 'function', 'string', 'symbol'].forEach(function(type, i) {
    validators[type] = function validator(thing) {
      return typeof thing === type || 'a' + (i < 1 ? 'n ' : ' ') + type;
    };
  });

  var deprecatedWarnings = {};

  /**
   * Transitional option validator
   * @param {function|boolean?} validator - set to false if the transitional option has been removed
   * @param {string?} version - deprecated version / removed since version
   * @param {string?} message - some message with additional info
   * @returns {function}
   */
  validators.transitional = function transitional(validator, version, message) {
    function formatMessage(opt, desc) {
      return '[Axios v' + VERSION$1 + '] Transitional option \'' + opt + '\'' + desc + (message ? '. ' + message : '');
    }

    // eslint-disable-next-line func-names
    return function(value, opt, opts) {
      if (validator === false) {
        throw new Error(formatMessage(opt, ' has been removed' + (version ? ' in ' + version : '')));
      }

      if (version && !deprecatedWarnings[opt]) {
        deprecatedWarnings[opt] = true;
        // eslint-disable-next-line no-console
        console.warn(
          formatMessage(
            opt,
            ' has been deprecated since v' + version + ' and will be removed in the near future'
          )
        );
      }

      return validator ? validator(value, opt, opts) : true;
    };
  };

  /**
   * Assert object's properties type
   * @param {object} options
   * @param {object} schema
   * @param {boolean?} allowUnknown
   */

  function assertOptions(options, schema, allowUnknown) {
    if (typeof options !== 'object') {
      throw new TypeError('options must be an object');
    }
    var keys = Object.keys(options);
    var i = keys.length;
    while (i-- > 0) {
      var opt = keys[i];
      var validator = schema[opt];
      if (validator) {
        var value = options[opt];
        var result = value === undefined || validator(value, opt, options);
        if (result !== true) {
          throw new TypeError('option ' + opt + ' must be ' + result);
        }
        continue;
      }
      if (allowUnknown !== true) {
        throw Error('Unknown option ' + opt);
      }
    }
  }

  var validator = {
    assertOptions: assertOptions,
    validators: validators
  };

  var validators$1 = validator.validators;
  /**
   * Create a new instance of Axios
   *
   * @param {Object} instanceConfig The default config for the instance
   */
  function Axios(instanceConfig) {
    this.defaults = instanceConfig;
    this.interceptors = {
      request: new InterceptorManager_1(),
      response: new InterceptorManager_1()
    };
  }

  /**
   * Dispatch a request
   *
   * @param {Object} config The config specific for this request (merged with this.defaults)
   */
  Axios.prototype.request = function request(configOrUrl, config) {
    /*eslint no-param-reassign:0*/
    // Allow for axios('example/url'[, config]) a la fetch API
    if (typeof configOrUrl === 'string') {
      config = config || {};
      config.url = configOrUrl;
    } else {
      config = configOrUrl || {};
    }

    config = mergeConfig(this.defaults, config);

    // Set config.method
    if (config.method) {
      config.method = config.method.toLowerCase();
    } else if (this.defaults.method) {
      config.method = this.defaults.method.toLowerCase();
    } else {
      config.method = 'get';
    }

    var transitional = config.transitional;

    if (transitional !== undefined) {
      validator.assertOptions(transitional, {
        silentJSONParsing: validators$1.transitional(validators$1.boolean),
        forcedJSONParsing: validators$1.transitional(validators$1.boolean),
        clarifyTimeoutError: validators$1.transitional(validators$1.boolean)
      }, false);
    }

    // filter out skipped interceptors
    var requestInterceptorChain = [];
    var synchronousRequestInterceptors = true;
    this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
      if (typeof interceptor.runWhen === 'function' && interceptor.runWhen(config) === false) {
        return;
      }

      synchronousRequestInterceptors = synchronousRequestInterceptors && interceptor.synchronous;

      requestInterceptorChain.unshift(interceptor.fulfilled, interceptor.rejected);
    });

    var responseInterceptorChain = [];
    this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
      responseInterceptorChain.push(interceptor.fulfilled, interceptor.rejected);
    });

    var promise;

    if (!synchronousRequestInterceptors) {
      var chain = [dispatchRequest, undefined];

      Array.prototype.unshift.apply(chain, requestInterceptorChain);
      chain = chain.concat(responseInterceptorChain);

      promise = Promise.resolve(config);
      while (chain.length) {
        promise = promise.then(chain.shift(), chain.shift());
      }

      return promise;
    }


    var newConfig = config;
    while (requestInterceptorChain.length) {
      var onFulfilled = requestInterceptorChain.shift();
      var onRejected = requestInterceptorChain.shift();
      try {
        newConfig = onFulfilled(newConfig);
      } catch (error) {
        onRejected(error);
        break;
      }
    }

    try {
      promise = dispatchRequest(newConfig);
    } catch (error) {
      return Promise.reject(error);
    }

    while (responseInterceptorChain.length) {
      promise = promise.then(responseInterceptorChain.shift(), responseInterceptorChain.shift());
    }

    return promise;
  };

  Axios.prototype.getUri = function getUri(config) {
    config = mergeConfig(this.defaults, config);
    return buildURL(config.url, config.params, config.paramsSerializer).replace(/^\?/, '');
  };

  // Provide aliases for supported request methods
  utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
    /*eslint func-names:0*/
    Axios.prototype[method] = function(url, config) {
      return this.request(mergeConfig(config || {}, {
        method: method,
        url: url,
        data: (config || {}).data
      }));
    };
  });

  utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
    /*eslint func-names:0*/
    Axios.prototype[method] = function(url, data, config) {
      return this.request(mergeConfig(config || {}, {
        method: method,
        url: url,
        data: data
      }));
    };
  });

  var Axios_1 = Axios;

  /**
   * A `CancelToken` is an object that can be used to request cancellation of an operation.
   *
   * @class
   * @param {Function} executor The executor function.
   */
  function CancelToken(executor) {
    if (typeof executor !== 'function') {
      throw new TypeError('executor must be a function.');
    }

    var resolvePromise;

    this.promise = new Promise(function promiseExecutor(resolve) {
      resolvePromise = resolve;
    });

    var token = this;

    // eslint-disable-next-line func-names
    this.promise.then(function(cancel) {
      if (!token._listeners) return;

      var i;
      var l = token._listeners.length;

      for (i = 0; i < l; i++) {
        token._listeners[i](cancel);
      }
      token._listeners = null;
    });

    // eslint-disable-next-line func-names
    this.promise.then = function(onfulfilled) {
      var _resolve;
      // eslint-disable-next-line func-names
      var promise = new Promise(function(resolve) {
        token.subscribe(resolve);
        _resolve = resolve;
      }).then(onfulfilled);

      promise.cancel = function reject() {
        token.unsubscribe(_resolve);
      };

      return promise;
    };

    executor(function cancel(message) {
      if (token.reason) {
        // Cancellation has already been requested
        return;
      }

      token.reason = new Cancel_1(message);
      resolvePromise(token.reason);
    });
  }

  /**
   * Throws a `Cancel` if cancellation has been requested.
   */
  CancelToken.prototype.throwIfRequested = function throwIfRequested() {
    if (this.reason) {
      throw this.reason;
    }
  };

  /**
   * Subscribe to the cancel signal
   */

  CancelToken.prototype.subscribe = function subscribe(listener) {
    if (this.reason) {
      listener(this.reason);
      return;
    }

    if (this._listeners) {
      this._listeners.push(listener);
    } else {
      this._listeners = [listener];
    }
  };

  /**
   * Unsubscribe from the cancel signal
   */

  CancelToken.prototype.unsubscribe = function unsubscribe(listener) {
    if (!this._listeners) {
      return;
    }
    var index = this._listeners.indexOf(listener);
    if (index !== -1) {
      this._listeners.splice(index, 1);
    }
  };

  /**
   * Returns an object that contains a new `CancelToken` and a function that, when called,
   * cancels the `CancelToken`.
   */
  CancelToken.source = function source() {
    var cancel;
    var token = new CancelToken(function executor(c) {
      cancel = c;
    });
    return {
      token: token,
      cancel: cancel
    };
  };

  var CancelToken_1 = CancelToken;

  /**
   * Syntactic sugar for invoking a function and expanding an array for arguments.
   *
   * Common use case would be to use `Function.prototype.apply`.
   *
   *  ```js
   *  function f(x, y, z) {}
   *  var args = [1, 2, 3];
   *  f.apply(null, args);
   *  ```
   *
   * With `spread` this example can be re-written.
   *
   *  ```js
   *  spread(function(x, y, z) {})([1, 2, 3]);
   *  ```
   *
   * @param {Function} callback
   * @returns {Function}
   */
  var spread = function spread(callback) {
    return function wrap(arr) {
      return callback.apply(null, arr);
    };
  };

  /**
   * Determines whether the payload is an error thrown by Axios
   *
   * @param {*} payload The value to test
   * @returns {boolean} True if the payload is an error thrown by Axios, otherwise false
   */
  var isAxiosError = function isAxiosError(payload) {
    return utils.isObject(payload) && (payload.isAxiosError === true);
  };

  /**
   * Create an instance of Axios
   *
   * @param {Object} defaultConfig The default config for the instance
   * @return {Axios} A new instance of Axios
   */
  function createInstance(defaultConfig) {
    var context = new Axios_1(defaultConfig);
    var instance = bind$1(Axios_1.prototype.request, context);

    // Copy axios.prototype to instance
    utils.extend(instance, Axios_1.prototype, context);

    // Copy context to instance
    utils.extend(instance, context);

    // Factory for creating new instances
    instance.create = function create(instanceConfig) {
      return createInstance(mergeConfig(defaultConfig, instanceConfig));
    };

    return instance;
  }

  // Create the default instance to be exported
  var axios = createInstance(defaults_1);

  // Expose Axios class to allow class inheritance
  axios.Axios = Axios_1;

  // Expose Cancel & CancelToken
  axios.Cancel = Cancel_1;
  axios.CancelToken = CancelToken_1;
  axios.isCancel = isCancel;
  axios.VERSION = data.version;

  // Expose all/spread
  axios.all = function all(promises) {
    return Promise.all(promises);
  };
  axios.spread = spread;

  // Expose isAxiosError
  axios.isAxiosError = isAxiosError;

  var axios_1 = axios;

  // Allow use of default import syntax in TypeScript
  var default_1 = axios;
  axios_1.default = default_1;

  var axios$1 = axios_1;

  const esPrivate$2 = Symbol("private");
  function Index(){
      Object.defineProperty(this,esPrivate$2,{
          configurable:true,
          value:{
              logo:logo,
              _instance:null
          }
      });
  }
  const methods$2 = {
      main:{
          m:3,
          d:3,
          value:function main(){
              const index = new Index();
              index.loadData();
              console.log(index[esPrivate$2].logo);
              var v = new MyView();
              v.skinClass=MySkin;
              index.instance.childElements=v.render();
              index.display();
          }
      }
  };
  const members$8 = {
      logo:{
          m:1,
          d:1,
          writable:true,
          value:logo
      },
      loadData:{
          m:3,
          d:3,
          value:async function loadData(){
              const res = await System.createHttpRequest(axios$1,{
                  url:"/account/create",
                  allowMethod:"post"
              });
              console.log(res);
          }
      },
      display:{
          m:3,
          d:3,
          value:function display(){
              this.instance.value="深圳";
              setTimeout(()=>{},1000);
          }
      },
      router:{
          m:3,
          d:4,
          enumerable:true,
          get:function router(){
              return new VueRouter({
                  routes:[{
                      path:"/index",
                      component:Person
                  },{
                      path:"/test",
                      component:PersonSkin
                  }]
              });
          }
      },
      _instance:{
          m:1,
          d:1,
          writable:true,
          value:null
      },
      instance:{
          m:3,
          d:4,
          enumerable:true,
          get:function instance(){
              if(this[esPrivate$2]._instance){
                  return this[esPrivate$2]._instance;
              }
              this[esPrivate$2]._instance=new Test({
                  router:this.router
              });
              return this[esPrivate$2]._instance;
          }
      },
      testRouterClass:{
          m:3,
          d:3,
          value:function testRouterClass(){
              it("should VueRouter eq Router ",()=>{
                  expect(VueRouter).toBe(VueRouter);
              });
          }
      },
      test8:{
          m:3,
          d:3,
          value:function test8(...args){}
      },
      testRouterView:{
          m:3,
          d:3,
          value:function testRouterView(){
              it('should router page view',()=>{
                  this.instance.name="标题名称";
                  setTimeout(()=>{
                      const vm = this.instance;
                      expect(vm.$el.textContent).toContain('标题名称');
                      expect(vm.$el.textContent).toContain('深圳');
                      expect(vm.$el.textContent).toContain('点击这里提示');
                      expect(vm.$el.textContent).toContain('测试页面');
                      expect(vm.$el.textContent).toContain('首页面');
                  },100);
              });
              it('should router page view',(done)=>{
                  const vm = this.instance;
                  vm.$router.push({
                      path:'index'
                  });
                  setTimeout(()=>{
                      expect(vm.$el.textContent).toContain('the is PersonSkin child');
                      expect(vm.$el.textContent).toContain('the scope value:onetwothreefourfive');
                      const el = vm.$el.querySelector('#person-root-child');
                      expect('Person page').toContain(el.textContent);
                      done();
                  },100);
              });
          }
      }
  };
  Class.creator(0,Index,{
      id:1,
      name:"Index",
      private:esPrivate$2,
      methods:methods$2,
      members:members$8
  });
  Index.main();

  return Index;

}(http, https, url, stream, assert$1, tty, util, os, zlib));
