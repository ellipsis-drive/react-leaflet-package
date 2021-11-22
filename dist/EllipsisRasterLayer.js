"use strict";

require("core-js/modules/web.dom-collections.iterator.js");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.EllipsisRasterLayer = void 0;

var _reactLeaflet = _interopRequireWildcard(require("react-leaflet"));

var _EllipsisApi = _interopRequireDefault(require("./EllipsisApi"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

const EllipsisRasterLayer = props => {
  let url = "".concat(_EllipsisApi.default.apiUrl, "/tileService/").concat(props.blockId, "/").concat(props.captureId, "/").concat(props.visualizationId, "/{z}/{x}/{y}");

  if (props.token) {
    url = url + '?token=' + props.token;
  }

  return /*#__PURE__*/_reactLeaflet.default.createElement(_reactLeaflet.TileLayer, {
    key: props.blockId + '_' + props.captureId + '_' + props.visualizationId,
    url: url,
    tileSize: 256,
    noWrap: true,
    maxNativeZoom: props.maxZoom,
    format: 'image/png'
  });
};

exports.EllipsisRasterLayer = EllipsisRasterLayer;
var _default = EllipsisRasterLayer;
exports.default = _default;