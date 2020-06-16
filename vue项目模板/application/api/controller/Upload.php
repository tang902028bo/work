<?php
namespace app\api\controller;
use app\BaseController;


class Upload extends BaseController
{
    function initialize(){}

    /*文件上传*/
    public function upload(){
        header("Access-Control-Allow-Origin: *");
    	$file = $this->request->file('file');
    	if(count($file)){
    		$file_info=[];
            foreach($file as $k=>$v){
                $info_each = $v->getInfo();
                if(is_img($v->getInfo('name'))){
                    $image = \think\Image::open($info_each['tmp_name']);
                    $image->thumb(1200, 12000)->save($info_each['tmp_name'],'jpg',70); //jpg压缩率更大，如需保留透明背景需改成 png
                }
                $file_info[$k]['name'] = $info_each['name'];
                $save_path = __ROOT__.'/upload/';
                $file_move = $v->move($save_path);
                $save_path = '/upload/'.$file_move->getSaveName();
                $file_info[$k]['save_path']=$save_path;
                $file_info[$k]['size'] =round($file_move->getSize()/1024,2);//转化为kb单位
            }
            return json(['code'=>0,"data"=>$file_info]);
        }else{
            return json(['code'=>0,'msg'=>'请提交文件']);
        }
    }
}