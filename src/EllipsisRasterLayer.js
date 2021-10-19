import React from 'react';

import { TileLayer } from 'react-leaflet';

import EllipsisApi from './EllipsisApi';

export class EllipsisRasterLayer extends React.PureComponent {
  render = () => {
    let url = `${EllipsisApi.apiUrl}/tileService/${this.props.mapId}/${this.props.captureId}/${this.props.visualizationId}/{z}/{x}/{y}`;
    if (this.props.token) {
      url = url + '?token=' + this.props.token;
    }

    return (
      <TileLayer
        key={this.props.mapId + '_' + this.props.captureId + '_' + this.props.visualizationId}
        url={url}
        tileSize={256}
        noWrap={true}
        maxNativeZoom={this.props.maxZoom}
        format={'image/png'}
      />
    );
  };
}

export default EllipsisRasterLayer;
