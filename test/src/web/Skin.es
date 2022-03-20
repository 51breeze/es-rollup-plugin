package web;
import web.components.Component;
import web.View;

@SkinClass
class Skin<T extends Component > extends EventDispatcher{
    private var _hostComponent:T=null;
    private var _event:EventDispatcher  =null;
    public constructor(hostComponent:T){
        super();
        this._hostComponent = hostComponent;
    }

    get hostComponent():T{
        return this._hostComponent;
    }

    reactive<T>(name:string, value?:any):T{
        return this.hostComponent.reactive<T>(name,value);
    }

    forceUpdate(){
        return this.hostComponent.forceUpdate();
    }

    getElementByRefName(name){
        return this.hostComponent.getElementByRefName(name);
    }
    
    slot( name:string , scope?:boolean, called?:boolean, params?:object ){
        return this.hostComponent.slot(name,scope,called,params);
    }

    createElement(name:string|Component,data?:object,children?:Node[]){
        return this.hostComponent.createElement(name,data,children);
    }

    render(){
        return this.hostComponent.createElement('div');
    }
}