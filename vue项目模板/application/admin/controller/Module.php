<?php
/**
 * Created by myPhpStorm.
 * User: Administrator
 * Date: 2019/9/23
 * Time: 9:49
 */

namespace app\admin\controller;


use app\BaseController;

class Module extends BaseController
{


    function module(){
    	$this->assign("approval_url",APPROVAL_URI);
        return $this->fetch();
    }

}