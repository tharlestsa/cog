import 'ol/ol.css';
import GeoTIFF from 'ol/source/GeoTIFF';
import Map from 'ol/Map';
import TileLayer from 'ol/layer/WebGLTile';
import OSM from 'ol/source/OSM';
import colormap from 'colormap';
import View from 'ol/View';
import proj4 from 'proj4';
import * as Proj from 'ol/proj';
import { register } from 'ol/proj/proj4';
import COG from 'ol/source';
import { get as ol_get, Projection } from 'ol/proj';

// proj4.defs('EPSG:4674', '+proj=longlat +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +no_defs');
// register(proj4);
let extent = [-55.0000000000000000, -21.0000000000000000, -42.9614372253417969, -8.9754829406738299];
const wordExtent = [-122.19, -59.87, -25.28, 32.72];
ol_get('EPSG:4326').setExtent(extent);
ol_get('EPSG:4326').setWorldExtent(wordExtent);


function getColorStops(name, min, max, steps, reverse) {
  const delta = (max - min) / (steps - 1);
  const stops = new Array(steps * 2);
  const colors = colormap({colormap: name, nshades: steps, format: 'rgba'});
  if (reverse) {
    colors.reverse();
  }
  for (let i = 0; i < steps; i++) {
    stops[i * 2] = min + i * delta;
    stops[i * 2 + 1] = colors[i];
  }
  return stops;
}

const attributions = '<a href="https://cempa.ufg.br/" target="_blank">&copy; CEMPA Cerrado</a> ';

const source = new GeoTIFF({
  normalize: false,
  attributions: attributions,
  sources: [
    {
      url: 'https://cempadev.lapig.iesa.ufg.br/assets/data/tempc_2022_APR_15_02Z.tif',
    },
  ],
});

console.log(...getColorStops('hsv', 14.933, 30.436, 40, true));

const layer = new TileLayer({
  style: {
    color: [
      'interpolate', 
      ['exponential', 0.6],
      ['band', 1],
      ...getColorStops('hsv', 14.933, 30.436, 40, true)
    ],
  },
  source: source,
  opacity: 0.5
});

const projection = new Projection({
  code: 'EPSG:4326',
  units: 'm',
  extent: extent,
  worldExtent: wordExtent
});

const view = new View({
  center: Proj.fromLonLat([-49.624, -16.042], 'EPSG:4326'),
  zoom: 1,
  extent: extent,
  projection: projection
});

const map = new Map({
  target: 'map',
  layers: [
    new TileLayer({
      source: new OSM(),
    }),
    layer
  ],
  view: source.getView()
});
