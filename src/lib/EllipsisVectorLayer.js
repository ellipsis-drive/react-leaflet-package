import React, { useEffect, useState, useRef } from 'react';

import { GeoJSON, CircleMarker, Marker } from 'react-leaflet';
import { VectorLayerUtil } from 'ellipsis-js-util';

const reactLeaflet = require('react-leaflet');
let useLeaflet = reactLeaflet.useLeaflet;
let useMapEvents = reactLeaflet.useMapEvents;

if (!useLeaflet) useLeaflet = () => { return undefined; };
if (!useMapEvents) useMapEvents = () => { return undefined; };

export const EllipsisVectorLayer = props => {

  const [, update] = useState(0);
  const base = useRef(new VectorLayerUtil.EllipsisVectorLayerBase({ ...props }));

  //Use new map events if available.
  const _map3x = useMapEvents(!base.current.options.loadAll ? {
    move: () => {
      base.current.update();
    },
    zoomend: () => {
      base.current.update();
    }
  } : {});

  //Use legacy hooks if needed.
  const _map2x = useLeaflet();
  useEffect(() => {
    if (!_map2x) return;
    _map2x.map.on('move', () => base.current.update());
    _map2x.map.on('zoomend', () => base.current.update());
    // eslint-disable-next-line
  }, [_map2x]);

  const getMapRef = () => {
    if (_map2x && _map2x.map) return _map2x.map;

    return _map3x;
  }

  //On mount, start updating the map.
  useEffect(() => {
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
    }

    base.current.update();
    return () => {
      base.current.clearLayer();
    }
    // eslint-disable-next-line
  }, []);

  const pushPropUpdates = (...updated) => {
    updated.forEach(x => base.current.options[x] = props[x]);
  }

  useEffect(() => {
    pushPropUpdates('filter', 'centerPoints', 'loadAll');
    //clear cache and get new data
    base.current.clearLayer().then(async () => await base.current.update());
    // eslint-disable-next-line
  }, [props.filter, props.centerPoints, props.loadAll]);

  useEffect(() => {
    pushPropUpdates('blockId', 'layerId', 'token');
    base.current.fetchLayerInfo().then(async () => {
      base.current.fetchStylingInfo();
      await base.current.clearLayer();
      await base.current.update();
    });
    // eslint-disable-next-line
  }, [props.blockId, props.layerId, props.token]);

  useEffect(() => {
    pushPropUpdates('lineWidth', 'radius');
    base.current.recompileStyles();
    update(Date.now());
    // eslint-disable-next-line
  }, [props.lineWidth, props.radius]);

  useEffect(() => {
    pushPropUpdates('styleId', 'style');
    base.current.fetchStylingInfo();

    //TODO check if style updates can happen without clearing the layer.
    base.current.clearLayer().then(async () => await base.current.update());
    // eslint-disable-next-line
  }, [props.style, props.styleId]);

  const getFeatureId = (feature, index = 0) => `${feature.properties.id}_${base.current.options.centerPoints ? 'center' : 'geometry'}_${base.current.options.styleId ? base.current.options.styleId : 'nostyleid'}_${base.current.options.style ? JSON.stringify(base.current.options.style) : 'nostyle'}_${index}`;

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
    const features = base.current.getFeatures();
    if (!features.length) return <></>;

    return <>{features.flatMap(feature => {
      const type = feature.geometry.type;
      //Check for (Multi)Polygons and (Multi)LineStrings
      if (type.endsWith('Polygon') || type.endsWith('LineString')) {
        return [
          <GeoJSON
            key={getFeatureId(feature)}
            data={feature}
            style={feature.properties.compiledStyle}
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
            {...feature.properties.compiledStyle}
            interactive={props.onFeatureClick ? true : false}
            onClick={!props.onFeatureClick ? undefined : (e) => props.onFeatureClick(feature, e)}
            pane={'markerPane'}
          />
        )
      }
      return [];
    })}</>
  }
  return render();
}

export default EllipsisVectorLayer;