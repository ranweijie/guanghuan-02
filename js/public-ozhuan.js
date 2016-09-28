function query() {
    var pairs = window.location.search.substring(1).split("&");
    var obj = {};

    for (i in pairs) {
        if (pairs[i] === "") continue;

        var pair = pairs[i].split("=");
        obj[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
    }

    return obj;
}

function toHtml(str) {
    return str.replace(/\t/g, '    ')
        .replace(/ /g, '&nbsp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\r?\n/g, '<br>')
}


function tips(msg,msg_type,after) {
	title_obj = {"success":"恭喜","danger":"错误","warning":"提示","info":"参考信息"}
	//alert(msg_type)
    BootstrapDialog.show({
		type:(msg_type !=undefined) ? "type-"+ msg_type :'type-success',
		title:msg_type ? title_obj[msg_type] : "恭喜",
        message: "<div style='word-wrap: break-word'>" + toHtml(msg) + "</div>",
        buttons: [{
            label: '确定',
            hotkey: 13,
            action: function(dialog) {
                dialog.close();
                if (after) after();
            }
        }]
    });
    return false;
}
var waitDialog;
waitDialog = waitDialog || (function() {
    var pleaseWaitDiv = $('<div class="modal fade"><div class="modal-dialog" style="margin-top: 20%;"><div class="modal-content"><div class="modal-body"><h4>请稍候……</h4><div class="progress"><div class="progress-bar progress-bar-striped active" style="width: 100%"></div></div></div></div></div></div>');
    return {
        show: function() {
            pleaseWaitDiv.modal();
        },
        hide: function() {
            pleaseWaitDiv.modal('hide');
        }
    };
})();


var timer = false
var send = 0
var receive = 0

function delayWaitDialog() {
    if (send > receive) {
        waitDialog.show();
    }
}
function closeDelayWaitDialog() {
    if (send == receive) {
        timer = false
        waitDialog.hide();
    }
}
function check_data(data, callback) {
	// alert(JSON.stringify(data))
    if (data["success"]) {
        try {
            callback(data["data"]);
        } catch (e) {
            console.log(e)
            return tips("数据处理错误", "danger");
        }
    }else{
        return tips(data["message"], "danger");
    }
}

function ozhuan_ajax(url, cmd, provider, callback,check) {
    if (typeof(check) == 'function' && !check()) return;
    var data = {}
    data["cmd"] = cmd;
    data["params"] = provider ? (typeof(provider) == 'function' ? provider() : provider) : [];
    if (!timer) {
        setTimeout(delayWaitDialog, 500)
        timer = true;
    }
    send++;
    $.ajax({
        url: url,
        type: "post",
        async: true,
        data: {
            "data": JSON.stringify(data)
        },
        dataType: "json",
        complete: function() {
            receive++;
            closeDelayWaitDialog();
        },
        error: function() {
            tips("服务器连接错误，请联系服务商ozhuan.js！","danger");
        },
        success: function(data) {
            check_data(data, callback)
        }
    });
}
//数据库信息交流
function ozhuan_ajax_db(command, provider, callback, check) {
    ozhuan_ajax('/db', command, provider, callback, check);
}
//查询操作日志
function ozhuan_ajax_setting(command, provider, callback, check) {
    ozhuan_ajax('/setting', command, callback, provider, check);
}



function dbbind(command, callback, provider, check) {
    $("#" + command).click(
        function() {
            ozhuan_ajax_db(command, provider, callback, check);
            return false;
        }
    )
}

function settingbind(command, callback, provider, check) {
    $("#" + command).click(
        function() {
            ozhuan_ajax_setting(command, provider, callback, check);
            return false;
        }
    )
}


function bind_enter(input, button) {
    $("#" + input).bind('keypress', function(event) {
        if (event.keyCode == "13") {
            $("#" + button).click();
        }
    });
}

/*由时间字符串转为时间戳*/
function getTimestamp(dateStr){
    var timeInt = Math.floor(Date.parse(dateStr)/1000);
    return timeInt; 
}

/**
 * 判断是否为空
 * 空：返回true
 * @param input
 * @return {boolean}
 */
function isNull(input) {
    var flag = false;
    if (input == undefined || input == null || input.length == 0)
        flag = true;
    return flag;
}
/**
 * 判断是否是Email
 * 空或者是，返回true
 * @param input
 * @return {boolean}
 */
function isEmail(input) {
    var flag = true;
    if (!isNull(input)) {
        input = input.substring(0, input.indexOf("@")).replace(".", "").replace(".", "")
            .replace(".", "").replace(".", "").replace(".", "").replace(".", "").replace(".", "") + input.substring(input.indexOf("@"), input.length).replace("-", "");

        var reg = /^\w{1,30}(?:@(?!-))(?:(?:[a-z0-9-]*(?:[a-z0-9](?!-))(?:\.(?!-))))+[a-z]{2,4}$/;
        if (!reg.test(input))
            flag = false;

    }
    return flag;
}
/**
 * 判断是否为数字
 * 是数字或者空：返回true
 * @param input
 * @return {boolean}
 */
function isNumber(input) {
    var flag = true;
    if (!isNull(input)) {
        if (isNaN(input))
            flag = false;
    }
    return flag;
}
/**
 * 判断是否是整数
 * 空或者整数：true
 * @param input
 * @return {boolean}
 */
function isInteger(input) {
    var flag = true;
    if (!isNull(input)) {
        if (!/^-?\d+$/.test(input))
            flag = false;
    }
    return flag;
}
/**
 * 判断是否是浮点数
 * 是或者空：true
 * @param input
 * @return {boolean}
 */
function isFloat(input) {
    var flag = true;
    if (!isNull(input)) {
        if (!/^(-?\d+)(\.\d+)?$/.test(input))
            flag = false;
    }
    return flag;
}
/**
 * 判断是否是IP地址
 * 空或者是IP地址：true
 * @param input
 * @return {boolean}
 */
function isIP(input) {
    var flag = true;
    if (!isNull(input)) {
        if (!/^(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9])\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[0-9])$/.test(input))
            flag = false;
    }
    return flag;
}
/**
 * 判断身份证号码
 * 空或者正确：true
 * @param idNumber
 * @return {boolean}
 */
function isIdCardNo(idNumber) {
    var flag = true;
    if (!isNull(idNumber)) {
        var factorArr = new Array(7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2, 1);
        var varArray = new Array();
        var lngProduct = 0;
        var intCheckDigit;

        if ((idNumber.length != 15) && (idNumber.length != 18)) {
            return false;
        }
        for (i = 0; i < idNumber.length; i++) {
            varArray[i] = idNumber.charAt(i);
            if ((varArray[i] < '0' || varArray[i] > '9') && (i != 17)) {
                return false;
            } else if (i < 17) {
                varArray[i] = varArray[i] * factorArr[i];
            }
        }
        if (idNumber.length == 18) {
            var date8 = idNumber.substring(6, 14);
            if (isDate2(date8) == false) {
                return false;
            }
            for (i = 0; i < 17; i++) {
                lngProduct = lngProduct + varArray[i];
            }
            intCheckDigit = 12 - lngProduct % 11;
            switch (intCheckDigit) {
                case 10:
                    intCheckDigit = 'X';
                    break;
                case 11:
                    intCheckDigit = 0;
                    break;
                case 12:
                    intCheckDigit = 1;
                    break;
            }
            if (varArray[17].toUpperCase() != intCheckDigit) {
                return false;
            }
        } else {
            var date6 = idNumber.substring(6, 12);
            if (isDate2(date6) == false) {
                flag = false;
            }
        }
    }
    return flag;
}
/**
 * 判断是否符合QQ号格式
 * 空或者QQ号：true
 * @param input
 * @return {boolean}
 */
function isQQ(input) {
    var flag = true;
    if (!isNull(input)) {
        if (!/^[1-9]\d{4,10}$/.test(input))
            flag = false;
    }
    return flag;
}

/*座机号判断 格式:(010/020-025/027-029 /03**-09**)? + ******* ******** */
/*空或者符合格式：true*/
function isPhone(input) {
    var flag = true;
    var patter = /^(0((10)|(2[0-5|7-9])|[3-9]\d{2})(\-|\s)?)?\d{7,8}$/
    if (!isNull(input)) {
        if (!patter.test(input))
            flag = false;
    }
    return flag;
}


/*手机号判断 格式:130-139 145/147 150-159 176-178 180-189 */
/* 空或者手机号码：true*/
function isMobile(input) {
    var flag = true;
    var patter = /^((\+?86)|(\(\+?86\)))?0?((13[0-9])|145|147|(15[0-9])|(17[6-8])|(18[0-9]))\d{8}$/
    if (!isNull(input)) {
        if (!patter.test(input))
            flag = false;
    }
    return flag;
}

/*密码格式判断 格式:字母开头，可包含字母数字特殊符号的6-12位数字 */
/*密码格式判断 格式:任意字符6~20位 */ 
/* 空或者手机号码：true*/
function isPasswordOK(input) {
    var flag = true;
    // var patter = /^[a-zA-Z]{1}([a-zA-Z0-9]|[\s\\s,<\.>\?;:'"\[\]\{\}\\\|`~!@#%\$\^&\*\(\)\-\+]){5,11}$/
    var patter = /^.{6,20}$/
    if (!isNull(input)) {
        if (!patter.test(input))
            flag = false;
    }
    return flag;
}

/**
 * 判断是否是邮编
 * 空或者邮编：true
 * @param input
 * @return {boolean}
 */
function isPost(input) {
    var flag = true;
    if (!isNull(input)) {
        if (!/^\d{1,6}$/.test(input))
            flag = false;
    }
    return flag;
}
/**
 * 判断字符串长度是否在length范围内
 * 是或者空：true
 * @param input
 * @param length
 * @return {boolean}
 */
function isInRange(input, length) {
    var flag = true;
    if (!isNull(input)) {
        if (input.length <= length)
            flag = false;
    }
    return flag;
}
/**
 * 根据type的形式判断日期
 * 空或者符合形式：true
 * @param input
 * @param type
 * @return {boolean}
 */
function isDate(input, type) {
    var flag = true;
    if (!isNull(input)) {
        var reg = /^((((1[6-9]|[2-9]\d)\d{2})-(0?[13578]|1[02])-(0?[1-9]|[12]\d|3[01]))|(((1[6-9]|[2-9]\d)\d{2})-(0?[13456789]|1[012])-(0?[1-9]|[12]\d|30))|(((1[6-9]|[2-9]\d)\d{2})-0?2-(0?[1-9]|1\d|2[0-8]))|(((1[6-9]|[2-9]\d)(0[48]|[2468][048]|[13579][26])|((16|[2468][048]|[3579][26])00))-0?2-29-))$/;
        if (!isNull(type)) {
            if ("YYYY/MM/DD" == type.toUpperCase())
                reg = /^((((1[6-9]|[2-9]\d)\d{2})\/(0?[13578]|1[02])\/(0?[1-9]|[12]\d|3[01]))|(((1[6-9]|[2-9]\d)\d{2})\/(0?[13456789]|1[012])-(0?[1-9]|[12]\d|30))|(((1[6-9]|[2-9]\d)\d{2})-0?2-(0?[1-9]|1\d|2[0-8]))|(((1[6-9]|[2-9]\d)(0[48]|[2468][048]|[13579][26])|((16|[2468][048]|[3579][26])00))-0?2-29-))$/;
            else if ("YYYYMMDD" == type.toUpperCase())
                reg = /^((((1[6-9]|[2-9]\d)\d{2})(0?[13578]|1[02])(0?[1-9]|[12]\d|3[01]))|(((1[6-9]|[2-9]\d)\d{2})(0?[13456789]|1[012])-(0?[1-9]|[12]\d|30))|(((1[6-9]|[2-9]\d)\d{2})-0?2-(0?[1-9]|1\d|2[0-8]))|(((1[6-9]|[2-9]\d)(0[48]|[2468][048]|[13579][26])|((16|[2468][048]|[3579][26])00))-0?2-29-))$/;
        }
        if (!reg.test(input)) {
            flag = false;
        }
    }
    return flag;
}

function isDate2(dateStr) {
    var dateInfo = dateStr.match(/(\d{4})(\d{2})(\d{2})/);
    var tmpDate = new Date(dateInfo[1], dateInfo[2] - 1, dateInfo[3]);
    return tmpDate.getFullYear() == dateInfo[1] && tmpDate.getMonth() + 1 == dateInfo[2] && tmpDate.getDate() == dateInfo[3];
}
/**
 * 判断是否是汉字
 * 空或者是汉字：true
 * @param input
 * @return {boolean}
 */
function isChinese(input) {
    var flag = true;
    if (!isNull(input)) {
        if (!(/^[\u4E00-\uFA29]*$/.test(input) && (!/^[\uE7C7-\uE7F3]*$/.test(input))))
            flag = false;
    }
    return flag;
}
/**
 * 判断字符串含有 汉字和数字
 * @param input
 * @return {boolean}
 */
function isChineseOrNum(input) {
    var flag = true;
    if (!isNull(input)) {
        input = input.replace(/\d+/g, '');
        if (!(/^[\u4E00-\uFA29]*$/.test(input) && (!/^[\uE7C7-\uE7F3]*$/.test(input))))
            flag = false;
    }
    return flag;
}
/**
 * 判断是否是姓名(中文/英文)
 * @param input
 * @return {boolean}
 */
function isPersonName(input) {
    var flag = true;
    if (!isNull(input)) {
        input = input.replace(/\s+/g, '');
        // console.log(input);
        if (!(/^[\u4E00-\uFA29a-zA-Z]*$/.test(input)))
            flag = false;
    }
    return flag;
}
/**
 * 判断是否是地址(中文/英文)
 * @param input
 * @return {boolean}
 */
function isAddress(input) {
    var flag = true;
    if (!isNull(input)) {
        input = input.replace(/\s+/g, '');
        // console.log(input);
        if (!(/^[\u4E00-\uFA29a-zA-Z0-9\-]*$/.test(input)))
            flag = false;
    }
    return flag;
}

/**
 * 过滤掉字符串头和尾的空格,空了返回null
 * @param input
 * @return {*}
 */
function trimSpace(input) {
    if (!isNull(input)) {
        input.replace(/(^\s*)|(\s*$)/g, '');
    }
    return input;
}
/**
 * 过滤字符串左边空格
 * @param input
 * @return {*}
 */
function trimSpaceLeft(input) {
    if (!isNull(input)) {
        input.replace(/^\s*/g, '');
    }
    return input;
}
/**
 * 过滤字符串右边数据
 * @param input
 * @return {*}
 */
function trimSpaceRight(input) {
    if (!isNull(input)) {
        input.replace(/\s*$/, '');
    }
    return input;
}
/**
 * 判断是否是链接
 * 空或者链接，返回true
 * @param input
 * @return {boolean}
 */
function isUrl(input) {
    var flag = true;
    if (!isNull(input)) {
        var re = new RegExp("^((https|http|ftp|rtsp|mms)://)?[a-z0-9A-Z]{3}\.[a-z0-9A-Z][a-z0-9A-Z]{0,61}?[a-z0-9A-Z]\.com|net|cn|cc (:s[0-9]{1-4})?/$");
        if (!re.test(input))
            flag = false;
    }
    return flag;
}


$(document).ready(function() {
   
    //$('input').attr('autocomplete', 'on');

});