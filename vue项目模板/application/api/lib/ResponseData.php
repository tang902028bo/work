<?php
namespace app\api\lib;


class ResponseData{
    public $code;
    public $msg;
    public $data;
    public $return;
    public $pageData;
    public function write( $code = NULL , $msg = NULL , $data = NULL,$pageData=null ){
        header('Content-type:application/json');
        isset($code) ? $this->code = $code : $code= $this->code;
        isset($msg) ? $this->msg = $msg : $msg = $this->msg;
        isset($data) ? $this->data = $data : $data = $this->data ;

        $this->return['code'] = is_null($code) ? 400 : $code;
        $this->return['msg'] = is_null($msg) ? '' : $msg;
        $this->return['data'] = is_null($data) ? '' : $data;
        if(!is_null($data)) $this->return['data'] = $this->replaceNullToString( $data );

        echo json_encode($this->return);
        exit();
    }

    /**
     * 设置返回CODE为成功，如果传入 data 将会输出data
     * @param string $msg
     * @param null $data
     */
    public function success( $msg = null , $data = null )
    {
        $this->data = $data;
        $this->msg = $msg;
        $this->code = 1;
    }
    /**
     * 将数组中的null替换为字符串 空
     * @param $array
     * @return array
     */
    function replaceNullToString($array)
    {
        if (is_array($array)) {
            foreach ($array as $k => $v) {
                if (is_null($array[$k])) {
                    $array[$k] = '';
                } elseif (is_array($array[$k])) {
                    $array[$k] = $this->replaceNullToString($array[$k]);
                }
            }
        }
        return $array;
    }
}
?>