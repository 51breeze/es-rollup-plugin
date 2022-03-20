package;
import web.components.Component;
import web.Skin;
import web.View;
import web.components.Route;

class MyView extends View<MyView>{

    
    test(){

       var b:MyView = this.skin.hostComponent;

    }

    get name(){
        return '=========MyView of MySkin============='
    }

    get nameMyView():string{
        return 'name';
    }
    
}
