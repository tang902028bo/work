/**
 * Created by Administrator on 2019/8/22.
 */
Array.prototype.converTree = function (parent_id,id_name,parent_id_name){
    var origin_array = this;   //��ת��������
    id_name = id_name || 'id';
    parent_id_name = parent_id_name || 'parent_id';

    //Ĭ��Ϊ��С��parent_id
    var min_parent_id = Math.min.apply(null, $.map(origin_array,function(value){return value.parent_id}) );
    parent_id = parent_id || min_parent_id;

    //1.ɸѡ������ һ������
    var son_list_arr = $.grep(origin_array,function(val){if(val[parent_id_name]+""===parent_id+"") return true;});
    if(son_list_arr.length){
        var all_son_arr = [];
        $(son_list_arr).each(function(){
            if(this[id_name] === this[parent_id_name]) null;
            //2.�ݹ��ȡ ÿ��һ������ ����������     //��� parent_id ����ָ��,�ᵼ����ѭ��(����1��parent_id��2, 2��parent_id��1)
            var all_children_array = origin_array.converTree(this[id_name]);
            if(all_children_array) this['children'] =  all_children_array;  //������Ŵ��� children ����
            this['name'] = this['depart_name']; //��ǰ��Ҫʹ�� name �� value ,����ת����
            this['value'] = this['id'];
            all_son_arr.push(this);
        });
        return all_son_arr;
    }
};