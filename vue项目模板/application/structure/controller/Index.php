<?php
/**
 * Created by myPhpStorm.
 * User: Administrator
 * Date: 2019/9/10
 * Time: 11:31
 */

namespace app\structure\controller;


use app\BaseController;

class Index extends BaseController
{

    function browser(){
        return $this->fetch();
    }
}