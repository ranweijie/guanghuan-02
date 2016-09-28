$(document).ready(
    function() {
        settingbind("user_list", function(data) {
            data = data["data"];
            if (data.length == 0) {
                return;
            }
            var tbody = $("<tbody id='userList'></tbody>");
            var auth_color = ["info", "danger", "warning", "success"];
            var auth_desc = ["超级", "高级", "中级", "低级"];
            for (var i = 0; i < data.length; i++) {
                var tr = $('<tr class="' + auth_color[data[i].auth] + '"></tr>');
                tr.append('<td>' + data[i].user + '</td>');
                tr.append('<td pass=' + data[i].pass + '>' + '******' + '</td>');
                tr.append('<td auth=' + data[i].auth + '>' + auth_desc[data[i].auth] + '</td>');
                tr.append('<td><a href="#" class="user_modify"><span class="glyphicon glyphicon-pencil"></span></a> <a href="#" class="user_remove"><span class="glyphicon glyphicon-remove"></span></a></td>');
                tbody.append(tr);
            }
            $("#userList").replaceWith(tbody);

            $(".user_modify").click(
                function() {
                    var tr = $(this).parent().parent();
                    var td = tr.find("td").first();
                    var user = td.text();
                    var pass = td.next().attr("pass");
                    var auth = td.next().next().attr("auth");
                    BootstrapDialog.show({
                        type: BootstrapDialog.TYPE_SUCCESS,
                        title: '修改用户属性',
                        message: '<h5>用户：</h5><input type="text" class="form-control" value="' + user + '" readonly><h5>密码：</h5><input type="password" class="new_pass form-control" value="' + pass + '" required><h5 class="auth_desc">权限：</h5><label class="radio-inline hide"><input type="radio" name="auth_option" value="0" disabled>超级</label><label class="radio-inline"><input type="radio" name="auth_option" value="1">高级</label><label class="radio-inline"><input type="radio" name="auth_option" value="2">中级</label><label class="radio-inline"><input type="radio" name="auth_option" value="3">低级</label>',
                        buttons: [{
                            label: '确定',
                            action: function(dialog) {
                                var new_pass = dialog.getModalBody().find('.new_pass').val();
                                var new_auth = dialog.getModalBody().find('input[name=auth_option]:checked').val();
                                jyzz_ajax_setting("user_modify", [user, new_pass, new_auth],
                                    function(data) {
										tips(data["message"]);
                                        td.next().attr("pass", new_pass);
                                        td.next().next().attr("auth", new_auth);
                                        td.next().next().text(auth_desc[new_auth]);

                                        for (i in auth_color) {
                                            tr.removeClass(auth_color[i]);
                                        };
                                        tr.addClass(auth_color[new_auth]);

                                        dialog.close();
                                    });
                            }
                        }],
                        onshow: function(dialog) {
                            dialog.getModalBody().find('input[name=auth_option][value="' + auth + '"]').attr("checked", true);
                            if (auth == '0') {
                                dialog.getModalBody().find('.auth_desc').hide();
                                dialog.getModalBody().find('input[name=auth_option]').parent().hide();
                            }
                            dialog.getModalBody().find('input[type=password]').password();
                        }
                    });
                    return false;
                });


            $(".user_remove").click(
                function() {
                    var tr = $(this).parent().parent();
                    var td = tr.find("td").first();
                    var user = td.text();
                    var auth = td.next().next().attr("auth");
                    if (auth == '0') {
                        return tips("超级管理员不可删除", "danger");
                    }

                    BootstrapDialog.show({
                        type: BootstrapDialog.TYPE_WARNING,
                        title: '提示',
                        message: '您确定要删除用户 <strong>' + user + '</strong> 吗？',
                        buttons: [{
                            label: '取消',
                            action: function(dialog) {
                                dialog.close();
                            },
                        }, {
                            label: '确定',
                            cssClass: 'btn-primary',
                            action: function(dialog) {
                                jyzz_ajax_setting("user_remove", [user], function(data) {
									tips(data["message"])
                                    dialog.close();
                                    tr.hide(500);
                                });
                            }
                        }]
                    });

                    return false;
                });
        });

        $("#user_list").click();

        $("#user_add").click(
            function() {
                BootstrapDialog.show({
                    type: BootstrapDialog.TYPE_SUCCESS,
                    closeByBackdrop: false,
                    title: '添加用户',
                    message: '<h5>用户：</h5><input type="text" class="form-control" required><h5>密码：</h5><input type="password" class="form-control" required><h5 class="auth_desc">权限：</h5><label class="radio-inline"><input type="radio" name="auth_option" value="1">高级</label><label class="radio-inline"><input type="radio" name="auth_option" value="2">中级</label><label class="radio-inline"><input type="radio" name="auth_option" value="3" checked>低级</label>',
                    buttons: [{
                        label: '确定',
                        action: function(dialog) {
                            var user = dialog.getModalBody().find('input[type=text]').val();
                            var pass = dialog.getModalBody().find('input[type=password]').val();
                            var auth = dialog.getModalBody().find('input[name=auth_option]:checked').val();
                            if (user.trim() == 0 || pass.trim() == 0){tips("用户信息不完善，请点击确定后继续添加或取消操作！","warning");return;}
                            jyzz_ajax_setting("user_add", [user, pass, auth],
                                function(data) {
									tips(data["message"]);
									$("#user_list").click();
                                    dialog.close();
                                });
                        }
                    }],
                    onshow: function(dialog) {
                        dialog.getModalBody().find('input[type=password]').password();
                    }
                });
                return false;
            }
        );

        function ViewLog(page) {
            jyzz_ajax_setting("view_log", [page],
                function(data) {

                    $('#logPage').bootpag({
                        total: data["total"] == 0 ? 1 : data["total"],
                        page: page,
                        maxVisible: 10
                    });

                    if (data["total"] == 0) {
                        var tbody = $("<tbody id='logList'></tbody>");
                        $("#logList").replaceWith(tbody);
                        return;
                    }
                    data = data["data"];
                    var tbody = $("<tbody id='logList'></tbody>");
                    for (var i = 0; i < data.length; i++) {
                        var tr = $('<tr></tr>');
                        tr.append('<td>' + data[i][0] + '</td>');
                        tr.append('<td>' + data[i][1] + '</td>');
                        tr.append('<td>' + data[i][2] + '</td>');
                        tr.append('<td>' + data[i][3] + '</td>');
                        tr.append('<td>' + data[i][4] + '</td>');
                        tbody.append(tr);
                    }
                    $("#logList").replaceWith(tbody);
                });
        }
        $("#logPage").bootpag({
            total: 0,
            page: 1,
            maxVisible: 10
        }).on("page", function(event, page) {
            ViewLog(page);
        });

        ViewLog(1);
    });
