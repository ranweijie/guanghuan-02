
function getTaskDetail(appid){
    ozhuan_ajax_db("getTaskDetail",appid,function(data){
        // console.log(JSON.stringify(data));
        if (data["result"]) {
            var fildArr = data["fieldName"];
            var fildLen = fildArr.length;
            var data = data["ret_data"];
            var needChangeData = {
                "type":{"0":"普通任务","1":"专属任务","2":"系统任务"},
                "demandtype":{"0":"无前置条件","1":"有前置条件"},
                "dormant":{"true":"休眠","false":"未休眠"},
                "activity":{"true":"激活","false":"未激活"},
                "display":{"true":"显示","false":"不显示"},
                "isfreeapp":{"true":"免费","false":"付费"},
                "deviceplatformtype":{"1":"IPhone","2":"IPad","3":"IPhone和IPad"},
            }
            // console.log("==任务详情字段==",fildArr)
            $.getJSON("/json/taskcfg.json",function(taskcfgdata){

                var tbody = $("<tbody id='taskDetailList'></tbody>");
                for (var i = 0; i < data.length; i++) {
                    var tr = $('<tr align="center"></tr>');
                    var fildName = fildArr[i];
                    //序号
                    tr.append('<td>' + (i+1) + '</td>');
                    //字段名
                    tr.append('<td>' + fildName + '</td>');
                    //字段含义
                    tr.append('<td>' + taskcfgdata[fildName][0] + '</td>');
                    //字段值
                    if (String(data[i][fildName]) =="") {
                        tr.append('<td>未设置(空字符)</td>');  
                    }else{
                        if (fildName in needChangeData){
                            tr.append('<td>' + needChangeData[fildName][String(data[i][fildName])] + '</td>');  
                        }else{
                            tr.append('<td>' + String(data[i][fildName]) + '</td>');  
                        }
                    };
                    tbody.append(tr);
                }
                $("#taskDetailList").replaceWith(tbody);
            })
        }else{
            var tbody = $("<tbody id='taskDetailList'></tbody>");
            tbody.append("<tr align='center'> <td colspan='4'> <span style='color:#cd54f6;'><b>"+data["message"]+"</b></span></td></tr>")
            $("#taskDetailList").replaceWith(tbody);
        }
    })
}

$(document).ready(function() {

    $("#getTaskDetail").on("click", function() {
        var searchStrObj = query();
        var appid = searchStrObj["rwid"]
        console.log("==所查询的任务id==",appid)
        getTaskDetail(appid)
    })
    $("#getTaskDetail").click();
});