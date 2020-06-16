<?php
namespace app\api\controller;
use app\api\service\ApprovalService;
use app\api\service\LibService;
use app\ApiBaseController;
use function Sodium\crypto_aead_aes256gcm_decrypt;
use think\Db;

class ApprovalCar extends ApiBaseController
{
    protected $approvalService;
    protected $libService;
    public function __construct()
    {
        parent::__construct();
        $this->approvalService = new ApprovalService();
        $this->libService = new LibService();
    }
    /*用车*/
    public function getApprovalCarList()
    {
        $page = empty(input('page')) ? 1 : input('page');
        $size = empty(input('pagesize')) ? 10: input('pagesize');
        $limit=(($page - 1) * $size) . "," . $size;
        // 1待审批 2已处理 3用车中 4用车结束
        $status =input('status', '1');
        $where='1=1';
        if($status==2){
            $where.=' and ((a.status=1 and a.car_use_status=1) or (a.status in(2,3,4)))';
        }elseif($status==3){
            $where.=' and (a.status=1 and a.car_use_status in(2,3))';
        }elseif($status==4){
            $where.=' and (a.status=1 and a.car_use_status=4)';
        }else{
            $where.=' and a.status=0';
        }
        $count=db('dc_approval_car a')
            ->join('a_user b', 'a.userid = b.userid')
            ->join('dc_approval_log c', 'a.id = c.approval_id','left')
            ->where('a.soft_delete=1 and a.userid="'.session('wx_user')['userid'].'"')
            ->where($where)
            ->count();
        $useCarList=db('dc_approval_car a')
            ->field("a.id,b.name user_name,a.start_time,a.cause,a.createtime,a.status,a.car_use_status,c.create_time")
            ->join('a_user b', 'a.userid = b.userid')
            ->join('dc_approval_log c', 'a.id = c.approval_id','left')
            ->where('a.soft_delete=1 and a.userid="'.session('wx_user')['userid'].'"')
            ->where($where)
            ->group('id')
            ->order('c.create_time desc,a.createtime desc')
            ->limit($limit)
            ->select();
        returnMsg(200,'',[
            'list'=>$useCarList,
            'count'=>$count,
            'limit'=>$size
        ]);
    }
    /*用车详情*/
    public function getApprovalCarInfo()
    {
        //获取详情
        $id =input('id', 0);
        $type =input('type', 1);
        $where=($type==1)?'a.userid="'.session('wx_user')['userid'].'"':'';
        if ($id) {
            $info = db('dc_approval_car a')
                ->field("a.driver_id,a.type,a.travel_mileage,a.car_type_id,a.copyer_id,a.soft_delete,a.approval_sn,a.have_driver,a.date_type,a.mobile,a.id,a.from_address,a.to_address,a.all_userid,a.department_id,b.department,b.avatar,b.name user_name,a.start_time,a.cause,a.createtime,a.status,a.car_use_status,d.name as type_name")
                ->join('a_user b', 'a.userid = b.userid')
                ->join('dc_car_type d', 'a.car_type_id = d.id and d.soft_delete=1', 'left')
                ->where(['a.soft_delete' => 1, 'a.id' => $id])
                ->where($where)
                ->find();
            if(empty($info)){
                returnMsg(100,'参数id不正确！');
            }
            $copyer_id=(empty($info['copyer_id']))?[]:explode(',',$info['copyer_id']);
            $info['copyer_user']=db('a_user')->field('id,name,avatar')->whereIn('userid',$copyer_id)->select();

            $driver=db('dc_driver')->field('realname')->whereIn('userid',$info['driver_id'])->select();
            $info['driver_name']=arrayToString($driver);

            $department=db('a_department')->field('dep_name')->where('id in ('.$info['department'].')')->select();
            $info['department_name']=arrayToString($department);
            //审批流程
            $progress=db('dc_approval_progress')->where(['approval_id'=>$id])->value('progress');
            $info['progress']=(in_array($info['status'],[1,2,3,4]))?json_decode($progress):approval_progress($id,$info);
            $info['is_can_deal']=(in_array($info['status'],[1,2,4]))?0:isCanDeal($id);//是否有权限
            $info['is_first']=isFirst($id);
            $info['log_cause']=db('dc_approval_log')->where(['approval_id'=>$id,'status'=>$info['status']])->value('cause');
            $info['approval_order']=approvalOrder($id);
            returnMsg(200,'',$info);
        }else{
            returnMsg(100,'参数id不正确！');
        }
    }
    /*审批首页*/
    public function getApprovalList(){
        $type=(empty(input('type')))?1:input('type');
        $page = empty(input('page')) ? 1 : input('page');
        $size = empty(input('pagesize')) ? 10: input('pagesize');
        $limit=(($page - 1) * $size) . "," . $size;
        $user=db('a_user')->where('userid="'.session('wx_user')['userid'].'"')->find();
        $list=[];
        /*未审批*/
        if($type==1){
            $setting_info = db('dc_approval_setting')->field('id,role_id,approver_type,approver_order,type,date_type')->where(['soft_delete' => 1])->order('approver_order asc')->select();
            $setting_info_work = db('dc_approval_setting')->field('role_id,approver_type,approver_order,type,date_type')->where(['soft_delete' => 1,'date_type'=>1])->order('approver_order asc')->select();
            $setting_info_holiday= db('dc_approval_setting')->field('role_id,approver_type,approver_order,type,date_type')->where(['soft_delete' => 1,'date_type'=>2])->order('approver_order asc')->select();
            $is_leader_department=is_leader_department($user);//是领导的部门
            $role_user_arr_work=user_roles($setting_info_work);//用户是审批角色的层级-工作日
            $role_user_arr_holiday=user_roles($setting_info_holiday);//用户是审批角色的层级-节假日
            $approval_car_role=[];
            $approval_car_upper=[];
            foreach ($setting_info as $k => $v) {
                $role_user_arr=($v['date_type']==1)?$role_user_arr_work:$role_user_arr_holiday;
                $user_role_id=session('wx_user')['u_roles'];
                $upper=[];
                $role=[];
                //上级主管
                if ($v['approver_type'] == 1) {
                    if(!empty($is_leader_department)){
                        $upper=db('dc_approval_car a')
                            ->field("a.id,b.name user_name,a.start_time,a.cause,a.createtime,a.status,a.car_use_status")
                            ->join('a_user b', 'b.userid = a.userid and b.department in ('.$is_leader_department.')')
                            ->where('a.status=0 and a.date_type='.$v['date_type'])
                            ->select();
                    }
                    foreach ($upper as $kk=>$vv){
                        if($v['type']==1){
                            //会签（判断当前层级该用户是否处理过）
                            $is_have=db('dc_approval_log')->where(['approver_id'=>$user['userid'],'order'=>$v['approver_order'],'approver_type'=>1,'approval_id'=>$vv['id']])->find();
                        }else{
                            //或签（判断当前层级是否对应上级主管处理过）
                            $is_have=db('dc_approval_log')->where(['order'=>$v['approver_order'],'approver_type'=>1,'approval_id'=>$vv['id']])->find();
                        }
                        $max=db('dc_approval_log')->where(['approval_id'=>$vv['id']])->max('order');
                        $is_have=($max==($v['approver_order']-1) && empty($is_have) && $max)?0:$is_have;
                        if(!empty($is_have)){
                            unset($upper[$kk]);
                        }
                    }
                    if($upper){
                        $approval_car_upper=array_merge($approval_car_upper,$upper);
                    }
                }
                //角色
                if ($v['approver_type'] == 2 && !empty($role_user_arr)) {
                    $role_id=explode(',',$v['role_id']);
                    if(in_array($user_role_id,$role_id)){
                        $role=db('dc_approval_car a')
                            ->field("a.id,b.name user_name,a.start_time,a.cause,a.createtime,a.status,a.car_use_status")
                            ->join('a_user b', 'b.userid = a.userid')
                            ->where('a.status=0 and a.date_type='.$v['date_type'])
                            ->select();
                        foreach ($role as $kk=>$vv){
                            if($v['type']==1){
                                //会签（判断当前层级该用户是否处理过）
                                $is_have=db('dc_approval_log')->where('approver_id="'.$user['userid'].'" and role_id in('.$v['role_id'].') and approver_type=2 and approval_id='.$vv['id'])->where(['order'=>$v['approver_order']])->find();
                            }else{
                                //或签（判断当前层级是否对应角色处理过）
                                $is_have=db('dc_approval_log')->where('role_id in('.$v['role_id'].') and approver_type=2 and approval_id='.$vv['id'])->where(['order'=>$v['approver_order']])->find();
                            }
                            $is_have=(!empty($is_have))?1:$is_have;
                            if(!empty($is_have)){
                                unset($role[$kk]);
                            }
                        }
                        if($role){
                            $approval_car_role=array_merge($approval_car_role,$role);
                        }
                    }
                }
            }
            $approval_car_merge=array_merge($approval_car_role,$approval_car_upper);//合并
            $approval_car_repeat=second_array_unique_bykey($approval_car_merge,'id');//去重
            $approval_car_list=array_sort($approval_car_repeat,'id');//排序
            if($approval_car_list!=null){
                $list=array_slice($approval_car_list, $size*($page-1),$size);
            }
            $count=count($approval_car_list);
        }else{
            /*已处理*/
            $count=db('dc_approval_log a')
                ->join('dc_approval_car b', 'b.id = a.approval_id')
                ->join('a_user c', 'b.userid = c.userid')
                ->where('b.soft_delete=1 and a.approver_id="'.session('wx_user')['userid'].'" and a.status not in(3,4)')
                ->group('b.id')
                ->count();
            $list=db('dc_approval_log a')
                ->field("b.id,c.name user_name,b.start_time,b.cause,b.createtime,b.status,b.car_use_status")
                ->join('dc_approval_car b', 'b.id = a.approval_id')
                ->join('a_user c', 'b.userid = c.userid')
                ->where('b.soft_delete=1 and a.approver_id="'.session('wx_user')['userid'].'" and a.status not in(3,4)')
                ->group('b.id')
                ->order('a.create_time desc')
                ->limit($limit)
                ->select();
        }
        returnMsg(200,'',[
            'list'=>$list,
            'count'=>$count,
            'limit'=>$size
        ]);
    }
    /*审批操作*/
    public function checkApproval()
    {
        $approval_id = input('approval_id');
        //1同意 2拒绝
        $status = (empty(input('status')))?1:input('status');
        $cause=(empty(input('cause')))?'':input('cause');
        $driver_id=input('driver_id');
        $car_id=input('car_id');
        $is_can_deal=isCanDeal($approval_id);//该用户是否可以操作
        $islast=islast($approval_id);//操作审批人层级是否为最后层级最后一个操作的
        $islasttwo=isLastTwo($approval_id); //当前用户层级是否最倒数第二级、下一级为上级主管并为空
        $isfirst=isFirst($approval_id);
        $isOrderLast=isOrderLast($approval_id);//是否是当前层级最后一个
        $approverorder=approverOrder($approval_id);//当前审批人所属层级
        $next_is_null=nextIsNull($approverorder,$approval_id);
        $approval_info = db('dc_approval_car a')
            ->field('a.*,b.name')
            ->join('a_user b', 'a.userid = b.userid')
            ->where(['a.soft_delete' => 1,'a.id'=>$approval_id,'a.status'=>0])
            ->find();
        $max_order=db('dc_approval_setting')->where(['soft_delete'=>1,'date_type'=>$approval_info['date_type']])->order('approver_order desc')->value('approver_order');
        $setinfo=db('dc_approval_setting')->where(['approver_order'=>$approverorder,'soft_delete'=>1,'date_type'=>$approval_info['date_type']])->find();
        if(empty($approval_info)){
            returnMsg(100,'参数approval_id错误！');
        }
        if($is_can_deal!=1){
            returnMsg(100,'没有权限操作');
        }
        if($status==1 && $isfirst==1 && (!$car_id || (!$driver_id && $approval_info['have_driver']==1))){
            $msg='';
            $msg.=(!$car_id)?'car_id':'';
            $msg.=(!$driver_id)?'|driver_id':'';
            returnMsg(100,'参数'.$msg.'错误');
        }
        if($car_id && $driver_id){
            if($approval_info['car_id'] || $approval_info['driver_id']){
                returnMsg(100,'该审批车辆/司机已被指派！');
            }
            $car=db('dc_car')->field('car_number')->where(['soft_delete'=>1,'status'=>1,'car_status'=>0])->whereIn('id',$car_id)->select();
            $driver=db('dc_driver')->where('soft_delete=1 and status=0')->whereIn('userid',$driver_id)->select();
            if(empty($car)){
                returnMsg(100,'使用中/车辆不存在！');
            }
            if(empty($driver)){
                returnMsg(100,'未空闲/司机不存在！');
            }
        }
        $user_info=db('a_user')->where(['userid'=>session('wx_user')['userid']])->find();
        $role_id=($setinfo['approver_type']==2)?$user_info['u_roles']:0;
        $is_last=($setinfo['type']==2 || $status==2 || $islast == 1)?1:0;
        $result = db('dc_approval_log')->insert(['approval_id'=>$approval_id, 'approver_id'=>session('wx_user')['userid'],'approver_name'=>session('wx_user')['name'],
            'role_id'=>$role_id,'approver_type' => $setinfo['approver_type'],'order' => $approverorder, 'status' => $status,'cause'=>$cause,'is_order_last'=>$isOrderLast,'is_last'=>$is_last,'create_time' => time()]);
        if($result!==false){
            //是否是第一个审批
            if($isfirst==1 && $status!=2){
                $car_number=arrayToString($car);
                db('dc_approval_car')->where(['id'=>$approval_id])->update(['car_id'=>$car_id,'driver_id'=>$driver_id,'car_number'=>$car_number]);
                db('dc_car')->whereIn('id',$car_id)->update(['car_status' => 1]);
                db('dc_driver')->whereIn('userid',$driver_id)->update(['status' => 1]);
            }
            //下一级是否是上级并为空
            if($next_is_null==1 && $islasttwo==1 && $status!=2){
                $max_order=db('dc_approval_setting')->where('soft_delete=1 and date_type='.$approval_info['date_type'])->max('approver_order');
                $is_last=($max_order==($approverorder+1))?1:0;
                db('dc_approval_log')->insert(['approval_id'=>$approval_id, 'approver_id'=>0,'approver_name'=>'',
                    'role_id'=>'','approver_type' => 1,'order' => $approverorder+1, 'status' => $status,'cause'=>$cause,'is_order_last'=>1,'is_last'=>$is_last,'create_time' => time()]);
            }
            //是否最后一步最后一个审批(会签/或签)
            if(($setinfo['type']==2 &&  $approverorder==$max_order) || $status==2 || $islast == 1 ||$islasttwo==1){//或签
                $res = db('dc_approval_car')->where(['soft_delete' => 1, 'id' => $approval_id])->update(['status' => $status, 'car_use_status' => 1]);
                if ($res !== false) {
                    if ($status != 2) {
                        $caradmin=getCarAdmin();
                        sendMsg(rtrim($caradmin,'|'),$approval_info,4); //调度人/车队主管
                        sendMsg($approval_info['userid'],$approval_info,1);//申请人
                        sendMsg($approval_info['driver_id'],$approval_info,3);//司机
                    }else{
                        if($approval_info['car_id']!=0){
                            db('dc_car')->whereIn('id',$approval_info['car_id'])->update(['car_status' => 0]);
                        }
                        if($approval_info['driver_id']!=0 || !empty($approval_info['driver_id'])){
                            db('dc_driver')->whereIn('userid',$approval_info['driver_id'])->update(['status' => 0]);
                        }
                        sendMsg($approval_info['userid'],$approval_info,1,$status);//申请人
                    }
                    //车辆信息
                    $car_info=noticeCarInfo($approval_id);
                    //审批流程
                    $is_check=($islasttwo==1 && $status!=2)?1:0;
                    $progress=approval_progress($approval_id,$approval_info,$is_check);
                    db('dc_approval_progress')->insert(['approval_id'=>$approval_id,'progress'=>json_encode($progress),'car_info'=>json_encode($car_info),'status'=>$status,'create_time'=>time()]);
                }
            }
            returnMsg(200, '审核成功');
        }else{
            returnMsg(100,'审核失败');
        }
    }
    //提交审批
    public function addApproval()
    {
        //科室
        $department_id = _POST('department_id');
        //车辆类型
        $car_type_id = _POST('car_type_id');
        //车辆类型名
        $type_name=db('dc_car_type')->field('name')->whereIn('id',$car_type_id)->select();
        $car_type_name=arrayToString($type_name);
        //开始时间
        $start_time = strtotime(_POST('start_time'));
        //是否需要司机
        $have_driver = _POST('have_driver', '1|2', 1);
        //乘车人员
        $all_userid = input('all_userid');
        //出发地
        $from_address = input('from_address');
        //目的地
        $to_address = input('to_address');
        //联系电话
        $mobile = input('mobile');
        //用车事由
        $cause = input('cause');
        //1普通用户审批 2车队直接审批
        $type = _POST('type', '1|2', 1);
        $userid=($type==1)?session('wx_user')['userid']:input('userid');
        $copyer_id = (empty(input('copyer_id')))?'':input('copyer_id');
        //出行里程
        $travel_mileage = input('travel_mileage');
        $driver_id=(empty(input('driver_id')))?0:input('driver_id');
        $car_id=input('car_id');
        $date_type=(isHoliday($start_time)==0)?1:2;
        $setting_info = db('dc_approval_setting')->where(['soft_delete' => 1,'date_type'=>$date_type])->select();
        $return = upper_ids($department_id); //上级主管
        $leader_arr_ids= $return['leader_arr_ids'];
        if(count($setting_info)==1 && $setting_info[0]['approver_type']==1 && empty($leader_arr_ids)){
            returnMsg(100,'没有审批人！');
        }
        if ($travel_mileage && $department_id && $start_time && $have_driver  && $from_address && $to_address && $mobile) {
            $data['approval_sn']=date("YmdHis", time()) . rand(100, 999);
            $data['department_id']=$department_id;
            $data['car_type_id']=$car_type_id;
            $data['car_type_name']=$car_type_name;
            $data['start_time']=$start_time;
            $data['have_driver']=$have_driver;
            $data['all_userid']=$all_userid;
            $data['from_address']=$from_address;
            $data['to_address']=$to_address;
            $data['mobile']=$mobile;
            $data['type']=$type;
            $data['cause']=$cause;
            $data['userid']=$userid;
            $data['travel_mileage']=$travel_mileage;
            $data['copyer_id']=$copyer_id;
            $data['date_type']=$date_type;
            $data['createtime']=time();
            if($type==2){
                $car_count=count(explode(',',$car_id));
                $driver_count=count(explode(',',$driver_id));
                $car=db('dc_car')->where(['soft_delete'=>1,'status'=>1,'car_status'=>0])->whereIn('id',$car_id)->count();
                $driver=db('dc_driver')->where(['soft_delete'=>1,'status'=>0])->whereIn('userid',$driver_id)->count();
                if($car!=$car_count){
                    returnMsg(100,'有车辆使用中或不存在！');
                }
                if($driver!=$driver_count && $have_driver==1){
                    returnMsg(100,'有司机指派中或不存在！');
                }
                $data['driver_id']=$driver_id;
                $data['car_id']=$car_id;
                $data['status']=1;
                $data['car_use_status']=1;
            }
            //添加审批表
            $approval_id= Db::name('dc_approval_car')->insertGetId($data);
            if ($approval_id!==false) {
                if($type==1){//普通审批
                    $upper_is_null=upperIsNull($department_id,$date_type);
                    if($upper_is_null){
                        db('dc_approval_log')->insert(['approval_id'=>$approval_id,'approver_id'=>0,'approver_name'=>'','role_id'=>'','approver_type'=>'1','order'=>'1','status'=>'1','is_order_last'=>1,'create_time'=>time()]);
                    }
                }
                if($type==2){
                    db('dc_approval_log')->insert(['approval_id'=>$approval_id,'approver_id'=>session('wx_user')['userid'],
                        'approver_name'=>session('wx_user')['name'],'role_id'=>session('wx_user')['u_roles'],'approver_type'=>'2','order'=>'1','status'=>'1','is_last'=>1,'create_time'=>time()]);
                    db('dc_car')->whereIn('id',$car_id)->update(['car_status'=>1]);
                    if($have_driver==1 && $driver_id!=''){
                        db('dc_driver')->whereIn('userid',$driver_id)->update(['status'=>1]);
                    }
                    $caradmin=getCarAdmin();
                    $approval_info=db('dc_approval_car a')->field('a.*,b.name')->join('a_user b', 'a.userid = b.userid')->where(['a.id'=>$approval_id])->find();
                    sendMsg(rtrim($caradmin,'|'),$approval_info,4); //调度人/车队主管
                    sendMsg($approval_info['userid'],$approval_info,1);//申请人
                    sendMsg($driver_id,$approval_info,3);//司机
                    //车辆信息
                    $car_info=noticeCarInfo($approval_id);
                    //审批流程
                    $progress=approval_progress($approval_id,$approval_info);
                    db('dc_approval_progress')->insert(['approval_id'=>$approval_id,'progress'=>json_encode($progress),'car_info'=>json_encode($car_info),'status'=>1,'create_time'=>time()]);
                }
                returnMsg(200,'添加审批成功');
            } else {
                returnMsg(100,'添加审批失败');
            }
        } else {
            returnMsg(100,'参数错误');
        }
    }
    //撤销审批
    public function revokeApproval()
    {
        $approval_id = _POST('id', 'number');
        $approvalInfo = Db::name('dc_approval_car')->where(['id'=>$approval_id,'userid'=>session('wx_user')['userid']])->where('soft_delete', 1)->find();
        if ($approvalInfo) {
            if ($approvalInfo['status'] != 0) {
                returnMsg(100,'此审批已操作,无法撤销！');
            } else {
                $res = Db::name('dc_approval_car')->where('id', $approval_id)->update(['status' => 3]);
                if ($res) {
                    $approvalInfo = Db::name('dc_approval_car')->where(['id'=>$approval_id])->find();
                    $progress=approval_progress($approval_id,$approvalInfo,1);
                    db('dc_approval_progress')->insert(['approval_id'=>$approval_id,'progress'=>json_encode($progress),'status'=>3,'create_time'=>time()]);
                    //司机和车辆修改状态
                    if($approvalInfo['car_id']!=0){
                        db('dc_car')->whereIn('id',$approvalInfo['car_id'])->update(['car_status' => 0]);
                    }
                    if($approvalInfo['driver_id']!=0 || !empty($approvalInfo['driver_id'])){
                        db('dc_driver')->whereIn('userid',$approvalInfo['driver_id'])->update(['status' => 0]);
                    }
                    db('dc_approval_log')->insert(['approval_id'=>$approval_id, 'approver_id'=>session('wx_user')['userid'],'approver_name'=>session('wx_user')['name'],
                        'status' => 3,'create_time' => time()]);
                    returnMsg(200,'撤销审批成功！');
                } else {
                    returnMsg(100,'撤销审批失败！');
                }
            }
        } else {
            returnMsg(100,'审批未找到！');
        }
    }
    //到达目的地
    public function carArrived(){
        $id=input('id');
        $approval_car=db('dc_approval_car')->where(['id'=>$id,'userid'=>session('wx_user')['userid']])->find();
        if(empty($id) || empty($approval_car)){
            returnMsg(100,'参数id不正确！');
        }
        if($approval_car['status']!=1 || $approval_car['car_use_status']!=2){
            returnMsg(100,'该车辆未在用车中！');
        }
        $re=db('dc_approval_car')->where(['id'=>$id])->update(['car_use_status'=>3,'arrived_time'=>time()]);
        if($re!==false){
            returnMsg(200,'操作成功！');
        }else{
            returnMsg(100,'操作失败！');
        }
    }
    //放弃用车
    public function carGiveup(){
        $id=input('id');
        $cause=empty(input('cause'))?'':input('cause');
        $approval_car=db('dc_approval_car')->where(['id'=>$id,'userid'=>session('wx_user')['userid']])->find();
        if(empty($id) || empty($approval_car)){
            returnMsg(100,'参数id不正确！');
        }
        if($approval_car['status']!=1 || $approval_car['car_use_status']!=1){
            returnMsg(100,'该行程不能取消！');
        }
        $re=db('dc_approval_car')->where(['id'=>$id])->update(['status'=>4,'car_use_status'=>0]);
        if($re!==false){
            db('dc_approval_log')->insert(['approval_id'=>$id,'approver_id'=>session('wx_user')['userid'],
                'approver_name'=>session('wx_user')['name'],'approver_type'=>3,'status'=>4,'cause'=>$cause,'create_time'=>time()]);
            db('dc_car')->whereIn('id',$approval_car['car_id'])->update(['car_status'=>0]);
            if(!empty($approval_car['driver_id'])){
                db('dc_driver')->whereIn('userid',$approval_car['driver_id'])->update(['status'=>0]);
                sendMsg($approval_car['driver_id'],$approval_car,5);//司机
            }
            //审批流程
            $progress=approval_progress($id,$approval_car);
            db('dc_approval_progress')->insert(['approval_id'=>$id,'progress'=>json_encode($progress),'status'=>1,'create_time'=>time()]);
            returnMsg(200,'操作成功！');
        }else{
            returnMsg(100,'操作失败！');
        }
    }
    //催办
    public function urgeApproval(){
        $id=input('id');
        $approval_car=db('dc_approval_car a')
            ->field('a.*,b.name')
            ->join('a_user b', 'a.userid = b.userid')
            ->where(['a.id'=>$id])
            ->find();
        if(!$approval_car){
            returnMsg(100,'审批不存在！');
        }
        if($approval_car['status']!=0){
            returnMsg(100,'该审批已处理！');
        }
        $approval_order=approvalOrder($id);
        $approval_order=($approval_order==0)?$approval_order+1:$approval_order;
        $setinfo=db('dc_approval_setting')->where(['approver_order'=>$approval_order,'soft_delete'=>1,'date_type'=>$approval_car['date_type']])->find();
        $touser='';
        if($setinfo['approver_type']==1){
            $upper_arr_ids=upper_ids($approval_car['department_id'])['leader_arr_ids'];
            foreach ($upper_arr_ids as $k=>$v){
                $log=db('dc_approval_log')->where(['order'=>$approval_order,' approver_id'=>$v,'approver_type'=>1,'approval_id'=>$id])->find();
                if(!$log){
                    $touser.=$v.'|';
                }
            }
        }
        if($setinfo['approver_type']==2){
            $role_id=explode(',',$setinfo['role_id']);
            for($i=0;$i<count($role_id);$i++){
                $role_users=role_users($role_id[$i]);
                if(!empty($role_users)){
                    for($j=0;$j<count($role_users);$j++){
                        $touser.=$role_users[$j]['userid'].'|';
                    }

                }
            }
        }
        if($touser!=''){
            $return=sendMsg(rtrim($touser,'|'),$approval_car,2);
            if($return['code']!=1){
                returnMsg(100,$return['msg']);
            }
        }
        returnMsg(200,'催办成功！');
    }
}