<?php
/**
 * Created by myPhpStorm.
 * User: Administrator
 * Date: 2019/9/10
 * Time: 11:32
 */

namespace app;


use app\api\lib\ResponseData;
use think\Controller;
use think\Db;
use think\facade\Request;

/**中间控制器，用于公共处理
 * Class BaseController
 * @package app
 */
class BaseController extends Controller
{

    protected $responseData;
    public $userInfo;
    public $role;//0无权限 1管理员权限 2协助管理权限
    public $userid;
    public $time;

    //公共控制部分
    function initialize(){
        /*if(isset($_SERVER ['HTTP_ACCOUNT']) && $_SERVER ['HTTP_ACCOUNT']!==''){
            $this->responseData = new ResponseData();
            $this->time = time();
            $r = Db::name('a_user')->where('user_login',$_SERVER ['HTTP_ACCOUNT'])->find();
            session('user',$r);
            $this->userInfo =session('user');
            $this->userid = session('user.userid');
        }else{
            //上面代码部署时需要删除
            if(!session('user')){
                // $this->redirect('/structure/login/index');
            }
        }
        if( !$this->hasPerm() ){
            returnMsg(100,'你没有权限！',[
                'has_perm'=>0
            ]);
        }*/
        //上面代码上线时删除
//        if(!session('user')){
//            $this->redirect('/structure/login/index');
//        }
//        if( !$this->hasPerm() ){
//            returnMsg(100,'你没有权限！',[
//                'has_perm'=>0
//            ]);
//        }

    }
    //获取企业id
    function get_corpid(){
        global $corpid; //设置全局变量
        if(empty($corpid)) {
            $corpid = db('a_company_info')->where('id', 1)->value('corpid');
        }
    }
    function hasPerm(){
        $role_ids = explode(',',session('user.u_roles'));
        foreach( $role_ids as $role_id ){
            //是否是超级管理员
            if(in_array($role_id,['1','2','3'])){
                return true;
            }
        }
        $cb_module = Request::module();
        $cb_action = Request::action();
        $cb_controller = Request::controller();

        $notNeedPermActions = [
            'admin/index/index',
            'admin/appset/index',
            'admin/department/index',
            'admin/tag/index',
            'admin/role/index',
            'api/role_Manger/get_role_power',
            'admin/index/about_us'
        ];

        foreach( $notNeedPermActions as $action ){
            $arr = explode('/',$action);
            if( count($arr) != 3 ){
                continue;
            }
            $arr[1] = str_replace('_','',$arr[1]);
            if( strtolower($arr[0]) == strtolower($cb_module) &&
                strtolower($arr[1]) == strtolower($cb_controller) &&
                strtolower($arr[2]) == strtolower($cb_action) )
            {
                return true;
            }
        }
        $actions = [
            //查看部门
            'dep_user'=>[
                'structure/query/depList',
                'api/role_manger/role_list',
            ],
            //编辑用户
            'edit_user'=>[
                'api/role_manger/set_role'
            ],
            //同步组织架构
            'sys'=>[
                'structure/api/sync'
            ],
            //同步标签
            'sys_tags'=>[
                'structure/api/synchronization_wxwork_tags'
            ],
            //角色管理查看
            'role_manger'=>[
                'api/role_manger/power_type',
                'api/role_manger/role_list',
                'api/role_Manger/show_role_permission',
                'api/role_manger/get_role_permission'
            ],
            //添加/编辑角色
            'add_role'=>[
                'api/role_manger/edit_role'
            ],
            //删除角色
            'del_role'=>[
                'api/role_manger/del_role'
            ],
            //角色权限编辑
            'edit_role_limit'=>[
                'api/role_manger/change_operation_permission'
            ],
            //司机列表
            'driver_manger'=>[
                'admin/driver_manger/get_driver'
            ],
            //新增司机
            'add_driver'=>[
                'admin/driver_manger/add_driver'
            ],
            //编辑司机
            'edit_driver'=>[
                'admin/driver_manger/edit_driver'
            ],
            //删除司机
            'del_manger'=>[
                'admin/driver_manger/del_manger'
            ],
            //车辆列表
            'car'=>[
                'admin/car/car_list'
            ],
            //新增车辆
            'add_car'=>[
                'admin/car/edit_car'
            ],
            //编辑车辆
            'edit_car'=>[
                'admin/car/edit_car'
            ],
            //删除车辆
            'del_car'=>[
                'admin/car/car_del'
            ],
            //车辆品牌列表
            'car'=>[
                'admin/car/brand_list'
            ],
            //新增车辆品牌
            'car_brand'=>[
                'admin/car/brand_edit'
            ],
            //编辑车辆品牌
            'edit_car'=>[
                'admin/car/brand_edit'
            ],
            //删除车辆品牌
            'del_car'=>[
                'admin/car/brand_del'
            ],
            //车辆类型列表
            'car'=>[
                'admin/car/type_list'
            ],
            //新增车辆类型
            'car_brand'=>[
                'admin/car/type_edit'
            ],
            //编辑车辆类型
            'edit_car'=>[
                'admin/car/type_edit'
            ],
            //删除车辆类型
            'del_car'=>[
                'admin/car/type_del'
            ],
            //申请记录
            'apply_car'=>[
                'admin/car_use_manage/use_car_apply'
            ],
            //用车记录
            'use_car'=>[
                'admin/car_use_manage/use_car_record'
            ],
            //车辆出场/回场查看
            'out_car'=>[
                'admin/car_use_manage/car_check_list'
            ],
            //车辆出场/回场检查
            'out_check_car'=>[
                'admin/car_use_manage/car_check'
            ],
            //用车审批查看
            'use_car_apply'=>[
                'admin/car_use_manage/use_car_apply'
            ],
            //数据统计
            'data_dtatistics'=>[
                'admin/data_dtatistics/index'
            ],

        ];
        $needPerms = [];
        foreach( $actions as $perm=>$actionArr ){
            foreach( $actionArr as $action ){
                $arr = explode('/',$action);
                if( count($arr) != 3 ){
                    continue;
                }
                $arr[1] = str_replace('_','',$arr[1]);
                if( strtolower($cb_module) != strtolower($arr[0]) ){
                    continue;
                }
                if( strtolower($cb_controller) != strtolower($arr[1]) ){
                    continue;
                }
                if( $arr[2] != '*' && strtolower($cb_action) != strtolower($arr[2]) ){
                    continue;
                }
                $needPerms[] = $perm;
            }
        }
        //var_dump($needPerms);
        //var_dump(session('user.perms'));
        foreach( $needPerms as $needPerm ){
            if( is_array( session('user.perms') ) && in_array($needPerm,session('user.perms')) ){
                return true;
            }
        }
        return false;
    }

}