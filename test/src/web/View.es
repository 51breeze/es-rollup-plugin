package web;
import web.components.Component;
import web.Skin;
import web.components.Route;

class View<T extends Component> extends Component{

    enter(to: Route, from: Route){

    }

    leave(){

    }

    get skin(){

       // return new Skin<T>( this )
    
        return new this.skinClass(this);
    }

    private _skinClass:class< Skin<T> >;

    set skinClass(value:class< Skin<T> > ){
        this._skinClass = value;
    }

    get skinClass(){
        return this._skinClass;
    }

    @override
    render(){
        return this.skin.render();
    }
}
