import React from 'react';

import { GeoJSON, CircleMarker, Marker } from 'react-leaflet';

import EllipsisApi from './EllipsisApi';

export class EllipsisVectorLayer extends React.PureComponent {

  constructor(props, context) {
    super(props);
    this.tiles = [];
    this.zoom = 1;
    this.state = { cache: [] };
  }

  // componentDidMount = () => {
  //   console.log(this.props);
  //   if(!this.props.mapRef) {
  //     console.log(JSON.stringify(this.props));
  //     return console.error(`No map reference was given to the ellipsis vector layer`);
  //   }
  // };

  componentDidUpdate = (prevProps, prevState) => {
    if(!prevProps.mapRef && this.props.mapRef) {
      this.handleViewportUpdate();
      this.props.mapRef.on('moveEnd', () => {
        this.handleViewportUpdate();
        console.log('end move');
      });
      this.props.mapRef.on('zoom', () => this.handleViewportUpdate());
    }
  }

  // componentDidUpdate = (prevProps, prevState) => {
  //   clearInterval(this.gettingVectorsInterval);
  //   this.gettingVectorsInterval = undefined;
  //   this.setState({cache: []}, () => this.handleViewportUpdate());
  // };

  componentWillUnmount = () => {
    clearInterval(this.gettingVectorsInterval);
  };

  handleViewportUpdate = () => {
    const viewport = this.getMapBounds();
    if (!viewport) return;
    this.zoom = Math.max(Math.min(this.maxZoom, viewport.zoom - 2), 0);
    this.tiles = this.boundsToTiles(viewport.bounds, this.zoom);

    if(this.gettingVectorsInterval) return;

    this.gettingVectorsInterval = setInterval(async () => {
        if(this.isLoading) return;

        const loadedSomething = await this.loadStep();
        if(!loadedSomething) {
            clearInterval(this.gettingVectorsInterval);
            this.gettingVectorsInterval = undefined;
            return;
        }
        this.setState({cache: []});
    }, 100);
  };

  loadStep = async () => {
      this.isLoading = true;
      if(this.props.loadAll) {
          const cachedSomething = await this.getAndCacheAllGeoJsons();
          this.isLoading = false;
          return cachedSomething;
      }

      this.ensureMaxCacheSize();
      const cachedSomething = await this.getAndCacheGeoJsons();
      this.isLoading = false;
      return cachedSomething;
  };

  ensureMaxCacheSize = () => {
      const keys = Object.keys(this.state.cache);
      if (keys.length > this.props.maxTilesInCache) {
          const dates = keys.map((k) => this.state.cache[k].date).sort();
          const clipValue = dates[9];
          keys.forEach((key) => {
              if (this.state.cache[key].date <= clipValue) {
                  delete this.state.cache[key];
              }
          });
      }
  };

  getAndCacheAllGeoJsons = async () => {
      if(this.nextPageStart === 4)
          return false;
      
      const body = {
          pageStart: this.nextPageStart,
          mapId: this.blockId,
          returnType: this.centerPoints ? "center" : "geometry",
          layerId: this.layerId,
          zip: true,
          pageSize: Math.min(3000, this.pageSize),
          styleId: this.styleId
      };

      try {
          const res = await EllipsisApi.post("/geometry/get", body, {token: this.props.token});
          this.nextPageStart = res.nextPageStart;
          if(!res.nextPageStart) 
              this.nextPageStart = 4; //EOT
          if(res.result && res.result.features) {
              res.result.features.forEach(x => {
                  this.styleGeoJson(x, this.props.lineWidth, this.props.radius);
                  this.state.cache.push(x);
              });
          }
      } catch {
          return false;
      }
      return true;
  };

  getAndCacheGeoJsons = async () => {
      const date = Date.now();
      //create tiles parameter which contains tiles that need to load more features
      const tiles = this.tiles.map((t) => {
          const tileId = this.getTileId(t);

          //If not cached, always try to load features.
          if(!this.state.cache[tileId]) 
              return { tileId: t}

          const pageStart = this.state.cache[tileId].nextPageStart;

          //TODO in other packages we use < instead of <=
          //Check if tile is not already fully loaded, and if more features may be loaded
          if(pageStart && this.state.cache[tileId].amount <= this.props.maxFeaturesPerTile && this.state.cache[tileId].size <= this.props.maxMbPerTile)
              return { tileId: t, pageStart }

          return null;
      }).filter(x => x);

      if(tiles.length === 0) return false;

      const body = {
          mapId: this.props.blockId,
          returnType: this.props.centerPoints ? "center" : "geometry",
          layerId: this.props.layerId,
          zip: true,
          pageSize: Math.min(3000, this.props.pageSize),
          styleId: this.props.styleId,
          propertyFilter: (this.props.filter && this.props.filter > 0) ? this.props.filter : null,
      };

      //Get new geometry for the tiles
      let result = [];
      const chunkSize = 10;
      for (let k = 0; k < tiles.length; k += chunkSize) {
          body.tiles = tiles.slice(k, k + chunkSize);
          try {
              const res = await EllipsisApi.post("/geometry/tile", body, {token: this.props.token});
              result = result.concat(res);
          } catch {
              return false;
          }
      }
      
      //Add newly loaded data to cache
      for (let j = 0; j < tiles.length; j++) {
          const tileId = this.getTileId(tiles[j].tileId);

          if (!this.state.cache[tileId]) {
              this.state.cache[tileId] = {
                  size: 0,
                  amount: 0,
                  elements: [],
                  nextPageStart: null,
              };
          }

          //set tile info for tile in this.
          const tileData = this.state.cache[tileId];
          tileData.date = date;
          tileData.size = tileData.size + result[j].size;
          tileData.amount = tileData.amount + result[j].result.features.length;
          tileData.nextPageStart = result[j].nextPageStart;
          result[j].result.features.forEach(x => this.styleGeoJson(x, this.props.lineWidth, this.props.radius));
          tileData.elements = tileData.elements.concat(result[j].result.features);

      }
      return true;
  };

  getTileId = (tile) => `${tile.zoom}_${tile.tileX}_${tile.tileY}`;

  getFeatureId = (feature, index = 0) => `${feature.properties.id}_${this.props.centerPoints ? 'center' : 'geometry'}_${this.props.styleId}_${index}`;

  styleGeoJson = (geoJson, weight, radius) => {
      if(!geoJson || !geoJson.geometry || !geoJson.geometry.type || !geoJson.properties) return;

      const type = geoJson.geometry.type;
      const properties = geoJson.properties;
      const color = properties.color;
      const isHexColorFormat = /^#?([A-Fa-f0-9]{2}){3,4}$/.test(color);

      properties.style = {};

      //Parse color and opacity
      if(isHexColorFormat && color.length === 9) {
        properties.style.fillOpacity = parseInt(color.substring(8,10), 16) / 25.5;
        properties.style.color = color.substring(0,7);
      }
      else {
        properties.style.fillOpacity = 0.6;
        properties.style.color = color;
      }

      //TODO: weight default on 8 for LineString and MultiLineString, and 2 for Points?
      
      //Parse line width
      if(type.endsWith('Point')) {
          properties.style.radius = radius;
          properties.style.weight = 2; 
      }
      else properties.style.weight = weight;
  };

  boundsToTiles = (bounds, zoom) => {
      const xMin = Math.max(bounds.xMin, -180);
      const xMax = Math.min(bounds.xMax, 180);
      const yMin = Math.max(bounds.yMin, -85);
      const yMax = Math.min(bounds.yMax, 85);

      const zoomComp = Math.pow(2, zoom);
      const comp1 = zoomComp / 360;
      const pi = Math.PI;
      const comp2 = 2 * pi;
      const comp3 = pi / 4;

      const tileXMin = Math.floor((xMin + 180) * comp1);
      const tileXMax = Math.floor((xMax + 180) * comp1);
      const tileYMin = Math.floor(
          (zoomComp / comp2) *
              (pi - Math.log(Math.tan(comp3 + (yMax / 360) * pi)))
      );
      const tileYMax = Math.floor(
          (zoomComp / comp2) *
              (pi - Math.log(Math.tan(comp3 + (yMin / 360) * pi)))
      );

      let tiles = [];
      for (
          let x = Math.max(0, tileXMin - 1);
          x <= Math.min(2 ** zoom - 1, tileXMax + 1);
          x++
      ) {
          for (
              let y = Math.max(0, tileYMin - 1);
              y <= Math.min(2 ** zoom - 1, tileYMax + 1);
              y++
          ) {
              tiles.push({ zoom, tileX: x, tileY: y });
          }
      }
      return tiles;
  };

  getMapBounds = () => {
      if (!this.props.mapRef) return;
      const screenBounds = this.props.mapRef.getBounds();
      const zoom = this.props.mapRef.getZoom();
      let bounds = {
          xMin: screenBounds.getWest(),
          xMax: screenBounds.getEast(),
          yMin: screenBounds.getSouth(),
          yMax: screenBounds.getNorth(),
      };
      //Mapbox uses 512x512 tiles, and ellipsis uses 256x256 tiles. So increase zoom with 1. 'zoom256 = zoom512 + 1'
      return { bounds: bounds, zoom: parseInt(zoom + 1, 10) };
  };

  render = () => {
    if (!this.tiles || this.tiles.length === 0) return <></>;

    let features;
    if(this.props.loadAll) {
        features = this.state.cache;
    } else {
        features = this.tiles.flatMap((t) => {
            const geoTile = this.state.cache[this.getTileId(t)];
            return geoTile ? geoTile.elements : [];
        });
    }

    return <>{features.flatMap(feature => {
      const type = feature.geometry.type;
      //Check for (Multi)Polygons and (Multi)LineStrings
      if (type.endsWith('Polygon') || type.endsWith('LineString')) {
        return [
          <GeoJSON
            key={this.getFeatureId(feature)}
            data={feature}
            style={feature.properties.style}
            interactive={this.props.onFeatureClick ? true : false}
            onEachFeature={!this.props.onFeatureClick ? undefined : (feature, layer) => 
                layer.on('click', () => this.props.onFeatureClick(feature, layer))
            }
          />,
        ];
      }
      if (type.endsWith('Point')) {
        let coordinates = feature.geometry.coordinates;
        //Ensure that it's always an array of coordinates.
        if(!type.startsWith('Multi')) coordinates = [coordinates];

        return coordinates.map((coordinate, i) => this.useMarkers ? 
          <Marker
            key={this.getFeatureId(feature, i)}
            position={[coordinate[1], coordinate[0]]}
            interactive={this.props.onFeatureClick ? true : false}
            onClick={!this.props.onFeatureClick ? undefined : (e) => this.props.onFeatureClick(feature, e)}
          /> :
          <CircleMarker
            key={this.getFeatureId(feature, i)}
            center={[coordinate[1], coordinate[0]]}
            color={feature.properties.style.color}
            opacity={feature.properties.style.fillOpacity}
            radius={feature.properties.style.radius}
            weight={feature.properties.style.weight}
            interactive={this.props.onFeatureClick ? true : false}
            onClick={!this.props.onFeatureClick ? undefined : (e) => this.props.onFeatureClick(feature, e)}
          />
        )
      }
      return [];
    })}</>
  }
}

EllipsisVectorLayer.defaultProps = {
  pageSize: 25,
  maxZoom: 21,
  lineWidth: 5,
  radius: 15,
  maxFeaturesPerTile: 200,
  maxMbPerTile: 16000000,
  maxTilesInCache: 500
}

export default EllipsisVectorLayer;