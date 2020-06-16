<?php
namespace app\api\controller;
use think\Controller;
class Index extends Controller
{
    private  $corpid;
    private  $corpsecret;
    function initialize(){
        $this->corpid=commpayInfo()['corpid'];
        $this->corpsecret=corpInfo('api')['app_secret'];
    }
    public function index(){
        $this->redirect('/m/dist');
        exit;
    }
    /**
     *微信后台，工作台直接配置该路径
     **/
    public function wxwork_login_href(){
        if(!empty(input("jump_url"))){
            $jump_url = input("param.jump_url");
        }else{
            $jump_url = "STATE";
        }
        header("Location: ". WX_DOMAIN_1 ."/connect/oauth2/authorize?appid=".$this->corpid."&redirect_uri=".$_SERVER['HTTP_HOST']."/api/index/wx_login&state=".$jump_url."&response_type=code&scope=snsapi_base#wechat_redirect");
        exit;
    }
    //企业用户工作台登录
    public function wx_login(){
        $code=input('code');
        if(empty($code)){
            exit('<h1 align="center" style="font-size:50px;margin-top:100px;color:gray;">登录出错：未能正确获取code。</h1>');
        }
        $access_token = $this->get_access_token();
        if(empty($access_token)){
            $this->error('获取token失败');
        }
        $wx_id=$this->get_wxid($access_token,$code);
        $user=db('a_user')->where('userid="'.$wx_id.'"')->find();
        /**根据userId获取用户详情**/
        $url_userifno=WX_DOMAIN."cgi-bin/user/get?access_token={$access_token}&userid={$wx_id}";
        $user_info = json_decode(curl_post($url_userifno),true);
        if(empty($user)){
            /**新增**/
            //如果组织架构没有部门.则添加到默认部门
            if($user_info["department"] == "") $user_info['department'] = [99999];
            //组装数据
            $data = array(
                'userid'=>$user_info['userid'],
                'user_login'=>$user_info['userid'],
                'user_pass'=>password($user_info['userid']),
                'name'=>$user_info['name'],
                'department'=>is_array($user_info["department"])? implode(',', $user_info["department"]):$user_info["department"],
                'mobile'=>isset($user_info["mobile"])? $user_info['mobile']:'',
                'position'=>isset($user_info["position"])? $user_info['position']:'',
                'gender'=>isset($user_info["gender"])? $user_info["gender"]:0,
                'email'=>isset($user_info["email"])? $user_info["email"]:'',
                'avatar'=>isset($user_info["avatar"])? $user_info["avatar"]:'',
                'telephone'=>isset($user_info['telephone'])?$user_info['telephone']:"",
                'status'=>isset($user_info['status'])? $user_info['status']:"1",
                'qr_code'=>isset($user_info['qr_code'])? $user_info['qr_code']:"",
                'address'=>isset($user_info['address'])?$user_info['address']:'',
                'soft_delete'=>1,
                'user_status'=>isset($user_info["enable"])? $user_info["enable"]:1,
                'is_leader_in_dept'=>isset($user_info['is_leader_in_dept'])?implode(',',$user_info['is_leader_in_dept']):"",
            );
            $insert_id = db('a_user')->insertGetId($data);
            $data["id"]  = $insert_id;
        }else{
            //更新
            $data = $user;
            $data["soft_delete"] = ($user['soft_delete']!=1)?1:$user['soft_delete'];
            $data['avatar']=$user_info['avatar'];
            $data['name']=$user_info['name'];
            db("a_user")->update($data);
        }
        // 登录信息保存
        session('wx_user', $data);
        $result['last_login_ip']   = get_client_ip(0, true);
        $result['last_login_time'] = time();
        db('a_user')->where('id',$data['id'])->update($result);
        if(input('state')==="STATE"){
            $this->redirect('api/Index/index');
        }else{
            $this->redirect(urldecode(input('state')));
        }
    }
    private function get_wxid($access_token,$code){
        $url = WX_DOMAIN_2.'/cgi-bin/user/getuserinfo?access_token='.$access_token.'&code='.$code;
        $wxuser_info = json_decode(curl_get($url),true);
        if(!isset($wxuser_info['errcode'])&&$wxuser_info['errcode']!=0)
            exit('<h1 align="center" style="font-size:40px;margin-top:100px;color:gray;">错误码：'.$wxuser_info["errcode"].'。用户登陆信息获取失败。</h1><br />
                    <h1 align="left" style="font-size:36px;margin-top:100px;margin-left:20px;color:gray;">解决思路：</h1><br />
                    <div style="margin-left:60px;font-size:26px;">1、本次扫码的组织架构是否和该应用属于同一组织架构；<br/>
                    2、若在同一组织架构，请联系该应用管理员确认您是否在应用可见范围；<br/>
                    3、若前两步确认没问题，请将该页面截图发送给企业管理员联系应用服务商。</div>');
        if(!isset($wxuser_info['UserId'])){
            exit('<h1 align="center" style="font-size:40px;margin-top:100px;color:gray;">错误码：'.$wxuser_info["errcode"].'。用户登陆信息获取失败。</h1><br />
                    <h1 align="left" style="font-size:36px;margin-top:100px;margin-left:20px;color:gray;">解决思路：</h1><br />
                    <div style="margin-left:60px;font-size:26px;">1、本次扫码的组织架构是否和该应用属于同一组织架构；<br/>
                    2、若在同一组织架构，请联系该应用管理员确认您是否在应用可见范围；<br/>
                    3、若前两步确认没问题，请将该页面截图发送给企业管理员联系应用服务商。</div>');
        }
        return $wxuser_info['UserId'];
    }
    private function get_access_token(){
        $url = WX_DOMAIN_2.'/cgi-bin/gettoken?corpid='.$this->corpid.'&corpsecret='.$this->corpsecret;
        $return= json_decode(curl_get($url),true);
        if($return['errcode'] == 0 ){
            return $return['access_token'];
        }else{
            throw new \Exception($return['errmsg']);
        }
    }

}