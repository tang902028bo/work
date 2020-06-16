<?php


namespace app\admin\controller;


use app\BaseController;

class SystemSeting extends BaseController
{
    public function paymentInfo(){
        $where['name']=(empty(input('name')))?'WxPay':input('name');
        $payment_setting=db('dc_payment_setting')->field('name,config,is_online')->where($where)->find();
        if(empty($payment_setting)){returnMsg(100,'支付信息不存在！');exit;}
        if($_POST){
            $config=json_decode($payment_setting['config'],true);
            $new_config['mch_id']=(empty(input('mch_id')))?$config['mch_id']:input('mch_id');
            $new_config['api_key']=(empty(input('api_key')))?$config['api_key']:input('api_key');
            $new_config['appid']=(empty(input('appid')))?$config['appid']:input('appid');
            $data['config']=json_encode($new_config);
            $data['is_online']=(empty(input('is_online')))?$payment_setting['is_online']:input('is_online');
            $re=db('dc_payment_setting')->where($where)->update($data);
            if($re!==false){
                returnMsg(200,'设置成功');
            }else{
                returnMsg(100,'设置失败');
            }
            exit;
        }
        returnMsg(200,'',$payment_setting);
    }
    /**
     *审批设置
     */
    public function approval_setting(){
        $return[]=db('dc_approval_setting')->where(['soft_delete'=>1,'date_type'=>1])->select();
        $return[]=db('dc_approval_setting')->where(['soft_delete'=>1,'date_type'=>2])->select();
        for($i=0;$i<count($return);$i++){
            foreach ($return[$i] as $k=>$v){
                if($v['approver_type']==2 && !empty($v['role_id'])){
                    $return[$i][$k]['role_id']=explode(',',$v['role_id']);
                }
            }
        }
        returnMsg(200,'',$return);
    }
    public function  setting(){
        if($_POST){
            //是否存在未审批
            $count=db('dc_approval_car')->where(['soft_delete'=>1,'status'=>0])->count();
            if($count!=0){
                returnMsg(100,'修改失败，还有未审批数据！');
            }
            $day[1]=$_POST['list'];
            $day[2]=$_POST['list1'];
            for($j=1;$j<=count($day);$j++){
                $approval_day=$day[$j];
                for ($i=0;$i<count($approval_day);$i++){
                    if(!empty($approval_day[$i]['role_id'])){
                        $role_id_arr=explode(',',$approval_day[$i]['role_id']);
                        foreach ($role_id_arr as $k=>$v){
                            $user_count=db('a_user')->where('u_roles='.$v)->count();
                            if($user_count==0){
                                $role_name=db('a_role')->where(['id'=>$v])->value('role_name');
                                returnMsg(100,'修改失败，'.$role_name.'没有用户');
                            }
                        }
                    }
                }
                db('dc_approval_setting')->where('1=1 and date_type='.$j)->update(['soft_delete'=>time()]);
                for ($i=0;$i<count($approval_day);$i++){
                    $data['approver_order']=$approval_day[$i]['approver_order'];
                    $data['approver_type']=$approval_day[$i]['approver_type'];
                    $data['role_id']=$approval_day[$i]['role_id'];
                    $data['type']=$approval_day[$i]['type'];
                    $data['update_time']=time();
                    $data['create_time']=time();
                    $data['date_type']=$j;
                    db('dc_approval_setting')->insert($data);
                }
            }

            returnMsg(200,'设置成功');
        }else{
            returnMsg(100,'必须设置至少一级审批');
        }

    }
    /**
     *审批指定人员
     */
    public function get_user_name_id(){
        $where=[];
        if(!empty($_POST['field']) && !empty($_POST['keywords'])){
            $where[] = [$_POST['field'],'like',"%".$_POST['keywords']."%"];
        }
        $users=db('a_user')->field('name,userid,avatar')->where($where)->group('id')->select();
        return json(['code'=>1,'data'=>$users]);
    }
    /**
     *审批角色
     */
    public function get_all_user_role(){
        $roles=db('a_role')->select();
        return json(['code'=>1,'data'=>$roles]);
    }

}