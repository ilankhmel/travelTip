import { locService } from './services/loc.service.js'
import { mapService } from './services/map.service.js'
import { storageService } from './services/storage.service.js'
export const controller = {
    renderSavedLocations
}

window.onload = onInit
window.onAddMarker = onAddMarker
window.onPanTo = onPanTo
window.onGetLocs = onGetLocs
window.onGetUserPos = onGetUserPos
window.onSetLocationName = mapService.onSetLocationName
window.onSaveLocation = mapService.onSaveLocation
window.onGoToLocation = onGoToLocation
window.onDeleteLocation = onDeleteLocation
window.goToCurrLocation = locService.goToCurrLocation
window.getLatLng = mapService.getLatLng
window.onInputSearch = onInputSearch
window.onSearchLoc = onSearchLoc
window.onCopyLink = onCopyLink

var gSearchTerm =''

function onInit() {
    // mapService.initMap()
    //     .then(() => {
    //         console.log('Map is ready')
    //     })
    //     .catch(() => console.log('Error: cannot init map'))

    mapService.renderPageByQueryStringParams()
    renderSavedLocations()
}

// This function provides a Promise API to the callback-based-api of getCurrentPosition
function getPosition() {
    console.log('Getting Pos')
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject)
    })
}

function onAddMarker() {
    console.log('Adding a marker')
    mapService.addMarker({ lat: 32.0749831, lng: 34.9120554 })
}

function onGetLocs() {
    locService.getLocs()
        .then(locs => {
            console.log('Locations:', locs)
            document.querySelector('.locs').innerText = JSON.stringify(locs, null, 2)
        })
}

function onGetUserPos() {
    getPosition()
        .then(pos => {
            console.log('User position is:', pos.coords)
            document.querySelector('.user-pos').innerText =
                `Latitude: ${pos.coords.latitude} - Longitude: ${pos.coords.longitude}`
        })
        .catch(err => {
            console.log('err!!!', err)
        })
}
function onPanTo(lat, lng) {
    console.log('Panning the Map')
    // mapService.panTo(35.6895, 139.6917)
    mapService.panTo(lat, lng)
}

function renderSavedLocations(){
    console.log('in');
    var savedLocs = storageService.load('saveLocsDB') 
    console.log(savedLocs)
    var strHTML = ''
    savedLocs.forEach(loc => 
        strHTML+=
        `<div class="saved-loc">
            <h2>Name: ${loc.name}</h2>
            <p>Located At: ${loc.location}</p>
            <p>Created At: ${loc.createdAt}</p>
            <p>Weather now is: : ${loc.weather.weatherDesc}</p>
            <button onclick="onGoToLocation(${`{lat: ${loc.lat}, lng: ${loc.lng}}`})">Go!</button>
            <button onclick="onDeleteLocation('${loc.name}')">Delete</button>
        </div>`
        )

    console.log(strHTML);
    document.querySelector('.saved-locs').innerHTML = strHTML
}

function onGoToLocation(obj){
    var lat = obj.lat
    var lng = obj.lng
    onPanTo(lat, lng)
}

function onDeleteLocation(name){
    mapService.deleteLocation(name)

}

function onInputSearch(term){
    gSearchTerm = term
}

function onSearchLoc(){
    getLatLng(gSearchTerm,  mapService.addMarker)
    
}

function onCopyLink(){
    const link = new URLSearchParams(window.location.search)
    console.log(link);
    navigator.clipboard.writeText(`https://ilankhmel.github.io/travelTip/index.html?${link}`);
}