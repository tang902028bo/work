<?php
/**
 * Created by myPhpStorm.
 * User: Administrator
 * Date: 2019/7/3
 * Time: 14:09
 */

namespace app\structure\service;


use think\Model;

class ATags extends Model
{
    protected $name = 'a_tags';
    protected $pk = 'id';//模型主键
    protected $autoWriteTimestamp = true;


    function getAllTags($where=''){
        $data = $this;
        if(!empty($where))
            $data->where($where);
        return $data->order('sort','desc')->select()->toArray();
    }

    //禁用所有标签
    function banAllTags(){
        $this->where('id','>',0)->update(['status'=>0]);
    }

    function exist($id){
        if($this->where('id',$id)->count()) return true;
        return false;
    }

    function exist_name($tag_name,$id=''){
        $res = $this->where('tag_name',$tag_name);
        if(!empty($id)){
            $res->where('id','<>',$id);
        }
        $res = $res->find();
        if($res) return true;
        return false;
    }

    //保存标签信息
    function saveTag($data){
        $this->allowField(true)->data($data,true)->save();
    }

    function remove($tagid){
//        $this->startTrans();
        $deps = db('department')->where('find_in_set('.$tagid.',tags)')->select()->toArray();
        if(is_array($deps)&&count($deps)>0){
            foreach ($deps as $dep){
                $old_tags = explode(',',$dep['tags']);
                $key = array_search($tagid,$old_tags);
                if(isset($key)) unset($old_tags[$key]);
                db('department')->where('id',$dep['id'])->update(['tags'=>implode(',',$old_tags)]);
            }
        }
        $users = db('user')->field('id,u_tags')->where('find_in_set('.$tagid.',u_tags)')->select()->toArray();
        if(count($users)>0){
            foreach ($users as $user){
                $old_tags = explode(',',$user['u_tags']);
                $key = array_search($tagid,$old_tags);
                if(isset($key)) unset($old_tags[$key]);
                $new_tags = implode(',',$old_tags);
                db('user')->where('id',$user['id'])->update(['u_tags'=>$new_tags]);
            }
        }
        $this->where('id',$tagid)->delete();
        return true;
    }

}