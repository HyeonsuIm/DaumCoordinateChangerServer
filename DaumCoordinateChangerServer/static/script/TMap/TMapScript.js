window.addEventListener("contextmenu", e => {
  e.preventDefault();
});

var waypoint_list_view = new Vue({
    el: '#leftWayInput',
    data: {
        waypointList:[]
    }
  })

var route_result_view = new Vue({
    delimiters: ['${', '}'],
    el: '#leftResult',
    data: {
        distance:"",
        time:""
    }
  })
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

var size = new Tmap.Size(24, 38);
var offset = new Tmap.Pixel(-(size.w / 2), -size.h);
function OnMouseDown(e)
{
    if( e.which != 3 )
    {
        return false;
    }

    RemoveContextMenu()
    var lonlat = map.getLonLatFromViewPortPx(e.xy).transform("EPSG:3857", "EPSG:4326");//클릭한 부분의 ViewPorPx를 LonLat로 변환합니다
    SetLastMarker(lonlat);

    $("<div class='map-custom-menu'>" +
        "<button onclick='SetStartingPoint()'>출발</button>" +
        "<br>" +
        "<button onclick='SetWayPoint()'>경유</button>" +
        "<br>" +
        "<button onclick='SetDestination()'>목적</button>" +
    "</div>")
    .appendTo("body")
    .css({top: e.pageY + "px", left: e.pageX + "px"});
    RefreshView();
    e.preventDefault();
    return false;
}

function RemoveContextMenu()
{
    $("div.map-custom-menu").remove();
}

function AddWaypoint()
{              
    waypoint_list_view.waypointList.push({id:waypoint_list_view.waypointList.length, value:""}) 
}

function RemoveWaypoint(clickedTag)
{
    var wayPointList = $("#leftWayInput").children('div');
    var sortId = clickedTag.parentNode.parentNode.getAttribute('sortid');
    var index = 0;
    for( ; index < wayPointList.length ; ++index)
    {
        if( wayPointList[index].getAttribute('sortid') == sortId )
        {
            break;
        }
    }
    wayPointList[index].remove();
    SortWaypoint();
}

function SortWaypoint()
{
//    var wayPointList = $("#leftWayInput").children('div');
//    var currentSortId = 0;
//    
//    for( ; currentSortId < wayPointList.length ; ++currentSortId )
//    {
//        //get minimum sort id
//        var minimumSortId = wayPointList[currentSortId].getAttribute('sortid');
//        var minimumSortIdIdx = currentSortId;
//        var checkIdx = currentSortId + 1;
//        var isFind = false;
//        for( ; checkIdx < wayPointList.length ; ++checkIdx)
//        {
//            if ( minimumSortId > wayPointList[checkIdx].getAttribute('sortid') )
//            {
//                minimumSortId = wayPointList[checkIdx].getAttribute('sortid');
//                minimumSortIdIdx = checkIdx;
//                break;
//            }
//        }
//    }
//    
//    var index = 0;
//    for( ; index < wayPointList.length ; ++index)
//    {
//        if( wayPointList[index].getAttribute('sortid') == sortId )
//        {
//            break;
//        }
//    }
//    wayPointList[index].remove();
}

function SetStartingPoint(e)
{
    RemoveContextMenu();
    SetStartMarker();

    StartRoute();
    RefreshView();
}

function SetWayPoint()
{
    RemoveContextMenu();
    SetWayMarker();

    StartRoute();
    RefreshView();
}

function SetDestination()
{
    RemoveContextMenu()
    SetDestMarker();

    StartRoute();
    RefreshView();
}

var routeLayer;
function StartRoute()
{
    var startMarker = GetStartMarker();
    var destMarker = GetDestMarker();
    var wayMarkers = GetWayMarkers();
    if( undefined == startMarker ||
        undefined == destMarker )
    {
        return;
    }

    // 4. 경로 탐색 API 사용요청
    var pr_3857 = new Tmap.Projection("EPSG:3857");//EPSG:3857 좌표계 인스턴스 생성합니다.
    var pr_4326 = new Tmap.Projection("EPSG:4326");//EPSG:4326 좌표계 인스턴스 생성합니다.
    var startLonLat = startMarker.lonlat;
    var destLonLat = destMarker.lonlat;
    wayLonLatList = wayMarkers.map(function(x){return x.lonlat;});
    CalculateRoute(startLonLat, wayLonLatList, destLonLat);
    RefreshView();
}

function RefreshView(){
    markerLayer.clearMarkers();
    markerList = GetAllMarkers();
    for( marker of markerList ){
        markerLayer.addMarker(marker.marker);
    }
    
    waypoint_list_view.waypointList.splice(0, waypoint_list_view.waypointList.length)
    let sortId = 0
    for( var index = 0 ; index < markerList.length ; ++index ){
        var marker = markerList[index];
        if( marker.markerType == MarkerType.START ){
            $("#StartPointInput").val(marker.lonlat.lat.toFixed(5)+ "," + marker.lonlat.lon.toFixed(5) );
        }
        else if( marker.markerType == MarkerType.DEST ){
            $("#DestinationPointInput").val(marker.lonlat.lat.toFixed(5)+ "," + marker.lonlat.lon.toFixed(5) );
        }
        else if( marker.markerType == MarkerType.WAY ){
            waypoint_list_view.waypointList.push({id:sortId.toString(),value:marker.lonlat.lat.toFixed(5)+ "," + marker.lonlat.lon.toFixed(5)})
            sortId+=1
        }
    }
}

function CalculateRoute(startLonLat, wayLonLatList, destLonLat)
{
    let startX = startLonLat.lon;
    let startY = startLonLat.lat;
    let endX = destLonLat.lon;
    let endY = destLonLat.lat;
    let viaPointList = wayLonLatList.map(function(x){
        return {
            "viaPointId" : "test01",//경유지 id
            "viaPointName" : "nmae01",//경유지 명칭
            "viaX" : x.lon.toString(),
            "viaY" : x.lat.toString()};
    });
    
    let prtcl;
    let headers = {
        "appKey" : "dc65b12b-9750-4e55-a14b-54d192a0f496",
    };
    
    
    let urlWithoutWayPoint = "https://api2.sktelecom.com/tmap/routes?version=1&format=xml";
    
    let url;
    let data; 
    url = urlWithoutWayPoint;
    let viaString = "";
    for( let i=0;i<viaPointList.length;i++)
    {
        if(viaString) viaString+="_";
        viaString += viaPointList[i].viaX+","+viaPointList[i].viaY+",0,0";
    }

    data = {
            "startX" : startX,
            "startY" : startY,
            "endX" : endX,
            "endY" : endY,

            "passList" : viaString,

            "reqCoordType" : "EPSG3857",
            "resCoordType" : "EPSG3857",
            "angle" : "172",
            "searchOption" : 0,
            "trafficInfo" : "Y"
    };//교통정보 표출 옵션입니다.
    
    $.ajax({
        method:"POST",
        headers : headers,
        url:url,//
        async:false,
        data:data,
        success:function(response){
                prtcl = response;

            //5. 경로탐색 결과 Line 그리기
            if( typeof routeLayer !== 'undefined'){
                routeLayer.removeAllFeatures();//레이어의 모든 도형을 지웁니다.
            }
            let trafficColors = {
                extractStyles:true,
        
                /* 실제 교통정보가 표출되면 아래와 같은 Color로 Line이 생성됩니다. */
                trafficDefaultColor:"#FF0000", //Default
                trafficType1Color:"#009900", //원할
                trafficType2Color:"#FFC000", //지체
                trafficType3Color:"#FF0000", //정체
            };

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
            var timeSec = $intRate[0].getElementsByTagName("tmap:totalTime")[0].childNodes[0].nodeValue;
            route_result_view.distance = " 총 거리 : "+($intRate[0].getElementsByTagName("tmap:totalDistance")[0].childNodes[0].nodeValue/1000).toFixed(2)+"km";
            route_result_view.time = "총 시간 : "+ Math.floor(timeSec/60/60) + "시간 " + Math.floor(timeSec/60%60) + "분 " + (timeSec&60).toFixed(0) + "초";
		    RemoveContextMenu();
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
