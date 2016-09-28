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

/*function tips(msg, error, after) {
    BootstrapDialog.show({
        type: error ? BootstrapDialog.TYPE_DANGER : BootstrapDialog.TYPE_SUCCESS,
        title: error ? '错误' : '恭喜',
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
}*/
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
	//aa = JSON.stringify(data)
	//alert(aa)
	data_index1 = data["success"]==undefined ? "result":"success";
	data_index2 = data["message"]==undefined ? "msg":"message";
    if (data[data_index1]) {
        try {
            callback(data);
        } catch (e) {
            console.log(e)
            return tips("数据处理错误", "danger");
        }
    } else {
		try {
			if(data["type"]){
				tips(data[data_index2],data["type"]);
			}else{
				if(data[data_index2]){
					tips(data[data_index2],"danger")
				}else{
					tips("操作失败，玩家当前不在线！","warning");
				}
			}
		}catch (e) {
			console.log(e)
		}
    }
}

function jyzz_ajax(url, cmd, callback, provider, check, server) {
    if (typeof(check) == 'function' && !check()) return;
    var data = {}
    data["cmd"] = cmd;
    data["server"] = server ? server : query()["server"];
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
            tips("服务器连接错误。","danger");
        },
        success: function(data) {
            check_data(data, callback)
        }
    });
}

function jyzz_ajax_zmq(command, provider, callback, check) {
    jyzz_ajax('/manager', command, callback, provider, check);
}

function jyzz_ajax_db(command, provider, callback, check) {
    jyzz_ajax('/db', command, callback, provider, check);
}

function jyzz_ajax_setting(command, provider, callback, check) {
    jyzz_ajax('/setting', command, callback, provider, check);
}

function jyzz_ajax_activation(command, provider, callback, check) {
    jyzz_ajax('/activation', command, callback, provider, check);
}

function jyzz_ajax_batch(command, provider, callback, check) {
    jyzz_ajax('/batch', command, callback, provider, check);
}

function bind(command, callback, provider, check) {
    $("#" + command).click(
        function() {
            jyzz_ajax_zmq(command, provider, callback, check);
            return false;
        }
    )
}

function dbbind(command, callback, provider, check) {
    $("#" + command).click(
        function() {
            jyzz_ajax_db(command, provider, callback, check);
            return false;
        }
    )
}

function settingbind(command, callback, provider, check) {
    $("#" + command).click(
        function() {
            jyzz_ajax_setting(command, provider, callback, check);
            return false;
        }
    )
}

function activationbind(command, callback, provider, check) {
    $("#" + command).click(
        function() {
            jyzz_ajax_activation(command, provider, callback, check);
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


$(document).ready(function() {
    $('.navbar-brand').popover({
        "placement": "bottom",
        "html": true,
        "trigger": 'hover',
        "title": "通过手机访问 <span class='glyphicon glyphicon-phone'></span>",
        "content": "<div class='qrcode'></div>"
    })

    $('.navbar-brand').on('shown.bs.popover', function() {
        $('.qrcode').qrcode({
            width: 128,
            height: 128,
            text: window.location.href
        });
    })

    $('input').attr('autocomplete', 'off');

    if (!window.chrome) {
        $('#chrome_alert').removeClass('hide');
    }
});