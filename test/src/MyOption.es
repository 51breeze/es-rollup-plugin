package{

    import web.components.Component;
    import PersonSkin;
    import web.ui.Option;

    class MyOption extends Component{

        @override
        render(){
            return this.createVNode( Option, this.getConfig(), this.slot('default') )
        }
    }
}