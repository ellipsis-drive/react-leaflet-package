"use strict";

require("core-js/modules/es.object.assign.js");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.EllipsisVectorLayer = void 0;
require("core-js/modules/web.dom-collections.iterator.js");
require("core-js/modules/es.parse-int.js");
require("core-js/modules/es.json.stringify.js");
require("core-js/modules/es.array.flat-map.js");
require("core-js/modules/es.array.unscopables.flat-map.js");
require("core-js/modules/es.string.ends-with.js");
require("core-js/modules/es.string.starts-with.js");
var _react = _interopRequireWildcard(require("react"));
var _reactLeaflet = require("react-leaflet");
var _ellipsisJsUtil = require("ellipsis-js-util");
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
const reactLeaflet = require("react-leaflet");
let useLeaflet = reactLeaflet.useLeaflet;
let useMapEvents = reactLeaflet.useMapEvents;
if (!useLeaflet) useLeaflet = () => {
  return undefined;
};
if (!useMapEvents) useMapEvents = () => {
  return undefined;
};
const EllipsisPopupProperty = _ref => {
  let {
    feature
  } = _ref;
  // console.log(feature.properties.compiledStyle)
  // console.log(feature.properties)
  return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, feature.properties.compiledStyle.popupProperty ? /*#__PURE__*/_react.default.createElement(_reactLeaflet.Tooltip, {
    direction: "right",
    offset: [0, 0],
    opacity: 1,
    permanent: true
  }, feature.properties[feature.properties.compiledStyle.popupProperty]) : undefined);
};
const EllipsisVectorLayer = props => {
  const [, update] = (0, _react.useState)(0);
  const baseUpdateFunction = (0, _react.useRef)();
  const base = (0, _react.useMemo)(() => {
    const base = new _ellipsisJsUtil.VectorLayerUtil.EllipsisVectorLayerBase(_objectSpread({}, props));
    base.loadOptions.styleKeys = {
      radius: [],
      weight: ["width"],
      color: ["borderColor"],
      opacity: ["borderOpacity"],
      fillColor: [],
      fillOpacity: [],
      popupProperty: []
    };
    baseUpdateFunction.current = base.update;
    base.updateView = () => {
      update(Date.now());
    };
    return base;
  }, [props]);
  console.log("rerender");

  //Use new map events if available.
  const _map3x = useMapEvents({
    move: () => {
      var _baseUpdateFunction$c;
      (_baseUpdateFunction$c = baseUpdateFunction.current) === null || _baseUpdateFunction$c === void 0 ? void 0 : _baseUpdateFunction$c.call(baseUpdateFunction);
    },
    zoomend: () => {
      var _baseUpdateFunction$c2;
      (_baseUpdateFunction$c2 = baseUpdateFunction.current) === null || _baseUpdateFunction$c2 === void 0 ? void 0 : _baseUpdateFunction$c2.call(baseUpdateFunction);
    }
  });

  //Use legacy hooks if needed.
  const _map2x = useLeaflet();
  (0, _react.useEffect)(() => {
    if (!_map2x) return;
    _map2x.map.on("move", base.update);
    _map2x.map.on("zoomend", base.update);
    return () => {
      var _map2x$map$off, _map2x$map, _map2x$map$off2, _map2x$map2;
      (_map2x$map$off = (_map2x$map = _map2x.map).off) === null || _map2x$map$off === void 0 ? void 0 : _map2x$map$off.call(_map2x$map, "move", base.update);
      (_map2x$map$off2 = (_map2x$map2 = _map2x.map).off) === null || _map2x$map$off2 === void 0 ? void 0 : _map2x$map$off2.call(_map2x$map2, "zoomend", base.update);
    };
  }, [_map2x, base]);
  const mapRef = (0, _react.useMemo)(() => {
    if (_map2x && _map2x.map) return _map2x.map;
    return _map3x;
  }, [_map2x, _map3x]);
  const getMapBounds = (0, _react.useCallback)(() => {
    const map = mapRef;
    if (!map) return;
    const screenBounds = map.getBounds();
    const zoom = map.getZoom();
    let bounds = {
      xMin: screenBounds.getWest(),
      xMax: screenBounds.getEast(),
      yMin: screenBounds.getSouth(),
      yMax: screenBounds.getNorth()
    };
    //Mapbox uses 512x512 tiles, and ellipsis uses 256x256 tiles. So increase zoom with 1. 'zoom256 = zoom512 + 1'
    return {
      bounds,
      zoom: parseInt(zoom, 10)
    };
  }, [mapRef]);

  //Start loading the tiles when mounted. Cleanup by clearing cache.
  (0, _react.useEffect)(() => {
    base.getMapBounds = getMapBounds;
    base.update();
    return () => {
      base.clearLayer();
    };
  }, [base, getMapBounds]);
  const getFeatureId = function getFeatureId(feature) {
    let index = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    return "".concat(feature.properties.id, "_").concat(base.levelOfDetail, "_").concat(base.getReturnType(), "_").concat(base.options.styleId ? base.options.styleId : "nostyleid", "_").concat(base.options.style ? JSON.stringify(base.options.style) : "nostyle", "_").concat(index);
  };
  const render = () => {
    const features = base.getFeatures();
    if (!features.length) return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null);
    return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, features.flatMap(feature => {
      const type = feature.geometry.type;
      //Check for (Multi)Polygons and (Multi)LineStrings
      if (type.endsWith("Polygon") || type.endsWith("LineString")) {
        return [/*#__PURE__*/_react.default.createElement(_reactLeaflet.GeoJSON, {
          key: getFeatureId(feature),
          data: feature,
          style: feature.properties.compiledStyle,
          interactive: props.onFeatureClick ? true : false,
          onEachFeature: !props.onFeatureClick ? undefined : (feature, layer) => layer.on("click", () => props.onFeatureClick(feature, layer))
        }, /*#__PURE__*/_react.default.createElement(EllipsisPopupProperty, {
          feature: feature
        }))];
      }
      if (type.endsWith("Point")) {
        let coordinates = feature.geometry.coordinates;
        //Ensure that it's always an array of coordinates.
        if (!type.startsWith("Multi")) coordinates = [coordinates];
        return coordinates.map((coordinate, i) => props.useMarkers ? /*#__PURE__*/_react.default.createElement(_reactLeaflet.Marker, {
          key: getFeatureId(feature, i),
          position: [coordinate[1], coordinate[0]],
          interactive: props.onFeatureClick ? true : false,
          onClick: !props.onFeatureClick ? undefined : e => props.onFeatureClick(feature, e)
        }, /*#__PURE__*/_react.default.createElement(EllipsisPopupProperty, {
          feature: feature
        })) : /*#__PURE__*/_react.default.createElement(_reactLeaflet.CircleMarker, _extends({
          key: getFeatureId(feature, i),
          center: [coordinate[1], coordinate[0]]
        }, feature.properties.compiledStyle, {
          interactive: props.onFeatureClick ? true : false,
          onClick: !props.onFeatureClick ? undefined : e => props.onFeatureClick(feature, e),
          pane: "markerPane"
        }), /*#__PURE__*/_react.default.createElement(EllipsisPopupProperty, {
          feature: feature
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