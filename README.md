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

To login or request metadata of maps you can use the functions available in `EllipsisApi`.

```js
useEffect(() => {
  EllipsisApi.login(username, password).then((response) => {
    console.log(response);
    token = response.token;
    expires = response.expires;
  });
  EllipsisApi.getMetadata(mapId).then((response) => {
    console.log(response);
  });
}, []);
```

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
| levelOfDetail       | The level of detail ranging from 1 to 5, or 6 to disable this feature. Default 6.            |
| levelOfDetailMode   | A string of value 'dynamic' (=default) to change the level of detail with zoom, or 'static'. |
| levelOfDetailMapper | A function that transforms `zoom` to a `levelOfDetail`, used in dynamic mode.                |
| centerPoints        | Boolean whether to render only center points. Default false.                                 |
| pageSize            | Size to retreive per step. Default 25, max 3000.                                             |
| maxMbPerTile        | The maximum mb to load per tile. Default 16mb.                                               |
| maxTilesInCache     | The number of tiles to keep in cache. Default 500.                                           |
| maxFeaturesPerTile  | The maximum number of vectors to load per tile. Default 200.                                 |
| loadAll             | Always load all vectors, even if not visible or far away. Default false                      |
| fetchInterval       | The interval in ms between finishing a request and starting a new request. Default 0.        |

_warning_ `loadAll=true` will ignore maxMbPerTile, maxTilesInCache and maxFeaturesPerTile settings.

> Any details about the style object are documented in (this documentation)[https://docs.ellipsis-drive.com/developers/api-v3/path-vector/styles/add-style]

### Use the EllipsisApi to login into Ellipsis Drive or view metadata of paths

#### EllipsisApi.login description

**parameters**

| name     | description                                                                                   |
| -------- | --------------------------------------------------------------------------------------------- |
| username | The username of your ellipsis-drive account                                                   |
| password | The password of your ellipsis-drive account                                                   |
| validFor | (Optional) The number of second the access token will be valid for. Default 86400 (24 hours). |

**return value**

```ts
token: string; //token to use in other api calls
expires: number; //expiration time in milliseconds
```

#### EllipsisApi.getPath description

**parameters**

| name   | description                                                                       |
| ------ | --------------------------------------------------------------------------------- |
| pathId | The id of the path.                                                               |
| user   | (Optional) An user object which can contain a token like `user: {token: mytoken}` |

**return value**
It returns JSON, which depends on the type of the specified object.
