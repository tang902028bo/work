var tools = {
    url_param:function (key) {
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
        if(key){
            return return_obj[key]?return_obj[key]:null;
        }
        return return_obj;
    },
    dateTime:function (data,field) {
        if(!data) return '';
        var source = typeof data === 'object'? data[field]:data;
        if(source === '****') return '****';
        if(source === '1970-01-01 08:00:00' || source === 0 || source === '0') return '';
        if(!source) return '';

        if(new Date(source).toString() === 'Invalid Date') source = +source;
        if(source < 9999999999) source = source*1000;
        var _date = new Date(source);
        var _return = _date.toLocaleString('zh',{hour12: false}).replace(/\//g,'-');
        if(_date.getMonth()+1<10) _return = _return.replace('-'+(_date.getMonth()+1),'-0'+(_date.getMonth()+1));
        if(_date.getDate()<10) _return = _return.replace('-'+(_date.getDate())+' ','-0'+(_date.getDate())+' ');
        return _return.substring(0,_return.length-3);
    },
    mould:function () {

    }
};