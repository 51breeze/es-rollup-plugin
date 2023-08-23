package api.http;

import api.model.UserProduct;
import server.facade.Db;

class Product extends Base{

    @Get
    list(){
        let id = this.userinfo.userid;
        let category = this.request.param('category');
        return this.success(
            UserProduct.getList(id,category)
        );
    }

    @Get
    detail(id:number){
        if( id > 0 ){
            return this.success( UserProduct.detail( id ) );
        }else{
            return this.error('Missing id');
        }
    }

    @Get
    series(){
       const result = Db.table('support_category')
                    .where('type', '=', 1)
                    .where('status', '=', 1)
                    .where('pid','=','0')
                    .select().toArray();

        return this.success( result );
    }

    @Get
    models(pid:int){
        const result = Db.table('support_category')
                    .where('type', '=', 1)
                    .where('status', '=', 1)
                    .where('pid','=',pid)
                    .select().toArray();

        return this.success( result );
    }

    @Post
    edit(){
        const id = this.request.post('id');
        const data = this.request.post<any>([
            'category',
            'series',
            'model',
            'sn',
            'platform',
            'config',
            'order_number',
            'transaction_time',
            'status',
        ] as any);
        const userid = this.userinfo.userid;
        const product = new UserProduct();
        const result = product.edit(userid,id,data)
        if( result ){
            return this.success( result )
        }else{
            const error = product.errorMessage || 'Save failed.'
            return this.error(error);
        }

    }
}