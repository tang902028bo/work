<?php
/**
 * Created by myPhpStorm.
 * User: Administrator
 * Date: 2019/9/10
 * Time: 11:34
 */

namespace app\structure\controller;


use app\BaseController;
use app\common\WxApi;
use think\App;
use think\Exception;
use think\Db;
use app\structure\service\WxTags;
use app\structure\model\ADepartment;
use app\structure\service\ATags;
use app\structure\model\AUser;
class Api extends BaseController
{
    private $dep_user_key = 0;
    private $add_user_array = [];
    private $update_user_array = [];
    private $depart_leader = [];
    private $add_deps = [];
    private $update_deps = [];

    public function __construct(App $app = null)
    {
        parent::__construct($app);
        isset($_SERVER['HTTP_ORIGIN']) ? header('Access-Control-Allow-Origin: '.$_SERVER['HTTP_ORIGIN']) : '';
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept, authKey, sessionId");
        if(strtoupper($_SERVER['REQUEST_METHOD'])== 'OPTIONS'){ exit; }
    }


    //微信信息设置
    function setting(){
        $data = $this->request->param('');
        if(empty($data['corpid'])){
            return json(['code'=>0,'msg'=>'请填写corpid']);
        }
        if(empty($data['app_secret'])){
            return json(['code'=>0,'msg'=>'请填写应用的secret']);
        }
        if(empty($data['app_id'])){
            return json(['code'=>0,'msg'=>'请填写应用的agentId']);
        }
        $res = set_option($data,APP_CODE);
        if($res){return json(['code'=>1,'msg'=>'设置成功']);}
        return json(['code'=>0,'msg'=>'设置失败']);
    }

    //同步组织架构
    function sync($admin_list=[],$super_admin_list=[]){
        ini_set('max_execution_time',0); //执行完成为止
        $settings = get_option(APP_CODE);
        if(empty($settings)){
            return json(['code'=>0,'msg'=>'请先设置微信相关信息']);
        }
        $access_token = get_wx_token('qywx_token','app_secret',APP_CODE,COMPANY_ID);
        //var_dump($access_token);
        if(empty($access_token)){
            return json(['code'=>0,'msg'=>'token获取失败']);
        }
        //获取应用可见范围等信息
        $wx_class = new WxApi();
        $app_info = $wx_class->get_App_info($access_token,$settings['app_id']);
        //var_dump($app_info);exit;
        if(isset($app_info['code'])&&$app_info['code']==0){ //获取信息出错
            return json($app_info);
        }
         //var_dump($app_info);exit;
        $allow_user = [];$allow_dep = [];$allow_tag = [];
        if(isset($app_info['allow_userinfos']) && isset($app_info['allow_userinfos']['user'])){
            $allow_user = $app_info['allow_userinfos']['user']; //允许访问的标签
        }
        if(isset($app_info['allow_partys']) && isset($app_info['allow_partys']['partyid'])){
            $allow_dep = $app_info['allow_partys']['partyid']; //允许访问的标签
        }
        if(isset($app_info['allow_tags']) && isset($app_info['allow_tags']['tagid'])){
            $allow_tag = $app_info['allow_tags']['tagid']; //允许访问的标签
        }
        /**下面是开始同步***/
        /*删除所有部门 禁用除超级管理员外所有员工*/
        Db::startTrans();
        try{
            db("a_department")->where('id','>',0)->update(array("soft_delete"=>time()));
            db("a_user")->where('id','>',0)->update(array("soft_delete"=>time()));
            //var_dump( $allow_dep );
            if(is_array($allow_dep)&&count($allow_dep)>0){
                //同步可见范围部门
                foreach ($allow_dep as $dep_id){
                    //continue;
                    $res = $this->sync_dep(count($allow_dep),$dep_id,$wx_class,$access_token,$admin_list,$super_admin_list);
                    if($res['code']==0){
                        return json($res);
                    }
                }
                //同步可见范围部门下人员
                foreach ($allow_dep as $k => $dep_id){
                    $res = $this->sync_dep_user($dep_id,$wx_class,$access_token,$admin_list,$super_admin_list);
                    if($res['code']==0){
                        return json($res);  
                    }
                }
            }
            /**目前可见标签范围暂不用同步，因为如果标签内的人员不在应用可见范围，也同步不下来**/
            // if(is_array($allow_tag)&&count($allow_tag)>0){
            //     //同步可见范围标签人员
            //     foreach ($allow_tag as $k => $tag_id){
            //         $res = $this->sync_tag_user($tag_id,$wx_class,$access_token,$admin_list,$super_admin_list);
            //         if($res['code']==0){
            //             return json($res);  
            //         }
            //     }
            // }
            
            if(is_array($allow_user)&&count($allow_user)>0){
                //同步可见范围的人员
                foreach ($allow_user as $userid){
                    $res = $this->sync_user($userid["userid"],$wx_class,$access_token,$admin_list,$super_admin_list);
                    if($res['code']==0){
                        return json($res);
                    }
                }
            }
            //var_dump( $this->add_user_array );exit;
            if( !empty($this->add_user_array) ){
                db::name('a_user')->limit(500)->insertAll($this->add_user_array);
            }
            if( !empty($this->update_user_array) ){
                db::name('a_user')->limit(500)->insertAll($this->update_user_array,true);
            }
            
            if( !empty($this->add_deps) ){
                foreach( $this->add_deps as $k=>$add_dep ){
                    if( isset($this->depart_leader[$add_dep['wx_depid']]) ){
                        $this->add_deps[$k]['leader'] = implode(',',$this->depart_leader[$add_dep['wx_depid']]);
                    }else{
                        $this->add_deps[$k]['leader'] = '';
                    }
                }
                db::table('a_department')->insertAll($this->add_deps);
            }

            if( !empty($this->update_deps) ){
                foreach( $this->update_deps as $k=>$update_dep ){
                    if( isset($this->depart_leader[$update_dep['wx_depid']]) ){
                        $this->update_deps[$k]['leader'] = implode(',',$this->depart_leader[$update_dep['wx_depid']]);
                    }else{
                        $this->update_deps[$k]['leader'] = '';
                    }
                }
                //var_export($this->update_deps);exit;
                db::table('a_department')->insertAll($this->update_deps,true);
            }
            
            //可见范围没选部门，默认插进一条部门：默认部门，id为99999
            if(db('a_user')->where('department',99999)->where('soft_delete',1)->count()){
                $data['id'] = 99999;
                $data['wxwork_depart_id'] = 99999;
                $data['depart_name'] = "非部门成员";
                $data['parent_id'] = 1;
                $data['list_order'] = 1000000;
                $data['soft_delete'] = 1;
                $d_info = db('a_department')->where('id',99999)->find();

                if($d_info){ //已有这个默认部门，直接更新
                    db('a_department')->where('id',99999)->update($data);
                }else{ //没有这个默认部门，直接插入
                    db('a_department')->insert($data);
                }
            }else{
                db('a_department')->where('id',99999)->update(['soft_delete'=>time()]);
            }
            $this->synchronization_wxwork_tags();
            db("a_user")->where('id',1)->update(['soft_delete'=>1]);//超级账号，特殊处理
            Db::commit(); 
            return json(['code'=>1,'msg'=>'同步成功']);
        }catch (Exception $e){
            Db::rollback();
            echo (string)$e;
            trace('同步失败,错误：'.$e->getMessage(),'error');
            return json(['code'=>0,'msg'=>'同步失败,错误：'.$e->getMessage()]);
        }
    }

    //同步部门及部门的所有下级部门
    private function sync_dep($dep_count,$dep_id,WxApi $wx_class,$access_token){
        static $hasDeps;
        if( $hasDeps == null ){
            $hasDeps = [];
            $tmpDeps = db::table('a_department')->select();
            foreach( $tmpDeps as $tmpDep ){
                $hasDeps[$tmpDep['wx_depid']] = $tmpDep;
            }
        }
        $deplist = $wx_class->get_depList($access_token,$dep_id);
        //var_dump($deplist);exit;
        if(isset($deplist['code'])&&$deplist['code']==0){
            return $deplist;
        }
        $updateDeps = [];
        $addDeps = [];
        foreach ($deplist as $dep){
            $data = array();
            $data['id'] = $dep['id'];
            $data['wx_depid'] = $dep['id'];
            $data['dep_name'] = $dep['name'];
            $data['parentid'] = $dep['parentid'];
            $data['list_order'] = $dep['order'];
            $data['soft_delete'] = 1;
            if( isset($hasDeps[$dep['id']]) ){
                $d_info = $hasDeps[$dep['id']];
            }else{
                $d_info = null;
                $hasDeps[$dep['id']] = $data;
            }
            //$d_info = db('a_department')->where('id',$dep['id'])->find();

            if($d_info){
                if($d_info['soft_delete']!=1 && $dep_id == $dep['id']){
                    $data['parentid'] = 0;
                }
                $this->update_deps[] = $data;
            }
            else{
                if($dep_id == $dep['id']){
                    //还未插入，但是是应用的顶级可见，设置顶级部门
                    $data['parentid'] = 0;
                }
                $this->add_deps[] = $data;
            }
        }
        return ['code'=>1,'msg'=>'ok'];
    }

    //同步单个用户
    private function sync_user($userid,WxApi $wx_class,$access_token,$admin_list,$super_admin_list){
        $user = $wx_class->read_user($access_token,$userid);
        if(isset($user['code'])&&$user['code']==0){
            return $user;
        }
        $this->add_update_user($user,$admin_list,$super_admin_list);
        return ['code'=>1];
    }

    //同步部门下成员
    private function sync_dep_user($dep_id,WxApi $wx_class,$access_token,$admin_list,$super_admin_list){
        $userList = $wx_class->get_dep_userList($access_token,$dep_id);
        if(isset($userList['code'])&&$userList['code']==0){
            return $userList;
        }
        $dep_user_arr = [];
        foreach ($userList as $user){
            $this->add_update_user($user,$admin_list,$super_admin_list);
        }
        return ['code'=>1];
    }

    //同步标签下成员
    private function sync_tag_user($tag_id,WxApi $wx_class,$access_token,$admin_list,$super_admin_list){
        $userList = $wx_class->get_dep_userList($access_token,$tag_id);
        if(isset($userList['code'])&&$userList['code']==0){
            return $userList;
        }
        $dep_user_arr = [];
        foreach ($userList as $user){
            $this->sync_user($user['userid'],$admin_list,$super_admin_list);
        }
        return ['code'=>1];
    }

    private function  add_update_user($user,$admin_list,$super_admin_list){
        //已有的用户
        static $hasUsers;
        //查询全部用户
        if( $hasUsers == null ){
            $hasUsers = [];
            $tmpUsers = db::table('a_user')->select();
            foreach( $tmpUsers as $hasUser ){
                $hasUsers[$hasUser['userid']] = $hasUser;
            }
        }
        //修改私有化版本的头像路径
        if(isset($user["avatar"]) && strpos($user['avatar'],'wwlocal.qq.com')){
            $user['avatar'] = str_replace('http://wwlocal.qq.com/',WX_DOMAIN,$user['avatar']);
            $user['avatar'] =  str_replace('png/0','png',$user['avatar']);
        }
        //如果组织架构没有部门.则添加到默认部门
        if($user["department"] == "") $user['department'] = [99999];

        //组装数据
        $data = array(
            'userid'=>$user['userid'],
            'user_login'=>$user['userid'],
            //userid作为密码不安全
            'user_pass'=>password($user['userid']),
//            'user_pass'=>password( uniqid() ),
            'name'=> utf8mb4_filter($user['name']),
            'department'=>isset($user['department'])?implode(',',$user['department']):"",
            'position'=>$user['position'],
            'mobile'=>$user['mobile'],
            'email'=>$user['email'],
            'gender'=>$user['gender'],
            'avatar'=>!empty($user['avatar'])?$user['avatar']:ADMIN_DOMIN."/static/images/headicon.png",
            'telephone'=>$user['telephone'],
            'is_leader_in_dept'=>isset($user['is_leader_in_dept'])?implode(',',$user['is_leader_in_dept']):"",
            'enable'=>$user['enable'],
            'status'=>$user['status'],
            'qr_code'=>$user['qr_code'],
            'external_position'=>isset($user['external_position'])?$user['external_position']:'',
            'address'=>isset($user['address'])?$user['address']:'',
            'soft_delete'=>1,
        );
        if( isset( $hasUsers[$user['userid']]['id']) ){
            $id = $hasUsers[$user['userid']]['id'];
        }else{
            $id = null;
            $hasUsers[$data['userid']] = $data;
        }
        if($id){
            $data["id"] = $id;
            //更新不需要密码
            unset($data['user_pass']);
            $data = array_merge( $data,$hasUsers[$data['userid']] );
            $data['soft_delete'] = 1;
            $this->update_user_array[] = $data;
        }
        else{
            if(in_array($user["userid"],$super_admin_list)) $data["u_roles"] = 1;
            else if(in_array($user["userid"],$admin_list)) $data["u_roles"] = 1;
            else $data["u_roles"] ="";
            $data["userid"] = $user['userid'];
//            $data["user_pass"] = password( uniqid() );
            $data["user_pass"] = password($user['userid']);
            if( !isset( $this->add_user_array[$data['userid']] ) ){
                $this->add_user_array[$data['userid']] = $data;
            }
        }
        if(isset($user["department"]) && is_array($user["department"])){
            $is_leader_in_depts = explode(',',$data['is_leader_in_dept']);
            foreach ($user["department"] as $kd => $vd) {
                if( !isset($this->depart_leader[$vd]) ){
                    $this->depart_leader[$vd] = [];
                }
                if( isset($is_leader_in_depts[$kd]) && $is_leader_in_depts[$kd] == 1){ //是主管
                    $this->depart_leader[$vd][] = $data["userid"];
                }
            }
        }
        return true;
    }

    private function  add_update_user_patch($user_arr){
        $update_arr = [];$insert_arr = [];$i = $j = 0;
        // dump($user_arr);
        foreach ($user_arr as $key => $user) {
            //修改私有化版本的头像路径
            if(isset($user["avatar"]) && strpos($user['avatar'],'wwlocal.qq.com')){
                $user['avatar'] = str_replace('http://wwlocal.qq.com/',WX_DOMAIN,$user['avatar']);
                $user['avatar'] =  str_replace('png/0','png',$user['avatar']);
            }

            //组装数据，一个是需要更新的数据，另一个是需要插入的数据
            $id = db('a_user')->where('userid',$user['userid'])->value('id');
            if($id){ //需要更新的数据
                $update_arr[$i]['id'] = $id;
                $update_arr[$i]['userid'] = $user['userid'];
                $update_arr[$i]['user_login'] = $user['userid'];
                $update_arr[$i]['user_pass'] = password($user['userid']);
                $update_arr[$i]['name'] = $user['name'];
                $update_arr[$i]['department'] = implode(',',$user['department']);
                $update_arr[$i]['position'] = $user['position'];
                $update_arr[$i]['mobile'] = $user['mobile'];
                $update_arr[$i]['email'] = $user['email'];
                $update_arr[$i]['gender'] = $user['gender'];
                $update_arr[$i]['avatar'] = !empty($user['avatar'])?$user['avatar']:ADMIN_DOMIN."/static/images/headicon.png";
                $update_arr[$i]['telephone'] = $user['telephone'];
                $update_arr[$i]['enable'] = $user['enable'];
                $update_arr[$i]['status'] = $user['status'];
                $update_arr[$i]['qr_code'] = $user['qr_code'];
                $update_arr[$i]['external_position'] = isset($user['external_position'])?$user['external_position']:'';
                $update_arr[$i]['address'] = isset($user['address'])?$user['address']:'';
                $update_arr[$i]['soft_delete'] = 1;
                $i ++;
            }else{
                $insert_arr[$j]['userid'] = $user['userid'];
                $insert_arr[$j]['user_login'] = $user['userid'];
                $insert_arr[$j]['user_pass'] = password($user['userid']);
                $insert_arr[$j]['user_pass'] = password(uniqid());
                $insert_arr[$j]['name'] = $user['name'];
                $insert_arr[$j]['department'] = implode(',',$user['department']);
                $insert_arr[$j]['position'] = $user['position'];
                $insert_arr[$j]['mobile'] = $user['mobile'];
                $insert_arr[$j]['email'] = $user['email'];
                $insert_arr[$j]['gender'] = $user['gender'];
                $insert_arr[$j]['avatar'] = !empty($user['avatar'])?$user['avatar']:ADMIN_DOMIN."/static/images/headicon.png";
                $insert_arr[$j]['telephone'] = $user['telephone'];
                $insert_arr[$j]['enable'] = $user['enable'];
                $insert_arr[$j]['status'] = $user['status'];
                $insert_arr[$j]['qr_code'] = $user['qr_code'];
                $insert_arr[$j]['external_position'] = isset($user['external_position'])?$user['external_position']:'';
                $insert_arr[$j]['address'] = isset($user['address'])?$user['address']:'';
                $insert_arr[$j]['soft_delete'] = 1;
                $j ++; 
            }
        }
        // var_dump($update_arr);exit;
        $AUser = new AUser;
        $AUser->isUpdate()->saveAll($update_arr);
        Db::name('a_user')->insertAll($insert_arr);
    }

    /**同步标签**/
    public function synchronization_wxwork_tags(){
        set_time_limit(0);
        $settings = get_option();
        if(empty($settings)){
            return json(['code'=>0,'msg'=>'请先设置微信相关信息']);
        }
        $access_token = get_wx_token();
        if(empty($access_token)){
            return json(['code'=>0,'msg'=>'token获取失败']);
        }

        $wx_tags = new WxTags();
        $tags_list = $wx_tags->getList($access_token);
        if(isset($tags_list['code'])&&$tags_list['code']<1){
            return json($tags_list);
        }
        //**同步标签**//
        Db::startTrans();
        try{
            //1.禁用所有标签，清空用户与部门的标签
            $tags_model = new ATags();
            $tags_model->banAllTags();
            $user_model = new AUser();
            $user_model->emptyTags();
            $dep_model = new ADepartment();
            $dep_model->emptyTags();
            //2.同步标签
            foreach ($tags_list as $tag){
                $tag_data = array(
                    'id' =>$tag['tagid'],
                    'tagid'=>$tag['tagid'],
                    'tag_name'=>$tag['tagname'],
                    'status'=>1,
                );
                if($tags_model->exist($tag['tagid'])){
                    unset($tag_data['id']);
                    $tag_data['update_time'] = time();
                    //3-1.已存在的标签更新
                    $tags_model->update($tag_data,['id'=>$tag['tagid']]);
                }
                else{
                    //3-2.不存在，插入
                    $tags_model->isUpdate(false)->save($tag_data);
                }
                //4.同步用户
                $res = $this->syn_user($access_token,$tag['tagid'],$wx_tags);
                if(isset($res['code']) && $res['code']<1){
                    Db::rollback();
                    return json(['code'=>0,'msg'=>'同步失败']);
                }
            }
            Db::commit();
            return json(['code'=>1,'msg'=>'同步成功']);
       }catch (\Exception $e){
           Db::rollback();
           return $this->error('同步失败:'.$e->getMessage());
       }
    }

    //同步用户标签
    public function syn_user($access_token,$tag_id,$wx_tags =''){
        if(empty($wx_tags)){
            $wx_tags = new WxTags();
        }
        $user_data = $wx_tags->getMemberList($access_token,$tag_id);
        if(isset($user_data['code'])&&$user_data['code']<1){
            return $user_data;
        }
        //1.同步用户标签
        if(is_array($user_data['userlist'])&&count($user_data['userlist'])>0){
            $user_model = new AUser();
            foreach ($user_data['userlist'] as $user){
                $user_model->addTags($user['userid'],$tag_id);
            }
        }
        //2.同步部门标签
        if(is_array($user_data['partylist'])&&count($user_data['partylist'])>0){
            $dep_model = new ADepartment();
            foreach ($user_data['partylist'] as $dep){
                $dep_model->addTags($dep,$tag_id);
            }
        }
        return ['code'=>1,'msg'=>'ok'];
    }




}