<?php

namespace app\admin\controller;


use think\App;
use think\Controller;
use think\Db;


class Base extends Controller
{
    const debug = true;
    public function __construct(App $app = null)
    {
        parent::__construct($app);
        // 设置跨域访问
        isset($_SERVER['HTTP_ORIGIN']) ? header('Access-Control-Allow-Origin: '.$_SERVER['HTTP_ORIGIN']) : '';
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept, authKey, sessionId");
        if(strtoupper($_SERVER['REQUEST_METHOD'])== 'OPTIONS'){ exit; }

        if(self::debug){
            $info = array(
                'id'=>1,
                'u_roles'=>1,
            );
            session('user',$info);
        }else{
            $uid = session('user.id');
            if(empty($uid)){
                exit(json_encode(['error_code'=>0,'请先登录']));
            }else{
                $action = request()->action();
                $controller=request()->controller();
                //权限控制
                $nodes = Db('a_role')
                    ->field('node')
                    ->where('id IN ('.trim(session('user.u_roles'),',').')')
                    ->select();
                $this_node = Db('a_node')
                    ->field('ctrl,action,id')
                    ->where(['ctrl'=>$controller,'action'=>$action])
                    ->find();
                if(!in_array($this_node['id'],array_column($nodes,'node'))){
                    exit(json_encode(['error_code'=>0,'无权限']));
                }
            }
        }

    }



}