import React, { useEffect, useRef, useState } from 'react';

import { GeoJSON, CircleMarker, Marker } from 'react-leaflet';

import EllipsisApi from './EllipsisApi';

const reactLeaflet = require('react-leaflet');
let useLeaflet = reactLeaflet.useLeaflet;
let useMapEvents = reactLeaflet.useMapEvents;

if (!useLeaflet) useLeaflet = () => { return undefined; };
if (!useMapEvents) useMapEvents = () => { return undefined; };

export const EllipsisVectorLayer = props => {

  const [, update] = useState(0);

  const [state] = useState({
    cache: [],
    tiles: [],
    zoom: 1,
    isLoading: false,
    nextPageStart: undefined,
    gettingVectorsInterval: undefined
  });

  //Use new map events if available.
  const _map3x = useMapEvents(!props.loadAll ? {
    move: () => {
      handleViewportUpdate();
    },
    zoomend: () => {
      handleViewportUpdate();
    }
  } : {});

  //Use legacy hooks if needed.
  const _map2x = useLeaflet();
  useEffect(() => {
    if (!_map2x) return;
    _map2x.map.on('move', () => handleViewportUpdate());
    _map2x.map.on('zoomend', () => handleViewportUpdate());
    // eslint-disable-next-line
  }, [_map2x]);

  const getMapRef = () => {
    if (_map2x && _map2x.map) return _map2x.map;

    return _map3x;
  }

  //On mount, start updating the map.
  useEffect(() => {
    handleViewportUpdate();
    return () => {
      if (state.gettingVectorsInterval) {
        clearInterval(state.gettingVectorsInterval);
        state.gettingVectorsInterval = undefined;
      }
    }
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    //refresh rendering
    let features;
    if (props.loadAll) {
      features = state.cache;
    } else {
      features = state.tiles.flatMap((t) => {
        const geoTile = state.cache[getTileId(t)];
        return geoTile ? geoTile.elements : [];
      });
    }
    features.forEach(x => styleGeoJson(x, props.lineWidth, props.radius));
    handleViewportUpdate();
  }, [props.lineWidth, props.radius]);

  useEffect(() => {
    //clear cache and get new data
    console.log('critical prop change detected, resetting state');

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

  }, [props.blockId, props.layerId, props.styleId, props.style, props.filter, props.centerPoints, props.loadAll]);

  const handleViewportUpdate = () => {
    const viewport = getMapBounds();
    if (!viewport) return;
    state.zoom = Math.max(Math.min(props.maxZoom, viewport.zoom - 2), 0);
    state.tiles = boundsToTiles(viewport.bounds, state.zoom);

    if (state.gettingVectorsInterval) return;
    state.gettingVectorsInterval = setInterval(async () => {
      if (state.isLoading) return;

      const loadedSomething = await loadStep();

      if (state.resetState) {
        state.cache = [];
        state.tiles = [];
        state.nextPageStart = undefined;
        state.resetState = undefined;
        update(Date.now());
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
    state.isLoading = true;
    // console.log('loading');
    if (props.loadAll) {
      const cachedSomething = await getAndCacheAllGeoJsons();
      state.isLoading = false;
      // console.log('done loading');
      return cachedSomething;
    }

    ensureMaxCacheSize();
    const cachedSomething = await getAndCacheGeoJsons();
    state.isLoading = false;
    // console.log('done loading');
    return cachedSomething;
  };

  const ensureMaxCacheSize = () => {
    const keys = Object.keys(state.cache);
    if (keys.length > props.maxTilesInCache) {
      const dates = keys.map((k) => state.state.cache[k].date).sort();
      const clipValue = dates[9];
      keys.forEach((key) => {
        if (state.cache[key].date <= clipValue) {
          delete state.cache[key];
        }
      });
    }
  };

  const getAndCacheAllGeoJsons = async () => {
    if (state.nextPageStart === 4)
      return false;

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
      const res = await EllipsisApi.post("/geometry/get", body, { token: props.token });
      state.nextPageStart = res.nextPageStart;
      if (!res.nextPageStart)
        state.nextPageStart = 4; //EOT
      if (res.result && res.result.features) {
        res.result.features.forEach(x => {
          styleGeoJson(x, props.lineWidth, props.radius);
          state.cache.push(x);
        });
      }
    } catch {
      return false;
    }
    return true;
  };

  const getAndCacheGeoJsons = async () => {
    const date = Date.now();
    //create tiles parameter which contains tiles that need to load more features
    const tilesParam = state.tiles.map((t) => {
      const tileId = getTileId(t);

      //If not cached, always try to load features.
      if (!state.cache[tileId])
        return { tileId: t }

      const pageStart = state.cache[tileId].nextPageStart;

      //TODO in other packages we use < instead of <=
      //Check if tile is not already fully loaded, and if more features may be loaded
      if (pageStart && state.cache[tileId].amount <= props.maxFeaturesPerTile && state.cache[tileId].size <= (props.maxMbPerTile * 1000000))
        return { tileId: t, pageStart }

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
      propertyFilter: (props.filter && props.filter > 0) ? props.filter : null,
    };

    //Get new geometry for the tiles
    let result = [];
    const chunkSize = 10;
    for (let k = 0; k < tilesParam.length; k += chunkSize) {
      body.tiles = tilesParam.slice(k, k + chunkSize);
      try {
        const res = await EllipsisApi.post("/geometry/tile", body, { token: props.token });
        result = result.concat(res);
      } catch {
        return false;
      }
    }

    //Add newly loaded data to cache
    for (let j = 0; j < tilesParam.length; j++) {
      const tileId = getTileId(tilesParam[j].tileId);

      if (!state.cache[tileId]) {
        state.cache[tileId] = {
          size: 0,
          amount: 0,
          elements: [],
          nextPageStart: null,
        };
      }

      //set tile info for tile in this.
      const tileData = state.cache[tileId];
      tileData.date = date;
      tileData.size = tileData.size + result[j].size;
      tileData.amount = tileData.amount + result[j].result.features.length;
      tileData.nextPageStart = result[j].nextPageStart;
      result[j].result.features.forEach(x => styleGeoJson(x, props.lineWidth, props.radius));
      tileData.elements = tileData.elements.concat(result[j].result.features);

    }
    return true;
  };

  const getTileId = (tile) => `${tile.zoom}_${tile.tileX}_${tile.tileY}`;

  const getFeatureId = (feature, index = 0) => `${feature.properties.id}_${props.centerPoints ? 'center' : 'geometry'}_${props.styleId ? props.styleId : 'nostyle'}_${index}`;

  const styleGeoJson = (geoJson, weight, radius) => {
    if (!geoJson || !geoJson.geometry || !geoJson.geometry.type || !geoJson.properties) return;

    const type = geoJson.geometry.type;
    const properties = geoJson.properties;
    const color = properties.color;

    let hex = '000000', alpha = 0.5; //default to black, with 25% opacity
    if (color) {
      const splitHexComponents = /^#?([a-f\d]{6})([a-f\d]{2})?$/i.exec(color);
      hex = splitHexComponents[1];
      alpha = parseInt(splitHexComponents[2], 16) / 255;
      if (isNaN(alpha)) alpha = 0.5;
    }

    properties.style = {};
    properties.style.fillOpacity = alpha;
    properties.style.color = `#${hex}`;

    //Parse line width
    if (type.endsWith('Point')) {
      properties.style.radius = radius;
      properties.style.weight = 2;
    }
    else properties.style.weight = weight;
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
    const tileYMin = Math.floor(
      (zoomComp / comp2) *
      (pi - Math.log(Math.tan(comp3 + (yMax / 360) * pi)))
    );
    const tileYMax = Math.floor(
      (zoomComp / comp2) *
      (pi - Math.log(Math.tan(comp3 + (yMin / 360) * pi)))
    );

    let tiles = [];
    for (
      let x = Math.max(0, tileXMin - 1);
      x <= Math.min(2 ** zoom - 1, tileXMax + 1);
      x++
    ) {
      for (
        let y = Math.max(0, tileYMin - 1);
        y <= Math.min(2 ** zoom - 1, tileYMax + 1);
        y++
      ) {
        tiles.push({ zoom, tileX: x, tileY: y });
      }
    }
    return tiles;
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
      yMax: screenBounds.getNorth(),
    };
    //Mapbox uses 512x512 tiles, and ellipsis uses 256x256 tiles. So increase zoom with 1. 'zoom256 = zoom512 + 1'
    return { bounds, zoom: parseInt(zoom, 10) };
  };

  const render = () => {
    if (!state.tiles || state.tiles.length === 0) return <></>;
    let features;
    if (props.loadAll) {
      features = state.cache;
    } else {
      features = state.tiles.flatMap((t) => {
        const geoTile = state.cache[getTileId(t)];
        return geoTile ? geoTile.elements : [];
      });
    }

    // console.log(features.filter(x => 
    //   features.filter(y => y.properties.id === x.properties.id).length > 1
    // ).length > 0);

    return <>{features.flatMap(feature => {
      const type = feature.geometry.type;
      //Check for (Multi)Polygons and (Multi)LineStrings
      if (type.endsWith('Polygon') || type.endsWith('LineString')) {
        return [
          <GeoJSON
            key={getFeatureId(feature)}
            data={feature}
            style={feature.properties.style}
            interactive={props.onFeatureClick ? true : false}
            onEachFeature={!props.onFeatureClick ? undefined : (feature, layer) =>
              layer.on('click', () => props.onFeatureClick(feature, layer))
            }
          />,
        ];
      }
      if (type.endsWith('Point')) {
        let coordinates = feature.geometry.coordinates;
        //Ensure that it's always an array of coordinates.
        if (!type.startsWith('Multi')) coordinates = [coordinates];

        return coordinates.map((coordinate, i) => props.useMarkers ?
          <Marker
            key={getFeatureId(feature, i)}
            position={[coordinate[1], coordinate[0]]}
            interactive={props.onFeatureClick ? true : false}
            onClick={!props.onFeatureClick ? undefined : (e) => props.onFeatureClick(feature, e)}
          /> :
          <CircleMarker
            key={getFeatureId(feature, i)}
            center={[coordinate[1], coordinate[0]]}
            color={feature.properties.style.color}
            opacity={feature.properties.style.fillOpacity}
            radius={feature.properties.style.radius}
            weight={feature.properties.style.weight}
            interactive={props.onFeatureClick ? true : false}
            onClick={!props.onFeatureClick ? undefined : (e) => props.onFeatureClick(feature, e)}
          />
        )
      }
      return [];
    })}</>
  }

  return render();
}

EllipsisVectorLayer.defaultProps = {
  pageSize: 25,
  maxZoom: 21,
  lineWidth: 2,
  radius: 5,
  maxFeaturesPerTile: 200,
  maxMbPerTile: 16,
  maxTilesInCache: 500,
  loadAll: false,
}

export default EllipsisVectorLayer;