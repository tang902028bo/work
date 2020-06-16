<?php


namespace app\api\service;


use http\Message\Body;
use think\Db;

class ApprovalService
{

    //最后一级审批人通过审批
    public function passApproval($approval_id)
    {
        $approvalInfo = Db::name('dc_approval_car')->where('id', $approval_id)->where('status', 0)->find();
        if ($approvalInfo) {
            $department = Db::name('a_approval_role a')
                ->field("e.id")
                ->join('a_department e', 'a.department=e.id and e.soft_delete = 1', 'left')
                ->select();
            $department = array_column($department, 'id');
            Db::startTrans();
            $r1 = Db::name('dc_approval_car')->where('id', $approval_id)->update(['status' => 1]);
            $todayApproval = $this->getApprovalCheckInfo($approval_id);
            $r2 = false;
            foreach ($todayApproval as $key => $value) {
                $jsonApproval = json_encode($value);
                $r2 = Db::name('a_approval_deal_log')->insert([
                    'approval_id' => $approval_id,
                    'order' => $key + 1,
                    'department' => $department[$key],
                    'user_approval' => $jsonApproval,
                ]);
                if (!$r2) {
                    Db::rollback();
                    return false;
                }
            }
            //发送消息到用户
            if ($r1 && $r2) {
                Db::commit();
                return true;
            } else {
                Db::rollback();
                return false;
            }
        }
        return false;

    }

    public function failApproval($a_id)
    {
        return Db::name('dc_approval_car')->where('id',$a_id)->update(['status'=>2]);
    }

    /**
     * @param $a_id int 审批id
     * @param $is_ok int 是否已完成(已完成查询审批表历史记录的所有用户)
     */
    public function getApprovalCarInfo($a_id)
    {
        //如果是正在审批中
        $approvalInfo = Db::name('dc_approval_car')
            ->where('id', $a_id)
            ->find();
        if ($approvalInfo) {
            $status = $approvalInfo['status'];
            if ($status) {
                //已完成的审批,获取当时审批时的审批信息
                $oldApprovalList = Db::name('a_approval_deal_log g')
                    ->field("g.order,t.dep_name,user_approval")
                    ->join('a_department t', 't.id=g.department', 'left')
                    ->where('approval_id', $a_id)
                    ->order('order', 'asc')
                    ->select();
                if ($oldApprovalList) {
                    //循环审批信息的用户信息
                    $approvalList = [];
                    foreach ($oldApprovalList as $key => $oldApproval) {
                        $approval = json_decode($oldApproval['user_approval'], true);
                        foreach ($approval as $keys => $value) {
                            $approvalList[$key][] = ['dep_name' => $oldApproval['dep_name'], 'name' => $value['name'], 'status' => $value['status']];
                        }
                    }
                    $approvalInfo['approvalList'] = $approvalList;
                    return $approvalInfo;
                }
            } else {
                $approvalInfo['approvalList'] = $this->getApprovalCheckInfo($a_id);
                return $approvalInfo;
            }
        }
        //流程错误,未找到订单
        return false;
    }

    /** 获取今天此审批的审批人信息
     * @param $a_id int
     */
    public function getApprovalCheckInfo($a_id)
    {
        $roleList = Db::name('a_approval_role r')
            ->field("t.dep_name,u.name,
                    case when g.status=1 then '通过' when g.status=2 then '驳回' else '' end status,r.order
                     ")
            ->join('a_user u', "find_in_set(u.userid,r.all_userid)")
            ->join('a_department t', 't.id=r.department', 'left')
            ->join('dc_approval_log g', "g.userid=u.userid and g.order=r.order and g.a_id= $a_id", 'left')
            ->order('r.order', 'asc')
            ->select();
        $approvalList = [];
        $arr = [];
        foreach ($roleList as $k => $role) {
            $arr[$role['order']][] = ['dep_name' => $role['dep_name'], 'name' => $role['name'], 'status' => $role['status']];

        }
        foreach ($arr as $v) {
            $approvalList[] = $v;
        }
        return $approvalList;
    }

    //获取到当前用户是否可以查看此审核
    public function getUserCanSee()
    {

    }


    //获取到当前用户是否可以审批
    public function getUserCanApproval($a_id, $userid)
    {
        $return = ['have' => false, 'check' => false, 'order' => 0];
        //用户的审核权限
        $orderSelect = Db::name('a_approval_role')
            ->where("find_in_set('$userid',all_userid)")
            ->select();
        if (!empty($orderSelect)) {
            $return['have'] = true;
            //获取审批走到第几个流程
            $return['order'] = $this->getApprovalOrderNow($a_id);
            if ($return['order']) {
                $userOrderList = array_column($orderSelect, 'order');
                //用户有此权限
                if (in_array($return['order'], $userOrderList)) {
                    $check = true;
                    $userCheck = Db::name('dc_approval_log')->where('userid', $userid)
                        ->where('status', 1)
                        ->where('order', $return['order'])
                        ->count();
                    if ($userCheck) {
                        $check = false;
                    }
                    $return['check'] = $check;
                }
            }

        }
        return $return;
    }

    //获取到当前审核走到了第几审批 0已走完 1第一审批 2第二审批
    public function getApprovalOrderNow($a_id)
    {
        $roleList = Db::name('a_approval_role')->order('order')->where('type', '<>', 3)->select();
        //如果审批中有拒绝,审批就已完成
        $res = Db::name('dc_approval_log')
            ->where('a_id', $a_id)
            ->where('status', 2)
            ->count();
        if ($res) {
            return 0;
        }
        foreach ($roleList as $role) {
            $order = $role['order'];
            $allRoleUserid = explode(',', $role['all_userid']);
            //会签
            if ($role['type'] == 1) {
                $allApporvalList = Db::name('dc_approval_log')
                    ->field(['userid'])
                    ->where('a_id', $a_id)
                    ->where('order', $order)
                    ->where('status', 1)
                    ->select();
                $allCheckUserid = array_column($allApporvalList, 'userid');
                foreach ($allCheckUserid as $checkUserid) {
                    $roleKey = array_search($checkUserid, $allRoleUserid);
                    if ($roleKey!==false) {
                        unset($allRoleUserid[$roleKey]);
                    }
                }
                if (!empty($allRoleUserid)) {
                    return $order;
                }
            } else {
                //或签
                $isApproval = Db::name('dc_approval_log')
                    ->where('a_id', $a_id)
                    ->where('order', $order)
                    ->where('status', 1)
                    ->count();
                if (!$isApproval) {
                    return $order;
                }
            }
        }
        return 0;
    }

    //判断当前审核是否为最后一次审核
    //$order为当前审核走到哪步了
    public function checkApprovalIsEnd($a_id, $order)
    {
        //1 会签 2或签
        $endRole = Db::name('a_approval_role')->order('order', 'desc')->find();
        if ($endRole['order'] == $order) {
            if ($endRole['type'] == 1) {
                $allEndRoleCheck = Db::name('dc_approval_log')
                    ->field('userid')
                    ->where('a_id', $a_id)
                    ->where('order', $order)
                    ->select();
                $all_userid = $endRole['all_userid'];
                $all_userid_arr = explode(',',$all_userid);
                foreach ($allEndRoleCheck as $endRoleCheck){
                    $k = array_search($endRoleCheck['userid'],$all_userid_arr);
                        if ($k !== false){
                            unset($all_userid_arr[$k]);
                        }
                }
                if (empty($all_userid_arr)){
                    return true;
                }
            }else{
                $res = Db::name('ac_approval_log')
                    ->where('a_id',$a_id)
                    ->where('order',$order)
                    ->count();
                if ($res){
                    return true;
                }
            }
        }
        return false;


    }


}