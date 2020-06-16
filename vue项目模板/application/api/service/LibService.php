<?php


namespace app\api\service;


use think\Db;

class LibService
{


    public function get_department_user_list($userid,$department,$type)
    {
        //type 1普通 2党员
        $useridList = [];
        //获取部门所有的用户
        if (!empty($department)) {
            $where = [];
            if ($type == 1){
                $table = 'department';
            }else{
                $table = 'party_depart';
            }
            $all = Db::name('a_'.$table)->where('soft_delete', 1)->select();
            $departId = explode(',', $department);
            $arrs = [];
            foreach ($departId as $k => $v) {
                $arr = [];
                $arr = getUpTree($all, $v);
                $wx_depid = array_column($arr, 'id');
                $wx_depid[] = $v;
                $arrs = array_merge($wx_depid, $arrs);
            }
            $arrs = array_unique($arrs);
            $users = [];
            foreach ($arrs as $k2 => $v) {
                $user = [];
                $user = Db::name('a_user')->where("find_in_set($v,$table)")->where('soft_delete',1)->select();
                $users = array_merge($user, $users);
            }
//            dump($users);die;
            $useridList = array_unique(array_column($users, 'userid'));
            $useridList = array_unique(array_filter(array_merge($useridList, explode(',', $userid))));

        }
        return $useridList;
    }
}