var map = L.map("mapid").setView([37.8, -94], 5);

L.tileLayer(
  "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZ3NlcHVsdmVkYTk2IiwiYSI6ImNrOHcxNWxveTA5bHkzZm1jZnVia2JpbDEifQ.uItzrq1zGYszzvQCGd3Erg",
  {
    maxZoom: 15,
    attribution:
      'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
      '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
      'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>,' +
      "The New York Times",
    id: "mapbox/dark-v10",
    tileSize: 512,
    zoomOffset: -1,
    zoom: 16
  }
).addTo(map);

L.geoJson(data).addTo(map);

// Based on Arcgis Geometric Interval for 9 classes
function getColor(d) {
  return d > 15000
    ? "#67001f"
    : d > 4996
    ? "#980043"
    : d > 1239
    ? "#ce1256"
    : d > 307
    ? "#e7298a"
    : d > 76
    ? "#df65b0"
    : d > 19
    ? "#c994c7"
    : d > 5
    ? "#d4b9da"
    : d > 1
    ? "#e7e1ef"
    : d > 0
    ? "#f7f4f9"
    : "#FFFFFF";
}

function style(feature) {
  return {
    fillColor: getColor(feature.properties.cases),
    color: '#000000',
    weight: 0.5,
    opacity: 1,
    fillOpacity: 0.5,
  };
}

L.geoJson(data, { style: style }).addTo(map);

var geojson;
//listeners

function highlightFeature(e) {
  var layer = e.target;

  layer.setStyle({
    weight: 5,
    color: "#ffffff",
    dashArray: "",
    fillOpacity: 0.7,
  });

  if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
    layer.bringToFront();
  }
  info.update(layer.feature.properties);
}

function resetHighlight(e) {
  geojson.resetStyle(e.target);
  info.update();
}

function zoomToFeature(e) {
  map.fitBounds(e.target.getBounds());
}

function onEachFeature(feature, layer) {
  layer.on({
    mouseover: highlightFeature,
    mouseout: resetHighlight,
    click: zoomToFeature,
  });
}

geojson = L.geoJson(data, {
  style: style,
  onEachFeature: onEachFeature,
}).addTo(map);

var info = L.control();

info.onAdd = function (map) {
  this._div = L.DomUtil.create("div", "info"); // create a div with a class "info"
  this.update();
  return this._div;
};

// method that we will use to update the control based on feature properties passed
info.update = function (props) {
  console.log(props);
  this._div.innerHTML =
    "<h4>Infected Counties</h4>" +
    (props
      ? "County: <b>" +
        props.NAME +
        "</b>" +
        "</br>Cases: " +
        props.cases +
        "</br>Deaths: " +
        props.deaths
      : "Hover over a county to find testing info");
};

info.addTo(map);

var legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend'),
        grades = [0, 1, 5, 19, 76, 307, 1239, 4996, 15000],
        labels = [];

    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }

    return div;
};

legend.addTo(map);