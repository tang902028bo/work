<?php
/**
 * Created by myPhpStorm.
 * User: Administrator
 * Date: 2019/9/25
 * Time: 11:59
 */
namespace app\admin\controller;
use app\BaseController;
/**角色
 * Class Role
 * @package app\admin\controller
 */
class Role extends BaseController
{

    function index(){
        return $this->fetch();
    }

    //设置权限
    function set_role(){
        $id = $this->request->post('id');
        $role_id = $this->request->post('role_id');
        if(empty($role_id)){
            return json(['code'=>0,'msg'=>'请指定角色']);
        }
        if(empty($id)){
            return json(['code'=>0,'msg'=>'请指定设置人员']);
        }
        $ids =explode(',',$id);//多个同时设置
        $role_user_id=[];
        $role_id_arr=[];//审批层级角色id
        $setting_info = db('dc_approval_setting')->where(['soft_delete' => 1])->order('approver_order asc')->select();
        foreach ($setting_info as $k => $v) {
            if($v['approver_type']==2){
                $role_users=db('a_user')->field('userid')->where('soft_delete=1 and u_roles in ('.$v['role_id'].')')->select();
                foreach ($role_users as $kk=>$vv){
                    $role_user_id[]=$vv['userid'];
                }
                $approval_role_id=explode(',',$v['role_id']);
                for($i=0;$i<count($approval_role_id);$i++){
                    $role_id_arr[]=$approval_role_id[$i];
                }
            }
        }
        $fail_user_id='';
        $count=db('dc_approval_car')->where(['soft_delete'=>1,'status'=>0])->count();
        for ($i=0;$i<count($ids);$i++){
            $userinfo=db('a_user')->where(['id'=>$ids[$i]])->find();
            if(in_array($userinfo['userid'],$role_user_id) && $count!=0){
                return json(['code'=>100,'msg'=>'设置失败！'.$userinfo['name'].'所属角色有审批未处理完']);
            }
            $role_user_count=db('a_user')->where(['u_roles'=>$userinfo['u_roles']])->count();
            if(in_array($userinfo['u_roles'],$role_id_arr)&&$role_user_count==1){
                $fail_user_id.=$userinfo['name'].',';
            }else{
                $res = db('a_user')->where(['id'=>$ids[$i]])->update(['u_roles'=>$role_id]);
                if($res===false){
                    $fail_user_id.=$userinfo['name'].',';
                }
            }
        }
        $name = db('a_role')->where('id',$role_id)->value('role_name');
        if(empty($fail_user_id)){
            return json(['code'=>200,'msg'=>'设置成功！','data'=>$name]);
        }else{
            return json(['code'=>100,'msg'=>'部分设置失败！'.rtrim($fail_user_id,',').'为审批角色唯一用户，请为该审批角色添加其他用户或修改审批流程','data'=>$name]);
        }

    }

    //列表
    function role_list(){
        $data = db('a_role')->select();
        return json(['code'=>1,'data'=>$data]);
    }

    //添加/编辑角色
    function edit_role(){
        $role_name = $this->request->post('name','','trim');
        if(empty($role_name)){return json(['code'=>0,'msg'=>'请输入角色名称']);}
        if(!empty(input('id'))){
            $id=input('id');
            $ckeck =  db('a_role')->where('id','<>',$id)->where('role_name',$role_name)->count();
            if($ckeck){return json(['code'=>0,'msg'=>'该角色已存在']);}
            $res = db('a_role')->where('id='.$id)->update(['role_name'=>$role_name]);
            if($res!==false){return json(['code'=>1,'msg'=>'修改成功','data'=>$res]);}
            return json(['code'=>0,'msg'=>'修改失败']);
        }else{
            $ckeck =  db('a_role')->where('role_name',$role_name)->count();
            if($ckeck){return json(['code'=>0,'msg'=>'该角色已存在']);}
            $res = db('a_role')->insertGetId(['role_name'=>$role_name]);
            if(!$res){return json(['code'=>0,'msg'=>'添加失败']);}
            return json(['code'=>1,'msg'=>'添加成功','data'=>$res]);
        }
    }

    //删除
    function del_role(){
        $id = $this->request->post('id','','intval');
        if($id<1){
            return json(['code'=>0,'msg'=>'请指定要删除的角色']);
        }
        $setting_info = db('dc_approval_setting')->where(['soft_delete' => 1])->order('approver_order asc')->select();
        foreach ($setting_info as $k => $v) {
            if($v['approver_type']==2){
                $role_id=explode(',',$v['role_id']);
                if(in_array($id,$role_id)){
                    return json(['code'=>0,'msg'=>'删除失败!该角色有审批未处理完']);
                }
            }
        }
        $res = db('a_role')->where('id',$id)->delete();
        if($res){
            db('a_user')->where('u_roles',$id)->update(['u_roles'=>'']);
            db('a_role_power')->where('role_id',$id)->delete();
            return json(['code'=>1,'msg'=>'删除成功']);
        }
        return json(['code'=>0,'msg'=>'删除失败']);
    }

    /***********权限相关*************/
    function get_role_permission(){
        $role_id = input('role_id');
        if(empty($role_id)){return json(['code'=>0,'msg'=>'请指定角色']);}
        $data = db('a_role_power')->where('role_id',$role_id)->select();
        return json(['code'=>1,'data'=>$data]);
    }

    function add_power(){
        $name = $this->request->post('name');
        $code = $this->request->post('code');
        $type = $this->request->post('type');
        if(empty($name)||empty($code)||empty($type)){
            return json(['code'=>0,'msg'=>'参数缺失']);
        }
        $res = db('a_power')->where('code',$code)->count();
        if($res){
            return json(['code'=>0,'msg'=>'权限代码已存在']);
        }
        $res = db('a_power')->insert(['name'=>$name,'code'=>$code,'type'=>$type]);
        if($res){
            return json(['code'=>1,'msg'=>'权限代码添加成功']);
        }
        return json(['code'=>0,'msg'=>'权限代码添加失败']);
    }


    //显示角色权限
    function show_role_permission(){
        $data = db('a_power')->order('type_sort','asc')->order('sort','asc')->select();
        return json(['code'=>1,'data'=>$data]);
    }
    //修改操作权限
    function change_operation_permission(){
        $data = input();
        if(empty($data['role_id'])){
            return json(['参数缺失，刷新页面重试']);
        }
        $id = db('a_role_power')->where('role_id',$data['role_id'])->where('code',$data['code'])->value('id');
        if($id){
            $res = db('a_role_power')->where('id',$id)->update($data);
        }else{
            $res = db('a_role_power')->insert($data);
        }
        if($res!==false){return json(['code'=>1,'msg'=>'设置完成']);}
        else{return json(['code'=>0,'msg'=>'设置失败']);}
    }

    //获取当前角色的权限信息
    function get_role_power(){
        $role_ids = explode(',',db('a_user')->where('id',session('user.id'))->value('u_roles'));
        $data['user_name'] = session('user')['name'];
        $data['userid'] = session('user')['userid'];
        $data['avatar'] = session('user')['avatar'];
        $data['user_phone']= session('user')['mobile'];
        $data['dep_id']=explode(",", session("user")['department'])[0];
        $data['dep_name']=db("a_department")->where("id",$data['dep_id'])->value("dep_name");
        if(in_array(1,$role_ids)){
            $data['checksum'] = ['all'];
        }else{
            $data['checksum'] = db('a_role_power')->whereIn('role_id',$role_ids)->where('status',1)->column('code');
        }
        return json(['code'=>1,'msg'=>'ok','data'=>$data]);
    }


    //权限类型
    function power_type(){
        $data = db('a_power_type')->select();
        return json(['code'=>1,'data'=>$data]);
    }

}