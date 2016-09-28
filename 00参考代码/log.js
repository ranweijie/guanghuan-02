function get_date_str(){
    var now_date = new Date();
    //var nian = now_date.getFullYear().toString().slice(2)
    var nian = now_date.getFullYear().toString()
    var yue = now_date.getMonth();
    var yue = yue < 10 ? "0"+yue : yue.toString();
    var ri = now_date.getDate();
    var ri = ri < 10 ? "0"+ri : ri.toString();
    var shi = now_date.getHours();
    var shi = shi < 10 ? "0"+shi : shi.toString();
    var fen = now_date.getMinutes();
    var fen = fen < 10 ? "0"+fen : fen.toString();
    var miao = now_date.getSeconds();
    var miao = miao < 10 ? "0"+miao : miao.toString();
    var date_str = nian+yue+ri+shi+fen+miao;
    return date_str;
}

var condition = {}
//玩家注册日志
function view_reg_log(page) {
    condition["serv_id"] =$("#serv_id1").val();
    condition["player_name"] =$.trim($("#player_name1").val());
    condition["start_date"] = $('#daterange_reg1').data('daterangepicker').startDate.format("YYYY-MM-DD hh:mm:ss");
    condition["end_date"] = $('#daterange_reg1').data('daterangepicker').endDate.format("YYYY-MM-DD hh:mm:ss");
    jyzz_ajax_setting("view_reg_log", [condition, page],
        function(data) {
            $('#RegLogPage').bootpag({
                total:data["total"]==0?1:data["total"],
                page: page,
                maxVisible: 10
            });

            if (data["total"] == 0) {
                var tbody = $("<tbody id='RegLogList'></tbody>");
                tbody.append("<tr> <td  colspan='5' style='text-align:center'> <span style='color:#cd54f6;'><b>没有"+condition["player_name"] +"相关的注册记录</b></span> </td></tr>")
                $("#RegLogList").replaceWith(tbody);
                $("#RegLogFooter").hide()
                tips("暂无玩家注册日志", "warning");
                return;
            }
            data = data["data"];
            $("#RegLogFooter").show()
            var tbody = $("<tbody id='RegLogList'></tbody>");
            for (var i = 0; i < data.length; i++) {
                var tr = $('<tr></tr>');
                tr.append('<td style="text-align:center">' + data[i][0] + '</td>');
                tr.append('<td style="text-align:center">' + data[i][1] + '</td>');
                tr.append('<td style="padding-left:30px;width:25%">' + data[i][2] + '</td>');
                tr.append('<td style="text-align:center">' + data[i][3] + '</td>');
                tr.append('<td style="text-align:center">' + data[i][4] + '</td>');
                tbody.append(tr);
            }
            $("#RegLogList").replaceWith(tbody);
        });
}
function download_reg_log(){
    condition["serv_id"] =$("#serv_id1").val();
    condition["player_name"] =$.trim($("#player_name1").val());
    condition["start_date"] = $('#daterange_reg1').data('daterangepicker').startDate.format("YYYY-MM-DD hh:mm:ss");
    condition["end_date"] = $('#daterange_reg1').data('daterangepicker').endDate.format("YYYY-MM-DD hh:mm:ss");
    jyzz_ajax_setting("download_reg_log", [condition],
        function(data) {
            var fileName ="zhuce"+get_date_str()+".csv";
            var byteCharacters = atob(data["data"]);
            var byteNumbers = new Array(byteCharacters.length);
            for (var i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            var byteArray = new Uint8Array(byteNumbers);
            var blob = new Blob([byteArray], {
                type: "text/plain;charset=utf-8"
            });
            saveAs(blob, fileName);
    });
}
//玩家登录日志
function view_player_login_log(page) {
    condition["serv_id"] =$("#serv_id2").val();
    condition["player_name"] =$.trim($("#player_name2").val());
    condition["start_date"] = $('#daterange_reg2').data('daterangepicker').startDate.format("YYYY-MM-DD hh:mm:ss");
    condition["end_date"] = $('#daterange_reg2').data('daterangepicker').endDate.format("YYYY-MM-DD hh:mm:ss");
    jyzz_ajax_setting("view_player_login_log", [condition, page],
        function(data) {
            $('#PlayerLoginLogPage').bootpag({
                total:data["total"]==0?1:data["total"],
                page: page,
                maxVisible: 10
            });

            if (data["total"] == 0) {
                var tbody = $("<tbody id='PlayerLoginLogList'></tbody>");
                tbody.append("<tr> <td  colspan='6' style='text-align:center'> 暂无玩家注册日志 </td></tr>")
                $("#PlayerLoginLogList").replaceWith(tbody);

                tips("暂无玩家登录日志", "warning");
                return;
            }
            data = data["data"];
            var tbody = $("<tbody id='PlayerLoginLogList'></tbody>");
            for (var i = 0; i < data.length; i++) {
                var tr = $('<tr></tr>');
				for (var j = 0; j < data[i].length; j++){
					tr.append('<td style="text-align:center">' + data[i][j] + '</td>');}
                tbody.append(tr);
            }
            $("#PlayerLoginLogList").replaceWith(tbody);
        });
}

//每日新/老玩家人数查询
function view_daily_count(page) {
    condition["serv_id"] =$("#serv_id3").val();
    condition["start_date"] = $('#daterange_reg3').data('daterangepicker').startDate.format("YYYY-MM-DD hh:mm:ss");
    condition["end_date"] = $('#daterange_reg3').data('daterangepicker').endDate.format("YYYY-MM-DD hh:mm:ss");
    jyzz_ajax_setting("view_daily_count", [condition, page],
        function(data) {
            $('#DailyCountPage').bootpag({
                total:data["total"],
                page: page,
                maxVisible: 10
            });

            if (data["total"] == 0) {
                var tbody = $("<tbody id='DailyCountList'></tbody>");
                tbody.append("<tr> <td  colspan='5' style='text-align:center'> 暂无每日玩家人数记录 </td></tr>")
                $("#DailyCountList").replaceWith(tbody);

                tips("暂无每日玩家人数记录", "warning");
                return;
            }
            data = data["data"];
            var tbody = $("<tbody id='DailyCountList'></tbody>");
            for (var i = 0; i < data.length; i++) {
                var tr = $('<tr></tr>');
				for (var j = 0; j < data[i].length; j++){
					tr.append('<td style="text-align:center">' + data[i][j] + '</td>');}
                tbody.append(tr);
            }
            $("#DailyCountList").replaceWith(tbody);
        });
}
//产出物品查询
function view_add_item_log(page) {
    condition["serv_id"] =$("#serv_id4").val();
    condition["item_type"] =$("#item_type4").val();
    condition["start_date"] = $('#daterange_reg4').data('daterangepicker').startDate.format("YYYY-MM-DD hh:mm:ss");
    condition["end_date"] = $('#daterange_reg4').data('daterangepicker').endDate.format("YYYY-MM-DD hh:mm:ss");
    jyzz_ajax_setting("view_add_item_log", [condition, page],
        function(data) {
            $('#AddItemLogPage').bootpag({
                total:data["total"],
                page: page,
                maxVisible: 10
            });

            if (data["total"] == 0) {
                var tbody = $("<tbody id='AddItemLogList'></tbody>");
                tbody.append("<tr> <td  colspan='5' style='text-align:center'> 暂无产出物品记录 </td></tr>")
                $("#AddItemLogList").replaceWith(tbody);

                tips("暂无产出物品记录", "warning");
                return;
            }
            data = data["data"];
            var tbody = $("<tbody id='AddItemLogList'></tbody>");
            for (var i = 0; i < data.length; i++) {
                var tr = $('<tr></tr>');
				for (var j = 0; j < data[i].length; j++){
					tr.append('<td style="text-align:center">' + data[i][j] + '</td>');}
                tbody.append(tr);
            }
            $("#AddItemLogList").replaceWith(tbody);
        });
}


//Log下载 add by ran 15/10/27

function Download1() {  
    condition["player_name"] =$("#player_name").val() ? $("#player_name").val():"";
    condition["event_type"] = $("#event_type").val()? $("#event_type").val():"";
    condition["log_type"] = $("#log_type").val()? $("#log_type").val():"";
    condition["data1"] = $("#data1").val()? $("#data1").val():"";
    jyzz_ajax_setting("logListDownload", [condition],
        function(data) {
            var byteCharacters = atob(data["data"]);
            var byteNumbers = new Array(byteCharacters.length);
            for (var i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            var byteArray = new Uint8Array(byteNumbers);
            var blob = new Blob([byteArray], {
                type: "text/plain;charset=utf-8"
            });
            saveAs(blob, "logList.csv");
        });
}


$(document).ready(
    function() {
        //alert(get_date_str())
        //日期插件
        $('#daterange_reg,#daterange_reg1,#daterange_reg2,#daterange_reg3,#daterange_reg4').daterangepicker({
            locale: {
                applyLabel: '确定',
                cancelLabel: '关闭',
                fromLabel: '从',
                toLabel: '到',
                customRangeLabel: '自定义',
                daysOfWeek: "日_一_二_三_四_五_六".split("_"),
                monthNames: "1月_2月_3月_4月_5月_6月_7月_8月_9月_10月_11月_12月".split("_"),
                firstDay: 1,
            },
            format: 'YYYY/M/D',
            opens: 'left',
            applyClass: 'btn-primary',
            ranges: {
                '今天': [moment(), moment()],
                '昨天': [moment().subtract('days', 1), moment().subtract('days', 1)],
                '最近一周': [moment().subtract('days', 6), moment()],
                '最近一月': [moment().subtract('days', 29), moment()],
                '本月': [moment().startOf('month'), moment().endOf('month')],
                '上月': [moment().subtract('month', 1).startOf('month'), moment().subtract('month', 1).endOf('month')],
                '全部': ['2014-09-15', moment()],
            },
            minDate: '2014-09-15',
            maxDate: moment(),
            startDate: '2014-09-15',
            endDate: moment()
        },
        function(start, end) {
            $('#daterange_reg,#daterange_reg1,#daterange_reg2,#daterange_reg3,#daterange_reg4').val(start.format("YYYY年MM月DD日") + ' - ' + end.format("YYYY年MM月DD日"));
        });
        $('#daterange_reg,#daterange_reg1,#daterange_reg2,#daterange_reg3,#daterange_reg4').data('daterangepicker').notify();

        //服务器基本信息查询
        settingbind("view_server_info", function(data) {
            data = data["data"];
            if (data["total"] == 0) {
                var tbody = $("<tbody id='logList'></tbody>");
                $("#logList").replaceWith(tbody);
                tips("暂无服务器信息", "danger");
                return;
            }
            var tbody = $("<tbody id='ServerInfoList'></tbody>");
            for (var i = 0; i < data.length; i++) {
                var tr = $('<tr></tr>');
				for (var j = 0; j < data[i].length; j++){
					tr.append('<td style="text-align:center">' + data[i][j] + '</td>');}
                tbody.append(tr);
            }
            $("#ServerInfoList").replaceWith(tbody);
        }, function() {
            return [$('#serv_id0').val()];
        })
        //$("#view_server_info").click();

        //玩家注册信息查询
        $("#RegLogPage").bootpag({
            total: 0,
            page: 1,
            maxVisible: 10
        }).on("page", function(event, page) {
            view_reg_log(page);
        });

        $("#view_reg_log").on("click", function() {
            var page = $('#RegLogPage').bootpag().find(".disabled").attr("data-lp");
            if (page == undefined) page = 1;
            view_reg_log(page);
            return false;
        })
        //玩家注册信息下载
        $("#DownloadRegLog").click(function() {
            
            if ($("#serv_id1").val() == -1){
                BootstrapDialog.show({
                    type: BootstrapDialog.TYPE_INFO,
                    title: '提示',
                    message: '您当前要下载所有服务器的注册信息，这可能需要较长时间，确定要继续下载吗？',
                    buttons: [{
                        label: '取消',
                        action: function(dialog) {
                            dialog.close();
                        },
                    }, {
                        label: '确定',
                        cssClass: 'btn-primary',
                        action: function(dialog) {
                            dialog.close();
                            download_reg_log();}
                    }]
                });}
            else{
                download_reg_log();}
        });
        
        //玩家登录信息
        $("#PlayerLoginLogPage").bootpag({
            total: 0,
            page: 1,
            maxVisible: 10
        }).on("page", function(event, page) {
            view_player_login_log(page);
        });

        $("#view_player_login_log").on("click", function() {
            var page = $('#PlayerLoginLogPage').bootpag().find(".disabled").attr("data-lp");
            if (page == undefined) page = 1;
            view_player_login_log(page);
            return false;
        })

        //每日新/老玩家查询
        $("#DailyCountPage").bootpag({
            total: 0,
            page: 1,
            maxVisible: 10
        }).on("page", function(event, page) {
            view_daily_count(page);
        });

        $("#view_daily_count").on("click", function() {
            var page = $('#DailyCountPage').bootpag().find(".disabled").attr("data-lp");
            if (page == undefined) page = 1;
            view_daily_count(page);
            return false;
        })
        //产出物品查询
        $("#AddItemLogPage").bootpag({
            total: 0,
            page: 1,
            maxVisible: 10
        }).on("page", function(event, page) {
            view_add_item_log(page);
        });

        $("#view_add_item_log").on("click", function() {
            var page = $('#AddItemLogPage').bootpag().find(".disabled").attr("data-lp");
            if (page == undefined) page = 1;
            view_add_item_log(page);
            return false;
        })
        //bind_enter("role", "search");
        //bind_enter("role2", "search2");

});