//import * from 'http://dapi.kakao.com/v2/maps/sdk.js?appkey=e1acecebf46d57ed7e9d58a90f864374&libraries=services';
var http = require('http')
  , vm = require('vm')
  , concat = require('concat-stream')
  , async = require('async');

function http_require(url, callback) {
  http.get(url, function(res) {
    // console.log('fetching: ' + url)
    res.setEncoding('utf8');
    res.pipe(concat({encoding: 'string'}, function(data) {
      callback(null, vm.runInThisContext(data));
    }));
  })
}

urls = [
  '//dapi.kakao.com/v2/maps/sdk.js?appkey=e1acecebf46d57ed7e9d58a90f864374&libraries=services'
]

async.map(urls, http_require, function(err, results) {
  // `results` is an array of values returned by `runInThisContext`
  // the rest of your program logic
});

function getCoordinate(x,y)
{
    return new daum.maps.LatLng(37, 127);
}