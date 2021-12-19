import React from 'react';
import { TileLayer } from 'react-leaflet';
import EllipsisApi from './EllipsisApi';



const EllipsisRasterLayer = (props) => {
  let url;
  if(props.visualization) {
    url = `${EllipsisApi.getApiUrl()}/settings/mapLayers/preview/${props.blockId}/${props.captureId}/${props.visualization.method}/{z}/{x}/{y}?parameters=${JSON.stringify(props.visualization.parameters)}`;
    if (props.token) url += '&token=' + props.token;
  } else {
    url = `${EllipsisApi.getApiUrl()}/tileService/${props.blockId}/${props.captureId}/${props.visualizationId}/{z}/{x}/{y}`;
    if (props.token) url += '?token=' + props.token;
  }
  
  return (
    <TileLayer
      key={props.blockId + '_' + props.captureId + '_' + props.visualizationId}
      url={url}
      tileSize={256}
      noWrap={true}
      maxNativeZoom={props.maxZoom}
      format={'image/png'}
    />
  );
}
export default EllipsisRasterLayer;
