## Import Ellipsis layers in react-leaflet


### Install

Install using `npm install react-leaflet-ellipsis`

### Usage 

In a React app, import the RasterLayer and VectorLayer: 
`import { EllipsisRasterLayer } from 'react-leaflet-ellipsis'` 
`import { EllipsisVectorLayer } from 'react-leaflet-ellipsis'` 
`import { EllipsisApi } from 'react-leaflet-ellipsis'`

### Example
You can use RasterLayer and VectorLayer within a <map/> component.

```jsx
<Map>
 <RasterLayer
  mapId={mapId}
  timestampNumber={timestampNumber}
  layerId={layerId}
  maxZoom={maxZoom}
 />
 <VectorLayer
  mapId={mapId}
  layerId={layerId}
  maxZoom={maxZoom}
 />
</Map>
```

To login or request metadata of maps you can use the functions available in `EllipsisApi`.
```js
useEffect(() => {
    EllipsisApi.login(username, password).then((response) => {
        console.log(response)
        token = response.token;
        expires = response.expires;
    });
    EllipsisApi.getMetadata(mapId).then((response) => {
        console.log(response);
    });
}, []);
```

#### RasterLayer props

| Name        | Description |
| ----------- | -----------|
| mapId        | id of the map|
| timestampNumber     | number of the timestamp |
| layerId     | id of the layer |
| maxZoom        | maxZoomlevel of the layer|
| token        | token of the user (optional)|


#### VectorLayer props

| Name        | Description | 
| ----------- | ----------- |
| mapId        | id of the map|
| layerId     | id of the layer |
| maxZoom        | maxZoomlevel of the layer|
| mapRef | a reference* to the MapContainer |
| selectFeature        | a function to run on feature click, with as argument the clicked feature|
| token        | token of the user (optional)|
| styleId        | id of the layer style (optional)|
| centerPoints        | boolean whether to render only center points. Default false|
| filter        | a property filter to use (Optional)|
| maxMbPerTile        | the maximum mb to load per tile. Default 16mb |
| maxTilesInCache        | The number of tiles to keep in cache. Default 500|
| maxVectorsPerTile        | The maximum number of vectors to load per tile. Default 200|

*Passing a reference to the map can be done like this:
```jsx
const MyComponent() => {
    const [map, setMap] = useState();
    return(
        <MapContainer whenCreated={setMap} ...>
            <EllipsisVectorLayer mapRef={map} ... />
        </MapContainer>
    );
}

```

#### EllipsisApi.login description
**parameters**
| name | description | 
| -- | -- |
| username | The username of your ellipsis-drive account |
| password | The password of your ellipsis-drive account |
| validFor | (Optional) The number of second the access token will be valid for. Default 86400 (24 hours). |

**return value**
```ts
token: string //token to use in other api calls
expires: number //expiration time in milliseconds
```

#### EllipsisApi.getMetadata description
**parameters**
| name | description | 
| -- | -- |
| mapId | The map or shape id of the project. |
| includeDeleted | (Optional) Boolean whether to also return deleted items. Default false. |

**return value**
It returns JSON, which depends on the type of map.

###Getting possible props
You can do a https://api.ellipsis-drive.com/metadata POST request for a particular map to get the needed information to use the RasterLayer and VectorLayer componenent.

See https://app.ellipsis-drive.com/developer/javascript/documentation#POST%20metadata for full Ellipsis Drive API documentation.

