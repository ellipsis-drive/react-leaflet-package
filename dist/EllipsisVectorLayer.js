"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.EllipsisVectorLayer = void 0;

require("core-js/modules/web.dom-collections.iterator.js");

require("core-js/modules/es.promise.js");

require("core-js/modules/es.array.sort.js");

require("core-js/modules/es.regexp.exec.js");

require("core-js/modules/es.regexp.test.js");

require("core-js/modules/es.parse-int.js");

require("core-js/modules/es.string.ends-with.js");

require("core-js/modules/es.array.flat-map.js");

require("core-js/modules/es.array.unscopables.flat-map.js");

require("core-js/modules/es.string.starts-with.js");

var _react = _interopRequireWildcard(require("react"));

var _reactLeaflet = require("react-leaflet");

var _EllipsisApi = _interopRequireDefault(require("./EllipsisApi"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

const reactLeaflet = require('react-leaflet');

let useLeaflet = reactLeaflet.useLeaflet;
let useMapEvents = reactLeaflet.useMapEvents;
if (!useLeaflet) useLeaflet = () => {
  return {};
};
if (!useMapEvents) useMapEvents = () => {
  return {};
};

const EllipsisVectorLayer = props => {
  const [, update] = (0, _react.useState)(0);
  const [state] = (0, _react.useState)({
    cache: [],
    tiles: [],
    zoom: 1,
    isLoading: false,
    nextPageStart: undefined,
    gettingVectorsInterval: undefined
  });
  const map = (0, _react.useRef)(); //Use new map events if available.

  let map_new = useMapEvents(!props.loadAll ? {
    move: () => {
      handleViewportUpdate();
    },
    zoomend: () => {
      handleViewportUpdate();
    }
  } : {});
  (0, _react.useEffect)(() => {
    if (!map_new) return;
    map.current = map_new;
  }, [map_new]); //Use legacy hooks if needed.

  let map_old = useLeaflet().map;
  (0, _react.useEffect)(() => {
    if (!map_old) return;
    map.current = map_old;
    map.current.on('move', () => handleViewportUpdate());
    map.current.on('zoomend', () => handleViewportUpdate()); // eslint-disable-next-line
  }, [map_old]); //On mount, start updating the map.

  (0, _react.useEffect)(() => {
    handleViewportUpdate(); // eslint-disable-next-line
  }, []);

  const handleViewportUpdate = () => {
    const viewport = getMapBounds();
    if (!viewport) return;
    state.zoom = Math.max(Math.min(props.maxZoom, viewport.zoom - 2), 0);
    state.tiles = boundsToTiles(viewport.bounds, state.zoom);
    if (state.gettingVectorsInterval) return;
    state.gettingVectorsInterval = setInterval(async () => {
      if (state.isLoading) return;
      const loadedSomething = await loadStep();

      if (!loadedSomething) {
        clearInterval(state.gettingVectorsInterval);
        state.gettingVectorsInterval = undefined;
        return;
      }

      update(Date.now());
    }, 100);
  };

  const loadStep = async () => {
    state.isLoading = true; // console.log('loading');

    if (props.loadAll) {
      const cachedSomething = await getAndCacheAllGeoJsons();
      state.isLoading = false; // console.log('done loading');

      return cachedSomething;
    }

    ensureMaxCacheSize();
    const cachedSomething = await getAndCacheGeoJsons();
    state.isLoading = false; // console.log('done loading');

    return cachedSomething;
  };

  const ensureMaxCacheSize = () => {
    const keys = Object.keys(state.cache);

    if (keys.length > props.maxTilesInCache) {
      const dates = keys.map(k => state.state.cache[k].date).sort();
      const clipValue = dates[9];
      keys.forEach(key => {
        if (state.cache[key].date <= clipValue) {
          delete state.cache[key];
        }
      });
    }
  };

  const getAndCacheAllGeoJsons = async () => {
    if (state.nextPageStart === 4) return false;
    const body = {
      pageStart: state.nextPageStart,
      mapId: props.blockId,
      returnType: props.centerPoints ? "center" : "geometry",
      layerId: props.layerId,
      zip: true,
      pageSize: Math.min(3000, props.pageSize),
      styleId: props.styleId
    };

    try {
      const res = await _EllipsisApi.default.post("/geometry/get", body, {
        token: props.token
      });
      state.nextPageStart = res.nextPageStart;
      if (!res.nextPageStart) state.nextPageStart = 4; //EOT

      if (res.result && res.result.features) {
        res.result.features.forEach(x => {
          styleGeoJson(x, props.lineWidth, props.radius);
          state.cache.push(x);
        });
      }
    } catch (_unused) {
      return false;
    }

    return true;
  };

  const getAndCacheGeoJsons = async () => {
    const date = Date.now(); //create tiles parameter which contains tiles that need to load more features

    const tilesParam = state.tiles.map(t => {
      const tileId = getTileId(t); //If not cached, always try to load features.

      if (!state.cache[tileId]) return {
        tileId: t
      };
      const pageStart = state.cache[tileId].nextPageStart; //TODO in other packages we use < instead of <=
      //Check if tile is not already fully loaded, and if more features may be loaded

      if (pageStart && state.cache[tileId].amount <= props.maxFeaturesPerTile && state.cache[tileId].size <= props.maxMbPerTile) return {
        tileId: t,
        pageStart
      };
      return null;
    }).filter(x => x);
    if (tilesParam.length === 0) return false;
    const body = {
      mapId: props.blockId,
      returnType: props.centerPoints ? "center" : "geometry",
      layerId: props.layerId,
      zip: true,
      pageSize: Math.min(3000, props.pageSize),
      styleId: props.styleId,
      propertyFilter: props.filter && props.filter > 0 ? props.filter : null
    }; //Get new geometry for the tiles

    let result = [];
    const chunkSize = 10;

    for (let k = 0; k < tilesParam.length; k += chunkSize) {
      body.tiles = tilesParam.slice(k, k + chunkSize);

      try {
        const res = await _EllipsisApi.default.post("/geometry/tile", body, {
          token: props.token
        });
        result = result.concat(res);
      } catch (_unused2) {
        return false;
      }
    } //Add newly loaded data to cache


    for (let j = 0; j < tilesParam.length; j++) {
      const tileId = getTileId(tilesParam[j].tileId);

      if (!state.cache[tileId]) {
        state.cache[tileId] = {
          size: 0,
          amount: 0,
          elements: [],
          nextPageStart: null
        };
      } //set tile info for tile in this.


      const tileData = state.cache[tileId];
      tileData.date = date;
      tileData.size = tileData.size + result[j].size;
      tileData.amount = tileData.amount + result[j].result.features.length;
      tileData.nextPageStart = result[j].nextPageStart;
      result[j].result.features.forEach(x => styleGeoJson(x, props.lineWidth, props.radius));
      tileData.elements = tileData.elements.concat(result[j].result.features);
    }

    return true;
  };

  const getTileId = tile => "".concat(tile.zoom, "_").concat(tile.tileX, "_").concat(tile.tileY);

  const getFeatureId = function getFeatureId(feature) {
    let index = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    return "".concat(feature.properties.id, "_").concat(props.centerPoints ? 'center' : 'geometry', "_").concat(props.styleId ? props.styleId : 'nostyle', "_").concat(index);
  };

  const styleGeoJson = (geoJson, weight, radius) => {
    if (!geoJson || !geoJson.geometry || !geoJson.geometry.type || !geoJson.properties) return;
    const type = geoJson.geometry.type;
    const properties = geoJson.properties;
    const color = properties.color;
    const isHexColorFormat = /^#?([A-Fa-f0-9]{2}){3,4}$/.test(color);
    properties.style = {}; //Parse color and opacity

    if (isHexColorFormat && color.length === 9) {
      properties.style.fillOpacity = parseInt(color.substring(8, 10), 16) / 25.5;
      properties.style.color = color.substring(0, 7);
    } else {
      properties.style.fillOpacity = 0.6;
      properties.style.color = color;
    } //TODO: weight default on 8 for LineString and MultiLineString, and 2 for Points?
    //Parse line width


    if (type.endsWith('Point')) {
      properties.style.radius = radius;
      properties.style.weight = 2;
    } else properties.style.weight = weight;
  };

  const boundsToTiles = (bounds, zoom) => {
    const xMin = Math.max(bounds.xMin, -180);
    const xMax = Math.min(bounds.xMax, 180);
    const yMin = Math.max(bounds.yMin, -85);
    const yMax = Math.min(bounds.yMax, 85);
    const zoomComp = Math.pow(2, zoom);
    const comp1 = zoomComp / 360;
    const pi = Math.PI;
    const comp2 = 2 * pi;
    const comp3 = pi / 4;
    const tileXMin = Math.floor((xMin + 180) * comp1);
    const tileXMax = Math.floor((xMax + 180) * comp1);
    const tileYMin = Math.floor(zoomComp / comp2 * (pi - Math.log(Math.tan(comp3 + yMax / 360 * pi))));
    const tileYMax = Math.floor(zoomComp / comp2 * (pi - Math.log(Math.tan(comp3 + yMin / 360 * pi))));
    let tiles = [];

    for (let x = Math.max(0, tileXMin - 1); x <= Math.min(2 ** zoom - 1, tileXMax + 1); x++) {
      for (let y = Math.max(0, tileYMin - 1); y <= Math.min(2 ** zoom - 1, tileYMax + 1); y++) {
        tiles.push({
          zoom,
          tileX: x,
          tileY: y
        });
      }
    }

    return tiles;
  };

  const getMapBounds = () => {
    if (!map.current) return;
    const screenBounds = map.current.getBounds();
    const zoom = map.current.getZoom();
    let bounds = {
      xMin: screenBounds.getWest(),
      xMax: screenBounds.getEast(),
      yMin: screenBounds.getSouth(),
      yMax: screenBounds.getNorth()
    }; //Mapbox uses 512x512 tiles, and ellipsis uses 256x256 tiles. So increase zoom with 1. 'zoom256 = zoom512 + 1'

    return {
      bounds,
      zoom: parseInt(zoom, 10)
    };
  };

  const render = () => {
    if (!state.tiles || state.tiles.length === 0) return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null);
    let features;

    if (props.loadAll) {
      features = state.cache;
    } else {
      features = state.tiles.flatMap(t => {
        const geoTile = state.cache[getTileId(t)];
        return geoTile ? geoTile.elements : [];
      });
    } // console.log(features.filter(x => 
    //   features.filter(y => y.properties.id === x.properties.id).length > 1
    // ).length > 0);


    return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, features.flatMap(feature => {
      const type = feature.geometry.type; //Check for (Multi)Polygons and (Multi)LineStrings

      if (type.endsWith('Polygon') || type.endsWith('LineString')) {
        return [/*#__PURE__*/_react.default.createElement(_reactLeaflet.GeoJSON, {
          key: getFeatureId(feature),
          data: feature,
          style: feature.properties.style,
          interactive: props.onFeatureClick ? true : false,
          onEachFeature: !props.onFeatureClick ? undefined : (feature, layer) => layer.on('click', () => props.onFeatureClick(feature, layer))
        })];
      }

      if (type.endsWith('Point')) {
        let coordinates = feature.geometry.coordinates; //Ensure that it's always an array of coordinates.

        if (!type.startsWith('Multi')) coordinates = [coordinates];
        return coordinates.map((coordinate, i) => props.useMarkers ? /*#__PURE__*/_react.default.createElement(_reactLeaflet.Marker, {
          key: getFeatureId(feature, i),
          position: [coordinate[1], coordinate[0]],
          interactive: props.onFeatureClick ? true : false,
          onClick: !props.onFeatureClick ? undefined : e => props.onFeatureClick(feature, e)
        }) : /*#__PURE__*/_react.default.createElement(_reactLeaflet.CircleMarker, {
          key: getFeatureId(feature, i),
          center: [coordinate[1], coordinate[0]],
          color: feature.properties.style.color,
          opacity: feature.properties.style.fillOpacity,
          radius: feature.properties.style.radius,
          weight: feature.properties.style.weight,
          interactive: props.onFeatureClick ? true : false,
          onClick: !props.onFeatureClick ? undefined : e => props.onFeatureClick(feature, e)
        }));
      }

      return [];
    }));
  };

  return render();
};

exports.EllipsisVectorLayer = EllipsisVectorLayer;
EllipsisVectorLayer.defaultProps = {
  pageSize: 25,
  maxZoom: 21,
  lineWidth: 5,
  radius: 15,
  maxFeaturesPerTile: 200,
  maxMbPerTile: 16000000,
  maxTilesInCache: 500,
  loadAll: false
};
var _default = EllipsisVectorLayer;
exports.default = _default;