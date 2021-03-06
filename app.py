from flask import Flask, redirect, url_for, request, jsonify
from flask import render_template
import json
from urllib.request import Request, urlopen
from urllib.parse import urlencode, quote_plus

app = Flask(__name__)

@app.route("/")
def index():
     return render_template("AirKorea.html")
	
@app.route("/AirKorea")
def AirKorea():
    return render_template("AirKorea.html")
	
	
@app.route("/weather/getDataList")
def weather_getDataList():
	url = 'http://openapi.airkorea.or.kr/openapi/services/rest/ArpltnInforInqireSvc/getCtprvnMesureLIst'
	queryParams = '?ServiceKey=Yourkey&' + urlencode({ quote_plus('numOfRows') : '24', quote_plus('pageNo') : '1', quote_plus('itemCode') : 'PM10', quote_plus('dataGubun') : 'HOUR', quote_plus('searchCondition') : 'WEEK', quote_plus('_returnType') : 'json'  })
	request = Request(url + queryParams)
	request.get_method = lambda: 'GET'
	response_body = urlopen(request).read()
	return response_body

@app.route("/weather/getAboveDataList")
def weather_getAboveDataList():
	url = 'http://openapi.airkorea.or.kr/openapi/services/rest/ArpltnInforInqireSvc/getUnityAirEnvrnIdexSnstiveAboveMsrstnList'
	queryParams = '?ServiceKey=Yourkey' + urlencode({ quote_plus('numOfRows') : '20', quote_plus('pageNo') : '1', quote_plus('_returnType') : 'json'  })
	request = Request(url + queryParams)
	request.get_method = lambda: 'GET'
	response_body = urlopen(request).read()
	return response_body
	
@app.route("/weather/getCtprvnDataList/<sido_name>")
def weather_getCtprvnDataList(sido_name):
	url = 'http://openapi.airkorea.or.kr/openapi/services/rest/ArpltnInforInqireSvc/getCtprvnMesureSidoLIst'
	queryParams = '?ServiceKey=Yourkey' + urlencode({ quote_plus('numOfRows') : '40', quote_plus('startPage') : '1', quote_plus('pageSize') : '10', quote_plus('pageNo') : '1', quote_plus('sidoName') :  sido_name ,quote_plus('searchCondition') : 'HOUR', quote_plus('_returnType') : 'json'  })
	request = Request(url + queryParams)
	request.get_method = lambda: 'GET' 
	response_body = urlopen(request).read()
	return response_body


if __name__ == "__main__":
    app.run(host='0.0.0.0',port=80,debug=True)
