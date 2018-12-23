var key = 1;
var markerList = []
var removedMarker = []
function MakeMarker(marker, lonlat){
    this.key = key++;
    this.lonlat = lonlat;
    this.marker = marker

    markerList.push(this);
}

function UpdateMarker(markerLayer){
    for(var index = 0 ; index < removedMarker.length; ++index ){
        markerLayer.removeMarker(removedMarker[index].marker);
    }
    removedMarker.splice(0,removedMarker.length);

    for(var index = 0 ; index < markerList.length ; ++index){
        markerLayer.removeMarker(markerList[index].marker);
        markerLayer.addMarker(markerList[index].marker);
    }
}

function RemoveMarker(marker){
    if( typeof marker === 'undefined' ){
        return;
    }

    var markerIndex = markerList.indexOf(marker);
    removedMarker.push(markerList[markerIndex]);
    markerList.splice(markerIndex, 1);
}

function FindMarker(marker){

}