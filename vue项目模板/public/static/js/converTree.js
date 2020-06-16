/**
 * Created by Administrator on 2019/8/22.
 */
Array.prototype.converTree = function (parent_id,id_name,parent_id_name){
    var origin_array = this;   //待转换的数组
    id_name = id_name || 'id';
    parent_id_name = parent_id_name || 'parent_id';

    //默认为最小的parent_id
    var min_parent_id = Math.min.apply(null, $.map(origin_array,function(value){return value.parent_id}) );
    parent_id = parent_id || min_parent_id;

    //1.筛选出所有 一级子类
    var son_list_arr = $.grep(origin_array,function(val){if(val[parent_id_name]+""===parent_id+"") return true;});
    if(son_list_arr.length){
        var all_son_arr = [];
        $(son_list_arr).each(function(){
            if(this[id_name] === this[parent_id_name]) null;
            //2.递归获取 每个一级子类 的所有子类     //如果 parent_id 错误指向,会导致死循环(比如1的parent_id是2, 2的parent_id是1)
            var all_children_array = origin_array.converTree(this[id_name]);
            if(all_children_array) this['children'] =  all_children_array;  //有子类才创建 children 属性
            this['name'] = this['depart_name']; //当前需要使用 name 和 value ,所以转换下
            this['value'] = this['id'];
            all_son_arr.push(this);
        });
        return all_son_arr;
    }
};