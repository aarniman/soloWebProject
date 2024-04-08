const coord = [60.223671, 25.078039];
const zoom = 13;
const leafmap = L.map('map').setView(coord, zoom);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);
const markergroup = L.layerGroup().addTo(leafmap);
setTimeout(function () {
    window.dispatchEvent(new Event('resize'));
}, 1000);