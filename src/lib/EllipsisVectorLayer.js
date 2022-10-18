import React, { useEffect, useState, useRef, useMemo } from 'react';

import { GeoJSON, CircleMarker, Marker, Tooltip } from 'react-leaflet';
import { VectorLayerUtil } from 'ellipsis-js-util';

const reactLeaflet = require('react-leaflet');
let useLeaflet = reactLeaflet.useLeaflet;
let useMapEvents = reactLeaflet.useMapEvents;

if (!useLeaflet) useLeaflet = () => { return undefined; };
if (!useMapEvents) useMapEvents = () => { return undefined; };

const EllipsisPopupProperty = ({ feature }) => {
  // console.log(feature.properties.compiledStyle)
  // console.log(feature.properties)
  return <>{feature.properties.compiledStyle.popupProperty ?
    <Tooltip direction="right" offset={[0, 0]} opacity={1} permanent>
      {feature.properties[feature.properties.compiledStyle.popupProperty]}
    </Tooltip> : undefined}
  </>
}

//TODO handle specific props seperately by first destructuring them.
export const EllipsisVectorLayer = props => {

  const [, update] = useState(0);
  const base = useMemo(() => new VectorLayerUtil.EllipsisVectorLayerBase({ ...props }), [props]);
  const queuedUpdates = useRef({});
  const isUpdating = useRef(false);
  const isMounted = useRef(false);

  //Use new map events if available.
  const _map3x = useMapEvents({
    move: () => {
      base.update();
    },
    zoomend: () => {
      base.update();
    }
  });

  //Use legacy hooks if needed.
  const _map2x = useLeaflet();
  useEffect(() => {
    if (!_map2x) return;
    _map2x.map.on('move', () => base.update());
    _map2x.map.on('zoomend', () => base.update());
    // eslint-disable-next-line
  }, [_map2x]);

  const getMapRef = () => {
    if (_map2x && _map2x.map) return _map2x.map;

    return _map3x;
  }

  //On mount, start updating the map.
  useEffect(() => {
    if (!base) return;
    base.loadOptions.styleKeys = {
      radius: [],
      weight: ['width'],
      color: ['borderColor'],
      opacity: ['borderOpacity'],
      fillColor: [],
      fillOpacity: [],
      popupProperty: [],
    };
    base.getMapBounds = getMapBounds;
    base.updateView = () => {
      update(Date.now());
    }

    base.update();

    return () => {
      base?.clearLayer();
    }
    // eslint-disable-next-line
  }, [base]);

  const pushPropUpdates = (...updated) => {
    updated.forEach(x => base.options[x] = props[x]);
  }

  const playbackQueue = async () => {
    for (const [key, playbackFunction] of Object.entries(queuedUpdates.current)) {
      if (!playbackFunction) continue;
      queuedUpdates.current[key] = undefined;
      await playbackFunction();
    }
  }

  useEffect(() => {
    if (!isMounted.current) return;
    const loadTypeUpdater = async () => {
      isUpdating.current = true;
      pushPropUpdates('filter', 'centerPoints', 'loadAll');
      if (!queuedUpdates.current["loadTypeUpdate"])
        await base.clearLayer();
      if (!queuedUpdates.current["loadTypeUpdate"])
        await base.update()
      isUpdating.current = false;
    }
    if (isUpdating.current) {
      base.awaitNotLoading();
      queuedUpdates.current["loadTypeUpdate"] = loadTypeUpdater;
      return;
    }
    loadTypeUpdater();
    // eslint-disable-next-line
  }, [props.filter, props.centerPoints, props.loadAll]);

  useEffect(() => {
    if (!isMounted.current) return;
    const idUpdater = async () => {
      isUpdating.current = true;
      pushPropUpdates('blockId', 'pathId', 'layerId', 'token');
      await base.fetchLayerInfo();
      base.fetchStylingInfo();
      if (!queuedUpdates.current["idUpdate"])
        await base.clearLayer();
      if (!queuedUpdates.current["idUpdate"])
        await base.update();
      isUpdating.current = false;
      playbackQueue();
    }
    if (isUpdating.current) {
      base.awaitNotLoading();
      queuedUpdates.current["idUpdate"] = idUpdater;
      return;
    }
    idUpdater();
    // eslint-disable-next-line
  }, [props.pathId, props.blockId, props.layerId, props.token]);

  useEffect(() => {
    if (!isMounted.current) return;
    const widthUpdater = () => {
      pushPropUpdates('lineWidth', 'radius');
      base.recompileStyles();
      update(Date.now());
    }
    widthUpdater();
    // eslint-disable-next-line
  }, [props.lineWidth, props.radius]);

  useEffect(() => {
    if (!isMounted.current) return;
    const styleUpdater = async () => {
      isUpdating.current = true;
      pushPropUpdates('styleId', 'style');
      console.log("updating style")
      await base.fetchLayerInfo();
      base.fetchStylingInfo();

      if (!queuedUpdates.current["styleUpdate"])
        await base.clearLayer();
      if (!queuedUpdates.current["styleUpdate"])
        await base.update();

      isUpdating.current = false;
      playbackQueue();
    };

    if (isUpdating.current) {
      base.awaitNotLoading();
      queuedUpdates.current["styleUpdate"] = styleUpdater;
      console.log("add function to queue");
      return;
    }
    console.log("call style updater");
    styleUpdater();

    // eslint-disable-next-line
  }, [props.style, props.styleId]);

  useEffect(() => {
    isMounted.current = true;
  }, []);

  const getFeatureId = (feature, index = 0) => `${feature.properties.id}_${base.levelOfDetail}_${base.getReturnType()}_${base.options.styleId ? base.options.styleId : 'nostyleid'}_${base.options.style ? JSON.stringify(base.options.style) : 'nostyle'}_${index}`;

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
    if (!base) return;

    const features = base.getFeatures();
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
          >
            <EllipsisPopupProperty feature={feature} />
          </GeoJSON>,
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
          ><EllipsisPopupProperty feature={feature} /></Marker> :
          <CircleMarker
            key={getFeatureId(feature, i)}
            center={[coordinate[1], coordinate[0]]}
            {...feature.properties.compiledStyle}
            interactive={props.onFeatureClick ? true : false}
            onClick={!props.onFeatureClick ? undefined : (e) => props.onFeatureClick(feature, e)}
            pane={'markerPane'}
          ><EllipsisPopupProperty feature={feature} /></CircleMarker>
        )
      }
      return [];
    })}</>
  }
  return render();
}

export default EllipsisVectorLayer;