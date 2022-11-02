import {storageService} from './storage.service.js'
// import {controller} from './/app.controller.js'

export const mapService = {
    initMap,
    addMarker,
    panTo,
    onSetLocationName,
    onSaveLocation,
    getSavedLocs,
    deleteLocation,
    getLatLng,
    renderPageByQueryStringParams
}


// Var that is used throughout this Module (not global)
var gMap
var gLocationName = ''
const SAVE_KEY = 'saveLocsDB'
var gSavedLocations = storageService.load(SAVE_KEY) || []

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
               
                // console.log(event.latLng);
                addMarker(event.latLng)

                // console.log('lat', gMap.center.lat());
                // console.log('lng', gMap.center.lng());
                setQueryParams(gMap.center.lat(), gMap.center.lng())

            });
        })

}


function addMarker(loc) {
    var img = document.querySelector('img')
    var marker = new google.maps.Marker({
        position: loc,
        map: gMap,
        // icon: 'icons/placeholder.png',
        title: 'Hello World!'
    })
   
    var title = getNameByGeo(loc).then((res)=>{return(res.results[0].address_components[3].long_name + ', ' + res.results[0].address_components[5].long_name)})
    title.then((res)=>{
        addInfoWindow(loc, res)
       
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

    
  
    return marker
}

function onSetLocationName(val){
    gLocationName = val
}

function onSaveLocation(obj){
  
    var currentdate = new Date(); 
    var datetime = "Last Sync: " + currentdate.getDate() + "/"
                + (currentdate.getMonth()+1)  + "/" 
                + currentdate.getFullYear() + " @ "  
                + currentdate.getHours() + ":"  
                + currentdate.getMinutes()


    var object =  {
                // id: makeId(),
                name: gLocationName,
                location: obj.name,
                lat: obj.lat,
                lng: obj.lng,
                weather: '',
                createdAt: datetime,
                updatedAt:''
                };
        
    // gSavedLocations.push(obj)
    // storageService.save(SAVE_KEY, gSavedLocations)
    getWeather(object).then(controller.renderSavedLocations())
}

function getWeather(obj) {
    const lat = obj.lat
    const lng = obj.lng
    const API_KEY = '592d51682f56991d7299003310f4640a'
    const Adress = `http://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&APPID=${API_KEY}`
    return fetch(Adress).then((res) => res.json()).then((res) => ({
        name:` ${res.name},${res.sys.country}`, weatherDesc: res.weather[0].description, windSpeed: res.wind.speed,
        temp: res.main.temp, minTemp: res.main.temp_min, maxTemp: res.main.temp_max
    })).then((res) => {
        obj.weather = res
        return obj
    }).then((obj) => gSavedLocations.push(obj)).then((obj)=> storageService.save(SAVE_KEY, gSavedLocations))
    // storageService.save(${obj.name}, obj)
}

function getNameByGeo(latlng) {
    var geocoder;
    geocoder = new google.maps.Geocoder();
    return geocoder.geocode(
        { 'latLng': latlng },
        function (results, status) {
            console.log(results);
            console.log(status);
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


 function getLatLng(stAddress, cb){
    var geocoder;
    geocoder = new google.maps.Geocoder();
    geocoder.geocode( { 'address': stAddress}, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        gMap.setCenter(results[0].geometry.location);

        return cb(results[0].geometry.location);
      } else {
        return cb(-1);
      }
    });
  
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

function getSavedLocs(){
    return gSavedLocations
}


function deleteLocation(name){
    console.log(gSavedLocations);
    var locIdx = gSavedLocations.findIndex(loc=>loc.name === name)
    gSavedLocations.splice(locIdx, 1)
    storageService.save(SAVE_KEY, gSavedLocations)
}



function setQueryParams(lat, lng) {
  
    const queryStringParams = `?lat=${lat}&lng=${lng}`
    const newUrl =
        window.location.protocol +
        '//' +
        window.location.host +
        window.location.pathname +
        queryStringParams
    window.history.pushState({ path: newUrl }, '', newUrl)
}



function renderPageByQueryStringParams() {
    const queryStringParams = new URLSearchParams(window.location.search)

    //URL params obj 
        var lat = queryStringParams.get('lat') || 20
        var lng = queryStringParams.get('lng') || 20
        console.log(lat, lng);
        initMap(+lat, +lng)
    }

