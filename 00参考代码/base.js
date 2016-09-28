var pstr = " \
<div class=\"col-sm-12 panel panel-default\">\
    <a class=\"btn btn-default col-sm-12\" data-toggle=\"collapse\" \
        data-parent=\"#accordion\" href=\"#{0}\">{2}</a> \
    <div id=\"{1}\" class=\"panel-body panel-collapse collapse\"> \
        <p>内容：{3}</p> \
        <p>需要vip：{4} <\p>\
        <p>需要等级：{5}</p> \
        <p>生效--到期（时间）：{6}</p> \
		<p>附件：{7}</p> \
    </div>\
</div>"
 function getLocalTime(nS) {     
   return new Date(parseInt(nS) * 1000).toLocaleString().replace(/年|月/g, "-").replace(/日/g, " ");      
}     

$(document).ready(
    function() {
		//发布系统公告
        bind("broadcast", function(data) {
            tips("操作成功");
        }, function() {
            return [$("#broadcast_text").val()]
        },function(){
			if ($("#broadcast_text").val().trim()==0){
				tips("sorry，您还没有输入系统公告内容!","warning");return false;}
			return true;
		})
		//发布系统消息
        bind("SystemMessage", function(data){
			tips("操作成功");	
        }, function() {
            return [$("#SystemMessage_text").val()]
        },function(){
			if ($("#SystemMessage_text").val().trim()==0){
				tips("sorry，您还没有输入系统消息内容","warning");return false;}
			return true;
		})
		//查询服务器在线人数
        bind("getPlayerNum", function(data) {
			$("#PlayerNum").text((data["msg"]));
        });
        $("#getPlayerNum").click();
		
		//热更新所有配置
        bind("reloadAllCfg", function(data) {
            tips("操作成功");
        });
		//热更新tmp_process
        bind("ReloadTmpProcess", function(data) {
            tips("操作成功");
        });
		//保存全服数据
        bind("saveAll", function(data) {
            tips("操作成功");
        });
/*
        //个推消息（--修改推送）
        $("#push_message").click(function() {
            var parent = $(this).parent().parent();
            BootstrapDialog.show({
                type: BootstrapDialog.TYPE_SUCCESS,
                closeByBackdrop: false,
                title: '添加个推',
                message: '<h5>标题：</h5><input type="text" class="form-control" id="push_message_title" value="风暴之心"><h5><h5>URL：</h5><input type="text" class="form-control" id="push_message_url" value="http://android.googleapis.com/gcm/send"><h5>个推：</h5><textarea class="form-control" id="push_message_content_window" rows="5" placeholder="个推不要少于四个字"></textarea><h5>时间：</h5><input type="text" id="daterange" class="form-control"/>推送时间：<input type="text" class="form-control" id="push_message_time" value="10:00">',
                onshown: function(dialog) {
                    $('#daterange').daterangepicker({
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
                            timePicker: true,
                            timePicker12Hour: false,
                            timePickerIncrement: 10,
                            timePickerSeconds: false,
                            minDate: moment()
                        },
                        function(start, end) {
                            $('#daterange').val(start.format("YYYY-MM-DD HH-mm") + ' - ' + end.format("YYYY-MM-DD HH-mm"));
                        });
                    $('#daterange').data('daterangepicker').notify();
                },
                buttons: [{
                    label: '关闭',
                    action: function(dialog) {
                        dialog.close();
                    }
                }, {
                    label: '添加',
                    cssClass: 'btn-primary',
                    action: function(dialog) {
                        var msg = $('#push_message_content_window').val();
                        var title = $('#push_message_title').val();
                        if (msg.trim() == 0) return tips("请填写公告", "danger");
                        var url = $('#push_message_url').val();
                        var time_send = $('#push_message_time').val();

                        jyzz_ajax_zmq("push_message", [{
                            "msg": msg,
                            "title": title,
                            "start_time": $('#daterange').data('daterangepicker').startDate.format("YYYY-MM-DD HH-mm"),
                            "end_time": $('#daterange').data('daterangepicker').endDate.format("YYYY-MM-DD HH-mm"),
                            "url":url,
                            "time_send":time_send
                        }], function(data) {
                            tips("操作成功");
                            dialog.close();
                            setTimeout(function() {
                                $("#GetPushMessage").click()
                            }, 1200)
                        });
                    }
                }]
            });
            return false;
        });
*/
        //个推显示(刷新获取个推信息)
/*
        bind("GetPushMessage", function(data) {
            data = data["gt"]
            var push_message_content = $("#push_message_content")
            push_message_content.empty();
            if (data.length == 0) {
                push_message_content.prev().addClass("hide")
                push_message_content.text("暂无公告");
                return;
            }

            push_message_content.prev().removeClass("hide")
            for (var i = 0; i < data.length; i++) {
                push_message_content.append('<div class="panel panel-default" index="' + i + '"><div class="panel-body">' +
                    '<strong>内容：</strong>' + data[i].content + '<a href="#" class="pull-right RemoveCyclicBroadcast"><span class="glyphicon glyphicon-remove"></span></a><br />' +
                    '<strong>时间：</strong>' + data[i].begin_time + ' - ' + data[i].end_time + '<br />' +
                    '<strong>发送：</strong>' + data[i].time_send + '' +
                    '</div></div>');
            };
            $(".RemoveCyclicBroadcast").click(
                function() {
                    var cyclic_broadcast = $(this).parent().parent()
                    jyzz_ajax_zmq("RemoveCyclicBroadcast", [parseInt(cyclic_broadcast.attr('index')) + 1], function(data) {
                        $("#GetCyclicBroadcast").click();
                    });
                    return false;
                });
        });
        $("#GetPushMessage").click();
*/      
        //发送游戏内公告消息
/*
        $("#SendNoticemessage").click(function() {
            var parent = $(this).parent().parent();
            BootstrapDialog.show({
                type: BootstrapDialog.TYPE_SUCCESS,
                closeByBackdrop: false,
                title: '设置公告',
                message: '<h5>游戏公告内容：</h5><textarea class="form-control" id="push_message_content_window" rows="5" placeholder="游戏公告不要少于四个字"></textarea>',
                
                buttons: [{
                    label: '关闭',
                    action: function(dialog) {
                        dialog.close();
                    }
                }, {
                    label: '添加',
                    cssClass: 'btn-primary',
                    action: function(dialog) {
                        var msg = $('#push_message_content_window').val();
                        if (msg.trim() == 0) return tips("请填写公告", "danger");

                        jyzz_ajax_zmq("send_notice_message", [{
                            "content": msg
                        }], function(data) {
                            tips("操作成功");
                            dialog.close();
                            setTimeout(function() {
                                $("#GetPushMessage").click()
                            }, 1200)
                        });
                    }
                }]
            });
            return false;
        });
*/
        //游戏公告显示下(&刷新获取)
/*
        bind("GetNoticeMessage", function(data) {
            data = data["content"]
            var Notice_message_content = $("#Notice_message_content")
            Notice_message_content.empty();
            if (data.length == 0) {
                Notice_message_content.prev().addClass("hide")
                Notice_message_content.text("暂无游戏公告");
                return;
            }
            Notice_message_content.prev().removeClass("hide")
            Notice_message_content.append('<div class="panel panel-default" index="' + i + '"><div class="panel-body">' +
                '<strong>内容：</strong>' + data + '</a><br />' +
                '</div></div>');
        });
        $("#GetNoticeMessage").click();
*/       		
		//设置更新公告
		bind("UpdateAnnouncement", function(data) {
            tips("操作成功");
        }, function() {
            return [$("#UpdateAnnouncement_text").val()]
        })


        $("#robot_ask").click(function() {
            BootstrapDialog.show({
                type: BootstrapDialog.TYPE_WARNING,
                title: '提示',
                message: '您确定要创建机器人吗？',
                buttons: [{
                    label: '取消',
                    action: function(dialog) {
                        dialog.close();
                    },
                }, {
                    label: '确定',
                    cssClass: 'btn-primary',
                    action: function(dialog) {
                        jyzz_ajax_zmq("robot", [], function(data) {
                            dialog.close();
                            tips("操作成功");
                        });
                    }
                }]
            });
            return false;
        });
		//关闭服务器
        $("#shutdown_ask").click(function() {
            var server = $(".navbar-nav .dropdown-toggle").text().trim();
            BootstrapDialog.show({
                type: BootstrapDialog.TYPE_DANGER,
                title: '提示',
                message: '<div class="alert alert-danger" role="alert">您即将关闭<a class="alert-link"> ' + query()["server"] + '# ' + server + '</a> 服务器，输入 <strong>' + server + '</strong> 方可执行：</div><input type="text" class="form-control">',
                buttons: [{
                    label: '确定',
                    cssClass: 'btn-default disabled',
                    action: function(dialog) {
                        dialog.close();
                        jyzz_ajax_zmq("shutdown", [], function(data) {
                            tips("操作成功");
                        });
                    }
                }],
                onshown: function(dialog) {
                    var input = dialog.getModalBody().find('input');
                    input.bind('input propertychange', function() {
                        dialog.enableButtons(this.value.trim() == server)
                    })
                }
            });
            return false;
        });

        bind("SendPublicSystemMail", function(data) {
           BootstrapDialog.show({
                    type: BootstrapDialog.TYPE_WARNING,
                    title: '提示',
                    message: '是否要执行此操作。',
                    buttons: [{
                        label: '取消',
                        action: function(dialog) {
                            dialog.close();
                        },
                    }, {
                        label: '继续',
                        cssClass: 'btn-primary',
                        action: function(dialog) {
							    dialog.close();
                                tips("操作成功");
                        }
                    }]
                });
        }, function() {
				
            var MailAttachment = []
            $(".MailAttachment").each(function() {
                MailAttachment.push(JSON.parse($(this).attr("item")))
            });
            return [$("#MailTitle").val(), $("#MailContent").val(), MailAttachment.length == 0 ? false : MailAttachment, 
            {
                "level":parseInt($("#MailLevelLimit").val()),
                "vip":parseInt($("#MailVIPLimit").val()),
                "start_time": $('#mail-daterange').data('daterangepicker').startDate.unix(),
                "end_time": $('#mail-daterange').data('daterangepicker').endDate.unix(),
			    //"start_time2": $('#daterange2').data('daterangepicker').startDate.unix(),
                //"end_time2": $('#daterange2').data('daterangepicker').endDate.unix(),
            }]
        });
        
        bind("ViewPublicSystemMail", function(data) {
            
            document.getElementById("accordion").innerHTML = "";            
            var isHaveMail = false;
            for ( var key in data.data){
                var d = data.data[key]
                var _id_key = "_id_"+key;
                isHaveMail = true;
                $("#accordion").append( stringFormat(pstr, _id_key, _id_key, 
                        d.mail.title, d.mail.content,
                        d.limit.level, d.limit.vip,
                        getLocalTime( d.limit.start_time) + "-" + getLocalTime( d.limit.end_time ),
						//getLocalTime( d.limit.start_time2) + "-" + getLocalTime( d.limit.end_time2 ),
                        JSON.stringify(d.mail.attachment || {})                        
                    )
                );
            }
            if (!isHaveMail) $("#accordion").append("<p> 该服务器没有全服邮件 </p>");
            
        });

        $("#AddAttachment").click(function() {
            var parent = $(this).parent().parent();
            ShowItem('添加附件', '添加', {}, function(item) {
                CommonShowItem("MailAttachment", '附件', parent, item);
            });
            return false;
        });
		//重载模块
        bind("ReloadMoudle", function(data) {
            tips("操作成功");
        }, function() {
            return [$("#ReloadMoudleName").val()]
        //});
        },function(){
			if ($("#ReloadMoudleName").val().trim()==0){
				tips("sorry，您还没有输入模块名称!","warning");return false;}
			return true;
		})

        bind("modifyAssociationData", function(data) {
            tips("操作成功");
        }, function() {
            return [$("#modifyAssociationDataName").val(), $("#modifyAssociationDataKey").val(), $("#modifyAssociationDataValue").val()]
        });

/*
		//获取定时循环公告
        bind("GetCyclicBroadcast", function(data) {
            data = data["lists"]
            var CyclicBroadcast = $("#CyclicBroadcast")
            CyclicBroadcast.empty();
            if (data.length == 0) {
                CyclicBroadcast.prev().addClass("hide")
                CyclicBroadcast.text("暂无公告");
                return;
            }

            CyclicBroadcast.prev().removeClass("hide")
            for (var i = 0; i < data.length; i++) {
                CyclicBroadcast.append('<div class="panel panel-default" index="' + i + '"><div class="panel-body">' +
                    '<strong>公告：</strong>' + data[i].msg + '<a href="#" class="pull-right RemoveCyclicBroadcast"><span class="glyphicon glyphicon-remove"></span></a><br />' +
                    '<strong>时间：</strong>' + moment.unix(data[i].start_time).format('YYYY/MM/DD HH:mm:ss') + ' - ' + moment.unix(data[i].end_time).format('YYYY/MM/DD HH:mm:ss') + '<br />' +
                    '<strong>定时：</strong>' + data[i].interval / 60 + '分钟<br />' +
                    '<strong>发送：</strong>' + moment.unix(data[i].time).format('YYYY/MM/DD HH:mm:ss') + '' +
                    '</div></div>');
            };
            $(".RemoveCyclicBroadcast").click(
                function() {
                    var cyclic_broadcast = $(this).parent().parent()
                    jyzz_ajax_zmq("RemoveCyclicBroadcast", [parseInt(cyclic_broadcast.attr('index')) + 1], function(data) {
                        $("#GetCyclicBroadcast").click();
                    });
                    return false;
                });
        });
        $("#GetCyclicBroadcast").click();
		//添加定时循环公告
        $("#InsertCyclicBroadcast").click(function() {
            var parent = $(this).parent().parent();
            BootstrapDialog.show({
                type: BootstrapDialog.TYPE_SUCCESS,
                closeByBackdrop: false,
                title: '添加公告',
                message: '<h5>公告：</h5><textarea class="form-control" id="cyclic_broadcast" rows="5" placeholder="公告不要少于四个字"></textarea><h5>时间：</h5><input type="text" id="daterange" class="form-control"/><h5>定时（分钟）：</h5><input type="text" class="form-control" id="cyclic_broadcast_interval" value="10">',
                onshown: function(dialog) {
                    $('#daterange').daterangepicker({
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
                            timePicker: true,
                            timePicker12Hour: false,
                            timePickerIncrement: 10,
                            timePickerSeconds: false,
                            minDate: moment()
                        },
                        function(start, end) {
                            $('#daterange').val(start.format("YYYY-MM-DD HH:mm:ss") + ' - ' + end.format("YYYY-MM-DD HH:mm:ss"));
                        });
                    $('#daterange').data('daterangepicker').notify();
                },
                buttons: [{
                    label: '关闭',
                    action: function(dialog) {
                        dialog.close();
                    }
                }, {
                    label: '添加',
                    cssClass: 'btn-primary',
                    action: function(dialog) {
                        var msg = $('#cyclic_broadcast').val();
                        var interval = parseInt($('#cyclic_broadcast_interval').val()) * 60;
                        if (msg.trim() == 0) return tips("请填写公告", "danger");
                        if (isNaN(interval)) return tips("请填写正确的时间", "danger");

                        jyzz_ajax_zmq("InsertCyclicBroadcast", [{
                            "msg": msg,
                            "interval": interval,
                            "start_time": $('#daterange').data('daterangepicker').startDate.unix(),
                            "end_time": $('#daterange').data('daterangepicker').endDate.unix()
                        }], function(data) {
                            tips("操作成功");
                            dialog.close();
                            setTimeout(function() {
                                $("#GetCyclicBroadcast").click()
                            }, 1200)
                        });
                    }
                }]
            });
            return false;
        });
*/		
        $('#mail-daterange').daterangepicker({
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
                timePicker: true,
                timePicker12Hour: false,
                timePickerIncrement: 10,
                timePickerSeconds: false,
                minDate: moment()
            },
            function(start, end) {
                $('#mail-daterange').val(start.format("YYYY-MM-DD HH:mm:ss") + ' -- ' + end.format("YYYY-MM-DD HH:mm:ss"));
            });
        $('#mail-daterange').data('daterangepicker').notify();
		
        bind_enter("ReloadMoudleName", "ReloadMoudle");
		
		
		
		
		
		
		//添加游戏公告
		bind("GetBroadcast", function(data) {
            data = data["lists"]
            var NoticeBroadcast = $("#NoticeBroadcast")
            NoticeBroadcast.empty();
            if (data.length == 0) {
                NoticeBroadcast.prev().addClass("hide")
                NoticeBroadcast.text("暂无公告");
                return;
            }

            NoticeBroadcast.prev().removeClass("hide")
            for (var i = 0; i < data.length; i++) {
                NoticeBroadcast.append('<div class="panel panel-default" index="' + i + '"><div class="panel-body">' +
                    '<strong>公告：</strong>' + data[i].msg + '<a href="#" class="pull-right RemoveBroadcast"><span class="glyphicon glyphicon-remove"></span></a><br />' +
                    '<strong>开始时间：</strong>' + moment.unix(data[i].start_time).format('YYYY/MM/DD HH:mm:ss')  + '<br />' +
                    '<strong>结束时间：</strong>' + moment.unix(data[i].end_time).format('YYYY/MM/DD HH:mm:ss') + '' +
                    '</div></div>');
            };
			//删除公告
            $(".RemoveBroadcast").click(
                function() {
                    var notice_broadcast = $(this).parent().parent()
                    jyzz_ajax_zmq("RemoveBroadcast", [parseInt(notice_broadcast.attr('index')) + 1], function(data) {
                        $("#GetBroadcast").click();
                    });
                    return false;
                });
				
				
	        //修改公告
         // $(".UpdateBroadcast").click(
         //    function() {
         //           var notice_broadcast = $(this).parent().parent()
         //           jyzz_ajax_zmq("UpdateBroadcast", [parseInt(notice_broadcast.attr('index')) + 1], function(data) {
         //               $("#GetBroadcast").click();
         //           });
         //           return false;
		//	});	
		});
			
        $("#GetBroadcast").click();

        $("#InsertBroadcast").click(function() {
            var parent = $(this).parent().parent();
            BootstrapDialog.show({
                type: BootstrapDialog.TYPE_SUCCESS,
                closeByBackdrop: false,
                title: '添加公告',
                message: '<h5>公告：</h5><textarea class="form-control" id="notice_broadcast" rows="5" placeholder="公告不要少于四个字"></textarea><h5>开始--结束时间：</h5><input type="text" id="daterange2" class="form-control"/>',
                onshown: function(dialog) {
                    $('#daterange2').daterangepicker({
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
                            timePicker: true,
                            timePicker12Hour: false,
                            timePickerIncrement: 10,
                            timePickerSeconds: false,
                            minDate: moment()
                        },
                        function(start, end) {
                            $('#daterange2').val(start.format("YYYY-MM-DD HH:mm:ss") + ' -- ' + end.format("YYYY-MM-DD HH:mm:ss"));
                        });
                    $('#daterange2').data('daterangepicker').notify();
                },
                buttons: [{
                    label: '关闭',
                    action: function(dialog) {
                        dialog.close();
                    }
                }, {
                    label: '添加',
                    cssClass: 'btn-primary',
                    action: function(dialog) {
                        var msg = $('#notice_broadcast').val();
                        //var interval = parseInt($('#notice_broadcast_interval').val()) * 60;
                        if (msg.trim() == 0) return tips("请填写公告", "danger");
                        //if (isNaN(interval)) return tips("请填写正确的时间", "danger");

                        jyzz_ajax_zmq("InsertBroadcast", [{
                            "msg": msg, 
                            "start_time": $('#daterange2').data('daterangepicker').startDate.unix(),
                            "end_time": $('#daterange2').data('daterangepicker').endDate.unix()
                        }], function(data) {
                            tips("操作成功");
                            dialog.close();
                            setTimeout(function() {
                                $("#GetBroadcast").click()
                            }, 1200)
                        });
                    }
                }]
            });
            return false;
        });
		
		
		//激活码的配置
		$("#UploadKey").click(function(evt) {
            var file = $("#UploadKeyFile").prop('files')[0];

            if (!file) return false;

            if (!/\.(sql)$/.test(file.name)) {
                tips("只允许sql文件。", "danger");
                return false;
            }
            if (file.size > 1024 * 1024) {
                tips("文件居然大于1M了，选错了吧。", "danger");
                return false;
            }

            var reader = new FileReader();
            reader.onload = function(f) {
                file_result = f.target.result
                $("#UploadConfig").click()
            }
            reader.readAsText(file);
            return true;
        });
		
		bind("UploadKey", function(data, someerror) {
            if (!someerror) {
                BootstrapDialog.show({
                    type: BootstrapDialog.TYPE_SUCCESS,
                    title: '提示',
                    message: '是否立刻执行？',
                    buttons: [{
                        label: '放弃',
                        action: function(dialog) {
                            dialog.close();
                        },
                    }, {
                        label: '确定',
                        cssClass: 'btn-primary',
                        action: function(dialog) {
                            tips("操作成功")
                            dialog.close();
                        }
                    }]
                });
            }
        }, function() {
            var file = $("#UploadConfigFile").prop('files')[0];
            return [file.name, file_result]
        })

            
});
