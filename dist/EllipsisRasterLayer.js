"use strict";

require("core-js/modules/es.weak-map.js");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
require("core-js/modules/web.dom-collections.iterator.js");
var _react = _interopRequireWildcard(require("react"));
var _reactLeaflet = require("react-leaflet");
var _ellipsisJsUtil = require("ellipsis-js-util");
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
const EllipsisRasterLayer = _ref => {
  let {
    pathId,
    timestampId,
    style,
    zoom,
    token,
    mask
  } = _ref;
  const [res, setRes] = (0, _react.useState)();
  (0, _react.useEffect)(() => {
    let destructorCalled = false;
    _ellipsisJsUtil.RasterLayerUtil.getSlippyMapUrlWithDefaults({
      pathId,
      timestampId,
      style,
      zoom,
      token,
      mask
    }).then(res => {
      if (!destructorCalled) setRes(res);
    });
    return () => {
      destructorCalled = true;
    };
  }, [pathId, timestampId, style, zoom, token, mask]);
  if (!res) return null;
  return /*#__PURE__*/_react.default.createElement(_reactLeaflet.TileLayer, {
    key: res.id,
    url: res.url,
    tileSize: 256,
    noWrap: true,
    reuseTiles: true,
    maxNativeZoom: res.zoom,
    maxZoom: 25,
    format: "image/png"
  });
};
var _default = exports.default = EllipsisRasterLayer;