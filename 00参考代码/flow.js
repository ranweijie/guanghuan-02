function check_user() {
    if ($("#username").attr("disabled") == "disabled") {
        tips("您还没有选择玩家账号", "warning");
        return false;
    }
    return true;
}

function check_user_and_role() {
    if ($("#username").attr("disabled") == "disabled" || $("#rolename").attr("disabled") == "disabled") {
        tips("您还没有选择玩家账号或角色", "warning");
        return false;
    }
    return true;
}
//玩家登录注销日志
function view_login_logout(page) {
    if (!check_user()) return false;

    jyzz_ajax_db("view_login_logout",[$("#username").val(), page,"log"],
        function(data) {
            var sumDuration = data["sum_duration"] ?data["sum_duration"]:0;
            $("#sumPlayerTime").html("<b>"+$("#username").val()+"</b>累计在线时间：<b>"+sumDuration+"</b>");
            $('#LoginLogoutPage').bootpag({
                total: data["total"],
                page: page,
                maxVisible: 5
            });
            if (data["total"] == 0) {
                var tbody = $("<tbody id='LoginLogoutList'></tbody>");
                $("#LoginLogoutList").replaceWith(tbody);
                tips("暂无"+$("#username").val()+"玩家的登录注销记录", "danger");
                return;
            }
            data = data["data"];
            var tbody = $("<tbody id='LoginLogoutList'></tbody>");
            for (var i = 0; i < data.length; i++) {
                var tr = $('<tr></tr>');
                tr.append('<td>' + data[i][0] + '</td>');
                tr.append('<td>' + data[i][1] + '</td>');
                tr.append('<td>' + data[i][2] + '</td>');
                tr.append('<td style="text-align:center">' + data[i][3] + '</td>');
                tbody.append(tr);
            }
            $("#LoginLogoutList").replaceWith(tbody);
        });
}
//玩家每日游戏时间日志
function view_role_duration(page) {
    if (!check_user()) return false;

    jyzz_ajax_db("view_role_duration", [$("#username").val(), page],
        function(data) {
            var sumDuration = data["sum_duration"] ?data["sum_duration"]:0;
            $("#sumRoleDuration").html("<b>"+$("#username").val()+"</b>累计游戏时长：<b>"+sumDuration+"</b>");
            $('#RoleDurationPage').bootpag({
                total: data["total"],
                page: page,
                maxVisible: 5
            });
            if (data["total"] == 0) {
                var tbody = $("<tbody id='RoleDurationList'></tbody>");
                $("#RoleDurationList").replaceWith(tbody);
                tips("暂无"+$("#username").val()+"玩家的每日游戏记录", "danger");
                return;
            }
            data = data["data"];
            var tbody = $("<tbody id='RoleDurationList'></tbody>");
            for (var i = 0; i < data.length; i++) {
                var tr = $('<tr></tr>');
                tr.append('<td style="text-align:center">' + data[i][0] + '</td>');
                tr.append('<td style="text-align:center">' + data[i][1] + '</td>');
                tr.append('<td style="text-align:center">' + data[i][2] + '</td>');
                tr.append('<td style="text-align:center">' + data[i][3] + '</td>');
                tbody.append(tr);
            }
            $("#RoleDurationList").replaceWith(tbody);
        });
}

//玩家经验流水
function view_exp_stat(page) {
    if (!check_user_and_role()) return false;

    jyzz_ajax_db("view_exp_stat", [$("#rolename").val(), page ,"log"],
        function(data) {
            $('#ExpStatPage').bootpag({
                total: data["total"],
                page: page,
                maxVisible: 5
            });

            if (data["total"] == 0) {
                var tbody = $("<tbody id='ExpStatList'></tbody>");
                $("#ExpStatList").replaceWith(tbody);

                tips("暂无"+$("#username").val()+"玩家的经验记录", "warning");
                return;
            }

            data = data["data"];
            var tbody = $("<tbody id='ExpStatList'></tbody>");
            for (var i = 0; i < data.length; i++) {
                var tr = $('<tr></tr>');
                tr.append('<td style="text-align:center">' + data[i][0] + '</td>');
                tr.append('<td style="text-align:center">' + data[i][1] + '</td>');
                tr.append('<td style="text-align:center">' + data[i][2] + '</td>');
                tbody.append(tr);
            }
            $("#ExpStatList").replaceWith(tbody);
        });
}
//玩家铜币日志
function view_copper_coin(page) {
    if (!check_user_and_role()) return false;

    jyzz_ajax_db("view_copper_coin", [$("#rolename").val(), page ,"log"],
        function(data) {
            $('#CopperCoinPage').bootpag({
                total: data["total"],
                page: page,
                maxVisible: 5
            });

            if (data["total"] == 0) {
                var tbody = $("<tbody id='CopperCoinList'></tbody>");
                $("#CopperCoinList").replaceWith(tbody);

                tips("暂无"+$("#username").val()+"玩家的铜币日志", "warning");
                return;
            }

            data = data["data"];
            var tbody = $("<tbody id='CopperCoinList'></tbody>");
            for (var i = 0; i < data.length; i++) {
                var tr = $('<tr></tr>');
                tr.append('<td style="text-align:center">' + data[i][0] + '</td>');
                tr.append('<td style="text-align:center">' + data[i][1] + '</td>');
                tr.append('<td style="text-align:center">' + data[i][2] + '</td>');
                tr.append('<td style="text-align:center">' + data[i][3] + '</td>');
                tr.append('<td style="text-align:center">' + data[i][4] + '</td>');
                tbody.append(tr);
            }
            $("#CopperCoinList").replaceWith(tbody);
        });
}
//玩家粮草日志
function view_forage(page) {
    if (!check_user_and_role()) return false;

    jyzz_ajax_db("view_forage", [$("#rolename").val(), page ,"log"],
        function(data) {
            $('#ForagePage').bootpag({
                total: data["total"],
                page: page,
                maxVisible: 5
            });

            if (data["total"] == 0) {
                var tbody = $("<tbody id='ForageList'></tbody>");
                $("#ForageList").replaceWith(tbody);

                tips("暂无"+$("#username").val()+"玩家的粮草日志", "warning");
                return;
            }

            data = data["data"];
            var tbody = $("<tbody id='ForageList'></tbody>");
            for (var i = 0; i < data.length; i++) {
                var tr = $('<tr></tr>');
                tr.append('<td style="text-align:center">' + data[i][0] + '</td>');
                tr.append('<td style="text-align:center">' + data[i][1] + '</td>');
                tr.append('<td style="text-align:center">' + data[i][2] + '</td>');
                tr.append('<td style="text-align:center">' + data[i][3] + '</td>');
                tr.append('<td style="text-align:center">' + data[i][4] + '</td>');
                tbody.append(tr);
            }
            $("#ForageList").replaceWith(tbody);
        });
}
//玩家矿石日志
function view_steel_stone(page) {
    if (!check_user_and_role()) return false;

    jyzz_ajax_db("view_steel_stone", [$("#rolename").val(), page ,"log"],
        function(data) {
            $('#SteelStonePage').bootpag({
                total: data["total"],
                page: page,
                maxVisible: 5
            });

            if (data["total"] == 0) {
                var tbody = $("<tbody id='SteelStoneList'></tbody>");
                $("#SteelStoneList").replaceWith(tbody);

                tips("暂无"+$("#username").val()+"玩家的矿石日志", "warning");
                return;
            }

            data = data["data"];
            var tbody = $("<tbody id='SteelStoneList'></tbody>");
            for (var i = 0; i < data.length; i++) {
                var tr = $('<tr></tr>');
                tr.append('<td style="text-align:center">' + data[i][0] + '</td>');
                tr.append('<td style="text-align:center">' + data[i][1] + '</td>');
                tr.append('<td style="text-align:center">' + data[i][2] + '</td>');
                tr.append('<td style="text-align:center">' + data[i][3] + '</td>');
                tr.append('<td style="text-align:center">' + data[i][4] + '</td>');
                tbody.append(tr);
            }
            $("#SteelStoneList").replaceWith(tbody);
        });
}
//玩家获得道具日志
function view_add_sub_prop(page) {
    if (!check_user_and_role()) return false;

    jyzz_ajax_db("view_add_sub_prop", [$("#rolename").val(), page ,"log"],
        function(data) {
            $('#AddSubPropPage').bootpag({
                total: data["total"],
                page: page,
                maxVisible: 5
            });

            if (data["total"] == 0) {
                var tbody = $("<tbody id='AddSubPropList'></tbody>");
                $("#AddSubPropList").replaceWith(tbody);

                tips("暂无"+$("#username").val()+"玩家的获得&使用道具日志", "warning");
                return;
            }

            data = data["data"];
            var tbody = $("<tbody id='AddSubPropList'></tbody>");
            for (var i = 0; i < data.length; i++) {
                var tr = $('<tr></tr>');
                tr.append('<td style="text-align:center">' + data[i][0] + '</td>');
                tr.append('<td style="text-align:center">' + data[i][1] + '</td>');
                tr.append('<td style="text-align:center">' + data[i][2] + '</td>');
                tr.append('<td style="text-align:center">' + data[i][3] + '</td>');
                tr.append('<td style="text-align:center">' + data[i][4] + '</td>');
                tbody.append(tr);
            }
            $("#AddSubPropList").replaceWith(tbody);
        });
}
//玩家出售道具日志
function view_sold_prop(page) {
    if (!check_user_and_role()) return false;

    jyzz_ajax_db("view_sold_prop", [$("#rolename").val(), page ,"log"],
        function(data) {
            $('#SoldPropPage').bootpag({
                total: data["total"],
                page: page,
                maxVisible: 5
            });

            if (data["total"] == 0) {
                var tbody = $("<tbody id='SoldPropList'></tbody>");
                $("#SoldPropList").replaceWith(tbody);

                tips("暂无"+$("#username").val()+"玩家的出售道具记录", "warning");
                return;
            }

            data = data["data"];
            var tbody = $("<tbody id='SoldPropList'></tbody>");
            for (var i = 0; i < data.length; i++) {
                var tr = $('<tr></tr>');
                tr.append('<td style="text-align:center">' + data[i][0] + '</td>');
                tr.append('<td style="text-align:center">' + data[i][1] + '</td>');
                tr.append('<td style="text-align:center">' + data[i][2] + '</td>');
                tr.append('<td style="text-align:center">' + data[i][3] + '</td>');
                tr.append('<td style="text-align:center">' + data[i][4] + '</td>');

                tbody.append(tr);
            }
            $("#SoldPropList").replaceWith(tbody);
        });
}
//玩家关卡日志
function view_area_stat(page) {
    if (!check_user_and_role()) return false;

    jyzz_ajax_db("view_area_stat", [$("#rolename").val(), page ,"log"],
        function(data) {
            //var sum_get = data["sum_get"] ?data["sum_get"]:0;
            //var sum_done = data["sum_done"] ?data["sum_done"]:0;
            //$("#sumTaskStat").html("获得任务总数:<b>"+sum_get+"</b>；完成任务总数:<b>"+sum_done+"</b>");

            $('#AreaStatPage').bootpag({
                total: data["total"],
                page: page,
                maxVisible: 5
            });

            if (data["total"] == 0) {
                var tbody = $("<tbody id='AreaStatList'></tbody>");
                $("#AreaStatList").replaceWith(tbody);

                tips("暂无"+$("#username").val()+"玩家的关卡日志", "warning");
                return;
            }

            data = data["data"];
            var tbody = $("<tbody id='AreaStatList'></tbody>");
            for (var i = 0; i < data.length; i++) {
                var tr = $('<tr></tr>');
                tr.append('<td style="text-align:center">' + data[i][0] + '</td>');
                tr.append('<td style="text-align:center">' + data[i][1] + '</td>');
                tr.append('<td style="text-align:center">' + data[i][2] + '</td>');
                tr.append('<td style="text-align:center">' + data[i][3] + '</td>');
                tr.append('<td style="text-align:center">' + data[i][4] + '</td>');
                tbody.append(tr);
            }
            $("#AreaStatList").replaceWith(tbody);
        });
}

//玩家任务日志
function view_task_stat(page) {
    if (!check_user_and_role()) return false;

    jyzz_ajax_db("view_task_stat", [$("#rolename").val(), page ,"log"],
        function(data) {
            /*var sum_get = data["sum_get"] ?data["sum_get"]:0;
            var sum_done = data["sum_done"] ?data["sum_done"]:0;
            $("#sumTaskStat").html("获得任务总数:<b>"+sum_get+"</b>；完成任务总数:<b>"+sum_done+"</b>");*/

            $('#TaskStatPage').bootpag({
                total: data["total"],
                page: page,
                maxVisible: 5
            });

            if (data["total"] == 0) {
                var tbody = $("<tbody id='TaskStatList'></tbody>");
                $("#TaskStatList").replaceWith(tbody);

                tips("暂无"+$("#username").val()+"玩家的任务日志", "warning");
                return;
            }

            data = data["data"];
            var tbody = $("<tbody id='TaskStatList'></tbody>");
            for (var i = 0; i < data.length; i++) {
                var tr = $('<tr></tr>');
                tr.append('<td style="text-align:center">' + data[i][0] + '</td>');
                tr.append('<td style="text-align:center">' + data[i][1] + '</td>');
                tr.append('<td style="text-align:center">' + data[i][2] + '</td>');
                tr.append('<td style="text-align:center">' + data[i][3] + '</td>');
                tbody.append(tr);
            }
            $("#TaskStatList").replaceWith(tbody);
        });
}
//玩家英雄日志
function view_hero_log(page) {
    if (!check_user_and_role()) return false;

    jyzz_ajax_db("view_hero_log", [$("#rolename").val(), page ,"log"],
        function(data) {
            $('#HeroLogPage').bootpag({
                total: data["total"],
                page: page,
                maxVisible: 5
            });

            if (data["total"] == 0) {
                var tbody = $("<tbody id='HeroLogList'></tbody>");
                $("#HeroLogList").replaceWith(tbody);

                tips("暂无"+$("#username").val()+"玩家的英雄日志", "warning");
                return;
            }

            data = data["data"];
            var tbody = $("<tbody id='HeroLogList'></tbody>");
            for (var i = 0; i < data.length; i++) {
                var tr = $('<tr></tr>');
                tr.append('<td style="text-align:center">' + data[i][0] + '</td>');
                tr.append('<td style="text-align:center">' + data[i][1] + '</td>');
                tr.append('<td style="text-align:center">' + data[i][2] + '</td>');
                tr.append('<td style="text-align:center">' + data[i][3] + '</td>');
                tbody.append(tr);
            }
            $("#HeroLogList").replaceWith(tbody);
        });
}
//玩家小兵日志
function view_soldier_log(page) {
    if (!check_user_and_role()) return false;

    jyzz_ajax_db("view_soldier_log", [$("#rolename").val(), page ,"log"],
        function(data) {
            $('#SoldierLogPage').bootpag({
                total: data["total"],
                page: page,
                maxVisible: 5
            });

            if (data["total"] == 0) {
                var tbody = $("<tbody id='SoldierLogList'></tbody>");
                $("#SoldierLogList").replaceWith(tbody);

                tips("暂无"+$("#username").val()+"玩家的小兵日志", "warning");
                return;
            }

            data = data["data"];
            var tbody = $("<tbody id='SoldierLogList'></tbody>");
            for (var i = 0; i < data.length; i++) {
                var tr = $('<tr></tr>');
                tr.append('<td style="text-align:center">' + data[i][0] + '</td>');
                tr.append('<td style="text-align:center">' + data[i][1] + '</td>');
                tr.append('<td style="text-align:center">' + data[i][2] + '</td>');
                tr.append('<td style="text-align:center">' + data[i][3] + '</td>');
                tr.append('<td style="text-align:center">' + data[i][4] + '</td>');
                tbody.append(tr);
            }
            $("#SoldierLogList").replaceWith(tbody);
        });
}
//玩家机械日志
function view_machine_log(page) {
    if (!check_user_and_role()) return false;

    jyzz_ajax_db("view_machine_log", [$("#rolename").val(), page ,"log"],
        function(data) {
            $('#MachineLogPage').bootpag({
                total: data["total"],
                page: page,
                maxVisible: 5
            });

            if (data["total"] == 0) {
                var tbody = $("<tbody id='MachineLogList'></tbody>");
                $("#MachineLogList").replaceWith(tbody);

                tips("暂无"+$("#username").val()+"玩家的机械日志", "warning");
                return;
            }

            data = data["data"];
            var tbody = $("<tbody id='MachineLogList'></tbody>");
            for (var i = 0; i < data.length; i++) {
                var tr = $('<tr></tr>');
                tr.append('<td style="text-align:center">' + data[i][0] + '</td>');
                tr.append('<td style="text-align:center">' + data[i][1] + '</td>');
                tr.append('<td style="text-align:center">' + data[i][2] + '</td>');
                tr.append('<td style="text-align:center">' + data[i][3] + '</td>');
                tr.append('<td style="text-align:center">' + data[i][4] + '</td>');
                tbody.append(tr);
            }
            $("#MachineLogList").replaceWith(tbody);
        });
}
//玩家坐骑日志
function view_ride_log(page) {
    if (!check_user_and_role()) return false;

    jyzz_ajax_db("view_ride_log", [$("#rolename").val(), page ,"log"],
        function(data) {
            $('#RideLogPage').bootpag({
                total: data["total"],
                page: page,
                maxVisible: 5
            });

            if (data["total"] == 0) {
                var tbody = $("<tbody id='RideLogList'></tbody>");
                $("#RideLogList").replaceWith(tbody);

                tips("暂无"+$("#username").val()+"玩家的坐骑日志", "warning");
                return;
            }

            data = data["data"];
            var tbody = $("<tbody id='RideLogList'></tbody>");
            for (var i = 0; i < data.length; i++) {
                var tr = $('<tr></tr>');
                tr.append('<td style="text-align:center">' + data[i][0] + '</td>');
                tr.append('<td style="text-align:center">' + data[i][1] + '</td>');
                tr.append('<td style="text-align:center">' + data[i][2] + '</td>');
                tr.append('<td style="text-align:center">' + data[i][3] + '</td>');
                tr.append('<td style="text-align:center">' + data[i][4] + '</td>');
                tbody.append(tr);
            }
            $("#RideLogList").replaceWith(tbody);
        });
}
//玩家打开界面日志
function view_open_ui_log(page) {
    if (!check_user_and_role()) return false;
    jyzz_ajax_db("view_open_ui_log", [$("#rolename").val(), page ,"log"],
        function(data) {
            var sumOpenUI = data["sumOpenUI"] ?data["sumOpenUI"]:0;
            $("#sumOpenUILog").html("打开界面总次数:<b>"+sumOpenUI+"</b>.");
            $('#OpenUILogPage').bootpag({
                total: data["total"],
                page: page,
                maxVisible: 5
            });

            if (data["total"] == 0) {
                var tbody = $("<tbody id='OpenUILogList'></tbody>");
                $("#OpenUILogList").replaceWith(tbody);

                tips("暂无"+$("#username").val()+"玩家的打开界面记录", "warning");
                return;
            }

            data = data["data"];
            var tbody = $("<tbody id='OpenUILogList'></tbody>");
            for (var i = 0; i < data.length; i++) {
                var tr = $('<tr></tr>');
                tr.append('<td style="text-align:center">' + data[i][0] + '</td>');
                tr.append('<td style="text-align:center">' + data[i][1] + '</td>');
                tr.append('<td style="text-align:center">' + data[i][2] + '</td>');
                tbody.append(tr);
            }
            $("#OpenUILogList").replaceWith(tbody);
        });
}

function viewPayStat(page) {
    if (!check_user()) return false;

    jyzz_ajax_db("viewPayStat", [$("#username").val(), page],
        function(data) {

            $('#PayStatPage').bootpag({
                total: data["total"]==0?1:data["total"],
                page: page,
                maxVisible: 10
            });

            if (data["total"] == 0) {
                var tbody = $("<tbody id='PayStatList'></tbody>");
                $("#PayStatList").replaceWith(tbody);

                tips("暂无充值记录", "danger");
                return;
            }

            data = data["data"];
            var tbody = $("<tbody id='PayStatList'></tbody>");
            for (var i = 0; i < data.length; i++) {
                var tr = $('<tr></tr>');
                if(data[i][0]==-1)
                    tr.append('<td>月卡</td>');
                else
                    tr.append('<td>' + data[i][0] + '</td>');
                tr.append('<td>' + data[i][1] + '</td>');
                tr.append('<td>' + data[i][2] + '</td>');
                tr.append('<td>' + data[i][3] + '</td>');
                tbody.append(tr);
            }
            $("#PayStatList").replaceWith(tbody);
        });
}

function viewGoldStat(page) {
    if (!check_user_and_role()) return false;

    jyzz_ajax_db("viewGoldStat", [$("#rolename").val(), page],
        function(data) {

            $('#GoldStatPage').bootpag({
                total: data["total"]==0?1:data["total"],
                page: page,
                maxVisible: 10
            });

            if (data["total"] == 0) {
                var tbody = $("<tbody id='GoldStatList'></tbody>");
                $("#GoldStatList").replaceWith(tbody);

                tips("暂无金币流水", "danger");
                return;
            }

            data = data["data"];
            var tbody = $("<tbody id='GoldStatList'></tbody>");
            for (var i = 0; i < data.length; i++) {
                var tr = $('<tr></tr>');
                tr.append('<td>' + data[i][0] + '</td>');
                tr.append('<td>' + data[i][1] + '</td>');
                tr.append('<td>' + data[i][2] + '</td>');
                tbody.append(tr);
            }
            $("#GoldStatList").replaceWith(tbody);
        });
}


//订单号
function viewOrderID(page) {
    if (!check_user_and_role()) return false;
    jyzz_ajax_db("viewOrderID", [$("#username").val(), page],
        function(data) {

            $('#OrderPage').bootpag({
                total: data["total"]==0?1:data["total"],
                page: page,
                maxVisible: 10
            });

            if (data["total"] == 0) {
                var tbody = $("<tbody id='OrderList'></tbody>");
                $("#OrderList").replaceWith(tbody);

                tips("暂无订单信息", "danger");
                return;
            }

            data = data["data"];
            var tbody = $("<tbody id='OrderList'></tbody>");
            for (var i = 0; i < data.length; i++) {
                var tr = $('<tr></tr>');
                tr.append('<td>' + data[i][0] + '</td>');
                tr.append('<td>' + data[i][1] + '</td>');
                tr.append('<td>' + data[i][2] + '</td>');
                tr.append('<td>' + data[i][3] + '</td>');
                tr.append('<td>' + data[i][4] + '</td>');
                tbody.append(tr);
            }
            $("#OrderList").replaceWith(tbody);
        });
}
function viewConsignment(page) {
    if (!check_user_and_role()) return false;

    jyzz_ajax_db("viewConsignment", [$("#rolename").val(), page],
        function(data) {
            $('#ConsignmentPage').bootpag({
                total: data["total"]==0?1:data["total"],
                page: page,
                maxVisible: 10
            });

            if (data["total"] == 0) {
                var tbody = $("<tbody id='ConsignmentList'></tbody>");
                $("#ConsignmentList").replaceWith(tbody);

                tips("暂无寄售流水", "danger");
                return;
            }

            data = data["data"];
            var tbody = $("<tbody id='ConsignmentList'></tbody>");
            for (var i = 0; i < data.length; i++) {
                var tr = $('<tr></tr>');
                tr.append('<td>' + data[i][0] + '</td>');
                tr.append('<td>' + data[i][1] + '</td>');
                tr.append('<td>' + data[i][2] + '</td>');
                tr.append('<td>' + data[i][3] + '</td>');
                if (data[i][4]==1)
                    tr.append('<td>由"' + data[i][5] + '"购买</td>');
                else if (data[i][4]==2)
                    tr.append('<td>超时返还</td>');
                else
                    tr.append('<td>取消寄售</td>');
                tbody.append(tr);
            }
            $("#ConsignmentList").replaceWith(tbody);
        });
}
search_div = {
    "searchBaseData":["view_login_logout","view_role_duration","view_exp_stat"],
    "searchCurrency":["view_copper_coin","view_forage","view_steel_stone"],
    "searchProp"    :["view_add_sub_prop","view_sold_prop"],
    "searchAreaTask":["view_area_stat","view_task_stat"],
    "searchUnit"    :["view_hero_log","view_soldier_log","view_machine_log","view_ride_log"],
    "searchAction"  :["view_open_ui_log"]
}
function showSearchDiv(search_type,search_detail){
    searchDivArr = search_div[search_type]
    for (item in searchDivArr){
        if (searchDivArr[item]==search_detail){
            $("#"+searchDivArr[item]).show();
        }else{
            $("#"+searchDivArr[item]).hide();
        }
    }
}

$(document).ready(function() {
    $("#viewBaseData,#viewCurrency,#viewProp,#viewAreaTask,#viewUnit,#viewAction").click(function(){
        var search_detail = $(this).parent().parent().find("select").val();
        var page = $("#"+search_detail+"Page").bootpag().find(".disabled").attr("data-lp");
        if (page == undefined) {page = 1};
        eval(search_detail+"("+page+")")
    })
        $("#LoginLogoutPage").bootpag({
            total: 0,
            page: 1,
            maxVisible: 5
        }).on("page", function(event, page) {
            view_login_logout(page);
        });

        $("#view_login_logout").on("click", function() {
            var page = $('#LoginLogoutPage').bootpag().find(".disabled").attr("data-lp");
            if (page == undefined) page = 1;
            view_login_logout(page);
            return false;
        })
        //每日游戏时间
        $("#RoleDurationPage").bootpag({
            total: 0,
            page: 1,
            maxVisible: 5
        }).on("page", function(event, page) {
            view_role_duration(page);
        });

        $("#view_role_duration").on("click", function() {
            var page = $('#RoleDurationPage').bootpag().find(".disabled").attr("data-lp");
            if (page == undefined) page = 1;
            view_role_duration(page);
            return false;
        })

        //经验
        $("#ExpStatPage").bootpag({
            total: 0,
            page: 1,
            maxVisible: 5
        }).on("page", function(event, page) {
            view_exp_stat(page);
        });

        $("#view_exp_stat").on("click", function() {
            var page = $('#ExpStatPage').bootpag().find(".disabled").attr("data-lp");
            if (page == undefined) page = 1;
            view_exp_stat(page);
            return false;
        })
        //铜币
        $("#CopperCoinPage").bootpag({
            total: 0,
            page: 1,
            maxVisible: 5
        }).on("page", function(event, page) {
            view_copper_coin(page);
        });

        $("#view_copper_coin").on("click", function() {
            var page = $('#CopperCoinPage').bootpag().find(".disabled").attr("data-lp");
            if (page == undefined) page = 1;
            view_copper_coin(page);
            return false;
        })
        //粮草
        $("#ForagePage").bootpag({
            total: 0,
            page: 1,
            maxVisible: 5
        }).on("page", function(event, page) {
            view_forage(page);
        });

        $("#view_forage").on("click", function() {
            var page = $('#ForagePage').bootpag().find(".disabled").attr("data-lp");
            if (page == undefined) page = 1;
            view_forage(page);
            return false;
        })
        //矿石
        $("#SteelStonePage").bootpag({
            total: 0,
            page: 1,
            maxVisible: 5
        }).on("page", function(event, page) {
            view_steel_stone(page);
        });

        $("#view_steel_stone").on("click", function() {
            var page = $('#SteelStonePage').bootpag().find(".disabled").attr("data-lp");
            if (page == undefined) page = 1;
            view_steel_stone(page);
            return false;
        })
        //获得使用道具
        $("#AddSubPropPage").bootpag({
            total: 0,
            page: 1,
            maxVisible: 5
        }).on("page", function(event, page) {
            view_add_sub_prop(page);
        });

        $("#view_add_sub_prop").on("click", function() {
            var page = $('#AddSubPropPage').bootpag().find(".disabled").attr("data-lp");
            if (page == undefined) page = 1;
            view_add_sub_prop(page);
            return false;
        })
        //出售道具
        $("#SoldPropPage").bootpag({
            total: 0,
            page: 1,
            maxVisible: 5
        }).on("page", function(event, page) {
            view_sold_prop(page);
        });

        $("#view_sold_prop").on("click", function() {
            var page = $('#SoldPropPage').bootpag().find(".disabled").attr("data-lp");
            if (page == undefined) page = 1;
            view_sold_prop(page);
            return false;
        })
        //关卡日志
        $("#AreaStatPage").bootpag({
            total: 0,
            page: 1,
            maxVisible: 5
        }).on("page", function(event, page) {
            view_area_stat(page);
        });
        $("#view_area_stat").on("click", function() {
            var page = $('#AreaStatPage').bootpag().find(".disabled").attr("data-lp");
            if (page == undefined) page = 1;
            view_area_stat(page);
            return false;
        })

        //任务日志
        $("#TaskStatPage").bootpag({
            total: 0,
            page: 1,
            maxVisible: 5
        }).on("page", function(event, page) {
            view_task_stat(page);
        });

        $("#view_task_stat").on("click", function() {
            var page = $('#TaskStatPage').bootpag().find(".disabled").attr("data-lp");
            if (page == undefined) page = 1;
            view_task_stat(page);
            return false;
        })
        //英雄日志
        $("#HeroLogPage").bootpag({
            total: 0,
            page: 1,
            maxVisible: 5
        }).on("page", function(event, page) {
            view_hero_log(page);
        });

        $("#view_hero_log").on("click", function() {
            var page = $('#HeroLogPage').bootpag().find(".disabled").attr("data-lp");
            if (page == undefined) page = 1;
            view_hero_log(page);
            return false;
        })
        //小兵日志
        $("#SoldierLogPage").bootpag({
            total: 0,
            page: 1,
            maxVisible: 5
        }).on("page", function(event, page) {
            view_soldier_log(page);
        });

        $("#view_soldier_log").on("click", function() {
            var page = $('#SoldierLogPage').bootpag().find(".disabled").attr("data-lp");
            if (page == undefined) page = 1;
            view_soldier_log(page);
            return false;
        })
        //机械日志
        $("#MachineLogPage").bootpag({
            total: 0,
            page: 1,
            maxVisible: 5
        }).on("page", function(event, page) {
            view_machine_log(page);
        });

        $("#view_machine_log").on("click", function() {
            var page = $('#MachineLogPage').bootpag().find(".disabled").attr("data-lp");
            if (page == undefined) page = 1;
            view_machine_log(page);
            return false;
        })
        //坐骑日志
        $("#RideLogPage").bootpag({
            total: 0,
            page: 1,
            maxVisible: 5
        }).on("page", function(event, page) {
            view_ride_log(page);
        });

        $("#view_ride_log").on("click", function() {
            var page = $('#RideLogPage').bootpag().find(".disabled").attr("data-lp");
            if (page == undefined) page = 1;
            view_ride_log(page);
            return false;
        })
        //打开界面日志
        $("#OpenUILogPage").bootpag({
            total: 0,
            page: 1,
            maxVisible: 5
        }).on("page", function(event, page) {
            view_open_ui_log(page);
        });

        $("#view_open_ui_log").on("click", function() {
            var page = $('#OpenUILogPage').bootpag().find(".disabled").attr("data-lp");
            if (page == undefined) page = 1;
            view_open_ui_log(page);
            return false;
        })

    $("#PayStatPage").bootpag({
        total: 0,
        page: 1,
        maxVisible: 10
    }).on("page", function(event, page) {
        viewPayStat(page);
    });

    $("#viewPayStat").on("click", function() {
        var page = $('#PayStatPage').bootpag().find(".disabled").attr("data-lp");
        if (page == undefined) page = 1;
        viewPayStat(page);
        return false;
    })

    dbbind("viewBaseinfo", function(data) {
        data = data["data"]
        if (data["level"] == undefined) {
            $("#RoleBaseinfo").text("");
            return;
        }
        var infomap = {
            "level": "等级",
            "recharged":"充值",
            "blue": "蓝钻",
            "diamond": "紫钻",
            "gold": "金币",
            "chenghao": "称号",
            "vip": "VIP",
            "time": "注册时间",
            "device": "注册设备",
            "os": "注册系统"
        }
        var tip = ""
        for (key in infomap) {
            tip += infomap[key] + "：" + data[key] + "，"
        }
        $("#RoleBaseinfo").text(tip);
    }, function() {
        return [$("#username").val(), $("#rolename").val()]
    }, check_user_and_role);


    $("#GoldStatPage").bootpag({
        total: 0,
        page: 1,
        maxVisible: 10
    }).on("page", function(event, page) {
        viewGoldStat(page);
    });

    $("#viewGoldStat").on("click", function() {
        var page = $('#GoldStatPage').bootpag().find(".disabled").attr("data-lp");
        if (page == undefined) page = 1;
        viewGoldStat(page);
        return false;
    })



    $("#viewOrderID").on("click", function() {
        var page = $('#OrderPage').bootpag().find(".disabled").attr("data-lp");
        if (page == undefined) page = 1;
        viewOrderID(page);
        return false;
    })
    
    $("#ConsignmentPage").bootpag({
        total: 0,
        page: 1,
        maxVisible: 10
    }).on("page", function(event, page) {
        viewConsignment(page);
    });

    $("#viewConsignment").on("click", function() {
        var page = $('#ConsignmentPage').bootpag().find(".disabled").attr("data-lp");
        if (page == undefined) page = 1;
        viewConsignment(page);
        return false;
    })
    
});
