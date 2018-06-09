#-*- coding:cp949 -*-
from flask import Flask
from flask import render_template
from flask import request
from flask import abort

from pprint import pprint

app = Flask(__name__)
@app.route("/")
def GetCoordinate():
    #f = open('GetCoordinate.js','r')
    #pprint(request)
    #pprint(request.headers)
    methods = ['GET', 'POST'];
    coordinateData = {
        'start' : request.args.get('start'),
        'dest' : request.args.get('dest')
    }
    if all(coordinateData.values()) :
        return render_template('GetCoordinate.html', **coordinateData)
    else:
        print('wrong argument')
        abort(405)



if __name__ == "__main__" :
    app.run(host='0.0.0.0', port=13070)