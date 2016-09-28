function goTaskManagePage(){
    window.location.href = "/taskManage";
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

// radio input
var radioInputData = {
    "dormant":{"true":"休眠","false":"未休眠"},
    "activity":{"true":"激活","false":"未激活"},
    "display":{"true":"显示","false":"不显示"},
    "isfreeapp":{"true":"免费","false":"付费"},
    "demandtype":{"0":"无前置条件","1":"有前置条件"},
    "type":{"0":"普通任务","1":"专属任务","2":"系统任务"},
}
// checkbox input
var checkboxInputData = {
    "deviceplatformtype":{"1":"IPhone","2":"IPad"},
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
// number input
var numberInputData ={
    "sortid":"test","putinamount":"test","putoutamount":"test","reward":"test",
    "appid":"test","deadlinetimelong":"test","paymoney":"test"
}

// 数据重复验证
var noRepeatInputData = {
    "id":"test","bundleid":"test","appid":"test",
}

var taskCfgData = {
  "id"                      : ["ID",              "required_yes",   "modify_no",  "设定后不可更改"],
  "type"                    : ["任务类型",        "required_yes",   "modify_no",  "提示信息"],
  "subtype"                 : ["任务子类型",      "required_yes",   "modify_no",  "提示信息"],
  "sortid"                  : ["排序号",          "required_yes",   "modify_yes",  "提示信息"],
  "demandtype"              : ["前置条件类型",    "required_yes",   "modify_yes",  "提示信息"],
  "demandparam"             : ["前置任务ID",      "required_no",    "modify_yes",  "提示信息"],
  "dormant"                 : ["休眠状态",        "required_yes",   "modify_no",   "提示信息"],
  "starttimestamp"          : ["开始时间",        "required_yes",   "modify_yes",  "设置时不能早于当前时间"],
  "endtimestamp"            : ["截止时间",        "required_yes",   "modify_yes",  "设置时不能早于开始时间"],
  "activity"                : ["激活状态",        "required_yes",   "modify_no",  "提示信息"],
  "displaystarttimestamp"   : ["开始显示时间",    "required_yes",   "modify_yes",  "设置时不能早于当前时间"],
  "displayendtimestamp"     : ["结束显示时间",    "required_yes",   "modify_yes",  "设置时不能早于结束时间"],
  "display"                 : ["显示状态",        "required_yes",   "modify_no",  "提示信息"],
  "putinamount"             : ["投放份数",        "required_yes",   "modify_yes",  "提示信息"],
  "putoutamount"            : ["已发放份数",      "required_yes",   "modify_no",   "提示信息"],
  "icon"                    : ["应用图标",        "required_yes",   "modify_yes",  "提示信息"],
  "title"                   : ["应用标题",        "required_yes",   "modify_yes",  "提示信息"],
  "desc"                    : ["广告介绍",        "required_yes",   "modify_yes",  "提示信息"],
  "reward"                  : ["玩家奖励(分)",    "required_yes",   "modify_yes",  "提示信息"],
  "itunesaddr"              : ["iTunes地址",      "required_yes",   "modify_yes",  "提示信息"],
  "jumplink"                : ["跳转链接",        "required_yes",   "modify_yes",  "提示信息"],
  "searchkeyword"           : ["搜索关键词",      "required_yes",   "modify_yes",  "提示信息"],
  "isfreeapp"               : ["是否付费",        "required_yes",   "modify_yes",  "提示信息"],
  "appsize"                 : ["app大小",         "required_no",    "modify_yes",  "提示信息"],
  "bundleid"                : ["Bundle ID",       "required_yes",   "modify_yes",  "设定后不可更改"],
  "prjectname"              : ["Project Name",    "required_no",    "modify_yes",  "提示信息"],
  "appid"                   : ["appid",           "required_yes",   "modify_no",   "提示信息"],
  "deadlinetimelong"        : ["任务超时时间长",  "required_yes",   "modify_yes",  "提示信息"],
  "subtaskidlist"           : ["专属任务列表",    "required_no",   "modify_yes",  "提示信息"],
  "deviceplatformtype"      : ["投放平台",        "required_yes",   "modify_yes",  "提示信息"],
  "checkinstalledurl"       : ["去重复查询接口",  "required_no",    "modify_yes",  "广告主提供，无则不检测"],
  "startextensionnotifyurl" : ["开始推广通知接口","required_no",    "modify_yes",  "广告主提供，无则不通知"],
  "paymoney"                : ["客户付费额(分)",  "required_yes",   "modify_yes",  "提示信息"]
}

function checkTaskData(){
    var checkRes = true;
    var value
    for (var key in taskCfgData) {
        // var key = taskDataFieldArr[i];
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
        if (isTaskDataItemNull(key,value)){checkRes = false}

        // 开始时间是否OK
        if (key in startTimeInputData){
            if (!isStartTimeOK(key,value)) {
                checkRes = false
            }; 
        }

        // 结束时间是否OK
        if (key in endTimeInputData){
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
        }
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
            // console.log("key:",key,",value:",value)
            var fieldStatus = $("input[name='is_"+key+"_ok']").val()
            // console.log(key,"对应隐藏input的值：",fieldStatus,",类型：",typeof(fieldStatus))
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
            }
        }
    }
    return checkRes;
}

function isTaskDataItemNull(field,field_value){
    var checkRes = false;
    var key = field ,value = field_value
    if (isNull(value)){
        if (taskCfgData[key][1] == "required_yes") {
            var tipsStr = taskCfgData[key][0] + "不能为空！"
            $("#"+key+"_tips").html(tipsStr);
            $("#"+key+"_tips").css("color","red");
            checkRes = true;
        }else{
            var tipsStr = "OK,未设置"+taskCfgData[key][0]
            $("#"+key+"_tips").html(tipsStr);
            $("#"+key+"_tips").css("color","#449d44");
        };
    }else{
        var tipsStr = taskCfgData[key][0] + "设置OK"
        $("#"+key+"_tips").html(tipsStr);
        $("#"+key+"_tips").css("color","#449d44");
    }
    return checkRes;
}

function isStartTimeOK(field,field_value){
    var key = field ,value = field_value
    if (isTaskDataItemNull(key,value)){
        return false
    }else{
        var now = new Date();
        var startTime = $.trim($("#"+key).val())
        var startTimestamp = Date.parse(startTime)
        if (startTimestamp < now){
            var tipsStr = taskCfgData[key][0]+"不能早于当前时间";
            $("#"+key+"_tips").html(tipsStr);
            $("#"+key+"_tips").css("color","red");
            return false
        }else{
            return true
        }
    }
}


function isNoRepeatFieldOK(key,value){
    var isFieldOKInput = $("input[name='is_"+key+"_ok']")
    if (!isTaskDataItemNull(key,value)) {
        ozhuan_ajax_db("isNoRepeatFieldOK",[key,value],function(data){
            if (data["result"]) {
                isFieldOKInput.val("2");
                $("#"+key+"_tips").html(key+"设置OK");
                $("#"+key+"_tips").css("color","#449d44");
            }else{
                isFieldOKInput.val("1");
                $("#"+key+"_tips").html("<b>**重复!! 已存在该"+key+"**</b>");
                $("#"+key+"_tips").css("color","red");
            }
        })
    }else{
        isFieldOKInput.val("0");
        $("#"+key+"_tips").html(key+"不能为空");
        $("#"+key+"_tips").css("color","red");
    };
}

function addTask(){
    var fieldNameArr = []
    for (var task_cfg_key in taskCfgData){
        fieldNameArr.push(task_cfg_key)
    }
    var checkRes = checkTaskData()
    // console.log("==新增任务==字段:",fieldNameArr)
    // console.log("数据检查结果：",checkRes,",!res:",!checkRes)
    if (!checkRes) {
        tips("SORRY,任务数据有误,请更正后再提交！！","warning")
        return false
    };
    var username = $.trim($("#curr-user").text());
    var taskInfo = {}
    // console.log("操作用户名:",username)
    // return
    for (var i in fieldNameArr){
        var key = fieldNameArr[i];
        var value = "";
        if (key in radioInputData) {
            value = $('input[name="'+key+'"]:checked').val()
        }else if(key in startTimeInputData || key in endTimeInputData){
            value = $.trim($("#"+key).val())
            value = getTimestamp(value)
        }else if(key in numberInputData){
            value = $.trim($("#"+key).val()) 
            value = Number(value)
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
        taskInfo[key] = value;
    }
    // console.log("新增的任务详情:",taskInfo,typeof(taskInfo))
    // return 
    ozhuan_ajax_db("addTask",[username,taskInfo],function(data){
        if(data["result"]){
            tips("新增任务成功","success",goTaskManagePage)
        }else{
            tips(data["message"],"danger");
        }
    })
}
$(document).ready(function() {

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

    // 数据重复验证
    $("#id").blur(function(){
        var value = $.trim($("#id").val())
        isNoRepeatFieldOK("id",value)
    });
    $("#bundleid").blur(function(){
        var value = $.trim($("#bundleid").val())
        isNoRepeatFieldOK("bundleid",value)
    });
    $("#appid").blur(function(){
        var value = $.trim($("#appid").val())
        isNoRepeatFieldOK("appid",value)
    });

    //提交新增任务
    $("#commit_add_task_top,#commit_add_task_bottom").on("click", function() {
        addTask()
    })
});