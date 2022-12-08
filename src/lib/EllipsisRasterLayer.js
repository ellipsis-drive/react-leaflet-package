import React, { useState, useEffect } from "react";
import { TileLayer } from "react-leaflet";
import { RasterLayerUtil } from "ellipsis-js-util";

const EllipsisRasterLayer = (props) => {
  const [res, setRes] = useState();

  useEffect(() => {
    if (!props) return;
    let destructorCalled = false;

    RasterLayerUtil.getSlippyMapUrlWithDefaults(props).then((res) => {
      if (!destructorCalled) setRes(res);
    });
    return () => {
      destructorCalled = true;
    };
  }, [props]);

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
