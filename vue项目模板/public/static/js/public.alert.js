/**公共的弹窗调用集合
 */
var public_alert = {
    /**layer 图片预览 */
    see_img:function(img_dom){
        var show_width = img_dom.naturalWidth;
        var show_height = img_dom.naturalHeight;
        //大图缩小一半
        if($(window).height() < show_height || $(window).width()< show_width) {
            show_height = show_height * .5;
            show_width = show_width * .5;
        }
        
        if($(window).width()<show_width){
            show_height = show_height / (show_width / ($(window).width()*.9));  //根据图片等比例设置高度
            show_width = $(window).width()*.9;
        }
        if($(window).height()<show_height) show_height = $(window).height()*.9;

        layer.open({
            type:1 ,title:false ,closeBtn:2 ,skin:'layui-layer-nobg overflow_v' ,shadeClose:true
            ,content:'<img src="'+img_dom.src+'" style="max-width: 100%;"/>'
            ,scrollbar:false
            ,area:img_dom.naturalWidth? [show_width+'px',show_height+'px']:false
        });
    },
    /**layer 产品选择 */
    select_product:function(yes_callback){
        var select_cols = [[
            {type:'checkbox'}
            ,{title:"产品名称",field: 'product_name'}
            ,{title:"产品编号",field: 'number'}
            ,{title:"标准单价",field: 'unit_price'}
            ,{title:"销售单位",field: 'company'}
            ,{title:"单位成本",field: 'cost'}
            ,{title:"规格",field: 'specifications'}
        ]];
        /*接口的条件*/
        var condition = {condition:[]};
        condition['condition'].push({name:'state',operator:'=',value:1},{name:'soft_delete',operator:'=',value:1});
        var select_table_set = { cols:select_cols,totalRow:false,page:{limits:[10,20,50,100]},url:'/permission/product/table_list',where:condition };
        //# 1.打开选择框
        var select_open = public_form( '添加产品' ,[{name:'select_table',type:'table',table:select_table_set}] ,select_yes ,{area:IS_MOBILE? '100%':'50%',btn:['下一步','取消']} );
        //# 2.确认选择框
        function select_yes(res){
            var table_id = res.form.find('[name=select_table]').data('origin_key');
            layer_close(select_open);
            var checked_data = layui.table.checkStatus(table_id)['data'];
            //选择框可编辑字段的初始值
            $.each(checked_data,function(){
                this['set1'] = this['unit_price'];
                this['set2'] = 1;
                this['set3'] = this['unit_price'];
                this['set4'] = "";
            });
            var edit_cols = [[
                {totalRowText:'合计：',width:60,align:'center',templet:function(){return '<i lay-event="del" class="iconfont icon-shanchu"  data-tips="删除"></i>';}}
                ,{title:"产品名称",align:'center',field: 'product_name',templet:public_templet.name}
                ,{title:"产品编号",align:'center',field: 'number'}
                ,{title:"标准单价",align:'center',field: 'unit_price'}
                ,{title:"销售单位",align:'center',field: 'company'}
                ,{title:"单位成本",align:'center',field: 'cost'}
                ,{title:"规格",align:'center',field: 'specifications'}
                ,{title:"售价",align:'center',totalRow:true,minWidth:150,field: 'set1',edit:true,templet:public_templet.money}
                ,{title:"数量",align:'center',totalRow:true,minWidth:50,field: 'set2',edit:true}
                ,{title:"总价",align:'center',totalRow:true,minWidth:100,field: 'set3',templet:function(data){
                    var this_sum = public_templet.money(data['set1']*data['set2']);
                    //编辑 时更新 layui缓存中的总价值
                    if(edit_table_id) layui.table.cache[edit_table_id][data['LAY_INDEX']-1]['set3'] = this_sum.replace('￥','');
                    return this_sum;
                }}
                ,{title:"备注",field: 'set4',minWidth:200,edit:true}
            ]];
            var edit_table_set = { cols:edit_cols,data:checked_data,cellMinWidth:80,no_scrollbar:false};
            //# 3.打开编辑框
            var edit_open = public_form( '确认关联产品' ,[{name:'edit_table',type:'table',table:edit_table_set,width:95}] ,edit_yes ,{area:IS_MOBILE? '100%':'70%',btn:['确定','取消']} );
            var edit_table_id = edit_open.find('[name=edit_table]').data('origin_key');
            //# 4.确认编辑框
            function edit_yes(res){
                layer_close(edit_open);
                var callback_data = $.map(res.data['edit_table'],function(origin_value){return {
                    id:origin_value['id']
                    ,type_id:origin_value['type_id']
                    ,money:+origin_value['set1']
                    ,num:+origin_value['set2']
                    ,remark:origin_value['set4']
                }});
                yes_callback && yes_callback(callback_data);
            }
        }
    },
    /**layer 信息查重 */
    search_repeat:function(classify,search_val){
        var html_box = $('<div></div>');
        var form = $('<form class="layui-form search_repeat" style="background-color: #f9f9f9; padding: 25px 0; text-align: center; line-height: 51px; font-size: 13px; color: #999;"></form>').appendTo(html_box);
        form.append('<div class="layui-inline" style="width: '+(IS_MOBILE? 70:103)+'px; margin: 0 10px;"><select id="check_type" class="openin_layer"> <option value="1">线索</option> <option value="2">客户</option> <option value="3">联系人</option></select></div>');
        form.append('<div class="layui-inline" style="width: '+(IS_MOBILE? 100:260)+'px; margin-right: 10px;"> <input style="text-align: left;" type="text" id="check_input" placeholder="关键字" class="layui-input"/> </div> <button type="submit" class="layui-btn">查询</button> <input id="close" type="button" class="layui-btn layui-btn-primary  layui-btn-sm" value="取消"/> <div><p>查重字段： 公司名称、电话、手机</p></div>');
        form.find('#close').click(function(){layer_close(layero);});

        var table = $('<div style="'+(IS_MOBILE? '':'padding: 20px;')+' overflow: auto;"><table></table></div>').appendTo(html_box).children();
        form.submit(function(){
            var search_val = form.find('#check_input').val();
            var type = +form.find('#check_type').val();

            if(!search_val){layer.msg('请输入查询信息');return false;}
            if(type === 1){
                var cols = [[ {field: 'name', title: '姓名',minWidth:80,templet:public_templet.name.bind({link:'clue/clueDes.html?lead_id=[lead_id]&pool_id=[pool_id]'})} , {field: 'company_name', title: '公司名称',minWidth:100,} , {field: 'handle_name', title: '负责人',minWidth:80,} , {field: 'create_time',minWidth:170, title: '创建时间',templet:public_templet.datetime} ]];
            }else if(type === 2){
                var cols = [[ {field: 'name', title: '姓名',minWidth:80,templet:public_templet.name.bind({link:'customer/desc.html?cid=[customer_id]&pool_id=[pool_id]'})} , {field: 'company_name', title: '公司名称',minWidth:100,} , {field: 'handle_name', title: '负责人',minWidth:80,} , {field: 'create_time',minWidth:170, title: '创建时间',templet:public_templet.datetime} ]];
            }else if(type === 3){
                var cols = [[ {field: 'name', title: '姓名',templet:public_templet.name.bind({link:'linkman/linkmanDes.html?link_id=[id]'})} , {field: 'customer_name', title: '对应客户'}]];
            }
            public_table(table, '/clue/public/is_repeat',{type:type,text:search_val}, cols ,{
                no_scrollbar:true
                ,page:false
                ,done:function(){layero.mouseup();}
            });
            return false;
        });

        if(classify) form.find('#check_type option[value='+classify+']').prop('selected',true);
        if(search_val){form.find('#check_input').val(search_val);form.submit()}
        var layero = public_form('信息查重',[{type:'html',html:html_box}],null,{area:'700px',btn:false});
        layero.on('click','[data-to_url]',function(){ layer_close(layero); });
    },
    /**layer 新增跟进记录(不传入参数则手动选择跟进对象) */
    write_record:function(loading_dom,type,lead_value,pool_id,status_data,status_value,callback,option){
        var loading = public_load_open(loading_dom);
        option = option || {};
        public_ajax("/clue/Follow_Up/get_follow_sign",null,function(res){
            if(res.data.location==1) public_alert.map_location(show);    //开启定位
            else show("");                                               //关闭定位
        },null,{cache:'session'});

        function show(address_str){
            public_load_close(loading);
            var form_info = [
                {label:'跟进对象',align:'left',verify:'required',type:!type? 'select':'hidden',name:'post[type]',data:{"线索":1,"客户":2,"联系人":3,"商机":4,"合同":5},value:type ,change:get_can_select_pool }
                ,{label:'跟进线索',align:'left',verify:'required',name:'post[lead_id]',type:!lead_value? "select_table_radio":(type===1? "hidden":"delete"),where:function(data){return data['post[type]'] === '1'},data:'线索',value:type===1? lead_value:null,change:get_can_select_pool }
                ,{label:'跟进客户',align:'left',verify:'required',name:'post[customer_id]',type:!lead_value? "select_table_radio":(type===2? "hidden":"delete"),where:function(data){return data['post[type]'] === '2' || data['post[type]'] === '3'},data:'客户',value:type===2? lead_value:null,change:get_can_select_pool }
                //线索、客户 需要池id
                ,{label:'所属池',type:!lead_value? 'select':'hidden',name:'post[pool_id]',value:pool_id,where:function(data){return data['post[lead_id]']||data['post[customer_id]'] ;}}
                ,{label:'跟进联系人',align:'left',verify:'required',name:'post[linkman_id]',type:!lead_value? "select_table_radio":(type===3? "hidden":"delete"),where:function(data){return data['post[type]'] === '3'},data:'联系人',value:type===3? lead_value:null}
                ,{label:'跟进商机',align:'left',verify:'required',name:'post[chance_id]',type:!lead_value? "select_table_radio":(type===4? "hidden":"delete"),where:function(data){return data['post[type]'] === '4'},data:'商机',value:type===4? lead_value:null}
                ,{label:'跟进合同',align:'left',verify:'required',name:'post[contract_id]',type:!lead_value? "select_table_radio":(type===5? "hidden":"delete"),where:function(data){return data['post[type]'] === '5'},data:'合同',value:type===5? lead_value:null}
                
                //跟进联系人同时需要客户ID
                ,{type:(type===3)? 'hidden':'delete',name:'post[customer_id]',value:option.customer_id} 
                ,{label:'跟进方式',align:'left',verify:'required',name:'post[follow_type]',type:"select",default:false,data:{"电话":1,"QQ":2,"微信":3,"当面拜访":4,"短信":5,"其他":6}}
                ,{label:'实际跟进时间',align:'left',verify:'required',name:'post[follow_time]',type:"datetime"}
                ,{name:'post[content]',align:'left',type:"textarea_more",placeholder:"勤跟进，多签单~",files_name:"post[files]",tips_name:"tips"}
                ,{label:'跟进状态',type:status_data? 'select':'delete',align:'left',default:false,data:status_data,value:status_value,name:'follow_status'}
                //客户、商机、合同可以选择关联联系人
                ,{label:'联系人',type:(type===2 || type===4 || type===5)? 'select_table_radio':'delete',align:'left',name:'linkman',data:'客户对应联系人',data_where:{cid:option.customer_id}}
                ,{label:'下次跟进时间',align:'left',name:'post[next_follow_time]',type:"datetime"}
                ,{label:'签到地址',name:'post[signin_addres]',type:"hidden",value:address_str}
            ];
            
            //读取上次填写数据(根据 ID 存储)
            var clear_write_record_session = public_storage('session','clear_write_record_session_' + (lead_value && lead_value[Object.keys(lead_value)[0]]) );
            if(clear_write_record_session) form_info.addAttr(clear_write_record_session);
            
            var is_submit = false;
            var layero = public_form('写跟进',form_info,function(res){
                if(res.data.linkman)
                    res.data['post[content]'] += '\n关联联系人:'+ res.form.find('[name=linkman]').next().attr('title');
                if(res.data.tips)
                    res.data['post[content]'] += '\n提醒谁看:'+ res.form.find('[name=tips]').next().attr('title');;

                if(layero.parent().length){
                    public_ajax('/clue/follow_up/addVisit',res.data,['提交跟进记录',function(){
                        callback && callback(res.data);
                    }],layero);
                    is_submit = true;
                }else{
                    if(is_submit) public_storage('session','clear_write_record_session_' + (lead_value && lead_value[Object.keys(lead_value)[0]]) ,null);//已提交则清空存储数据
                    else{
                        //记录未提交的数据,下次打开还在
                        var save_data = {};
                        $.each(res.data,function(key,val){
                            if(val) save_data[key] = val;
                        });
                        public_storage('session','clear_write_record_session_' + (lead_value && lead_value[Object.keys(lead_value)[0]]) ,save_data);
                    }
                }
            },{
                area:'630px',
                end:function(){btn_submit.click()}        //销毁时触发提交,获取当前表单数据并零食保存
            });
            var btn_submit = layero.find('[lay-submit]'); //提交按钮

            //获取线索、客户可选池
            function get_can_select_pool(){
                var pool_id_dom = layero.find('[name="post[pool_id]"]').closest('.layui-form-item');
                var clue_input = layero.find('.layui-form-item:visible [name="post[lead_id]"]').val();
                var customer_input = layero.find('.layui-form-item:visible [name="post[customer_id]"]').val();
                
                if(clue_input){var type = 'clue';var send_data = {lead_id:clue_input};}
                else if(customer_input){var type = 'customer'; var send_data = {customer_id:customer_input};}
                else{pool_id_dom.hide();layero.find('[name="post[pool_id]"]').html(''); layui.form.render('select');return;}

                public_ajax('/clue/'+type+'/getCanSeePool',send_data,function(res){
                    var pool_list = res.data;
                    var pool_select = pool_list.joinTemplate(function(){ return '<option value="'+this.id+'">'+this.pool_name+'</option>'; });
                    layero.find('[name="post[pool_id]"]').html(pool_select);
                    layui.form.render('select');

                    if(pool_list.length===0) console.error('write_record:首页写跟进,无线索池');
                    else if(pool_list.length===1) pool_id_dom.hide();
                    else  pool_id_dom.show();
                },layero.find('.layui-layer-btn'));
            }
        }
    },
    /**新增任务 */
    write_task:function(value,callback,option){
        option = option || {};
        var form_info = [
            {label:'任务内容',name:'content',type:'input',verify:'required'}
            ,{label:'开始时间',name:'start_time',verify:'required',type:'datetime',lay_text:"显示|隐藏"}
            ,{label:'提醒时间',type:'select',name:'reminder_time',value:1,data:{"准时":1,"提前5分钟":5*60,"提前15分钟":15*60,"提前30分钟":30*60,"提前1小时":60*60,"提前2小时":2*3600,"提前一天":24*3600}}
            
            ,{label:'关联对象',name:'table_name',type:'select',data:{"线索":'lead',"客户":'customer',"商机":'chance',"合同":'contract'}}
            ,{label:'关联线索',name:'customer_id_lead',type:'select_table_radio',where:"[table_name]==='lead'",data:'线索'}
            ,{label:'关联客户',name:'customer_id_customer',type:'select_table_radio',where:"[table_name]==='customer'" ,data:'客户'}
            ,{label:'关联商机',name:'customer_id_chance',type:'select_table_radio',where:"[table_name]==='chance'" ,data:'商机'}
            ,{label:'关联合同',name:'customer_id_contract',type:'select_table_radio',where:"[table_name]==='contract'" ,data:'合同'}

            ,{label:'参与人',name:'participant',type:'select_table_checkbox',value:{text:USER.name,id:USER.id}}
        ];
        
        if(value) form_info.addAttr(value.data);
        
        if(option.is_update){
            var layero = public_form('查看任务',form_info,function(){layer_close(layero);},{btn:['关闭']});
            return;
        }
        var layero = public_form('新增任务',form_info,function(res){
            res.data.customer_id = res.data.customer_id_lead ||res.data.customer_id_customer ||res.data.customer_id_chance ||res.data.customer_id_contract;
            public_ajax('/workermsg/workermsg/add_task',res.data,['新增任务',callback],layero);
        });
    },
    /**扫描名片 */
    scan_card:function(callback){
        var layero = public_form('扫描名片',[
            {type:'prompt',title:'扫描名片',value:'1、请选择扫描清晰度高的名片图片，图片清晰度越高，识别的信息越准确<br/>2、图片支持的格式为jpg、png、bmp'}
            ,{verify:'required',name:'up_file',type:'upload_camera'}
        ],function(res){
            var src = USE_SERVER_URL + JSON.parse(res.data['up_file'])['url'];
            public_ajax("/clue/Public/add_card_info",{img_path:src},function(card_info){
                callback && callback(card_info,src);
            },layero);
        },{
            btn: ['开始扫描', '取消'],area:'640px'
            ,loaded:function(layero){
                //上传图片后自动提交
                layero.find('[name=up_file]').change(function(){ layero.find('[lay-submit]').click(); });
            }
        });
    },
    /**新增至线索池 */
    add_clue_to_pool:function(loading_dom,callback,value){
        this.add_clue(loading_dom,callback,value,'新增至线索池');
    },
    /**新增线索 */
    add_clue:function(loading_dom,callback,value,type){
        //读取上次填写数据,  (有 value 是扫描名片,暂时不处理)
        if(value === undefined){
            var clear_add_clue_session = public_storage('session','clear_add_clue_session');
            if(clear_add_clue_session){ value = {data:clear_add_clue_session}; }
        }
         
        var send_data = {classify:1};
        public_ajax('/Clue/public/show_add',send_data,function(res){
            //表单内容
            var form_info = public_field_conver_form(res.data);

            $.each(form_info,function(key){
                //默认负责人是自己
                if(this.name === 'handle_id') {
                    if(type==='新增至线索池')  form_info.splice(key,1);
                    else this.value = {text:USER.name,id:USER.id}
                }
                //添加时 池可以多选
                if(this.name === 'pool_id'){
                    this.type = 'select_multi';
                    this.value = public_storage('local','history_add_clue_pool');
                }

                //查重按钮
                if(this.name === 'company_name'){
                    var button = $('<button type="button" class="layui-btn" tips-type=1 data-tips="点击查重"><i class="iconfont icon-sousuo1"></i></button>').click(function(){
                        var search_val = $(this).parent().prev().val();
                        public_alert.search_repeat(1,search_val);
                    });
                    this.append = button;
                }
            });
            
            //填充内容(扫描名片时使用)
            if(value) form_info.addAttr(value.data);

            var is_submit = false;
            var layero = public_form(type? type:"新增线索",form_info,function(res){
                public_storage('local','history_add_clue_pool',res.data['pool_id']);
                var send_data = {post:res.data,pool:res.data['pool_id'].split(',')}
                if(type==='新增至线索池') send_data.to_pool = 1;
                
                if(layero.parent().length){
                    public_ajax('/Clue/Clue/add',send_data,[type? type:'新增线索',callback],layero);
                    is_submit = true;
                }else{
                    if(is_submit) public_storage('session','clear_add_clue_session',null);//已提交则清空存储数据
                    else{
                        //记录未提交的数据,下次打开还在
                        var save_data = {};
                        $.each(res.data,function(key,val){
                            if(val) save_data[key] = val;
                        });
                        public_storage('session','clear_add_clue_session',save_data);
                    }
                }
            },{
                end:function(){btn_submit.click()}        //销毁时触发提交,获取当前表单数据并零食保存
            });
            var btn_submit = layero.find('[lay-submit]'); //提交按钮
            
        },$(loading_dom),{cache:'session'});
    },
    /**新增至客户池 */
    add_customer_to_pool:function(loading_dom,callback,value){
        this.add_customer(loading_dom,callback,value,'新增至客户池');
    },
    /**新增客户 */
    add_customer:function(loading_dom,callback,value,type){
        public_ajax('/Clue/public/show_add',{classify:2},function(res){
            //读取上次填写数据,  (有 value 是扫描名片,暂时不处理)
            if(value === undefined){
                var clear_add_customer_session = public_storage('session','clear_add_customer_session');
                if(clear_add_customer_session){ value = {data:clear_add_customer_session}; }
            }

            //表单内容
            var form_info = public_field_conver_form(res.data);
            //填充内容(扫描名片时使用)
            if(value) form_info.addAttr(value.data);

            $.each(form_info,function(key){
                //添加时 池可以多选
                if(this.name === 'pool_id') this.type = 'select_multi';
                //默认负责人是自己
                if(this.name == 'handle_id') {
                    if(type==='新增至客户池')  form_info.splice(key,1);
                    else this.value = {id:USER.id,text:USER.name}
                }
                //查重按钮
                if(this.name === 'company_name'){
                    var button = $('<button type="button" class="layui-btn" tips-type=1 data-tips="点击查重"><i class="iconfont icon-sousuo1"></i></button>').click(function(){
                        var search_val = $(this).parent().prev().val();
                        public_alert.search_repeat(2,search_val);
                    });
                    var btn_search_info = $('<button type="button" class="layui-btn btn_api_info" tips-type=1 data-tips="查看工商信息"><i class="iconfont icon-renzheng"></i></button>');
                    /**工商信息精准查询**/
                    btn_search_info.click(function(){
                        var keyword = layero.find("input[name=company_name]").val();
                        var length = keyword.length;
                        var type = "search";
                        if(length < 4){
                            layer.msg("请输入完整的公司名称");return false;
                        }
                        public_alert.company_info(keyword,type);
                    })
                    this.append = [button,btn_search_info];
                }
            });
            var is_submit = false;
            var layero = public_form(type? type:"新增客户",form_info,function(res){
                var send_data = res.data;
                if(type==='新增至客户池') send_data.to_pool = 1;

                if(layero.parent().length){
                    public_ajax('/clue/Customer/addCustomer',send_data,[type? type:'新增客户',callback],layero);
                    is_submit = true;
                }else{
                    if(is_submit) public_storage('session','clear_add_customer_session',null);//已提交则清空存储数据
                    else{
                        //记录未提交的数据,下次打开还在
                        var save_data = {};
                        $.each(res.data,function(key,val){
                            if(val) save_data[key] = val;
                        });
                        public_storage('session','clear_add_customer_session',save_data);
                    }
                }
            },{
                loaded:function(layero){
                    var box = $('<span></span>').appendTo(layero.find('form.layui-layer-wrap'));
                    public_approval_dom(null,box,2,layero);
                }
                ,end:function(){btn_submit.click()}        //销毁时触发提交,获取当前表单数据并保存
            });
            var btn_submit = layero.find('[lay-submit]'); //提交按钮
        },$(loading_dom),{cache:'session'});
    },
    /**新增联系人 */
    add_linkman:function(loading_dom,callback,value){
        public_ajax('/Clue/public/show_add',{classify:3},function(res){
            //读取上次填写数据,  (有 value 是扫描名片,暂时不处理)
            if(value === undefined){
                var clear_add_linkman_session = public_storage('session','clear_add_linkman_session');
                if(clear_add_linkman_session){ value = {data:clear_add_linkman_session}; }
            }
            //表单内容
            var form_info = public_field_conver_form(res.data);
            //填充内容(扫描名片时使用)(联系人扫描名片目前没有新增联系人, 只有同时新增联系人+客户)
            if(value) form_info.addAttr(value.data);

            $.each(form_info,function(){
                //查重按钮
                if(this.name === 'company_name'){
                    var button = $('<button type="button" class="layui-btn" tips-type=1 data-tips="点击查重"><i class="iconfont icon-sousuo1"></i></button>').click(function(){
                        var search_val = $(this).parent().prev().val();
                        public_alert.search_repeat(3,search_val);
                    });
                    this.append = button;;
                }
            });
            var is_submit = false;
            var layero = public_form("新增联系人",form_info,function(res){
                if(layero.parent().length){
                    public_ajax('/clue/Link_Man/addLinkMan',res.data,['新增联系人',callback],layero);
                    is_submit = true;
                }else{
                    if(is_submit) public_storage('session','clear_add_linkman_session',null);//已提交则清空存储数据
                    else{
                        //记录未提交的数据,下次打开还在
                        var save_data = {};
                        $.each(res.data,function(key,val){
                            if(val) save_data[key] = val;
                        });
                        public_storage('session','clear_add_linkman_session',save_data);
                    }
                }
            },{
                end:function(){btn_submit.click()}        //销毁时触发提交,获取当前表单数据并保存
            });
            var btn_submit = layero.find('[lay-submit]'); //提交按钮
        },$(loading_dom),{cache:'session'});
    },
    /**新增商机 */
    add_chance:function(loading_dom,callback,value){
        public_ajax("/Clue/public/show_add",{classify:4},function (data) {
            //读取上次填写数据,  (有 value 是扫描名片,暂时不处理)
            if(value === undefined){
                var clear_add_chance_session = public_storage('session','clear_add_chance_session');
                if(clear_add_chance_session){ value = {data:clear_add_chance_session}; }
            }
            var form_info =public_field_conver_form(data.data);
            //填充内容(扫描名片时使用)
            if(value) form_info.addAttr(value.data);

            //添加联系人
            var linkman_table_cols = [[
                {title:'操作',templet:function(){return '<i lay-event="add" class="iconfont icon-jiahao" data-tips="添加"></i><i lay-event="del" class="iconfont icon-shanchu"  data-tips="删除"></i>'}}
                ,{title: '联系人',field: 'link_id',edit:true,field_type:109,templet:public_templet.field_chinese}
                ,{title: '角色',field:'link_role_id',edit:true,field_type:10,other_set:JSON.stringify([{name:"决策者",id:1},{name:"审批者",id:2},{name:"采购者",id:3},{name:"评估者",id:4},{name:"用户",id:5},{name:"其他",id:6}]),templet:public_templet.select_radio}
            ]];
            form_info.push({label:"添加联系人",name:'addlink',id:"btn_add_hetong",type:'button',click:function(){ layero.find('[name=linkman_table]').data().push({}); }});
            form_info.push({label:1,name:'linkman_table',type:'table',table:{ totalRow:false,cols:linkman_table_cols, data:[]}
                ,where:function(){return Boolean(layero && layero.find('[name=linkman_table]').prev().find('.layui-table-main tr').length);}
            });

            //添加产品
            form_info.push({label:"存储已选择产品的输入框",name:'goods',type:'hidden'});
            form_info.push({label:"添加产品",name:'addProduct',id:"addProduct",type:'button',click:function(){
                public_alert.select_product(function(res){
                    layero.find('[name=goods]').val(JSON.stringify(res));
                    layero.find('#addProduct').html('添加产品(已添加 '+res.length+' 个产品)');
                    var count=0;
                    $.each(res,function (i,v) { count += parseFloat(v.num*v.money); });
                    layero.find('[name=expect_money]').val(count);
                });
            }});
            //其它处理
            $.each(form_info,function () {
                if(this.name=='handle_id') this.value = {id:USER.id,text:USER.name};

                //修改对应客户时， 同时修改添加联系人中 下拉框的可选联系人
                if(this.name=='customer_id'){
                    this.change=function(value,form){
                        layero.find('[name=linkman_table]').closest('.layui-form-item').data('data_where',{link_id:{where:'customer_id='+value}});
                    };
                }
            });

            var is_submit = false;
            var layero = public_form('新增商机',form_info,function (res) {
                if(layero.parent().length){
                    public_ajax("/clue/Chance/addChance",res.data,['新增商机',callback],layero)
                    is_submit = true;
                }else{
                    if(is_submit) public_storage('session','clear_add_chance_session',null);//已提交则清空存储数据
                    else{
                        //记录未提交的数据,下次打开还在
                        var save_data = {};
                        $.each(res.data,function(key,val){
                            if(val) save_data[key] = val;
                        });
                        public_storage('session','clear_add_chance_session',save_data);
                    }
                }
            },{
                loaded:function(layero){
                    var box = $('<span></span>').appendTo(layero.find('form.layui-layer-wrap'));
                    public_approval_dom(null,box,4,layero);
                }
                ,end:function(){btn_submit.click()}        //销毁时触发提交,获取当前表单数据并保存
            });
            var btn_submit = layero.find('[lay-submit]'); //提交按钮
        },$(loading_dom),{cache:'session'});
    },
    /**新增合同 */
    add_contract:function(loading_dom,callback,value){
        public_ajax("/Clue/public/show_add",{classify:5},function (data) {
            //读取上次填写数据,  (有 value 是扫描名片,暂时不处理)
            if(value === undefined){
                var clear_add_contract_session = public_storage('session','clear_add_contract_session');
                if(clear_add_contract_session){ value = {data:clear_add_contract_session}; }
            }
            var form_info= public_field_conver_form(data.data);
            //填充内容(扫描名片时使用)
            if(value) form_info.addAttr(value.data);
            
            /*所有的回掉*/
            $.each(form_info,function (i,v) {
                /*客户下拉的回掉*/
               if(form_info[i].name==='customer_id'){
                    form_info[i].change = function(value,form){
                        layero.find('[name=ht_table]').closest('.layui-form-item').data('data_where',{id:{where:'customer_id='+value}});
                        $(form).find('[name=opportunity_id]').next("div").find(".tags").remove();
                        $(form).find('[name=opportunity_id]').val("");
                        $(form).find('[name=opportunity_id]').data('select_where',{cid:value});
                    };
               }
               /*添加产品*/
               if(form_info[i].name==='product_id'){
                    //隐藏输入框存储数据
                    form_info[i].type = 'hidden';
                    //按钮产品选择 (追到到当前位置)
                    form_info.splice(i+1, 0,{id:"add_product_id",label:"添加产品",type:'button',click:function (){
                        public_alert.select_product(function(res){
                            layero.find('[name=product_id]').val(JSON.stringify(res));
                            layero.find('#add_product_id').html('添加产品(已添加 '+res.length+' 个产品)');
                        });
                    }});
               }
               /*添加联系人*/
               if(form_info[i].name==='contact_userid'){
                    //关联联系人按鈕
                    form_info[i]={label:"关联联系人",id:"btn_add_hetong",type:'button',click:function(){layero.find('[name=ht_table]').data().push({});}}

                    //关联联系人表格 (追到到按钮后面)
                    var ht_table_cols = [[
                        {title:'操作',templet:function(){return '<i lay-event="add" class="iconfont icon-jiahao" data-tips="添加"></i><i lay-event="del" class="iconfont icon-shanchu"  data-tips="删除"></i>'}}
                        ,{title: '联系人',field: 'id',edit:true,field_type:109,templet:public_templet.field_chinese}
                        ,{title: '角色',field:'name',edit:true,field_type:10,other_set:JSON.stringify([{name:"决策者",id:1},{name:"审批者",id:2},{name:"采购者",id:3},{name:"评估者",id:4},{name:"用户",id:5},{name:"其他",id:6}]),templet:public_templet.select_radio}
                    ]];
                    form_info.splice(i+1, 0, {label:"关联联系人",name:'ht_table',type:'table',table:{ cols:ht_table_cols, data:[] }
                        ,where:function(){return Boolean(layero && layero.find('[name=ht_table]').prev().find('.layui-table-main tr').length);}
                    });
               }
            });
            form_info.push({name: "type", type: "hidden",value:1});
            /*赋值负责人*/
            form_info.addAttr({handle_id:{id:USER.id,text:USER.name}});
            /*显示表单*/
            var is_submit = false;
            var layero= public_form('新增合同',form_info,function(res){
                if(layero.parent().length){
                    public_ajax('/contract/contract/add_contract',res.data,['新增合同',callback],layero);
                    is_submit = true;
                }else{
                    if(is_submit) public_storage('session','clear_add_contract_session',null);//已提交则清空存储数据
                    else{
                        //记录未提交的数据,下次打开还在
                        var save_data = {};
                        $.each(res.data,function(key,val){
                            if(val) save_data[key] = val;
                        });
                        public_storage('session','clear_add_contract_session',save_data);
                    }
                }
            },{
                /*指定按钮*/
                btn:['保存','保存草稿','取消']
                ,btn2:function(index,layero){
                    layero.find("[name=type]").val(2);
                    layero.find('.layui-layer-btn0').click();
                    return false;
                }
                ,loaded:function(layero){
                    var box = $('<span></span>').appendTo(layero.find('form.layui-layer-wrap'));
                    public_approval_dom(null,box,5,layero);
                }
                ,end:function(){btn_submit.click()}        //销毁时触发提交,获取当前表单数据并保存
            });
            var btn_submit = layero.find('[lay-submit]'); //提交按钮
        },$(loading_dom),{cache:'session'})
    },
    /**审批弹窗(zyq) */
    approval_window:function(form,data_id,userid){
        layui.use(['layer','table'],function(){
            var layeros;
              switch(+form)
               {
                   case 5:
                     var form_name="合同";
                     var url="/contract/contract/contract_details";
                     var parameter={id:data_id};
                     break;
                   case 6:
                     var form_name="回款";
                     var url="/contract/contract/get_refund_record_details";
                     var parameter={id:data_id};
                     break;
                   case 8:
                     var form_name="发票";
                     var url="/contract/contract/get_details_one";
                     var parameter={id:data_id};
                     break;
                   case 9:
                     var form_name="费用报销";
                     var url="/contract/contract/get_details_one";
                     var parameter={id:data_id};
                     break;
                   case 2:
                     var form_name="客户";
                     var url="/clue/customer/getOne";
                     var parameter={customer_id:data_id};
                     break;
                   case 4:
                     var form_name="商机";
                     var url="/clue/chance/getOneChance";
                     var parameter={id:data_id};
                     break;
                   case 20:
                     var form_name="短信";
                     var url="/message/message/send_sms_details";
                     var parameter={sms:data_id};
                     break;
                   case 30:
                     var form_name="邮件";
                     var url="/message/message/send_email_details";
                     var parameter={email:data_id};
                     break;
                   default:
                      var form_name="";
                      break;
               }
               if(form_name==""){
                  return false;
               }
               $(".examineC-tag-ul>li").on("click",function(){
                    var index=$(this).index();
                    var indexDiv=$(this).parents(".examineC-tag").find(".examineC-tag-item").eq(index);
                    indexDiv.addClass("active").siblings().removeClass("active");
                    $(this).addClass("active").siblings().removeClass("active");
                })
               $(".examineC-tag-ul>li").eq(0).html(form_name+"信息");
               /*查看是否已经审批*/
               public_ajax("/approval/approval/examination_approval",{data_id:data_id,form:form},function(res){
                      //if(res.data.approval.indexOf(userid)===-1) return false;
                      var layer_option = {};
                      if(res.data.owner_id === userid && res.data.approval.indexOf(userid)!==-1){
                        layer_option.btn = ['确定','撤销','取消'];

                        layer_option.btn2 = function(da){
                            //撤销
                            layer_confirm("确认撤销吗？",revoke_approval);
                            function revoke_approval(){
                                public_ajax("/approval/approval/revoke_approval",{form:form,data_id:data_id},function(cd){
                                     layer.msg("撤销成功");
                                     layer.close(layeros);
                                },$('.layui-layer[times='+layeros+']'))
                            }
                            return false;
                         }
                        layer_option.yes = function(da){
                             var explain=$('[name=explain]').val();
                             var status=$("#approval_statue_opinion").find('[name=view]:checked').val();
                             if(explain==""){
                                 layer.msg("请输入审批意见");
                                 return false;
                             }
                             public_ajax("/approval/approval/deal_approval",{flow_where_id:flow_where_id,explain:explain,status:status},function(data){
                                 layer.msg(data.msg);
                                 layer.close(layeros);
                                 location.reload();
                             },$('.layui-layer[times='+layeros+']'))
                         }
                      }else if(res.data.owner_id === userid){
                        layer_option.btn = ['撤销','取消'];
                        $('#approval_statue_opinion_frame').remove();
                        layer_option.yes = function(da){
                            //撤销
                            layer_confirm("确认撤销吗？",revoke_approval);
                            function revoke_approval(){
                                public_ajax("/approval/approval/revoke_approval",{form:form,data_id:data_id},function(cd){
                                     layer.msg("撤销成功");
                                     layer.close(layeros);
                                },$('.layui-layer[times='+layeros+']'))
                            }
                         }
                      }else if(res.data.approval.indexOf(userid)!==-1){
                        layer_option.btn = ['确定','取消'];
                        layer_option.yes = function(da){
                             var explain=$('[name=explain]').val();
                             var status=$("#approval_statue_opinion").find('[name=view]:checked').val();
                             if(explain==""){
                                 layer.msg("请输入审批意见");
                                 return false;
                             }
                             public_ajax("/approval/approval/deal_approval",{flow_where_id:flow_where_id,explain:explain,status:status},function(data){
                                 layer.msg(data.msg);
                                 layer.close(layeros);
                                 location.reload();
                             },$('.layui-layer[times='+layeros+']'))
                         }
                      }else{
                         layer_option.btn = ['取消'];
                         $('#approval_statue_opinion_frame').remove();
                      }
                      flow_where_id=res.data.id;
                      /*请求url*/
                       if(form==9){
                           /*费用报销特殊处理*/
                            public_ajax('/finance/finance/get_expense_account_details',{id:data_id},function(data){
                                 var data=data.data;
                                 var schedule=data.schedule;
                                 str="<h3>基本信息</h3><ul>"+
                                         "<li><span>报销单号：</span><div>"+data.reimbursement_number+"</div></li>"+
                                         "<li><span>报销人：</span><div>"+data.people+"</div></li>"+
                                         "<li><span>报销部门：</span><div>"+data.deparment+"</div></li>"+
                                         "<li><span>备注：</span><div>"+data.remark+"</div></li>"+
                                         "<li><span>报销金额：</span><div>￥"+data.money+"</div></li>"+
                                         "<li><table id='clueTable_reimbursement'></table></li>"+
                                     "</ul><hr/>";
                                 str+="<h3>系统信息</h3><ul>"+
                                        "<li><span>创建人：</span><div>"+data.add_userid+"</div></li>"+
                                         "<li><span>创建时间：</span><div>"+data.create_time+"</div></li>"+
                                         "<li><span>更新时间：</span><div>"+data.update_time+"</div></li>"+
                                         "<li><span>审批状态：</span><div>"+data.flow_status+"</div></li>"+
                                         "<li><span>审批发起时间：</span><div>"+data.approval_time+"</div></li>"+
                                         "<li><span>审批结束时间：</span><div>"+data.approval_end_time+"</div></li>"+
                                       "</ul>";
                                 $('#field_list').html(str);
                                 /*显示表单*/
                                 layeros= layer_open("审批",$('#examineC'),null,layer_option);
                                  /*费用的表单*/
                                 table_dom = public_table('#clueTable_reimbursement', null, null, [[
                                    {field:'cost_number',title: '费用编号',width:100,fixed:'left'}
                                    ,{field: 'cost_type', title: '费用类型',width:100, align:'center'}
                                    ,{field: 'occurrence_time', title: '发生时间',width:100, align:'center'}
                                    ,{field: 'cost_money', title: '费用金额',width:100, align:'center'}
                                    ,{field: 'cost_description', title: '费用描述',width:100, align:'center'}
                                    ,{field: 'responsible_userid', title: '负责人',width:100,align:'center'}
                                    ,{field: 'customer_id', title: '对应客户',width:100,align:'center'}
                                    ,{field: 'follow_up_id', title: '对应跟进',width:100,align:'center'}
                                ]],{
                                    data:schedule
                                    ,page:false
                                    ,limit:1000
                                });
                                 return false;  
                            })
                       }else if(form==20 || form==30){
                           public_ajax(url,parameter,function(data){
                                var data=data.data;
                                if(data.timing){
                                    var send_time="预计"+data.timing+"发送";
                                }else{
                                    var send_time="审批通过后立即发送";
                                }
                                str="<h3>基本信息</h3><ul>"+
                                         "<li><span>发送时间：</span><div>"+send_time+"</div></li>"+
                                         "<li><span>发信人：</span><div>"+data.userid+"</div></li>"+(form==30?"<li><span>标题：</span><div>"+data.title+"</div></li>":"")+
                                         "<li><span>信息内容：</span><div>"+data.content+"</div></li>"+
                                         "<li><table id='sending_object'></table></li>"+
                                     "</ul><hr/>";
                                $('#field_list').html(str);
                                 /*显示表单*/
                                layeros= layer_open("审批",$('#examineC'),null,layer_option);
                                /*接收者的表单*/
                                if(form==30){
                                    table_dom = public_table('#sending_object', null, null, [[
                                        {field:'name',title: '姓名',fixed:'left'}
                                        ,{field: 'mobile', title: '邮箱号', align:'center'}
                                    ]],{
                                        data:data.arr
                                        ,page:false
                                        ,limit:1000
                                    });
                                }else{
                                    table_dom = public_table('#sending_object', null, null, [[
                                        {field:'name',title: '姓名',fixed:'left'}
                                        ,{field: 'mobile', title: '手机号', align:'center'}
                                    ]],{
                                        data:data.arr
                                        ,page:false
                                        ,limit:1000
                                    });
                                }
                           });
                       }else{
                           public_ajax('/clue/public/show_details',{classify:form},function(res){
                              public_ajax(url,parameter,function(data){
                                 var str="";
                                 $.each(res.data,function(i,v){
                                     str+="<h3>"+v['group_name']+"</h3><ul>";
                                     $.each(v.children,function(j,val){
                                        if(form==2 || form==4){
                                            var value = data['data'][val['e_name']];
                                            if(val.field_type === 9) {
                                                this.templet = public_templet.datetime
                                                 value = this.templet(value);
                                            };            //公共-时间
                                            if(val.field_type === 10) {
                                                this.templet = public_templet.select_radio;      //公共-单选
                                                value?value = this.templet(value,this.e_name):null;//value非空执行
                                            }
                                            if(val.field_type === 11){
                                                this.templet = public_templet.select_checkbox;   //公共-多选
                                                value?value = this.templet(value,this.e_name):null;//value非空执行
                                            } 
                                            if(val.field_type>=100) {
                                                //公共-100以上的是系统保留类型,需要把对应的chinese_字段传过来
                                                this.templet = public_templet.field_chinese;
                                                value = data['data']['chinese_'+val['e_name']];
                                            };
                                            str+="<li><span>"+val['name']+"：</span><div>"+(value ? value : '--')+"</div></li>";
                                        }else{
                                            if(val['e_name']!='contact_userid' && val['e_name']!='product_id'){
                                                if(val['e_name']=='contract_status'){
                                                    str+="<li><span>"+val['name']+"：</span><div>"+(data['data']['contract_status_name'] ? data['data']['contract_status_name'] : '--')+"</div></li>";
                                                }else if(val['e_name']=='file_url'){
                                                    str+="<li><span>"+val['name']+"：</span><div>";
                                                    if(data['data'][val['e_name']]){
                                                        $.each(data['data'][val['e_name']],function(k,va){
                                                           str+="<a href='"+va['url']+"' class='green' target='_blank'>"+va['name']+"</a>";
                                                        })
                                                    }else{
                                                        str+="--";
                                                    }
                                                    str+="</div></li>";
                                                }else if(val['e_name']=='voucher'){
                                                    str+="<li><span>"+val['name']+"：</span><div>";
                                                    if(data['data'][val['e_name']]){
                                                        $.each(data['data'][val['e_name']],function(k,va){
                                                           str+="<a href='"+va['url']+"' class='green' target='_blank'>"+va['name']+"</a>";
                                                        })
                                                    }else{
                                                        str+="--";
                                                    }
                                                    str+="</div></li>";
                                                }else{
                                                    str+="<li><span>"+val['name']+"：</span><div>"+(data['data'][val['e_name']] ? data['data'][val['e_name']] : '--')+"</div></li>";
                                                }
                                            }
                                        }
                                     })
                                     str+="</ul><hr/>";
                                 })
                                 $('#field_list').html(str);
                                 /*显示表单*/
                                 layeros= layer_open("审批",$('#examineC'),null,layer_option);
                              })
                           });
                       }
               })
               /*审批流程*/
               public_ajax("/approval/approval/get_flow_where_list",{form:form,data_id:data_id},function(res){
                    var data=res.data;
                    var cclist=res.data.cclist;
                    var str="<div class='layui-form-item'><label class='layui-form-label'>提交审批 <span></span></label><div class='layui-input-block'><img src='"+data['data'][0][0]['avatar']+"'/><div><h4>"+data['data'][0][0]['user_name']+"<span>"+data['data'][0]['time']+"</span></h4></div></div></div>";
                    $.each(data.data,function(i,v){
                        if(i>0){
                             str+="<div class='layui-form-item'><label class='layui-form-label'>"+i+"级审批 <span></span></label>";
                             $.each(v,function(j,val){
                                str+="<div class='layui-input-block'><img src='"+val['avatar']+"'/><div><h4>"+val['user_name']+"<span>"+val['time']+"</span></h4><p>"+val['explain']+"</p></div></div>";
                             })
                             str+="</div>";
                        }
                    })
                    str+="<div class='layui-form-item'><label class='layui-form-label'>审批完成 <span></span></label><div class='layui-input-block'> </div></div>";
                    $('#approval').html(str);
                    // 抄送人
                    var cc="<div class='Approvers_span'>（";
                    if(cclist){
                        if(cclist['cc_notice']==1){
                            cc+="提交申请时抄送";
                        }else if(cclist['cc_notice']==2){
                            cc+="审批通过后抄送";
                        }else if(cclist['cc_notice']==3){
                            cc+="提交审批时和审批通过后都抄送";
                        }else{
                            cc+="无";
                        }
                    }else{
                        cc+="无";
                    }
                    cc+="）</div><ul class='Approvers clearfix'>";
                    if(cclist){
                        $.each(cclist.list,function(i,v){
                            cc+="<li><img src='"+v['avatar']+"' alt=''/><p>"+v['user_name']+"</p></li>";
                        })
                    }
                     cc+="</ul>";
                     $('#cclist').html(cc);
               });
        })
    },
    /**语音跟进 */
    follow_audio_init:function(item_dom){
        var yuyin=false;
        public_ajax("/clue/Follow_Up/get_follow_sign",null,function(res){
            if(res.data.translate==1){
                 yuyin=true;
            }
        })
        if(SETTING.sync_type==2){
             async_load_js('https://res.wx.qq.com/open/js/jweixin-1.2.0.js',function(){
                 if(IS_WECHAT) {
                    public_ajax("/clue/public/createTicket", {url: window.location.href}, function (data) {
                        var config = data.data;
                         wx.config({
                            beta: true,// 必须这么写，否则wx.invoke调用形式的jsapi会有问题
                            debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
                            appId: config.appId, // 必填，企业微信的corpID
                            timestamp: config.timestamp, // 必填，生成签名的时间戳
                            nonceStr: config.nonceStr, // 必填，生成签名的随机串
                            signature: config.signature,// 必填，签名，见 附录-JS-SDK使用权限签名算法
                            jsApiList: [
                                'selectExternalContact'
                                , 'getCurExternalContact'
                                , 'startRecord'
                                , 'stopRecord'
                                , 'onVoiceRecordEnd'
                                , 'playVoice'
                                , 'pauseVoice'
                                , 'stopVoice'
                                , 'onVoicePlayEnd'
                                , 'uploadVoice'
                                , 'downloadVoice'
                                , 'translateVoice'
                            ] // 必填，需要使用的JS接口列表，凡是要调用的接口都需要传进来
                        });
                         wx.ready(function (res) {
                             
                         })
                         wx.error(function (res) {
                         })
                         var id;//定时器
                         var localId;//语音文件id
                         var past_time = 0;
                         var play=1;
                         var play_old_localId;
                         var layero=layer.open({
                                type:1,
                                offset:"b",
                                title:false,
                                closeBtn:false,
                                shadeClose:true,
                                area:"100%",
                                content:'<div class="lvYing" ><span class="green luyintime" ></span><div class="lvYingDiv" ><i class="iconfont icon-yuyin"></i></div><p >开始录音</p></div>'
                                ,end:function(){
                                    clearTimeout(id);
                                    wx.stopRecord({
                                        success: function (res) {
                                             localId = res.localId;
                                             if(localId){
                                                /*上传文件*/
                                                wx.uploadVoice({
                                                    localId: localId, // 需要上传的音频的本地ID，由stopRecord接口获得
                                                    isShowProgressTips: 1, // 默认为1，显示进度提示
                                                    success: function (res) {
                                                        var serverId = res.serverId; // 返回音频的服务器端ID
                                                        item_dom.find('textarea').after('<div data-file="'+serverId+'" class="lvYIN " data-id="'+localId+'"><span class="play_yuYing" style="display:inline-block;width:2.5rem;"><i class="green iconfont icon-yuyin1 "></i><span>'+past_time+'</span></span><span class="fr iconfont icon-guanbi1 del_YUYING"></span></div>')
                                                        item_dom.append("<input type='hidden' class='"+serverId+"' name='post[serverId][]' value='"+serverId+"'/>");
                                                    }
                                                });
                                                if(yuyin){
                                                    /*语音转文字*/
                                                    wx.translateVoice({
                                                        localId: localId, // 需要识别的音频的本地Id，由录音相关接口获得，音频时长不能超过60秒
                                                        isShowProgressTips: 1, // 默认为1，显示进度提示
                                                        success: function (res) {
                                                            var textarea = item_dom.find("textarea").val()+"["+res.translateResult+"]";
                                                            item_dom.find("textarea").val(textarea);
                                                        }
                                                    });
                                                }
                                             }
                                        }
                                    });
                                }   
                         })
                         /*录制语音*/
                         $('.lvYingDiv>i').on('click',function(){
                             if($(this).hasClass("icon-yuyin")){
                                 /*录制*/
                                 $(this).removeClass("icon-yuyin").addClass("icon-zhengfangxing");
                                 
                                  timeing()
                                 //验证码倒计时
                                    function timeing(){
                                        if(past_time <58){
                                            $(".luyintime").html("录制中 "+past_time+"秒");
                                            past_time++;
                                           id =setTimeout(timeing,1000);
                                        }else{
                                             layer_close(layero);
                                             clearTimeout(id);
                                        }
                                    }
                                  wx.startRecord();
                             }else{
                                layer_close(layero);
                                clearTimeout(id);
                             }
                         })
                         /*播放或者关闭语音*/
                         $('body').off('click','.play_yuYing').on('click','.play_yuYing',function(){
                             var new_localId=$(this).parent().attr("data-id");
                             if(play_old_localId!=new_localId){
                                 play=1;
                             }
                             if(play==1){
                                 /*播放语音*/
                                 wx.playVoice({
                                    localId: new_localId // 需要播放的音频的本地ID，由stopRecord接口获得
                                });
                                 play=2;
                                 play_old_localId=new_localId;
                             }else{
                                 /*停止播放*/
                                wx.stopVoice({
                                    localId: new_localId // 需要停止的音频的本地ID，由stopRecord接口获得
                                });
                                play=1;
                             }
                         })
                         /*点击删除一个语音*/
                         $('body').off("click",'.del_YUYING').on('click','.del_YUYING',function(){
                             var serverId=$(this).parent().attr("data-file");
                             var new_localId=$(this).parent().attr("data-id");
                             wx.translateVoice({
                                    localId: new_localId, // 需要识别的音频的本地Id，由录音相关接口获得，音频时长不能超过60秒
                                    isShowProgressTips: 1, // 默认为1，显示进度提示
                                    success: function (res) {
                                        var textarea = item_dom.find("textarea").val().replace('['+res.translateResult+']','');
                                        item_dom.find("textarea").val(textarea);
                                    }
                             });
                             $('.serverId').remove();
                             $(this).parent().remove();
                         })
                    })
                 }
             })
       }else if(SETTING.sync_type==3){
           async_load_js('https://g.alicdn.com/dingding/dingtalk-jsapi/2.6.41/dingtalk.open.js',function(){
               public_ajax("/clue/public/createTicket",{url:window.location.href},function(data){
                   var config = data.data;
                    dd.config({
                        agentId: config.agentId, // 必填，微应用ID
                        corpId: config.corpId,//必填，企业ID
                        timeStamp: config.timestamp, // 必填，生成签名的时间戳
                        nonceStr: config.nonceStr, // 必填，生成签名的随机串
                        signature: config.signature, // 必填，签名
                        type:0,   //选填。0表示微应用的jsapi,1表示服务窗的jsapi；不填默认为0。该参数从dingtalk.js的0.8.3版本开始支持
                        jsApiList : [
                            'device.audio.startRecord',
                            'device.audio.stopRecord',
                            'device.audio.onRecordEnd',
                            'device.audio.download',
                            'device.audio.play',
                            'device.audio.pause',
                            'device.audio.resume',
                            'device.audio.stop',
                            'device.audio.onPlayEnd',
                            'device.audio.translateVoice',
                            'device.geolocation.get'
                        ] // 必填，需要使用的jsapi列表，注意：不要带dd。
                    });
                    dd.error(function(error){
                          if(JSON.stringify(error)){
                              alert('dd error: ' + JSON.stringify(error));
                          }
                    });
                    dd.ready(function() {
                         var dd_time_id;//定时器
                         var mediaId;//语音文件id
                         var mediaId_time;//录音时长
                         var dd_past_time = 0;
                         var dd_play=1;
                         var dd_play_old_localId;
                         var layero=layer.open({
                                type:1,
                                offset:"b",
                                title:false,
                                closeBtn:false,
                                shadeClose:true,
                                area:"100%",
                                content:'<div class="lvYing" ><span class="green luyintime" ></span><div class="lvYingDiv" ><i class="iconfont icon-yuyin"></i></div><p >开始录音</p></div>'
                                ,end:function(){
                                    clearTimeout(dd_time_id);
                                    /*停止录音*/
                                    dd.device.audio.stopRecord({
                                        onSuccess : function(res){
                                            mediaId=res.mediaId; // 返回音频的MediaID，可用于本地播放和音频下载
                                            mediaId_time=res.duration; // 返回音频的时长，单位：秒
                                            /*添加录音*/
                                            item_dom.find('textarea').after('<div data-file="'+mediaId+'" class="lvYIN " data-id="'+mediaId+'"><span class="play_yuYing" style="display:inline-block;width:2.5rem;"><i class="green iconfont icon-yuyin1 "></i><span>'+mediaId_time+'</span></span><span class="fr iconfont icon-guanbi1 del_YUYING"></span></div>')
                                            item_dom.append("<input type='hidden' class='"+mediaId+"' name='post[serverId][]' value='"+mediaId+"'/>");
                                            if(yuyin){
                                                /*语音转文字*/
                                                dd.device.audio.translateVoice({
                                                    mediaId : mediaId,
                                                    duration : 5.0,
                                                    onSuccess : function (res) {
                                                        var textarea = item_dom.find("textarea").val()+"["+res.content+"]";
                                                        item_dom.find("textarea").val(textarea);
                                                    }
                                                });
                                            }
                                        },
                                        onFail : function (err) {
                                        }
                                    });
                                }   
                         })
                          /*录制语音*/
                          $('.lvYingDiv>i').on('click',function(){
                              if($(this).hasClass("icon-yuyin")){
                                 /*录制*/
                                 $(this).removeClass("icon-yuyin").addClass("icon-zhengfangxing");
                                 
                                  timeing()
                                 //验证码倒计时
                                    function timeing(){
                                        if(dd_past_time <58){
                                            $(".luyintime").html("录制中 "+dd_past_time+"秒");
                                            dd_past_time++;
                                            dd_time_id =setTimeout(timeing,1000);
                                        }else{
                                             layer_close(layero);
                                             clearTimeout(dd_time_id);
                                        }
                                    }
                                   dd.device.audio.startRecord({
                                        onSuccess : function () {//支持最长为60秒（包括）的音频录制
                                        },
                                        onFail : function (err) {
                                            alert(err);
                                        }
                                    });
                             }else{
                                layer_close(layero);
                                clearTimeout(dd_time_id);
                             }
                         })
                           /*播放或者关闭语音*/
                         $('body').off('click','.play_yuYing').on('click','.play_yuYing',function(){
                             var new_localId=$(this).parent().attr("data-id");
                             if(dd_play_old_localId!=new_localId){
                                 play=1;
                             }
                             if(play==1){
                                 /*播放语音*/
                                 dd.device.audio.play({
                                        localAudioId : new_localId,
                                        onSuccess : function () {
                                        },
                                        onFail : function (err) {
                                        }
                                 });
                                 play=2;
                                 dd_play_old_localId=new_localId;
                             }else{
                                 /*停止播放*/
                                dd.device.audio.pause({
                                    localAudioId : new_localId,
                                    onSuccess : function() {
                                    },
                                    onFail : function(err) {
                                    }
                                });
                                play=1;
                             }
                         })
                         /*点击删除一个语音*/
                         $('body').off("click",'.del_YUYING').on('click','.del_YUYING',function(){
                             var serverId=$(this).parent().attr("data-file");
                             var new_localId=$(this).parent().attr("data-id");
                             wx.translateVoice({
                                    localId: new_localId, // 需要识别的音频的本地Id，由录音相关接口获得，音频时长不能超过60秒
                                    isShowProgressTips: 1, // 默认为1，显示进度提示
                                    success: function (res) {
                                        var textarea = item_dom.find("textarea").val().replace('['+res.translateResult+']','');
                                        item_dom.find("textarea").val(textarea);
                                    }
                             });
                             $('.serverId').remove();
                             $(this).parent().remove();
                         })
                   })
               })
           })
       }
    },
    /**地图定位**/
    map_location:function(callback){
        //缓存地址信息
        if(!IS_MOBILE && public_storage('session','map_location_address')){
            callback && callback(public_storage('session','map_location_address'));
            return;
        }
        var BMapAk='1WZCZXzaT6mHfTNOk8Tg0PkRkoTjdTdc';
        !function(mapInit) {
              var script = document.createElement("script");
              script.type = "text/javascript";
              script.src = "https://api.map.baidu.com/api?v=2.0&ak="+ BMapAk +"&callback=mapinit";
              window['mapinit'] = function() {
                mapInit();
              };
              document.head.appendChild(script);
         }(function() {
                var map = new window.BMap.Map("addres_map");
                var point = new  window.BMap.Point();
                map.centerAndZoom("中国",12);
                var geoc = new BMap.Geocoder();
                var geolocation = new BMap.Geolocation();
                geolocation.getCurrentPosition(function(r){
                    if(this.getStatus() == BMAP_STATUS_SUCCESS){
                        var mk = new BMap.Marker(r.point);
                        var pt= r.point;
                        map.addOverlay(mk);
                        map.panTo(r.point);
                        geoc.getLocation(pt, function(rs){
                            if(!IS_MOBILE) public_storage('session','map_location_address',rs.address);
                            callback && callback(rs.address);
                        })
                    }else {
                        function myFun(result){
                            var cityName = result.name;
                            map.setCenter(cityName);
                        }
                        var myCity = new BMap.LocalCity();
                        myCity.get(myFun);
                    }
                });
         });
    },
    company_info:function(keyword,type){
        console.log($('.toCustomerAuthentication').length,333333333)
        if($('.toCustomerAuthentication').length === 0)
            $('body').append(['<div class="toCustomerAuthentication clueHide">',
            '    <div class="AuthenticationTi" style="font-size:12px;">更新时间：<span class="update_time"></span>&nbsp;&nbsp;&nbsp;&nbsp;<a href="javascript:void(0);" class="update_now" style="color:#009688">立即更新</a></div>',
            '    <div class="bg_white AuthenticationCode">统一社会信用代码：  <span class="CreditCode"></span></div>',
            '    <div class="bg_white AuthenticationContent">',
            '        <div>',
            '            <span>企业名称： </span>',
            '            <div class="Name"></div>',
            '        </div>',
            '        <div>',
            '            <span>企业法人：  </span>',
            '            <div class="OperName"></div>',
            '        </div>',
            '        <div>',
            '            <span>企业类型：</span>',
            '            <div class="EconKind"></div>',
            '        </div>',
            '        <div>',
            '            <span>注册资本：</span>',
            '            <div class="RegistCapi"></div>',
            '        </div>',
            '        <div>',
            '            <span>经营状态：</span>',
            '            <div class="Status"></div>',
            '        </div>',
            '    </div>',
            '    <div class="bg_white AuthenticationContent">',
            '        <div>',
            '            <span>成立时间：      </span>',
            '            <div class="StartDate"></div>',
            '        </div>',
            '        <div>',
            '            <span>经营期限：  </span>',
            '            <div><span class="TermStart"></span> 至 <span class="TeamEnd"></span></div>',
            '        </div>',
            '        <div>',
            '            <span>发照日期：</span>',
            '            <div class="CheckDate"></div>',
            '        </div>',
            '        <div>',
            '            <span>登记机关：</span>',
            '            <div class="BelongOrg"></div>',
            '        </div>',
            '    </div>',
            '    <div class="bg_white AuthenticationContent">',
            '        <div>',
            '            <span>所属行业：     </span>',
            '            <div class="EconKind"></div>',
            '        </div>',
            '        <div>',
            '            <span>企业地址：</span>',
            '            <div class="Address"></div>',
            '        </div>',
            '        <div>',
            '            <span>经营范围：</span>',
            '            <div class="Scope"></div>',
            '        </div>',
            '    </div>',
            '</div>'].join(""));

        public_ajax("/Clue/customer/customer_serach_accurate",{keyword:keyword,type:"search"},function(res) {
            if(res.code == 1){
                layer.open({
                    type: 1,
                    area: ['600px','580px'],
                    title:keyword,
                    content: $(".toCustomerAuthentication")
                });
                var info = JSON.parse(res.company_info.information);
                var update_time = res.company_info.update_time;
                update_toCustomerAuthentication(info,update_time);
                $("body").on("click",".update_now",function(){
                   var index = layer.load(0, {shade: false}); //0代表加载的风格，支持0-2
                   public_ajax("/Clue/customer/customer_serach_accurate",{keyword:info.Name,type:"update"},function(data) {
                        if(data.code == 1){
                            var info_1 = JSON.parse(data.company_info.information);
                            var update_time_1 = data.company_info.update_time;
                            update_toCustomerAuthentication(info_1,update_time_1);
                            layer.close(index);
                        }else{
                            layer.msg(data.msg);
                        }
                   })
                })
            }else{
                layer.msg(res.msg);
            }
        })
    },
    bind_email_phone:function(){
        var btn = $('<button class="layui-btn" type="button" id="forget_get_phone_code">获取验证码</button>').click(function(){
            var phone = $(this).closest('form').find('[name=username]').val();
            if(! /^1\d{10}$/.test(phone)){layer.msg("请输入正确的手机号",{zIndex:PUBLIC_LOAD_ZINDEX+2});return;}
            public_ajax("/admin/Public/forgetSendcode",{username:phone,not_check:true},function(data){
                if(data.code){
                    localStorage.forget_get_phone_code = new Date().getTime();timeing(); //倒计时
                    layer.msg(data.msg,{icon:1,zIndex:PUBLIC_LOAD_ZINDEX+2});
                }else{ layer.msg(data.msg,{icon:2,zIndex:PUBLIC_LOAD_ZINDEX+2}); }
            },$(this));
        
            //验证码倒计时
            function timeing(){
                var past_time = parseInt((new Date().getTime() - localStorage.forget_get_phone_code)/1000);
                if(past_time < 60){
                    $("#forget_get_phone_code").text((60 - past_time) +" 秒").prop("disabled",true);
                    setTimeout(timeing,1000);
                }else{
                    $("#forget_get_phone_code").text("获取验证码").prop("disabled",false);
                }
            }
        });
        
        var form_item = [
            {type:'prompt','title':'欢迎您进入CRM系统','content':'为保障用户信息安全，方便今后找回登录密码，请填写以下信息：'}
            ,{label:'邮箱账号',verify:'required|email',maxlength:40,name:'email',type:'input'}
            ,{label:'手机号码',verify:'required|phone',maxlength:11,name:'username',type:'tel'}
            ,{label:'手机验证码',verify:'required',maxlength:6,name:'code',type:'input',append:btn}
        ];
        var layero = public_form('提示',form_item,function(res){
            public_ajax('/admin/public/bindPhoneEmail',res.data,'绑定手机号邮箱',layero);
        },{
            zIndex:PUBLIC_LOAD_ZINDEX+1
        });
    },
    /**人员选择 */
    select_user:function(selected_id,selected_text,callback){
        if(typeof selected_id === 'string') selected_id = selected_id.split(',');
        if(typeof selected_text === 'string') selected_text = selected_text.split(',');

        (function open_select_users(){
            window.selected_list_temp = selected_id?selected_id:[];            //弹出框使用
            if(!window.load_addmetting) {window.load_addmetting=true;init_dep();}
            if(selected_id){
                $('#selected_ul').html( $.map(selected_id,function(value,key){
                    if(selected_id.length == 1 && selected_id[0] == ""){
                        null;
                    }else{
                        return  ('<li value="'+ value +'" class="active"><i class="layui-icon layui-icon-close"></i>' + selected_text[key] +'</li>');
                    }
                }) );
            }
            $('#users_ul_title').html('待选部门员工');
            $('#alert_select_users #users_ul').html('<li style="padding-left: 15px;">请点击左侧部门查看成员或直接搜索</li>');
            $('#alert_select_users .tag_item.selected').removeClass('selected');
            $('#alert_select_users .department_item.selected').removeClass('selected');
            $('#alert_select_users input#keyword').val('');

            layer_open("人员选择",$("#alert_select_users"),function(index){
                layer.close(index);
                var _return = [] ;
                $('#selected_ul>li').each(function(){
                    _return.push({id:$(this).attr('value'),text:$(this).text()});
                    // _return.id.push($(this).attr('value')); _return.text.push($(this).text());
                });
                callback && callback(_return);
            },{ area: '1050px' });
        })();
        //初始化部门
        function init_dep(){
            !$('#alert_select_users').length && $('body').append(
                '<div class="addApproverC" id="alert_select_users" style="display:none;">\
                    <div>\
                        <p>\
                            组织架构 \
                            <label style="cursor:pointer;"><i class="layui-icon layui-icon-ok selected" id="switch_get_child"></i>获取子部门成员</label>\
                        </p>\
                        <div>\
                            <div class="addApproverC_screen">\
                                <input type="text" placeholder="搜索所有人员" id="keyword" class="layui-input"/>\
                                <i class="iconfont icon-sousuo" id="btn_search"></i>\
                            </div>\
                            <div class="addApproverC_screenListDiv">\
                                <form class="layui-form authority_other" style="padding-left: 16px; margin-top: -10px;">\
                                    <span style="padding-left: 15px;">正在加载组织机构...</span>\
                                </form>\
                            </div>\
                        </div>\
                    </div>\
                    <div> <p id="users_ul_title"></p> <div> <ul class="addApproverC_choseList" id="users_ul"></ul> </div> </div>\
                    <div> <p>已选成员 <button id="clear_selected">清空选中</button></p> <div> <ul class="addApproverC_choseList" id="selected_ul"></ul> </div> </div>\
                </div>\
                <style>\
                    #switch_get_child{margin-right: 7px; margin-top: 1px; margin-left: 12px; color: #fff; width: 16px; height: 16px; line-height: 16px; border: 1px solid #5FB878; font-size: 12px; text-align: center; border-radius: 2px;}\
                    #switch_get_child.selected{background-color: #5FB878}\
                    #clear_selected{float: right; padding: 0 10px; background: white; border: 0; color: gray; cursor: pointer;}\
                    .addApproverC{padding:10px 25px;text-align: center;}\
                    .addApproverC i{cursor: pointer;}\
                    .addApproverC> :last-child{margin-right: 0;}\
                    .addApproverC>div{display: inline-block;width:300px;margin-right: 18px;text-align: left; color: #666666;}\
                    .addApproverC>div>div{border:1px solid #eaeaea;border-radius: 2px;height:430px;overflow-y: auto;}\
                    .addApproverC>div>p{margin-bottom: 10px;color:#333;}\
                    .addApproverC .switch_select_all{border-bottom: 1px dashed #efefef; padding-bottom: 3px;margin-bottom: 8px;}\
                    .addApproverC_screen{position: relative;padding:20px 32px;}\
                    .addApproverC_screenList>ul{height:0;overflow: hidden;transition: all .2s;}\
                    .addApproverC_screenList li{padding:0 56px 0 60px;height:32px;line-height: 32px;cursor: pointer}\
                    .addApproverC_screenList li:first-child,.addApproverC_choseList>li:first-child{margin-top: 6px;}\
                    .addApproverC_screenList li:last-child,.addApproverC_choseList>li:last-child{margin-bottom: 6px;}\
                    .addApproverC_screenList li>i{float: right;opacity: 0;}\
                    .addApproverC_screenList li.active{color:#009688;}\
                    .addApproverC_screenList li.active>i{opacity:1;}\
                    .addApproverC_screenList.itShow>ul{height:auto;}\
                    .addApproverC_screenList.itShow>div>i{transform: rotate(0deg);}\
                    .addApproverC_choseList>li{overflow: hidden;padding:0 15px;height:32px;line-height: 32px;cursor: pointer;color:#666666;}\
                    .addApproverC_choseList>li:hover{background:#f5f5ff;}\
                    .addApproverC_choseList>li>i{ float: left; margin-right: 7px; margin-left: -3px; color: #fff; width: 16px; height: 16px; line-height: 16px; border: 1px solid #5FB878; font-size: 12px; text-align: center; border-radius: 2px; margin-top: 7px;}\
                    .addApproverC_choseList>li.selected>i{ background-color: #5FB878;}\
                    .addApproverC_choseList>li.cancel>i::before{content: ""; background: #5FB878; height: 3px; display: block; margin: auto; margin-top: 7px; width: 61%; border-radius: 5px;}\
                    .addApproverC_choseList>li>.layui-icon-close{color: #ff5757; float: right; border: 0; font-size: 18px; font-weight: bold; margin-top: 9px;}\
                    .addApproverC>div>div::-webkit-scrollbar,.popup .layui-table-body::-webkit-scrollbar{width: 7px;height: 7px;background-color: #ebebeb;}\
                    .addApproverC .layui-timeline { padding-left: 0; margin-bottom: -13px; margin-top: 14px; }\
                    .addApproverC .layui-timeline-item{padding-bottom:16px;}\
                    .addApproverC .layui-timeline-content{padding-left: 17px;}\
                    .addApproverC>div>div::-webkit-scrollbar-thumb,.popup .layui-table-body::-webkit-scrollbar-thumb {border-radius: 4px;-webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0);background-color: #b4b4b4;  }\
                    .addApproverC_screen>input[type=text]{padding-left:10px;}\
                    .department_item{cursor: pointer;transition: .3s;line-height: 20px;}\
                    .department_item.selected{background: #009688; color: white; padding-left: 2px; border-radius: 2px;}\
                    .addApproverC_screen>i{position: absolute; top: 21px; right: 13px; font-size: 15px; left: unset; color: #fff; background: #009688; padding:8px 16px 7px; cursor: pointer;}\
                    .addApproverC_screen{padding: 20px 12px;}\
                    #selected_ul>li{cursor: unset;}\
                </style>'
            );
            $.post('/api/common/get_dep',null,function(res){
                //部门列表初始化
                var origin_department = res.department;
                if(origin_department.length>0)
                    $('.authority_other').html(department_data_conver_dom(origin_department.converTree(origin_department[0]['parent_id'])));

                /* //tag
                 if(res.tag){
                     var tag_list = [{id:1,parent_id:0,depart_name:'标签分组'}];
                     $.each(res.tag,function(){ tag_list.push({ id:this.id,parent_id:1,depart_name:this.tag_name }); });
                     $('.authority_other').append(department_data_conver_dom(tag_list.converTree(origin_department[0]['parent_id']),'tag_item'));
                 }*/

               /* $('#users_ul').append( $.map(res.users,function(d){
                    return '<li value="'+ d.user_id +'">'+ d.name +'</li>';
                }));*/
            });
            //获取子部门成员 开关
            $('#switch_get_child').parent().click(function(){
                $(this).children('i').toggleClass('selected');
                $('#alert_select_users .department_item.selected').click();
            });
            //清空
            $('#clear_selected').click(function(){
                layer.confirm('确认清空已选中成员?',function(index){
                    $('#selected_ul,#users_ul').html('');
                    $('#users_ul_title').html('待选部门员工');
                    $('.department_item.selected').removeClass('selected');
                    selected_list_temp = [];
                    layer.close(index);
                });
            });
            //组织架构折叠、展开
            $('#alert_select_users').on('click','.toggle_child',function(){
                $(this).toggleClass('icon-zhankai').toggleClass('icon-zhankai1');
                if($(this).data('tips')=='展开') $(this).data('tips','收起');else  $(this).data('tips','展开')
                $(this).next().children('.layui-timeline').slideToggle(100);
            });
            $('#alert_select_users').on('click','.icon-wenjian',function(){ $(this).next().children(':eq(0)').click(); });

            //点击 全选按钮
            $('#alert_select_users').on('click','.switch_select_all',function(){
                $(this).data('waiting',true);  //防止重复重复触发
                if($(this).hasClass('cancel') || $(this).hasClass('selected'))
                    $(this).data('selected_count',0).nextAll('.selected').click();
                else  $(this).data('selected_count',$(this).data('all_count')).nextAll().click();
                reload_switch_select_all();
                $(this).data('waiting',false);
            });
            //切换部门
            $('#alert_select_users').on('click','.department_item',function(){
                var url = '/api/common/get_dep_user';
              /*  //切换标签
                if($(this).hasClass('tag_item')){
                    if(!$(this).data('parent_id')) return $(this).parent().prev().click();
                    url = '/api/public/get_tag_user';
                }*/

                $('.department_item.selected').removeClass('selected');
                $(this).addClass('selected');

                $('#users_ul_title').text($(this).text() );
                $("#users_ul").html('<li>加载中...</li>');

                var switch_dep_id = $(this).data('id');

                //选择的部门 , 获取所有子部门
                if(!$(this).hasClass('tag_item') && $('#switch_get_child.selected').length){
                    switch_dep_id = $(this).next('ol').find('.department_item').add(this).joinTemplate(function(){
                        return ','+$(this).data('id');
                    }).substr(1);
                }

                $('#users_ul').data('dep_id',switch_dep_id);
                $.post(url,{dep_id:switch_dep_id},function(res){
                    if($('#users_ul').data('dep_id') !== switch_dep_id) return; //防止以前切换的才加载出来

                    var icon = '<i class="layui-icon layui-icon-ok"></i>';
                    var selected_count = 0;
                    //转换标签数据
                   /* if(res.tag_userid){
                        var tag_id = res.tag_userid.split(',');
                        var tag_name = res.tag_user_name.split(',');
                        res = [];
                        $.each(tag_id,function(key){
                            res.push({ user_id:tag_id[key],name:tag_name[key] });
                        });
                    }*/
                    console.log(res);
                    var dom_list = $.map(res,function(d){
                        var is_selected = selected_list_temp.indexOf(d.user_id+"")!==-1 ;
                        if(is_selected) selected_count ++;
                        return '<li value="'+ d.user_id +'" class="'+ (is_selected? 'selected':'')+'">'+ icon + d.name +'</li>';
                    });
                    if(!dom_list.length) dom_list = '<li>没有搜索到员工</li>';
                    else{
                        dom_list.unshift('<li class="switch_select_all"> <i class="layui-icon layui-icon-ok"></i><p>全选</p></li>');
                    }
                    $('#users_ul').html(dom_list);
                    $('#alert_select_users .switch_select_all').data('all_count',dom_list.length-1).data('selected_count',selected_count);
                    reload_switch_select_all();
                });
            });
            //搜索
            $('#keyword').keyup(function(e){ if(e.keyCode === 13) $('#btn_search').click(); });
            $('#btn_search').click(function(){
                var _keyword = $('#keyword').val().trim();
                if(_keyword === '') return layer.msg('请输入搜索关键字');

                $('#users_ul_title').text( _keyword+" 搜索结果" );
                $.post('/api/common/get_dep_user',{ keyword:_keyword },function(res){
                    $("#users_ul").html('<li>加载中...</li>');
                    var icon = '<i class="layui-icon layui-icon-ok"></i>';
                    var selected_count = 0;
                    var dom_list = $.map(res,function(d){
                        var text = d.name+'（'+ d.dep_names +'）';
                        var is_selected = selected_list_temp.indexOf(d.user_id+"")!==-1 ;
                        if(is_selected) selected_count ++;
                        return '<li title='+ text + ' value="'+ d.user_id +'" class="'+(is_selected? 'selected':'')+'">'+ icon + text + '</li>';
                    });

                    if(!dom_list.length) dom_list = '<li>没有相关数据</li>';
                    else dom_list.unshift('<li class="switch_select_all"> <i class="layui-icon layui-icon-ok"></i><p>全选</p></li>');
                    $('#users_ul').html(dom_list);

                    $('#alert_select_users .switch_select_all').data('all_count',res.length).data('selected_count',selected_count);
                    reload_switch_select_all();

                });
            });
            //选中员工
            $('#users_ul').on('click','li',function(){
                var _id = $(this).attr('value');
                if(_id === undefined) return;

                if(!$(this).hasClass('selected')){
                    selected_list_temp.push(_id);
                    $('#selected_ul').append('<li value="'+ $(this).attr('value') +'" class="active"><i class="layui-icon layui-icon-close"></i>' + $(this).text() +'</li>');
                }else{
                    selected_list_temp.splice(selected_list_temp.indexOf(_id),1);
                    $('#selected_ul>li[value="'+_id+'"]').remove();
                }

                if(!$('#alert_select_users .switch_select_all').data('waiting')){
                    var this_select_count = $('#alert_select_users .switch_select_all').data('selected_count');
                    if(!$(this).hasClass('selected')) this_select_count ++ ; else this_select_count -- ;
                    $('#alert_select_users .switch_select_all').data('selected_count',this_select_count);
                    reload_switch_select_all();
                }

                $(this).toggleClass('selected');

            });
            //取消选择员工
            $('#selected_ul').on('click','.layui-icon-close',function(){
                var _id = $(this).parent().remove().attr('value');
                $('li.selected[value="'+ _id +'"]').click();
            });

            //重载全选按钮的状态
            function reload_switch_select_all(){
                var dom = $('#alert_select_users .switch_select_all');
                var all_count = dom.data('all_count');
                var selected_count = dom.data('selected_count');
                if(all_count === selected_count) dom.addClass('selected').removeClass('cancel').find('p').text('取消');
                else if(selected_count && ( all_count !== selected_count )) dom.addClass('cancel').removeClass('selected').find('p').text('取消');
                else dom.removeClass('selected cancel').find('p').text('全选');

                var text = $('#users_ul_title').text();
                if(text.indexOf('(')>-1) text = text.substr(0,text.indexOf('('));
                $('#users_ul_title').text( text + "( "+(all_count||0)+"人 ) "+(selected_count? "( 选中"+selected_count+"人 )":"") );
            }
            function department_data_conver_dom(department_data,add_class,leave){
                leave = leave || 0;
                var is_zhankai = leave++>0;
                var zhankai_icon = leave==0? 'icon-zhankai1':'icon-zhankai';
                if(department_data && department_data.length){
                    var son_list_dom = $('<ol class="layui-timeline" '+(is_zhankai? 'style="display:none;"':'')+'></ol>');
                    //1.遍历一级子类
                    $(department_data).each(function(){
                        var edit_icon = '';
                        //2.每个一级子类dom
                        var son_alone_dom = $('<li class="layui-timeline-item"><i class="toggle_child iconfont '+zhankai_icon+' layui-timeline-axis"></i><div class="layui-timeline-content"></div></li>');
                        son_alone_dom.find('.layui-timeline-content').append('<div data-id="'+this['id']+'" data-parent_id="'+this['parent_id']+'" class="department_item '+ (add_class||'') +'">'+this['dep_name']+'<div class="structure_operation"> '+edit_icon+' </div></div>');
                        //3.每个一级子类的所有后代dom
                        var son_all_child = department_data_conver_dom(this['children'],add_class,leave);
                        if(son_all_child) son_alone_dom.find('.layui-timeline-content').append(son_all_child).prev().attr('data-tips','展开');
                        else son_alone_dom.find('.toggle_child').removeClass('toggle_child').removeClass(zhankai_icon).addClass('icon-wenjian');
                        son_list_dom.append(son_alone_dom);
                    });
                    return son_list_dom;
                }
            }
        }
    }

}