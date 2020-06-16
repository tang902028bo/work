{__NOLAYOUT__}
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title>跳转提示</title>
    <style type="text/css">
        *{ padding: 0; margin: 0; }
        body{ background: #f5f5f5; font-family: '微软雅黑'; color: #333; font-size: 16px; }
        .system-message{ padding: 50px 48px;text-align: center; min-width: 600px;}
        .system-message h1{ font-size: 100px; font-weight: normal; line-height: 120px; margin-bottom: 12px; }
        .system-message .jump{ padding-top: 12px}
        .system-message .jump a{ color: #333;}
        .system-message .success,.system-message .error{ line-height: 1.8em; font-size: 36px }
        .system-message .detail{ font-size: 18px; line-height: 20px; /*margin-top: 12px;*/ color: #789693;font-weight: bold}
        .error{color: #009688;}
        //.error{color: #33a0e3;}

    </style>
</head>
<body>
<div class="system-message">
    <?php switch ($code) {?>
    <?php case 1:?>
    <div  class="" style="width: 500px;margin: 0 auto;">
    <img style="display:block;margin:0 auto;margin-bottom:40px"  src="/static/images/dispatch_tmp/ss.png"/>
    <label class="success"><?php echo($msg); ?></label>
    </div>
    <?php break;?>
    <?php case 0:?>
    <div  class="" style="width: 500px;margin: 0 auto;">
    <img style="display:block;margin:0 auto;;margin-bottom:40px" src="/static/images/dispatch_tmp/error.png"/>
    <span  class="error">出错啦！</span>
    <p class="detail"> <?php echo($msg); ?> </p>
    </div>
    <?php break;?>
    <?php } ?>

    <p class="jump" style="clear: both;top: -50px;left: 65px;color: #789693;font-size: 16px">
        页面自动 <a id="href"  href="<?php echo($url); ?>">跳转</a> 等待时间： <b id="wait"><?php echo($wait); ?> </b>
        <!--<img align="absmiddle" src="/html/static/tpl_jump/fh.png"/>-->
    </p>
</div>
<script type="text/javascript">

    (function(){
        var wait = document.getElementById('wait'),href = document.getElementById('href').href;
        var interval = setInterval(function(){
            var time = --wait.innerHTML;
            if(time <= 0) {
                location.href = href;
                clearInterval(interval);
            };
        }, 1000);
    })();
</script>
</body>
</html>
