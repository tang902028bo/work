<?php
namespace app\api\controller;
use app\ApiBaseController;
use think\facade\Request;
use think\Db;

class CarManage extends ApiBaseController
{
    /**车辆列表**/
    public function getCarList(){
        $page = empty(input('page')) ? 1 : input('page');
        $size = empty(input('pagesize')) ? 10: input('pagesize');
        $limit=(($page - 1) * $size) . "," . $size;
        $where=[];
        if(isset($_GET['search']) && $_GET['search']!=''){ //搜索用车人和司机
            $where[] = ['b.name|a.car_number','like',"%".$_GET['search']."%"];
        }
        if(isset($_GET['car_status']) && $_GET['car_status']!=''){
            $where[] = ['a.car_status','=',$_GET['car_status']];
        }
        if(isset($_GET['type_id']) && $_GET['type_id']!=''  ){
            $where[] = ['a.type_id','=',$_GET['type_id']];
        }
        $count = db('dc_car a')
            ->leftJoin('dc_car_type b','a.type_id=b.id')
            ->where('a.soft_delete=1 and a.status=1')
            ->where($where)
            ->count();
        $cars = db('dc_car a')
            ->field('a.id,a.prompt,a.car_status,a.seats_number,a.car_number,a.drive_km,a.type_id,b.name as type_name,a.use_num,(select sum(travel_mileage) from dc_approval_car where car_id=a.id) as travel_mileage')
            ->leftJoin('dc_car_type b','a.type_id=b.id')
            ->where('a.soft_delete=1 and a.status=1')
            ->where($where)
            ->group('a.id')
            ->order('a.id desc')
            ->limit($limit)
            ->select();
        foreach ($cars as $k=>$v){
            $cars[$k]['total_travel_mileage']=$v['travel_mileage']+$v['drive_km'];
        }
        returnMsg(200,'',[
            'list'=>$cars,
            'count'=>$count,
            'limit'=>$size
        ]);
    }
    /**获取车辆信息**/
    public function getCarInfo(){
        $id=(empty(input('id')))?0:input('id');
        $car_info=db('dc_car a')
            ->field('a.car_status,a.status,a.car_number,a.seats_number,a.createtime,a.drive_km,a.prompt,c.name as type_name')
            ->join('dc_car_type c','a.type_id=c.id and c.soft_delete=1','left')
            ->where('a.soft_delete=1 and a.id='.$id)
            ->find();
        if(empty($car_info)){
            returnMsg(100,'id参数有误');
            exit;
        }
        if($car_info['status']==0){
            returnMsg(100,'该车辆已下架');
            exit;
        }
        $approval_car_info=db('dc_approval_car')->field('round(IFNULL(sum(travel_mileage),0),2) as total_travel_mileage,count(*) as use_count')->where("(instr(CONCAT(',',car_id,','),',$id'))")->where('soft_delete=1 and status=1 and car_use_status=4')->select();
        $car_info['total_travel_mileage']=$approval_car_info[0]['total_travel_mileage'];
        $car_info['use_count']=$approval_car_info[0]['use_count'];
        returnMsg(200,'',$car_info);
    }
    /**编辑车辆信息**/
    public function editCar(){
        //获取单条数据
        if( empty($_POST) ){
            if( empty($_GET['id']) ){
                returnMsg(100,'id参数不能为空！');
            }
            $dc_car = db::table('dc_car')->where('soft_delete=1')->where('id',$_GET['id'])->find();
            if( empty($dc_car) ){
                returnMsg(100,'id参数不正确！');
            }
            returnMsg(200,'',$dc_car);
        }

        if( empty($_POST['car_number']) ){
            returnMsg(100,'车牌号不能为空！');
        }
        if( strlen($_POST['car_number']) > 10 ){
            returnMsg(100,'车牌号不能超过10个字符！');
        }
        $dc_car = db::table('dc_car')->where('soft_delete=1')->where('car_number',$_POST['car_number'])->find();
        if( !empty($dc_car)  ){
            if( empty($_POST['id']) || $dc_car['id'] != $_POST['id'] ){
                returnMsg(100,'车牌号重复！');
            }
        }
        if( !empty($_POST['id']) ){
            $dc_car = db::table('dc_car')->where('soft_delete=1')->where('id',$_POST['id'])->find();
            if( empty($dc_car) ){
                returnMsg(100,'参数id不正确！');
            }
        }
        if( !isset($_POST['type_id']) ){
            returnMsg(100,'type_id不存在！');
        }
        $dc_car_type = db::table('dc_car_type')->where('soft_delete=1')->where('id',$_POST['type_id'])->find();
        if( empty($dc_car_type) ){
            returnMsg(100,'type_id不正确！');
        }
        if( !isset($_POST['seats_number']) ){
            returnMsg(100,'seats_number参数不存在！');
        }
        if( !is_numeric($_POST['seats_number']) ){
            returnMsg(100,'seats_number参数需要是一个数字！');
        }

        if( !isset($_POST['drive_km']) ){
            returnMsg(100,'drive_km参数不存在！');
        }
        if( !is_numeric($_POST['drive_km']) ){
            returnMsg(100,'drive_km参数需要是一个数字！');
        }
        $prompt = input('prompt');
        if( empty($_POST['id']) ){
            Db::name('dc_car')->insert([
                'car_number' => Request::post('car_number'),
                'type_id' => Request::post('type_id'),
                'seats_number'=> Request::post('seats_number'),
                'prompt'=>$prompt,
                'drive_km'=>Request::post('drive_km'),
                'use_num'=>0,
                'status'=>1,
                'car_status'=>0,
                'createtime'=>time(),
                'soft_delete'=>1
            ]);
        }else{
            Db::name('dc_car')->where('id',$_POST['id'])->update([
                'car_number' => Request::post('car_number'),
                'type_id' => Request::post('type_id'),
                'seats_number'=> Request::post('seats_number'),
                'prompt'=>$prompt,
                'drive_km'=>Request::post('drive_km'),
                'use_num'=>0,
                'status'=>1,
                'car_status'=>1,
                'createtime'=>time(),
            ]);
        }

        returnMsg(200,'保存成功！');
    }
    /**已派车详情*/
    public function sendCarInfo(){
        $id=(empty(input('id')))?0:input('id');
        $sendCarInfo=db('dc_approval_car a')
            ->field('b.name,a.car_use_status,a.cause,a.start_time,a.end_time')
            ->leftJoin('a_user b','a.user_id=b.id')
            ->where('a.soft_delete=1 and a.car_id='.$id.' and a.status=1 and a.car_use_status!=4')
            ->find();
        if(empty($sendCarInfo)){
            returnMsg(100,'id参数有误');
            exit;
        }
        returnMsg(200,'',$sendCarInfo);
    }
    /**下架*/
    public function catInvalid(){
        $id=(empty(input('id')))?0:input('id');
        $car_info=db('dc_car')->where('soft_delete=1 and id='.$id)->find();
        if(empty($car_info)){
            returnMsg(100,'id参数有误!');
            exit;
        }
        if($car_info['status']==0){
            returnMsg(100,'该车辆已下架!');
            exit;
        }
        if($car_info['car_status']==1){
            returnMsg(100,'该车辆正在使用!');
            exit;
        }
        $re=db('dc_car')->where('soft_delete=1 and id='.$id)->update(['status'=>0]);
        if($re!==false){
            returnMsg(200,'车辆下架成功!');
        }else{
            returnMsg(100,'车辆下架失败！');
        }
    }
    /**车辆类型列表**/
    public function carTypeList(){
        $where=[];
        if(!empty($_GET['type_name']) && isset($_GET['type_name'])){ //搜索用车人和司机
            $where[] = ['name','like',"%".$_GET['type_name']."%"];
        }
        $type = db::table('dc_car_type')->where('soft_delete=1')->where($where)->group('id')->order('create_time desc')->select();
        returnMsg(200,'',$type);
    }
    /**司机列表**/
    public function driverList(){
        $page = empty(input('page')) ? 1 : input('page');
        $size = empty(input('pagesize')) ? 10: input('pagesize');
        $limit=(($page - 1) * $size) . "," . $size;
        $where=[];
        if( isset($_GET['search']) && $_GET['search'] !== '' ){
            $where[] = ['realname|mobile','like',"%".$_GET['search']."%"];
        }
        $count = db('dc_driver')->where('soft_delete=1')->where($where)->count();
        if ($count) {
            $drivers = db('dc_driver')
                ->where('soft_delete=1')
                ->where($where)
                ->group('id')
                ->order('id desc')
                ->limit($limit)
                ->select();
        } else {
            $drivers = [];
        }
        returnMsg(200,'',[
            'list'=>$drivers,
            'count'=>$count,
            'limit'=>$size
        ]);
    }

}