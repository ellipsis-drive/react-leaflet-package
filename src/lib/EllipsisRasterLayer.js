import React, { useState, useEffect } from "react";
import { TileLayer } from "react-leaflet";
import { RasterLayerUtil } from "ellipsis-js-util";

const EllipsisRasterLayer = ({
  pathId,
  timestampId,
  style,
  zoom,
  token,
  mask,
}) => {
  const [res, setRes] = useState();

  useEffect(() => {
    let destructorCalled = false;

    RasterLayerUtil.getSlippyMapUrlWithDefaults({
      pathId,
      timestampId,
      style,
      zoom,
      token,
      mask,
    }).then((res) => {
      if (!destructorCalled) setRes(res);
    });
    return () => {
      destructorCalled = true;
    };
  }, [pathId, timestampId, style, zoom, token, mask]);

  if (!res) return null;

  return (
    <TileLayer
      key={res.id}
      url={res.url}
      tileSize={256}
      noWrap={true}
      reuseTiles={true}
      maxNativeZoom={res.zoom}
      maxZoom={25}
      format={"image/png"}
    />
  );
};
export default EllipsisRasterLayer;
