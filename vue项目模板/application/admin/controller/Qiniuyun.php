<?php
namespace app\api\controller;
use Qiniu\Auth as Auth;
use Qiniu\Storage\UploadManager;
use think\Controller;

class Qiniuyun extends Controller {
    public function autoQiNiu($param)
    {
        vendor('Qiniu.autoload');
        $this->Qiniu = config('Qiniu');

        //获取接口方法名称
        $action = $param['action'];

        //调用接口方法
        $res = $this->$action($param);

        //获取反馈信息
        return $res;
    }

    /**
     * 客户端上传
     * 生成上传凭证
     * @param bucket 域名空间名称
     * @author Linc
     */
    private function upToken()
    {
        // 构建鉴权对象
        $auth = new Auth($this->Qiniu['accessKey'], $this->Qiniu['secretKey']);

        //设置凭证有效期 2小时
        $expires = 7200;

        //自定义上传回复的凭证
        $policy = array(
            'returnBody' => '{"key":"$(key)","hash":"$(etag)","fsize":$(fsize),"bucket":"$(bucket)","name":"$(x:name)"}'
        );

        // 调用 auth 的 uploadToken 方法生成文件上传凭证。
        $upToken = $auth->uploadToken($this->Qiniu['bucket'], null, $expires, $policy, true);

        cache('Qiniu_upToken',$upToken,7200);

        return ['code'=>'1','Status'=>'Success','Message'=>'获取上传凭证成功','Data'=>$upToken];
    }

    /**
     * 服务器端本地文件直传
     * 上传文件至七牛云服务器
     * @param filePath 服务器本地资源路径
     * @param fileKey 保存到空间的文件名称
     * @author Linc
     */
    private function uploadQiNiu($param)
    {
        // 构建鉴权对象
        $auth = new Auth($this->Qiniu['accessKey'], $this->Qiniu['secretKey']);

        // 生成上传 Token
        $token = $auth->uploadToken($this->Qiniu['bucket']);

        // 初始化 UploadManager 对象并进行文件的上传。
        $uploadMgr = new UploadManager();

        // 调用 UploadManager 的 putFile 方法进行文件的上传。
        list($ret, $err) = $uploadMgr->putFile($token,$param['fileKey'],$param['filePath']);

        if ($err)
        {
            return ['Code'=>'202','Status'=>'Fail','Message'=>'文件上传失败'];
        }
        else
        {
            return ['Code'=>'200','Status'=>'Success','Message'=>'文件上传成功'];
        }
    }

    /**
     * 抓取网络资源到空间
     * 上传文件至七牛云服务器
     * @param url 网络资源地址
     * @param fileKey 保存到空间的文件名称
     * @author Linc
     */
    private function interQiNiu($param)
    {
        // 构建鉴权对象
        $auth = new Auth($this->Qiniu['accessKey'], $this->Qiniu['secretKey']);

        // 构建配置对象
        $config = new \Qiniu\Config();

        // 构建资源管理对象
        $bucketManager = new \Qiniu\Storage\BucketManager($auth,$config);

        // 调用 BucketManager 的 fetch 方法进行文件的上传。
        list($ret, $err) = $bucketManager->fetch($param['url'],$this->Qiniu['bucket'],$param['fileKey']);

        if ($err)
        {
            return ['Code'=>'202','Status'=>'Fail','Message'=>'文件上传失败'];
        }
        else
        {
            return ['Code'=>'200','Status'=>'Success','Message'=>'文件上传成功'];
        }
    }

    /**
     * 批量更新文件的有效期
     * @param keyDayPairs 批量更新的文件名称
     * @author Linc
     */
    private function BatchUpdateDays($param)
    {
        // 构建鉴权对象
        $auth = new Auth($this->Qiniu['accessKey'], $this->Qiniu['secretKey']);

        // 构建配置对象
        $config = new \Qiniu\Config();

        // 构建资源管理对象
        $bucketManager = new \Qiniu\Storage\BucketManager($auth, $config);

        //设置超期日期 day=0表示永久存储
        $keys = $param['keys'];
        $keyDayPairs = array();
        foreach ($keys as $key) {
            $keyDayPairs[$key] = $param['day'];
        }

        // 调用 BucketManager 的 buildBatchDeleteAfterDays 方法。
        $ops = $bucketManager->buildBatchDeleteAfterDays($this->Qiniu['bucket'],$keyDayPairs);
        list($ret, $err) = $bucketManager->batch($ops);

        if ($err)
        {
            return ['Code'=>'202','Status'=>'Fail','Message'=>'有效期更新失败'];
        }
        else
        {
            return ['Code'=>'200','Status'=>'Success','Message'=>'有效期更新成功'];
        }
    }

    /**
     * 批量更新文件的类型
     * @param keyDayPairs 批量更新的文件名称
     * @author Linc
     */
    private function BatchUpdateType($param)
    {
        // 构建鉴权对象
        $auth = new Auth($this->Qiniu['accessKey'], $this->Qiniu['secretKey']);

        // 构建配置对象
        $config = new \Qiniu\Config();

        // 构建资源管理对象
        $bucketManager = new \Qiniu\Storage\BucketManager($auth, $config);

        //设置文件类型 type=0表示普通存储，type=1表示低频存储
        $keys = $param['keys'];
        $keyDayPairs = array();
        foreach ($keys as $key) {
            $keyDayPairs[$key] = $param['type'];
        }

        // 调用 BucketManager 的 buildBatchChangeType 方法。
        $ops = $bucketManager->buildBatchChangeType($this->Qiniu['bucket'],$keyDayPairs);
        list($ret, $err) = $bucketManager->batch($ops);

        if ($err)
        {
            return ['Code'=>'202','Status'=>'Fail','Message'=>'文件类型更改失败'];
        }
        else
        {
            return ['Code'=>'200','Status'=>'Success','Message'=>'文件类型更改成功'];
        }
    }

    /**
     * 删除七牛云服务器端文件
     * @param fileKey 要删除的空间的文件名称
     * @author Linc
     */
    private function delQinNiu($param)
    {
        // 构建鉴权对象
        $auth = new Auth($this->Qiniu['accessKey'], $this->Qiniu['secretKey']);

        // 构建配置对象
        $config = new \Qiniu\Config();

        // 构建资源管理对象
        $bucketManager = new \Qiniu\Storage\BucketManager($auth,$config);

        // 调用 bucketManager 的 delete 方法进行文件删除
        $err = $bucketManager->delete($this->Qiniu['bucket'],$param['fileKey']);
        if ($err)
        {
            return ['Code'=>'202','Status'=>'Fail','Message'=>'文件删除失败'];
        }
        else
        {
            return ['Code'=>'200','Status'=>'Fail','Message'=>'文件删除成功'];
        }
    }

    /**
     * 生成缩略图片
     * @param fileKey 要执行压缩的源文件名
     * @param newFileKey 执行压缩后的新文件名
     * @param pipeline 私有列名称 空则表示使用公用队列（处理速度比较慢）
     * @param notifyURL 处理结果通知接收 URL
     * @author Linc
     */
    private function scaleImg($param)
    {
        // 构建鉴权对象
        $auth = new Auth($this->Qiniu['accessKey'], $this->Qiniu['secretKey']);

        // 构建配置对象
        $config = new \Qiniu\Config();

        // 构建资源管理对象
        $pfop = new \Qiniu\Processing\PersistentFop($auth,$config);

        //云处理操作列表
        $saveas_key = \Qiniu\base64_urlSafeEncode($this->Qiniu['bucket'].':'.$param['newFileKey']);
        $param['scale_fops'] = isset($param['scale_fops']) ? $param['scale_fops'] : $this->Qiniu['scale_fops'];
        $fops =  $param['scale_fops'].'|saveas/'.$saveas_key;

        //处理结果通知接收 URL
        $param['notifyURL'] = isset($param['notifyURL']) ? $param['notifyURL'] : '';

        // 调用 PersistentFop 方法进行图片缩放
        list($id,$err) = $pfop->execute($this->Qiniu['bucket'],$param['fileKey'],$fops,$this->Qiniu['pipeline'],$param['notifyURL'],1);

        if ($err)
        {
            return ['Code'=>'202','Status'=>'Fail','Message'=>'图片压缩失败'];
        }
        else
        {
            return ['Code'=>'200','Status'=>'Fail','Message'=>'图片压缩成功','Data'=>['id'=>$id]];
        }
    }

    /**
     * 下载七牛云图片
     */
    private function downQiniuFile($param){
        // 构建鉴权对象
        $auth = new Auth($this->Qiniu['accessKey'], $this->Qiniu['secretKey']);

        // 私有空间中的外链 http://<domain>/<file_key>
        $baseUrl = $param['url'];
        // 对链接进行签名
        $signedUrl = $auth->privateDownloadUrl($baseUrl);

        echo $signedUrl;
    }
}
