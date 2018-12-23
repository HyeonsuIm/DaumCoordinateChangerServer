window.addEventListener("contextmenu", e => {
  e.preventDefault();
});

// 1. 지도 띄우기
var map;
var markerLayer;
function initTmap(){
    map = new Tmap.Map({
        div:'map_div'
    });
    map.setCenter(new Tmap.LonLat("126.986072", "37.570028").transform("EPSG:4326", "EPSG:3857"), 15);
    map.events.register("mousedown", map, OnMouseDown);

    markerLayer = new Tmap.Layer.Markers();
    map.addLayer(markerLayer);
}

var lastMarker;

var size = new Tmap.Size(24, 38);
var offset = new Tmap.Pixel(-(size.w / 2), -size.h);
function OnMouseDown(e)
{
    if( e.which != 3 )
    {
        return false;
    }

    RemoveContextMenu()
    RemoveMarker(lastMarker);
    var lonlat = map.getLonLatFromViewPortPx(e.xy).transform("EPSG:3857", "EPSG:4326");//클릭한 부분의 ViewPorPx를 LonLat로 변환합니다

    var icon = new Tmap.IconHtml("<img src='http://tmapapis.sktelecom.com/upload/tmap/marker/pin_b_m_a.png' />", size, offset);
    var marker = new Tmap.Marker(lonlat.transform("EPSG:4326", "EPSG:3857"), icon);
    lastMarker = new MakeMarker(marker, lonlat);

    $("<div class='map-custom-menu'>" +
        "<button onclick='SetStartingPoint()'>출발</button>" +
        "<br>" +
        "<button onclick='SetDestination()'>목적</button>" +
    "</div>")
    .appendTo("body")
    .css({top: e.pageY + "px", left: e.pageX + "px"});
    UpdateMarker(markerLayer);

    e.preventDefault();
    return false;
}

function RemoveContextMenu()
{
    $("div.map-custom-menu").remove();
}

var isSetStartPoint = false;
var startPointLonLat;
var startMarker;
function SetStartingPoint(e)
{
    RemoveContextMenu()
    if( true == isSetStartPoint )
    {
        RemoveStartingPoint();
    }
    var icon = new Tmap.IconHtml("<img src='http://tmapapis.sktelecom.com/upload/tmap/marker/pin_r_m_s.png' />", size, offset)
    startMarker = new Tmap.Marker(lastMarker.lonlat, icon);
    markerLayer.addMarker(startMarker);
    isSetStartPoint = true;

    StartRoute();
}

function RemoveStartingPoint()
{
    markerLayer.removeMarker(startMarker);
    isSetStartPoint = false;
}

var isSetDestPoint = false;
var destPointLonLat;
var destMarker;
function SetDestination()
{
    RemoveContextMenu()
    if( true == isSetDestPoint )
    {
        RemoveDestination();
    }
    var icon = new Tmap.IconHtml("<img src='http://tmapapis.sktelecom.com/upload/tmap/marker/pin_r_m_e.png' />", size, offset)
    destMarker = new Tmap.Marker(lastMarker.lonlat, icon);
    markerLayer.addMarker(destMarker);
    isSetDestPoint = true;

    StartRoute();
}

function RemoveDestination()
{
    markerLayer.removeMarker(destMarker);
    isSetDestPoint = false;
}

function RemoveStartDest()
{
    RemoveStartingPoint();
    RemoveDestination();
}

var routeLayer;
function StartRoute()
{
    if( false == isSetStartPoint ||
        false == isSetDestPoint )
    {
        return;
    }

    // 4. 경로 탐색 API 사용요청
    var pr_3857 = new Tmap.Projection("EPSG:3857");//EPSG:3857 좌표계 인스턴스 생성합니다.
    var pr_4326 = new Tmap.Projection("EPSG:4326");//EPSG:4326 좌표계 인스턴스 생성합니다.
    var startLonLat = startMarker.lonlat.transform(pr_3857, pr_4326);
    var destLonLat = destMarker.lonlat.transform(pr_3857, pr_4326);
    var startX = startLonLat.lon
    var startY = startLonLat.lat;
    var endX = destLonLat.lon;
    var endY = destLonLat.lat;

    CalculateRoute(startX, startY, endX, endY);
}

function CalculateRoute(startX, startY, endX, endY)
{
    var prtcl;
    var headers = {};
    headers["appKey"]="dc65b12b-9750-4e55-a14b-54d192a0f496";
    $.ajax({
            method:"POST",
            headers : headers,
            url:"https://api2.sktelecom.com/tmap/routes?version=1&format=xml",//
            async:false,
            data:{
                startX : startX,
                startY : startY,
                endX : endX,
                endY : endY,
                reqCoordType : "WGS84GEO",
                resCoordType : "EPSG3857",
                angle : "172",
                searchOption : "0",
                trafficInfo : "Y" //교통정보 표출 옵션입니다.
            },
            success:function(response){
                prtcl = response;

            //5. 경로탐색 결과 Line 그리기
            var trafficColors = {
                    extractStyles:true,

                    /* 실제 교통정보가 표출되면 아래와 같은 Color로 Line이 생성됩니다. */
                    trafficDefaultColor:"#000000", //Default
                    trafficType1Color:"#009900", //원할
                    trafficType2Color:"#FFC000", //지체
                    trafficType3Color:"#FF0000", //정체

                };

            if( typeof routeLayer !== 'undefined'){
                routeLayer.removeAllFeatures();//레이어의 모든 도형을 지웁니다.
            }
            var kmlForm = new Tmap.Format.KML(trafficColors).readTraffic(prtcl);
            routeLayer = new Tmap.Layer.Vector("vectorLayerID"); //백터 레이어 생성
            routeLayer.addFeatures(kmlForm); //교통정보를 백터 레이어에 추가

            map.addLayer(routeLayer); // 지도에 백터 레이어 추가
            // 6. 경로탐색 결과 반경만큼 지도 레벨 조정
		    map.zoomToExtent(routeLayer.getDataExtent());

		    var prtclString = new XMLSerializer().serializeToString(prtcl);//xml to String
            xmlDoc = $.parseXML( prtclString ),
            $xml = $( xmlDoc ),
            $intRate = $xml.find("Document");
            var tDistance = " 총 거리 : "+($intRate[0].getElementsByTagName("tmap:totalDistance")[0].childNodes[0].nodeValue/1000).toFixed(2)+"km<br>";
            var timeSec = $intRate[0].getElementsByTagName("tmap:totalTime")[0].childNodes[0].nodeValue;
            var tTime = " 총 시간 : "+ Math.floor(timeSec/60/60) + "시간 " + Math.floor(timeSec/60%60) + "분 " + (timeSec&60).toFixed(0) + "초";
            var resultDiv = document.getElementById("result");
            resultDiv.innerHTML = tDistance + tTime;
		    RemoveContextMenu();
		    RemoveStartDest();
        },
        error:function(request,status,error){
            console.log("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
        }
    });
}

var QueryType =
{
    Coordinate:1,
    Name:2
}

function IsAllDigit(query)
{
    return true;
}

function DistinguishQueryType(query)
{
    if( true == IsAllDigit(query) )
    {
        return QueryType.coordinate;
    }
    else
    {
        return QueryType.Name;
    }
}

var searchLonLat;
var searchMarker;
function ProcessCoordinate(query)
{
    var parseStr = query.trim().replace(' ', ',').split(',');
    var lonlat = new Tmap.LonLat(parseStr[1], parseStr[0]);
    searchLonLat = copyObj(lonlat);

    var icon = new Tmap.IconHtml("<img src='http://tmapapis.sktelecom.com/upload/tmap/marker/pin_b_m_a.png' />", size, offset);
    searchMarker = new Tmap.Marker(lonlat.transform("EPSG:4326", "EPSG:3857"), icon);
    markerLayer.addMarker(searchMarker);
    map.setCenter(lonlat, 15);
}

function Search()
{
    var query = document.getElementById('searchQuery').value;
    var queryType = DistinguishQueryType(query);
    if( QueryType.coordinate == queryType )
    {
        ProcessCoordinate(query);
    }
    else if( QueryType.Name == queryType )
    {
        ProcessName(query);
    }
}
