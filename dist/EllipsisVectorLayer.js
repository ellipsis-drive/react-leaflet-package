"use strict";

require("core-js/modules/es.object.assign.js");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.EllipsisVectorLayer = void 0;

require("core-js/modules/web.dom-collections.iterator.js");

require("core-js/modules/es.promise.js");

require("core-js/modules/es.json.stringify.js");

require("core-js/modules/es.parse-int.js");

require("core-js/modules/es.array.flat-map.js");

require("core-js/modules/es.array.unscopables.flat-map.js");

require("core-js/modules/es.string.ends-with.js");

require("core-js/modules/es.string.starts-with.js");

var _react = _interopRequireWildcard(require("react"));

var _reactLeaflet = require("react-leaflet");

var _ellipsisJsUtil = require("ellipsis-js-util");

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
  const base = (0, _react.useRef)(new _ellipsisJsUtil.VectorLayerUtil.EllipsisVectorLayerBase(_objectSpread({}, props))); //Use new map events if available.

  const _map3x = useMapEvents(!base.current.options.loadAll ? {
    move: () => {
      base.current.update();
    },
    zoomend: () => {
      base.current.update();
    }
  } : {}); //Use legacy hooks if needed.


  const _map2x = useLeaflet();

  (0, _react.useEffect)(() => {
    if (!_map2x) return;

    _map2x.map.on('move', () => base.current.update());

    _map2x.map.on('zoomend', () => base.current.update()); // eslint-disable-next-line

  }, [_map2x]);

  const getMapRef = () => {
    if (_map2x && _map2x.map) return _map2x.map;
    return _map3x;
  }; //On mount, start updating the map.


  (0, _react.useEffect)(() => {
    base.current.loadOptions.styleKeys = {
      radius: [],
      weight: ['width'],
      color: ['borderColor'],
      opacity: ['borderOpacity'],
      fillColor: [],
      fillOpacity: []
    };
    base.current.getMapBounds = getMapBounds;

    base.current.updateView = () => {
      update(Date.now());
    };

    base.current.update();
    return () => {
      base.current.clearLayer();
    }; // eslint-disable-next-line
  }, []);

  const pushPropUpdates = function pushPropUpdates() {
    for (var _len = arguments.length, updated = new Array(_len), _key = 0; _key < _len; _key++) {
      updated[_key] = arguments[_key];
    }

    updated.forEach(x => base.current.options[x] = props[x]);
  };

  (0, _react.useEffect)(() => {
    pushPropUpdates('filter', 'centerPoints', 'loadAll'); //clear cache and get new data

    base.current.clearLayer().then(async () => await base.current.update()); // eslint-disable-next-line
  }, [props.filter, props.centerPoints, props.loadAll]);
  (0, _react.useEffect)(() => {
    pushPropUpdates('blockId', 'layerId', 'token');
    base.current.fetchLayerInfo().then(async () => {
      base.current.fetchStylingInfo();
      await base.current.clearLayer();
      await base.current.update();
    }); // eslint-disable-next-line
  }, [props.blockId, props.layerId, props.token]);
  (0, _react.useEffect)(() => {
    pushPropUpdates('lineWidth', 'radius');
    base.current.recompileStyles();
    update(Date.now()); // eslint-disable-next-line
  }, [props.lineWidth, props.radius]);
  (0, _react.useEffect)(() => {
    pushPropUpdates('styleId', 'style');
    base.current.fetchStylingInfo(); //TODO check if style updates can happen without clearing the layer.

    base.current.clearLayer().then(async () => await base.current.update()); // eslint-disable-next-line
  }, [props.style, props.styleId]);

  const getFeatureId = function getFeatureId(feature) {
    let index = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    return "".concat(feature.properties.id, "_").concat(base.current.options.centerPoints ? 'center' : 'geometry', "_").concat(base.current.options.styleId ? base.current.options.styleId : 'nostyleid', "_").concat(base.current.options.style ? JSON.stringify(base.current.options.style) : 'nostyle', "_").concat(index);
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
    const features = base.current.getFeatures();
    if (!features.length) return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null);
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
          onClick: !props.onFeatureClick ? undefined : e => props.onFeatureClick(feature, e),
          pane: 'markerPane'
        })));
      }

      return [];
    }));
  };

  return render();
};

exports.EllipsisVectorLayer = EllipsisVectorLayer;
var _default = EllipsisVectorLayer;
exports.default = _default;