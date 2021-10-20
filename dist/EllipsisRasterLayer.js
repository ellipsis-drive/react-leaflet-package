"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.EllipsisRasterLayer = void 0;

require("core-js/modules/web.dom-collections.iterator.js");

var _react = _interopRequireDefault(require("react"));

var _reactLeaflet = require("react-leaflet");

var _EllipsisApi = _interopRequireDefault(require("./EllipsisApi"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class EllipsisRasterLayer extends _react.default.PureComponent {
  constructor() {
    super(...arguments);

    _defineProperty(this, "render", () => {
      let url = "".concat(_EllipsisApi.default.apiUrl, "/tileService/").concat(this.props.blockId, "/").concat(this.props.captureId, "/").concat(this.props.visualizationId, "/{z}/{x}/{y}");

      if (this.props.token) {
        url = url + '?token=' + this.props.token;
      }

      return /*#__PURE__*/_react.default.createElement(_reactLeaflet.TileLayer, {
        key: this.props.blockId + '_' + this.props.captureId + '_' + this.props.visualizationId,
        url: url,
        tileSize: 256,
        noWrap: true,
        maxNativeZoom: this.props.maxZoom,
        format: 'image/png'
      });
    });
  }

}

exports.EllipsisRasterLayer = EllipsisRasterLayer;
var _default = EllipsisRasterLayer;
exports.default = _default;