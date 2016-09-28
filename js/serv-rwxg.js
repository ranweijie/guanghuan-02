function resetTask(){
    var searchStrObj = query();
    var appid = searchStrObj
    window.location.href = "/taskManage/rwxg?rwid=" + appid;
}

function showNewTaskDetail(){
    var newAppid = $.trim($("#appid").val());
    window.location.href = "/taskManage/rwxg?rwid=" + newAppid;
}
/*************************获取当前任务详情数据data********************/
function getOldTaskDetail(appid){
    ozhuan_ajax_db("getCanModifyTaskDetail",appid,function(data){
        if (data["result"]) {
            var fieldArr = data["fieldName"];
            var fieldLen = fieldArr.length;
            var data = data["ret_data"];
            var isRequiredObj = {"required_yes":"必填","required_no":"选填"}
            // console.log("==任务详情字段==",fieldArr)
            $.getJSON("/json/taskcfg.json",function(taskdata){
                var tbody = $("<tbody id='taskDetailList'></tbody>");
                for (var i = 0; i < data.length; i++) {
                    var tr = $('<tr></tr>');
                    var fieldName = fieldArr[i];
                    //序号
                    tr.append('<td>' + (i+1) + '</td>');
                    //字段名
                    tr.append('<td>' + fieldName + '</td>');
                    //字段含义
                    tr.append('<td>' + taskdata[fieldName][0] + '</td>');
                    //字段值 
                    // tr.append('<td> <input type="text" class="rwxg-item" id="'+fieldName+'" value = "' + data[i][fieldName] + '\"> </td>'); 
                    setFieldValue(tr,i,data,fieldName,taskdata);
                    //是否必填
                    if (taskdata[fieldName][1] =="required_yes") {
                        tr.append('<td> <span style="color:red;">' + isRequiredObj[taskdata[fieldName][1]] + '</span> </td>'); 
                    }else if(taskdata[fieldName][1] =="required_no"){
                        tr.append('<td>' + isRequiredObj[taskdata[fieldName][1]] + '</td>'); 
                    }else{
                        tr.append('<td>taskcfg.json错误</td>');
                    }
                    //提示信息
                    tr.append('<td id="'+fieldName+'_tips">' + taskdata[fieldName][3] + '</td>');
                    tbody.append(tr);
                }
                $("#taskDetailList").replaceWith(tbody);
                //日期插件
                $('#starttimestamp,#endtimestamp,#displaystarttimestamp,#displayendtimestamp').datetimepicker({
                    language: 'zh-CN',
                    autoclose: 1,
                    todayBtn: true,
                    pickerPosition: "bottom-left",
                    pickTime: true,
                    hourStep: 1,
                    minuteStep: 5,
                    secondStep: 30,
                    format: 'yyyy-mm-dd hh:ii'
                });
                setQianZhiTaskStatus()
                // 底部按钮显示
                $("#bottom_btns").css("display","block");

                // 数据重复验证
                // var cfg_data = {};
                $("#appid").blur(function(){
                    var value = $.trim($("#appid").val())
                    var cfg_data = {};
                    $.getJSON("/json/taskcfg.json",function(cfgdata){
                        for (var key in cfgdata){
                            if (cfgdata[key][2]=="modify_yes") {
                                cfg_data[key] = cfgdata[key]
                            };
                        }
                        // console.log("11111111111",cfg_data)
                        isNoRepeatFieldOK("appid",value,cfg_data)
                    })
                });
                // 设置一个默认获得焦点
                $("#sortid").focus();
            })
        }else{
            var tbody = $("<tbody id='taskDetailList'></tbody>");
            tbody.append("<tr align='center'> <td colspan='6'> <span style='color:#cd54f6;'><b>"+data["message"]+"</b></span></td></tr>")
            $("#taskDetailList").replaceWith(tbody);
        }
    })
}

function setQianZhiTaskStatus(){
    var isHaveQianZhiTask = $("input[name='demandtype']:checked").val();
    var qzrwIdObj = $("#demandparam");
    if (isHaveQianZhiTask == "0") {
        qzrwIdObj.attr("title","当前无前置条件,不可设置前置任务id")
        qzrwIdObj.attr("disabled",true)
    }else if (isHaveQianZhiTask == "1") {
        qzrwIdObj.attr("title","点击修改或设置前置任务id")
        qzrwIdObj.attr("disabled",false)
    };
}
//radio input
var radioInputData = {
    "dormant":{"true":"休眠","false":"未休眠"},
    "activity":{"true":"激活","false":"未激活"},
    "display":{"true":"显示","false":"不显示"},
    "isfreeapp":{"true":"免费","false":"付费"},
    "demandtype":{"0":"无前置条件","1":"有前置条件"},
    "type":{"0":"普通任务","1":"专属任务","2":"系统任务"},
}
//checkbox input
var checkboxInputData = {
    "deviceplatformtype":{"1":"IPhone","2":"IPad"},
}

//日期选择input
var timeInputData = {
    "starttimestamp":"test",
    "endtimestamp":"test",
    "displaystarttimestamp":"test",
    "displayendtimestamp":"test",
}

// start datatime input
var startTimeInputData = {
    "starttimestamp":"test",
    "displaystarttimestamp":"test",
}
// end datatime input
var endTimeInputData = {
    "endtimestamp":["starttimestamp"],
    "displayendtimestamp":["displaystarttimestamp"],
}

// 数据重复验证
var noRepeatInputData = {
    "appid":"test",
}

//number inpout
var numberInputData ={
    "sortid":"test","demandparam":"test","putinamount":"test","putoutamount":"test","reward":"test",
    "appid":"test","deadlinetimelong":"test","paymoney":"test"
}

/**********正确显示当前任务详情数据***********/
function setFieldValue(tr,field_index,db_data,field_name,cfg_data){
    // console.log("当前字段:",field_name,",能修改标志:",cfg_data[field_name][2])
    var tdStr = "<td> ";
    var inputStr =""

    var inputType = "text";
    var inputClassName = "form-control";
    var inputID = String(field_name);
    var inputTitle = "点击修改" + cfg_data[field_name][0];
    var inputValue = db_data[field_index][field_name];
    var isDisabledStr = "";

    var hiddenInputStr = "<input type=\"hidden\" id=\"is_"+inputID+"_ok\" name=\"is_"+inputID+"_ok\"  value=\"\">"

    //是否可修改
    if (cfg_data[field_name][2] =="modify_no" || field_name=="subtype") {
        console.log("不可修改字段:",field_name)
        inputTitle = "不可修改" + cfg_data[field_name][0];
        isDisabledStr = " disabled ";
    };

    // 单选按钮字段处理
    if (String(field_name) in radioInputData) {
        var onclickStr = " onclick=\"setQianZhiTaskStatus()\" "
        inputType = "radio"
        inputClassName = "rwgl-radio-input";
        labelClassName = "rwgl-radio-label";
        for (var key in radioInputData[field_name]){
            var radioInputID = inputID +"_"+ key;
            var labelStr = "<label class=\""+ labelClassName +"\" for=\""+ radioInputID +"\">" + radioInputData[field_name][key] + "</label>";
            inputStr += labelStr;
            inputStr += "<input type=\""+ inputType +"\" class=\""+inputClassName+"\" name=\""+ field_name +"\"  id=\""+radioInputID+"\" title=\""+ inputTitle +"\" value=\"" + key +"\"" +isDisabledStr;
            // console.log("key值:",key,"key类型:",typeof(key),";DB值:",db_data[field_index][field_name],"DB值类型:",typeof(db_data[field_index][field_name]));
            // console.log("key值和String(DB值)是否相等：",key == String(db_data[field_index][field_name]))
            if (key == String(inputValue)) {
                inputStr += " checked "
            };
            // 前置条件类型点击事件
            if (field_name == "demandtype") {
                inputStr += onclickStr;
            };
            inputStr += ">"
        }

    // 复选按钮字段处理
    }else if (String(field_name) in checkboxInputData) {
        inputType = "checkbox"
        inputClassName = "rwgl-radio-input";
        labelClassName = "rwgl-radio-label";
        for (var key in checkboxInputData[field_name]){
            var checkboxInputID = inputID +"_"+ key;
            var labelStr = "<label class=\""+ labelClassName +"\" for=\""+ checkboxInputID +"\">" + checkboxInputData[field_name][key] + "</label>";
            inputStr += labelStr;
            inputStr += "<input type=\""+ inputType +"\" class=\""+inputClassName+"\" name=\""+ field_name +"\"  id=\""+checkboxInputID+"\" title=\""+ inputTitle +"\" value=\"" + key +"\"" +isDisabledStr;
            if (key == String(inputValue)  || String(inputValue) == "3") {
                inputStr += " checked "
            };
            inputStr += ">"
        }

    // 文本域字段处理
    }else if (String(field_name)=="desc") {
        inputStr = "<textarea class=\""+ inputClassName +"\" id=\""+inputID+"\" name=\""+ inputID +"\" title=\""+inputTitle+"\"" +isDisabledStr +">"+ inputValue +"</textarea>"; 
    }else if (String(field_name) in numberInputData) {
        inputType = "number";
        inputStr = "<input type=\""+inputType+"\" class=\""+ inputClassName +"\" id=\""+inputID+"\" name=\""+ inputID +"\" title=\""+inputTitle+"\" value=\"" + inputValue +"\"" +isDisabledStr +">";
    }else{
        inputStr = "<input type=\""+inputType+"\" class=\""+ inputClassName +"\" id=\""+inputID+"\" name=\""+ inputID +"\" title=\""+inputTitle+"\" value=\"" + inputValue +"\"" +isDisabledStr +">";
    };

    // hidden input 处理
    if (String(field_name) in noRepeatInputData) {
        inputStr += hiddenInputStr
    }

    tdStr += inputStr;
    tdStr += " </td>";
    tr.append(tdStr); 
}


/**************************修改任务详情*********************************/
function modifyTaskDetail(){
    var cfg_data = {};
    $.getJSON("/json/taskcfg.json",function(cfgdata){
        for (var key in cfgdata){
            if (cfgdata[key][2]=="modify_yes") {
                cfg_data[key] = cfgdata[key]
            };
        }
        modifyDbTaskDetail(cfg_data)
    })
}


function modifyDbTaskDetail(cfg_data){
    // 可修改字段
    var canModifyFieldName = []
    for (var cfg_key in cfg_data){
        canModifyFieldName.push(cfg_key)
    }
    console.log("==打印==可修改字段:",canModifyFieldName)

    // 数据检查
    var checkRes = checkTaskData(cfg_data)
    console.log("数据检查结果：",checkRes,",!res:",!checkRes)

    if (!checkRes) {
        tips("SORRY,任务数据有误,请更正后再提交！！","warning")
        return false
    };

    var searchStrObj = query();
    var appid = searchStrObj["rwid"];
    var username = $.trim($("#curr-user").text());
    var taskInfo = {}
    console.log("任务id==",appid,"操作用户名:",username)
    
    for (var i in canModifyFieldName){
        var key = canModifyFieldName[i];
        var value = "";
        if (key in radioInputData) {
            value = $('input[name="'+key+'"]:checked').val()
        }else if(key in timeInputData){
            value = $.trim($("#"+key).val()) 
            value = getTimestamp(value)
        }else if(key in numberInputData){
            value = $.trim($("#"+key).val()) 
            value = Number(value)
        }else if(key =="subtaskidlist"){
            value = $.trim($("#"+key).val()) 
            value = value.split(",")
        }else if (key =="deviceplatformtype") {
            value = []
            $("input[name='deviceplatformtype']:checked").each(function(){ 
                value.push(Number($(this).val()))
            })
        }else{
            value = $.trim($("#"+key).val()) 
        }
        taskInfo[key] = value;
    }
    console.log("投放平台：",taskInfo["deviceplatformtype"],typeof(taskInfo["deviceplatformtype"]))
    console.log("更改后的任务详情:",taskInfo,typeof(taskInfo))
    // return
    ozhuan_ajax_db("modifyTaskDetail",[username,appid,taskInfo],function(data){
        if(data["result"]){
            // tips("修改任务成功","success");
            tips("修改任务成功","success",showNewTaskDetail);
        }else{
            tips(data["message"],"danger");
        }
    })
}

function checkTaskData(cfg_data){
    console.log("cfg_data数据：",cfg_data)
    var checkRes = true;
    var value
    for (var key in cfg_data) {
        // 获取值
        if (key in radioInputData) {
            value = $('input[name="'+key+'"]:checked').val()
        }else if(key =="subtaskidlist"){
            value = []
        }else if (key =="deviceplatformtype") {
            value = []
            $("input[name='deviceplatformtype']:checked").each(function(){ 
                value.push(Number($(this).val()))
            })
        }else{
            value = $.trim($("#"+key).val()) 
        }
        // console.log("key：",key,"，value：",value)
        var tipsObj = $("#"+key+"_tips")
        
        //判断值是否OK
        // 是否为空
        if (isTaskDataItemNull(key,value,cfg_data)){checkRes = false}

        // 开始时间是否OK
        // if (key in startTimeInputData){
        //     if (!isStartTimeOK(key,value)) {
        //         checkRes = false
        //     }; 
        // }

        // 结束时间是否OK
        /*if (key in endTimeInputData){
            var startKey = endTimeInputData[key][0];
            var startValue = $.trim($("#"+startKey).val())
            // console.log("结束时间验证：","startKey==",startKey,"key:",key,"value:",value)
            if (isStartTimeOK(startKey,startValue)) {
                // console.log("为空否：",!isTaskDataItemNull(key,value))
                if(!isTaskDataItemNull(key,value)){
                    var startTimestamp = Date.parse(startValue)
                    var endtimestamp = Date.parse(value)
                    // console.log("startTimestamp:",startTimestamp,"endtimestamp:",endtimestamp)
                    // console.log("大小比较：",endtimestamp < startTimestamp)
                    if (endtimestamp < startTimestamp) {
                        var tipsStr = taskCfgData[key][0]+"不能晚于"+taskCfgData[startKey][0];
                        tipsObj.html(tipsStr);
                        tipsObj.css("color","red");
                        checkRes = false;
                    }else{
                        var tipsStr = taskCfgData[key][0]+"设置OK";
                        tipsObj.html(tipsStr);
                        tipsObj.css("color","#449d44");
                    };
                }
            };
        }*/
        // 投放平台是否设置OK
        if (key =="deviceplatformtype") {
            if (value.length == 0) {
                tipsObj.html("投放平台至少选择一种");
                tipsObj.css("color","red");
                checkRes = false;  
            }else{
                tipsObj.html("投放平台设置OK");
                tipsObj.css("color","#449d44");
            };
        };

        // 数据库查重字段是否OK
        if (key in noRepeatInputData) {
            console.log("key:",key,",value:",value)
            var fieldStatus = $("input[name='is_"+key+"_ok']").val()
            console.log(key,"对应隐藏input的值：",fieldStatus,",类型：",typeof(fieldStatus))
            var tipsObj = $("#"+key+"_tips")
            if (fieldStatus == "0") {
                tipsObj.html(key+"不能为空");
                tipsObj.css("color","red");
                checkRes = false; 
            }else if (fieldStatus == "1") {
                tipsObj.html("<b>**重复!! 已存在该"+key+"**</b>");
                tipsObj.css("color","red");
                checkRes = false; 
            }else if (fieldStatus == "2") {
                tipsObj.html(key+"设置OK");
                tipsObj.css("color","#449d44");
            }else if (fieldStatus == "3") {
                tipsObj.html("OK,没有修改" + key);
                tipsObj.css("color","#449d44");
            }
        }
    }
    return checkRes;
}

// 是否为空
function isTaskDataItemNull(key,value,taskCfgData){
    // console.log("111isTaskDataItemNull--taskCfgData",taskCfgData)
    var tipsObj = $("#"+key+"_tips")
    var checkRes = false;
    if (isNull(value)){
        if (taskCfgData[key][1] == "required_yes") {
            var tipsStr = taskCfgData[key][0] + "不能为空！"
            tipsObj.html(tipsStr);
            tipsObj.css("color","red");
            checkRes = true;
        }else{
            var tipsStr = "OK,未设置"+taskCfgData[key][0]
            tipsObj.html(tipsStr);
            tipsObj.css("color","#449d44");
        };
    }else{
        var tipsStr = taskCfgData[key][0] + "设置OK"
        tipsObj.html(tipsStr);
        tipsObj.css("color","#449d44");
    }
    return checkRes;
}
// 数据库重复验证
function isNoRepeatFieldOK(key,value,cfgData){
    // console.log("111isNoRepeatFieldOK--cfgData",cfgData)
    // console.log("!isTaskDataItemNull(key,value)==>",!isTaskDataItemNull(key,value))
    var isFieldOKInput = $("input[name='is_"+key+"_ok']")
    var tipsObj = $("#"+key+"_tips")

    var searchStrObj = query();
    var oldAppid = searchStrObj["rwid"]

    if (key =="appid") {
        if (value == oldAppid) {
            console.log("没有修改任务id")
            isFieldOKInput.val("3")
            tipsObj.html("OK,没有修改任务id")
            tipsObj.css("color","#449d44");
            return
        };
    };
    if (!isTaskDataItemNull(key,value,cfgData)) {
        ozhuan_ajax_db("isNoRepeatFieldOK",[key,value],function(data){
            if (data["result"]) {
                isFieldOKInput.val("2")
                tipsObj.html(key+"设置OK")
                tipsObj.css("color","#449d44");
            }else{
                isFieldOKInput.val("1")
                tipsObj.html("<b>**重复!! 已存在该"+key+"**</b>");
                tipsObj.css("color","red");
            }
        })
    }else{
        isFieldOKInput.val("0");
        tipsObj.html(key+"不能为空");
        tipsObj.css("color","red");
    };
}

$(document).ready(function() {

    $("#getOldTaskDetail").on("click", function() {
        var searchStrObj = query();
        var appid = searchStrObj["rwid"]
        // console.log("==即将修改的任务id==",appid)
        getOldTaskDetail(appid)
    })
    $("#getOldTaskDetail").click();

    $("#commit-xiugai-task,#commit_xiugai_task_bottom").on("click", function() {
        modifyTaskDetail()
    })
});