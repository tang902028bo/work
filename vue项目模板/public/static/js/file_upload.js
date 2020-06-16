
var imgArr=[],fileArr=[];
var allow_ext = ['RAR','ZIP','MP3','WAV','M4A','DOC','DOCX','PPT','PPTX','VSD','VSDX','GIF','LEC','BMP','GIF','JPG','MP4','WPS','XLS','XLSX','PNG','PDF','AVI','TXT','JPEG'];
$(function() {
    var objUrl;
    $("#upFile").change(function() {
        var filepath = $(this).val();
        if(!filepath){
            return false;
        }
        var fileObj = new FormData();
        for(var i = 0; i < this.files.length; i++) {
            objUrl = getObjectURL(this.files[i]);
            var extStart = filepath.lastIndexOf(".");
            if(extStart<0){
                return false;
            }
            var ext = filepath.substring(extStart+1, filepath.length).toUpperCase();
            if($.inArray(ext,allow_ext)=== '-1' ||  $.inArray(ext,allow_ext)=== -1) {
                $.toast("上传文件格式不正确", "text");
                this.value = "";
                return false;
            } else {
                fileObj.append("file[]",this.files[i]);
            }
        }
        $.showLoading();
        $.ajax({ url:'/api/upload/upload',type : 'POST',data: fileObj,processData : false,contentType : false, success:function (res) {
                $.hideLoading();
                $.each(res.data,function(j,v){
                    if(v.save_path.indexOf(".png")>=0 || v.save_path.indexOf(".jpg")>=0 || v.save_path.indexOf(".jpeg")>=0){
                        imgArr.push({
                            name:v.name,
                            url:v.save_path,
                            size:v.size
                        });
                        img_html = '<div><div><img src="'+v.save_path+'" alt=""/></div><i class="iconfont iconzengjia" onclick="javascript:removeImg(this)"></i></div>';
                        $(".imgBox").append(img_html);
                    }else{
                        fileArr.push({
                            name:v.name,
                            url:v.save_path,
                            size:v.size
                        });
                        img_html = '<div><p>'+v['name']+'</p><i class="iconfont iconzengjia" onclick="javascript:removeFile(this)"></i></div>';
                        $(".fileBox").append(img_html);
                    }
                })
            }});
    });
});
function getObjectURL(file) {
    var url = null;
    if(window.createObjectURL != undefined) {
        url = window.createObjectURL(file);
    } else if(window.URL != undefined) {
        url = window.URL.createObjectURL(file);
    } else if(window.webkitURL != undefined) {
        url = window.webkitURL.createObjectURL(file);
    }
    return url;
}
function removeImg(r){
    imgArr.splice($(r).parent().index(),1);
    $(r).parent().remove();
}
function removeFile(r){
    fileArr.splice($(r).parent().index(),1);
    $(r).parent().remove();
}
$(".fileBox").on('click','.iconzengjia',function () {
    removeFile($(this));
});