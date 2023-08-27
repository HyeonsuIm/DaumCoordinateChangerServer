var markerList = [];
var currentWayCnt = 0
var MarkerType = {
    START   : 1,
    WAY     : 2,
    DEST    : 3,
    LAST    : 4
};

function ClearStartMarker() {
    markerList = markerList.filter(function (x){return x.markerType != MarkerType.START});
}

function SetStartMarker() {
    ClearStartMarker();
    var icon = new Tmap.IconHtml("<img              src='http://tmapapis.sktelecom.com/upload/tmap/marker/pin_b_m_a.png' />", size, offset);
    
    var lonlat = markerList.filter(function(x){return x.markerType == MarkerType.LAST;})[0].lonlat
    var tmapLonlat = lonlat.clone().transform("EPSG:4326", "EPSG:3857");
    var marker = MakeMarker(new Tmap.Marker(tmapLonlat, icon),
                            lonlat,
                            MarkerType.START);
    ClearLastMarker();
    markerList.push(marker);
}

function GetStartMarker(){
    return markerList.filter(function(x){return x.markerType == MarkerType.START})
                     .map(function(x){return x.marker})[0];
}

function SetDestMarker(){
    ClearDestMarker();
    var icon = new Tmap.IconHtml("<img src='http://tmapapis.sktelecom.com/upload/tmap/marker/pin_r_m_e.png' />", size, offset)
    
    var lonlat = markerList.filter(function(x){return x.markerType == MarkerType.LAST})[0].lonlat
    var tmapLonlat = lonlat.clone().transform("EPSG:4326", "EPSG:3857");
    var marker = MakeMarker(new Tmap.Marker(tmapLonlat, icon),
                            lonlat,
                            MarkerType.DEST);
    ClearLastMarker();
    markerList.push(marker);
}

function ClearDestMarker(){
    markerList = markerList.filter(function(x){return x.markerType != MarkerType.DEST});
}

function GetDestMarker(){
    return markerList.filter(function(x){return x.markerType == MarkerType.DEST})
                     .map(function(x){return x.marker})[0];
}

function SetLastMarker(lonlat){
    ClearLastMarker();
    var icon = new Tmap.IconHtml("<img src='http://tmapapis.sktelecom.com/upload/tmap/marker/pin_b_m_a.png' />", size, offset);
    
    var markerLonlat = lonlat.clone().transform("EPSG:4326", "EPSG:3857");
    var marker = MakeMarker(new Tmap.Marker(markerLonlat, icon),
                            lonlat,
                            MarkerType.LAST);
    markerList.push(marker);
}

function ClearLastMarker(){
    markerList = markerList.filter(function(x){return x.markerType != MarkerType.LAST});
}

function GetLastMarker(){
    return markerList.filter(function(x){return x.markerType == MarkerType.LAST})
                     .map(function(x){return x.marker});
}


function SetWayMarker(){
    var icon = new Tmap.IconHtml("<img src='http://tmapapis.sktelecom.com/upload/tmap/marker/pin_b_m_a.png' />", size, offset);
    
    var lonlat = markerList.filter(function(x){return x.markerType == MarkerType.LAST})[0].lonlat
    var tmapLonlat = lonlat.clone().transform("EPSG:4326", "EPSG:3857");
    var marker = MakeMarker(new Tmap.Marker(tmapLonlat, icon),
                            lonlat,
                            MarkerType.WAY,
                            currentWayCnt++);
    ClearLastMarker();
    markerList.push(marker);
}

function RemoveWayMarker(idx){
    markerList = markerList.filter(function(x){return x.markerType != MarkerType.WAY && x.no != idx})
}

function ClearWaypointMarker(idx){
    markerList = markerList.filter(function(x){return x.markerType != MarkerType.WAY});
}

function GetWayMarkers(){
    return markerList.filter(function(x){return x.markerType == MarkerType.WAY})
                     .map(function(x){return x.marker});
}

function MakeMarker(tmapMarker, lonlat, markerType){
    return MakeMarker(tmapMarker, lonlat, markerType, 0);
}

function MakeMarker(tmapMarker, lonlat, markerType, idx){
    var marker = {lonlat:lonlat, marker:tmapMarker, markerType:markerType, no:idx}
    return marker;
}

function GetAllMarkers(){
    return markerList;
}

function FindMarker(marker){

}