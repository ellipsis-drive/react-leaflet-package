"use strict";

require("core-js/modules/es.object.assign.js");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.EllipsisVectorLayer = void 0;

require("core-js/modules/web.dom-collections.iterator.js");

require("core-js/modules/es.promise.js");

require("core-js/modules/es.array.flat-map.js");

require("core-js/modules/es.array.unscopables.flat-map.js");

require("core-js/modules/es.array.sort.js");

require("core-js/modules/es.parse-int.js");

require("core-js/modules/es.string.ends-with.js");

require("core-js/modules/es.string.starts-with.js");

var _react = _interopRequireWildcard(require("react"));

var _reactLeaflet = require("react-leaflet");

var _VectorLayerUtil = require("./util/VectorLayerUtil");

var _EllipsisApi = _interopRequireDefault(require("./EllipsisApi"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const reactLeaflet = require('react-leaflet');

let useLeaflet = reactLeaflet.useLeaflet;
let useMapEvents = reactLeaflet.useMapEvents;
if (!useLeaflet) useLeaflet = () => {
  return undefined;
};
if (!useMapEvents) useMapEvents = () => {
  return undefined;
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
  }); //Use new map events if available.

  const _map3x = useMapEvents(!props.loadAll ? {
    move: () => {
      handleViewportUpdate();
    },
    zoomend: () => {
      handleViewportUpdate();
    }
  } : {}); //Use legacy hooks if needed.


  const _map2x = useLeaflet();

  (0, _react.useEffect)(() => {
    if (!_map2x) return;

    _map2x.map.on('move', () => handleViewportUpdate());

    _map2x.map.on('zoomend', () => handleViewportUpdate()); // eslint-disable-next-line

  }, [_map2x]);

  const getMapRef = () => {
    if (_map2x && _map2x.map) return _map2x.map;
    return _map3x;
  }; //On mount, start updating the map.


  (0, _react.useEffect)(() => {
    requestLayerInfo().then(() => {
      readStylingInfo();
      handleViewportUpdate();
    });
    return () => {
      if (state.gettingVectorsInterval) {
        clearInterval(state.gettingVectorsInterval);
        state.gettingVectorsInterval = undefined;
      }
    }; // eslint-disable-next-line
  }, []);
  (0, _react.useEffect)(() => {
    //clear cache and get new data
    resetState(); // eslint-disable-next-line
  }, [props.filter, props.centerPoints, props.loadAll]);
  (0, _react.useEffect)(() => {
    requestLayerInfo().then(() => resetState()); // eslint-disable-next-line
  }, [props.blockId, props.layerId, props.token]);
  (0, _react.useEffect)(() => {
    getCachedFeatures().forEach(x => compileStyle(x));
    update(Date.now()); // eslint-disable-next-line
  }, [props.lineWidth, props.radius]);
  (0, _react.useEffect)(() => {
    readStylingInfo();
    resetState(); // eslint-disable-next-line
  }, [props.styleId, props.style]); //Reads relevant styling info from state.layerInfo. Sets this in state.styleInfo.

  const readStylingInfo = () => {
    const apiStyleObjectKeys = _objectSpread({}, _VectorLayerUtil.styleKeys);

    delete apiStyleObjectKeys.radius;

    if (!props.styleId && props.style) {
      state.styleInfo = props.style ? (0, _VectorLayerUtil.extractStyling)(props.style.parameters, apiStyleObjectKeys) : undefined; // console.log(props.style);

      return;
    }

    if (!state.layerInfo || !state.layerInfo.styles) {
      state.styleInfo = undefined;
      return;
    } //Get width and opacity from layer info style.


    const apiStylingObject = state.layerInfo.styles.find(s => s.id === props.styleId || s.isDefault && !props.styleId);
    state.styleInfo = apiStylingObject && apiStylingObject.parameters ? (0, _VectorLayerUtil.extractStyling)(apiStylingObject.parameters, apiStyleObjectKeys) : undefined;
  }; //Requests layer info for layer with id layerId. Sets this in state.layerInfo.


  const requestLayerInfo = async () => {
    try {
      const info = await _EllipsisApi.default.getInfo(props.blockId, {
        token: props.token
      });
      if (!info.geometryLayers) return;
      const layerInfo = info.geometryLayers.find(x => x.id === props.layerId);
      state.maxZoom = layerInfo.zoom;
      if (layerInfo) state.layerInfo = layerInfo;
    } catch (e) {
      console.error('could not retreive layer info');
    }
  }; //Reset all cached info. Will always continue loading after.


  const resetState = () => {
    if (state.isLoading) {
      //reset after load step is done
      state.resetState = true;
      return;
    }

    state.cache = [];
    state.tiles = [];
    state.nextPageStart = undefined;
    state.resetState = undefined;
    update(Date.now());
    handleViewportUpdate();
  };

  const getCachedFeatures = () => {
    let features = [];

    if (props.loadAll) {
      features = state.cache;
    } else {
      features = state.tiles.flatMap(t => {
        const geoTile = state.cache[getTileId(t)];
        return geoTile ? geoTile.elements : [];
      });
    }

    return features;
  };

  const handleViewportUpdate = () => {
    const viewport = getMapBounds();
    if (!viewport) return;
    state.zoom = Math.max(Math.min(props.maxZoom === undefined ? state.maxZoom : props.maxZoom, viewport.zoom - 2), 0);
    state.tiles = boundsToTiles(viewport.bounds, state.zoom);
    if (state.gettingVectorsInterval) return;
    state.gettingVectorsInterval = setInterval(async () => {
      if (state.isLoading) return;
      const loadedSomething = await loadStep();

      if (state.resetState) {
        resetState();
        return;
      }

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
      styleId: props.styleId,
      style: props.style
    };

    try {
      const res = await _EllipsisApi.default.post("/geometry/get", body, {
        token: props.token
      });
      state.nextPageStart = res.nextPageStart;
      if (!res.nextPageStart) state.nextPageStart = 4; //EOT

      if (res.result && res.result.features) {
        res.result.features.forEach(x => {
          compileStyle(x);
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

      if (pageStart && state.cache[tileId].amount <= props.maxFeaturesPerTile && state.cache[tileId].size <= props.maxMbPerTile * 1000000) return {
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
      style: props.style,
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
      result[j].result.features.forEach(x => compileStyle(x));
      tileData.elements = tileData.elements.concat(result[j].result.features);
    }

    return true;
  };

  const getTileId = tile => "".concat(tile.zoom, "_").concat(tile.tileX, "_").concat(tile.tileY);

  const getFeatureId = function getFeatureId(feature) {
    let index = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    return "".concat(feature.properties.id, "_").concat(props.centerPoints ? 'center' : 'geometry', "_").concat(props.styleId ? props.styleId : 'nostyle', "_").concat(index);
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

  const compileStyle = feature => {
    let compiledStyle = (0, _VectorLayerUtil.getFeatureStyling)(feature, state.styleInfo, props);
    compiledStyle = (0, _VectorLayerUtil.extractStyling)(compiledStyle, {
      radius: [],
      weight: ['width'],
      color: ['borderColor'],
      opacity: ['borderOpacity'],
      fillColor: [],
      fillOpacity: []
    });
    if (!feature.properties) feature.properties = {};
    feature.properties.compiledStyle = compiledStyle;
  };

  const getMapBounds = () => {
    const map = getMapRef();
    if (!map) return;
    const screenBounds = map.getBounds();
    const zoom = map.getZoom();
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
    const features = getCachedFeatures();
    console.log(features[0]);
    return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, features.flatMap(feature => {
      const type = feature.geometry.type; //Check for (Multi)Polygons and (Multi)LineStrings

      if (type.endsWith('Polygon') || type.endsWith('LineString')) {
        return [/*#__PURE__*/_react.default.createElement(_reactLeaflet.GeoJSON, {
          key: getFeatureId(feature),
          data: feature,
          style: feature.properties.compiledStyle,
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
        }) : /*#__PURE__*/_react.default.createElement(_reactLeaflet.CircleMarker, _extends({
          key: getFeatureId(feature, i),
          center: [coordinate[1], coordinate[0]]
        }, feature.properties.compiledStyle, {
          interactive: props.onFeatureClick ? true : false,
          onClick: !props.onFeatureClick ? undefined : e => props.onFeatureClick(feature, e)
        })));
      }

      return [];
    }));
  };

  return render();
};

exports.EllipsisVectorLayer = EllipsisVectorLayer;
EllipsisVectorLayer.defaultProps = {
  pageSize: 25,
  maxFeaturesPerTile: 200,
  maxMbPerTile: 16,
  maxTilesInCache: 500,
  loadAll: false
};
var _default = EllipsisVectorLayer;
exports.default = _default;