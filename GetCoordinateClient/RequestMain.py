import urllib3
import execjs

http = urllib3.PoolManager()
r = http.request('GET','http://localhost:5000/GetCoordinate')
javascriptText = r.data.decode('utf-8')
print(r)
ctx = execjs.compile(r)
ctx.call("getCoordinate", 1, 2)