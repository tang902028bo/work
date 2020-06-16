<?php
/**
 * Created by myPhpStorm.
 * User: Administrator
 * Date: 2019/10/20
 * Time: 11:14
 */

namespace app\api\model;


use think\Exception;
use think\Model;

class AUser extends Model
{
    protected $name = 'a_user';
    protected $pk = "id";

}