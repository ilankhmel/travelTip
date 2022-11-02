import {storageService} from './storage.service.js'
export const mapService = {
    initMap,
    addMarker,
    panTo,
    onSetLocationName,
    onSaveLocation,
}


// Var that is used throughout this Module (not global)
var gMap
var gLocationName = ''

function initMap(lat = 32.0749831, lng = 34.9120554) {
    console.log('InitMap')
    return _connectGoogleApi()
        .then(() => {
            console.log('google available')
            gMap = new google.maps.Map(
                document.querySelector('#map'), {
                center: { lat, lng },
                zoom: 15
            })
            console.log('Map!', gMap)
            gMap.addListener("click", (event) => {
                // console.log('clicked', event);
                // console.log('lat', event.latLng.lat());
                // console.log('lang', event.latLng.lng());

                // var infoWindow = addInfoWindow()
                console.log(event.latLng);
                addMarker(event.latLng)
                // showModal(event.latLng)
                // console.log(gMap);

            });
        })

}


function addMarker(loc) {
    var marker = new google.maps.Marker({
        position: loc,
        map: gMap,
        title: 'Hello World!'
    })
    // console.log(marker);

    // addInfoWindow(marker)
    var title = getNameByGeo(loc).then((res)=>{return(res.results[0].address_components[3].long_name + ', ' + res.results[0].address_components[5].long_name)})
    title.then((res)=>{
        addInfoWindow(loc, res)
        // console.log(res);
    })
    
    function addInfoWindow(loc, res) {
        const infowindow = new google.maps.InfoWindow({
            content: `<div class="info-window">
                        ${res}
                        <input type="text" oninput="onSetLocationName(this.value)">
                        <button class="onSaveLocation" onclick="onSaveLocation({lat: ${loc.lat()}, lng: ${loc.lng()}, name: '${res}'})">Save</button>
                      </div>`,
            ariaLabel: "Uluru",
        });

        marker.addListener("click", () => {
            infowindow.open({
                anchor: marker,
                map: gMap,
            });
        });
    }
    // getNameByGeo(loc).then((res)=>{console.log(res.results)})
    
    // console.log(getNameByGeo(loc))
    // getNameByGeo(loc).then((res)=>{console.log(res.json())})
    return marker
}

function onSetLocationName(val){
    gLocationName = val
}

function onSaveLocation(obj){
    //{id, name, lat, lng, weather, createdAt, updatedAt}
    var obj =  {
                // id: makeId(),
                name: !gLocationName ? obj.name : gLocationName,
                lat: obj.lat,
                lng: obj.lng,
                // weather: getWeather(locs),
                createdAt: Date.now(),
                updatedAt:''
                };

    storageService.save(`${obj.name}`, obj)
}

function getNameByGeo(latlng) {
    var geocoder;
    geocoder = new google.maps.Geocoder();
    return geocoder.geocode(
        { 'latLng': latlng },
        function (results, status) {
            // console.log(results);
            // console.log(status);
            if (status == google.maps.GeocoderStatus.OK) {
                if (results[0]) {
                    var add = results[0].formatted_address;
                    var value = add.split(",");
                    // console.log(value.length);

                    var count = value.length;
                    var country = value[count - 1];
                    var state = value[count - 2];
                    var city = value[count - 3];

                    // console.log({country, state, city});
                    return {city, country, state}
                }
                else {
                    console.log('else');
                    return "address not found"
                }
            }
            else {
                console.log('else2');
                return "Geocoder failed due to: " + status
            }
        }

    )
}
// function addInfoWindow(){
//     const infowindow = new google.maps.InfoWindow({
//         content: 'contentSring',
//         ariaLabel: "Uluru",
//       });

//       return infowindow
// }
function panTo(lat, lng) {
    var laLatLng = new google.maps.LatLng(lat, lng)
    gMap.panTo(laLatLng)
}


function _connectGoogleApi() {
    if (window.google) return Promise.resolve()
    const API_KEY = 'AIzaSyARhuccigy00w5WLPXH2LNz8a-sRkoU-jY' 
    var elGoogleApi = document.createElement('script')
    elGoogleApi.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}`
    elGoogleApi.async = true
    document.body.append(elGoogleApi)

    return new Promise((resolve, reject) => {
        elGoogleApi.onload = resolve
        elGoogleApi.onerror = () => reject('Google script failed to load')
    })
}