function init_select() {
    $("#account").parent().removeClass('has-error').removeClass('has-success');

    var username = $('<select id="username" class="form-control"  disabled>');
    var option = $("<option>尚未开始查询,请在上方输入查询内容</option>");
    username.append(option);
    $("#username").replaceWith(username);

    var playerID = $('<select id="playerID" class="form-control"  disabled>');
    var option = $("<option>尚未开始查询</option>");
    playerID.append(option);
    $("#playerID").replaceWith(playerID);

    var rolename = $('<select id="rolename" class="form-control"  disabled>');
    var option = $("<option>尚未开始查询</option>");
    rolename.append(option);
    $("#rolename").replaceWith(rolename);
    
    var roletime = $('<select id="roletime" class="form-control"  disabled>');
    var option = $("<option>尚未开始查询</option>");
    roletime.append(option);
    $("#roletime").replaceWith(roletime);
}

//#username[查询结果] 重载/变化 执行ID/角色名查找
function register(search_type) {
    $("#username").bind("change load",
        function() {
            jyzz_ajax_db('read_role', [this.value,search_type], function(data) {
                data = data["data"];
                if (data.length == 0) {
                    var playerID = $('<select id="playerID" class="form-control" disabled>');
                    var option = $("<option>暂未查询到对应ID</option>");
                    playerID.append(option);
                    $("#playerID").replaceWith(playerID);

                    var rolename = $('<select id="rolename" class="form-control" disabled>');
                    var option = $("<option>暂未创建角色</option>");
                    rolename.append(option);
                    $("#rolename").replaceWith(rolename);
                } else {
                    var playerID = $('<select id="playerID" class="form-control">');
                    for (var i = 0; i < data.length; i++) {
                        var option = $("<option></option>");
                        option.text(data[i]["playerID"]);
                        option.val(data[i]["playerID"]);
                        playerID.append(option);
                    }
                    $("#playerID").replaceWith(playerID);

                    var rolename = $('<select id="rolename" class="form-control">');
                    for (var i = 0; i < data.length; i++) {
                        var option = $("<option></option>");
                        option.text(data[i]["nickname"]);
                        option.val(data[i]["nickname"]);
                        rolename.append(option);
                    }
                    $("#rolename").replaceWith(rolename);
                }
            });

        });
    return false;
}

//username[查询结果] 重载/变化 执行最后上线时间查找
function registertime(search_type) {
    $("#username").bind("change load",
        function() {

            jyzz_ajax_db('search_time', [this.value,search_type], function(data) {

                data = data["data"];
                if (data=="") {
                    var roletime = $('<select id="roletime" class="form-control" disabled>');
                    var option = $("<option>未找到此数据</option>");
                    roletime.append(option);
                    $("#roletime").replaceWith(roletime);
                } else {
                    var roletime = $('<select id="roletime" class="form-control">');
                    var option = $("<option></option>");
                        option.text(data);
                        option.val(data);
                        roletime.append(option);
                    $("#roletime").replaceWith(roletime);
                }
            });

        });
    return false;
}

function set_account(data) {
    var data0 = data["ret_data"];
    var search_type = data["search_type"]
    var username = $('<select id="username" class="form-control">');
    if (data0.length == 0) {
        init_select();
        $("#account").parent().removeClass('has-success').addClass('has-error');
        var username = $('<select id="username" class="form-control" disabled>');
        var option = $("<option>未找到此帐号，请重新搜索</option>");
        username.append(option);
        $("#username").replaceWith(username);
    } else {
        $("#account").parent().removeClass('has-error').addClass('has-success');
        for (var i = 0; i < data0.length; i++) {
            var option = $("<option></option>");
            option.text(data0[i]);
            option.val(data0[i]);
            username.append(option);
        }
        $("#username").replaceWith(username);
        register(search_type);
        registertime(search_type);
        $("#username").change();
    }
}

$(document).ready(
    function() {
        $("input[name=search-type]").change(function() {
            var searchName = $(this).attr("data-type");
            $("#searchTypeName").html(searchName);
            $("#account").triggerHandler("input");
        });
        //register();
        //registertime();
        $("#search").click(function() {
            var account = $.trim($("#account").val());
            if (account.length == 0) {
                init_select();
                tips("Sorry,没有输入,就没有结果!","warning");
            }else {
                jyzz_ajax_db($('input[name=search-type]:checked').val(), [account], function(data) {
                    //aa = JSON.stringify(data)
                    //alert(data["data"]["search_type"])
                    set_account(data["data"]);
                });
            }
            return false;
        });

        bind_enter("account","search");
    });
