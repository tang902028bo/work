<?php
/**
 * Created by myPhpStorm.
 * User: Administrator
 * Date: 2019/9/10
 * Time: 11:32
 */
namespace app;
use think\Controller;
/**中间控制器，用于公共处理
 * Class BaseController
 * @package app
 */
class ApiBaseController extends Controller
{
    //公共控制部分
    function initialize(){
//        $user=db('a_user')->where('userid="mr.tian"')->find();
//        $user=db('a_user')->where('userid="XiaoHuaHua"')->find();
//        $user=db('a_user')->where('userid="LiuHang"')->find();
//        session('wx_user',$user);
//        if(!session('wx_user')){
//            $user=db('a_user')->where('userid="fb2316f492e243eaafbc019448fed6a5"')->find();
//            session('wx_user',$user);
//        }
        //上面代码上线时删除
        if(empty(session('wx_user')) || !cmf_is_wechat()){
            returnMsg(403, '请在企业微信打开');
        }
    }
}