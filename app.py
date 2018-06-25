from flask import Flask, redirect, url_for, request, jsonify
from flask import render_template
from pymongo import MongoClient
import json
from bson import json_util
from bson.json_util import dumps
from urllib.request import Request, urlopen
from urllib.parse import urlencode, quote_plus

app = Flask(__name__)

@app.route("/")
def index():
     return render_template("AirKorea.html")

@app.route("/GeoKorea")
def GeoKorea():
    return render_template("GeoKorea.html")
	
@app.route("/AirKorea")
def AirKorea():
    return render_template("AirKorea.html")
	
	
@app.route("/weather/getDataList")
def weather_getDataList():
	url = 'http://openapi.airkorea.or.kr/openapi/services/rest/ArpltnInforInqireSvc/getCtprvnMesureLIst'
	queryParams = '?ServiceKey=GJ1tp3lEQ1iVlqoBNJw8DTJ37Y5ps5rsvI0%2FpvMxSTMsD2Yb6SiYx4KorBR65HB3bM53FCAYUo8dZ2gg65MZ%2Bw%3D%3D&' + urlencode({ quote_plus('numOfRows') : '24', quote_plus('pageNo') : '1', quote_plus('itemCode') : 'PM10', quote_plus('dataGubun') : 'HOUR', quote_plus('searchCondition') : 'WEEK', quote_plus('_returnType') : 'json'  })
	request = Request(url + queryParams)
	request.get_method = lambda: 'GET'
	response_body = urlopen(request).read()
	return response_body

@app.route("/weather/getAboveDataList")
def weather_getAboveDataList():
	url = 'http://openapi.airkorea.or.kr/openapi/services/rest/ArpltnInforInqireSvc/getUnityAirEnvrnIdexSnstiveAboveMsrstnList'
	queryParams = '?ServiceKey=GJ1tp3lEQ1iVlqoBNJw8DTJ37Y5ps5rsvI0%2FpvMxSTMsD2Yb6SiYx4KorBR65HB3bM53FCAYUo8dZ2gg65MZ%2Bw%3D%3D&' + urlencode({ quote_plus('numOfRows') : '20', quote_plus('pageNo') : '1', quote_plus('_returnType') : 'json'  })
	request = Request(url + queryParams)
	request.get_method = lambda: 'GET'
	response_body = urlopen(request).read()
	return response_body
	
@app.route("/weather/getCtprvnDataList/<sido_name>")
def weather_getCtprvnDataList(sido_name):
	url = 'http://openapi.airkorea.or.kr/openapi/services/rest/ArpltnInforInqireSvc/getCtprvnMesureSidoLIst'
	queryParams = '?ServiceKey=GJ1tp3lEQ1iVlqoBNJw8DTJ37Y5ps5rsvI0%2FpvMxSTMsD2Yb6SiYx4KorBR65HB3bM53FCAYUo8dZ2gg65MZ%2Bw%3D%3D&' + urlencode({ quote_plus('numOfRows') : '40', quote_plus('startPage') : '1', quote_plus('pageSize') : '10', quote_plus('pageNo') : '1', quote_plus('sidoName') :  sido_name ,quote_plus('searchCondition') : 'HOUR', quote_plus('_returnType') : 'json'  })
	request = Request(url + queryParams)
	request.get_method = lambda: 'GET' 
	response_body = urlopen(request).read()
	return response_body


if __name__ == "__main__":
    app.run(host='0.0.0.0',port=5000,debug=True)