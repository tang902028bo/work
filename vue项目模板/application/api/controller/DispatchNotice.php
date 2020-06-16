<?php
namespace app\api\controller;
use app\ApiBaseController;
class DispatchNotice extends ApiBaseController
{
    public function noticeList(){
        $page = empty(input('page')) ? 1 : input('page');
        $size = empty(input('pagesize')) ? 10: input('pagesize');
        $limit=(($page - 1) * $size) . "," . $size;
        $count=db('dc_send_msg')->where('find_in_set("'.session('wx_user')['userid'].'",userid)')->order('create_time desc')->count();
        $msgList=db('dc_send_msg')->field('approval_id,start_time,cause,name')->where('find_in_set("'.session('wx_user')['userid'].'",userid)')->order('create_time desc')->limit($limit)->select();
        returnMsg(200,'',[
            'list'=>$msgList,
            'count'=>$count,
            'limit'=>$size
        ]);
    }
    public function passCarInfo(){
        $id = input('id');
        $pass_car_info=db('dc_approval_progress')->where(['approval_id'=>$id])->value('car_info');
        returnMsg(200,'',json_decode($pass_car_info,true));
    }
}