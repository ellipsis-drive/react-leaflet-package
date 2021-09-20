## A small but functional npm package


### Install

Install using `npm install react-leaflet-ellipsis`

### Usage 

In a React app, use the EllipsisRasterLayer and EllipsisVectorLayer: 
`import { EllipsisRasterLayer } from 'react-leaflet-ellipsis'` 
`import { EllipsisVectorLayer } from 'react-leaflet-ellipsis'` 

You can do a https://api.ellipsis-drive.com/metadata POST request for a particular map to get the needed information to use the RasterLayer and VectorLayer componenent.

#### RasterLayer props

| Name        | Description |
| ----------- | -----------|
| mapId        | id of the map|
| timestampNumber     | number of the timestamp |
| layerId     | id of the layer |
| maxZoom        | maxZoomlevel of the layer|
| token        | token of the user (optional)|


#### VectorLayer

| Name        | Description | 
| ----------- | ----------- |
| mapId        | id of the map|
| layerId     | id of the layer |
| maxZoom        | maxZoomlevel of the layer|
| selectFeature        | a function to run on feature click, with as argument the clicked feature|
| token        | token of the user (optional)|
| styleId        | id of the layer style (optional)|
| centerPoints        | boolean whether to render only center points. Default false|
| filter        | a property filter to use (Optional)|
| maxMbPerTile        | the maximum mb to load per tile. Default 16mb |
| maxTilesInCache        | The number of tiles to keep in cache. Default 500|
| maxVectorsPerTile        | The maximum number of vectors to load per tile. Default 200|

