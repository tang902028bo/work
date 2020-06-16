<?php
// +----------------------------------------------------------------------
// | ThinkPHP [ WE CAN DO IT JUST THINK ]
// +----------------------------------------------------------------------
// | Copyright (c) 2006-2016 http://thinkphp.cn All rights reserved.
// +----------------------------------------------------------------------
// | Licensed ( http://www.apache.org/licenses/LICENSE-2.0 )
// +----------------------------------------------------------------------
// | Author: 流年 <liu21st@gmail.com>
// +----------------------------------------------------------------------
// 应用公共文件
//设置参数
use think\Db;
function set_option($data, $app=''){
    if(empty($app)){$app=APP_CODE;}
    if(!is_array($data)){
        return false;
    }
    $id = db('a_app_settings')->where('app_code',$app)->value('id');
    if($id){
        $res = db('a_app_settings')->where('id',$id)->update($data);
    }
    else{
        $data['app_code'] = $app;
        $res =db('a_app_settings')->insert($data);
    }
    if($res){
        cache('option_'.$app,$data,7200);//跟新缓存
        cache('qywx_token'.$app,null); //如果是wx相关设置，清除qywx_token的缓存
        return true;
    }
    return false;
}
//获取设置
function get_option($app=''){
    if(empty($app)){$app=APP_CODE;}
    // if(cache('option_'.$app)){
    //     return cache('option_'.$app);
    // }
    $setting = db('a_app_settings')->where('app_code',$app)->find();
    $setting["corpid"] = db("a_company_info")->limit(1)->value("corpid");
    if(empty($setting)){
        return false;
    }
//    $setting = json_decode($setting,1);
    cache('option_'.$app,$setting,7200);
    return $setting;
}
//获取token
function get_wx_token($name='qywx_token',$secret_key='app_secret',$app=''){
    global $corpid;
    if(empty($corpid)){
        $corpid = db('a_company_info')->where('id', 1)->value('corpid');
    }

//    dump($corpid);exit;
    if(empty($app)){$app=APP_CODE;}
    // if(cache($name.$app)){
    //     return cache($name.$app);
    // }
    $setting = get_option($app);
    if(empty($setting)){
        return false;
    }
    if(!isset($setting[$secret_key])){
        return false;
    }
    $url =WX_DOMAIN.'cgi-bin/gettoken?';
    $param = [
        'corpid'=>$corpid,
        'corpsecret'=>$setting[$secret_key],
    ];
//     var_dump($url,$param);exit;
    $res = json_decode(curl_post($url.http_build_query($param)),1);

    if(empty($res)){
        return false;
    }
    if(isset($res['errcode'])&&$res['errcode']!=0){ //获取出错
        return false;
    }
    cache($name.$app,$res['access_token'],7100);
    return $res['access_token'];
}
//curl post请求处理
function curl_post($url,$params='',$is_json=1,$header = [],$time_out=''){
    if($is_json==1){ //发送json
        $params = !empty($params)?json_encode($params,JSON_UNESCAPED_UNICODE):$params;
    }
    $ch = curl_init();
    curl_setopt($ch,CURLOPT_URL,$url);
    curl_setopt($ch,CURLOPT_HEADER,0);
    curl_setopt($ch,CURLOPT_RETURNTRANSFER,1);
    curl_setopt($ch,CURLOPT_CONNECTTIMEOUT,10);
    curl_setopt($ch,CURLOPT_POST,1);
    curl_setopt($ch,CURLOPT_SSL_VERIFYPEER,false);
    curl_setopt($ch,CURLOPT_POSTFIELDS,$params);

    if(empty($header)){
        curl_setopt($ch,CURLOPT_HTTPHEADER, array('Content-Type: application/json'));
    }else{
        curl_setopt($ch,CURLOPT_HTTPHEADER, $header);
    }
    if(!empty($time_out)){ //设置了超时
        curl_setopt($ch,CURLOPT_CONNECTTIMEOUT,$time_out);
    }
    $data = curl_exec($ch);
    curl_close($ch);
    return ($data);
}
//密码加密方法
function password($password,$authCode=''){
    if (empty($authCode)) {
        $authCode = config('database.authcode');
    }
    $result = md5(sha1($authCode . $password));
    return $result;
}
//密码比较
function password_compare($input_pass,$database_pass){
    if($database_pass == password($input_pass)){
        return true;
    }
    return false;
}
/**
 * 获取客户端IP地址
 * @param integer $type 返回类型 0 返回IP地址 1 返回IPV4地址数字
 * @param boolean $adv 是否进行高级模式获取（有可能被伪装）
 * @return string
 */
function get_client_ip($type = 0, $adv = true)
{
    return request()->ip($type, $adv);
}
/**将数组转为树状结果
 * @param $list 数组
 * @param string $pk id
 * @param string $pid 父级键名
 * @param string $child 用于存自己的键名
 * @param int $root 顶级id
 * @return array
 */
function list_to_tree($list, $pk='id', $pid = 'pid', $child = '_child', $root = 0) {
    // 创建Tree
    $tree = array();
    if(is_array($list)) {
        // 创建基于主键的数组引用
        $refer = array();
        foreach ($list as $key => $data) {
            $refer[$data[$pk]] =& $list[$key];
        }
        foreach ($list as $key => $data) {
            // 判断是否存在parent
            $parentId =  $data[$pid];
            if ($root == $parentId) {
                $tree[] =& $list[$key];
            }else{
                if (isset($refer[$parentId])) {
                    $parent =& $refer[$parentId];
                    $parent[$child][] =& $list[$key];
                }
            }
        }
    }
    return $tree;
}
/**
 * 判断是否为微信访问
 * @return boolean
 */
function is_wechat()
{
    if (strpos($_SERVER['HTTP_USER_AGENT'], 'MicroMessenger') !== false) {
        return true;
    }
    return false;
}
function is_mobile(){

    static $is_mobile;

    if (isset($is_mobile))
        return $is_mobile;

    $is_mobile = request()->isMobile();

    return $is_mobile;
}
function msectime(){
    list($usec, $sec) = explode(" ", microtime());
    $msec=round($usec*1000);
    return $msec;
}
function debug_time($log,$time){
    echo (msectime()-$time).":".$log.'<br>';
}
function is_img($name){
    $extension = strtolower(pathinfo($name, PATHINFO_EXTENSION));

    /* 对图像文件进行严格检测 */
    if (in_array($extension, ['gif', 'jpg', 'jpeg', 'png'])) {
        return true;
    }
    return false;
}
function get_watermark(){
    $watermark = db('a_company_info')->field('corp_name')->find();
    return $watermark['corp_name'].session('user.name').date('Ymd');
}
/**
 * 获取企业的jsapi_ticket
 *add pengchenglei time 2019-9-16 13:53:52
 */
function get_jsapi_ticket($name='qywx_jsapi_ticket'){
    if(cache($name)){
        $jsapi_ticket = cache($name);
    }else{
        $access_token = get_wx_token();
        $url = WX_DOMAIN.'cgi-bin/get_jsapi_ticket?access_token='.$access_token;
        $res = json_decode(curl_post($url),1);
        if(empty($res)){
            return false;
        }
        if(isset($res['errcode'])&&$res['errcode']!=0){ //获取出错
            return false;
        }
        cache($name,$res['ticket'],$res['expires_in']-100);
        $jsapi_ticket = $res['ticket'];
    }
    $time = time();
    $len = 16;
    $temp_string = getRandomStr($len,false);
    $info = array(
        'jsapi_ticket'=>$jsapi_ticket,
        'noncestr'=>$temp_string,
        'timestamp'=>$time,
    );
    return $info;
}
/**
 * 获取应用的jsapi_ticket
 *add pengchenglei time 2019-9-16 13:53:52
 */
function get_agent_jsapi_ticket($name='qywx_agent_jsapi_ticket'){
    if(cache($name)){
        $jsapi_ticket = cache($name);
    }else{
        $access_token = get_wx_token();
        $url = WX_DOMAIN.'cgi-bin/ticket/get?access_token='.$access_token.'&type=agent_config';
        $res = json_decode(curl_post($url),1);
        if(empty($res)){
            return false;
        }
        if(isset($res['errcode'])&&$res['errcode']!=0){ //获取出错
            return false;
        }
        cache($name,$res['ticket'],$res['expires_in']-100);
        $jsapi_ticket = $res['ticket'];
    }
    $time = time();
    $len = 16;
    $temp_string = getRandomStr($len,false);
    $info = array(
        'jsapi_ticket'=>$jsapi_ticket,
        'noncestr'=>$temp_string,
        'timestamp'=>$time,
    );
    return $info;
}
/**
 * 获得随机字符串
 * @param $len             需要的长度
 * @param $special        是否需要特殊符号
 * @return string       返回随机字符串
 */
function getRandomStr($len, $special=true){
    $chars = array(
        "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k",
        "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v",
        "w", "x", "y", "z", "A", "B", "C", "D", "E", "F", "G",
        "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R",
        "S", "T", "U", "V", "W", "X", "Y", "Z", "0", "1", "2",
        "3", "4", "5", "6", "7", "8", "9"
    );

    if($special){
        $chars = array_merge($chars, array(
            "!", "@", "#", "$", "?", "|", "{", "/", ":", ";",
            "%", "^", "&", "*", "(", ")", "-", "_", "[", "]",
            "}", "<", ">", "~", "+", "=", ",", "."
        ));
    }

    $charsLen = count($chars) - 1;
    shuffle($chars);                            //打乱数组顺序
    $str = '';
    for($i=0; $i<$len; $i++){
        $str .= $chars[mt_rand(0, $charsLen)];    //随机取出一位
    }
    return $str;
}
function get_random_str($n,$count=29){
    $string = "abcdefghijklmnopqrstuvwxyz";
    $new_str ="";
    if($n>30 ||  $n<=0){
        echo "您输入有误!";
    }else {
        for($i=0; $i<$n; $i++){
            $random = rand(0,$count);
            $character = substr($string,$random,1);
            $string = str_replace($character,"",$string);   //获得一个字母就把这个字母$character删除
            $count--;
            $new_str .= $character;
        }
    }
    return $new_str;
}
/*部门的无限极分类 传入参数  上级分类的id  存储部门id的数组*/
function get_child_department($parent_id,$dep_arr){
    if(!in_array($parent_id,$dep_arr)) $dep_arr[] = $parent_id;
    $child_depart=Db::name("a_department")->field("id,wx_depid,dep_name")->where("soft_delete",1)->where("parentid",$parent_id)->select();
    if($child_depart){
        foreach($child_depart as $v){
            if(!in_array($v["wx_depid"],$dep_arr)){
                $dep_arr[] = $v["wx_depid"];
            }
            $dep_arr = get_child_department($v['wx_depid'],$dep_arr);
        }
    }
    return $dep_arr;
}
/**
 * $_POST的扩展，可以验证数据指定类型
 *
 * @param string $key 要获取数据的KEY
 * @param string $type 指定的类型
 * @param string $default 如果验证不通过则指定默认值
 * @return bool
 */
function _POST($key, $type = 'string', $default = null)
{
    $return = false;
    $val = request()->post($key);
    if (isset($val)) {
        $return = isStringType($val, $type);
    }
    if ($return === false && !is_null($default)) $return = $default;
    return $return;
}
function isStringType($string, $type = 'string')
{
    $return = $string;
    if (is_int($type)) {
        $returnLen = mb_strlen($return, 'utf8');
        if ($returnLen != $type) $return = false;
    } elseif ($type == 'string') {

    } elseif ($type == 'number') {
        if (!is_numeric($return)) $return = false;
    } elseif ($type == 'mobile') {
        if (!_checkmobile($return)) $return = false;
    } elseif ($type == 'email') {
        if (!_checkemail($return)) $return = false;
    } elseif ($type == 'nickname') {
        $strLen = mb_strlen($return, 'utf8');
        if ($strLen < 1 || $strLen > 10) $return = false;
    } elseif ($type == 'date') {
        if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $return)) $return = false;
    } elseif (strstr($type, '|')) {
        $return = false;
        $typeArray = explode('|', $type);
        foreach ($typeArray as $k => $v) {
            if ($string == $v) {
                $return = $string;
            }
        }
    } elseif (substr($type, 0, 1) == '<') {
        $num = substr($type, 1);
        if (is_numeric($num)) {
            $num = (int)$num - 1;
            if (mb_strlen($return, 'utf8') > $num) $return = false;
        }
    } elseif (substr($type, 0, 1) == '>') {
        $num = substr($type, 1);
        if (is_numeric($num)) {
            if (mb_strlen($return, 'utf8') <= $num) $return = false;
        }
    }
    return $return;
}
/*手机号码验证*/
function _checkmobile($mobilePhone = '')
{
    if (strlen($mobilePhone) != 11) {
        return false;
    }
    if (preg_match("/^1[345789][0-9]{9}$/", $mobilePhone)) {
        return true;
    } else {
        return false;
    }
}
/*邮箱验证*/
function _checkemail($email = '')
{
    if (mb_strlen($email) < 5) {
        return false;
    }
    $res = "/^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/";
    if (preg_match($res, $email)) {
        return true;
    } else {
        return false;
    }
}
/** 通过id找到名称
 * @param $ids
 * @param int $type 1用户 2部门
 * @return string
 */
function id2name($ids, $type = 1)
{
    $ids = explode(',', $ids);
    $name = [];
    foreach ($ids as $v) {
        //1 人员
        if ($type == 1) {
            $name[] = Db::name('a_user')->where('userid', $v)->value('name');
        } //2 部门
        else {
            $name[] = Db::name('a_department')->where('id', $v)->value('dep_name');
        }
    }
    return implode(',', $name);

}
/**
 * 返回消息
 * @param int $code code 200为成功；其他为失败
 * @param string $msg 消息内容
 * @param mixed $data 返回的数据
 * @param mixed $other 其他数据
 */
function returnMsg($code,$msg,$data=[],$other = []){
    header('Content-Type: application/json');
    $d = [
        'code'=>$code,
        'msg'=>$msg,
        'data'=>$data
    ];
    if( !empty($other) ){
        $d['other'] = $other;
    }
    echo json_encode($d,JSON_UNESCAPED_UNICODE);
    exit;
}
/**
 * base64上传文件
 * @param string $base64 文件的base64编码
 * @param string $root 根目录
 * @param array $allowExts 允许后缀名
 */
function base64File($base64,$root,$allowExts){
    $allowExts = strtolower($allowExts);
    $allowExts = explode(',',$allowExts);
    $mimes = [
        'png'=>'image/png',
        'jpg'=>'image/jpg',
        'gif'=>'image/gif',
        'bmp'=>'image/bmp',
        'ico'=>'image/x-icon'
    ];
    $allowMimes = [];
    foreach( $mimes as $key=>$mime ){
        if( in_array($key,$allowExts) ){
            $allowMimes[$key] = $mime;
        }
    }
    if( !strstr($base64,',') ){
        throw new \Exception('格式不正确！');
    }
    list($head,$body) = explode(',',$base64);
    if( !preg_match('/^data\:([^;]+);base64$/',$head,$match) ){
        throw new \Exception('格式不正确！');
    }
    $mime = strtolower($match[1]);
    if( !in_array( $mime,$allowMimes ) ){
        throw new \Exception('mime type不正确！');
    }
    $ext = array_search($mime,$mimes);
    $dir = date("Ymd");
    if( !is_dir($root . $dir) ){
        mkdir($root . $dir);
    }
    do{
        //$file =  floor( microtime(true) * 1000 ). '.' . $ext;
        $file = md5( microtime(true) . mt_rand(1000,9999) . mt_rand(1000,9999) . mt_rand(1000,9999) ) . '.' . $ext;
        $path = $root . $dir . '/' . $file;
        if( !is_file($path) ){
            break;
        }
    }while(1);
    file_put_contents($path, base64_decode($body) );
    return $dir . '/' . $file;
}
/**
 * 获取分页参数信息
 */
function getPageParams(){
    if( empty($_GET['page']) || $_GET['page'] < 1 ){
        $page = 1;
    }else{
        $page = (int)$_GET['page'];
    }
    if( empty($_GET['limit']) ){
        $limit = 10;
    }else{
        $limit = (int)$_GET['limit'];
        if( $limit > 100 ){
            $limit = 100;
        }
    }
    $start = ($page-1) * $limit;
    return [$start,$limit,$page];
}
function getHttpHost(){
    if( isset($_SERVER['REQUEST_SCHEME'])  ){
        $url = $_SERVER['REQUEST_SCHEME'];
    }elseif( isset($_SERVER['HTTPS'])  ){
        if( $_SERVER['HTTPS'] == 'off' ){
            $url = 'http';
        }else{
            $url = 'http';
        }
    }else{
        $url = 'http';
    }
    $url .= '://' . $_SERVER['HTTP_HOST'];
    return $url;
}
function delimg($arr_img_url){
    if(!empty($arr_img_url)){
        foreach ($arr_img_url as $k=>$v){
            if(!empty($v) ){
                $path = __FILE__;
                $paths = substr($path,0,strpos($path,'application'));
                $pic1 = $paths."public/upload/" . $v;
                if(file_exists($pic1)){
                    @unlink($pic1);
                }
            }
        }
    }
}
/**
 * 过滤4个字节的utf8
 * @param string $data
 * echo utf8mb4_filter('田茂（小甜甜🌟）');
 */
function utf8mb4_filter($data) {
    $res = '';
    for( $i=0;$i<mb_strlen($data);$i++ ){
        $str = mb_substr($data,$i,1);
        //var_dump($str);
        if( strlen($str) <= 3 ){
            $res.=$str;
        }
    }
    return $res;
}
/**
 * 判断是否为微信访问
 * @return boolean
 */
function cmf_is_wechat()
{
    if (strpos($_SERVER['HTTP_USER_AGENT'], 'MicroMessenger') !== false) {
        return true;
    }
    return false;
}
/**
 * [curl_post 发送get数据]
 * @param  [type] $url    [description]
 * @param  array  $params [description]
 * @return [type]         [description]
 */
function curl_get($url,array $params = array(),$header = array('Content-Type: application/json')){
    $ch = curl_init();
    curl_setopt($ch,CURLOPT_URL,$url);
    curl_setopt($ch,CURLOPT_HEADER,0);
    curl_setopt($ch,CURLOPT_RETURNTRANSFER,1);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch,CURLOPT_HTTPHEADER,$header);
    $data = curl_exec($ch);
    curl_close($ch);
    return ($data);
}
/**
 * 审批进度
 */
function approval_progress_old($id='',$approval_car_info='')
{
    $is_deal_approval=0;
    if($approval_car_info['type']==1){//普通审批
        $setting_info = db('dc_approval_setting')->where(['soft_delete' => 1])->order('approver_order desc')->select();
        foreach ($setting_info as $k => $v) {
            $leader_arr=[];
            $role_user_arr=[];
            //上级主管
            if ($v['approver_type'] == 1) {
                $return = upper_ids($approval_car_info['department_id']); //上级主管
                $leader_arr= $return['leader_arr'];
                $leader_arr_ids= $return['leader_arr_ids'];
                foreach ($leader_arr_ids as $kk=>$vv){
                    $log_info = db('dc_approval_log a')
                        ->field('a.approver_id,a.status,a.create_time,b.name,b.avatar')
                        ->join('a_user b', 'a.approver_id = b.userid  and a.status', 'left')
                        ->where(['a.approval_id'=>$id,'a.approver_type'=>1,'a.order'=>$v['approver_order'],'a.approver_id'=>$vv])
                        ->find();
                    $is_deal_approval=(!empty($log_info) && $is_deal_approval!=1)?1:$is_deal_approval;
                    $leader_arr[$kk]['is_approval']=(empty($log_info))?0:$log_info['status'];
                    $leader_arr[$kk]['is_approval_time']=(empty($log_info))?0:$log_info['create_time'];
                }
                $department_info=db('a_department')->where(['id'=>$approval_car_info['department_id']])->find();
                $setting_info[$k]['dep_name']=(empty($department_info))?'':$department_info['dep_name'];
            }
            if ($v['approver_type'] == 2) {
                $role_user_arr=db('a_role')->field('id,role_name')->where('id in ('.$v['role_id'].')')->select();
                $max_time=0;
                foreach ($role_user_arr as $kk=>$vv){
                    $role_users = role_users($vv['id']);
                    foreach ($role_users as $kkk=>$vvv){
                        $log_info = db('dc_approval_log a')
                            ->field('a.status,a.create_time,b.name,b.avatar')
                            ->join('a_user b', 'a.approver_id = b.id  and a.status', 'left')
                            ->where(['a.approval_id'=>$id,'a.approver_type'=>2,'a.order'=>$v['approver_order'],'a.approver_id'=>$vvv['userid']])
                            ->find();
                        $is_deal_approval=(!empty($log_info) && $is_deal_approval!=1)?1:$is_deal_approval;
                        $role_users[$kkk]['is_approval']=$log_info['status'];
                        $role_users[$kkk]['is_approval_time']=(empty($log_info['create_time']))?0:$log_info['create_time'];
                        $max_time=($log_info['create_time']>$max_time && !empty($log_info['create_time']))?$log_info['create_time']:$max_time;
                    }

                    $role_user_arr[$kk]['role_users']=array_sort($role_users,'is_approval_time');
                    $role_user_arr[$kk]['approval_time']=$max_time;
                }
            }
            $setting_info[$k]['leader_arr']=(empty($leader_arr))?$leader_arr:array_sort($leader_arr, 'is_approval_time');//排序;
            $setting_info[$k]['role_user_arr']=(empty($role_user_arr))?$role_user_arr:array_sort($role_user_arr,'approval_time');
            $setting_info[$k]['is_deal_approval']=$is_deal_approval;
        }
    }else{//直接审批
        $setting_info[0]=db('dc_approval_log a')
            ->field('a.*,b.name,b.role_name')
            ->join('a_role b', 'a.role_id = b.id', 'left')
            ->where(['a.approval_id'=>$id,'a.status'=>1])
            ->find();
        $role_user_arr=db('a_user')->where(['userid'=>session('wx_userid')['userid']])->select();
        $setting_info[0]['role_user_arr']=$role_user_arr;
        $setting_info[0]['leader_arr']=[];
        $setting_info[0]['is_deal_approval']=1;
    }

    return $setting_info;
}
/**
 * 审批进度
 */
function approval_progress($id='',$approval_car_info='',$is_check=0)
{
    if($approval_car_info['type']==1){//普通审批
        $setting_info = db('dc_approval_setting')->where(['soft_delete' => 1,'date_type'=>$approval_car_info['date_type']])->order('approver_order asc')->select();
        foreach ($setting_info as $k => $v) {
            $leader_arr=[];
            $role_user_arr=[];
            $json_role=[];
            $is_deal_approval=0;
            //上级主管
            if ($v['approver_type'] == 1) {
                $return = upper_ids($approval_car_info['department_id']); //上级主管
                $leader_arr= $return['leader_arr'];
                $leader_arr_ids= $return['leader_arr_ids'];
                foreach ($leader_arr_ids as $kk=>$vv){
                    $log_info = db('dc_approval_log a')
                        ->field('a.approver_id,a.status,a.create_time,b.name,b.avatar')
                        ->join('a_user b', 'a.approver_id = b.userid  and a.status', 'left')
                        ->where(['a.approval_id'=>$id,'a.approver_type'=>1,'a.order'=>$v['approver_order'],'a.approver_id'=>$vv])
                        ->find();
                    $is_deal_approval=(!empty($log_info) && $is_deal_approval!=1)?1:$is_deal_approval;
                    $leader_arr[$kk]['is_approval']=(empty($log_info))?0:$log_info['status'];
                    $leader_arr[$kk]['is_approval_time']=(empty($log_info))?0:$log_info['create_time'];
                }
                //上级为空
                if(empty($leader_arr_ids)){
                    $leader_log_info = db('dc_approval_log a')
                        ->field('a.approver_id,a.status,a.create_time,b.name,b.avatar')
                        ->join('a_user b', 'a.approver_id = b.userid  and a.status', 'left')
                        ->where(['a.approval_id'=>$id,'a.approver_type'=>1,'a.order'=>$v['approver_order'],'a.approver_id'=>0])
                        ->find();
                    if($leader_log_info){
                        $is_deal_approval=1;
                    }
                }
                $department_info=db('a_department')->where(['id'=>$approval_car_info['department_id']])->find();
                $setting_info[$k]['dep_name']=(empty($department_info))?'':$department_info['dep_name'];
            }
            if ($v['approver_type'] == 2) {
                $role_user_arr=db('a_role')->field('id,role_name')->where('id in ('.$v['role_id'].')')->select();
                foreach ($role_user_arr as $kk=>$vv){
                    $role_users = role_users($vv['id']);
                    foreach ($role_users as $kkk=>$vvv){
                        $log_info = db('dc_approval_log a')
                            ->field('a.status,a.create_time,b.name,b.avatar')
                            ->join('a_user b', 'a.approver_id = b.id  and a.status', 'left')
                            ->where(['a.approval_id'=>$id,'a.approver_type'=>2,'a.order'=>$v['approver_order'],'a.approver_id'=>$vvv['userid']])
                            ->find();
                        $is_deal_approval=(!empty($log_info) && $is_deal_approval!=1)?1:$is_deal_approval;
                        $data['is_approval']=(empty($log_info['status']))?0:$log_info['status'];
                        $data['is_approval_time']=(empty($log_info['create_time']))?0:$log_info['create_time'];
                        $data['name']=$vvv['name'];
                        $data['role_name']=$vv['role_name'];
                        $data['avatar']=$vvv['avatar'];
                        $json_role[]=$data;
                    }
                }
            }
            $setting_info[$k]['leader_arr']=(empty($leader_arr))?$leader_arr:array_sort($leader_arr, 'is_approval_time');//排序;
            $setting_info[$k]['role_user_arr']=(empty($json_role))?$json_role:array_sort($json_role, 'is_approval_time');
            if($v['approver_type'] == 1 && empty($leader_arr_ids) && $approval_car_info['status']!=3){
                if($k==0){
                    $is_deal_approval=1;
                }
                if($k==1){
                    if($approval_car_info['status']==0){
                        $order=approvalOrder($id);
                        if($order>=$v['approver_order']){
                            $is_deal_approval=1;
                        }
                    }
                    if($approval_car_info['status']==2){
                        $last_order=db('dc_approval_log')->where(['approval_id'=>$id,'is_last'=>1])->value('order');
                        if($last_order>=$v['approver_order']){
                            $is_deal_approval=1;
                        }
                    }
                }
            }
            if($approval_car_info['status']==3){
                $last_order=db('dc_approval_log')->where(['approval_id'=>$id,'is_last'=>1])->value('order');
                if($last_order>=$v['approver_order']){
                    $is_deal_approval=1;
                }
            }
            $setting_info[$k]['is_deal_approval']=($is_check==1 && ((count($setting_info)-1)==$k) && $approval_car_info['status']!=3&& $approval_car_info['status']!=2)?1:$is_deal_approval;
            $setting_info[$k]['approval_role']=$role_user_arr;
            //每层级最后一个审批时的状态
            $setting_info[$k]['last_approval_status']=db('dc_approval_log')->where(['approval_id'=>$id,'is_order_last'=>1,'order'=>$v['approver_order']])->value('status');
        }
    }else{//直接审批
        $log_info=db('dc_approval_log a')
            ->field('a.*,b.role_name,c.name,c.avatar')
            ->join('a_role b', 'a.role_id = b.id', 'left')
            ->join('a_user c', 'a.approver_id = c.userid', 'left')
            ->where(['a.approval_id'=>$id,'a.status'=>1])
            ->find();
        $role_user_arr=db('a_role')->field('id,role_name')->where('id in ('.$log_info['role_id'].')')->select();
        $data['is_approval']=(empty($log_info['status']))?0:$log_info['status'];
        $data['is_approval_time']=(empty($log_info['create_time']))?0:$log_info['create_time'];
        $data['name']=(empty($log_info['name']))?'':$log_info['name'];
        $data['role_name']=(empty($log_info['role_name']))?'':$log_info['role_name'];
        $data['avatar']=(empty($log_info['avatar']))?'':$log_info['avatar'];
        $json_role[]=$data;
        $setting_info[0]['role_user_arr']=$json_role;
        $setting_info[0]['leader_arr']=[];
        $setting_info[0]['is_deal_approval']=1;
        $setting_info[0]['approval_role']=$role_user_arr;
        $setting_info[0]['last_approval_status']=$log_info['status'];
    }

    return $setting_info;
}
/**
 * 审批提交页面进度
 */
function check_progress($department_id,$date_type=0)
{
    $date_type=($date_type==0)?1:2;
    $setting_info = db('dc_approval_setting')->where(['soft_delete' => 1,'date_type'=>$date_type])->order('approver_order asc')->select();
    foreach ($setting_info as $k => $v) {
        $leader_arr=[];
        $role_user_arr=[];
        //上级主管
        if ($v['approver_type'] == 1) {
            $return = upper_ids($department_id); //上级主管
            $leader_arr= $return['leader_arr'];
            $department_info=db('a_department')->where(['id'=>$department_id])->find();
            $setting_info[$k]['dep_name']=(empty($department_info))?'':$department_info['dep_name'];
        }
        $setting_info[$k]['leader_arr']=$leader_arr;
        //角色
        if ($v['approver_type'] == 2) {
            $role_info=db('a_role')->field('id,role_name')->where('id in ('.$v['role_id'].')')->select();
            foreach ($role_info as $kk=>$vv){
                $role_user_arr[$kk]['role_name']=$vv['role_name'];
            }
        }
        $setting_info[$k]['role_user_arr']=$role_user_arr;
    }
    return $setting_info;
}
/**
 * 部门上级主管
 */
function upper_ids($department_id){
    $leader_arr=[];
    $leader_arr_ids=[];
    $all_user=db('a_user')->where(['soft_delete'=>1])->group('id')->select();
    foreach ($all_user as $k=>$v){
        $department=explode(',',$v['department']);
        $offset=array_search($department_id,$department);
        if($offset!==false){
            $is_leader_in_dept=explode(',',$v['is_leader_in_dept']);
            if($is_leader_in_dept[$offset]==1){
                $leader_info=db('a_user')->where(['userid'=>$v['userid']])->find();
                $upper['userid']=(empty($leader_info))?'':$leader_info['userid'];
                $upper['name']=(empty($leader_info))?'':$leader_info['name'];
                $upper['avatar']=(empty($leader_info))?'':$leader_info['avatar'];
                $upper['is_approval']=0;
                $upper['is_approval_time']=0;
                $leader_arr[]=$upper;
                $leader_arr_ids[]=$upper['userid'];
                $upper=[];
            }
        }
    }
    $data['leader_arr']=$leader_arr;
    $data['leader_arr_ids']=$leader_arr_ids;
    return $data;
}
/**
 * 角色包含的人员
 */
function role_users($role_id){
    $role_users=db('a_user a')
        ->field('a.name,a.avatar,a.userid')
        ->join('a_role b', 'b.id = a.u_roles')
        ->where('a.soft_delete=1 and b.id='.$role_id)
        ->select();
    foreach ($role_users as $k=>$v){
        $role_users[$k]['is_approval']=0;
        $role_users[$k]['is_approval_time']=0;
    }
    return $role_users;
}
/**
 * 获取用户是领导的部门
 */
function is_leader_department($user){
    $department=explode(',',$user['department']);
    $is_leader_in_dept=explode(',',$user['is_leader_in_dept']);
    $is_leader_department='';//是领导的部门
    if(!empty($is_leader_in_dept)){
        for ($i = 0; $i < count($department); $i++) {
            if ($is_leader_in_dept[$i] == 1) {
                $is_leader_department .= $department[$i] . ',';
            }
        }
    }
    return rtrim($is_leader_department,',');
}
/**二维数组排序*/
function array_sort($arr_old, $keys, $type = 'desc') {
    $arr=[];
    foreach ($arr_old as $k=>$v){
        $arr[]=$v;
    }
    $len = count($arr);
    for($key1=0;$key1<$len;$key1++)
    {
        for($j=0;$j<$len-$key1-1;$j++){
            if($arr[$j][$keys]<$arr[$j+1][$keys]){
                $temp = $arr[$j];
                $arr[$j] = $arr[$j+1];
                $arr[$j+1] = $temp;
            }
        }
    }
    return $arr;
}
/**二维数组去重*/
function second_array_unique_bykey($arr, $key){
    $tmp_arr = array();
    foreach($arr as $k => $v)
    {
        if(in_array($v[$key], $tmp_arr))   //搜索$v[$key]是否在$tmp_arr数组中存在，若存在返回true
        {
            unset($arr[$k]); //销毁一个变量  如果$tmp_arr中已存在相同的值就删除该值
        }
        else {
            $tmp_arr[$k] = $v[$key];  //将不同的值放在该数组中保存
        }
    }
    //ksort($arr); //ksort函数对数组进行排序(保留原键值key)  sort为不保留key值
    return $arr;
}
/**当前用户是否属于审批角色*/
function is_approval_roles($setting_info){
    $role_ids='';
    foreach ($setting_info as $k=>$v){
        if($v['approver_type']==2){
            $role_ids.=$v['role_id'].',';
        }
    }
    if($role_ids!=''){
        $approval_role=db('a_user')->where('userid="'.session('wx_user')['userid'].'" and u_roles in('.rtrim($role_ids,',').')')->find();
        $is_approval_role=(empty($approval_role))?0:1; //是否属于审批角色
    }else{
        $is_approval_role=0;
    }
    return $is_approval_role;
}
/**当前用户是否属于审批角色和审批角色层级*/
function user_roles($setting_info){
    $role_user_arr=[];
    foreach ($setting_info as $k=>$v){
        if($v['approver_type']==2){
            $user=db('a_user')->where('userid="'.session('wx_user')['userid'].'" and u_roles in('.rtrim($v['role_id'],',').')')->find();
            if($user){
                $role_user_arr[]=$v['approver_order'];
            }
        }
    }
    return $role_user_arr;
}
/**多维数组转字符串 */
function arrayToString($arr) {
    if (is_array($arr)){
        return implode(',', array_map('arrayToString', $arr));
    }
    return $arr;
}
/**当前操作审批人层级*/
function approverOrder($approval_id){
    $order=1;
    $approval_info = db('dc_approval_car')->where(['soft_delete' => 1, 'id' => $approval_id, 'status' => 0])->find();
    $last_order = db('dc_approval_log')->where(['approval_id' => $approval_id, 'is_order_last' => 1])->order('order desc')->value('order');
    $is_deal = db('dc_approval_log')->where(['approval_id' => $approval_id, 'approver_id' => session('wx_user')['userid'], 'order' => $last_order+1])->find();
    if ($last_order) {
        $approval_setting = db('dc_approval_setting')->where(['soft_delete' => 1, 'approver_order' => $last_order + 1,'date_type'=>$approval_info['date_type']])->find();
        $max_approval_order = db('dc_approval_setting')->where(['soft_delete' => 1,'date_type'=>$approval_info['date_type']])->order('approver_order desc')->max('approver_order');
        if ($max_approval_order != $last_order || $approval_info['status'] == 0) {
            if ($approval_setting['approver_type'] == 1) {
                $upper_arr_ids = upper_ids($approval_info['department_id'])['leader_arr_ids'];
                if (in_array(session('wx_user')['userid'], $upper_arr_ids) && !$is_deal) {
                    $order = $last_order + 1;
                }
            } else {
                $role_userid_arr = approvalRoleUsers($approval_setting['role_id']);
                if (in_array(session('wx_user')['userid'], $role_userid_arr) && !$is_deal) {
                    $order = $last_order + 1;
                }
            }
        }
    }
    return $order;
}
function approvalRoleUsers($role_id){
    $role_userid_arr=[];
    $role_id=explode(',',$role_id);
    for($i=0;$i<count($role_id);$i++){
        if(!empty(role_users($role_id[$i]))){
            $role_users=role_users($role_id[$i]);
            for($j=0;$j<count($role_users);$j++){
                $role_userid_arr[]=$role_users[$j]['userid'];
            }

        }
    }
    return $role_userid_arr;
}
/**当前审批层级*/
function approvalOrder($approval_id){
    $info=db('dc_approval_car')->where(['id'=>$approval_id])->find();
    $setting_info = db('dc_approval_setting')->field('role_id,approver_type,approver_order,type')->where(['soft_delete' => 1,'date_type'=>$info['date_type']])->order('approver_order asc')->select();
    $count=db('dc_approval_log')->where(['approval_id'=>$approval_id])->count();
    $order=1;
    $leader_arr_ids=upper_ids($info['department_id']);
    if($count!=0){
        //审批每级审批数据
        foreach ($setting_info as $k=>$v){
            $role_userid_arr=[];
            if($v['type']==1){
                $log_count=db('dc_approval_log')->where(['approval_id'=>$approval_id,'order'=>$v['approver_order']])->count();
                if($v['approver_type']==1){//上级
                    if($log_count==count($leader_arr_ids) && $v['approver_order']!=count($setting_info)){
                        $order+=1;
                    }
                    //当前层级审批为上级，但上级为空时，直接跳到下一级
                    if(empty($leader_arr_ids['leader_arr_ids']) && $v['approver_order']!=count($setting_info)){
                        $order+=1;
                    }
                }
                if($v['approver_type']==2){//角色
                    $role_id=explode(',',$v['role_id']);
                    for($i=0;$i<count($role_id);$i++){
                        if(!empty(role_users($role_id[$i]))){
                            $role_users=role_users($role_id[$i]);
                            for($j=0;$j<count($role_users);$j++){
                                $role_userid_arr[]=$role_users[$j]['userid'];
                            }
                        }
                    }
                    if($log_count==count($role_userid_arr) && $v['approver_order']!=count($setting_info)){
                        $order+=1;
                    }
                }
            }else{
                $log_count=db('dc_approval_log')->where(['approval_id'=>$approval_id,'order'=>$v['approver_order']])->count();
                if($log_count!=0 && $v['approver_order']!=count($setting_info)){
                    $order+=1;
                }
                if($v['approver_type']==1 && $v['approver_order']!=count($setting_info)){
                    if(empty($leader_arr_ids['leader_arr_ids'])){
                        $order+=1;
                    }
                }
            }
        }
    }
    if($count==0 && $setting_info[0]['approver_type']==1 && empty($leader_arr_ids['leader_arr_ids']) && $setting_info[0]['approver_order']!=count($setting_info)){
        $order+=1;
    }
    return $order;
}
/**当前操作审批人层级是否为最后层级中的最后一个操作的*/
function isLast($approval_id){
    $islast=0;
    $is_upper=0;
    $is_role=0;
    $approverOrder=approverOrder($approval_id);
    $approval_info = db('dc_approval_car')->where(['soft_delete' => 1, 'id' => $approval_id, 'status' => 0])->find();
    $max_approval_order = db('dc_approval_setting')->where(['soft_delete' => 1,'date_type'=>$approval_info['date_type']])->order('approver_order desc')->max('approver_order');
    $max_approval_setting = db('dc_approval_setting')->where(['soft_delete' => 1,'date_type'=>$approval_info['date_type']])->order('approver_order desc')->find();
    $max_approval_count=db('dc_approval_log')->where(['approval_id' => $approval_id,'order'=>$max_approval_order])->count();
    if($approval_info['status']==0){
        $upper_arr_ids = upper_ids($approval_info['department_id'])['leader_arr_ids'];
        $role_userid_arr = empty($max_approval_setting['role_id'])?[]:approvalRoleUsers($max_approval_setting['role_id']);
        if (in_array(session('wx_user')['userid'], $upper_arr_ids)){
            $is_upper=1;
        }
        if (in_array(session('wx_user')['userid'], $role_userid_arr)){
            $is_role=1;
        }
        if($max_approval_setting['type']==1){//会签
            if ($max_approval_setting['approver_type'] == 1 && $is_upper==1){//上级
                if(count($upper_arr_ids)==$max_approval_count+1){
                    $islast=1;
                }
            }
            if ($max_approval_setting['approver_type'] == 2 && $is_role==1){//角色
                if(count($role_userid_arr)==$max_approval_count+1){
                    $islast=1;
                }
            }
        }else{//或签
            if($max_approval_count==0 && $max_approval_order==$approverOrder){
                $islast=1;
            }
        }
        if($is_upper==1 && $max_approval_setting['approver_type']!=1){ //又是上级又是角色
            $upper_approval_setting= db('dc_approval_setting')->where(['soft_delete' => 1,'approver_type'=>1,'date_type'=>$approval_info['date_type']])->find();
            if($upper_approval_setting){
                $count=db('dc_approval_log')->where(['approval_id' => $approval_id,'order'=>$upper_approval_setting['approver_order'],'approver_id'=>session('wx_user')['userid']])->count();
                if($count==0){
                    $islast=0;
                }
            }
        }
    }
    return $islast;
}
function isLastTwo($approval_id){
    //当前用户层级是否最倒数第二级、下一级为上级主管并为空
    $islast=0;
    $approval_info = db('dc_approval_car')->where(['soft_delete' => 1,'id'=>$approval_id,'status'=>0])->find();
    $setting_info = db('dc_approval_setting')->field('id,role_id,approver_type,approver_order,type')->where(['soft_delete' => 1,'date_type'=>$approval_info['date_type']])->order('approver_order asc')->select();
    $order=approverOrder($approval_id);
    $max_order=count($setting_info);
    $leader_arr_ids=upper_ids($approval_info['department_id']);
    $setinfo=db('dc_approval_setting')->where(['soft_delete'=>1,'approver_order'=>$order,'date_type'=>$approval_info['date_type']])->find();
    if((($max_order-1)== $order && $setting_info[$max_order-1]['approver_type']==1 && empty($leader_arr_ids['leader_arr_ids'])) && $setinfo['type']==2){
        $islast=1;
    }
    //用户是否是当前层级最后一个
    if($setinfo['approver_type']==1 && (($max_order-1)== $order && $setting_info[$max_order-1]['approver_type']==1 && empty($leader_arr_ids['leader_arr_ids']))){
        if($setinfo['type']){//会签
            $count=db('dc_approval_log')->where(['approval_id'=>$approval_id,'order'=>$order])->count();
            if($count==(count($leader_arr_ids)-1)){
                $islast=1;
            }
        }else{
            $islast=1;
        }

    }
    if($setinfo['approver_type']==2 && ($max_order-1)== $order && $setting_info[$max_order-1]['approver_type']==1 && empty($leader_arr_ids['leader_arr_ids'])){
        $role_id=explode(',',$setinfo['role_id']);
        for($i=0;$i<count($role_id);$i++){
            if(!empty(role_users($role_id[$i]))){
                $role_users=role_users($role_id[$i]);
                for($j=0;$j<count($role_users);$j++){
                    $role_userid_arr[]=$role_users[$j]['userid'];
                }
            }
        }
        if($setinfo['type']){//会签
            $count=db('dc_approval_log')->where(['approval_id'=>$approval_id,'order'=>$order])->count();
            if($count==(count($role_userid_arr)-1)){
                $islast=1;
            }
        }else{
            $islast=1;
        }
    }
    return $islast;
}
/**当前操作审批人否为第一个操作的*/
function isFirst($approval_id){
    $isfirst=0;
    $where[] = ['approver_id','neq',0];
    $where[] = ['approval_id','=',$approval_id];
    $approval_log_count=db('dc_approval_log')->where($where)->count();
    if($approval_log_count==0){
        $isfirst=1;
    }
    return  $isfirst;
}
/**审批人当前级别是否有权限操作*/
function isCanDeal($approval_id){
    $iscan=0;
    $approval_info = db('dc_approval_car')->where(['soft_delete' => 1,'id'=>$approval_id,'status'=>0])->find();
    $last_order=db('dc_approval_log')->where(['approval_id'=>$approval_id,'is_order_last'=>1])->order('order desc')->value('order');
    if($last_order){
        $approval_setting=db('dc_approval_setting')->where(['soft_delete'=>1,'approver_order'=>$last_order+1,'date_type'=>$approval_info['date_type']])->find();
        $max_approval_order=db('dc_approval_setting')->where(['soft_delete'=>1,'date_type'=>$approval_info['date_type']])->order('approver_order desc')->max('approver_order');
        $is_deal=db('dc_approval_log')->where(['approval_id'=>$approval_id,'approver_id'=>session('wx_user')['userid'],'order'=>$last_order+1])->find();
        if($max_approval_order!=$last_order || $approval_info['status']==0){
            if($approval_setting['approver_type']==1){
                $upper_arr_ids=upper_ids($approval_info['department_id'])['leader_arr_ids'];
                if(in_array(session('wx_user')['userid'],$upper_arr_ids) && !$is_deal){
                    $iscan=1;
                }
            }else{
                $role_userid_arr=(empty($approval_setting))?[]:approvalRoleUsers($approval_setting['role_id']);
                if(in_array(session('wx_user')['userid'],$role_userid_arr) && !$is_deal){
                    $iscan=1;
                }
            }
        }
    }else{
        $first_approval_order = db('dc_approval_setting')->where(['soft_delete' => 1,'approver_order'=>1,'date_type'=>$approval_info['date_type']])->find();
        $is_deal=db('dc_approval_log')->where(['approval_id'=>$approval_id,'approver_id'=>session('wx_user')['userid'],'order'=>1])->find();
        if ($first_approval_order['approver_type'] == 1) {
            $upper_arr_ids = upper_ids($approval_info['department_id'])['leader_arr_ids'];
            if (in_array(session('wx_user')['userid'], $upper_arr_ids) && !$is_deal) {
                $iscan=1;
            }
        } else {
            $role_userid_arr=(empty($first_approval_order))?[]:approvalRoleUsers($first_approval_order['role_id']);
            if (in_array(session('wx_user')['userid'], $role_userid_arr) && !$is_deal) {
                $iscan=1;
            }
        }

    }
    return $iscan;
}
/**推送消息*/
function sendMsg($touser='',$data,$type=1,$status=0){
    //type=1申请人 2催办 3司机 4调度人/车队主管  5通知司机取消派车
    if($type==2){
        $title='派车审批催办通知';
    }else if($type==5){
        $title='派车审批取消通知';
    }else{
        $title='派车审批通知';
    }
    if($type==1){
        $name=($status==2)?'你的用车申请已驳回':'你的用车申请已审批通过';
    }else if($type==2){
        $name=$data['name'].'的用车申请';
    }else if($type==3){
        $name='派给我的接车任务';
    }else if($type==5){
        $name='派给我的接车任务已被申请人取消';
    }else{
        $name=$data['name'].'的用车申请已审批通过';
    }
    $access_token = get_wx_token('qywx_token','app_secret','api');
    $url=WX_DOMAIN."cgi-bin/message/send?access_token=".$access_token;
    $content["title"] = $title;
    $content["description"] = "<div>".$name."</div>
            					<div>开始时间：".date('Y-m-d',$data['start_time'])."</div>
            					<div>用车事由：{$data['cause']}</div>";
//    $content["url"] = $_SERVER['HTTP_HOST']."/m/dist/#notice/info/".$data['id'];
    $data['jump_url']=urlencode($_SERVER['HTTP_HOST']."/m/dist/#notice/info/".$data['id']);
    $content["url"] = $_SERVER['SERVER_NAME']."/api/Index/wxwork_login_href?jump_url=".$data['jump_url'];
    $msg["touser"] = $touser;
    $msg["msgtype"] = "textcard";
    $msg["agentid"] = corpInfo('api')['app_id'];
    $msg["textcard"] = $content;
    $msg_res = json_decode(curl_post($url,$msg),true);
    if($msg_res['errcode']!=0){
        return ["code"=>0,"msg"=>'发送失败 <br> 详情：'.$msg_res["errmsg"]];
    }else{
        $touser=explode('|',$touser);
        $touser=implode(',',$touser);
        db('dc_send_msg')->insert(['approval_id'=>$data['id'],'name'=>$name,'start_time'=>$data['start_time'],'cause'=>$data['cause'],
            'userid'=>$touser,'type'=>$type,'create_time'=>time()]);
        return ['code'=>1,'msg'=>'成功'];
    }
}
function getCarAdmin() {
    $role=db('a_role')->field('id')->where("id in (2,3)")->select();
    $role_id='';
    $userid='';
    foreach ($role as $k=>$v){
        $role_id.=$v['id'].',';
    }
    $user=(empty($role_id))?[]:db('a_user')->field('userid')->where('soft_delete=1 and u_roles in('.rtrim($role_id,',').')')->select();
    foreach ($user as $k=>$v){
        $userid.=$v['userid'].'|';
    }
    return $userid;
}
function  commpayInfo(){
    $commpay_info=db('a_company_info')->where(['id'=>1])->find();
    return $commpay_info;
}
function  corpInfo($api='api'){
    $corp_info=db('a_app_settings')->where(['app_code'=>$api])->find();
    return $corp_info;
}
/**审批第一级是否是上级并且上级为空*/
function upperIsNull($department_id,$date_type=1){
    $upper_is_null=0;
    $setinfo=db('dc_approval_setting')->where(['soft_delete'=>1,'approver_order'=>1,'date_type'=>$date_type])->find();
    if($setinfo['approver_type']==1){
        $leader_arr=upper_ids($department_id);
        $leader_arr_ids=$leader_arr['leader_arr_ids'];
        if(empty($leader_arr_ids)){
            $upper_is_null=1;
        }
    }
    return $upper_is_null;
}
function isOrderLast($approval_id){
    $isOrderLast=0;
    $approverOrder=approverOrder($approval_id);
    $approval_info = db('dc_approval_car')->where(['soft_delete' => 1, 'id' => $approval_id, 'status' => 0])->find();
    $approval_setting = db('dc_approval_setting')->where(['soft_delete' => 1, 'approver_order' => $approverOrder,'date_type'=>$approval_info['date_type']])->find();
    $log_count = db('dc_approval_log')->where(['approval_id' => $approval_id, 'order' => $approverOrder])->count();
    $upper_arr_ids = upper_ids($approval_info['department_id'])['leader_arr_ids'];
    if($approval_setting['approver_type'] == 2){
        $role_userid_arr = approvalRoleUsers($approval_setting['role_id']);
    }
    if ($approval_setting['approver_type'] == 1 && in_array(session('wx_user')['userid'], $upper_arr_ids)) {
        if($approval_setting['type']==1){
            if (count($upper_arr_ids) == $log_count + 1) {
                $isOrderLast = 1;
            }
        }else{
            $isOrderLast = 1;
        }
    }
    if ($approval_setting['approver_type'] == 2 && in_array(session('wx_user')['userid'], $role_userid_arr)) {
        if($approval_setting['type']==1){
            if (count($role_userid_arr) == $log_count + 1) {
                $isOrderLast = 1;
            }
        }else{
            $isOrderLast = 1;
        }
    }
    return $isOrderLast;
}
/**下一级是否上级并为空，但是现在不是倒数第二级*/
function nextIsNull($approverorder,$approval_id){
    $isnull=0;
    $approval_info = db('dc_approval_car')->where(['soft_delete' => 1,'id'=>$approval_id,'status'=>0])->find();
    $upper_arr_ids=upper_ids($approval_info['department_id'])['leader_arr_ids'];
    $approval_setting=db('dc_approval_setting')->where(['soft_delete'=>1,'approver_order'=>$approverorder+1,'date_type'=>$approval_info['date_type']])->find();
    if($approval_setting['approver_type']==1 && empty($upper_arr_ids)){
        $isnull=1;
    }
    return $isnull;
}
/**是否是节假日*/
function isHoliday($dates){
    $time=date('Y-n',$dates);
    $date=date('Y-n-j',$dates);
    $status=0;
    $url = __ROOT__."/".$time."holiday.txt";
    if(!file_exists($url)){
        $holiday=getHoliday($time);
        file_put_contents($time.'holiday.txt',$holiday);
    }else{
        $holiday = file_get_contents($url);
    }
    if($holiday){
        $holiday=json_decode($holiday,true);
        foreach ($holiday as $k=>$v){
            $year=explode('-',$v['festival']);
            $year=$year[0].'-'.$year[1];
            if($year==$time){
                foreach ($v['list'] as $kk=>$vv){
                    if($vv['date']==$date && $vv['status']==1){
                        $status=$vv['status'];
                    }
                }
            }
        }
    }
    return $status;
}
/**获取节假日*/
function getHoliday($time)
{
    $url='http://v.juhe.cn/calendar/month?year-month='.$time.'&key=04f60d408053429025df624c915e75d7';
    $return = file_get_contents($url);
    try{
        $data=json_decode($return,true);
        if($data['error_code']==0){
            $holiday=$data['result']['data'];
            return $holiday['holiday'];
        }else{
            return '';
        }
    }catch (Exception $e){
        return $e->getMessage();
    }
}
/**通知详情车辆信息*/
function noticeCarInfo($id){
    $approval_car=db('dc_approval_car a')
        ->field('a.travel_mileage,a.status,b.drive_km,a.car_id,b.car_number,d.name as type_name')
        ->join('dc_car b', 'a.car_id = b.id','left')
        ->join('dc_car_type d', 'a.car_type_id = d.id','left')
        ->where('a.id='.$id.' and a.status!=0')
        ->find();
    $car_id=explode(',',$approval_car['car_id']);
    for($i=0;$i<count($car_id);$i++){
        $car_info=db('dc_car a')
            ->field('a.drive_km,a.car_number,b.name as type_name')
            ->join('dc_car_type b', 'a.type_id = b.id','left')
            ->where(['a.id'=>$car_id[$i]])
            ->find();
        $car_info['total_travel_mileage']=db('dc_approval_car')->where(['car_id'=>$car_id[$i],'status'=>1,'car_use_status'=>4])->sum('travel_mileage');
        $pass_car_info['car_info'][$i]=$car_info;
    }
    $out_check_info=db('dc_car_check')->field('prompt,drive_km')->where(['approval_id'=>$id,'type'=>1])->find();
    $pass_car_info['out_check_info']=$out_check_info;
    $return_check_info=db('dc_car_check')->field('prompt,drive_km')->where(['approval_id'=>$id,'type'=>2])->find();
    if($return_check_info){
        $return_check_info['travel_mileage']=$pass_car_info['car_info']['travel_mileage'];
    }
    $pass_car_info['return_check_info']=$return_check_info;
    return $pass_car_info;
}