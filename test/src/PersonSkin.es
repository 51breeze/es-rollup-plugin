<s:Component 
xmlns:s="web.components"
xmlns:cmd="@directives" 
xmlns:d="@directives" 
xmlns:slot="@slots" 
xmlns:te="@events::web.events.TransitionEvent"
xmlns:ui="web.ui"
>

   <script>

       address:string='address';

      get name():string{
        return this.reactive<string>('name');
      }

      set name(value:string){
         this.reactive('name',value);
      }

      get list():string[]{
          return ['one','two','three','four','five']
      }

      onChange(e){
          this.address = e.target.value +'---';
         
      }

       set value(val:string){
          
            this.reactive('value', val)
        }

        get value():string{
            return this.reactive<string>('value') || '9999';
        }

        beforeEnter(){
            console.log('=========PersonSkin=====enter')
        }

        isShow = true;

   </script>

   <style type='less'>
      .bg{
          background:url('./assets/logo.png');
      }
   </style>

   <style file="./assets/index.css" />

    <div cmd:if="name" class='bg'>1</div>
    <div cmd:elseif="!(name)">2</div>
    <div cmd:else>399999</div>
    
    <div cmd:each="item of ['china'].concat(list)">
        <div>{item}</div>
        <div class="ssss">
             <div>
                <span>
                    <slot:default />
                </span>
            </div>
        </div>
    </div>

    <div class="" ref='iss'>
       <div>item =====PersonSkin====  {name} =====</div>
    </div>

    <input bind:value={value} on:change={onChange} />

    <input value={this.value} />

    <slot:foot props={this.list}>
        <div>===============the is foot slot ==============</div>
    </slot:foot>

    <div d:show="this.isShow">the is property   {this.address}</div>

     <button on:click={this.isShow = !this.isShow}>
        Toggle
    </button>

    <web.animation.TransitionGroup name="fade" te:BEFORE_ENTER={this.beforeEnter}>
        <p d:if="this.isShow" key="1" >hello</p>
        <p d:if="this.isShow" key="2" >hello</p>
        <p d:if="this.isShow" key="3" >hello</p>
    </web.animation.TransitionGroup>


    <d:if condition="this.isShow">
       <div>the is a group condition</div>
       <div>the is a group condition</div>
       <div>the is a group condition</div>
       <div>the is a group condition</div>
       <div>the is a group condition</div>
       <div>the is a group condition</div>
    </d:if>
    <d:else>
        <div>the is a group elseif</div>
    </d:else>

    <d:each name={this.list} item='item' key='index'>
      <div>====each=={item}={index}</div>
      <div>===22=each=={item}=</div>
    </d:each>

    <d:for name={this.list} item='item' key='keyName' >
      <div>====for==={item},{keyName}</div>
      <div>===222=for==={item},{keyName}</div>
    </d:for>

    <d:show condition="this.isShow" >
      <div>====show==</div>
      <div>===222=show===</div>
    </d:show>



</s:Component>
