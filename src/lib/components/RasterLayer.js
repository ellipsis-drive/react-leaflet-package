import React from 'react';

import { TileLayer } from 'react-leaflet';

import ApiManager from './ApiManager';

export class RasterLayer extends React.PureComponent {
  render = () => {
    let url = `${ApiManager.apiUrl}/tileService/${this.props.mapId}/${this.props.timestampNumber}/${this.props.layerId}/{z}/{x}/{y}`;
    if (this.props.token) {
      url = url + '?token=' + this.props.token;
    }

    return (
      <TileLayer
        key={this.props.mapId + '_' + this.props.timestampId + '_' + this.props.layerId}
        url={url}
        tileSize={256}
        noWrap={true}
        maxNativeZoom={this.props.maxZoom}
        format={'image/png'}
      />
    );
  };
}

export default RasterLayer;
