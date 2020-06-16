<?php
/**
 * Created by myPhpStorm.
 * User: Administrator
 * Date: 2019/7/3
 * Time: 15:34
 */

namespace app\structure\service;

/**微信标签
 * Class WxTags
 * @package app\tags\controller
 */
class WxTags
{

    function create($data)
    {
        // TODO: Implement create() method.
        $url = WX_DOMAIN.'cgi-bin/tag/create?';
        if(!isset($data['access_token'])) return ['code'=>0,'msg'=>'错误的token'];
        if(!isset($data['tagname'])) return ['code'=>0,'msg'=>'标签名称不能为空'];
        $url .= 'access_token='.$data['access_token'];
        $res = json_decode(curl_send($url,$data,'post'),1);
        if(isset($res['errcode'])&&$res['errcode']!=0){
            return ['code'=>0,'msg'=>'三方错误：'.lang($res['errcode']),'data'=>$res['errcode']];
            return ['code'=>0,'msg'=>'三方错误：'.$res['errmsg']];
        }
        return $res['tagid'];

    }

    function update($data)
    {
        // TODO: Implement update() method.
        $url = WX_DOMAIN.'cgi-bin/tag/update?';
        if(!isset($data['access_token'])) return ['code'=>0,'msg'=>'错误的token'];
        if(!isset($data['tagname'])) return ['code'=>0,'msg'=>'标签名称不能为空'];
        if(!isset($data['tagid'])) return ['code'=>0,'msg'=>'标签id不能为空'];
        $url .= 'access_token='.$data['access_token'];
        $res = json_decode(curl_send($url,$data,'post'),1);
        if(isset($res['errcode'])&&$res['errcode']!=0){
            return ['code'=>0,'msg'=>'三方错误：'.lang($res['errcode']),'data'=>$res['errcode']];
            if($res['errcode']==81011) return ['code'=>0,'msg'=>'三方错误：没有权限修改'];
            return ['code'=>0,'msg'=>'三方错误：'.$res['errmsg']];
        }
        return true;
    }

    function remove($data)
    {
        $url = WX_DOMAIN.'cgi-bin/tag/delete?';
        $res = json_decode(curl_send($url,$data),1);
        if(isset($res['errcode'])&&$res['errcode']>0){
            return ['code'=>0,'msg'=>'三方错误：'.lang($res['errcode']),'data'=>$res['errcode']];
            if($res['errcode']==81011) return ['code'=>0,'msg'=>'三方错误：没有权限移除'];
            return ['code'=>0,'msg'=>'三方错误：'.$res['errmsg']];
        }
        return true;
    }

    //获取标签列表
    function getList($access_token)
    {
        $url = WX_DOMAIN.'cgi-bin/tag/list?';
        // TODO: Implement getList() method.
        $param = ['access_token'=>$access_token];
        $data = json_decode(curl_send($url,$param),true);

        if(isset($data['errcode'])&&$data['errcode']!=0){
            return ['code'=>0,'msg'=>'三方错误：'.lang($data['errcode']),'data'=>$data['errcode']];
//            return ['code'=>0,'msg'=>'获取标签出错：'.$data['errmsg']];
        }
        return $data['taglist'];
    }

    //获取标签下的成员列表
    function getMemberList($access_token,$tag_id){
        $url = WX_DOMAIN.'cgi-bin/tag/get?';
        $param = [
            'access_token'=>$access_token,
            'tagid' => $tag_id,
        ];
        $data = json_decode(curl_send($url,$param),1);
        if(isset($data['errcode'])&&$data['errcode']!=0){
            return ['code'=>0,'msg'=>'三方错误：'.lang($data['errcode']),'data'=>$data['errcode']];
        }
        return ['userlist'=>$data['userlist'],'partylist'=>$data['partylist']];
    }

    //移除标签下成员
    function removeMember($access_token,$data){
        $url = WX_DOMAIN.'cgi-bin/tag/deltagusers?access_token='.$access_token;
        $datas = json_decode(curl_send($url,$data,'post'),1);
        if(isset($datas['errcode']) && $datas['errcode']!=0){
            return ['code'=>0,'msg'=>'三方错误：'.lang($datas['errcode']),'data'=>$datas['errcode']];
        }
        return true;
    }

    //修改
    function add_member($access_token,$data){
        $url = WX_DOMAIN.'cgi-bin/tag/addtagusers?access_token='.$access_token;
        $datas = json_decode(curl_send($url,$data,'post'),1);
        if(isset($datas['errcode']) && $datas['errcode']!=0){
            return ['code'=>0,'msg'=>'三方错误：'.lang($datas['errcode']),'data'=>$datas['errcode']];
            if($datas['errcode']==81011) return ['code'=>0,'msg'=>'三方错误：没有权限添加该标签成员'];
            return ['code'=>0,'msg'=>'三方错误：'.$datas['errmsg']];
        }
        return true;
    }

}

/**curl请求
 * @param string $url 请求地址
 * @param array $params 请求参数
 * @param string $method 请求方式 get/post
 * @param int $is_json 是否传递json格式
 * @param array $header 头信息
 * @return mixed
 */
function curl_send($url,array $params = array(),$method='get',$is_json=1,array $header = []){
    $url = $method == 'get'?$url.http_build_query($params):$url;
    $params = $is_json?json_encode($params):$params;
    $header = empty($header)?array('Content-Type: application/json','Accept:application/json'):$header;
    $ch = curl_init();
    curl_setopt($ch,CURLOPT_URL,$url);
    curl_setopt($ch,CURLOPT_HEADER,0);
    curl_setopt($ch,CURLOPT_RETURNTRANSFER,1);
    curl_setopt($ch,CURLOPT_CONNECTTIMEOUT,10);
    curl_setopt($ch,CURLOPT_SSL_VERIFYPEER,false);
    if($method =='post'){
        curl_setopt($ch,CURLOPT_POST,1);
        curl_setopt($ch,CURLOPT_POSTFIELDS,$params);
    }
    curl_setopt($ch,CURLOPT_HTTPHEADER, $header);

    $data = curl_exec($ch);
    curl_close($ch);
    return ($data);
}