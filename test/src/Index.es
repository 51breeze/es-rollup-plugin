package;

import PersonSkin;
import Test;
import web.components.Router;
import web.components.Viewport;
import Person;
import MyView;
import MySkin;
import web.components.Component;

@import(VueRouter='vue-router')



class Index{

    @Embed('./assets/logo.png');
    private var logo;

    @main
    static main(){

        // describe('router view', () => {
        //     const index = new Index();
        //     index.testRouterClass();
        //     index.testRouterView();
        // });

        const index = new Index();

        console.log( index.logo );

        var v = new MyView();
        v.skinClass = MySkin;

      //  new web.components.Router()
       


         index.instance.childElements = v.render() as Node;



         index.display();

      
    }

    display(){
        this.instance.value = "深圳"
        this.instance.mount('#app');

        setTimeout(()=>{
            const vm = this.instance as {$router:Router,$el:Node};
            //vm.$router.push({path:'index'});
        },1000);
    }

    get router(){
        return new Router({
                routes:[
                    {
                        path:"/index",
                        component:Person
                    },
                    {
                        path:"/test",
                        component:PersonSkin
                    }
                ]
        });
    }

    private var _instance:Test = null;

    get instance(){
        if( this._instance ){
            return this._instance;
        }

        this._instance = new Test({
            router:this.router
        });
        return this._instance;
    }

    testRouterClass(){
        it("should VueRouter eq Router ",()=>{
            expect( VueRouter ).toBe( Router );
        })
    }
    
    test8(...args:number[]){

    }

    testRouterView(){

       // const div = document.createElement('div');
        //document.body.appendChild( div )


        this.instance.mount();
        it('should router page view', () => {
            this.instance.name = "标题名称";
            setTimeout(()=>{
                const vm = this.instance as {$el:Node};
                expect( vm.$el.textContent ).toContain( '标题名称' );
                expect( vm.$el.textContent ).toContain( '深圳' );
                expect( vm.$el.textContent ).toContain( '点击这里提示' );
                expect( vm.$el.textContent ).toContain( '测试页面' );
                expect( vm.$el.textContent ).toContain( '首页面' );
            },100)
        })


        it('should router page view', (done) => {
            const vm = this.instance as {$router:Router,$el:ParentNode};
            vm.$router.push({path:'index'});
            setTimeout(()=>{
                expect( vm.$el.textContent ).toContain( 'the is PersonSkin child' );
                expect( vm.$el.textContent ).toContain( 'the scope value:onetwothreefourfive' );
                const el = vm.$el.querySelector('#person-root-child');
                expect( 'Person page' ).toContain( el.textContent );
                done();
                
            },100)
        })

    }
    

}