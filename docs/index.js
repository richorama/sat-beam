import 'ol/ol.css'
import { Map, View, Feature } from 'ol'
import TileLayer from 'ol/layer/Tile'
import OSM from 'ol/source/OSM'
import { getBeam } from '../index'
import { toLonLat, fromLonLat } from 'ol/proj'
import Polygon from 'ol/geom/Polygon'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import { Fill, Stroke, Style } from 'ol/style'

const poly = new Polygon([], 'XY')
const source = new VectorSource({ features: [new Feature(poly)] })

const vectorLayer = new VectorLayer({
  source,
  style: () => {
    return new Style({
      stroke: new Stroke({
        color: 'rgba(255, 0, 0, 0.5)',
        width: 3
      }),
      fill: new Fill({
        color: 'rgba(255, 0, 0, 0.1)'
      })
    })
  }
});


const map = new Map({
  target: 'map',
  layers: [
    new TileLayer({
      source: new OSM()
    }),
    vectorLayer
  ],
  view: new View({
    center: [0, 0],
    zoom: 0
  })
})

map.on('click', e => {
  const [lng, lat] = toLonLat(e.coordinate)

  const beam = getBeam(lng, lat, 500)
    .map(x => [x.lng, x.lat])
    .map(x => fromLonLat(x, 'EPSG:3857'))

  poly.setCoordinates([beam], 'XY')
})

