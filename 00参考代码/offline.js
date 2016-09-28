$(document).ready(
    function() {
        settingbind("getOfflineDbData",function(data) {
            data = data["total"]
            document.getElementById("OfflineList").innerHTML=data
            var tbody = $("<tbody id='OfflineList'></tbody>");
            //for (var i = 0; i < data.length; i++) {
                var tr = $('<tr></tr>');
                tr.append("<td>总人数：" + data[0].total_account + "</td>");
                tr.append('<td>总时间：' + data[0].total_online_time + ' 秒</td>');
                tr.append('<td>平均在线时间：' + data[0].average_time + ' 秒</td>');
                tbody.append(tr);
            //}
            $("#OfflineList").replaceWith(tbody);
            
        },function() {
            return [Number(document.getElementById("serverid").value)];
        });
});		