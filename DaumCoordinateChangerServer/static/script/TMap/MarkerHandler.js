var markerList = []
var removedMarker = []

var MarkerType ={
    START:1,
    WAY:2,
    DEST:3,
    LAST:4
}

function SetStartMarker(lonlat){
    ClearStartMarker();
    var icon = new Tmap.IconHtml("<img              src='http://tmapapis.sktelecom.com/upload/tmap/marker/pin_b_m_a.png' />", size, offset);
    
    var lonlat = markerList.filter(x => x.markerType == MarkerType.LAST)[0].lonlat
    var tmapLonlat = lonlat.clone().transform("EPSG:4326", "EPSG:3857");
    var marker = MakeMarker(new Tmap.Marker(tmapLonlat, icon),
                            lonlat,
                            MarkerType.START);
    ClearLastMarker();
    markerList.push(marker);
}

function ClearStartMarker(){
    markerList = markerList.filter(x => x.markerType != MarkerType.START);
}

function GetStartMarker(){
    return markerList.filter(x => x.markerType == MarkerType.START)
                     .map(x => x.marker)[0];
}

function SetDestMarker(){
    ClearDestMarker();
    var icon = new Tmap.IconHtml("<img src='http://tmapapis.sktelecom.com/upload/tmap/marker/pin_r_m_e.png' />", size, offset)
    
    var lonlat = markerList.filter(x => x.markerType == MarkerType.LAST)[0].lonlat
    var tmapLonlat = lonlat.clone().transform("EPSG:4326", "EPSG:3857");
    var marker = MakeMarker(new Tmap.Marker(tmapLonlat, icon),
                            lonlat,
                            MarkerType.DEST);
    ClearLastMarker();
    markerList.push(marker);
}

function ClearDestMarker(){
    markerList = markerList.filter(x => x.markerType != MarkerType.DEST);
}

function GetDestMarker(){
    return markerList.filter(x => x.markerType == MarkerType.DEST)
                     .map(x => x.marker)[0];
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
    markerList = markerList.filter(x => x.markerType != MarkerType.LAST);
}

function GetLastMarker(){
    return markerList.filter(x => x.markerType == MarkerType.LAST)
                     .map(x => x.marker);
}


var wayPntCnt = 0;
function SetWayPoint(lonlat){
    
}

function MakeMarker(tmapMarker, lonlat, markerType){
    var marker = {lonlat:lonlat, marker:tmapMarker, markerType:markerType}
    
    return marker;
}

function GetAllMarkers(){
    return markerList.map(x => {
        return x.marker;
    });
}

function FindMarker(marker){

}