<?php
/**
 * Created by myPhpStorm.
 * User: Administrator
 * Date: 2019/9/10
 * Time: 14:00
 */

namespace app\common;


class WxApi
{
    function __construct(){
        try{
            $this->lang = include(__DIR__.'/lang/zh-cn.php');
        }catch (Exception $e){
            trace($e->getMessage(),'error');
            $this->lang = null;
        }
    }

    function lang($name){
        return isset($this->lang[$name])?$this->lang[$name]:$name;
    }

    //应用信息
    function get_App_info($access_token,$agent_id){
        $url = WX_DOMAIN.'cgi-bin/agent/get?access_token='.$access_token."&agentid=".$agent_id;
        $param = [
            'access_token'=>$access_token,
            'agentid'=>$agent_id,
        ];
        $data = json_decode(curl_post($url,$param),true);

        // $data = json_decode(file_get_contents($url.http_build_query($param)),1);
        if(isset($data['errcode'])&&$data['errcode']!=0){
            return ['code'=>0,'msg'=>$this->lang($data['errcode'])];
        }
        return $data;
    }

    //获取部门列表及下级部门
    function get_depList($access_token,$dep_id){
        $url = WX_DOMAIN.'cgi-bin/department/list?access_token='.$access_token."&id=".$dep_id;
        $param = [
            'access_token'=>$access_token,
            'id'=>$dep_id,
        ];
        $data = json_decode(curl_post($url,$param),true);
        // $data = json_decode(file_get_contents($url.http_build_query($param)),1);
        if(isset($data['errcode'])&&$data['errcode']!=0){
            return ['code'=>0,'msg'=>$this->lang($data['errcode'])];
        }
        return $data['department'];
    }

    //获取部门下的人员详情
    function get_dep_userList($access_token,$dep_id,$fetch_child=1){
        $url = WX_DOMAIN.'cgi-bin/user/list?access_token='.$access_token."&department_id=".$dep_id."&fetch_child=".$fetch_child;
        $param = [
            'access_token'=>$access_token,
            'department_id'=>$dep_id,
            'fetch_child'=>$fetch_child
        ];
        $data = json_decode(curl_post($url,$param),true);
        // $data = json_decode(file_get_contents($url.http_build_query($param)),1);
        if(isset($data['errcode'])&&$data['errcode']!=0){
            return ['code'=>0,'msg'=>$this->lang($data['errcode'])];
        }
        return $data['userlist'];
    }

    //获取标签下的人员详情
    function get_tag_userList($access_token,$tag_id){
        $url = WX_DOMAIN.'cgi-bin/tag/get?access_token='.$access_token."&tagid=".$tag_id;
        $param = [
            'access_token'=>$access_token,
            'tagid'=>$tag_id,
        ];
        $data = json_decode(curl_post($url,$param),true);
        if(isset($data['errcode'])&&$data['errcode']!=0){
            return ['code'=>0,'msg'=>$this->lang($data['errcode'])];
        }
        return $data['userlist'];
    }

    //读取用户
    function read_user($access_token,$userid){
        $url = WX_DOMAIN.'cgi-bin/user/get?access_token='.$access_token."&userid=".$userid;
        $param = [
            'access_token'=>$access_token,
            'userid'=>$userid,
        ];
        $data = json_decode(curl_post($url,$param),true);
        // $data = json_decode(file_get_contents($url.http_build_query($param)),1);
        if(isset($data['errcode'])&&$data['errcode']!=0){
            return ['code'=>0,'msg'=>$this->lang($data['errcode'])];
        }
        return $data;
    }

}