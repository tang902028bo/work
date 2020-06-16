<?php
/**
 * Created by myPhpStorm.
 * User: Administrator
 * Date: 2019/9/10
 * Time: 15:36
 */

namespace app\structure\controller;


use app\BaseController;
use think\captcha\Captcha;


class Login extends BaseController
{
    //不继承
    function initialize(){
        $this->get_corpid();
        // 登陆不使用公共模板
        $this->view->engine->layout(false);
    }

    //登陆
    function index(){
        $return=$this->getIEBrowserVersion();
        if(!empty($return)){
            if(intval($return)<10){
                $this->redirect('structure/login/browser');
                exit;
            }
        }
        if(session('user')){ //已登录
            $this->redirect('/admin/index/index');
        }
        return $this->fetch();
    }

    //二维码信息
    function login_type(){
        $setting = get_option();
        if(empty($setting)){
            return json(['code'=>0,'msg'=>"未设置三方信息",'data'=>null]);
        }
        unset($setting['app_secret']);
        $setting['corpid'] = db('a_company_info')->where('id', 1)->value('corpid');
        return json(['code'=>1,'data'=>$setting]);
    }

    //账号登陆
    function do_login(){
        $username = $this->request->post('username');
        $password = $this->request->post('password');
//        $captcha = $this->request->post('captcha');
        if(empty($username)){return json(['code'=>0,'msg'=>'请输入账号']);}
        if(empty($password)){return json(['code'=>0,'msg'=>'密码不能为空']);}
//        if(empty($captcha)){return json(['code'=>0,'msg'=>'验证码']);}
//        $captchas = new Captcha();
//        if(!$captchas->check($captcha)) {
//            return json(['code'=>0,'msg'=>'验证码错误']);
//        }
        $info = db('a_user')->where('user_login',$username)->find();
        // var_dump($info);exit;    
        if(empty($info)){
            return json(['code'=>0,'msg'=>'登陆失败']);
        }
        if(!password_compare($password,$info['user_pass'])){
            return json(['code'=>0,'msg'=>'登陆失败']);
        }
        unset($info['user_pass']);
        session('user',$info);
        // var_dump(session('user'));
        $info['last_login_ip']   = get_client_ip(0, true);
        $info['last_login_time'] = time();
        db('a_user')->where('id',$info['id'])->update($info);
        $this->success('登录成功','/pc/dist');
    }

    /**
    *微信后台，工作台直接配置该路径
    **/
    public function wxwork_login_href(){
        // 获取企业微信配置
        $setting=get_option('api');
        // var_dump($setting);exit;
        // $config=json_decode($setting['wxwork_json'],1);
        $url = "https://open.weixin.qq.com/connect/oauth2/authorize?appid=".$setting['corpid']."&redirect_uri=".$_SERVER['HTTP_HOST']."/structure/login/wx_login.html&response_type=code&scope=SCOPE&agentid=".$setting['app_id']."&state=STATE#wechat_redirect";
        header("Location:".$url);exit;
    }

    //微信登陆入口
    function wx_login(){
        $code = $this->request->param('code');
        $sate = $this->request->param('state');
        if(empty($code)){
            $this->error('登录出错：未能正确获取code');
        }
        $wx_id = $this->get_wxid($code);
        //获取成员
        $userinfo = db('a_user')->where('userid',$wx_id)->where('soft_delete',1)->find();
        if(empty($userinfo)){
            $this->error('账号不可用，请联系管理员');
        }
        if($userinfo['user_status']!=1){
            $this->error('你已被禁用，请联系管理员');
        }
        unset($userinfo['user_pass']);
        session('user', $userinfo);
        $userinfo['last_login_ip']   = get_client_ip(0, true);
        $userinfo['last_login_time'] = time();
        db('a_user')->where('id',$userinfo['id'])->update($userinfo);
        if(!empty($sate)&&$sate!='STATE'){
            header('Location:'.$sate);exit;
        }
        //if(is_mobile()){
           //header('Location:/html/wap');exit;
        //}
        header('Location:/admin/index/index');
    }

    //获取微信用户id
    function get_wxid($code){
        $access_token=get_wx_token();
        $url = WX_DOMAIN.'cgi-bin/user/getuserinfo?access_token='.$access_token.'&code='.$code;
        if(empty($access_token)){
            $this->error('获取token失败');
        }
        $param = ['access_token'=>$access_token,'code'=>$code];
        $uinfo = json_decode(curl_post($url,$param),1);
        if(!isset($uinfo['errcode'])&&$uinfo['errcode']!=0)
            $this->error('登陆出错：'.$uinfo['errmsg']);
        if(!isset($uinfo['UserId']))
            $this->error('你还不是我司成员，不可登陆！');
        return $uinfo['UserId'];
    }

    function logout(){
        session('user',null);
        returnMsg(200,'退出成功！');
    }
    function browser(){
        return $this->fetch();
    }
    function getIEBrowserVersion()
    {
        $agent = strtolower($_SERVER['HTTP_USER_AGENT']);
        if(strpos($agent, 'msie') !== false)
        {//如果含有msie
            preg_match('/msie\s([^\s|;|\)]+)/i', $agent, $MSIERegs);
            return $MSIERegs[1];

        }//如果含有msie
        elseif (strpos($agent, 'trident') !== false && strpos($agent, 'rv:') !== false)
        {//如果含有rv:
            preg_match('/rv:([^\s|;|\)]+)/i', $agent, $rvRegs);
            return $rvRegs[1];
        }
    }
}