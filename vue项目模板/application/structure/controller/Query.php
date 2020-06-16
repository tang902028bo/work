<?php
/**
 * Created by myPhpStorm.
 * User: Administrator
 * Date: 2019/9/10
 * Time: 16:48
 */
namespace app\structure\controller;
use app\BaseController;
class Query extends BaseController
{
    //用户列表
    function userList(){
        set_time_limit(50);
        $limit = $this->request->param('limit',10);
        $name = $this->request->param('name');
        $mobile = $this->request->param('mobile');
        $dep_id = $this->request->param('dep_id');
        $is_status = $this->request->param('is_status',false);
        $state = $this->request->param('state');
        $u_roles = $this->request->param('u_roles');

        $where = [];
        $where[]=['soft_delete','=',1];
        $where[]=['id','>',1];
        $sql_where = '';
        if(!empty($name)){
            $where[] = ['name','like','%'.$name.'%'];
        }
        if(!empty($mobile)){
            $where[] = ['mobile','like','%'.$mobile.'%'];
        }
        if(!empty($u_roles)){
            $where[] = ['u_roles','=',$u_roles];
        }
        if($is_status){
            if($state==1){
                $sql_where = 'user_status <> 1 or soft_delete > 1';
            }
            if($state == 2){
                $where[] = ['user_status','<>',1];
            }
            if($state == 3){
                $where[] = ['soft_delete','>',1];
            }
        }
        if(!empty($dep_id)){
            $sql_where = '( find_in_set('.$dep_id.',department)';
            $child_dep = $this->all_department($dep_id);
            foreach ($child_dep as $dep){
                $sql_where .= 'or find_in_set('.$dep.',department)';
            }
            $sql_where .= ')';
        }

        $data =db('a_user');
        if(!empty($where)){
            $data->where($where);
        }
        if(!empty($sql_where)){
            $data->where($sql_where);
        }
        $data = $data->paginate($limit)->each(function($item){
            $item['department_name'] = '';
            if(!empty($item['department'])){
                $temp_names =db('a_department')->whereIn('id',explode(',',$item['department']))->column('dep_name');
                $item['department_name'] = implode(',',$temp_names);
            }
            $item['u_role_name'] =db('a_role')->where('id',$item['u_roles'])->value('role_name');
            return $item;
        });
        return json(['code'=>1,'data'=>$data->items(),'total'=>$data->total()]);
    }
    //部门列表
    function depList(){
        $keyword = $this->request->param('keyword');
        $where = array();
        if(!empty($keyword)){
            $where['dep_name'] = ['like','%'.$keyword.'%'];
        }
        $dep = db('a_department')->where('soft_delete',1);
        if($where){
            $dep->where($where);
        }
        $data = $dep->select();
        return json(['code'=>1,'msg'=>'ok','data'=>$data]);
    }
    //部门列表
    function dep_list(){
        $keyword = $this->request->param('keyword');
        $where = array();
        if(!empty($keyword)){
            $where[] = ['party_name','like','%'.$keyword.'%'];
        }
        $dep = db('fj_party')->field("party_name as depart_name,id,pid as parent_id");
        if($where){
            $dep->where($where);
        }
        $data['department'] = $dep->select();
        return json(['code'=>1,'msg'=>'ok','data'=>$data]);
    }
    //下级部门
    function all_department($dep_id,$deparr=array()){
        if(cache('dep_child'.$dep_id)){
            return cache('dep_child'.$dep_id);
        }
        $dep=db("a_department")->field("id")->where("parentid",$dep_id)->select();
        if($dep){
            foreach($dep as $v){
                $deparr[]=$v['id'];
                $deparr=$this->all_department($v['id'],$deparr);
            }
        }
        cache('dep_child'.$dep_id,$deparr,120);
        return $deparr;
    }
    //用户列表
    function user_list(){
        set_time_limit(50);
        $limit = $this->request->param('limit',10);
        $keyword = $this->request->param('keyword');
        $dep_id = $this->request->param('dep_id');

        $where = [];
        $sql_where = '';
        if(!empty($keyword)){
            $where[] = ['a.name','like','%'.$keyword.'%'];
        }
        if(!empty($dep_id)){
          /*  $sql_where = '( find_in_set('.$dep_id.',u.party_id)';
            // $child_dep = $this->all_department($dep_id);
            // foreach ($child_dep as $dep){
            //     $sql_where .= 'or find_in_set('.$dep.',u.party_id)';
            // }
            $sql_where .= ')';*/
            $where[] = ['party_id','=',$dep_id];
        }


        $data = db('fj_party_user')->alias("u")
            ->join("a_user a","a.userid=u.userid","left")
            ->field("a.userid,a.name,a.avatar,a.mobile,party_id");
        if(!empty($where)){
            $data->where($where);
        }
        $data = $data->paginate($limit)->each(function($item){
            $item['dep_names'] = '';
            if(!empty($item['party_id'])){
                $temp_names = db('fj_party')->whereIn('id',explode(',',$item['party_id']))->column('party_name');
                $item['dep_names'] = implode(',',$temp_names);
            }
            return $item;
        });
        return json(['code'=>1,'data'=>$data->items(),'count'=>$data->total()]);
    }
    /**
     * 获取初始化部门及下属部门、成员信息
     * 根据其部门人员来决定第一次加载多少层级
     * 由于部门和人员ID都是数字,所以部门加D以区分
     */
    function getNodeInit(){
        $topDep = db('a_department')->field('CONCAT("D",wx_depid) as id,dep_name as label,0 as isuser')->where('soft_delete',1)->where('parentid','0')->select();
        if($topDep){
            // $topDep['children'] = $this->getNodeChild( $topDep['id'],true )['data'];
            return json_encode( ['code'=>1,'data'=> $topDep ] );
        }else{
            return json_encode( ['code'=>0,'msg'=>'未查询到部门'] );
        }
    }
    /**
     * 获取子部门和成员
     */
    function getNodeChild($parentId = "",$isphp=false){
        if(empty($parentId)) $parentId = input("post.parentId");
        $parentId = substr($parentId,1);
        $childUser = db('a_user')->field('userid as id,name as label,1 as isuser,avatar,position')->where('soft_delete&user_status','1')->where("FIND_IN_SET('".$parentId."',department)")->select();
        $childDep = db('a_department')->field('CONCAT("D",wx_depid) as id,dep_name as label,0 as isuser')->where('parentid',$parentId)->select();

        if($isphp) return ['code'=>1,'data'=> array_merge( $childDep,$childUser ) ];
        else return json_encode( ['code'=>1,'data'=> array_merge( $childDep,$childUser ) ] );
    }
    /**
     * 搜索部门和成员
     */
    function getNodeSearch($keyword=""){
        if(empty($keyword)) $keyword = input("post.keyword");
        $childUser = db('a_user')->field('userid as id,name as label,1 as isuser,avatar,position,department')->where('soft_delete&user_status','1')->where("name","like","%{$keyword}%")->select();
        foreach ($childUser as $key => $val) {
            $childUser[$key]["label"] = $val["label"]."（".implode("|",db("a_department")->whereIn("wx_depid",$val["department"])->limit(0,10)->column("dep_name"))."）";
        }
        $childDep = db('a_department')->field('CONCAT("D",wx_depid) as id,dep_name as label,0 as isuser')->where("dep_name","like","%{$keyword}%")->select();

        return json_encode( ['code'=>1,'data'=> array_merge( $childDep,$childUser ) ] );
    }
    /**
     * 获取部门下成员 (暂未获取部门下所有子部门)
     */
    function getNodeUser($dep=""){
        if(empty($dep)) $dep = input("post.dep");
        $model = db('a_user')->field('userid as id,name as label,avatar,position');
        foreach(explode(',',$dep) as $val){
            $val = substr($val,1);
            $model->whereOr("FIND_IN_SET('{$val}',department)");
        }
        $result = $model->select();
        return json_encode( ['code'=>1,'data'=> $result ] );
    }



}