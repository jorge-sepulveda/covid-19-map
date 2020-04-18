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
    id: "mapbox/light-v9",
    tileSize: 512,
    zoomOffset: -1,
    zoom: 16
  }
).addTo(map);

//L.geoJson(data).addTo(map);
//L.geoJson.ajax("https://raw.githubusercontent.com/jorge-sepulveda/covid-19-data/master/counties-with-cases.json").addTo(map)

// Based on Arcgis Geometric Interval for 9 classes
function getColor(cases,pop)  {
  d = (cases/pop)*100000
  return d > 1000
    ? "#ae8080"
    : d > 500
    ? "#d18080"
    : d > 100
    ? "#fc8b8b"
    : d > 10
    ? "#fdc4c4"
    : d > 1
    ? "#fde6e6"
    : "#ffffff";
}

function style(feature) {
  return {
    fillColor: getColor(feature.properties.cases, feature.properties.POPESTIMATE2019 ),
    color: '#000000',
    weight: 0.5,
    opacity: 1,
    fillOpacity: 0.85,
  };
}

//L.geoJson(data, { style: style }).addTo(map);

var geojson;
//listeners

function highlightFeature(e) {
  var layer = e.target;

  layer.setStyle({
    weight: 2,
    color: "#000000",
    dashArray: "",
    fillOpacity: 1,
  });

  if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
    layer.bringToFront();
  }
  info.update(layer.feature.properties);
}

function resetHighlight(e) {
  console.log("resetHighlight")
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

geojson = L.geoJson.ajax("https://raw.githubusercontent.com/jorge-sepulveda/covid-19-data/master/counties-with-cases.json", {
  style: style,
  onEachFeature: onEachFeature,
}).addTo(map);


/*geojson = L.geoJson(data, {
  style: style,
  onEachFeature: onEachFeature,
}).addTo(map);*/

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
    "<h4>Infected Cases per 100,000 People</h4>" +
    (props
      ? "County: <b>" +
        props.NAME +
        "</b>" +
        "</br>Infection Rate: " +
        ((props.cases/props.POPESTIMATE2019)*100000).toFixed(2) +
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
        grades = [0, 1, 10,100, 500, 1000],
        labels = ['#ffffff','#fde6e6','#fdc4c4','#fc8b8b','#d18080', '#ae8080'];

    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + labels[i] + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }

    return div;
};

legend.addTo(map);