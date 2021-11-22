import React, { TileLayer } from 'react-leaflet';

import EllipsisApi from './EllipsisApi';



export const EllipsisRasterLayer = (props) => {
  let url = `${EllipsisApi.apiUrl}/tileService/${props.blockId}/${props.captureId}/${props.visualizationId}/{z}/{x}/{y}`;
  if (props.token) {
    url = url + '?token=' + props.token;
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
