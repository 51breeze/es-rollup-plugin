package web;
import web.components.Route;
import web.components.Router;
import web.components.Component;

class Application extends EventDispatcher{

    set routes( value:Route[] ){

    }

    get routes():Route[]{
        return null;
    }

    get router():Router{
        return null;
    }

    set router(value:Router){

    }

    getInstance( options:{} ){
        return new Component(options);
    }

    mount( element:string | Node ){
        this.getInstance({})
    }

}
