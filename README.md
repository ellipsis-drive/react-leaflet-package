## Import Ellipsis layers in react-leaflet

### Install

Install using `npm install react-leaflet-ellipsis`

### Usage

In a React app, import the RasterLayer and VectorLayer:
`import { EllipsisRasterLayer } from 'react-leaflet-ellipsis'`
`import { EllipsisVectorLayer } from 'react-leaflet-ellipsis'`
`import { EllipsisApi } from 'react-leaflet-ellipsis'`

### Example

You can use RasterLayer and VectorLayer within a `<MapContainer />` or `<Map />` component.

```jsx
<MapContainer>
  <EllipsisRasterLayer pathId={pathId} />
  <EllipsisVectorLayer pathId={pathId} />
</MapContainer>
```

To request metadata of Ellipsis Drive layers you can use the function available in the `EllipsisApi`.

```js
useEffect(() => {
  EllipsisApi.getMetadata(mapId).then((response) => {
    console.log(response);
  });
}, []);
```

If the Ellipsis Drive layers you wish to use are not set to public or linksharing you need to create a token for your app. See [here](https://docs.ellipsis-drive.com/developers/authentication-options) for how to obtain such a token.

#### RasterLayer props

| Name        | Description                                         |
| ----------- | --------------------------------------------------- |
| pathId      | id of the path                                      |
| timestampId | id of the timestamp (optional)                      |
| style       | id of a style or an object describing it (optional) |
| zoom       | int to use as max native zoom (optional) |
| token       | token of the user (optional)                        |
| mask        | Mask of type multipolygon (optional)                |

#### VectorLayer props

| Name                | Description                                                                                  |
| ------------------- | -------------------------------------------------------------------------------------------- |
| pathId              | Id of the path (Only required option)                                                        |
| timestampId         | Id of the timestamp                                                                          |
| onFeatureClick      | A function to run on feature click, with as argument the clicked feature                     |
| zoom             | maxZoomlevel of the layer. If not specified, use the one specified in layer info.            |
| token               | Token of the user                                                                            |
| style               | Id of a style or a style object.                                                             |
| filter              | A property filter to use                                                                     |
| levelOfDetailMapper | A function that transforms `zoom` to a `levelOfDetail`, used in dynamic mode.                |
| centerPoints        | Boolean whether to render only center points. Default false.                                 |
| pageSize            | Size to retreive per step. Default 25, max 3000.                                             |
| maxMbPerTile        | The maximum mb to load per tile. Default 16mb.                                               |
| maxRenderTiles     | The number of tiles to keep in cache. Default 500.                                           |
| maxFeaturesPerTile  | The maximum number of vectors to load per tile. Default 200.                                 |
| fetchInterval       | The interval in ms between finishing a request and starting a new request. Default 0.        |

_warning_ `loadAll=true` will ignore maxMbPerTile, maxTilesInCache and maxFeaturesPerTile settings.

> Any details about the style object are documented in (this documentation)[https://docs.ellipsis-drive.com/developers/api-v3/path-vector/styles/add-style]

### Fetching metadata
```

#### EllipsisApi.getPath description

**parameters**

| name   | description                                                                       |
| ------ | --------------------------------------------------------------------------------- |
| pathId | The id of the path.                                                               |
| user   | (Optional) An user object which can contain a token like `user: {token: mytoken}` |

**return value**
It returns JSON, which depends on the type of the specified object.
