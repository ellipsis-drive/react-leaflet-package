"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/web.dom-collections.iterator.js");

var _react = _interopRequireWildcard(require("react"));

var _reactLeaflet = require("react-leaflet");

var _ellipsisJsUtil = require("ellipsis-js-util");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

const EllipsisRasterLayer = props => {
  const [url, setUrl] = (0, _react.useState)(_ellipsisJsUtil.RasterLayerUtil.getSlippyMapUrl(props));
  const mounted = (0, _react.useRef)(false);
  (0, _react.useEffect)(() => {
    if (!mounted) return;
    setUrl(_ellipsisJsUtil.RasterLayerUtil.getSlippyMapUrl(props));
  }, [props.token, props.blockId, props.captureId, props.visualizationId, props.visualization]);
  (0, _react.useEffect)(() => {
    mounted.current = true;
  }, []);
  return /*#__PURE__*/_react.default.createElement(_reactLeaflet.TileLayer, {
    key: _ellipsisJsUtil.RasterLayerUtil.getLayerId(props),
    url: url,
    tileSize: 256,
    noWrap: true,
    reuseTiles: true,
    maxNativeZoom: props.maxZoom,
    format: 'image/png'
  });
};

var _default = EllipsisRasterLayer;
exports.default = _default;