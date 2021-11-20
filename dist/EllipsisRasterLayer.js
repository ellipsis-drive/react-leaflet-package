"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.EllipsisRasterLayer = void 0;

var _reactLeaflet = require("react-leaflet");

var _EllipsisApi = _interopRequireDefault(require("./EllipsisApi"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const EllipsisRasterLayer = props => {
  let url = "".concat(_EllipsisApi.default.apiUrl, "/tileService/").concat(props.blockId, "/").concat(props.captureId, "/").concat(props.visualizationId, "/{z}/{x}/{y}");

  if (props.token) {
    url = url + '?token=' + props.token;
  }

  return /*#__PURE__*/React.createElement(_reactLeaflet.TileLayer, {
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