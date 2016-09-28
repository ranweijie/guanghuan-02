import sys
import os

import bottle
import json
import zipfile
import tempfile
import base64

import static
import install
import db
import activation

#最大上限
bottle.BaseRequest.MEMFILE_MAX = 10 * 1024 * 1024

#模版管理
bottle.TEMPLATE_PATH.append('./tpl')
def error(message):
    raise bottle.HTTPResponse(bottle.template('error.html', msg=message))
def template(html, *a, **ka):
    return bottle.template('main', content=html, *a, **ka)
def fail(message):
    return json.dumps({"success":False,"message":message})

bottle.ERROR_PAGE_TEMPLATE = """
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title>霸王GM工具</title>
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link type="text/css" href="/css/bootstrap.min.css" rel="stylesheet">
    <link type="text/css" href="/css/jyzz.css" rel="stylesheet">
</head>
<body spellcheck="false">
    <div class="container">
        <div class="col-sm-offset-3 col-sm-6">
            <div class="panel panel-warning">
                <div class="panel-heading">暂时无法提供服务</div>
                <div class="panel-body">
                <h1>{{e.status}} <small>{{e.body}}</small></h1>
                    <a href="/">返回首页试试</a>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
"""

#登录
ip_cache = {}
users_cache = {}
def login(username, password):
    result = False
    bottle.TEMPLATES.clear()    #清除模板缓存
    if username in users_cache:
        result = password==users_cache[username]["pass"]
    else:
        sql = {}
        sql["name"] = str(username)
        sql["pass"] = str(password)
        data = db.find_one_mongodb(sql)
        if data:
            users_cache[username] = {"pass":password, "authority":data["authority"]}
            result = True

    if result:
        ip = bottle.request.remote_addr
        if ip not in ip_cache:
            ip_cache[ip] = True
            db.log("登录", -1, json.dumps([username, ip], ensure_ascii=False))
    return result

#帮助选择服务器
def check_server():
    def decorator(func):
        import functools
        @functools.wraps(func)
        def wrapper(*a, **ka):
            server = bottle.request.query.getunicode('server')
            print("======================check_server======================")
            #获取服务器列表
            servers = install.ZMQSend("GetServerList")
            if not servers:
                return error("无法连接入口服务器")
            servers = json.loads(servers)
            servers = [item for item in servers if item not in [None]]
            #print("servers列表：",servers)
            if not servers:
                return error("无法连接入口服务器")

            #查看服务器是否开放
            if server!=None and server.isdigit():
                server = int(server) - 1
            else:
                bottle.redirect("/?server="+str(1))
            return func(server=server, servers=servers, *a, **ka)
        return wrapper
    return decorator

#权限管理
def HasAuthority(command):
    try:
        with open('data/authority.json', 'r') as json_data:
            authority = json.load(json_data)
            authority["authority0"].extend(authority["root"])
            return command in authority["authority" + str(users_cache[bottle.request.auth[0]]["authority"])]
    except Exception:
        pass
    return False

@bottle.get('/')
@bottle.auth_basic(login)
# @check_server()
def base(server, servers):
    return template('base.html', servers=servers, server=server, sidebar=True, HasAuthority=HasAuthority)

@bottle.get('/data')
@bottle.auth_basic(login)
# @check_server()
def data(server, servers):
    return template('data.html', servers=servers, server=server, sidebar=True, HasAuthority=HasAuthority)

@bottle.get('/role')
@bottle.auth_basic(login)
# @check_server()
def role(server, servers):
    return template('role.html', servers=servers, server=server, sidebar=True, HasAuthority=HasAuthority)

@bottle.get('/force')
@bottle.auth_basic(login)
# @check_server()
def role(server, servers):
    return template('force.html', servers=servers, server=server, sidebar=True, HasAuthority=HasAuthority)

@bottle.get('/support')
@bottle.auth_basic(login)
# @check_server()
def support(server, servers):
    return template('support.html', servers=servers, server=server, sidebar=True, HasAuthority=HasAuthority)

@bottle.get('/stat')
@bottle.auth_basic(login)
# @check_server()
def stat(server, servers):
    return template('stat.html', servers=servers, server=server, sidebar=True, HasAuthority=HasAuthority)

@bottle.get('/talk')
@bottle.auth_basic(login)
# @check_server()
def talk(server, servers):
    return template('talk.html', servers=servers, server=server, sidebar=True, HasAuthority=HasAuthority)

@bottle.get('/flow')
@bottle.auth_basic(login)
# @check_server()
def flow(server, servers):
    return template('flow.html', servers=servers, server=server, sidebar=True, HasAuthority=HasAuthority)
    
@bottle.get('/activity')
@bottle.auth_basic(login)
# @check_server()
def activity(server, servers):
    if not HasAuthority("GetActivityConfig"):
        return error("您没有权限使用此功能")
    return template('activity.html', servers=servers, server=server, sidebar=True, HasAuthority=HasAuthority)

@bottle.post('/manager')
@bottle.auth_basic(login)
def manager():
    data = bottle.request.forms.getunicode('data')
    data = json.loads(data)
    cmd = data['cmd']
    server = data['server']
    params = data['params']
    print(data)
    #检查权限
    if not HasAuthority(cmd):
        return fail("您没有权限使用此功能")

    #获取服务器列表
    servers = install.ZMQSend("GetServerList")
    if not servers:
        return fail("无法获取当前服务器信息")
    servers = json.loads(servers)
    servers = [item for item in servers if item not in [None]]
    if not servers:
        return fail("当前没有开放的服务器")


    #查看服务器是否开放
    if server!=None and server.isdigit():
        server = int(server) - 1
        #if server<0 or server>=len(servers) or not 'ip' in servers[server]:
            #return fail("当前服务器没有开放")
        #if install.ZMQSend("ping", [], servers[server]["addr"])!='"pong"':
            #return fail("当前服务器无法连接")

    #写入日志
    db.log(cmd, server, json.dumps(params, ensure_ascii=False))

    timeout=100
    if cmd=='reloadAllCfg' or cmd=='SetActivityConfig':
        timeout=5*1000
    game_serv = "tcp://"+servers[server]["ip"] + ":" + str(58888)
    #print(cmd,params,game_serv)
    ret_str = install.ZMQSend(cmd,params,game_serv,timeout)
    #print(ret_str)
    if not ret_str:
        return fail("应答超时")

    ret = json.loads(ret_str)
    if not isinstance(ret, dict) or "result" not in ret:
        return fail("服务器返回数据格式错误")
    return ret_str

@bottle.post('/db')
@bottle.auth_basic(login)
def dbmanager():
    data = bottle.request.forms.getunicode('data')
    data = json.loads(data)
    cmd = data['cmd']
    server = data['server']
    params = data['params']
    print(data)
    #game数据库，或log数据库
    dbindex = "log" in params and "log" or "game"
    #检查权限
    if not HasAuthority(cmd):
        return fail("您没有权限使用此功能")

    #获取服务器列表
    servers = install.ZMQSend("GetServerList")
    if not servers:
        return fail("无法获取当前服务器信息")
    servers = json.loads(servers)
    servers = [item for item in servers if item not in [None]]
    if not servers:
        return fail("无法获取当前服务器信息")

    #查看服务器是否开放
    if server!=None and server.isdigit():
        server = int(server) - 1
        game_serv = "tcp://"+servers[server]["ip"] + ":" + str(58888)
        res_db_source = install.ZMQSend("GetDb",[],game_serv)
        #print(res_db_source)
        if server<0 or server>=len(servers)  :
            return fail("当前服务器没有开放")
        elif res_db_source == None:
            return fail("**"+servers[server]["name"]+"**服务器没有返回正确的数据库信息！")
        db_source = json.loads(res_db_source)["msg"][dbindex]
        
        #增加默认端口号
        if "port" not in db_source:
            db_source["port"] = 27017
        if not db.can_connect(db_source):
            return fail("当前服务器数据库无法连接")

    #写入日志
    db.log(cmd, server, json.dumps(params, ensure_ascii=False))
    
    #删除params中的"game"或"log"
    if "log" in params:
        params.remove("log")
    if "game" in params:
        params.remove("game")
    
    ret = db.handle(db_source, cmd, params)
    if not isinstance(ret, dict) or "success" not in ret or (not ret["success"] and "message" not in ret):
        return fail("应答超时")

    return json.dumps(ret)

#注销
@bottle.get('/logout')
def logout():
    res = bottle.HTTPResponse(bottle.template('logout.html'))
    res.status = 401
    raise res
    
@bottle.get('/setting')
@bottle.auth_basic(login)
def setting():
    if not HasAuthority("setting"):
        return error("您没有权限使用此功能")
    return template('setting.html', sidebar=False, HasAuthority=HasAuthority)

@bottle.get('/income')
@bottle.auth_basic(login)
def income():
    if not HasAuthority("income"):
        return error("您没有权限使用此功能")

    with open('data/servers.json', 'rb') as json_data:
        game_servers = json.loads(json_data.read().decode('utf-8'))

    return template('income.html', sidebar=False, HasAuthority=HasAuthority, servers=game_servers)

@bottle.get('/offline')
@bottle.auth_basic(login)
def offline():
    if not HasAuthority("offline"):
        return error("您没有权限使用此功能")
    with open('data/servers.json', 'rb') as json_data:
        game_servers = json.loads(json_data.read().decode('utf-8'))
        
    return template('offline.html', sidebar=False, HasAuthority=HasAuthority,servers=game_servers)
    
@bottle.get('/log')
@bottle.auth_basic(login)
def log_get():
    if not HasAuthority("searchlog"):
        return error("您没有权限使用此功能")
    #获取服务器列表
    servers = install.ZMQSend("GetServerList")
    if not servers:
        return fail("无法获取当前服务器信息")
    servers = json.loads(servers)
    servers = [item for item in servers if item not in [None]]
    if not servers:
        return fail("无法获取当前服务器信息")

    with open('data/servers.json', 'rb') as json_data:
        game_servers = json.loads(json_data.read().decode('utf-8'))

    with open('json/items.json', 'rb') as json_data:
        item_type = json.loads(json_data.read().decode('utf-8'))

    with open('json/log_type.json', 'rb') as json_data:
        log_type = json.loads(json_data.read().decode('utf-8'))

    with open('json/log_from.json', 'rb') as json_data:
        log_from = json.loads(json_data.read().decode('utf-8'))
        
    with open('json/cost_type.json', 'rb') as json_data:
        cost_type = json.loads(json_data.read().decode('utf-8'))
        
    with open('json/shop.json', 'rb') as json_data:
        shop = json.loads(json_data.read().decode('utf-8'))

    return template('log.html', sidebar=False, HasAuthority=HasAuthority, servers=game_servers,item_type =item_type,log_type=log_type, log_from=log_from, cost_type=cost_type, shop=shop)
   
@bottle.get('/consume')
@bottle.auth_basic(login)
def consume():
    if not HasAuthority("consume"):
        return error("您没有权限使用此功能")

    with open('data/servers.json', 'rb') as json_data:
        game_servers = json.loads(json_data.read().decode('utf-8'))

    with open('json/consume_type.json', 'rb') as json_data:
        consume_type = json.loads(json_data.read().decode('utf-8'))

    with open('json/cost_type.json', 'rb') as json_data:
        cost_type = json.loads(json_data.read().decode('utf-8'))        
        
    with open('json/shop_type.json', 'rb') as json_data:
        shop_type = json.loads(json_data.read().decode('utf-8'))

    return template('consume.html', sidebar=False, HasAuthority=HasAuthority, servers=game_servers, consume_type=consume_type, cost_type=cost_type, shop_type=shop_type)

@bottle.post('/setting')
@bottle.auth_basic(login)
def setting_post():
    data = bottle.request.forms.getunicode('data')
    data = json.loads(data)
    print(data)
    cmd = data['cmd']
    params = data['params']

    #检查权限
    if not HasAuthority(cmd):
        return fail("您没有权限使用此功能")

    #写入日志
    db.log(cmd, -1, json.dumps(params, ensure_ascii=False))

    ret = db.setting_handle(cmd, params)
    if not isinstance(ret, dict) or "success" not in ret or (not ret["success"] and "message" not in ret):
        return fail("应答超时")

    return json.dumps(ret)

@bottle.get('/activation')
@bottle.auth_basic(login)
def activation_get():
    if not HasAuthority("activation"):
        return error("您没有权限使用此功能")
    return template('activation.html', sidebar=False, HasAuthority=HasAuthority)
    
@bottle.get('/global')
@bottle.auth_basic(login)
# @check_server()
def global_get(server, servers):
    return template('global.html', servers=servers, server=server, sidebar=True, HasAuthority=HasAuthority) 

@bottle.get('/mail')
@bottle.auth_basic(login)
# @check_server()
def global_get(server, servers):
    return template('mail.html', servers=servers, server=server, sidebar=True, HasAuthority=HasAuthority)   

@bottle.get('/QA')
@bottle.auth_basic(login)
# @check_server()
def global_get(server, servers):
    return template('QA.html', servers=servers, server=server, sidebar=True, HasAuthority=HasAuthority) 

@bottle.get('/Guild')
@bottle.auth_basic(login)
# @check_server()
def global_get(server, servers):
    return template('Guild.html', servers=servers, server=server, sidebar=True, HasAuthority=HasAuthority)  

@bottle.get('/Order')
@bottle.auth_basic(login)
# @check_server()
def global_get(server, servers):
    return template('Order.html', servers=servers, server=server, sidebar=True, HasAuthority=HasAuthority)  

    
@bottle.post('/activation')
@bottle.auth_basic(login)
def activation_post():
    data = bottle.request.forms.getunicode('data')
    data = json.loads(data)
    print(data)
    cmd = data['cmd']
    params = data['params']

    #检查权限
    if not HasAuthority(cmd):
        return fail("您没有权限使用此功能")

    #写入日志
    db.log(cmd, -1, json.dumps(params, ensure_ascii=False))

    ret = activation.handle(cmd, params)
    if not isinstance(ret, dict) or "success" not in ret or (not ret["success"] and "message" not in ret):
        return fail("应答超时")

    return json.dumps(ret)

@bottle.get('/batch')
@bottle.auth_basic(login)
def batch():
    #获取服务器列表
    servers = install.ZMQSend("GetServerList")
    if not servers:
        return error("无法连接入口服务器")
    servers = json.loads(servers)
    servers = [item for item in servers if item not in [None]]
    if not servers:
        return error("无法连接入口服务器")


    #在所有的服务器中寻找开放的服务器
    open_server = None
    for index, server in enumerate(servers):
        if 'addr' in server:
            if install.ZMQSend("ping", [], server["addr"])=='"pong"':
                open_server = index + 1
                break
    if open_server==None:
        return error("当前没有开放的服务器")
    return template('batch.html', servers=servers, sidebar=False, HasAuthority=HasAuthority)

@bottle.post('/batch')
@bottle.auth_basic(login)
def batch_post():
    data = bottle.request.forms.getunicode('data')
    data = json.loads(data)
    print(data)
    cmd = data['cmd']
    params = data['params']

    #检查权限
    if not HasAuthority(cmd):
        return fail("您没有权限使用此功能")

    #获取服务器列表
    servers = install.ZMQSend("GetServerList")
    if not servers:
        return fail("无法获取当前服务器信息")
    servers = json.loads(servers)
    servers = [item for item in servers if item not in [None]]
    if not servers:
        return fail("无法获取当前服务器信息")

    #写入日志
    db.log(cmd, -1, json.dumps(params, ensure_ascii=False))

    #解析批量参数
    select_servers = params['servers']
    params = params['params']

    someerror = False
    ret = []
    ret_data = []
    for server in select_servers:
        #查看服务器是否开放
        server = int(server) - 1
        if server<0 or server>=len(servers) or not 'addr' in servers[server]:
            ret.append("服务器{0}：没有开放".format(server + 1))
            someerror = True
            continue

        if install.ZMQSend("ping", [], servers[server]["addr"])!='"pong"':
            ret.append("服务器{0}：无法连接".format(server))
            someerror = True
            continue

        #开始执行命令
        timeout=100
        if cmd=='reloadAllCfg' or cmd=='SetActivityConfig':
            timeout=5*1000
        ret_str = install.ZMQSend(cmd, params, servers[server]["addr"], timeout)
        if not ret_str:
            ret.append("服务器{0}：应答超时".format(server + 1))
            someerror = True
            continue

        #检查返回结果
        result = json.loads(ret_str)
        if not isinstance(result, dict) or "success" not in result or (not result["success"] and "message" not in result):
            ret.append("服务器{0}：返回数据格式错误".format(server + 1))
            someerror = True
            continue
        if not result["success"]:
            ret.append("服务器{0}：{1}".format(server + 1, result["message"]))
            someerror = True
            continue
        else:
            ret_data.append({"server":server + 1, "data":result})

    data=[]

    if cmd=='GetConfig':
        tmpfd, tempfilename = tempfile.mkstemp()
        os.close(tmpfd)

        zipFile = zipfile.ZipFile(tempfilename, mode="w", compression=zipfile.ZIP_DEFLATED)

        for server_ret in ret_data:
            server = server_ret["server"]
            server_data = server_ret["data"]
            for file_data in server_data["data"]:
                if file_data["success"]:
                    zipFile.writestr("{0}/{1}".format(server, file_data["name"]), file_data["data"])
                else:
                    someerror = True
                    ret.append("服务器{0}：{1}".format(server, file_data["message"]))

        zipFile.close()

        data = ""
        try:
            with open(tempfilename, 'rb') as f:
                data = f.read()
        except Exception:
            pass

        os.unlink(tempfilename)

        data = base64.b64encode(data).decode('utf8')
    elif cmd=='GetConfig2':
        pass

    return json.dumps({"success":True, "someerror":someerror, "message":"".join(ret), "data":data})

def main():
    if len(sys.argv) < 2 or not sys.argv[1].isdigit():
        print("用法：python3 ./webgm.py 端口号")
        print("例如：python3 ./webgm.py 8080")
        print()
        os.system("pause")
    else:
        bottle.run(server='tornado', host='0.0.0.0', port=sys.argv[1], reloader=True)
        #bottle.run(host='0.0.0.0', port=sys.argv[1])
if __name__ == '__main__':
    main()