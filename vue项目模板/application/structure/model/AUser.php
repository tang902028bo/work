<?php
/**
 * Created by myPhpStorm.
 * User: Administrator
 * Date: 2019/7/3
 * Time: 16:39
 */

namespace app\structure\model;


use app\structure\service\AutoTags;
use think\Model;

/**用户表
 * Class UserModel
 * @package app\common\model
 */
class aUser extends Model
{

    function emptyTags(){
        $this->where('id','>',1)->update(['u_tags'=>'']);
    }

    /**添加标签
     * @param $wxId 微信id
     * @param $tagId 标签id
     * @return int
     */
    function addTags($wxId,$tagId){
        $old_tags = $this->where('userid',$wxId)->value('u_tags');
        $old_tags = empty($old_tags)?[]:explode(',',$old_tags);
        if(!in_array($tagId,$old_tags)){
            array_push($old_tags,$tagId);
            array_unique($old_tags);
            $this->where('userid',$wxId)->update(['u_tags'=>implode(',',$old_tags)]);
        }
        return 1;

    }

    //
    function getTagList($tagid = '',$where=[],$first_id,$yu_limit=10){
        $data = $this->field('id,name,u_tags as tags,userid,avatar,department')
            ->where('status',1)->where('u_tags','>',0);
        if(!empty($tagid)){
            $data->where('find_in_set('.$tagid.',u_tags)');
        }
        if(!empty($where)){
            $data->where($where);
        }
        return $data->limit($first_id,$yu_limit)->select()->toArray();
    }

    function  total($tagid = '',$where=[]){
        $data = $this->field('name,u_tags as tags,userid,avatar,department')
            ->where('status',1)->where('u_tags','>',0);
        if(!empty($tagid)){
            $data->where('find_in_set('.$tagid.',u_tags)');
        }
        if(!empty($where)){
            $data->where($where);
        }
        return $data->count();
    }

    //移除标签
    function removeTag($userid,$tag_id){
        $tags = $this->where('userid',$userid)->value('u_tags');
        $old_tags = explode(',',$tags);
        $key = array_search($tag_id,$old_tags);
        if(isset($key)) unset($old_tags[$key]);
        return $this->where('userid',$userid)->where('status',1)->update(['u_tags'=>implode(',',$old_tags)]);
    }

    //批量添加标签
    function tags($users,$tagid){
        $tags = $this->field('id,u_tags')->whereIn('userid',$users)->where('id','>',1)
            ->where('status',1)->select()->toArray();
        if(count($tags)>0){
            foreach ($tags as $tag){
                $old_tags = $tag['u_tags']?explode(',',$tag['u_tags']):[];
                array_push($old_tags,$tagid);
                $new_tags = array_unique($old_tags);
                $this->where('id',$tag['id'])->update(['u_tags'=>implode(',',$new_tags)]);
            }
        }
        return 1;
    }

    function tags_update($userid,$addtags){
//        $tags = $this->field('id,u_tags')->where('userid',$userid)->where('user_status',1)->find();
//        $old_tags = $tags['u_tags']?explode(',',$tags['u_tags']):[];
//        $old_tags = array_merge_recursive($old_tags,$addtags);
//        $new_tags =  array_unique($old_tags);
        $addtags = empty($addtags)?'':implode(',',$addtags);
        $this->where('userid',$userid)->update(['u_tags'=>$addtags]);

        return true;
    }

    function batch_remove_tags($ids,$tag_id){
        $tags = $this->field('id,u_tags')->whereIn('userid',$ids)->where('status',1)->select()->toArray();
        if(count($tags)>0){
            foreach ($tags as $tag){
                $old_tags = explode(',',$tag['u_tags']);
                $key = array_search($tag_id,$old_tags);
                if(isset($key)) unset($old_tags[$key]);
                $this->where('id',$tag['id'])->update(['u_tags'=>implode(',',$old_tags)]);
            }
        }
    }

    /**获取标签的人员
     * @param $tags
     * @param $field
     * @return array
     * @throws \think\db\exception\DataNotFoundException
     * @throws \think\db\exception\ModelNotFoundException
     * @throws \think\exception\DbException
     */
    function tags_user($tags,$field='',$tag_names =[]){
        if(is_array($tags)){
            $arr = [];
            foreach ($tags as $tag){
                $temp =  $this->tags_user_select($tag,$field,$tag_names);
                $arr = array_merge($arr,$temp);
            }
            return  $arr;
        }
        else{
            return $this->tags_user_select($tags,$field,$tag_names);
        }

    }

    /**获取标签的人员
     * @param $tag 标签
     * @param string $field
     * @param array $tag_names
     * @return array
     * @throws \think\db\exception\DataNotFoundException
     * @throws \think\db\exception\ModelNotFoundException
     * @throws \think\exception\DbException
     */
    function tags_user_select($tag,$field='',$tag_names=[]){
        $data = $this->where('soft_delete',1);
        if($field){$data->field($field);}
        $data->where('find_in_set('.$tag.',u_tags)');
        return $data->select()->each(function ($items) use($tag_names,$tag){
            $items['tag_name'] =  isset($tag_names[$tag])?$tag_names[$tag]:'未知标签';
            return $items;
        })->toArray();
    }

    /**添加修改
     * @param $data
     * @return false|int
     */
    function add_update_user($data){
        $class = AutoTags::getClass();
        $tags = $class->getTags($data);//检测标签符合自动添加规则
        $id = $this->where('userid',$data['userid'])->value('id');
        if($id){
            if(count($tags)>0){
                $old_tags = $this->where('id',$id)->value('u_tags');
                $old_tags = explode(',',$old_tags);
                $new_tags = array_unique(array_filter(array_merge($old_tags,$tags)));
                $data['u_tags'] = implode(',',$new_tags);
            }
            $data['soft_delete'] =1;
            $res =  $this->where('id',$id)->update($data);
//            $res =  $this->update(['soft_delete'=>1],['id'=>$id]);
        }
        else{
            if(count($tags)>0){
                $data['tags'] = implode(',',$tags);
            }
            $data['userid'] = $data['userid'];
            $res =  $this->isUpdate(false)->data($data, true)->allowField(true)->save($data);//先这样处理，新建字段延迟的问题
        }
        return $res;
    }

    /**返回符合要求的所有数据
     * @param array $field 字段
     * @param array $opt 条件方式
     * @param array $keyword 关键字
     * @param  $where 已有条件
     * @param  $where_sql 已有条件
     * @return string
     */
    function get_where_all_userids(array $field,array $opt,array $keyword,$where,$where_sql){
        $condition = $this->where_solve($field,$opt,$keyword,$where,$where_sql);
        $userids = $this->where('status',1)->where('id','>',1);
        if(!empty($condition['where'])){$userids->where($condition['where']);}
        if(!empty($condition['where_sql'])){$userids->where($condition['where_sql']);}
        $userids = $userids->column('userid');
        return implode(',',$userids);
    }

    /**条件处理
     * @param array $field 字段
     * @param array $opt 比较
     * @param array $keyword 关键字
     * @param array $where 返回条件数组
     * @param string $where_sql 返回条件sql
     * @return array|\think\response\Json
     */
    function where_solve(array $field,array $opt,array $keyword,$where = array(),$where_sql=''){
        if(count($keyword)>0){
            foreach ($keyword as $k=>$kw){
                if(!empty($kw)){
                    //特殊的条件处理
                    if($field[$k] == 'department'){ //部门
                        $depids = db('a_department')->where('dep_name','like','%'.$kw.'%')->column('id');
                        if(!empty($depids)){
                            $where_sql .= $where_sql?'and (':' (';
                            foreach ($depids as $i=>$depid){
                                $where_sql  .= "  find_in_set(".$depid.",department) ";
                                if(count($depids)-1 != $i){
                                    $where_sql.= ' or';
                                }
                            }
                            $where_sql .= ')';
                        }else{
                            return json(['code'=>1,'msg'=>'ok','data'=>[]]);
                        }
                        continue;
                    }
                    //标签
                    if(trim($field[$k]) == 'u_tags'){
                        $tagids = db('tags')->where('tag_name','like','%'.$kw.'%')->column('id');
                        if(!empty($tagids)){
                            $where_sql .= $where_sql?'and (':' (';
                            foreach ($tagids as $j=>$tid){
                                $where_sql  .= "  find_in_set(".$tid.",u_tags) ";
                                if(count($tagids)-1 != $j){
                                    $where_sql.= ' or';
                                }
                            }
                            $where_sql .= ')';
                        }else{
                            return json(['code'=>1,'msg'=>'ok','data'=>[]]);
                        }
                        continue;
                    }
                    //状态
                    if(trim($field[$k]) == 'status'){
                        if(!is_numeric($kw)){
                            $kw = $kw == '正常'?1:0;
                        }
                        if($kw===1){
                            $where[$field[$k]] = [$opt[$k],$kw];
                        }
                        else{
                            $where[$field[$k]] = ['>',1];
                        }
                        continue;
                    }
                    //性别
                    if(trim($field[$k]) == 'gender') {
                        if(in_array(trim($kw),['男','女'])){
                            $where[$field[$k]] = trim($kw)=='男'?1:2;
                        }else{
                            return json(['code'=>1,'msg'=>'ok','data'=>[]]);
                        }
                        continue;
                    }
                    $opt_l = str_replace('&gt;','>',$opt[$k]);
                    $opt_l = str_replace('&lt;','>',$opt_l);
                    $where[$field[$k]] = trim($opt_l) =='like'?['like','%'.$kw.'%']:[$opt_l,$kw];
                }
            }
        }
        return ['where'=>$where,'where_sql'=>$where_sql];
    }

    //为表新增字段
    function add_field($field_code){
        $table = config('database.prefix').$this->name;
        $sql = "ALTER TABLE {$table} ADD COLUMN {$field_code}  varchar(150);";
        file_put_contents(UPLOAD.'test.log',$sql.PHP_EOL,8);
        $res = $this->execute($sql);
        file_put_contents(UPLOAD.'test.log',$res.PHP_EOL,8);
        if($res){
            $this->field =$this->getTableFields();
            array_push($this->field, $field_code);////为模型新增字段
        }
        return $res;
    }

    /**获取最后的field_数字
     * @return int
     */
    function getLastField(){
        $fields = $this->getTableFields();//user表所有字段
        $num = array_filter($fields,function($t){ return strpos($t,'field_')!==false;} );;//获取自定义字段的数目值
        return $num = count($num)+1;//已经使用到了这个数字
    }
}