 //点击框样式

$('head').append('<style>.tableSelect img{width:100%} .tags_box{overflow: hidden; height: 38px;} .tags{cursor:auto;padding: 2px 5px; background: #2e9c92; color: white; border-radius: 2px; margin: 5px 5px 2px 0; float: left; line-height: 21px; margin-bottom: 4px; font-size: 11px;}.tags.disabled{background: #c3c3c3;} .tags>i{transition: .2s;} .tags>i::after{display: inline; content: "\\e60b"; font-family: "iconfont" !important; margin-left:4px;font-style: normal;} .tags>i:hover{color:#7c7c7c;cursor: pointer;}</style>');
$('head').append('<style>\
        .tableSelect .layui-none{background: white; height: 100%;}\
        .tableSelect tr.selected{background: #00a999 !important; color: white;}\
        .tableSelect .layui-table-view{border: 1px solid #d2d2d2; box-shadow: 0 2px 4px rgba(0, 0, 0, .12);}\
        .click_input{cursor: pointer;line-height: 38px;position:relative;padding-right: 10px;text-align:left;}\
        .click_input:hover{border-color: #009688!important;}\
        .click_input>.placeholder{color: #6f6f6f;display:none;border:0;position: absolute; line-height: 38px;}\
        .click_input>.search_input{border:0;width:50px;background: transparent;}\
        .click_input.click_input_no_value>.placeholder{display:initial}\
        .click_input::after{content: ""; border-style: dashed; border-color: transparent; overflow: hidden; position: absolute; right: 10px; top: 50%; margin-top: -3px; cursor: pointer; border-width: 6px; border-top-color: #C2C2C2; border-top-style: solid; transition: all .3s;}\
        .tableSelect .layui-form{height:auto !important;}.tableSelect .layui-table-view{margin:0;} .tableSelect .layui-table-header{display:none;} .tableSelect .layui-table-view .layui-table td{padding:7px 0;}\
    </style>');
layui.define(['table', 'jquery', 'form'], function (exports) {
    "use strict";

    var MOD_NAME = 'tableSelect',
        $ = layui.jquery,
        table = layui.table,
        form = layui.form;
    var tableSelect = function () {
        this.v = '1.1.0';
    };

    /**
    * 初始化表格选择器
    */
    tableSelect.prototype.render = function (opt) {
        var elem = $(opt.elem);
        elem.addClass('click_input_no_value');
        var elem_input = elem.prev('input');

        //支持 elem赋值，然后初始化到elem_input
        reload_elem_input();

        var tableDone = opt.table.done || function(){};
		
        //默认设置
        opt.searchKey = opt.searchKey || 'keyword';
        opt.placeholder = opt.placeholder || '请选择';
        opt.checkedKey = opt.checkedKey || 'userid';            //表格的唯一建值 影响到选中状态 必填
        opt.checkedName = opt.checkedName || 'user_name';       //表格的显示文字 影响到选中状态 必填
        opt.table.page = opt.table.page;
        opt.table.height = opt.table.height || 340;
        
        elem.append('<span class="placeholder">'+opt.placeholder+'</span>');
        elem.append('<input class="search_input" autocomplete="off" />');

        //添加tag
        function append_to_dom(array){
            elem.removeClass('click_input_no_value');
            var exist_data = elem.find('.tags').map(function(){return $(this).attr('data-id')}).toArray();
            $.each(array,function(){
                if(exist_data.indexOf(this[opt.checkedKey]) === -1){
                    elem.append("<span class='tags' data-id='"+this[opt.checkedKey]+"'>"+this[opt.checkedName]+"<i></i></span>");
                    var elem_input_value = elem_input.val();
                    var split_symbol = elem_input_value ? ',':'';
                    elem_input.val(elem_input_value + split_symbol + this[opt.checkedKey]);
                }
            });
            //鼠标移入 title
            elem_input.next().attr('title',elem_input.next().children('.tags').joinTemplate(function(){return ","+$(this).text()}).substr(1));
        }
        //删除tag
        function delete_to_dom(array){
            var wait_delete_id = $.map(array,function(d){return d[opt.checkedKey]});
            elem.find('.tags').each(function(){
                if(wait_delete_id.indexOf($(this).attr('data-id')) !== -1) 
                    $(this).remove();
            });
            reload_elem_input();
            elem_input.change();
        }
        //根据elem中的tag 重载 elem_input
        function reload_elem_input(){
            
            var reload_elem_input = elem.find('.tags').joinTemplate(function(){return ","+$(this).attr('data-id');}).substr(1);
            elem_input.val(reload_elem_input);
            if(elem.children('.tags').length) elem.removeClass('click_input_no_value');
            else elem.addClass('click_input_no_value');
            //鼠标移入 title
            elem_input.next().attr('title',elem_input.next().children('.tags').joinTemplate(function(){return ","+$(this).text()}).substr(1));
        }
        //窗口是否已打开
        var window_opened = false;
        var tableBox;
        
        elem.off('click').on('click', function(e) {
            $(document).click();
            e.stopPropagation();

            //父元素如果有 readonly 类,则只读
            if($(this).parent().hasClass('readonly')) return;
            
            if(e.target.tagName == 'I'){
                if($(e.target).parent().hasClass('disabled')) return;
                var delete_obj = {};
                delete_obj[opt.checkedKey] = $(e.target).parent().attr('data-id');
                delete_to_dom([delete_obj]);
                return;
            };
            //再次点击elem 关闭当前弹出框 
            if(window_opened){ close_window();return;}
            window_opened = true;
            

            
            //开始创建弹出框
            var elem = $(this);
            var w = elem.outerWidth();
            var t = elem.offset().top + 40 +"px";
            
            var l = elem.offset().left +"px";
            var tableName = "tableSelect_table_" + new Date().getTime();
                tableBox = '<div class="tableSelect layui-anim layui-anim-upbit" style="background:white;box-sizing: border-box;left:'+l+';top:'+t+';position: absolute;z-index:66666666;margin: 5px 0;border-radius: 2px;width:'+w+'px;">';
                tableBox += '<div class="tableSelectBar">';
                // tableBox += '<form class="layui-form" style="display:inline-block;width:100%;margin-bottom: 4px;" lay-filter="tableSelect_btn_search">';
                // tableBox += '<input style="display: inline-block; height: 40px; border: 1px solid #e3e3e3;" type="text" name="'+opt.searchKey+'" placeholder="'+opt.placeholder+'" autocomplete="off" class="layui-input"><button style="position: absolute; right: 0; line-height: 41px; height: 40px; border-color: #e4e4e4;" class="layui-btn layui-btn-sm layui-btn-primary" type="submit"><i class="layui-icon layui-icon-search" data-tips="搜索"></i></button>';
                // tableBox += '</form>';
            //    tableBox += '<button style="float:right;padding:0 20px;" class="layui-btn layui-btn-sm tableSelect_btn_select">选择<span></span></button>';
                tableBox += '</div>';
                tableBox += '<table id="'+tableName+'" lay-filter="'+tableName+'"></table>';
                tableBox += '</div>';
                tableBox = $(tableBox);
            $('body').append(tableBox);
            
            //搜索框自动获取焦点
            if(typeof IS_MOBILE==='boolean' && !IS_MOBILE) 
                elem.children('.search_input').focus();

            //自动提交搜索
            elem.find('.search_input').off().keyup(function(){
                
                if(elem.children('.tags').length || $(this).val()) elem.removeClass('click_input_no_value');
                else elem.addClass('click_input_no_value');
                
                var _this = $(this);
                var search_value = _this.val();
                setTimeout(function(){
                    if(_this.data('old_value') !== search_value && search_value === _this.val()){
                        tableSelect_table.reload(function(res){
                            var new_where = { field:opt.checkedName } //搜索字段
                            new_where[opt.searchKey] = search_value;
                            $.extend(true,res,{
                                where:new_where,
                                page:{ curr: 1 }                //页码回到第一页
                            });
                            return res;
                        });
                        _this.data('old_value',search_value);
                    }
                },500);
            }).blur(function(){
                $(this).val('');
                if(elem.children('.tags').length) elem.removeClass('click_input_no_value');
                else elem.addClass('click_input_no_value');
            });


            //数据缓存
            var checkedData = [];

            //渲染TABLE
            opt.table.elem = "#"+tableName;
            opt.table.id = tableName;
            opt.table.done = function(res, curr, count){
                
                //table 底部分页布局显示
                tableBox.find('.layui-laypage').css('width','100%').find('.layui-laypage-limits').css('float','right');
                if(!tableBox.find('a').length) tableBox.find('.layui-table-page').hide();
                var tableMain = tableBox.find('.layui-table-main');
                tableMain.css('max-height',tableMain.css('height')).css('height','auto');

                defaultChecked(res, curr, count);
                setChecked(res, curr, count);
                tableDone(res, curr, count);
                
                //FIX位置(如果超出屏幕,则定位到屏幕最底部)
                var gap = 40;   //容差
                var overHeight = (elem.offset().top - gap + elem.outerHeight() + tableBox.outerHeight() - $(window).scrollTop()) > $(window).height();
                var overWidth = (elem.offset().left + tableBox.outerWidth()) > $(window).width();
                    overHeight && tableBox.css({'top':'auto','bottom':'0px'});
                    overWidth && tableBox.css({'left':'auto','right':'5px'});

            };
            //opt.table.no_scrollbar = true;
            //清除上传
            delete opt.table.where['field'];
            delete opt.table.where[opt.searchKey];
            //将 input 框的 data('select_where') 添加到 table 的where 里面
            $.extend(opt.table.where,elem_input.data('select_where'));
            
            var tableSelect_table = public_table(null,null,null,null,opt.table);
            //分页选中保存数组
            table.on('radio('+tableName+')', function(obj){
                if(opt.checkedKey){
                    checkedData = table.checkStatus(tableName).data
                }
            })
            //单选框改变
			table.on('radio('+tableName+')',function(obj){
                elem_input.val('');elem.children('.tags').remove();
                append_to_dom([obj.data]);
                elem_input.change();
                
                //radio直接选中退出
                if(opt.type === 'radio') close_window();
            });
            //多选框改变
			table.on('checkbox('+tableName+')', function(obj){
                var click_is_one = obj.tr.length===0 ? false:true;                      //是否点击的单选(单选有tr)

                if(click_is_one){
                    if(obj.checked) append_to_dom([obj.data]);                          //1.选中
                    else delete_to_dom([obj.data]);                                     //2.选中取消
                }else{
                    var checked_all_obj = table.checkStatus(tableName);

                    if(checked_all_obj.isAll) append_to_dom(checked_all_obj.data);      //3.全选
                    else delete_to_dom(table.cache[tableName]);                         //4.全选取消
                }
                elem_input.change();
            });

            //渲染表格后选中
            function setChecked (res, curr, count) {
				for(var i=0;i<res.data.length;i++){
            		for (var j=0;j<checkedData.length;j++) {
            			if(res.data[i][opt.checkedKey] == checkedData[j][opt.checkedKey]){
            				res.data[i].LAY_CHECKED = true;
                            var index= res.data[i]['LAY_TABLE_INDEX'];
                            var checkbox = $('#'+tableName+'').next().find('tr[data-index=' + index + '] input[type="checkbox"]');
            				    checkbox.prop('checked', true).next().addClass('layui-form-checked');
                            var radio  = $('#'+tableName+'').next().find('tr[data-index=' + index + '] input[type="radio"]');
                                radio.prop('checked', true).next().addClass('layui-form-radioed').find("i").html('&#xe643;');
                            //radio.closest('tr').addClass('selected');
            			}
            		}
            	}
            	var checkStatus = table.checkStatus(tableName);
				if(checkStatus.isAll){
					$('#'+tableName+'').next().find('.layui-table-header th[data-field="0"] input[type="checkbox"]').prop('checked', true);
					$('#'+tableName+'').next().find('.layui-table-header th[data-field="0"] input[type="checkbox"]').next().addClass('layui-form-checked');
                }
            }
            
            //写入默认选中值(puash checkedData)
            function defaultChecked (res, curr, count){
                if(opt.checkedKey && elem_input.length){
                    var selected = elem_input.val().split(",");
                    for(var i=0;i<res.data.length;i++){
                        for(var j=0;j<selected.length;j++){
                            if(res.data[i][opt.checkedKey] == selected[j]){
                                checkedData.push(res.data[i])
                            }
                        }
                    }
                    checkedData = uniqueObjArray(checkedData, opt.checkedKey);
                }
            }
            //数组去重
			function uniqueObjArray(arr, type){
                var newArr = [];
                var tArr = [];
                if(arr.length == 0){
                    return arr;
                }else{
                    if(type){
                        for(var i=0;i<arr.length;i++){
                            if(!tArr[arr[i][type]]){
                                newArr.push(arr[i]);
                                tArr[arr[i][type]] = true;
                            }
                        }
                        return newArr;
                    }else{
                        for(var i=0;i<arr.length;i++){
                            if(!tArr[arr[i]]){
                                newArr.push(arr[i]);
                                tArr[arr[i]] = true;
                            }
                        }
                        return newArr;
                    }
                }
            }

            //双击行选中
            //table.on('rowDouble('+tableName+')', function(obj){close_window();});

            var run_only_one = false;
            //单击行选中 input
            table.on('row('+tableName+')', function(obj){
                if(window.event && (window.event.srcElement || window.event.target).tagName==="I") return;
                
                if(run_only_one){run_only_one = false;return;}
                run_only_one = true;
                obj.tr.find('.layui-form-radio,.layui-form-checkbox').click();
                
            });

            //点击其他区域关闭
            $(document).on('click',close_window);
            
            function close_window(e){
                var open_window = $('.tableSelect')[0];
                
                //点的如果是弹出框,则不执行关闭
                if(e && open_window && open_window.contains(e.target)) return;
                //点击弹出框里面的 table底部的分页有BUG 需要单独判断下
                if(e && e.target.parentNode && e.target.parentNode.className.indexOf('layui-laypage') !== -1) return;
                
                $(document).unbind('click',close_window);
                tableBox.remove();
                delete table.cache[tableName];
                checkedData = [];
                window_opened = false;
            }
        });
    }

    /**
    * 隐藏选择器
    */
    tableSelect.prototype.hide = function (opt) {
        $('.tableSelect').remove();
    }

    //自动完成渲染
    var tableSelect = new tableSelect();

    //FIX 滚动时错位
    if(window.top == window.self){
        $(window).scroll(function () {
            tableSelect.hide();
        });
    }

    exports(MOD_NAME, tableSelect);
})