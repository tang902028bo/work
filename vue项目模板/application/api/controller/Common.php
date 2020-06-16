<?php
/**
 * Created by myPhpStorm.
 * User: Administrator
 * Date: 2019/10/18
 * Time: 11:38
 */
namespace app\api\controller;
use app\ApiBaseController;
use think\Db;
class Common extends ApiBaseController
{
    function get_dep(){
        //获取部门
        $department=Db::name("a_department")->field("wx_depid as id,parentid as parent_id,dep_name")
            ->where('soft_delete',1)
            ->orderRaw('wx_depid + 0')->select();

        return ['department'=>$department ,'tag'=>[]];
    }
    function get_dep_user(){
        $keyword = $this->request->param('keyword');
        $dep_id = $this->request->param('dep_id');
        //获取用户
        $where = [];
        $where_dep = '';
        if(!empty($keyword))
            $where[] = ['name','like','%'.$keyword.'%'];
        if(!empty($dep_id)){
            $dep_id = explode(',',$dep_id);
            $total = count($dep_id);
            foreach($dep_id as $k=>$dep_alone){
                $where_dep .= ' FIND_IN_SET('.$dep_alone.',department) ';
                if($k!=$total-1){
                    $where_dep.='or ';
                }

            }
        }

        $user_info = Db::name('a_user')->field('name,userid as user_id,avatar,department as u_depart')
            ->where($where)->where($where_dep)->where('soft_delete',1)->select();

        $department_deal = Db::name("a_department")->column('dep_name','wx_depid');

        foreach ($user_info as $key => $val) {
            $user_dep_arr = [];
            $department_id_arr = explode(',',$val['u_depart']);
            foreach ($department_id_arr as $k => $v) {
                if(isset($department_deal[$v])){
                    $user_dep_arr[] = $department_deal[$v];
                }
            }
            $user_info[$key]['dep_names'] = implode('|',$user_dep_arr);
        }
        return $user_info;
    }
    /**
     * 获取初始化部门及下属部门、成员信息
     * 根据其部门人员来决定第一次加载多少层级
     * 由于部门和人员ID都是数字,所以部门加D以区分
     */
    public function getNodeInit(){
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
    public function getNodeChild($parentId = "",$isphp=false){
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
    public function getNodeSearch($keyword=""){
        if(empty($keyword)) $keyword = input("post.keyword");
        $childUser = db('a_user')->field('userid as id,name as label,1 as isuser,avatar,position,department')->where('soft_delete&user_status','1')->where("name","like","%{$keyword}%")->select();
        foreach ($childUser as $key => $val) {
            $childUser[$key]["label"] = $val["label"]."（".implode("|",Db::name("a_department")->whereIn("wx_depid",$val["department"])->limit(0,10)->column("dep_name"))."）";
        }
        $childDep = db('a_department')->field('CONCAT("D",wx_depid) as id,dep_name as label,0 as isuser')->where("dep_name","like","%{$keyword}%")->select();

        return json_encode( ['code'=>1,'data'=> array_merge( $childDep,$childUser ) ] );
    }
    /**
     * 获取部门下成员 (暂未获取部门下所有子部门)
     */
    public function getNodeUser($dep=""){
        if(empty($dep)) $dep = input("post.dep");
        $model = db('a_user')->field('userid as id,name as label,avatar,position');
        foreach(explode(',',$dep) as $val){
            $val = substr($val,1);
            $model->whereOr("FIND_IN_SET('{$val}',department)");
        }
        $result = $model->select();
        return json_encode( ['code'=>1,'data'=> $result ] );
    }
    /**
     * 根据用户userid获取用户信息
     */
    public function getUserInfo($userid=""){
        $userid=(empty(input('userid')))?session('wx_user')['userid']:input('userid');
        $userinfo = db('a_user')->field('userid as id,name as label,1 as isuser,avatar,gender,mobile,telephone,email,position,department,u_roles')->where('userid="'.$userid.'"')->find();
        $deps = Db::name("a_department")->field("dep_name,id")->where("wx_depid","in",$userinfo["department"])->select();
        $roles = (empty($userinfo["u_roles"]))?'':Db::name("a_role")->where("id=".$userinfo["u_roles"])->find();
//        $userinfo["dep_names"] = implode("|",$deps);
        $userinfo["dep_names"] = $deps;
        $userinfo["role_names"] = (empty($roles['role_name']))?'':$roles['role_name'];
        $userinfo['upload_path']=getHttpHost() . '/upload/';
        $userinfo['is_have_power']=(!empty($userinfo['u_roles']) && in_array($userinfo['u_roles'],[1,2,3]))?1:0;
        return json_encode( ['code'=>1,'data'=> $userinfo ] );
    }
    /**
     * 根据部門id获取部門信息
     */
    public function getDepInfo($depid=""){
        if(empty($depid)) $depid = input("post.depid");
        $depinfo = db('a_department')->field('id,wx_depid,dep_name,parentid')->where('wx_depid',$depid)->find();
        return json_encode( ['code'=>1,'data'=> $depinfo] );
    }
    /**
     * 获取当前用户信息
     */
    public function getCurrentUserInfo(){
        return json_encode( ['code'=>1,'data'=> session("user") ] );
    }
    /**获取标签列表**/
    public function GetTags(){
        $keyword = input("param.keyword");
        $where[] = ['status',"eq",1];
        if(!empty($keyword)){
            $where[] = array("tag_name","like","%".$keyword."%");
        }
        $data = Db::name("a_tags")->where($where)->order("sort asc")->select();
        return json_encode( ['code'=>1,'data'=> $data ] );
    }
    /**获取标签详情**/
    public function GetTagsDetail(){
        $tag_id = input("post.id/d");
        $data = Db::name("a_tags")->where("id",$tag_id)->field("id,tagid,tag_name,status,sort")->find();
        return json_encode( ['code'=>1,'data'=> $data ] );
    }
    /**审批页面流程**/
    public function checkProgress(){
        $department_id=input('department_id');
        $date=(empty(input('date')))?time():strtotime(input('date'));
        if($department_id){
            $date_type=isHoliday($date);
            $return=check_progress($department_id,$date_type);
            returnMsg(200,'',$return);
        }else{
            returnMsg(100,'参数department_id不正确！');
        }
    }
    /**用户列表**/
    public function userList(){
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
}