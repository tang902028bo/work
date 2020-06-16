/* 说明:
 * 依赖: jquery , layui
 * 1.默认情况下, 所有(请求、返回)参数中的 dom 对象, 类型都是 jQuery dom
 * 2.使用 public_ 开头的方法;方便全局管理
 * 3.option 参数支持传入 1.对象(使用传入对象属性替换 option 对象,不支持深度复制)  2.方法(直接操作 option 对象)
 * 4.全局变量、事件: 各页面JS都包含在回调或者函数中避免全局污染, 各页面不能为 document 绑定事件,如需绑定全屏事件则使用 body 绑定, 点击导航切换页面时会清空 JQ绑定的body所有事件、layui新绑定的所有事件、所有AJAX请求的回调
 */
//如需使用服务器API,使用控制台运行 localStorage.USE_SERVER_API = 'n9fcdj5hcbb06ku6kjhk196a10'; 如需访问本地API则赋值为'';
var USE_SERVER_API =  window.localStorage && window.localStorage.USE_SERVER_API;
if(USE_SERVER_API) setTimeout(function(){layer.msg('注意：当前使用服务器API',{time:5000})},1000);
var USE_SERVER_URL =  USE_SERVER_API? 'https://crm2019.hostkd8cd8kf9k.mgtx.cn':location.origin;
var DOWNLOAD_HREF = USE_SERVER_URL + '/portal/index/download/?path=';
/** 是否是调试模式 */
var IS_DEBUG = true;
/** 是否是移动端 */
var IS_MOBILE = /Android|iPhone|iPod|SymbianOS|Windows Phone/i.test(navigator.userAgent);
var IS_IPHONE = /iPhone/i.test(navigator.userAgent);
/** 是否是企业微信 */
var IS_WECHAT =  /MicroMessenger/i.test(navigator.userAgent);
/** 是否是钉钉 */
var IS_DING =  /DingTalk/i.test(navigator.userAgent);
/** 是否是IE */
var IS_IE =  !!window.ActiveXObject || "ActiveXObject" in window;
/** 加载框的z-index */
var PUBLIC_LOAD_ZINDEX = 99999999;
/** 当前登录用户属性和方法 */
var USER = {
    id:false,name:false,phone:false,
    auth_list: [],
    /**权限判断 */
    auth_check : function(auth_name){
        if(USER.auth_list[0] === 'all') return true;
        var verify_pass = true;
        var auth_and = auth_name.split('&&');        //and 验证
        var auth_or  = auth_name.split('||');        //or  验证 （暂不支持同时使用or、and）

        if(auth_and.length>1){ $.each(auth_and,function(){ if(USER.auth_list.indexOf(String(this))===-1){ verify_pass = false; } });
        }else if(auth_or.length>1){ if($.grep(auth_or,function(val){ return USER.auth_list.indexOf(val)===-1 }).length === auth_or.length) verify_pass = false;
        }else if(USER.auth_list.indexOf(auth_name)===-1){ verify_pass = false;}

        return verify_pass;
    },
    /**协作人权限判断
     * @param {String} auth_name 权限名称 * @param {String} assist_id 协作人ID * @param {String} handle_id 负责人ID  */
    auth_check_assist: function(auth_name,assist_id,handle_id){
        if(handle_id === USER.id) return true;                                      //负责人则有权限
        if(!assist_id || assist_id.split(',').indexOf(USER.id)===-1) return true;   //不是协作人则有权限
        return USER.auth_check(auth_name);
    }
}
/** 系统配置 */
var SETTING = {
    /**同步类型 */
    sync_type:false,
    /**审批是否开启 */
    approval:false
}

//请求并缓存当前登录用户信息(当前页面刷新则清除用户信息缓存)
if(sessionStorage.prev_href && sessionStorage.prev_href === location.href) {delete sessionStorage.ajax_index_menu_list;}
if(sessionStorage.ajax_index_menu_list) {
    sessionStorage.prev_href = location.href;
    load_index_menu_list( JSON.parse(sessionStorage.ajax_index_menu_list) );
    typeof(page_init)!=='undefined' && page_init();
}else{
    public_ajax('/api/Role_Manger/get_role_power',null,function(data){
        sessionStorage.ajax_index_menu_list = JSON.stringify(data);
        load_index_menu_list(data);
        typeof(page_init)!=='undefined' && page_init();
    });
}

//权限检测(删除没有权限的dom)
function remove_no_auth(origin_dom){
    if(USER.auth_list){
        origin_dom.each(function(key){
            if(!IS_MOBILE && $(this).is('[only_mobile]')) origin_dom.splice(key,1);
            if($(this).is('[auth]') && !USER.auth_check($(this).attr('auth'))) origin_dom.splice(key,1);
        });

        var awit_check_list = origin_dom.find('[auth]');
        awit_check_list.filter(function(){
            return !USER.auth_check($(this).attr('auth'));
        }).remove();
    }
}
function load_index_menu_list(data){
    USER.id     = data.data.userid;
    USER.name   = data.data.user_name;
    USER.phone  = data.data.user_phone;
    USER.avatar = data.data.avatar;
    USER.dep_id = data.data.dep_id;
    USER.dep_name= data.data.dep_name;

    USER.auth_list = data['data']['checksum'];                      //记录权限
    SETTING.is_wx3    = data['data']['is_wx3'];                     //企业微信第三方应用
    SETTING.corp_id    = data['data']['corp_id'];                   //企业微信第三方应用
    //调试信息
    window.Sentry && Sentry.configureScope(function(scope){
        scope.setUser({"id": USER.id,"name":USER.name,"corp_id":SETTING.corp_id});
    });
    //检查当前页面按钮权限
    remove_no_auth($('body'));
}
/*获取参数*/
function public_url_parameter(){
    var url=location.href;
    url=url.substr(url.indexOf("?")+1);
    url=decodeURIComponent(url);
    var return_obj = {}
    $(url.split('&')).each(function(){
        var temp = this.split('=');
        if(temp.length==2){
            return_obj[temp[0]] = temp[1]
        }
    });
    return return_obj;
}

//存储初始化过后的layui事件,在此之后绑定的事件都会被重置掉！(在点击导航菜单时重置)
var init_layui_event;

//绑定鼠标提示文字 (目前只绑定所有 带data-tips属性的 i 标签)
if(!IS_MOBILE) $(document).on('mouseenter','i[data-tips],button[data-tips]',tips_mouseenter).on('mouseleave','i[data-tips],button[data-tips]',tips_mouseleave);
//当layui下拉框被父元素隐藏时,给 select标签 添加 openin_layer 的类可解决问题
$(document).on('click','.openin_layer+.layui-form-select>.layui-select-title',select_openin_layer);
//layui的多选框、单选框值是不能用的,需要转换下才能使用(目前仅转换带 conver_value 类的input ) ( <input type="checkbox" name="sex" data-id="1" title="男" />  $('[name=sex]').val()取到的值是"1" )
layui.use('form',function(){
    layui.form.on('checkbox',function(data){if($(data.elem).hasClass('conver_value')) conver_layui_form_value(data.elem);});
    layui.form.on('radio',   function(data){if($(data.elem).hasClass('conver_value')) conver_layui_form_value(data.elem);});
    layui.form.on('switch',  function(data){if($(data.elem).hasClass('conver_value')) conver_layui_form_value(data.elem);});

    init_layui_event = $.extend(true,{},layui.cache.event);
});
layui.config({base:'/static/css/layui/extend/'});
//收缩 时间线
$(document).on('click','#taskList .layui-timeline-axis,#saleTrackList .layui-timeline-axis',function(){ $(this).next('.layui-timeline-content').children('ol').slideToggle(); })




/**所有ajax请求使用该方法,方便统一管理
 * @param {String} url 地址 * 
 * @param {Object} send_data 发送数据
 * @param {Function} success_callback 成功回调方法或消息提醒文字(注意:只返回 code=1 的数据)
 * @param {DOM} load_dom 需要被遮罩的 dom
 * @param {[object,Function]} option 更多设置
 * ( option.fail 接收返回数据中code!=1的失败处理 )
 * ( option.error_append 参数接收ajax请求错误回调 )
 * ( option.cache = 'session' 可将当前数据缓存在 sessionStorage 中(在切换导航菜单时清空) )
 */
function public_ajax(url,send_data,success_callback,load_dom,option){
    option = option||{};
    if(USE_SERVER_API){
        send_data = send_data || {};
        url = USE_SERVER_URL + url;
        send_data['USE_SERVER_API'] = USE_SERVER_API;
    }
    //当前请求缓存数据
    var cache_data = option.cache === 'session'? public_storage('session','clear_'+url+JSON.stringify(send_data)):undefined;
    //ajax成功回调
    var option_success = function(return_data){
        //关闭此时间之前所有的 ajax 回调  (100毫秒的容差)
        if(window.pubilc_ajax_stop_callback && window.pubilc_ajax_stop_callback > begin_time + 100){
            console.warn('URL已更改,AJAX 回掉被取消: '+url);
            return;
        }

        if(IS_DEBUG){
            delete default_option.dataType;
            delete default_option.error;
            delete default_option.success;
            delete default_option.headers;
            delete default_option.type;
            
            default_option.__proto__ = null;
            default_option.return_data = return_data.data;
            default_option.return_time = (+new Date() - begin_time)/1000 + '秒';
        }
        if(load_dom && loading) public_load_close(loading);
        if(return_data['code']===1){
            //缓存数据
            if(option.cache === 'session') public_storage('session','clear_'+url+JSON.stringify(send_data),return_data);
            //如果被加载的dom是layer框,则关闭它(在弹窗中提交数据,成功后则自动关闭该弹出框)
            if(load_dom && load_dom.hasClass('layui-layer') && !load_dom.hasClass('no_auto_close')){
                if(IS_DEBUG) console.warn('注意: 加载完成,已自动关闭layer弹窗');
                layer_close(load_dom);
            }
            if(typeof success_callback === 'string') public_msg('success',success_callback+'成功');    //1.只有消息
            else if(typeof success_callback === 'function') success_callback(return_data);  //2.只有回调方法
            else if($.isArray(success_callback)){                                           //3.消息 + 回调方法
                public_msg('success',success_callback[0]+'成功');
                success_callback[1] && success_callback[1](return_data);
            }
        }else{
            if(return_data['code']===-10) {
                if(return_data['is_wx3']){
                    $redirect_url = encodeURIComponent(location.protocol +"//"+ location.host+'/wx3/main/auth_code_login');
                    location.href= '/wx3_code_login.php?corp_id='+return_data['service_corp_id']+'&url='+ $redirect_url;
                }else{
                    setTimeout(function(){location.href="/html/login.html";},600);
                }
            }
            //code 不为1 的错误回调
            if(option && option.fail) option.fail(return_data);
            else{
                if(return_data['code']===200) layer.msg("需开启审批并通过后才能查看");  //什么都不做
                else if(return_data['code']===1002) alert(return_data['msg']);
                else if(return_data['code']===1003) alert(return_data['msg']);
                else public_msg('warning','错误:'+return_data['msg']);
            }
        }
    }
    var default_option = {
        type: 'post'
        ,url: url
        ,data: send_data
        ,dataType: 'json'
        ,headers: USE_SERVER_API&&option.processData===false? {USE_SERVER_API:USE_SERVER_API}:{}
        ,success:option_success
        //使用 option.error_append 参数接收错误回调
        ,error:function(e){
            //TODO: 错误信息收集

            //关闭此时间之前所有的 ajax 回调
            if(window.pubilc_ajax_stop_callback && window.pubilc_ajax_stop_callback > begin_time) return;

            if(load_dom && loading) public_load_close(loading);

            var err_txt = 'API请求错误 ('+e.status +':'+ e.statusText+')';

            if(option && option.error_append) option.error_append(err_txt);
        }
    }
    if(load_dom && cache_data===undefined) var loading = public_load_open(load_dom, option&&option.z_index? {z_index:option.z_index}:null );

    if(typeof option === 'function') default_option = option(default_option);
    else $.extend(default_option,option);

    var begin_time = +new Date();

    if(cache_data){
        option_success(cache_data);
        if(IS_DEBUG) console.warn('cache:',default_option);
    }else{
        if(IS_DEBUG) console.log('ajax:',default_option);
        return $.ajax(default_option);
    }

    // if(option['cache_time']) null;      //缓存时间(秒)
}

function public_msg(type,msg,time){
        var need_css = '.m-message { position: absolute;height: 0; z-index: '+(PUBLIC_LOAD_ZINDEX+1)+'; }\
                        .m-message .icon-success{ color: #00a854;top: 3px; position: relative; }\
                        .m-message .icon-xinxi{ color: #108ee9; top: 2px; position: relative;}\
                        .m-message .icon-zhuyi { color: #ffbf00; top: 2px; position: relative;}\
                        .m-message .icon-cuowu{ color: #f04134;top: 3px; position: relative; }\
                        .c-message-notice {transition: .5s;height:50px;display:none; text-align: center;}\
                        .m_content {transition: .4s; margin-top: 0; line-height: 20px; overflow: hidden; display: inline-block; border: 1px solid #eee; border-radius: 5px; box-shadow: 0 2px 8px rgba(0, 0, 0, .1); color: #555; text-align: left; max-width: 90%; padding: 10px 20px 13px; background-color: #fff;}\
                        .m_content span { vertical-align: middle; margin-left: 10px; }';
        public_append_css(need_css,'public_msg_need_css');
    
        var opts = {
            iconFontSize: "20px", 		//图标大小
            messageFontSize: "12px", 	//信息字体大小
            showTime: time || 2500,             //消失时间
            align: "center", 			//显示的位置
            positions: { top: "55px", bottom: "10px", right: "10px", left: "10px" },
            message: msg, 	            //消息内容
            type: type || "normal",     //消息的类型，还有success,error,warning等
        }
    
        var messageContainer = $('.m-message');
        if(!$('.m-message').length){
            messageContainer = $("<div class='m-message' style='top:" + opts.positions.top +
                ";right:" + opts.positions.right +
                ";left:" + opts.positions.left +
                ";bottom:" + opts.positions.bottom +
                "'></div>");
            messageContainer.appendTo($('body'));
        }
    
        (function add_msg(){
            var domStr = "";
            domStr += "<div class='layui-anim layui-anim-up c-message-notice' style='" + "text-align:" + opts.align + ";'><div class='m_content'><i class='iconfont ";
            switch(type) {
                case "success":domStr += "icon-success";
                break;case "error": domStr += "icon-cuowu";
                break;case "warning": domStr += "icon-zhuyi";
                break;default: domStr += "icon-xinxi";
            }
            domStr += "' style='font-size:" + opts.iconFontSize + ";'></i><span style='font-size:" + opts.messageFontSize + ";'>" + msg + "</span></div></div>";
            var domStr = $(domStr).appendTo(messageContainer);
            domStr.show();

            setTimeout(function(){
                domStr.css({'height':0}).find('.m_content').css('opacity',0);
                setTimeout(function(){domStr.remove()},550);
            },opts.showTime);
        })();
}
/**公共普通弹窗
 * @param {String}title 弹窗标题
 * @param {[DOM,String]} content 弹窗内容
 * @param {Function} yes_callback 点击确认回调
 * @param {[object,Function]} option layer设置 
 * */
function layer_open(title,content,yes_callback,option){
    var default_option = {
        type: 1,
        title: title,
        skin:'',
        closeBtn: 1,
        shade:.4,
        btn:["确定","取消"],
        content: content,
        area:'600px',
        maxHeight: $(window).height()*0.85,
        yes:yes_callback,
        scrollbar: false,
        end:function(){}
    };
    if(IS_MOBILE) default_option.closeBtn=0;
    if(typeof option === 'function') default_option = option(default_option);
    else $.extend(default_option,option);
    if( IS_MOBILE && default_option.btn.length===3 ){
        default_option.skin += ' mobile_btn_3';
    }
    return layer.open(default_option);
}
/**公共关闭弹窗
 * @param {[String,dom]} layer layer id或者dom
 * */
function layer_close(close_layer){
    if(typeof close_layer === 'object'){
        if(!close_layer.attr && !close_layer.attr('times')){IS_DEBUG && console.error('关闭layer失败!');return}
        close_layer = close_layer.attr('times');
    }
    layer.close(close_layer);
}
/**公共询问弹窗
 * @param {String} text 询问内容
 * @param {Function} yes_callback 点击确认回调 
 * @param {[object,Function]} option layer设置 
 * */
function layer_confirm(text,yes_callback,option){
    var need_css ='body .layer_confirm .layui-layer-content{height:auto !important;background-color: #effbfa; margin-bottom: 10px;padding: 20px 70px;font-size:16px;line-height: 29px;}'
                 +'body .layer_confirm .content{font-size: 14px; max-width: 360px; margin-left: 27px; line-height: 22px; margin-top: 10px; color: #666666;}'
                 +'body .layer_confirm .icon-zhuyi{font-size: 26px !important; color: #fbc14e; left: -11px; top: -1.7px; position: relative; float: left;}';
    public_append_css(need_css,'layer_confirm_css');

    option = option ||{};
    var default_option = {
        closeBtn: 0, shadeClose: true,
        area:false,     //自动高度
        maxWidth:'800', area: 'auto',
        skin:'layer_confirm'
    };
    if(typeof option === 'function') default_option = option(default_option);
    else $.extend(default_option,option);
    
    var text = '<i class="iconfont icon-zhuyi"></i> <span class="'+(option.more? 'green':'color_666')+'">'+text+'</span>';
    if(option.more) text += '<p class="content">'+option.more+'</p>';
    
    layer.confirm(text,default_option,function(index){
        layer.close(index);
        if(yes_callback) yes_callback();
    });
}
/**加载框-打开
 * @param {DOM} target_dom 要遮罩的 dom
 * @param {[object,Function]} option 其它设置 
 * */
function public_load_open(target_dom,option){
    //if(IS_MOBILE) return; //手机暂时不显示加载框,待优化

    var need_css ='.load_box{position:absolute;z-index:'+ PUBLIC_LOAD_ZINDEX +';opacity: 0.93; background-color:white;cursor: wait;margin:0 !important;}'
                 +'.load_box>.loader-inner{display: flex;position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); opacity: .9;height:30px;}'
                 +'.line-scale-pulse-out > div{background-color: #5fbfb5;}';
    public_append_css(need_css,'public_load_need_css');

    option = option || {};
    var load_dom = [];
    $(target_dom).each(function(){
        var temp_dom = $('<div class="load_box"><div class="loader-inner line-scale-pulse-out"><div></div><div></div><div></div><div></div><div></div></div></div>');
        // var temp_dom = $('<div class="load_box"><div class="loader-inner line-scale-pulse-out"><i class="layui-icon layui-icon-loading-1"></i></div>');
        var _this = $(this);
        //高度小于50的,需要缩小加载动画 ,
        if(_this.innerHeight()<50){
            temp_dom.find('.line-scale-pulse-out>div').css({width:3,height:_this.innerHeight()*.7});
            temp_dom.find('.loader-inner').css({height:_this.innerHeight()*.7 ,width:35});
        }
        //高度大于550的,延时显示加载动画 ,
        else if(_this.innerHeight()>550){
            $(temp_dom).find('.loader-inner').css('display','none');
            setTimeout(function(){$(temp_dom).find('.loader-inner').fadeIn(200);},500);
        }
        //设置不显示背景
        if(_this.hasClass('load_background_none')) temp_dom.css('background','none');
        //如果加载的是主页的主版块,那么index + 1
        if(this.id==='body-container') temp_dom.css('z-index',PUBLIC_LOAD_ZINDEX + 1);
        //自定义zindex
        if(option.z_index) temp_dom.css('z-index',option.z_index);
        if(option.wait){
            temp_dom.css('opacity',0);
            setTimeout(function(){temp_dom.css('opacity',1);},option.wait);
        }

        //有动画效果的需要插入 元素内部, 其它的插入 body
        if($(this).hasClass('layui-anim') || $(this).hasClass('layer-anim') || $(this).hasClass('layui-layer')) 
            $(this).append(temp_dom); 
        else ($(this).is('html')? $(this):$(this).parent()).append(temp_dom);
        //同步加载框和被加载对象大小位置
        mask_resize($(this),temp_dom,option.timing);
        
        load_dom.push(temp_dom[0]);
    });
    return $(load_dom);
}
/**加载框-关闭
 * @param {[DOM,null]} close_dom 要关闭的加载框,为 null则关闭所有
 * @param {[object,Function]} option 其它设置 
 * */
function public_load_close(close_dom,option){
    option = option || {};
    if(close_dom === 'all'){$('.load_box').remove();return;}

    if(option.delay) setTimeout(run,option.delay);
    else run();
    
    function run(){
        if(close_dom && close_dom.remove){
            close_dom.css('transition','.1s').css('opacity',0);
            setTimeout(function(){close_dom.remove();},100);
        }else if(IS_DEBUG) console.error('加载框关闭错误',close_dom);
    }

}
/**创建表格(需自行引入table模块)(返回 layui table 对象)
 * @param {string} elem 选择器
 * @param {string} url
 * @param {object} send_data 发送数据
 * @param {array} cols 表头数据
 * @param {[object,Function]} option 其它设置 
 */
function public_table(elem,url,send_data,cols,option){
    var default_option = {
        elem: elem          //单dom
        ,url: url
        ,method: 'post'
        ,dont_more_btn:true //不使用默认的显示更多按钮
        ,cols: cols
        ,text: {none: '暂无相关数据'}
        ,where:send_data
        ,editByIcon:true
        ,parseData: function(res){
            //如需修改请求到的数据,可使用 option.parseData 重写该方法
        }
       /* ,parseDataInit: function (res) {
            //告诉layui 哪些字段是 数据长度、数据、返回码
            if(res.data.list === undefined && res.data.data === undefined){
                console.warn('注意: 此API没有分页数据,无法分页 '+url);
                return {
                    "count": 0,
                    "data": res.data,
                    "code": res.code == 1 ? 0 : -1
                };
            }
            return {
                "count": res.data.total,
                "data": res.data.list || res.data.data,
                "code": res.code == 1 ? 0 : -1
            };
        }*/
        ,page: {
            limits:[10,20,50,100]           //每页显示的条数
            ,groups:3                       //只显示 1 个连续页码
        }
    };
    if(typeof option === 'function') default_option = option(default_option);
    else $.extend(default_option,option);

    if(default_option.page !== false && !default_option.height) default_option.height = '600';  //最大高度 (有分页才设置)
    
    return layui.table.render(default_option);
}
/**创建选择框-多选框
 * @param {[DOM,String]} elem 需要转换的select框   (TODO 应该使用用 input 好点)
 * @param {object} data 下拉数据 {"刘大":1,"王二":2}
 * @param {string} value 选中数据 '1,2'
 * @param {[object,Function]} option 其它设置 
 */
function public_select_multi(elem,data,value,option){
    layui.link(layui.cache.base+'formSelects.css');
    layui.use('formSelects',function(){
        option = option || {};
        if(typeof data === 'function') data(data_conver_dom);
        else if(data) data_conver_dom(data);

        function data_conver_dom(res_data){
            elem = typeof elem === 'string' ? $(elem):elem;
            var select_multi_id = 'select_multi'+ +new Date();
            var multi_html = elem.attr({
                'xm-select':select_multi_id,
                'xm-select-search':'',
                'xm-select-height':'40px',
            });
            var selected_list = (value && value.length)? value.split(','):false;
            var disable_list = option.disable? option.disable.split(','):false;
            var option_html = $(res_data).joinTemplate(function(multi_title,multi_id){
                var attr = '';
                if(selected_list&& selected_list.indexOf(multi_id+'') !== -1) attr += ' selected=selected';
                if(disable_list && disable_list.indexOf(multi_id+'')  !== -1) attr += ' disabled=disabled';
                return '<option value="'+multi_id+'"' + attr +'>'+multi_title+'</option>';
            },'object');
            multi_html.append(option_html);
            
            layui.formSelects.render(select_multi_id,option);

            if(option.show) setTimeout(function(){
                multi_html.next().find('.xm-select').click()
            });
        }
    });
}
/**创建选择框-树状选择框(还未封装,待处理)
 */
function public_select_tree(type,elem,data,value,option){
    layui.link(layui.cache.base+'formSelects.css');
    layui.use('formSelects',function(){
        option = option || {};
        data = data || [];
        var select_tree_id = 'select_tree_checkbox'+ +new Date();
        elem.attr({
            'xm-select':select_tree_id,
            'xm-select-search':'',
            'xm-select-height':'40px',
            'lay-ignore':'',
        });
        if(option.height) elem.attr('xm-select-height',option.height);
        if(type === 'radio') elem.attr('xm-select-radio',''); //单选
        
        if(value && typeof value === 'string') value = value.split(',');
        layui.formSelects.data(select_tree_id,'local',{arr:data}).value(select_tree_id, value);
        if(option.auto_open) setTimeout(function(){
            $('[fs_id='+select_tree_id+']').find('.xm-select').click()
        });
    });
}
/**创建选择框-表格形式选择数据(多选、单选)
 * @param {string} type 类型 'checkbox' 或者 'radio'
 * @param {dom} elem 点击触发的元素
 * @param {string} data_source 数据源
 * @param {object} value 默认值  格式 {"管理员,用户":"1,2"} 或者 {text:"管理员,用户",id:"1,2"}
 * @param {[object,Function]} option 其它设置
 */
function public_select_table(type,elem,data_source,value,option){
    option = option || {};
    layui.use('tableSelect',function(){
        $.each(elem,function(){
            var elem = $(this);
            //数据源
            if(data_source === '员工'){
                data_source = { url:'/api/teacher_manger/userList', key:'userid', name:'name',where:{}}
            }else if(data_source === '班组'){
                data_source = { url:'/api/party_team/team_list', key:'id', name:'party_name',where:{}}
            }else if(data_source === '设置主管'){
                data_source = { url:'/api/party_team/team_member', key:'userid', name:'name',where:{}}
            }else if(data_source === '班级'){
                data_source = { url:'/api/Class_Manger/get_class_list', key:'tag_id', name:'name',where:{is_select:1}}
            }else if(data_source === '部门'){
                data_source = { url:'/finance/finance/get_deparment_id', key:'id', name:'depart_name',where:{}}   
            }else if(data_source === '商机'){
                data_source = { url:'/clue/public/relationChance', key:'id', name:'chance_name',where:{}}   
            }else if(data_source === '离职员工'){
                data_source = { url:'/framework/framework/get_user_name_id', key:'userid', name:'user_name',where:{type:'leave'}}
            }else if(data_source === '联系人'){
                data_source = { url:'/clue/link_man/getLinkManOption', key:'id', name:'name',where:{}}
            }else          //默认展示所有公司员工
                data_source = { url:'/api/Teacher_manger/get_user_name_id', key:'userid', name:'name',where:{}}
            
            if(option.data_where) elem.data('select_where',option.data_where);
            if(typeof elem.data('select_where') === 'object') $.extend(data_source.where,elem.data('select_where'));
            //赋初始选择值
            var value_list = '';
            if(typeof value === 'object'){
                //支持{"管理员,用户":"1,2"} 这样的格式
                if(value.text === undefined){ value.text = Object.keys(value)[0]; value.id = value[Object.keys(value)[0]]; }
                if(value.text){
                    var id_list = (value.id+"").split(',');
                    var text_list = (value.text+"").split(',');
                    var disable_list = (option.disabled+"").split(',');
                    value_list = id_list.joinTemplate(function(key){
                        if(id_list[key])
                        var add_class = disable_list.indexOf(id_list[key])===-1? '':' disabled';
                        return '<span class="tags'+add_class+'" data-id="'+ id_list[key] +'">'+ text_list[key] +'<i></i></span>'
                    });
                }
                
            }
            elem.next('.tags_box').remove(); //删除已渲染的
            var elem_click = $('<div class="layui-input click_input tags_box">'+ value_list +'</div>').insertAfter(elem);
            
            var default_option = {
                elem: elem_click,     //支持多dom(string 或者 jq对象)
                type: type,
                checkedKey:data_source.key,
                checkedName:data_source.name,
                table: {
                    url:data_source.url,
                    where:data_source.where,
                    response: {statusCode: 1,},
                    skin:'line',
                    limit:10,
                    page:{layout:['page','limit'],limits:[10,20,50]},
                    cols: [[ {type: type},{field: data_source.name} ]]
                },
                done: function (elem) { }
            };

            if(type === 'checkbox') elem_click.addClass('tags_box');
            if(typeof option === 'function') default_option = option(default_option);
            else $.extend(default_option,option);

            layui.tableSelect.render(default_option);
            
        });
    });
}
/**创建选择框-日期(默认配置为 datetime)
 * @param {[object,string]} elem 
 * @param {[object,Function]} option 其它设置
 */
function public_select_datetime(elem,option){
    layui.use('laydate',function(){
        elem = typeof elem === 'string' ? document.querySelector(elem):elem;
        if(elem.show) elem = elem[0];   //只能使用原始dom
        var default_option = {
            elem: elem
            ,type: 'datetime'
            //,value: '2019-03-08'
        };
        if(typeof option === 'function') default_option = option(default_option);
        else $.extend(default_option,option);
        
        layui.laydate.render(default_option);
    });
}
/**创建选择框-三级联动地区
 * @param {[object,string]} elem 
 * @param {[object,Function]} option 其它设置
 */
function public_select_address(elem,option){
    async_load_js('static/js/jquery.city.picker.min.js',function(){
        elem = typeof elem === 'string' ? $(elem):elem;
        elem.citypicker();
        if(option.show) setTimeout(function(){
            elem.next('.city-picker-span').click();
        });
    });
}
/**美化滚动条 
 * @param {DOM} 需要美化滚动条的dom  
 * @param {[object,Function]} option 其它设置 
 * ( 如需动态修改 option,可修改 $(dom).data("mCS").opt 中的参数, $(dom).data("mCS")中的数据可以查看下 )
 * 文档:http://manos.malihu.gr/jquery-custom-content-scroller/#get-started-section
 */
function public_scrollbar(dom,option){
    return;
    if(IS_MOBILE) return;   //手机端不需要
    if(window.mCustomScrollbar) scrollbar_init();
    else {
        layui.link('static/css/jquery.mCustomScrollbar.min.css');
        async_load_js('static/js/jquery.mCustomScrollbar.concat.min.js',scrollbar_init);
    }      
    function scrollbar_init(){
        var default_option = {
            theme:'dark',                       //主题: 常用(minimal-dark)
            scrollInertia:150,                  //延时滑动
            mouseWheel:{preventDefault:true}    //防止在达到滚动结束或开始时自动滚动父元素的默认行为
            //axis:'yx'   
        };
        if(typeof option === 'function') default_option = option(default_option);
        else $.extend(default_option,option);
        dom.mCustomScrollbar(default_option);
    }
    /* 当前table使用的配置
        public_scrollbar(that.layMain,{theme:'minimal-dark',axis:'yx',callbacks:{
          //table表头、固定列和内容是分开的,当滚动内容时,需要控制表头也滚动(还有个合计行没设置)
          whileScrolling: function(){
            if(this.mcs.direction==='x') that.layHeader.eq(0).scrollLeft(0-this.mcs.left);
            else that.layFixed.children('.layui-table-body').scrollTop(0-this.mcs.top);
          },
          //这四个事件的功能: 当只有X轴的时候鼠标滚轮操作X轴,当有Y轴的时候鼠标滚轮操作Y轴 
          onOverflowY:  function(){that.layMain.data("mCS").opt.mouseWheel.axis="y";},
          onOverflowX:  function(){ that.layMain.data("mCS").opt.mouseWheel.axis="x";},
          onOverflowYNone:  function(){ that.layMain.data("mCS").opt.mouseWheel.axis="x";},
          onOverflowXNone:  function(){ that.layMain.data("mCS").opt.mouseWheel.axis="y";}
      }});
    };
    */
}
/**公共创建表单
 * @param {string} layer_title 标题 
 * @param {array} item 表单数据list * 
 * @param {function} yes_callback 提交表单回调
 * @param {[object,Function]} option 其它设置 
 */
function public_form(layer_title,item,yes_callback,option){
    public_append_css('.layui-input-block>.readonly{pointer-events: none;}.readonly .layui-input,.layui-input-block>*[readonly],.layui-input-block>label>input[readonly]{background: #f3f3f3;}','public_form_need_css');
    
	option=option||{};
    var form_box = $('<form class="layui-form"></form>');           //form表单
    if(!$('#layer_temp').length) $('<div id="layer_temp" style="overflow:hidden;height:0;"></div>').appendTo($('body'));
    $('#layer_temp').append(form_box);                              //dom需要添加到文档 后面的选择框等组件才能渲染
    var form_filter = 'public_form' + +new Date();                  //layui表单必须绑定按钮提交才能取值
    var form_submit = $('<i lay-filter="'+form_filter+'" lay-submit></i>').appendTo(form_box);
    form_box.submit(function(){form_submit.click();return false;});
    
    var item_templet = function(obj){
        var item = $('<div class="layui-form-item"></div>');
        if(obj.label!==undefined) item.append('<label class="layui-form-label">'+ (obj.verify.indexOf('required')>-1? '<span class="red">*</span>':'') + obj.label +'</label>');
        if(obj.align){
            item.find('label').css({'text-align':obj.align,'padding-left':0});
            if(obj.align==='left' && !IS_MOBILE) item.css('padding-left','100px').css('padding-right','100px');
        }

        var input_box = $('<div class="layui-input-block"></div>').appendTo(item);
        if(obj.label===undefined) input_box.css('margin-left','0');

        var input = $('<input type="'+ obj.type +'" '+(obj.readonly? 'readonly':'')+' placeholder="'+obj.placeholder+'" name="'+ obj.name +'" '+(obj.maxlength? 'maxlength="'+obj.maxlength+'"':'')+' autocomplete="off" class="layui-input" />').appendTo(input_box);
        input.val(obj.value);
        return item;
    };
    
    //loading 所需属性、函数
    var loading_count = 0;
    var loading_dom = null;
    var loading_success = function(){loading_count--;if(loading_count<1 && loading_dom) public_load_close(loading_dom);};
    
    var data_list = {};                     //数据的默认初始值
    var verify_list = {};                   //验证方式
    var label_list = item.toObject('name','label');
    var where_list = {};                    //是否显示的条件
    var disabled_list = [];                 //禁用列表
    var change_list = {};                   //需要监听 change 事件的元素

    //循环渲染dom
    $(item).each(function(key){
        this.name = this.name || '';
        if(this.value === undefined || this.value === null) this.value = '';
        if(typeof this.value === 'number') this.value = String(this.value);
        this.disabled = this.disabled || '';
        if(typeof this.disabled === 'number') this.disabled = String(this.disabled);
        this.verify = this.verify || '';
        this.placeholder = this.placeholder || '';
        

        if(this.type === 'delete') return true;
        else if(this.type === 'html'){
            var item = $(this.html).appendTo(form_box);
        }else if(this.type === 'html_item'){
            //带 提示文字的 自定义html
            var item = item_templet(this).appendTo(form_box);
            item.find('.layui-input-block').html(this.html);
        }else if(this.type === 'group'){
            //分组 信息
            var item = $('<div class="layui-form-item group" '+(this.style? 'style="'+this.style+'"':'')+'><label class="layui-form-label">'+this.label+'</label></div>').appendTo(form_box)
        }else if(this.type === 'textarea'){
            var item = item_templet(this).appendTo(form_box);
            item.find('.layui-input-block').html('<textarea'+(this.readonly? ' readonly':'')+' placeholder="'+this.placeholder+'" name="'+ this.name +'" class="layui-textarea">'+this.value+'</textarea>');
        }else if(this.type === 'textarea_more'){
            var need_css = '.upButton{margin: 0 13px;} .upButton i{margin-right:10px} .tips_box{height:0;overflow:hidden} .tips_box .tags_box{border: 0; border-top: 1px solid #f6f6f6; padding-top: 2px;}'
            public_append_css(need_css,'textarea_more_need_css');
            var item = item_templet(this).appendTo(form_box);
            var box = $('<div class="borderAll"></div>').appendTo(item.find('.layui-input-block').html(''));
            box.append('<textarea'+(this.readonly? ' readonly':'')+' placeholder="'+this.placeholder+'" name="'+ this.name +'" class="layui-textarea" style="border:0;height:110px;">'+this.value+'</textarea>');
            var btn_voice = (IS_WECHAT) && IS_MOBILE ? '<i class="iconfont icon-voice_icon"></i>':'';
            box.append('<div class="upButton">'+btn_voice+'<i class="iconfont icon-tupian"></i><i class="iconfont icon-fujian"></i><span class="btn_tips">@</span></div>');
            
            // 上传附件
            var files_input = $('<input type="hidden" name="'+this.files_name+'">').appendTo(item);
            public_select_upload(files_input,{multiple:true,elem:box.find('.icon-tupian,.icon-fujian')});
            // @ 提醒人
            var tips_dom = $('<div class="tips_box"><input type="hidden" name="'+this.tips_name+'"></div>').appendTo(box).children('input');
            public_select_table('checkbox',tips_dom);
            box.find('.btn_tips').click(function(){
                var select = $(this).parent().next('.tips_box').css('height','auto');
                setTimeout(function(){select.find('.click_input').click();},100);
            });
            // 语音
            box.find('.icon-voice_icon').click(function(){ public_alert.follow_audio_init(item); });

        }else if(this.type === 'hidden'){
            if(typeof this.value==='object') this.value = this.value[Object.keys(this.value)[0]]+"";    //兼容格式{"默认池":1}
            var item = $('<input type="hidden" name="'+this.name+'" value="'+this.value+'">').appendTo(form_box).parent();
        }else if(this.type === 'switch'){
            var item = item_templet(this).appendTo(form_box);
            var checked =  this.value==1? 'checked':'';
            var input_dom = $('<input '+checked+' lay-text="'+this.lay_text+'" class="conver_value" type="checkbox" name="'+ this.name +'" lay-skin="switch">');
            item.find('.layui-input-block').html(input_dom);
            conver_layui_form_value(input_dom[0]);
        }else if(this.type === 'checkbox'){
            var item = item_templet(this).appendTo(form_box).find('.layui-input-block').html('');
            var checkbox_this = this;
            if(typeof this.value==='object') this.value = this.value[Object.keys(this.value)[0]]+"";    //兼容格式{"默认池":1}
            var checked_id = this.value.length? this.value.split(','):'';
            var disabled_id = this.disabled.length? this.disabled.split(','):'';
            loading_count++;
            //如果 data 传入的是方法就调用该方法并给它一个回调方法， 如果data是数据则直接使用
            if(typeof this.data === 'function') this.data(data_conver_dom_checkbox);else data_conver_dom_checkbox(this.data);
            function data_conver_dom_checkbox(data){
                var checkbox_html = $(data).joinTemplate(function(checkbox_title,checkbox_id){
                    if(checked_id.length && checked_id.indexOf(checkbox_id+'') !== -1) this.checked = true;         //选中选项
                    if(disabled_id.length && disabled_id.indexOf(checkbox_id+'') !== -1)this.disabled = true;       //禁用选项
                    if(!this.checked && checkbox_this.only_show_checked) return '';      //只显示勾选的项
                    if(checkbox_this.checked_all) this.checked = true;                   //启用全部
                    if(checkbox_this.disabled_all) this.disabled = true;                 //禁用全部
                    var attr = (this.disabled ? ' disabled':'')  +  (this.checked ? ' checked':'');
                   return '<input class="conver_value" type="checkbox" lay-skin="primary" data-id="'+checkbox_id+'" title="'+ checkbox_title +'" name="'+ checkbox_this.name +'"  '+ attr +'>';
                },'object');
                item.append(checkbox_html);
                conver_layui_form_value(item.find('[name="'+checkbox_this.name+'"]')[0]);
                loading_success();  //记录该项已完成
                layui.form.render();
            }

        }else if(this.type === 'radio'){
            var item = item_templet(this).appendTo(form_box).find('.layui-input-block').html('');
            var radio_this = this;
            loading_count++;
            //如果 data 传入的是方法就调用该方法并给它一个回调方法， 如果data是数据则直接使用
            if(typeof this.data === 'function') this.data(data_conver_dom_radio);else data_conver_dom_radio(this.data);
            function data_conver_dom_radio(data){
                //在数据开头添加数据
                if(radio_this.data_before) data = $.extend(radio_this.data_before,data);

                var radio_html = $(data).joinTemplate(function(radio_title,radio_id){
                    var attr = radio_id == radio_this.value ? ' checked':'';
                    return '<input class="conver_value"  type="radio" data-id="'+ radio_id +'" title="'+ radio_title +'" name="'+ radio_this.name +'" lay-skin="primary" '+ attr +'>';
                },'object');
                item.append(radio_html);
                conver_layui_form_value(item.find('[name="'+radio_this.name+'"]')[0]);
                loading_success();  //记录该项已完成
                layui.form.render();
            }
        }else if(this.type === 'select'){
            var item = item_templet(this).appendTo(form_box).find('.layui-input-block').html('');
            var select_value =  this.value;
            var select_html = $('<select '+(this.readonly? 'disabled':'')+' class="openin_layer" '+ (this.search? 'lay-search':'') +' name='+this.name+'></select>').appendTo(item);
            if(this.default !== false) select_html.append('<option></option>');
            loading_count++;
            //如果 data 传入的是方法就调用该方法并给它一个回调方法， 如果data是数据则直接使用
            if(typeof this.data === 'function') this.data(data_conver_dom_select);else data_conver_dom_select(this.data);
            function data_conver_dom_select(data){
                select_html.append($(data).joinTemplate(function(select_title,select_id){
                    if(select_value+"" === select_id+"") var attr = 'selected=selected';else var attr='';
                    return '<option value="'+select_id+'"' + attr +'>'+select_title+'</option>';
                },'object'));
                loading_success();  //记录该项已完成
                layui.form.render();
                
                if(layer_title === 'table_edit_box')
                    setTimeout(function(){ select_html.next().find('.layui-unselect').click(); });
            }
        }else if(this.type === 'select_table_checkbox'){

            if(typeof this.value === 'object' && this.value.text === undefined){ this.value.text = Object.keys(this.value)[0]; this.value.id = this.value[Object.keys(this.value)[0]]; }
            var input_value = typeof this.value === 'object'? this.value.id:this.value;
            var item = item_templet($.extend({},this,{type:'hidden',value:input_value})).appendTo(form_box);
            if(this.readonly) item.children('.layui-input-block').addClass('readonly');
            var select_click = item.find('[name="'+this.name+'"]');
            public_select_table('checkbox',select_click,this.data,this.value,{data_where:this.data_where});
        }else if(this.type === 'select_table_radio'){
            if(typeof this.value === 'object' && this.value.text === undefined){ this.value.text = Object.keys(this.value)[0]; this.value.id = this.value[Object.keys(this.value)[0]]; }
            var input_value = typeof this.value === 'object'? this.value.id:this.value;
            var item = item_templet($.extend({},this,{type:'hidden',value:input_value})).appendTo(form_box);
            if(this.readonly) item.children('.layui-input-block').addClass('readonly');
            var select_click = item.find('[name="'+this.name+'"]');
            public_select_table('radio',select_click,this.data,this.value,{data_where:this.data_where});
        }else if(this.type === 'select_multi'){
            var item = item_templet(this).appendTo(form_box).find('.layui-input-block').html('');
            var select_this = this;
            loading_count++;
            //如果 data 传入的是方法就调用该方法并给它一个回调方法， 如果data是数据则直接使用
            if(typeof this.data === 'function') this.data(data_conver_dom_select_multi);else data_conver_dom_select_multi(this.data);
            function data_conver_dom_select_multi(res_data){
                var select_dom = $('<select '+(this.readonly? 'disabled':'')+' name="'+select_this.name+'"></select>');
                item.append(select_dom);
                public_select_multi(select_dom,res_data,select_this.value,{
                    disable:select_this.disabled,
                    show:layer_title === 'table_edit_box'
                });
                loading_success();  //记录该项已完成
            }
        }else if(this.type === 'select_tree_checkbox' 
              || this.type === 'select_tree_radio'){
            if(this.data === undefined) this.data = public_data.department;
            var elem = $('<select '+(this.readonly? 'disabled':'')+' name='+this.name+'></select>');
            var item = item_templet(this).appendTo(form_box).find('.layui-input-block').html(elem);
            
            var value_list = this.value.length? this.value.split(','):[];
            var _this = this;
            var elem_type = 'checkbox';
            //默认是多选, 需要单选加个属性就可以了 
            if(this.type === 'select_tree_radio') elem_type = 'radio'
            loading_count++;
            //如果 data 传入的是方法就调用该方法并给它一个回调方法， 如果data是数据则直接使用
            if(typeof this.data === 'function') this.data(data_conver_dom_select_tree);else data_conver_dom_select_tree(this.data);
            function data_conver_dom_select_tree(data){
                public_select_tree(elem_type,elem,data,value_list,{
                    auto_open:layer_title === 'table_edit_box'||(_this && _this.auto_open),
                    height:_this && _this.height
                });
                loading_success();  //记录该项已完成
            }
        }else if(this.type === 'prompt'){
            var item = $('\
            <div class="layui-form-item prompt_box">\
                <div style="margin-left: -30px; top: -8px; position: relative;">\
                    <i class="iconfont icon-tishi"></i><span class="green">'+(this.title? this.title:'注:')+'</span><p class="content">'+(this.content || '')+'</p>\
                </div>'
                +this.value+
            '</div>').appendTo(form_box).parent();

        }else if(this.type === 'datetime'){
            this.value = public_templet.datetime(this.value);
            //必填并且没有值，则赋值当前时间
            if(!this.value && this.verify.indexOf('required')!==-1) this.value = public_templet.datetime(+new Date());
            console.log('this: ', this);

            var item = item_templet($.extend({},this)).appendTo(form_box);
            var input = item.find('[name="'+this.name+'"]');
            input.wrap('<label></label>').after('<i class="iconfont icon-riqi green" style=" position: absolute; top: 9px; right: 8px; font-size: 17px; "></i>')
            //表格编辑框的自动显示 ,其它点击输入框才显示
            if(!this.readonly) public_select_datetime(input,{show:layer_title === 'table_edit_box'});
        }else if(this.type === 'datetime_area_date'){
            var item = item_templet(this).appendTo(form_box);
            var value_input = item.find('[name="'+this.name+'"]');
            public_select_datetime(value_input,{type: 'month',range: true});  //渲染成日期选择框

        }else if(this.type === 'datetime_area'){
            //搜索栏-单选样式的时间段选择

            var item = item_templet(this).appendTo(form_box);
            
            var thisDate = new Date();
            //本周开始 Date 对象
            var weekBeginDate    = new Date(thisDate.getFullYear(),thisDate.getMonth(),thisDate.getDate() - (thisDate.getDay() || 7) + 1);
            //本月开始 Date 对象
            var monthBeginDate   = new Date(thisDate.getFullYear(),thisDate.getMonth()  ,1);
            //上月开始 Date 对象
            var upMonthBeginDate = new Date(thisDate.getFullYear(),thisDate.getMonth()-1,1);
            //下月开始 Date 对象
            var nextmonthBeginDate   = new Date(thisDate.getFullYear(),thisDate.getMonth()+1,1);
            //本月天数
            var monthCount       = new Date(thisDate.getFullYear(),thisDate.getMonth()+1,0).getDate();
            //上月天数
            var upMonthCount     = new Date(thisDate.getFullYear(),thisDate.getMonth()  ,0).getDate();
            //下月天数
            var nextMonthCount     = new Date(thisDate.getFullYear(),thisDate.getMonth()+2,0).getDate();
            
            var radio_data = {
                "全部":''
                ,"今天":public_templet.datetime('0,1',thisDate)
                ,"昨天":public_templet.datetime('-1,0',thisDate)
                ,"本周":public_templet.datetime('0,7',weekBeginDate)
                ,"上周":public_templet.datetime('-7,0',weekBeginDate)
                ,"本月":public_templet.datetime(0+','+monthCount,monthBeginDate)
                ,"上月":public_templet.datetime(0+','+upMonthCount,upMonthBeginDate)
                ,"自定义时间段":'custom'
            }
            if(this.name === 'remind_at'){  //下次跟进的不一样
                var radio_data = {
                    "全部":''
                    ,"今天":public_templet.datetime('0,1',thisDate)
                    ,"明天":public_templet.datetime('1,2',thisDate)
                    ,"本周":public_templet.datetime('0,7',weekBeginDate)
                    ,"下周":public_templet.datetime('7,14',weekBeginDate)
                    ,"本月":public_templet.datetime(0+','+monthCount,monthBeginDate)
                    ,"下月":public_templet.datetime(0+','+nextMonthCount,nextmonthBeginDate)
                    ,"自定义时间段":'custom'
                }
            }
            var datetime_area_html = '';
            var datetime_area_filter = 'datetime_area_' + (+new Date());
            var this_value= this.value;
            $.each(radio_data,function(name,value){
                var attr = (name == this_value ? ' checked':'');
                if(!this_value && name==="全部") attr = ' checked';
                var temp_name = 'temp_name'+ +new Date();
                datetime_area_html += '<input name="'+temp_name+'" lay-filter="'+datetime_area_filter+'" type="radio" data-id="'+ value +'" title="'+ name +'" lay-skin="primary" '+attr+'/>';
            });
            datetime_area_html += '<input class="layui-input" type="hidden" name="'+this.name+'" autocomplete="off" style="position: relative; top: 4.5px; width: 289px; color: #009688; border: 0; cursor: pointer;display: initial;height:10px;"/>';
            item.find('.layui-input-block').html(datetime_area_html);
            var value_input = item.find('[name="'+this.name+'"]');
           
            public_select_datetime(value_input,{range: true});  //渲染成日期选择框

            layui.form.on('radio('+datetime_area_filter+')', function(data){
                var selected = data.elem.getAttribute('data-id');
                if(selected === 'custom'){
                    value_input.attr('type','text');
                    setTimeout(function(){value_input.focus();});
                }else
                    value_input.attr('type','hidden').val(selected);
            });

        }else if(this.type === 'datetime_area_box'){
            //搜索栏-下拉框样式的时间段选择
            var item = item_templet(this).appendTo(form_box);
            var input_dom = $('<input class="layui-input click_input" placeholder="请选择时间" name="'+ this.name +'" autocomplete="off">').appendTo(item.find('.layui-input-block').html(''));
            
            layui.use('timePicker',function (){
                layui.timePicker.render({ elem: input_dom  });
            })
        }else if(this.type === 'address'){
            var item = item_templet($.extend({},this,{type:this.readonly? 'text':'hidden'})).appendTo(form_box);
            var input = item.find('[name="'+this.name+'"]');
            //表格编辑框的自动显示 ,其它点击输入框才显示
            if(!this.readonly) public_select_address(input,{show:layer_title === 'table_edit_box'});
        }else if(this.type === 'button')
        {
            var item = item_templet(this).appendTo(form_box);
            var content_box = item.find('.layui-input-block').html('');
            var button_dom = $('<button class="layui-btn layui-btn-sm layui-btn-primary" type="button" name="'+this.name+'" id="'+this.id+'">'+this.label+'</button>').appendTo(content_box);
            if(this.click) button_dom.click(this.click);
        }else if(this.type.indexOf('upload')===0)
        {
            var option = {multiple:true}
            if(this.type === 'upload_one') option = {multiple:false}
            else if(this.type === 'upload_camera')  option = {accept:'images',capture:"camera",auto:false,elem_text:'开始拍照'}   //移动端 默认调用相机,并且会压缩图片
            else if(this.type === 'upload_picture') option = {accept:'images'}
            else if(this.type === 'upload_picture_more') option = {multiple:true,accept:'images'}

            if(this.auto_open) option.auto_open = this.auto_open;
            if(this.url) option.url = this.url;
            if(this.done) option.done = this.done;
            if(this.choose_base64) option.choose_base64 = this.choose_base64;

            var item = item_templet($.extend(this,{type:'hidden'})).appendTo(form_box);
            var input_dom = item.find('input');
            // 上传调用的方法
            public_select_upload(input_dom,option);
        }else if(this.type === 'table'){
            //因为table的复杂性，目前无法作为 where 的条件或者监听其 change 事件(不准确)
            var table_id = 'form_table'+ +new Date();
            this.width = this.width===undefined? 85:this.width;
            if(IS_MOBILE) this.width = 100;
            var item = $('<div class="layui-form-item" style="padding:0;width:'+this.width+'%;margin-left:'+(100-this.width)/2+'%;"><div><table id="'+table_id+'" lay-filter="'+table_id+'"></table></div></div>').appendTo(form_box);
            var save_input = $('<input type="hidden" class="conver_data_to_value" name="'+this.name+'">').appendTo(item);
            
            var default_option = {
                no_scrollbar:true ,totalRow:true ,skin:'line',page:false
                ,data: this.table.data
                ,cols:this.table.cols
                ,editByIcon:false       //不显示编辑按钮,而是点击就显示编辑框
                ,done:layer_dom_align   //重置layer 的 位置
            }
            if(IS_MOBILE) default_option.cellMinWidth = 100;
            
            $.extend(default_option,this.table);
            var table_obj = public_table('#'+table_id,null,null,null,default_option);
            
            var reload_layer_window = function(){
                //调整窗口的位置(只有显示不全的时候才调整)
                if(layer_dom && $(window).height() - layer_dom.height() -parseInt(layer_dom.css('top')) <0) 
                    layer_dom_align();
            }
            var table_liucheng = {
                //取值必须使用 get方法 实时获取(不能使用变量保存),因为 table.reload 方法内部会跟换数组,所以get到的数组 和 table使用的数据有可能已经不是同一个数组了
                table_obj : table_obj
                ,origin:layui.table.cache
                ,origin_key:table_id
                ,getData:function(){return this.origin[this.origin_key]}
                ,push:function(push_data,option){
                    if(Array.isArray(push_data)) $.merge(this.origin[this.origin_key],push_data);
                    else this.origin[this.origin_key].push(push_data);
                    layui.table.reload(table_id,{data:this.origin[this.origin_key]});
                    reload_layer_window();
                    return this.origin[this.origin_key].length - 1;
                }
                ,del:function(index,length){
                    if(length === undefined) length = 1;
                    this.origin[this.origin_key].splice(index,length);
                    layui.table.reload(table_id,{data:this.origin[this.origin_key]});
                    reload_layer_window();
                }
                ,reload:function(reload_data){
                    if(typeof reload_data === 'function') this.origin[this.origin_key] = reload_data(this.origin[this.origin_key]);
                    else if(Array.isArray(reload_data)) this.origin[this.origin_key] = reload_data;
                    else if(reload_data === undefined){layui.table.reload(table_id);return;}
                    else console.error('参数错误! 请传入函数或者数组');
                    layui.table.reload(table_id,{data:this.origin[this.origin_key]});
                    reload_layer_window();
                }
                ,event:{}
                ,event_run:function(click){
                    if(click.event=='del') this.del(click.index);
                    if(click.event=='add') this.push({});
                    if(click.event=='copy') this.push(this.origin[this.origin_key][click.index]);
                    //执行 event 里面的用户设置回调
                    $.each(this.event,function(name,callback){
                        if(name === click.event){
                            if(typeof callback === 'function') callback(click);
                            else console.error('event错误! 请传入回调函数');
                            return false;
                        }
                    });
                }
            }
            
            save_input.data(table_liucheng);
            //合计行需要重载表格才会从新计算
            layui.table.on('edit('+table_id+')', function(){ layui.table.reload(table_id,layui.table.cache[table_id]); });
            //事件转交给 table_liucheng 处理
            layui.table.on('tool('+table_id+')',function(click){ table_liucheng.event_run(click); });
        }else var item = item_templet(this).appendTo(form_box);
        
        //追加dom
        if(this.append){
            if(typeof this.append === 'string') this.append = $(this.append);
            var append_box = $('<div style="position: absolute; right: 0; top: 0;"></div>').append(this.append);
            var append_to = item.find('.layui-input-block').length? item.find('.layui-input-block'):item;
            append_to.append(append_box);
            append_to.css('padding-right',append_box.outerWidth());;
        }
        //记录需要处理的数据
        if(this.name){
            //单选、多选框没有值的话取不到,所以先赋一个初始值
            if(this.type === 'switch') data_list[this.name] = "0";else data_list[this.name] = "";
            //筛选出需要 验证、条件显示、监听改变 的元素
            if(this.verify) verify_list[this.name] = this.verify;
            if(this.where) where_list[this.name] = this.where;
            if(this.change) change_list[this.name] = this.change;
        }
    });
    layui.form.render();


    //如果是搜索列表,就不使用layer了,直接返回dom对象(表单值改变就触发 yes_callback)
    if(layer_title === 'search_list'){
        var last_form_data = null;
        layui.form.on('submit('+form_filter+')',function(data){

            //需要发送的回调数据
            var this_form_data  = $.extend({},data_list,data.field);
            //删除回调不需要的数据
            $.each(this_form_data,function(key){
                if(key.indexOf('temp_name') !== -1) delete this_form_data[key];
            });
            if(last_form_data === null) last_form_data = this_form_data;
            else{
                if(JSON.stringify(this_form_data) !== JSON.stringify(last_form_data)){
                    last_form_data = this_form_data;
                    yes_callback && yes_callback({
                        data: this_form_data,
                        form: $(data.form)
                    });
                }
            }
            return false;
        });
        //绑定鼠标松开事件,如果值改变就触发回调
        $(document).mouseup(function(){ setTimeout(function(){form_submit.click();}); }).mouseup();
        
        return form_box;
    }
    //否则继续执行, 打开layer框显示表单;
    

    //where 属性 的监听逻辑
    (function(){
        //如果where_list有值 ,则监听表单的改变
        if($(where_list).joinTemplate(function(){return true;},'object').length) 
        $(document).on('mouseup keyup',function(){setTimeout(reload_where)});
        reload_where();
        //条件判断的触发 ,通过keyup和mouseup事件监听表单内值, (是否隐藏元素)
        function reload_where(){
            $.each(where_list,function(key,where_str){
                var this_where;                 //当前判断条件
                var this_form_value = {};       //当前form表单数据
                $.each(data_list,function(key){ this_form_value[key] = $(form_box[0][key]).val(); });

                //如果是传入方法,则使用方法的返回值作为验证结果
                if(typeof where_str === 'function'){
                    this_where = where_str(this_form_value,form_box);
                }else{  //否则使用eval的执行结果验证
                    where_str = where_str.replaceVar(this_form_value,function(val){return '"'+val+'"';});
                    this_where = eval(where_str.toString());
                }
                //验证不通过就隐藏dom(隐藏后就不会验证其verify)(并且 yes_callback不会返回这个值!)
                if(this_where == false){
                    if(disabled_list.indexOf(key) === -1){  //防止重复 push
                        disabled_list.push(key);
                        form_box.find('[name="'+key+'"]').parents('.layui-form-item').hide().css({opacity:0});
                    }
                }
                //验证通过就显示
                else if(disabled_list.indexOf(key) !== -1){
                    disabled_list.splice(disabled_list.indexOf(key),1);
                    var form_item = form_box.find('[name="'+key+'"]').parents('.layui-form-item').show();
                    setTimeout(function(){form_box.find('[name="'+key+'"]').parents('.layui-form-item').css({opacity:1})});
                    //如果有表格 需要重载大小,否则宽度不对
                    form_item.find('table[lay-filter]').each(function(){layui.table.reload(this.id);});
                }
            });
            //重置layer 的 位置
            layer_dom_align();
        }
    })();
    
    //change 属性 的监听逻辑
    (function(){
        //上一次的 form 值
        var last_form_value = {};$.each(data_list,function(key){ last_form_value[key] = $(form_box[0][key]).val(); });
        //如果 change_list 有值 ,则监听表单的改变
        if($(change_list).joinTemplate(function(){return true;},'object').length) $(document).on('mouseup keyup',function(){setTimeout(reload_change)}).mouseup();
        //条件判断的触发 ,通过keyup和mouseup事件监听表单内值, (是否隐藏元素)
        function reload_change(){
            //当前form表单数据
            var this_form_value = {};$.each(data_list,function(key){ this_form_value[key] = $(form_box[0][key]).val(); });
            $.each(change_list,function(key,change_callback){
                if(this_form_value[key]  !== last_form_value[key]){
                    change_callback(this_form_value[key],form_box);
                }
            });
            last_form_value = this_form_value;
        }
    })();

    
    var layer_option = {
        success:function(layero){
            var old_height;
            layero.on('mouseup keyup',function(){
                if(old_height === form_box.height()) return;
                old_height = form_box.height();
                //小高度的 layer框,  里面的select框点击的时候要显示出来 而不是 变成滚动条
                if(layero.find('.layui-layer-content').height()<400 && layero.find('.layui-layer-content').height() >= form_box.height())
                    form_box.parent().css('overflow','visible');
                else{
                    form_box.parent().css('overflow','auto');
                    layer_dom_align();
                }
            })
            
			//加载完成回调
            option.loaded && option.loaded(layero);
            //提交表单
            layui.form.on('submit('+form_filter+')',function(data){

                //当前表单数据 ,data_list里面的是默认数据,应该data.field里面的单选、多选框没选择的话不会传值.
                var yes_callback_form_data = $.extend({},data_list,data.field);
                //需要转换的 table数据
                form_box.find('.conver_data_to_value').each(function(){
                    var this_data = $(this).data().getData();
                    this_data = this_data.map(function(val){delete val['LAY_TABLE_INDEX'];delete val['layTableCheckbox'];return val;});
                    yes_callback_form_data[$(this).attr('name')] = this_data;
                });
            
                //删除回调不需要的数据
                $.each(yes_callback_form_data,function(key){
                    if(key.indexOf('temp_name') !== -1) delete yes_callback_form_data[key];
                });

                //是否通过验证 (如果被移除了则不验证 (用于关闭后获取表单数据))
                if(layero.parent().length){
                    var verify_pass = true;
                    $.each(verify_list,function(key){
                        //注意:隐藏的项目不做验证！跳过
                        if(form_box.find('[name="'+key+'"]').parents('.layui-form-item').is(':hidden')) return true;
                        var verify_array = this.split('|');
                        //必填验证
                        if(verify_array.indexOf('required')!==-1){
                            if(yes_callback_form_data[key]===''){
                                var show_text = label_list[key] || "必填项"+key;
                                layer.msg('请填写'+show_text, {icon: 7, shift: 6});
                                form_box.find('[name="'+key+'"]').focus().parents('.layui-form-item').notice();
                                verify_pass = false;
                                return false;
                            }
                        }
                        //不等于空才会验证其它的正则
                        if(yes_callback_form_data[key] !== ''){
                            $.each(verify_array,function(){
                                if(this=='required') return true;
                                var verify_msg = public_verify(this,yes_callback_form_data[key]);
                                if(verify_msg){
                                    layer.msg(verify_msg, {icon: 2, shift: 6});
                                    form_box.find('[name="'+key+'"]').focus().parents('.layui-form-item').notice();
                                    verify_pass = false;
                                    return false;
                                }
                            });
                            if(!verify_pass) return false;
                        }
                    });
                    if(!verify_pass) return false;
                }

                //如果有禁用的输入框,就不传值到 yes_callback
                if(disabled_list.length){
                    $.each(yes_callback_form_data,function(key){
                        if(disabled_list.indexOf(key) !== -1)
                            delete yes_callback_form_data[key];
                    });
                }
                //执行回调
                yes_callback && yes_callback({
                    data: yes_callback_form_data,
                    layer:layer_index,
                    form: $(data.form)
                });
                return false;
            });
        }
        ,yes:function(){ form_submit.click(); }
        ,end:function(){form_box.remove(); }
    };
    //设置 label 的宽度
    if(option.label_width){
        form_box.find('.layui-form-label').css('max-width',option.label_width);
        form_box.find('.layui-input-block').css('margin-left',option.label_width + 35 +'px');
        delete option.label_width;
    }
    if(typeof option === 'function') layer_option = option(default_option);
    else $.extend(layer_option,option);
    
    //手机端配置
    if(IS_MOBILE){
        $.extend(layer_option,{
            skin:'mobile_form',
            shade:0,
            anim:2,
            isOutAnim:false
        });
    }
    

    //表格编辑框
    if(layer_title === 'table_edit_box'){
        var show_width = option.table_edit.td.outerWidth() > 150 ? option.table_edit.td.outerWidth():150;
        //tree 选择框宽度大一些
        if(item[0].type === "select_tree_checkbox"  || item[0].type === "select_tree_radio" && show_width<260) show_width = 260;
        var show_left = option.table_edit.td.offset().left - (show_width - option.table_edit.td.outerWidth())/2;
        $.extend(layer_option,{
            skin:'table_edit_box',shade:0.01,btn:false,title:false,scrollbar:true,anim:5,closeBtn:0,shadeClose:true
            ,offset:[option.table_edit.td.offset().top - $(window).scrollTop(), show_left],
            area: show_width + 'px'
        });
        //layer销毁后(只是销毁DOM，数据还在), 提交当前表单
        var old_end = layer_option.end;
        layer_option.end = function(){ form_submit.click(); old_end();}
        //layer打开后,触发 input、select 
        var old_success = layer_option.success;
        layer_option.success = function(layero){
            form_box.parent().css('overflow','visible');
            form_box.submit(function(){layer.close(layer_index);return false;}); //阻止表单提交
            if(item[0].type === "select_table_radio") setTimeout(function(){form_box.find('.click_input').click();});
            else  setTimeout(function(){form_box.find('input').focus();});
            
            old_success(layero);
        }
        //监听 ESC 按键,直接 remove 元素防止触发回调
        $(document).keydown(keydown_esc);
        function keydown_esc(e){
            if(e && e.keyCode===27 && layer_dom){
                $(document).off('keydown',keydown_esc);
                $('.layui-layer-shade[times='+layer_index+']').remove();    //layer框
                layer_dom.remove();                                         //layer背景
                $('body').click();                                          //取消显示输入框
            }
        }
    }
    //普通弹出表单
    else if(!IS_MOBILE){
        form_box.addClass('form_item_public_position');
        if(layer_option['area'] === undefined){
            if(form_box.height()>550) layer_option['area'] = '700px';
            if(form_box.height()<160) layer_option['area'] = '550px';
        }
    }
        
    
    var layer_index = layer_open(layer_title,form_box,null,layer_option);
    //表格中的table 需要重载大小,否则宽度不对
    setTimeout(function(){
        form_box.find('table[lay-filter]').each(function(){layui.table.reload(this.id);});
    })
    var layer_dom = $('#layui-layer'+layer_index);
    //重置 layer_dom 的位置
    function layer_dom_align(){
        if(!layer_dom) return;
        var old_top = +layer_dom.css('top').replace('px','');
        var new_top = ($(window).height() - layer_dom.height())/2;
        if(old_top-new_top>10 || new_top-old_top>10)    //超过10px 才调整位置
            layer_dom.animate({top:new_top},200);
    }
    layer_dom.data('reload_align',layer_dom_align);
    layer_dom.find('.layui-layer-content').css('max-height',$(window).height()*.8 +'px');
    if(loading_count) loading_dom = public_load_open(layer_dom);
    return layer_dom;
}

/**存储和读取缓存
 * 目前使用 Storage, ie/chrome存储上限约为 5M, 后期再看是否需要 IndexedDB
 */
function public_storage(type,key,value){
    if(type === 'local') var storage = localStorage;
    else var storage = sessionStorage;

    if(value === undefined){
        try {return JSON.parse(storage[key]);
        } catch(e) {return storage[key];}
    }
    else if (value === null) storage.removeItem(key);
    else storage[key] = JSON.stringify(value);
}
/**异步加载JS并执行回调
 * @param {string} src js地址
 * @param {function} callback 加载完成回调
 */
function async_load_js(src,callback){
    //async_load_js_callback 是为了解决JS加载过程中再次被调用的问题(包括有回调、无回调混合调用的情况).
    //有四种状态: 1.undefined(未初始化)   2.Function(加载中有队列)  3.loading_and_no_callback(加载中无队列)  4.success(加载完成)
    window.async_load_js_callback = window.async_load_js_callback || {};
    //JS已加载完成则直接退出
    if(window.async_load_js_callback[src] === "success"){callback && callback();return;}

    if(typeof callback === 'function'){
        // 当前有回调 且有队列文件, 则添加到队列中等待处理
        if(typeof window.async_load_js_callback[src] === 'function'){
            var old_callback = window.async_load_js_callback[src];
            window.async_load_js_callback[src] = function(){
                old_callback();callback();
            }
            return;
        }
        // 当前有回调 且没有队列 且加载中, 则添加到队列并退出
        else if(window.async_load_js_callback[src] === 'loading_and_no_callback'){
            window.async_load_js_callback[src] = callback;
            return;
        }
        // 当前有回调 且没有队列, 则创建队列
        else window.async_load_js_callback[src] = callback;
    }else{
        // 当前没有回调 且没有队列文件, 且文件正在加载中,就没事了over
        if(window.async_load_js_callback[src] === 'loading_and_no_callback') return;
        // 当前没有回调 且没有队列文件, 状态则改为加载中且可替换回调
        else window.async_load_js_callback[src] = 'loading_and_no_callback';
    }
    
    var script_dom = document.createElement ("script");
    script_dom.src = src;
    script_dom.async = true; 
    script_dom.type = "text/javascript";
    if(layui.device.ie<10){
        //ie8/9 使用 onreadystatechange 事件
        script_dom.onreadystatechange = function(){
            if (script_dom.readyState == "loaded" || script_dom.readyState == "complete"){
                script_dom.onreadystatechange = null;
                callback = window.async_load_js_callback[src];
                window.async_load_js_callback[src] = "success";
                typeof callback === 'function' && callback();
            }
        }
    }else{
        //其它浏览器使用 onload 事件
        script_dom.onload = function(){
            callback = window.async_load_js_callback[src];
            window.async_load_js_callback[src] = "success";
            typeof callback === 'function' && callback();
        }
    }
    document.querySelector('head').appendChild(script_dom);
    return script_dom;
}
/**异步加载CSS并执行回调(不使用,以后需要使用还需要优化)
 * @param {string} href css地址
 * @param {function} callback 加载完成回调
 */
function async_load_css( href,callback ) {
    //如果已加载则退出(暂时不考虑未加载完成的处理情况,如果以后需要处理参考-async_load_js)
    if(document.querySelector('[href="'+href+'"]')) {callback && callback();return;}

    var head = document.querySelector('head'),link = document.createElement( 'link' );
    link.setAttribute( 'href', href );
    link.setAttribute( 'rel', 'stylesheet' );
    link.setAttribute( 'type', 'text/css' );
 
    var sheet, cssRules;
    if ( 'sheet' in link ) {sheet = 'sheet'; cssRules = 'cssRules';}
    else {sheet = 'styleSheet'; cssRules = 'rules';}
 
    var interval_id = setInterval( function() {     //定时验证是否加载完成(10毫秒)
        if ( link[sheet] && link[sheet][cssRules].length ) {
            clearInterval( interval_id );clearTimeout( timeout_id );
            callback && callback(true);
        }
    }, 10 );
    var timeout_id = setTimeout( function() {       //是否超时(10秒)  TODO: 错误信息收集
        clearInterval( interval_id );clearTimeout( timeout_id );
        head.removeChild( link );
        callback && callback(false);
    }, 10000 );
    head.appendChild( link );
    return link;
}
 
/**将CSS样式添加到网页中
 * @param {string} css css样式
 * @param {string} id 指定id,避免重复添加
 */
function public_append_css(css,id){
    if(id && document.querySelector('head #'+id)) return;
    var link = document.createElement('style');
    link.id=id;link.innerHTML=css;
    document.querySelector('head').appendChild(link);
}
/**获取cookie */
function public_get_cookie(cname){
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++){
        var c = ca[i].trim();
        if (c.indexOf(name)==0) return c.substring(name.length,c.length);
    }
    return "";
}
/**获取url中的所有参数*/
function public_url_parameter(){
    var url=location.href;
    url=url.substr(url.indexOf("?")+1);
    url=decodeURIComponent(url);
    var return_obj = {}
    $(url.split('&')).each(function(){
        var temp = this.split('=');
        if(temp.length==2){
            return_obj[temp[0]] = temp[1]
        }
    });
    return return_obj;
}
/**将实体字符转回为HTML、换行符转为<br/>*/
function public_decode_html(html_str){
    html_str = html_str.replace(/\n/g,"<br/>");
    return html_str.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&apos;/g, "'");  
}
/**公共验证方法
 * @param {string} type 需要验证的类型
 * @param {*} value 被验证的值
 */
function public_verify(type,value){
    var regex ={
        phone: [ /^1\d{10}$/ ,'请输入正确的手机号' ]
        ,email: [ /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/ ,'邮箱格式不正确' ]
        ,url: [ /(^#)|(^http(s*):\/\/[^\s]+\.[^\s]+)/ ,'链接格式不正确' ]
        ,number: function(value){ if(!value || isNaN(value)) return '只能填写数字' }
        ,date: [ /^(\d{4})[-\/](\d{1}|0\d{1}|1[0-2])([-\/](\d{1}|0\d{1}|[1-2][0-9]|3[0-1]))*$/ ,'日期格式不正确' ]
        ,identity: [ /(^\d{15}$)|(^\d{17}(x|X|\d)$)/ ,'请输入正确的身份证号' ]
    }
    if(regex[type]){
        if(!regex[type][0].test(value)) return regex[type][1];
        else return false;
    }else
        return '没有验证方法';
}
/**存储公共的远程访问数据 */
var public_data = {
    //所有池信息
   /* pool:function(callback){
        public_ajax('/framework/framework/get_pool_list',null,function(res){
            var return_data = res['data']['list'].toObject('pool_name','id');
            callback && callback(return_data);
        },null,{cache:'session'});
    },*/
    tags:function(callback){
        public_ajax('/tags/tags/user_tags_list',null,function(res){
            var return_data = res['data']['list'].toObject('tag_name','id');
            callback && callback(return_data);
        },null,{cache:'session'});
    },
    //所有角色信息
    role:function(callback){
        public_ajax('/api/role_manger/role_list',null,function(res){
            var return_data = res['data'].toObject('role_name','id');
            callback && callback(return_data);
        },null);
    },
    //所有部门架构
    /*department:function(callback){
        public_ajax('/framework/framework/department_setting',{web:1},function(res){
            var return_data = res['data']['department'].converTree()
            callback && callback(return_data);
        },null,{cache:'session'});
    },*/
    product_type:function(callback){
        public_ajax('/permission/product/index',null,function(res){
            var return_data = res['data']['classify'].converTree()
            callback && callback(return_data);
        },null,{cache:'session'});
    }
}

/** 绑定多个templet 防止替换旧templet*/
function public_cols_bind_templet(cols,new_function){
    if(cols.templet){
        var old_templet = cols.templet;
        cols.templet = function(data,field){
            data['new_'+field] = new_function(data,field);
            return old_templet(data,'new_'+field);
        }
    }else cols.templet = new_function;
}
/**存储公共的数据模板 */
var public_templet = {
    no_edit_field:function(data){
        var no_edit_field_list = ['id','handle_id','prev_handle_id','follow_log','last_follow_time','input_id','update_time','create_time'];
        var this_value = data.field===undefined? data.e_name:data.field;
        if(no_edit_field_list.indexOf(this_value)!==-1) data.edit = false;
    },
    field_chinese:function(data,field){
        var show_text = data['chinese_'+field];
        if(show_text===undefined) show_text = data[field];
        if(show_text===null||show_text===undefined) show_text = '';
        return show_text;
    },
    select_radio:function(data,field){
        //如果没有模板,则不处理
        if(this.other_set === null) return data[field];
        var origin_other_set = this.other_set;
        if(typeof this.other_set === 'string') this.other_set = JSON.parse(this.other_set);
        var show_text = this.other_set.toObject('id','name')[data[field]];
        this.other_set = origin_other_set;
        return show_text!==undefined? show_text:'';
    },
    select_checkbox:function(data,field){
        if(typeof this.other_set === 'string') this.other_set = JSON.parse(this.other_set);
        var show_text = this.other_set.toObject('id','name')[data[field]];
        return show_text!==undefined? show_text:'';
    },
    money:function(data,field){
        var source = typeof data === 'object'? data[field]:data;
        source = +source;
        if(Number.isNaN(source)) return '';
        return "￥"+source.toFixed(2);
    },
    sex:function(data,field){
        var source = typeof data === 'object'? data[field]:data;
        if(source == 1) return '男'; else if(source == 2) return '女'; else return '保密';
    },
    score:function(data,field){
        var source = typeof data === 'object'? data[field]:data;
        if(source == -1||source == '-1') return '缺考'; else  return source
    },
    avatar:function(data,field){
        var source = typeof data === 'object'? data[field]:data;
        if(!source) return '';
        return "<img onclick='public_alert.see_img(this)' class='w30 h30' alt='' src='"+source+"' />";
    },
    avatar_default:function(data,field){
        var source = typeof data === 'object'? data[field]:data;
        if(!source) source = '/html/static/images/avatar.jpg';
        return public_templet.avatar(source);
    },
    date:function(data,field){
        return public_templet.datetime(data,field).split(' ')[0];
    },
    datetime:function(data,field){
        if(!data) return '';
        var source = typeof data === 'object'? data[field]:data;
        if(source === '****') return '****';
        if(source === '1970-01-01 08:00:00' || source === 0 || source === '0') return '';
        if(!source) return '';
        //时间段模式
        if(source.toString().indexOf(',')>-1){
            //可设置初始的相对时间
            var origin_time = field? field:new Date();
            origin_time = origin_time.setHours(0,0,0);

            source = source.split(',');
            var begin_time = this.datetime(origin_time + source[0] * 86400 * 1000);
            var end_time   = this.datetime(origin_time + source[1] * 86400 * 1000 - 1000);  //结束时间减少1秒
            return begin_time + ' - ' + end_time;
        }   
        //单个时间转化
        else{
            console.log(source,233);
            if(new Date(source).toString() === 'Invalid Date') source = +source;
            if(source < 9999999999) source = source*1000;
            var _date = new Date(source);
            var _return = _date.toLocaleString('zh',{hour12: false}).replace(/\//g,'-');
            //兼容IE(神坑的隐藏控制字符)
            _return = _return.replace(/年|月/g,'-').replace(/日/g,'').replace(/\u200e/g,'');

            if(_date.getMonth()+1<10) _return = _return.replace('-'+(_date.getMonth()+1),'-0'+(_date.getMonth()+1));
            if(_date.getDate()<10) _return = _return.replace('-'+(_date.getDate())+' ','-0'+(_date.getDate())+' ');
            
            return _return.substring(0,_return.length-3);
        }
    },
    msg_status:function (data,field) {
        var source = typeof data === 'object'? data[field]:data;
        console.log(source);
        switch(+source){
            case 1:
                return '草稿';
                break;
            case 2:
                return "进行中";
                break;
            case 3:
                return "完成";
                break;
            case 4:
                return "驳回";
                break;
            case 5:
                return "撤回";
                break;
            default:
                return '其他';
                break;
        }
    },
    file_icon:function(name,url){
        if(/.jpg|.png|.gif/.test(url)){
            if(url.indexOf('http://')<0 && url.indexOf('https://')<0) url = USE_SERVER_URL + url;
            return "<img style='max-width:100%' onclick='public_alert.see_img(this)' alt='' src='"+url+"' />";
        }else{
            url = DOWNLOAD_HREF +url;
            return "<a target='_blank' download='"+name+"' href='"+url+"'><i class='iconfont icon-fujian'></i>"+name+"</a>";
        }
    },
    file_preview:function(url){
        if(url.indexOf('http://')<0 && url.indexOf('https://')<0) url = USE_SERVER_URL + url;
        if(/.jpg|.png|.gif/.test(url)){
            if(IS_MOBILE) return url;
            return "<a style='cursor:pointer;margin-right:10px;' onclick='public_alert.see_img($(this).children(\"img\")[0]);'><img style='display:none;' alt='' src='"+url+"' />预览</a>";
        }else{
            if(IS_MOBILE) return 'static/images/wenjian.png';
            else return '';
        }
    },
    no_data:function(){
        return '<img class="no_data_img" src="static/images/noData.png"/>';
    },
}
/**文件上传
 * @param {[object,string]} elem 
 * @param {[object,Function]} option 其它设置
 */
function public_select_upload(elem,option){
    option = option || {};
    var need_css = '\
        .upload_show_box{margin:8px 0}\
        .upload_show_box>div{position: relative; background-color: #fcfcfc; line-height: 27px; height: 28px; margin: 0 0 5px; padding: 2px; font-size: 12px; overflow: hidden;}\
        .upload_show_box>div>img{position: relative;height: 28px; max-width: 60px;float:left;opacity:0;transition:.3s;}\
        .upload_show_box .loading{color: #009688; position: relative; float: left;font-size: 22px; position: absolute;left:6px}\
        .upload_show_box>div.complete>img{width:auto;opacity:1;}\
        .upload_show_box>div.error{background:#ffdbdb}\
        .upload_show_box .icon-fujian{float: left; color: #009688; position: relative; left: 5px; top: 1px;}\
        .upload_show_box>div>.filename{display:block;position: relative;max-width: 115px; overflow: hidden; float: left; cursor:pointer;text-overflow: ellipsis; margin-left: 10px; line-height: 30px; color: #484848;}\
        .upload_show_box .del_hadlle{cursor:pointer;position: relative;font-size: 20px; color: #009688; float: right;}\
        .upload_show_box .progress{width: 0%; background: #ecfcfb; height: 100%; position: absolute; top: 0; left: 0; transition: .7s;}\
    ';
    public_append_css(need_css, 'public_select_upload_need_css');
    //上传部件盒子
    var upload_box = $('<div style="text-align:left;"></div>').insertAfter(elem);
    //触发上传的dom
    if(option.elem){
        var upload_open = option.elem;
    }else{
        //默认为一个按钮
        var upload_open = $('<button type="button" class="layui-btn"><i class="layui-icon layui-icon-upload"></i>'+(option.elem_text? option.elem_text:'上传文件')+'</button>').appendTo(upload_box);
        upload_box.append('<span class="layui-word-aux" style="font-size: 12px; top: 10px; left: 10px; position: relative;">(单个文件最大支持50MB)</span>');
    }
    //展示已上传文件的盒子
    var upload_show = $('<div class="upload_show_box"></div>').appendTo(upload_box);    // 显示上传文件的div
    // 显示已上传文件
    if(elem.val()){
        var temp = JSON.parse(elem.val());
        if(!Array.isArray(temp)) temp = [temp];
        $.each(temp,function(){
            if(this.url.indexOf('http://')<0 && this.url.indexOf('https://')<0) this.url = USE_SERVER_URL + this.url;
            var icon = /.jpg|.png|.gif/.test(this.url) ? '<img src="'+this.url+'" />':'<i class="iconfont icon-fujian"></i>'
            upload_show.append(
                '<div class="complete" u_url="'+this.url+'">\
                    <div class="progress" style="width: 100%;"></div>'
                    +icon+
                    '<a target="_blank" class="filename" href="'+this.url+'">\
                        '+this.name+'\
                    </a>\
                    <i class="layui-icon layui-icon-close del_hadlle"></i>\
                </div>');
        });
    }
    //点击预览图片
    upload_show.on('click','img',function(){ public_alert.see_img(this); });
    // 点击删除当前的文件
    upload_show.on('click','.del_hadlle',function(){
        //单文件直接清空
        if(!option.multiple) elem.val('').change();
        else{
            //多文件找到位置并删除
            var del_url = $(this).parent().attr('u_url');
            var old_value = elem.val()? JSON.parse(elem.val()):[];
            $.each($.extend({},old_value),function(key,val){if(val.url === del_url) old_value.splice(key,1); });
            
            if(old_value.length) elem.val(JSON.stringify(old_value)).change();
            else elem.val('').change();
        }
        $(this).parent().delete();
    });
    //     //上传中取消
    // upload_show.on('click',function(e){
    //     if($(e.target).hasClass('stop-updata-hadlle')){
    //         var xmlAjax = uploadInst.config.xmlAjax;
    //         xmlAjax.abort();
    //     }
    // })

    layui.use('upload', function(){
        var upload_option = {
            elem: upload_open                                       //绑定元素
            ,capture: option.capture || ''
            ,accept: option.accept || 'file'                        //允许上传的文件类型：images/file/video/audio
            ,acceptMime: option.capture? 'image/*':''               //可选类型, 移动端capture需要设置image/*
            ,exts: option.exts || ''                                //允许上传的文件后缀名
            ,auto: option.auto!==undefined?  option.auto : true     //是否选完文件后自动上传
            ,bindAction: option.bindAction || ''                    //手动上传触发的元素
            ,url: option.url || '/clue/public/upload'               //上传地址
            ,data: option.data || {}                                //请求上传的额外参数
            ,size: option.size || 0                                 //文件限制大小，默认不限制
            ,number: option.number || 0                             //允许同时上传的文件数，默认不限制
            ,multiple: option.multiple!==undefined? option.multiple : false           //是否允许多文件上传，不支持ie8-9
            ,showName: option.showName!==undefined? option.showName : true
            ,choose: function(obj){
                if(!upload_option.multiple) upload_show.html('');
                // 选择文件
                obj.preview(function(index, file, result){
                    option.choose_base64 && option.choose_base64(result);  //选择文件时回调base64
                    var fileName = upload_option.showName ? file.name :'';
                    // 判断是否为图片，是图片显示缩略图，不是就不显示
                    var icon = (file.type.indexOf('image') !== -1)? '<img src="'+result+'"/>':'<i class="iconfont icon-fujian"></i>';
                    upload_show.append($('<div uid="'+index+'">\
                        <div class="progress"></div>\
                        <i class="loading layui-icon layui-icon-loading-1 layui-anim layui-anim-rotate layui-anim-loop"></i>'
                        +icon+
                        '<a target="_blank" class="filename">'+fileName+'</a>\
                        <i class="layui-icon layui-icon-close del_hadlle"></i>\
                    </div>'));
                });
                //相机类型的 则会压缩图片
                if(option.capture){
                    //预读本地文件，如果是多文件，则会遍历。(不支持ie8/9)
                    obj.preview(function(index, old_file, base64){
                        //压缩图片后上传
                        public_reduce_img_file(old_file,base64,{
                                quality:0.8,
                                width:1200,
                                callback:function(new_file){ obj.upload(index, new_file); }
                        });
                    });
                }
            }
            ,progress: function(percent,index,file) {
                upload_show.find('[uid='+index+'] .progress').css('width',percent  + '%'); 
            }
            ,done: function(res, index){
                option.done && option.done(res,index);
                var new_value = {
                    name: res.data.name
                    ,url: res.data.save_path
                    ,size: res.data.size
                };
                
                //单文件使用 对象 保存
                if(!upload_option.multiple) elem.val(JSON.stringify(new_value)).change();
                //多文件使用 数组 保存
                else{
                    var old_value = elem.val()? JSON.parse(elem.val()):[];
                    old_value.push(new_value);
                    elem.val(JSON.stringify(old_value)).change();
                }
                //完成样式、点击跳转
                var item = upload_show.children('[uid='+index+']').addClass('complete');
                item.children('.loading').fadeOut();
                item.attr('u_url',new_value.url);
                item.children('.filename').attr('href',new_value.url);
            }
            ,error: function(index, upload){
                // TODO: 错误信息收集
                var item = upload_show.children('[uid='+index+']').addClass('error');
                item.children('.loading').attr('class','loading layui-icon layui-icon-face-cry').css('color','#ff9090');
                item.children('img').css('width','30px');
                item.children('.filename').text('上传错误,请稍后重试!');
                
            }
        }
        //执行实例
        var uploadInst = layui.upload.render(upload_option);

        if(option.auto_open) upload_open.click();   //自动点击 ,手机端不支持
    });
}
/**将layui的switch、单选框、多选框转换为表单可用数据(需要data-id属性才可以使用)
 * @param {js DOM} js_elem 需要被转换的 dom
 */
function conver_layui_form_value(js_elem){
    if(!js_elem) return;
    //在直接父级范围内查找, 防止找到其它地方的元素
    var search_range =  $(js_elem).parent();
    
    var checked_dom = search_range.find('[name="'+js_elem.name+'"]:checked');
    var all_dom = search_range.find('[name="'+js_elem.name+'"]');

    //switch开关
    if(all_dom.attr('lay-skin') === 'switch') all_dom.val(+all_dom.is(':checked'));
    //单选框
    else if(checked_dom.attr('type') === 'radio') all_dom.val(checked_dom.attr('data-id'));
    //多选框
    else all_dom.val(checked_dom.map(function(){return $(this).attr('data-id');}).toArray().join());
}
/**监听dom的位置大小 并设置到 遮罩
 * @param {DOM} 被监听对象 
 * @param {DOM} 遮罩对象 
 * @param {number} timing 监听间隔(毫秒)为, 无值则只执行一次
 */
function mask_resize(origin_dom,loading,timing){
    //遮罩被移除后就不监听了
    if(loading.parent().length){
        //有动画效果的需要单独设置top和left
        if(origin_dom.hasClass('layui-anim') || origin_dom.hasClass('layer-anim') || origin_dom.hasClass('layui-layer')){
            loading.css({top:0,left:0,width:'100%',height:'100%','border-radius':'10px'});
            if(!origin_dom.hasClass('tableSelect')) loading.css('border-radius','10px');    //圆角
        }else{
            loading.css('top',origin_dom.position().top + +origin_dom.css('margin-top').replace('px','') );
            loading.css('left',origin_dom.position().left + +origin_dom.css('margin-left').replace('px',''));
            loading.css('width',origin_dom[0].getBoundingClientRect().width);       //getBoundingClientRect获取精准数据
            loading.css('height',origin_dom[0].getBoundingClientRect().height);
        }
        //定时监听
        if(timing) setTimeout(function(){mask_resize(origin_dom,loading,timing)},timing);
    }
}
function public_object(kay,value){
    var _return = {};
    _return[kay] = value;
    return _return;
}

//========================数组,jquery 方法扩展===========================

/**将数组根据模板方法处理后累加,
 * @param {function} template 过滤函数
 */
jQuery.prototype.joinTemplate =  Array.prototype.joinTemplate = function(template,type){
    var _this = this;       //操作对象
    var return_val = '';    //1.默认返回拼接字符串
    if(type === 'object'){  
        return_val = [];    //2.可设置返回数组
        _this = this[0];    //jQuery对象需要去掉壳才能循环属性
    }

    $.each(_this,function(key,val){
        if(type === 'object') return_val.push(template.call(this,key,val));
        else return_val += template.call(this,key,val);
    });
    return return_val;
}
/**将数组 根据关系转换为 Tree结构,返回子类关系集合(不返回起始数据)
 * @param {string} parent_id 起始id(默认0) * @param {string} id_name 需要筛选数组的 id 字段名 * @param {string} parent_id_name 需要筛选数组的 parent_id 字段名
 */
Array.prototype.converTree = function (parent_id,id_name,parent_id_name){
    var origin_array = this;   //待转换的数组
    id_name = id_name || 'id';
    parent_id_name = parent_id_name || 'parent_id';
    //默认为最小的parent_id
    var min_parent_id = Math.min.apply(null, $.map(origin_array,function(value){return value[parent_id_name]}) );
    parent_id = parent_id || min_parent_id;

    //1.筛选出所有 一级子类
    var son_list_arr = $.grep(origin_array,function(val){if(val[parent_id_name]===parent_id) return true;});

    if(son_list_arr.length){
        var all_son_arr = [];
        $(son_list_arr).each(function(){
            if(this[id_name] === this[parent_id_name]) null;
            //2.递归获取 每个一级子类 的所有子类     //如果 parent_id 错误指向,会导致死循环(比如1的parent_id是2, 2的parent_id是1)
            var all_children_array = origin_array.converTree(this[id_name],id_name,parent_id_name);
            if(all_children_array) this['children'] =  all_children_array;  //有子类才创建 children 属性
            this['name'] = this['dep_name']; //当前需要使用 name 和 value ,所以转换下
            this['value'] = this['id'];
            all_son_arr.push(this);
        });
        return all_son_arr;
    }
}
/**使用对象属性添加(或覆盖)到对象数组中。
 * @param {object} update_obj 需要读取的对象 * @param {string} update_key 找到属性后,需要赋值到哪个 key(默认值 value) * @param {string} find_key 需要查找的 key(默认值 name)
 * @ [{name:'刘大'},{name:'王二'}].addAttr({刘大:18,王二:20});  返回 [{name:'刘大',value:18},{name:'王二',value:20}]
 */
Array.prototype.addAttr = function(update_obj,update_key,find_key){
    var item_list = this;
    update_key = update_key || 'value';
    find_key = find_key || 'name';

    $.each(item_list,function(key){
        $.each(update_obj,function(name,value){
            if(item_list[key][find_key] === name || name==='匹配全部')
                item_list[key][update_key] = value;
        });
    })
}
/**将数组中的对象 根据其属性匹配删除   
 * [{name:'刘大'},{name:'王二'}].deleteByAttr(['刘大']);  返回 [{name:'王二'}]
 * */
Array.prototype.deleteByAttr = function(attr_arr,attr_key){
    var item_list =this;
    attr_arr = typeof attr_arr !== 'object'? [attr_arr]:attr_arr;
    attr_key = attr_key || 'name';

    $.each(item_list,function(key){
        if(attr_arr.indexOf(this[attr_key])>-1)
        item_list.splice(key,1);
    })
}
/**将数组中所有对象的name和value提取到一个对象中, 返回{name:value} 的形式
 * [{name:'刘大',id:18},{name:'王二',id:28}].toObject();  返回 {"刘大":18,王二:28}
*/
Array.prototype.toObject = function(name,value){
    name = name || 'name';
    value = value || 'id';
    var return_obj = {};
    $.each(this,function(){
        return_obj[this[name]] = this[value];
    });
    return return_obj;
}
/**将字符串中所有模板变量替换为对象的属性
 * '我叫[name],性别[sex]'.replaceVar({name:'刘大',sex:'男'});   返回 '我叫刘大,性别男'
*/
String.prototype.replaceVar = function(data,value_template){
    var str_return = this;
    var regex = /\[([^\]]*)\]/g;
    while ((regex_res=regex.exec(this))!=null){
        var value = value_template? value_template(data[regex_res[1]]):data[regex_res[1]];
        str_return = str_return.replace(regex_res[0], value);
    }
    return str_return;
}
/**使用该方法可醒目删除DOM (统一删除特效)*/
jQuery.prototype.delete = function(){ this.fadeOut(500,function(){this.remove();});}
/**使用该方法可高亮该DOM*/
jQuery.prototype.notice = function(){this.addClass('notice');setTimeout((function(){this.removeClass('notice');}).bind(this),500);}




/**将后台数据 转换 生成搜索列表可用的数据*/
function public_conver_search_list(list){
    //1 单行文本 2 邮箱 3手机 4 多行文本 5整数 6小数 7金额 8图片 9时间 10单选下拉列表 11多选下拉列表 12 自动编号 13区块
    var text_search = '';
    var other_search = [];
    $.each(list,function(){
        if([1,2,3,4,5,6,7].indexOf(this.field_type)>-1){
            text_search += '<option value="'+this.e_name+'">'+this.name+'</option>';
        }else if(this.field_type === 9){    //时间框
            other_search.push({label:this.name,name:this.e_name,type:'datetime_area_box'});
        }else if(this.field_type === 10){   //单选下拉
            other_search.push({label:this.name,value:this.value,name:this.e_name,type:'radio',data:this.other_set,data_before:{'全部':''}});
        }else if(this.field_type === 100){   //人员选择-单选
            other_search.push({label:this.name,name:this.e_name,type:'select_table_radio'});
        }else if(this.field_type === 101){   //部门选择
            other_search.push({label:this.name,name:this.e_name,type:'select_tree_radio',data:public_data.department});
        }else if(this.field_type === 102){   //池选择
            other_search.push({label:this.name,name:this.e_name,type:'radio',data:public_data.pool_user,data_before:{'全部':''}});
        }else if(this.field_type === 103){   //地址
            other_search.push({label:this.name,name:this.e_name,type:'address'});
        }else if(this.field_type === 104){   //选择客户
            other_search.push({label:this.name,name:this.e_name,type:'select_table_radio',data:'客户'});
        }else if(this.field_type === 105){   //选择合同
            other_search.push({label:this.name,name:this.e_name,type:'select_table_radio',data:'合同'});
        }else if(this.field_type === 106){   //班级
            other_search.push({label:this.name,name:this.e_name,type:'select_table_radio',data:'班级'});
        }else if(this.field_type === 107){   //根据员工选择部门
            other_search.push({label:this.name,name:this.e_name,type:'select_table_radio',data:'部门'});
        }else if(this.field_type === 108){   //对应商机
            other_search.push({label:this.name,name:this.e_name,type:'select_table_radio',data:'商机'});
        }else if(this.field_type === 109){   //联系人
            other_search.push({label:this.name,name:this.e_name,type:'select_table_radio',data:'联系人'});
        }else if(this.field_type === 110){   //人员选择-多选
            other_search.push({label:this.name,name:this.e_name,type:'select_table_checkbox'});
        }else if(this.field_type === 116){   //对应线索
            other_search.push({label:this.name,name:this.e_name,type:'select_table_radio',data:'线索'});
        }
    });
    return {text:text_search,other:other_search};
};
/**将后台数据 转换 生成表单可用的数据
 * @param {array} field_array 后台数据
 */
function public_field_conver_form(field_array){
    var _return = [];
    $.each(field_array,function(){
        _return.push({
            label:this.name,
            name:this.e_name,
            placeholder:this.placeholder,
            verify: this.required? 'required':'',
            type:public_conver_form_type(this.field_type),
            data:conver_form_data(this),
            value:conver_form_value(this),
            readonly:this.is_edit === false || this.edit === false ? true:false
        });
    });
    return _return;

    function conver_form_data(data){
        if(data.field_type===10 || data.field_type===11){
            if(typeof data.other_set === 'object') return data.other_set;
            else return data.other_set? JSON.parse(data.other_set).toObject():null
        }
        if(data.field_type===101)  return public_data.department;
        if(data.field_type===102)  return public_data.pool_user;
        if(data.field_type===104)  return '客户';
        if(data.field_type===105)  return '合同';
        if(data.field_type===106)  return '班级';
        if(data.field_type===107)  return '部门';
        if(data.field_type===108)  return '商机';
        if(data.field_type===109)  return '联系人';
        if(data.field_type===112)  return '产品分类';
    }
    function conver_form_value(data){
        if([1,2,3,4,5,6,7,8,9,10,11,12,13,101,102,103,111,113,114].indexOf(+data.field_type)>-1)
            if(typeof data.value === 'object') data.value = data.value[Object.keys(data.value)[0]];
        return data.value;
    }
}
/**将数据库中 field_type 转换成 public_form 的 type*/
function public_conver_form_type(type){
    switch(+type){
        case 1:return 'input';          //单行文本
        case 2:return 'email';          //邮箱
        case 3:return 'tel';            //手机
        case 4:return 'textarea';       //多行文本
        case 5:return 'number';         //整数
        case 6:return 'number';         //小数
        case 7:return 'number';         //金额
        case 8:return 'upload';         //多选附件、不限制类型
        case 9:return 'datetime';       //时间
        case 10:return 'select';        //单选下拉
        case 11:return 'select_multi';  //多选下拉
        case 12:return 'input';         //自动编号
        case 13:return 'input';         //区块

        case 100:return 'select_table_radio';   //正常员工-单选
        case 101:return 'select_tree_radio';    //部门
        case 102:return 'select';               //池
        case 103:return 'address';              //地址
        case 104:return 'select_table_radio';   //客户
        case 105:return 'select_table_radio';   //合同
        case 106:return 'select_table_radio';   //班级
        case 107:return 'select_table_radio';   //根据员工选择部门
        case 108:return 'select_table_radio';   //商机
        case 109:return 'select_table_radio';   //联系人
        case 110:return 'select_table_checkbox';        //正常员工-多选
        case 111:return 'upload';                       //多选附件、不限制类型(和 8相同)
        case 112:return 'select_table_radio' ;          //产品分类
        case 113:return 'upload_picture';               //单图上传
        case 114:return 'upload_picture_more';          //多图上传
        case 115:return 'upload_one';                  //单文件上次
        case 116:return 'select_table_radio';   //选择线索
    }
}



/**绑定事件的方法(不直接使用) */
function tips_mouseenter(){
    if($(this).attr('tips-type')==1)
        window.layer_this_tips = layer.tips($(this).data('tips'),$(this),{ tips: [1, '#78BA32'],zIndex:99999999}); 
    else
        window.layer_this_tips = layer.tips('<span class="color_666">'+$(this).data('tips')+'</span>',$(this),{ tips: [3,'#fff'],zIndex:99999999}); 
}
function tips_mouseleave(){layer.close(window.layer_this_tips);}
function select_openin_layer(){
        return;
        if($(this).parent('.layui-select-disabled').length) return; //已禁用的下拉框 
        if(IS_IE) return;
        if(IS_MOBILE) return;
        //解决低高度表单中显示不全的问题
        $(this).parent().css('overflow','hidden');//解决outerWidth取不准、显示一瞬间高度变化的问题

        var this_dom  = $(this);
        var select_content = $(this).next();
        if(select_content.length === 0) {
            $(this).parent().css('overflow','visible');
            return;
        }
        
        var layer_top = select_content.offset().top - $(window).scrollTop() - 70;
        //底部没有空间则显示到上面
        if(this_dom.offset().top + select_content.outerHeight() + 60 >  $(window).height()){
            layer_top = this_dom.offset().top - select_content.outerHeight() - 50;
        }
        
        var layer_index = layer.open({
            type:1, closeBtn: 0, shadeClose: true, title:false,shade:0, isOutAnim :false, anim:5,
            content:'<div class="layui-unselect layui-form-select layui-form-selected layui-table-select"></div>',
            offset:[layer_top,select_content.offset().left],
            area: select_content.outerWidth() + 'px',
            success:function(layero,index){
                select_content.appendTo(layero.find('.layui-layer-content').css('overflow','visible').find('.layui-form-selected'));
                layero.find('dl,dd').click(function(){
                    layui.layer.close(index);
                });
            },
            end: function () {this_dom.after(select_content);}
        });
        
        var click_other_close_layer = function(){ $(document).unbind('click',click_other_close_layer); layui.layer.close(layer_index); };
        $(document).click(click_other_close_layer);
        
}


/**公共导入导出
form 传入模块id
form_type 对于客户和线索而言，是分了客户/客户池、线索/线索池的 ,1 代表客户/线索，2代表客户池/线索池
module_name 模块名；传入线索、客户、联系人等
search_value 所有搜索条件的集合。格式：{0=>['name'=>'lead_type','operator'=>"=","value"=>"1"]}
ids_str 主要是用于导出所选时,传过来的需要导出的数据id的集合，字符串格式，中间用英文逗号隔开
id_name  主要是用于导出所选时，传过来的id对应的字段名，一般是"id",但对于线索来说是"lp_id",对客户来说是"cp_id"

**/
function public_import_export(data,form_code,form_type,module_name,search_value,id_name,ids_str){
    layui.use(['table','upload','form'],function(){
        var limit = 2000,
            form = layui.form,
            table = layui.table,
            upload = layui.upload;
        if(id_name === undefined) id_name = "id";
        if(ids_str === undefined) ids_str = "";

        if(data.value == 1 || data.value == 4){
            if(data.value == 4){//导入跟进记录
                if(form_code == 1){form_code = 11;}//线索
                if(form_code == 2){form_code = 21;}//客户
                if(form_code == 3){form_code = 31;}//联系人
                if(form_code == 4){form_code = 41;}//商机
                if(form_code == 5){form_code = 51;}//合同
                module_name = module_name+"跟进记录";
            }
            var importc_html = '<div class="ImportCTop">\
                <div class="green">上传文档\
                    <div>\
                        <span></span>\
                        <p></p>\
                    </div>\
                </div>\
                <div>云端导入\
                    <div>\
                        <span></span>\
                        <p></p>\
                    </div>\
                </div>\
                <div>完成\
                    <div>\
                        <span></span>\
                    </div>\
                </div>\
            </div>\
            <form class="ImportCM layui-form" action="{:url(\'import/import/import_text_deal\')}">\
                <p>1、点击下载 <a href="/import/import/import_template?form='+form_code+'&form_type='+form_type+'" class="green">导入数据模板</a> 将要导入的数据填充到数据导入模板文件中。</p>\
                <div>\
                    <p>注意事项：</p>\
                    <p>1）模板中的表头不可更改，表头行不可删除；</p>\
                    <p>2）除必填的列以外，不需要的列可以删除；</p>\
                    <p>3）单次导入的数据不超过10000条。</p>\
                </div>\
                <p>2、选择数据重复时的处理方式：</p>\
                <div class="ImportCMI">\
                    <div><select name="common_data_deal_type" lay-filter="common_data_deal_type">\
                        <option value="1">不导入</option>\
                        <option value="2">导入</option>\
                    </select></div>\
                    <div>\
                        <p>查重规则：电话、手机、公司名称</p>\
                    </div>\
                </div>\
                <p>3、选择要导入的数据文件。</p>\
                <div>\
                    <div class="layui-upload">\
                        <button type="button" class="layui-btn" id="ImportW">选择文件</button>\
                    </div>\
                    <div id="check_info">\
                        <span class="check_info_msg"></span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\
                        <span class="check_info_file"></span>\
                    </div>\
                    <a href="javascript:void(0);" class="green import_log_show" id="ImportHistory">查看历史导入记录</a>\
                </div>\
            </form>';
            $(".ImportC").html(importc_html);
            form.render();
            var layer_index = layer_open(module_name+"导入",$(".ImportC"),function(){
            },{
                success:function(layero){
                    var btn_submit_dom = layero.find('.layui-layer-btn0');
                    var send_data = {form:form_code,form_type:form_type,common_data_deal_type: $("select[name=common_data_deal_type] option:selected").val()}
                    form.on('select(common_data_deal_type)', function(data){
                        send_data.common_data_deal_type = data.value;
                    });  
                    upload.render({
                        elem: '#ImportW'
                        , url: '/import/import/import_text_deal'
                        , data: send_data
                        , auto: false
                        , accept:"file"
                        , bindAction: btn_submit_dom
                        , before: function(){
                            $(".check_info_msg").html("");
                            $(".check_info_file").html("");
                            index = layer.msg('正在导入，请稍等……', {icon: 16,time:0});
                        }
                        , done: function (res) {
                            layer.close(index);
                            if(res.code == 1){
                                layer.close(layer_index);
                                layer.msg(res.msg); 
                                var t=setTimeout(reload_html,1500);
                                function reload_html(){
                                    window.location.reload();
                                }
                            }else if(res.code < 1){
                                layer.msg(res.msg); 
                            }else if(res.code > 1){
                                $(".check_info_msg").html(res.import_res_msg);
                                var error_html = '<a style="color:red" href="'+decodeURI(res.error_file_path)+'" target="_blank" download="'+res.error_file_name+'">点击下载错误文件</a>';
                                $(".check_info_file").html(error_html);
                            }
                        }
                    });
                },
                area: '682px;'
                , btn: ['导入', '取消']
                , shadeClose: true
            });

            $(".ImportC").on("click","#ImportHistory", function () {
                layer.open({
                    type: 1
                    , title: "导入历史记录"
                    , closeBtn: 0
                    , anim:5
                    , area: '682px;'
                    , btn: '关闭'
                    , btnAlign: 'r'
                    , shadeClose: true
                    , content: $(".ImportHistoryC")
                });
                public_table('#ImportHistoryTable', '/import/import/get_import_log',{form:form_code,form_type:form_type}, [[
                    {field: 'create_time', title: '导入完成时间'}
                    , {field: 'import_result', title: '导入结果'}
                    , {field: 'import_file_name', title: '下载错误报告',templet:function(rows_data){return '<a href="'+rows_data.error_file_path+'" download="'+rows_data.import_file_name+'">'+rows_data.import_file_name+'</a>'}}
                ]]);
            });
            
        }else if(data.value==2){//导出所有当前条件下的数据
            $(".export_html").html("");
            var ready_data = layer.msg('正在准备导出数据，请稍等……', {icon: 16,time:0});
            //获取所有的搜索条件和排序
            send_data = {form:form_code,form_type:form_type,search_value:search_value};
            public_ajax('/import/import/export_num',send_data,export_num_success_callback,null,null);
            function export_num_success_callback(res){
                if(res.page == 0){
                    layer.msg("无数据可导出");
                    return;
                }
                var html = "";
                for(i=0;i<res.page;i++){
                    if(i+1 == res.page){
                        html += '<li><div><span class="name">文档'+(i+1)+'</span>（'+(i*limit + 1)+'~'+res.num+'）</div><div class="msg_div"></div><div class="click_div"><a class="export_btn" page="'+(i+1)+'" href="javascript:void(0);">点击执行导出文档'+(i+1)+'</a></div></li>';
                    }else{
                        html += '<li><div><span class="name">文档'+(i+1)+'</span>（'+(i*limit + 1)+'~'+((i+1)*limit)+'）</div><div class="msg_div"></div><div class="click_div"><a class="export_btn" page="'+(i+1)+'" href="javascript:void(0);">点击执行导出文档'+(i+1)+'</a></div></li>';
                    }
                }  
                $(".export_html").html(html);
                layer.close(ready_data);
                layer.open({
                    type: 1
                    , title: module_name+"导出"
                    , closeBtn: 0
                    , offset: 'c'
                    , area: '682px;'
                    , btn: '取消'
                    , btnAlign: 'r'
                    , shadeClose: true
                    , content: $(".exportC")
                });
            }
            $(".export_html").on("click",".export_btn",function(){
                var index = layer.load(0,{shade: [0.7,'#fff']});
                var page = $(this).attr("page");
                var name = $(this).parents("li").find(".name").text();
                var the = $(this).parents("li");
                send_data.page = page;
                // send_data = {form:form_code,form_type:form_type,search_value:search_value,page:page};
                public_ajax('/import/import/export_ready',send_data,export_ready_success_callback,null,null);
                function export_ready_success_callback(res_data){
                    if(res_data.code == 1){
                        layer.close(index);
                        the.find(".msg_div").html("导出成功");
                        the.find(".click_div").html("<a href='"+res_data.file_path+"' download='"+res_data.filename+"'>点击下载"+name+"</a>");
                    }
                }
            })
        }else if(data.value==3){//导出选中
            var ready_data = layer.msg('正在准备导出数据，请稍等……', {icon: 16,time:0});
            /**获取选中的数据id**/
            $(".export_html").html("");

            var ids_arr = ids_str.split(",");
            var ids_count = ids_arr.length;
            if(ids_str == ""){
                layer.msg("请至少选择一条数据",{time:1500});
                return false;
            }
            var html = "";
            var id_page = Math.ceil(ids_count/limit);
            for(i=0;i<id_page;i++){ 
                if(i+1 == id_page){
                    html += '<li><div><span class="name">文档'+(i+1)+'</span>（'+(i*limit + 1)+'~'+ids_count+'）</div><div class="msg_div"></div><div class="click_div"><a class="export_btn" page="'+(i+1)+'" href="javascript:void(0);">点击执行导出文档'+(i+1)+'</a></div></li>';
                }else{
                    html += '<li><div><span class="name">文档'+(i+1)+'</span>（'+(i*limit + 1)+'~'+((i+1)*limit)+'）</div><div class="msg_div"></div><div class="click_div"><a class="export_btn" page="'+(i+1)+'" href="javascript:void(0);">点击执行导出文档'+(i+1)+'</a></div></li>';
                }
            }  
            $(".export_html").html(html);
            layer.close(ready_data);
            layer.open({
                type: 1
                , title: module_name+"导出"
                , closeBtn: 0
                , area: '682px;'
                , btn: '取消'
                , btnAlign: 'r'
                , shadeClose: true
                , content: $(".exportC")
            });
            $(".export_html").on("click",".export_btn",function(){
                var index = layer.load(0,{shade: [0.7,'#fff']});
                var page = $(this).attr("page");
                var name = $(this).parents("li").find(".name").text();
                var the = $(this).parents("li");
                var send_data = {form:form_code,form_type:form_type,ids_str:ids_str,id_name:id_name,page:page};
                public_ajax('/import/import/export_ready',send_data,export_ready_success_callback,null,null);
                function export_ready_success_callback(res_data){
                    if(res_data.code == 1){
                        layer.close(index);
                        the.find(".msg_div").html("导出成功");
                        the.find(".click_div").html("<a href='"+res_data.file_path+"' download='"+res_data.filename+"'>点击下载"+name+"</a>");
                    }
                }
            })
        }
        
    });
}
/**获取提交审批时信息
code 表单编号
type 1表示审批人  2表示抄送人
**/
function public_get_approver(code,department,callback,loading_dom){
    if(department === undefined) department=""

   var str=$('<div id="shengpiren"></div>');/*审批*/
   var song="";/*抄送*/
   var data=[];
   /*获取审批的信息*/
   public_ajax("/approval/approval/get_deparment_id",null,function(res){
      public_ajax("/approval/approval/public_get_approver",{code:code,department:department},function(data){
           if(!data.data){
              callback && callback("");
              return;
           }
           var Approvers=data.data.level_arr;
           var cclist_ids=data.data.cclist_ids;
           var root_setting=data.data.root_setting;
           var depart;
           var val=0;
           if(res.data.data.length>1){
              depart= res.data.data.toObject('depart_name','id');
              val=res.data.id;
           }
           /*审批人为空时  否认设置为可选择审批人*/
           if(!Approvers[0]['infor'] && root_setting['eidt_approval']!=1){
               layer.msg("没有找到审批人或审批人没权限，请联系管理员");
           }
          /*审批人*/
          str.append($("<div class='Approvers_span'>"+(root_setting['eidt_approval']==1? "（可自行添加节点）":"（已由管理员预设不可更改）")+"</div>"));
          var ul = $("<ul name='approvers' class='Approvers clearfix conver_data_to_value'></ul>").appendTo(str);
          if(root_setting['eidt_approval']==1){
              ul.append('<li class="approvers_add"><img src="static/images/apperval.png" style="cursor:pointer;" alt=""><i>• • •</i></li>');
          }
          ul.data('push',function(avatar,user_name,user_id,del,length,type){
                var li = $("<li data-type='"+type+"' data-id='"+user_id+"' data-del='"+del+"'><img src='"+avatar+"' alt=''/><p>"+user_name + (length>1? "等"+length+"人":"")+"</p></li>");
                li.append(type==1? '<span>（会签）</span>':'<span>（或签）</span>');
                li.append('<i>• • •</i>');
                if(ul.find('li.approvers_add').length)
                    ul.find('li.approvers_add').before(li);
                else 
                    ul.append(li);
          });

          ul.data('this',ul);
          ul.data('getData',function(){
                var _return = [];
                this['this'].find('li').each(function(){
                    if($(this).data('type'))
                        _return.push({type:$(this).data('type'),id:$(this).data('id')});
                });
                return _return;
          });
          $.each(Approvers,function(i,v){
                var userid="";
                $.each(v['infor'],function(j,val){
                    if(j==0){
                       userid+=val['userid'];
                    }else{
                        userid+=","+val['userid'];
                    }
                })
                if(v['infor']){
                    ul.data('push')(v['infor'][0]['avatar'],v['infor'][0]['user_name'],userid,false,v['infor'].length,v['approver_type']);
                }
          });

          /*抄送人*/
          /*抄送人人为空时  否认设置为可选择抄送人*/
           // if(!cclist_ids){
           //     root_setting['edit_cclist']=1
           // }
          song+="<div class='Approvers_span'>";
          if(root_setting['edit_cclist']==1){
              song+="（可自行添加人员）";
          }else{
              song+="（已由管理员预设不可更改）";
          }
          song+="</div><ul name='cclist' class='Approvers clearfix'>";
          if(cclist_ids){
             $.each(cclist_ids,function(i,v){
                 if(v) song+="<li data-del='false'><img src='"+v['avatar']+"' alt=''/><p>"+v['user_name']+"</p><input type='hidden' name='copy_person[]' value='"+v['userid']+"'/></li>";
              })
          }
          if(root_setting['edit_cclist']==1){
            song+="<li><img src='static/images/apperval.png' style='cursor:pointer;' class='cclist_add' alt='' /></li>";
          }           
          song+="</ul>";
          data["str"]=str;
          data['depart']=depart;
          data['val']=val;
          data['song']=song;
          callback && callback(data);
        },loading_dom)
   },loading_dom)
}
/**渲染表单中的审批 dom
 * @param {[stinrg,null]} department 提交部门
 * @param {DOM} append_box append到哪个父元素   
 * @param {number} classify 类型(2客户,3联系人,4商机)
 * @param {DOM} layero layer dom
 * @param {string} name_group 需要给name添加的分组(无分组要求不填写)
 */
function public_approval_dom(department,append_box,classify,layero,name_group){
    if(append_box.length>1) {console.error('父元素数量错误！');}
    var loading = public_load_open(layero);
    //请求审批信息
    public_ajax('/approval/approval/flow_is_open',{form:classify},function(data){
        if(data['data']['start']==2)  public_load_close(loading);                   //已关闭审批
        else{                                                                       //已开启审批
            public_get_approver(classify,department,function(approver_data){        //获取审批信息
                var select_id = 'approver_department'+ +new Date();
                var select_html = $(approver_data['depart']).joinTemplate(function(text,value){return '<option value="'+value+'" '+(department===value? 'selected':'')+'>'+text+'</option>' },'object');
                select_html = $('<select class="openin_layer" lay-filter="'+select_id+'" name="approver_department">'+select_html+'</select>');
                var approver_dom1 = approver_data['str'];
                var approver_dom2 = $(approver_data['song']);

                //更改提交部门
                layui.form.on('select('+select_id+')',function(change){
                    append_box.find('.approver_box').remove();
                    public_approval_dom(change.value,append_box,classify,layero,name_group);
                });

                if(name_group){
                    select_html.attr('name',name_group+'[approver_department]');
                    approver_dom1.find('[name=approvers]').attr('name',name_group+'[approvers]');
                    approver_dom2.find('[name="copy_person[]"]').attr('name',name_group+'[copy_person][]');
                }
                
                var approver_box = $('<div class="approver_box"></div>').appendTo(append_box);
                if(approver_data['depart']){
                    approver_box.append(form_item('提交部门',select_html)); layui.form.render();
                }
                approver_box.append(form_item('审批人',approver_dom1));
                approver_box.append(form_item('抄送人',approver_dom2));
                layero.find('.layui-layer-btn0').text('提交审批');
                public_load_close(loading);
                layero.data('reload_align') && layero.data('reload_align')(); //重载布局
                
                function form_item(label,html){
                    var item_dom = $('<div class="layui-form-item">\
                        <label class="layui-form-label">'+label+'</label>\
                        <div class="layui-input-block"></div>\
                    </div>');
                    item_dom.find('.layui-input-block').append(html);
                    return item_dom;
                }
            });
            
            /*点击添加审批人的添加按钮*/
            append_box.off('click','.approvers_add').on('click','.approvers_add',function(){
                var cclist_add_dome=$(this);
                public_form('添加审批节点',[
                    {label:"审批人",name:'id',verify:'required',type:'select',data:{"负责人直接主管":1,"负责人二级主管":12,"负责人三级主管":13,"指定成员":2,"角色":3,"发起人自己":4}}
                    ,{label:"人员",verify:'required',name:'name',type:'select_table_checkbox',where:'[id]==="2"'}
                    ,{label:"角色",verify:'required',name:'role',type:'select',data:public_data.role,where:'[id]==="3"'}
                    ,{label:"类别",name:'type',type:'radio',data:{"会签（需所有审批人同意）":1,"或签（一名审批人同意即可）":2},value:1}
                    ,{name:"depart",type:"hidden",value: department}
                ],function(res){
                    layer.close(res.layer);
                    public_ajax("/approval/approval/add_approver_user",res.data,function(data){
                        var value=data.data.data;
                        if(value.length){
                            var push = cclist_add_dome.parent('ul').data('push');
                            var userid=value.joinTemplate(function(){return ','+this.userid}).substr(1);
                            push(value[0]['avatar'],value[0]['user_name'],userid,true,value.length,res['data']['type']);
                        }else{
                            layer.msg("没找到该审批人或审批人不在权限范围内！");
                            return false;
                        }
                    },cclist_add_dome)
                })
            })
            /*双击删除审批节点*/
            append_box.off('dblclick','.Approvers>li').on('dblclick','.Approvers>li',function(){
                if($(this).data('del')) $(this).remove();
            })
            /*点击添加抄送人的添加按钮*/
            append_box.off('click','.cclist_add').on('click','.cclist_add',function(){
                var cclist_add_dome=$(this);
                public_form('添加抄送人',[
                    {label:"抄送人",name:'id',type:'select_table_checkbox'}
                ],function(res){
                    layer.close(res.layer);
                    public_ajax("/approval/approval/add_cclist_user",res.data,function(data){
                        var v=data.data.data;
                            if(v.length>0){
                                var str="";
                                $.each(v,function(i,val){
                                    var input_name = name_group? name_group+'[copy_person][]':'copy_person[]'
                                    str+="<li data-del='true'>\
                                        <img src='"+val['avatar']+"' alt=''/>\
                                        <p>"+val['user_name']+"</p>\
                                        <input type='hidden' name='"+input_name+"' value='"+v['userid']+"'/>\
                                    </li>";
                                })
                                cclist_add_dome.parent("li").before(str);
                            }else{
                                layer.msg("无相关人员");
                                return false;
                            }
                    },cclist_add_dome) 
                })
            })
        }
    });
}
/**重载搜索栏收起时显示的文字 */
function public_reload_search_text(parent_dom){
    var search_show_text = parent_dom.find('.layui-form>.layui-form-item').joinTemplate(function(){
        var title = $(this).children('.layui-form-label').text();
        var value = $(this).find('.layui-form-radioed>div').text()      //1.输入框
                        || $(this).find('.xm-select').attr('title')     //2.多选框
                        || $(this).find('.click_input').text()          //3.人员选择框
                        || $(this).find('.city-picker-input').val()     //4.地区选择
                        || '无';                                        //5.其它类型需要单独添加判断...
        return '<div>'+ title +"："+ value + '</div>';
    });
    if(!parent_dom.find('.condition').length){
        var condition = '<div class="condition"> <div class="layui-form-item"> <div class="layui-form-label">筛选条件：</div> <div class="layui-input-block green"></div> </div> </div>';
        parent_dom.append(condition);
    }
    parent_dom.find('.condition .layui-input-block').html(search_show_text);
}
/**
 * 压缩图片
 * @param {*} old_file 旧文件   
 * @param {*} path 图片路径或base64
 * @param {*} option 设置
 */
function public_reduce_img_file(old_file, path, option){
    if(IS_IPHONE) return option.callback(old_file);

    var filename = old_file.name;
    option = option || {};
    var img = new Image();
    img.src = path;
    img.onload = function(){
        var that = this;
        // 默认按比例压缩
        var w = that.width, h = that.height, scale = w / h;
        
        if(option.width && option.width < w) w = option.width;
        h = option.height || (w / scale);

        var quality = 0.7;  // 默认图片质量为0.7
        //生成canvas
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');
        // 创建属性节点
        var anw = document.createAttribute("width"); anw.nodeValue = w;
        var anh = document.createAttribute("height"); anh.nodeValue = h;
        canvas.setAttributeNode(anw);
        canvas.setAttributeNode(anh);
        ctx.drawImage(that, 0, 0, w, h);
        // 图像质量
        if(option.quality && option.quality <= 1 && option.quality > 0){ quality = option.quality; }
        // quality值越小，所绘制出的图像越模糊
        var base64 = canvas.toDataURL('image/jpeg', quality);
        
        // 回调函数返回base64的值
        option.callback(convertBase64UrlToBlob(base64,filename));
    }
    //将base64转换为文件
    function convertBase64UrlToBlob(dataurl, filename) {
        var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        while(n--){
            u8arr[n] = bstr.charCodeAt(n);
        }
        
        var file = new File([u8arr],filename, {type: mime});
        
        return file;
    }
}

// /**工商信息模糊查询**/ 
// $("body").on("keyup","input[name=company_name]",function(){
//     var keyword = $(this).val();
//     var length = keyword.length;
//     if(length >= 4){
//         console.log(keyword,length,2222222222222)
//         public_ajax("/Clue/customer/customer_serach",{keyword:keyword},function (res) {

//         })
//     }
// })

function update_toCustomerAuthentication(info,update_time){
    $(".CreditCode").html(info.CreditCode);
    $(".Name").html(info.Name);
    $(".OperName").html(info.OperName);
    $(".EconKind").html(info.EconKind);
    $(".RegistCapi").html(info.RegistCapi);
    $(".Status").html(info.Status);
    $(".StartDate").html(info.StartDate);
    $(".TermStart").html(info.TermStart);
    $(".TeamEnd").html(info.TeamEnd);
    $(".CheckDate").html(info.CheckDate);
    $(".BelongOrg").html(info.BelongOrg);
    $(".EconKind").html(info.EconKind);
    $(".Address").html(info.Address);
    $(".Scope").html(info.Scope);
    $(".update_time").html(update_time);
}