/**
 * Created by songxue on 2019/8/15.
 */
(function($){
    var MethodMember=function(elem,options){
        this.elem = elem;
        this.options = options;
    };
    MethodMember.prototype={
        defaults:{
            peoInput:"",//填值的输入框
            arrId:[],//已选中人员id数组
            arrDes:[],//已选中人员详情数组
            de_tag_url:"/structure/Query/depList",//获取部门列表和标签列表
            depart_user_url:"/structure/Query/userList",//从部门获取人的URL
            label_user_url:"/framework/public/get_wap_tag_user",//从标签获取人的URL
            keywords_user_url:"/structure/Query/user_list",//从标签获取人的URL
            label:true,//支持标签选择
            depart:true,//支持部门选择
            lookList:true,//支持编辑查看已选人员
            lookId:"",//支持编辑查看已选人员对应的对象
            autoShow:true, //初始化默认打开
            chose_callback:false, //退出回调

        },
        init:function () {
            this.defaults.peoInput = this.elem;
            this.config = $.extend({}, this.defaults, this.options);
            if(this.config.autoShow) this.open();
            if(this.config.lookList){
                this.look();
            }
        },
        open:function(){
            var _this=this;
            if(this.config.label){
                $("body").append('<div id="ParticipantsWay" class="weui-popup__container popup-bottom"><div class="weui-popup__overlay"></div><div class="weui-popup__modal"><div class="flex-col flex-between timeToolbar"><span></span> <span>选择人员</span> <span></span> </div> <ul class="weui-cells single_cell"><li class="weui-cell" itId="1"><div class="weui-cell__bd">从标签选</div></li> <li class="weui-cell" itId="2"><div class="weui-cell__bd">从部门选</div></li> </ul> </div> </div>' +
                    '<div id="chooseParticipants_label" class="weui-popup__container"><div class="weui-popup__overlay"></div><div class="weui-popup__modal"><div class="weui-search-bar bg_white popupSearch"><form class="weui-search-bar__form" onsubmit="$(this).find(\'.weui-icon-search\').click();return false;"><div class="weui-search-bar__box"><i class="weui-icon-search"></i><input type="search" class="weui-search-bar__input" required=""><a href="javascript:" class="weui-icon-clear" ></a></div></form></div><div class="page__bd photoList"><div class="weui-cells single_cell labelList"></div><div class="photoFH"></div><div class="photoF1"><a href="javascript:void(0)" class="closePopup">取消</a></div></div></div></div>' +
                    '<div id="chooseParticipants_department" class="weui-popup__container"><div class="weui-popup__overlay"></div><div class="weui-popup__modal"><div class="weui-search-bar bg_white popupSearch"><form class="weui-search-bar__form" onsubmit="$(this).find(\'.weui-icon-search\').click();return false;"><div class="weui-search-bar__box"><i class="weui-icon-search"></i><input type="search" class="weui-search-bar__input" required=""><a href="javascript:" class="weui-icon-clear" ></a></div></form></div><div class="department-link"><a href="javascript:void(0)" class="ableClick">医院</a></div><div class="page__bd photoList"><div class="weui-cells single_cell chooseDepartmentList"> </div><div class="photoFH"></div> <div class="photoF1"><a href="javascript:void(0)" class="closePopup">取消</a></div></div></div></div>' +
                    '<div id="memberList" class="weui-popup__container"><div class="weui-popup__overlay"></div><div class="weui-popup__modal"><div class="memberList_all weui-cells_checkbox"><label class="weui-cell weui-check__label" for="mba"><div class="weui-cell__hd"><input type="checkbox" class="weui-check" name="memberListAll" id="mba" ><i class="weui-icon-checked"></i></div><div class="weui-cell__bd"><p>全选</p></div></label></div><div class="page__bd photoList "><div class="weui-cells weui-cells_checkbox mb15 memberListBox"></div><div class="photoFH"></div></div><div class="photoF2"><a href="javascript:void(0)" class="toBack" >取消</a><a href="javascript:void(0)" class="blue" id="memberList_save">确定</a></div></div></div>');
                var wayBox= $("#ParticipantsWay");
                wayBox.popup().find("li").unbind("click").on("click",function(){
                    var Box="";
                    if($(this).attr("itId")==1){
                        Box=$("#chooseParticipants_label");
                        Box.popup();
						Box.find(".weui-search-bar__input").val("");
                        label(Box,"");
                        Box.off("click",".weui-icon-search").on("click",".weui-icon-search",function(){
                            key=$(this).next(".weui-search-bar__input").val();
                            var memberBox=$("#memberList");
                            memberBox.popup();
                            people(memberBox,_this.config.keywords_user_url,key,1);

                            // label(Box,key);
                        }).off("click",".weui-cell__bd").on("click",".weui-cell__bd",function(){
                            var memberBox=$("#memberList");
                            memberBox.popup();
                            people(memberBox,_this.config.label_user_url,$(this).attr("it_id"),1);
                            Box.remove();
                        })
                    }else{
                        Box=$("#chooseParticipants_department");
                        Box.popup();
						Box.find(".weui-search-bar__input").val("");
                        depart(Box,"",null);
                        Box.off("click",".ableClick").on("click",".ableClick",function(){
                            if($(this).index()>0){
                                $(this).removeClass("ableClick").nextAll().remove();
                            }else{
                                $(this).nextAll().remove();
                            }
                            depart(Box,"",$(this).attr("parent"),0);
                        }).off("click",".openChildren").on("click",".openChildren",function(){
                            Box.find(".department-link").children().addClass("ableClick").end().append('<a href="javascript:void(0)" parent="'+$(this).attr("it_id")+'">'+$(this).attr("it_name")+'</a>');
                            depart(Box,"",$(this).attr("it_id"),0);
                        }).off("click",".weui-icon-search").on("click",".weui-icon-search",function(){
                            key=$(this).next(".weui-search-bar__input").val();
                            Box.find(".department-link").children().first().nextAll().remove();
                            
                            var memberBox=$("#memberList");
                            memberBox.popup();
                            people(memberBox,_this.config.keywords_user_url,key,0);

                        }).off("click",".weui-cell__bd").on("click",".weui-cell__bd",function(){
                            var memberBox=$("#memberList"),depart_this=$(this),str=depart_this.attr("it_id");
                            memberBox.popup();
                            people(memberBox,_this.config.depart_user_url,str,0);
                            Box.remove();
                        })
                    };
                    wayBox.remove();
                });
                wayBox.find(".weui-popup__overlay").on("click",function(){
                    wayBox.remove();
                });
            }else{
                $("body").append('<div id="chooseParticipants_department" class="weui-popup__container"><div class="weui-popup__overlay"></div><div class="weui-popup__modal"><div class="weui-search-bar bg_white popupSearch"><form class="weui-search-bar__form" onsubmit="$(this).find(\'.weui-icon-search\').click();return false;"><div class="weui-search-bar__box"><i class="weui-icon-search"></i><input type="search" class="weui-search-bar__input" required=""><a href="javascript:" class="weui-icon-clear" ></a></div></form></div><div class="department-link"><a href="javascript:void(0)" class="ableClick">公司</a></div><div class="page__bd photoList"><div class="weui-cells single_cell chooseDepartmentList"> </div><div class="photoFH"></div> <div class="photoF1"><a href="javascript:void(0)" class="closePopup">取消</a></div></div></div></div>' +
                    '<div id="memberList" class="weui-popup__container"><div class="weui-popup__overlay"></div><div class="weui-popup__modal"><div class="weui-search-bar" id="searchBar">'
		      +'<form class="weui-search-bar__form" action="#"><div class="weui-search-bar__box"><i class="weui-icon-search"></i><input type="search" class="weui-search-bar__input" id="searchInput" placeholder="搜索" required="">'
		          +'<a href="javascript:" class="weui-icon-clear" id="searchClear"></a> </div><label class="weui-search-bar__label" id="searchText" style="transform-origin: 0px 0px 0px; opacity: 1; transform: scale(1, 1);"><i class="weui-icon-search"></i><span>搜索</span></label></form><a href="javascript:" class="weui-search-bar__cancel-btn" id="searchCancel">取消</a></div><div class="memberList_all weui-cells_checkbox"><label class="weui-cell weui-check__label" for="mba"><div class="weui-cell__hd"><input type="checkbox" class="weui-check" name="memberListAll" id="mba" ><i class="weui-icon-checked"></i></div><div class="weui-cell__bd"><p>全选</p></div></label></div><div class="page__bd photoList "><div class="weui-cells weui-cells_checkbox mb15 memberListBox"></div><div class="photoFH"></div></div><div class="photoF1"><a href="javascript:void(0)" class="blue" id="memberList_save">确定</a></div></div></div>');

                var Box=$("#chooseParticipants_department");
                Box.popup();
                Box.find(".weui-search-bar__input").val("");
                depart(Box,"",null);
                Box.off("click",".ableClick").on("click",".ableClick",function(){
                    if($(this).index()>0){
                        $(this).removeClass("ableClick").nextAll().remove();
                    }else{
                        $(this).nextAll().remove();
                    }
                    depart(Box,"",$(this).attr("parent"),0);
                }).off("click",".openChildren").on("click",".openChildren",function(){
                    Box.find(".department-link").children().addClass("ableClick").end().append('<a href="javascript:void(0)" parent="'+$(this).attr("it_id")+'">'+$(this).attr("it_name")+'</a>');
                    depart(Box,"",$(this).attr("it_id"),0);
                }).off("click",".weui-icon-search").on("click",".weui-icon-search",function(){
                    key=$(this).next(".weui-search-bar__input").val();
                    // Box.find(".department-link").children().first().nextAll().remove();
                    var d_ID=Box.find(".department-link").children().last().attr("parent");
                    var memberBox=$("#memberList");
                    memberBox.popup();
                    people(memberBox,_this.config.keywords_user_url,d_ID,key,0);

                }).off("click",".weui-cell__bd").on("click",".weui-cell__bd",function(){
                    var memberBox=$("#memberList"),depart_this=$(this),str=depart_this.attr("it_id");
                    memberBox.popup();
                    people(memberBox,_this.config.depart_user_url,str,null,0);
                    Box.remove();
                })
            }
            function depart(Box,key,num){
                $.post(_this.config.de_tag_url,{keyword:key},function(res){
                    var dataList = res.data.department.converTree(num);
                    var str="";
                    $.each(dataList,function(i){
                        str+=' <div class="weui-cell"><div class="weui-cell__bd" it_id="'+dataList[i].id+'">'+dataList[i].depart_name+'</div>';
                        if(dataList[i].children){
                            str+='<i class="iconfont iconjiantou openChildren" it_id="'+dataList[i].id+'" it_name="'+dataList[i].depart_name+'"></i></div>'
                        }else{
                            str+='</div>'
                        }
                    });
                    Box.find(".chooseDepartmentList").html(str);
                });
                Box.find(".closePopup").on("click",function(){
                    Box.remove();
                })
            }
            function label(Box,key){
                $.post(_this.config.de_tag_url,{keyword:key},function(res){
                    var dataList = res.data.tag;
                    var str="";
                    $.each(dataList,function(i){
                        str+='<div class="weui-cell"><div class="weui-cell__bd" it_id="'+dataList[i].id+'">'+dataList[i].tagname+'</div></div>'
                    });
                    Box.find(".labelList").html(str);
                });
                Box.find(".closePopup").on("click",function(){
                    Box.remove();
                })
            }
            function people(memberBox,url,depId,key,LD){
                $.post(url,{dep_id:depId,keyword:key},function(res){
                    var str="";var all_check=true;
                    $.each(res.data,function(i){
                        var check=false;
                        str+=' <div class="weui-cell"><div class="weui-cell__hd"> ' +
                            '<img src="'+res.data[i].avatar+'" alt=""  class="arch-img"></div><div class="weui-cell__bd">' +
                            '<p class="photoList-title">'+res.data[i].name+'</p> ' +
                            '<p class="weui-media-box__desc">'+res.data[i].dep_names+'</p></div> <div class="weui-cell__ft">' +
                            '<label class="weui-check__label" for="member_'+res.data[i].userid+'"><div>' ;
                        $.each(_this.config.arrId,function(ii){if(res.data[i].userid==_this.config.arrId[ii]){check=true;return false;}});
                        if(check){
                            str+= '<input type="checkbox" class="weui-check readyCheck" name="memberList" title="'+res.data[i].name+'" it_id="'+res.data[i].userid+'" id="member_'+res.data[i].userid+'" checked>'
                        }else{
                            all_check=false;
                            str+= '<input type="checkbox" class="weui-check" name="memberList" title="'+res.data[i].name+'" it_id="'+res.data[i].userid+'" id="member_'+res.data[i].userid+'" >'
                        }
                        str+='<i class="weui-icon-checked"></i></div></label> </div> </div>';
                    });
                    memberBox.find(".memberListBox").html(str);
                    if(all_check&&$("input[name=memberList]").length>0){
                        memberBox.find("input[name=memberListAll]").prop("checked",true);
                    }else{
                        memberBox.find("input[name=memberListAll]").prop("checked",false);
                    }
                    memberChoose();
                    memberBox.off("click",".weui-icon-search").on("click",".weui-icon-search",function(){
                       var keyA=$(this).next(".weui-search-bar__input").val();
                         people(memberBox,_this.config.depart_user_url,depId,keyA,0);
                    }).off("keypress",".weui-search-bar__input").on("keypress",".weui-search-bar__input",function(e){
                        /*安卓手机键盘的搜索*/
                        var keycode = e.keyCode;
                        var keyA=$(this).val();
                        if(keycode=='13') {
                            e.preventDefault();
                            people(memberBox,_this.config.depart_user_url,depId,keyA,0);
                            //请求搜索接口
                        }

                    }).off("click","#memberList_save").on("click","#memberList_save",function(){
                        memberBox.find(".readyCheck").each(function(){
                            if($(this).prop("checked")==false){
                                var v=$(this).attr("it_id");
                                $.each(_this.config.arrId,function(ii,vv){
                                    if(v==vv){
                                        _this.config.arrId.splice(ii,1);
                                        _this.config.arrDes.splice(ii,1);
                                    }
                                })
                            }

                        });
                        var str="";
                        memberBox.find("input[name=memberList]:checked").each(function(i){
                            var ch=true,this_input=$(this),divB=this_input.parents(".weui-cell");
                            $.each(_this.config.arrId,function(ii){
                                if(_this.config.arrId[ii]==this_input.attr("it_id")){ch=false;}
                            });
                            if(ch){
                                _this.config.arrId.push(this_input.attr("it_id"));
                                _this.config.arrDes.push({
                                    name:divB.find(".photoList-title").html(),
                                    dep_names:divB.find(".weui-media-box__desc").html(),
                                    userid:this_input.attr("it_id"),
                                    avatar:divB.find("img").attr("src")
                                });
                            }
                        });
                        var arrDes_num = 0;
                        //var content_People = '';
                        $.each(_this.config.arrDes,function(i,v){
                            //str+= v.name+","
                            str+='<img src="'+ v.avatar+'" onerror="javascript:this.src=\'/static/images/headicon.png\';"/> ';
                            /*content_People+='<div style="width: 33%;float: left;height: 28px;line-height: 24px;margin-top: 5px;margin-bottom: 2px;overflow: hidden">' +
                                '<div style="width: 30%;float: left"><img style="width: 24px;height: 24px;border-radius: 50%;vertical-align: middle" src="'+ v.avatar+'" onerror="javascript:this.src=\'/static/home/images/headicon.png\';"/></div>' +
                                '<div style="width: 70%;float: left"><span style="line-height: 24px;margin-left: 5px;width: 90%">'+ v.name+'</span></div>' +
                                '</div>';*/
                            arrDes_num++;
                        });
                        //str=str.substring(0,str.length-1);
                        //_this.config.peoInput.val(str);
                        _this.config.peoInput.next("label").html(str);
                        if(parseInt(arrDes_num) > 5){
                            if( _this.elem.attr('id') == 'handelPeople'){
                                //$('#responsible_content').html(content_People);
                                //_this.config.peoInput.next("label").after('<div id="responsible_more_a" class="tl-tag-right handelPeople_more" style="color: #666;position: absolute;font-size: 14px;top: 9px;right: 16px;">更多</div>');
                            }else if( _this.elem.attr('id') == 'involvedPeople'){
                                //$('#people_content').html(content_People);
                                //_this.config.peoInput.next("label").after('<div id="people_more_a" class="tl-tag-right involvedPeople_more" style="color: #666;position: absolute;font-size: 14px;top: 9px;right: 16px;">更多</div>');
                            }
                            _this.config.peoInput.next("label").children('img').eq('6').nextAll().css('display','none');
                        }else{
                            //排除第二次选择时没有那么多的情况
                            /*if(_this.elem.attr('id') == 'handelPeople'){
                                if(_this.elem.next().html() != undefined){
                                    $('.handelPeople_more').css('display','none');
                                }
                            }else if(_this.elem.attr('id') == 'involvedPeople'){
                                if(_this.elem.next().html() != undefined){
                                    $('.involvedPeople_more').css('display','none');
                                }
                            }*/
                        }
                        _this.config.chose_callback && _this.config.chose_callback(_this.config.arrId,str);
                        memberBox.remove();
                    }).off("click",".toBack").on("click",".toBack",function(){
                        if(LD==1){
                            $("body").append('<div id="chooseParticipants_label" class="weui-popup__container"><div class="weui-popup__overlay"></div><div class="weui-popup__modal"><div class="weui-search-bar bg_white popupSearch"><form class="weui-search-bar__form" onsubmit="$(this).find(\'.weui-icon-search\').click();return false;"><div class="weui-search-bar__box"><i class="weui-icon-search"></i><input type="search" class="weui-search-bar__input" required=""><a href="javascript:" class="weui-icon-clear" ></a></div></form></div><div class="page__bd photoList"><div class="weui-cells single_cell labelList"></div><div class="photoFH"></div><div class="photoF1"><a href="javascript:void(0)" class="closePopup">取消</a></div></div></div></div>')
                           var Box=$("#chooseParticipants_label");
                            Box.popup();
                            Box.find(".weui-search-bar__input").val("");
                            label(Box,"");
                            Box.off("click",".weui-icon-search").on("click",".weui-icon-search",function(){
                                key=$(this).next(".weui-search-bar__input").val();
                                var memberBox=$("#memberList");
                                memberBox.popup();
                                people(memberBox,_this.config.keywords_user_url,key,1);

                                // label(Box,key);
                            }).off("click",".weui-cell__bd").on("click",".weui-cell__bd",function(){
                                var memberBox=$("#memberList");
                                memberBox.popup();
                                people(memberBox,_this.config.label_user_url,$(this).attr("it_id"),1);
                                Box.remove();
                            })
                        }else{
                            $("body").append('<div id="chooseParticipants_department" class="weui-popup__container"><div class="weui-popup__overlay"></div><div class="weui-popup__modal"><div class="weui-search-bar bg_white popupSearch"><form class="weui-search-bar__form" onsubmit="$(this).find(\'.weui-icon-search\').click();return false;"><div class="weui-search-bar__box"><i class="weui-icon-search"></i><input type="search" class="weui-search-bar__input" required=""><a href="javascript:" class="weui-icon-clear" ></a></div></form></div><div class="department-link"><a href="javascript:void(0)" class="ableClick">医院</a></div><div class="page__bd photoList"><div class="weui-cells single_cell chooseDepartmentList"> </div><div class="photoFH"></div> <div class="photoF1"><a href="javascript:void(0)" class="closePopup">取消</a></div></div></div></div>')
                            var Box=$("#chooseParticipants_department");
                            Box.popup();
                            Box.find(".weui-search-bar__input").val("");
                            depart(Box,"",null,0);
                            Box.off("click",".ableClick").on("click",".ableClick",function(){
                                if($(this).index()>0){
                                    $(this).removeClass("ableClick").nextAll().remove();
                                }else{
                                    $(this).nextAll().remove();
                                }
                                depart(Box,"",$(this).attr("parent"),0);
                            }).off("click",".openChildren").on("click",".openChildren",function(){
                                Box.find(".department-link").children().addClass("ableClick").end().append('<a href="javascript:void(0)" parent="'+$(this).attr("it_id")+'">'+$(this).attr("it_name")+'</a>');
                                depart(Box,"",$(this).attr("it_id"),0);
                            }).off("click",".weui-icon-search").on("click",".weui-icon-search",function(){
                                key=$(this).next(".weui-search-bar__input").val();
                                Box.find(".department-link").children().first().nextAll().remove();

                                var memberBox=$("#memberList");
                                memberBox.popup();
                                people(memberBox,_this.config.keywords_user_url,key,0);

                            }).off("click",".weui-cell__bd").on("click",".weui-cell__bd",function(){
                                var memberBox=$("#memberList"),depart_this=$(this),str=depart_this.attr("it_id");
                                memberBox.popup();
                                people(memberBox,_this.config.depart_user_url,str,0);
                                Box.remove();
                            })
                        }
                    })
                })
            }
        },
        look:function(){
            var _this=this;
            $("body").append('<div id="ParticipantsDes" class="weui-popup__container">' +
                '<div class="weui-popup__overlay"></div>' +
                '<div class="weui-popup__modal">' +
                '<div class="page__bd photoList ">' +
                '<div class="weui-cells weui-cells_checkbox mb15 ParticipantsDesList"> </div>' +
                '<div class="photoFH"></div> </div> ' +
                '<div class="photoF1"><a href="javascript:void(0)" class="blue" id="ParticipantsDes_save">确定</a></div></div></div>');
            _this.config.lookId && _this.config.lookId.off("click").on("click",function(){
                var box=$("#ParticipantsDes");
                box.popup();
                var str="";
                $.each(_this.config.arrId,function(i){
                    str+=' <div class="weui-cell"><div class="weui-cell__hd">' +
                        '<img src="'+_this.config.arrDes[i].avatar+'" alt=""  class="arch-img"></div><div class="weui-cell__bd">' +
                        '<p class="photoList-title">'+_this.config.arrDes[i].name+'</p>' +
                        '<p class="weui-media-box__desc">'+_this.config.arrDes[i].dep_names+'</p></div><div class="weui-cell__ft">' +
                        '<label class="weui-check__label" for="pd'+_this.config.arrDes[i].userid+'"><div>' +
                        '<input type="checkbox" class="weui-check" name="HeaderPeople" title="'+_this.config.arrDes[i].userid+'" id="pd'+_this.config.arrDes[i].userid+'" ><i class="weui-icon-cancel"></i></div></label></div></div>'
                });
                box.find(".ParticipantsDesList").html(str);
                box.off("click","#ParticipantsDes_save").on("click","#ParticipantsDes_save",function(){
                    var str="";
                    box.find("input:checked").each(function(){
                        var this_input=$(this);
                        $.each(_this.config.arrId,function(ii){
                            if(this_input.attr("title")==_this.config.arrId[ii]){
                                _this.config.arrId.splice(ii, 1);
                                _this.config.arrDes.splice(ii, 1);
                            }
                        })
                    });
                    var arrDes_num = 0;
                    $.each(_this.config.arrDes,function(i,v){
                        //str+=_this.config.arrDes[i].name+","
                        str+='<img src="'+ v.avatar+'" onerror="javascript:this.src=\'/static/images/headicon.png\';"/> ';
                        arrDes_num++;
                    });

                    //str=str.substring(0,str.length-1);
                    //_this.config.peoInput.val(str);
                    _this.config.peoInput.next("label").html(str);
                    if(parseInt(arrDes_num) > 5){
                        _this.config.peoInput.next("label").children('img').eq('6').nextAll().css('display','none');
                    }else{
                        //排除第二次选择时没有那么多的情况
                    }
                    $.closePopup();

                })
            });

        }
    };
    $.fn.methodMember = function(options) {
        var obj = new MethodMember(this, options);
        obj.init();
        return obj;
    };
})(jQuery);


function memberChoose(){
    /*  全选//选择  */
    var memberList=$("#memberList"),memberChoose_single=memberList.find("input[name=memberList]"),memberChoose_all=memberList.find("input[name=memberListAll]");
    memberChoose_single.on("change",function(){
        var checkBoo = true;
        memberChoose_single.each(function() {
            checkBoo = checkBoo && $(this).prop('checked');
        });
        memberChoose_all.prop('checked', checkBoo);
    });
    memberChoose_all.on("change",function(){
        memberChoose_single.prop('checked', $(this).prop("checked") ? true : false);
    });
}