"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.EllipsisVectorLayer = void 0;

require("core-js/modules/es.promise.js");

require("core-js/modules/es.array.sort.js");

require("core-js/modules/web.dom-collections.iterator.js");

require("core-js/modules/es.parse-float.js");

require("core-js/modules/es.parse-int.js");

var _react = _interopRequireDefault(require("react"));

var _reactLeaflet = require("react-leaflet");

var _EllipsisApi = _interopRequireDefault(require("./EllipsisApi"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class EllipsisVectorLayer extends _react.default.PureComponent {
  constructor(props, context) {
    super(props, context);

    _defineProperty(this, "setNewViewportTimer", null);

    _defineProperty(this, "componentDidMount", () => {
      this.getVectors();
      this.refreshing = setInterval(this.getVectors, 100);
      this.onGetTiles();
      this.gettingTiles = setInterval(this.onGetTiles, 100);
    });

    _defineProperty(this, "componentDidUpdate", (prevProps, prevState) => {
      if (prevProps.styleId !== this.props.styleId || prevProps.filter !== this.props.filter || prevProps.centerPoints !== this.props.centerPoints) {
        this.geometryLayer = {
          tiles: [],
          pageStart: null
        };
      }
    });

    _defineProperty(this, "componentWillUnmount", () => {
      clearInterval(this.refreshing);
      clearInterval(this.gettingTiles);
    });

    _defineProperty(this, "onGetTiles", () => {
      let viewport = getLeafletMapBounds(this.props.mapRef);

      if (!viewport) {
        return;
      }

      let zoom = Math.min(this.props.maxZoom, viewport.zoom - 2);
      zoom = Math.max(zoom, 0);
      let tiles = boundsToTiles(viewport.bounds, zoom);
      this.tiles = tiles;
      this.zoom = zoom;
    });

    _defineProperty(this, "getVectors", async () => {
      if (this.gettingVectors) {
        return;
      }

      this.gettingVectors = true;
      this.changed = false;
      let now = Date.now(); //for layers

      await this.getVectorsHelper(now);

      if (this.changed) {
        this.setState({
          getVectorChagned: this.state.getVectorChagned + 1
        }, () => {
          this.gettingVectors = false;
        });
      } else {
        this.gettingVectors = false;
      }
    });

    _defineProperty(this, "getVectorsHelper", async now => {
      let tiles = this.tiles; //clear cache

      let currentLength = Object.keys(this.geometryLayer.tiles).length;

      if (currentLength > this.props.maxTilesInCache) {
        let dates = Object.keys(this.geometryLayer.tiles).map(k => this.geometryLayer.tiles[k].date);
        dates.sort();
        let clipValue = dates[9];
        let keys = Object.keys(this.geometryLayer.tiles);

        for (let k = 0; k < keys.length; k++) {
          let key = keys[k];

          if (this.geometryLayer.tiles[key].date <= clipValue) {
            delete this.geometryLayer.tiles[keys[k]];
          }
        }
      } //prepare tiles parameter


      let tilesParam = [...tiles];
      tilesParam = tilesParam.map(t => {
        let pageStart;
        let tileId = t.zoom + '_' + t.tileX + '_' + t.tileY;

        if (this.geometryLayer.tiles[tileId]) {
          pageStart = this.geometryLayer.tiles[tileId].nextPageStart;
        }

        if (!this.geometryLayer.tiles[tileId] || pageStart && this.geometryLayer.tiles[tileId].amount < this.props.maxVectorsPerTile && this.geometryLayer.tiles[tileId].size < this.props.maxMbPerTile) {
          return {
            tileId: t,
            pageStart: pageStart
          };
        }

        return null;
      });
      tilesParam = tilesParam.filter(x => x); //prepare other parameters

      if (tilesParam.length > 0) {
        //get addtional elements
        this.changed = true;
        await getGeoJsons(this.geometryLayer, tilesParam, this.props.token, this.props.mapId, Math.min(3000, this.props.pageSize), this.props.layerId, this.props.styleId, this.props.lineWidth, this.props.radius, this.selectFeature, this.props.filter, now, this.props.centerPoints);
      }
    });

    _defineProperty(this, "prepareGeometryLayer", () => {
      let geometryTiles = this.tiles;

      if (!geometryTiles) {
        geometryTiles = [];
      }

      let layerElements = [];

      for (let j = 0; j < geometryTiles.length; j++) {
        let t = geometryTiles[j];
        let extra = this.geometryLayer.tiles[t.zoom + '_' + t.tileX + '_' + t.tileY] ? this.geometryLayer.tiles[t.zoom + '_' + t.tileX + '_' + t.tileY].elements : [];
        layerElements = layerElements.concat(extra);
      }

      return layerElements;
    });

    _defineProperty(this, "selectFeature", async feature => {
      console.log('SELECTING');
      let body = {
        mapId: this.props.mapId,
        layerId: this.props.layerId,
        geometryIds: [feature.properties.id],
        returnType: 'all'
      };

      try {
        let result = await _EllipsisApi.default.post('/geometry/ids', body, this.props.token);
        this.props.selectFeature({
          size: result.size,
          feature: result.result.features[0]
        });
      } catch (e) {
        console.log(e);
      }
    });

    _defineProperty(this, "render", () => {
      return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, this.prepareGeometryLayer());
    });

    this.tiles = [];
    this.geometryLayer = {
      tiles: []
    };
    this.zoom = 1;
    this.changed = false;
    this.state = {
      getVectorChagned: 0
    };
  }

}

exports.EllipsisVectorLayer = EllipsisVectorLayer;

const createGeoJsonLayerStyle = (color, fillOpacity, weight) => {
  return {
    color: color ? color : '#3388ff',
    weight: weight ? weight : 5,
    fillOpacity: fillOpacity ? fillOpacity : 0.06
  };
};

const boundsToTiles = (bounds, zoom) => {
  zoom = Math.max(0, zoom);
  let xMin = Math.max(bounds.xMin, -180);
  let xMax = Math.min(bounds.xMax, 180);
  let yMin = Math.max(bounds.yMin, -85);
  let yMax = Math.min(bounds.yMax, 85);
  let zoomComp = Math.pow(2, zoom);
  let comp1 = zoomComp / 360;
  let pi = Math.PI;
  let comp2 = 2 * pi;
  let comp3 = pi / 4;
  let tileXMin = Math.floor((xMin + 180) * comp1);
  let tileXMax = Math.floor((xMax + 180) * comp1);
  let tileYMin = Math.floor(zoomComp / comp2 * (pi - Math.log(Math.tan(comp3 + yMax / 360 * pi))));
  let tileYMax = Math.floor(zoomComp / comp2 * (pi - Math.log(Math.tan(comp3 + yMin / 360 * pi))));
  let tiles = [];
  let x = Math.max(0, tileXMin - 1);

  while (x <= Math.min(2 ** zoom - 1, tileXMax + 1)) {
    let y = Math.max(0, tileYMin - 1);

    while (y <= Math.min(2 ** zoom - 1, tileYMax + 1)) {
      tiles.push({
        zoom: zoom,
        tileX: x,
        tileY: y
      });
      y = y + 1;
    }

    x = x + 1;
  }

  return tiles;
};

const getGeoJsons = async (geometryLayer, tiles, token, mapId, pageSize, layerId, styleId, lineWidth, radius, selectFeature, filter, date, showLocation) => {
  let returnType = showLocation ? 'center' : 'geometry';
  filter = filter ? filter.length > 0 ? filter : null : null;
  let body = {
    mapId: mapId,
    returnType: returnType,
    layerId: layerId,
    zip: true,
    pageSize: pageSize,
    styleId: styleId,
    propertyFilter: filter
  };
  let result = [];
  let chunkSize = 10;

  for (let k = 0; k < tiles.length; k += chunkSize) {
    body.tiles = tiles.slice(k, k + chunkSize);

    try {
      let res = await _EllipsisApi.default.post('/geometry/tile', body, token);
      result = result.concat(res);
    } catch (_unused) {
      return null;
    }
  }

  for (let j = 0; j < tiles.length; j++) {
    let t = tiles[j];
    let tileId = t.tileId.zoom + '_' + t.tileId.tileX + '_' + t.tileId.tileY;

    if (!geometryLayer.tiles[tileId]) {
      geometryLayer.tiles[tileId] = {
        size: 0,
        amount: 0,
        elements: [],
        nextPageStart: null
      };
    }

    let tileInfo = geometryLayer.tiles[tileId];
    tileInfo.date = date;
    tileInfo.size = tileInfo.size + result[j].size;
    tileInfo.amount = tileInfo.amount + result[j].result.features.length;
    tileInfo.nextPageStart = result[j].nextPageStart;
    let elements = [];

    for (let l = 0; l < result[j].result.features.length; l++) {
      let feature = result[j].result.features[l];
      let newElements = featureToGeoJson(feature, feature.properties.color, lineWidth, radius, 500, selectFeature, feature.properties.id + '_' + returnType + '_' + styleId);
      elements = elements.concat(newElements);
    }

    tileInfo.elements = tileInfo.elements.concat(elements);
  }
};

const featureToGeoJson = function featureToGeoJson(feature, color, width, radius, geometryLength, onFeatureClick, key, asMarker) {
  let forceColor = arguments.length > 8 && arguments[8] !== undefined ? arguments[8] : false;
  let alpha;

  if (color) {
    if (!forceColor) {
      if (feature.properties && feature.properties.color) {
        let colorString = feature.properties.color;
        let valid = /^#?([A-Fa-f0-9]{2}){3,4}$/.test(colorString);

        if (valid) {
          color = colorString;
        }
      }
    }

    if (color.length === 10) {
      alpha = color.substring(8, 10);
      alpha = parseFloat(parseInt(alpha, 16)) / 255;
    } else {
      alpha = 0.5;
    }
  }

  let element;
  let type = feature.geometry.type;

  if (type === 'Polygon' || type === 'MultiPolygon') {
    element = [/*#__PURE__*/_react.default.createElement(_reactLeaflet.GeoJSON, {
      key: key,
      data: feature,
      style: color ? createGeoJsonLayerStyle(color, alpha, width) : null,
      interactive: onFeatureClick ? true : false,
      onEachFeature: onFeatureClick ? (feature, layer) => {
        layer.on({
          click: () => onFeatureClick(feature)
        });
      } : null
    })];
  } else if (type === 'LineString' || type === 'MultiLineString') {
    element = [/*#__PURE__*/_react.default.createElement(_reactLeaflet.GeoJSON, {
      key: key,
      data: feature,
      style: color ? createGeoJsonLayerStyle(color, 1, 8) : null,
      interactive: onFeatureClick ? true : false,
      onEachFeature: onFeatureClick ? (feature, layer) => {
        layer.on({
          click: () => onFeatureClick(feature)
        });
      } : null
    })];
  } else if (type === 'Point' || type === 'MultiPoint') {
    let radius = Math.min(150 / geometryLength ** 0.5, radius);
    let coords = feature.geometry.coordinates;
    let isMultiMarker = Array.isArray(coords) && Array.isArray(coords[0]);

    if (isMultiMarker === true) {
      if (asMarker) {
        element = coords.map((coord, i) => /*#__PURE__*/_react.default.createElement(_reactLeaflet.Marker, {
          key: key + '_' + i,
          position: [coord[1], coord[0]],
          interactive: onFeatureClick ? true : false,
          onClick: onFeatureClick ? () => {
            onFeatureClick(feature);
          } : null
        }));
      } else {
        element = coords.map((coord, i) => /*#__PURE__*/_react.default.createElement(_reactLeaflet.CircleMarker, {
          key: key + '_' + i,
          center: [coord[1], coord[0]],
          color: color,
          opacity: 1,
          radius: radius,
          weight: 2,
          interactive: onFeatureClick ? true : false,
          onClick: onFeatureClick ? () => {
            onFeatureClick(feature);
          } : null
        }));
      }
    } else {
      if (asMarker) {
        element = /*#__PURE__*/_react.default.createElement(_reactLeaflet.Marker, {
          key: key,
          position: [coords[1], coords[0]],
          interactive: onFeatureClick ? true : false,
          onClick: onFeatureClick ? () => {
            onFeatureClick(feature);
          } : null
        });
      } else {
        element = [/*#__PURE__*/_react.default.createElement(_reactLeaflet.CircleMarker, {
          center: [coords[1], coords[0]],
          color: color,
          opacity: 1,
          radius: radius,
          weight: 2,
          key: key,
          interactive: onFeatureClick ? true : false,
          onClick: onFeatureClick ? () => {
            onFeatureClick(feature);
          } : null
        })];
      }
    }
  }

  return element;
};

const getLeafletMapBounds = leafletMap => {
  if (!leafletMap || !leafletMap._zoom) return;
  const screenBounds = leafletMap.getBounds();
  let bounds = {
    xMin: screenBounds.getWest(),
    xMax: screenBounds.getEast(),
    yMin: screenBounds.getSouth(),
    yMax: screenBounds.getNorth()
  };
  return {
    bounds: bounds,
    zoom: leafletMap._zoom
  };
};

EllipsisVectorLayer.defaultProps = {
  pageSize: 25,
  maxZoom: 21,
  lineWidth: 5,
  radius: 15,
  maxVectorsPerTile: 200,
  maxMbPerTile: 16000000,
  maxTilesInCache: 500
};
var _default = EllipsisVectorLayer;
exports.default = _default;