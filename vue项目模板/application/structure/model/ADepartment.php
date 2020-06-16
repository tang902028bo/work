<?php
/**
 * Created by myPhpStorm.
 * User: Administrator
 * Date: 2019/7/3
 * Time: 16:43
 */

namespace app\structure\model;


use think\Model;

class ADepartment extends Model
{

    function emptyTags(){
        $this->where('id','>',0)->update(['tags'=>'']);
    }

    function addTags($dep_id,$tag_id){
        $old_tags = $this->where('wx_depid',$dep_id)
            ->value('tags');
        $old_tags = empty($old_tags)?[]:explode(',',$old_tags);
        if(!in_array($tag_id,$old_tags)){
            array_push($old_tags,$tag_id);
            array_unique($old_tags);
            $this->where('wx_depid',$dep_id)->update(['tags'=>implode(',',$old_tags)]);
        }
        return 1;
    }

    //根据标签查询部门
    function getTagList($tag_id='',$where=[],$first,$limit = 10 ){
        $data = $this->field('name,tags,id')
            ->where('soft_delete',1)->where('tags','>',0);
        if($tag_id){
            $data->where('find_in_set('.$tag_id.',tags)');
        }
        if(!empty($where)){
            $data->where($where);
        }
        return $data->limit($first,$limit)->select()->toArray();
    }

    //总数
    function total($tag_id='',$where=[]){
        $data = $this->field('name,tags,id')
            ->where('soft_delete',1)->where('tags','>',0);
        if($tag_id){
            $data->where('find_in_set('.$tag_id.',tags)');
        }
        if(!empty($where)){
            $data->where($where);
        }
        return $data->count();
    }

    //移除标签
    function removeTag($id,$tag_id){
        $tags = $this->where('id',$id)->value('tags');
        $old_tags = explode(',',$tags);
        $key = array_search($tag_id,$old_tags);
        if(isset($key)) unset($old_tags[$key]);
        return $this->where('id',$id)->update(['tags'=>implode(',',$old_tags)]);
    }

    //批量添加标签
    function tags($depids,$tagid){
        $tags = $this->field('id,tags')->whereIn('id',$depids)->select()->toArray();
        if(count($tags)>0){
            foreach ($tags as $tag){
                $old_tags = $tag['tags']?explode(',',$tag['tags']):[];
                array_push($old_tags,$tagid);
                $new_tags = array_unique($old_tags);
                $this->where('id',$tag['id'])->update(['tags'=>implode(',',$new_tags)]);
            }
        }
        return 1;
    }

    function tags_update($depid,$addtags){
       /* $tags = $this->field('id,tags')->where('id',$depid)->find();
        $old_tags = $tags['tags']?explode(',',$tags['tags']):[];
        $old_tags = array_merge_recursive($old_tags,$addtags);
        $new_tags =  array_unique($old_tags);*/
        $addtags = empty($addtags)?'':implode(',',$addtags);
       return $this->where('id',$depid)->update(['tags'=>$addtags]);
    }

    function batch_remove_tags($ids,$tag_id){
        $tags = $this->field('id,tags')->whereIn('id',$ids)->select()->toArray();
        if(count($tags)>0){
            foreach ($tags as $tag){
                $old_tags = explode(',',$tag['tags']);
                $key = array_search($tag_id,$old_tags);
                if(isset($key)) unset($old_tags[$key]);
                $this->where('id',$tag['id'])->update(['tags'=>implode(',',$old_tags)]);
            }
        }
    }

    /**获取标签的部门
     * @param $tags 标签的数组
     * @param $field
     * @return array
     * @throws \think\db\exception\DataNotFoundException
     * @throws \think\db\exception\ModelNotFoundException
     * @throws \think\exception\DbException
     */
    function tags_deps($tags,$field='',$tag_names=[]){
        if(is_array($tags)){
            $arr = [];
            foreach ($tags as $tag){
               $temp =  $this->tags_dep_select($tag,$field,$tag_names);
               $arr = array_merge($arr,$temp);
            }
            return  $arr;
        }
        else{
            return $this->tags_dep_select($tags,$field,$tag_names);
        }

    }

    /**含标签的部门处理
     * @param $tag
     * @param string $field
     * @param array $tag_names
     * @return array
     * @throws \think\db\exception\DataNotFoundException
     * @throws \think\db\exception\ModelNotFoundException
     * @throws \think\exception\DbException
     */
    function tags_dep_select($tag,$field='',$tag_names=[]){
        $data = $this->where('soft_delete',1);
        if($field){$data->field($field);}
        $data->where('find_in_set('.$tag.',tags)');
        return $data->select()->each(function ($items) use($tag_names,$tag){
            $items['tag_name'] = isset($tag_names[$tag])?$tag_names[$tag]:'未知标签';
            return $items;
        })->toArray();
    }



    /**获取部门名称的sting,从父级一直排序到本身
     * @param $id
     * @return mixed|string
     * @throws \think\db\exception\DataNotFoundException
     * @throws \think\db\exception\ModelNotFoundException
     * @throws \think\exception\DbException
     */
    function getNameString($id){
        if(cache('depString_'.$id)){
          return  cache('depString_'.$id);
        }
        $string = $this->getNameStringQuery($id);
        cache('depString_'.$id,$string,300);
        return $string;
    }

    /**获取部门名称的sting,从父级一直排序到本身的查询
     * @param $id 部门id
     * @param string $string 返回数据
     * @return string
     * @throws \think\db\exception\DataNotFoundException
     * @throws \think\db\exception\ModelNotFoundException
     * @throws \think\exception\DbException
     */
    private function getNameStringQuery($id,$string=''){
        $dep_info = $this->where('id',$id)->field('dep_name,parentid')->find();
        $string = $dep_info['dep_name'].($string?'/':'').$string;
        if($dep_info['parentid']!=0){
          return  $this->getNameStringQuery($dep_info['parentid'],$string);
        }
        return $string;
    }

    /*递归获取所有的下级部门*/
    function all_department($dep_id,$deparr=array()){
        $dep=$this->field("id")->where("parentid",$dep_id)->select()->toArray();
        if($dep){
            foreach($dep as $v){
                $deparr[]=$v['id'];
                $deparr=$this->all_department($v['id'],$deparr);
            }
        }
        return $deparr;
    }
}