"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/es.json.stringify.js");

var _react = _interopRequireDefault(require("react"));

var _reactLeaflet = require("react-leaflet");

var _EllipsisApi = _interopRequireDefault(require("./EllipsisApi"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const EllipsisRasterLayer = props => {
  let url;

  if (props.visualization) {
    url = "".concat(_EllipsisApi.default.getApiUrl(), "/settings/mapLayers/preview/").concat(props.blockId, "/").concat(props.captureId, "/").concat(props.visualization.method, "/{z}/{x}/{y}?parameters=").concat(JSON.stringify(props.visualization.parameters));
    if (props.token) url += '&token=' + props.token;
  } else {
    url = "".concat(_EllipsisApi.default.getApiUrl(), "/tileService/").concat(props.blockId, "/").concat(props.captureId, "/").concat(props.visualizationId, "/{z}/{x}/{y}");
    if (props.token) url += '?token=' + props.token;
  }

  return /*#__PURE__*/_react.default.createElement(_reactLeaflet.TileLayer, {
    key: props.blockId + '_' + props.captureId + '_' + props.visualizationId,
    url: url,
    tileSize: 256,
    noWrap: true,
    maxNativeZoom: props.maxZoom,
    format: 'image/png'
  });
};

var _default = EllipsisRasterLayer;
exports.default = _default;