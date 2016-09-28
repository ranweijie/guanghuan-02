import bottle

@bottle.route('/js/<filepath:path>')
def js_views(filepath):
    return bottle.static_file(filepath,root='js/',mimetype = 'application/x-javascript')

@bottle.route('/css/<filepath:path>')
def css_views(filepath):
	return bottle.static_file(filepath,root='css/',mimetype = 'text/css')

@bottle.route('/fonts/<filepath:path>')
def fonts_views(filepath):
	return bottle.static_file(filepath,root='fonts/')
    
@bottle.route('/json/<filepath:path>')
def json_views(filepath):
    return bottle.static_file(filepath,root='json/',mimetype = 'application/json')

@bottle.route('/img/<filepath:path>')
def img_views(filepath):
    return bottle.static_file(filepath,root='img/')

@bottle.route('/favicon.ico')
def icon_views():
    return bottle.static_file("favicon.ico",root='img/')