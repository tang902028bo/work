<?php
/**
 * Created by myPhpStorm.
 * User: Administrator
 * Date: 2019/9/24
 * Time: 18:03
 */

namespace app\admin\controller;


use app\BaseController;

class Department extends BaseController
{
    function index(){		//获取企业微信相关信息
        $wx_config = get_option();
        $url = request()->domain().$_SERVER['REQUEST_URI'];
        $content = get_jsapi_ticket();
        $x = '';
        foreach($content AS $k=>$v){
            $x.= $x ? '&'.$k.'='.$v : $k.'='.$v;
        }
        $x.='&url='.$url;
        $signature =sha1($x);
        $content['signature'] = $signature;
        $this->assign('wx_config',$wx_config);
        $this->assign('content',$content);
        return $this->fetch();
    }

}