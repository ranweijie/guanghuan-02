
function getPlublishTaskBreif(page){
    ozhuan_ajax_db("getPlublishTaskBreif",page,function(data){
        // alert(JSON.stringify(data))
        $('#plublishTaskPage').bootpag({
            total:data["total"]==0?1:data["total"],
            page: page,
            maxVisible: 10
        });

        var fieldArr = data["fieldName"];
        var platformInfo = {"1":"IPhone","2":"iPad","3":"IPhone和iPad"}
        // console.log("页数:",data["total"])
        // console.log("字段:",fieldArr)
        var fieldLen = fieldArr.length;

        if (data["total"] == 0) {
            var tbody = $("<tbody id='plublishTaskList'></tbody>");
            tbody.append("<tr align='center'> <td colspan='"+(fieldLen+2)+"'> <span style='color:#cd54f6;'><b>当前没有任何已发布任务</b></span></td></tr>")
            $("#plublishTaskList").replaceWith(tbody);
            return;
        }
        var data = data["ret_data"];
        var tbody = $("<tbody id='plublishTaskList'></tbody>");
        for (var i = 0; i < data.length; i++) {
            var tr = $('<tr align="center"></tr>');
            //序号
            tr.append('<td>' + ((page-1)*10+i+1) + '</td>');
            //内容
            for (var j in fieldArr){
                var fieldName = fieldArr[j];
                if (fieldName == "deviceplatformtype"){
                    var fieldValue = platformInfo[String(data[i][fieldName])]
                }else{
                    var fieldValue = data[i][fieldName];
                }
                tr.append('<td>' + fieldValue + '</td>'); 
                // tr.append('<td>' + data[i][fieldName] + '</td>'); 
            }
            //操作按钮
            tr.append('<td>' + 
                    "<a class=\"btn btn-info btn-xs\" onclick=\"showTaskDetail(\'"+data[i]["appid"]+"\')\" href=\"javascript:;\" title=\"点击查看详情\">查看详情</a>" +
                    "<a class=\"btn btn-success btn-xs\" onclick=\"modifyTask(\'"+data[i]["appid"]+"\')\" href=\"javascript:;\" title=\"点击修改任务\">修改任务</a>" +
                    "<a class=\"btn btn-danger btn-xs\" onclick=\"delTask(\'"+data[i]["appid"]+"\')\" href=\"javascript:;\" title=\"点击删除任务\">删除任务</a>"
                + "</td>");
            tbody.append(tr);
        }
        $("#plublishTaskList").replaceWith(tbody);
    })
}

function goTaskManagePage(){
    window.location.href = "/taskManage";
}

function showTaskDetail(appid){
    window.location.href = "/taskManage/rwxq?rwid=" + appid;
}

function modifyTask(appid){
    window.location.href = "/taskManage/rwxg?rwid=" + appid;
}

function delTask(appid){
    var username = $.trim($("#curr-user").text());

    var dialogStr = "您正在删除appid为 <strong>" + appid + "</strong>的任务，请确认是否删除";
    // dialogStr += '<label for="confirm_number">验证码：</label><input id="confirm_number" name="confirm_number" class="form-control" type="text"  value="" placeholder="请在此输入验证码">'
    BootstrapDialog.show({
        type: BootstrapDialog.TYPE_WARNING,
        title: '删除任务提示',
        message: dialogStr,
        buttons: [{
            label: '取消',
            action: function(dialog) {
                dialog.close();
            },
        }, {
            label: '确定',
            cssClass: 'btn-success',
            action: function(dialog) {
                // var confirmNumber = dialog.getModalBody().find('#confirm_number').val();
                // console.log("验证码是否为空：",isNull(confirmNumber))
                // if (isNull(confirmNumber)) {
                //     tips("SORRY,删除任务时必须输入验证码!","danger")
                //     dialog.close();
                //     return false
                // };
                // ozhuan_ajax_db("delTask",[username,appid,confirmNumber],function(data){
                ozhuan_ajax_db("delTask",[username,appid],function(data){
                    if (data["result"]) {
                        tips("恭喜,删除任务成功！","success",goTaskManagePage)
                    }else{
                        tips(data["message"],"danger",goTaskManagePage);
                    };
                })
                dialog.close();
            }
        }]
    });
}

$(document).ready(function() {

    //已发布任务列表
    $("#plublishTaskPage").bootpag({
        total: 0,
        page: 1,
        maxVisible: 10
    }).on("page", function(event, page) {
        getPlublishTaskBreif(page);
    });

    $("#getPlublishTaskBreif").on("click", function() {
        var page = $('#plublishTaskPage').bootpag().find(".disabled").attr("data-lp");
        if (page == undefined) page = 1;
        getPlublishTaskBreif(page);
        return false;
    })
    $("#getPlublishTaskBreif").click();

    // 同步
    $("#tongBuBtn").on("click",function(){
        tips("暂不支持此功能！","warning")
    })
});