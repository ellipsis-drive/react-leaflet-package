import React, { useState, useEffect } from "react";
import { TileLayer } from "react-leaflet";
import { RasterLayerUtil } from "ellipsis-js-util";

const EllipsisRasterLayer = (props) => {
  const [url, setUrl] = useState();

  useEffect(() => {
    if (!props) return;
    let destructorCalled = false;

    RasterLayerUtil.getSlippyMapUrlWithDefaults(props).then((newUrl) => {
      if (!destructorCalled) setUrl(newUrl);
    });
    return () => {
      destructorCalled = true;
    };
  }, [props]);

  if (!url) return null;

  return (
    <TileLayer
      key={RasterLayerUtil.getLayerId(props)}
      url={url}
      tileSize={256}
      noWrap={true}
      reuseTiles={true}
      maxNativeZoom={props.maxZoom}
      maxZoom={25}
      format={"image/png"}
    />
  );
};
export default EllipsisRasterLayer;
