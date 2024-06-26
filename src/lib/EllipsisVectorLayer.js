import React, {
  useEffect,
  useState,
  useMemo,
  useRef,
  useCallback,
} from "react";

import { GeoJSON, CircleMarker, Marker, Tooltip } from "react-leaflet";
import { VectorLayerUtil } from "ellipsis-js-util";

const reactLeaflet = require("react-leaflet");
let useLeaflet = reactLeaflet.useLeaflet;
let useMapEvents = reactLeaflet.useMapEvents;

if (!useLeaflet)
  useLeaflet = () => {
    return undefined;
  };
if (!useMapEvents)
  useMapEvents = () => {
    return undefined;
  };

const EllipsisPopupProperty = ({ feature }) => {
  // console.log(feature.properties.compiledStyle)
  // console.log(feature.properties)
  return (
    <>
      {feature.properties.compiledStyle.popupProperty ? (
        <Tooltip direction="right" offset={[0, 0]} opacity={1} permanent>
          {feature.properties[feature.properties.compiledStyle.popupProperty]}
        </Tooltip>
      ) : undefined}
    </>
  );
};

export const EllipsisVectorLayer = (props) => {
  const [, update] = useState(0);
  const baseUpdateFunction = useRef();
  const base = useMemo(() => {
    const base = new VectorLayerUtil.EllipsisVectorLayerBase({ ...props });

    baseUpdateFunction.current = base.update;
    base.updateView = () => {
      update(Date.now());
    };
    return base;
  }, [...Object.values(props)]);

  //Use new map events if available.
  const _map3x = useMapEvents({
    move: () => {
      baseUpdateFunction.current?.();
    },
    zoomend: () => {
      baseUpdateFunction.current?.();
    },
  });

  //Use legacy hooks if needed.
  const _map2x = useLeaflet();
  useEffect(() => {
    if (!_map2x) return;
    _map2x.map.on("move", base.update);
    _map2x.map.on("zoomend", base.update);

    return () => {
      _map2x.map.off?.("move", base.update);
      _map2x.map.off?.("zoomend", base.update);
    };
  }, [_map2x, base]);

  const mapRef = useMemo(() => {
    if (_map2x && _map2x.map) return _map2x.map;

    return _map3x;
  }, [_map2x, _map3x]);

  const getMapBounds = useCallback(() => {
    const map = mapRef;
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
  }, [mapRef]);

  //Start loading the tiles when mounted. Cleanup by clearing cache.
  useEffect(() => {
    base.getMapBounds = getMapBounds;
    base.update();
    return () => {
      base.clearLayer();
    };
  }, [base, getMapBounds]);

  const getFeatureId = (feature, index = 0) =>
    `${feature.properties.id}_${base.levelOfDetail}_${
      base.options.styleId ? base.options.styleId : "nostyleid"
    }_${
      base.options.style ? JSON.stringify(base.options.style) : "nostyle"
    }_${index}`;

  const render = () => {
    const features = base.getFeatures();
    if (!features.length) return <></>;
    return (
      <>
        {features.flatMap((feature) => {
          const type = feature.geometry.type;
          //Check for (Multi)Polygons and (Multi)LineStrings
          if (type.endsWith("Polygon") || type.endsWith("LineString")) {
            return [
              <GeoJSON
                key={getFeatureId(feature)}
                data={feature}
                style={feature.properties.compiledStyle}
                interactive={
                  props.onFeatureClick || props.onFeatureHover ? true : false
                }
                onEachFeature={
                  !props.onFeatureClick && !props.onFeatureHover
                    ? undefined
                    : (feature, layer) => {
                        if (props.onFeatureClick) {
                          layer.on("click", (e) =>
                            props.onFeatureClick(feature, e)
                          );
                        }

                        if (props.onFeatureHover) {
                          layer.on("mouseover", (e) =>
                            props.onFeatureHover(feature, e)
                          );
                        }
                      }
                }
              >
                <EllipsisPopupProperty feature={feature} />
              </GeoJSON>,
            ];
          }
          if (type.endsWith("Point")) {
            let coordinates = feature.geometry.coordinates;
            //Ensure that it's always an array of coordinates.
            if (!type.startsWith("Multi")) coordinates = [coordinates];

            return coordinates.map((coordinate, i) =>
              props.useMarkers ? (
                <Marker
                  key={getFeatureId(feature, i)}
                  position={[coordinate[1], coordinate[0]]}
                  interactive={
                    props.onFeatureClick || props.onFeatureHover ? true : false
                  }
                  eventHandlers={{
                    click: props.onFeatureClick
                      ? (e) => {
                          props.onFeatureClick(feature, e);
                        }
                      : undefined,
                    mouseover: props.onFeatureHover
                      ? (e) => {
                          props.onFeatureHover(feature, e);
                        }
                      : undefined,
                  }}
                >
                  <EllipsisPopupProperty feature={feature} />
                </Marker>
              ) : (
                <CircleMarker
                  key={getFeatureId(feature, i)}
                  center={[coordinate[1], coordinate[0]]}
                  {...feature.properties.compiledStyle}
                  interactive={
                    props.onFeatureClick || props.onFeatureHover ? true : false
                  }
                  eventHandlers={{
                    click: props.onFeatureClick
                      ? (e) => {
                          props.onFeatureClick(feature, e);
                        }
                      : undefined,
                    mouseover: props.onFeatureHover
                      ? (e) => {
                          props.onFeatureHover(feature, e);
                        }
                      : undefined,
                  }}
                  pane={"markerPane"}
                >
                  <EllipsisPopupProperty feature={feature} />
                </CircleMarker>
              )
            );
          }
          return [];
        })}
      </>
    );
  };
  return render();
};

export default EllipsisVectorLayer;
