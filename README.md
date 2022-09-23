## Import Ellipsis layers in react-leaflet

### Install

Install using `npm install react-leaflet-ellipsis`

### Usage

In a React app, import the RasterLayer and VectorLayer:
`import { EllipsisRasterLayer } from 'react-leaflet-ellipsis'`
`import { EllipsisVectorLayer } from 'react-leaflet-ellipsis'`
`import { EllipsisApi } from 'react-leaflet-ellipsis'`

### Example

You can use RasterLayer and VectorLayer within a `<Map/>` component.

```jsx
<Map>
  <EllipsisRasterLayer
    pathId={pathId}
    layer={layerId}
    timestampId={timestampId}
    maxZoom={maxZoom}
  />
  <EllipsisVectorLayer pathId={pathId} layerId={layerId} maxZoom={maxZoom} />
</Map>
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

| Name        | Description                               |
| ----------- | ----------------------------------------- |
| pathId      | id of the path                            |
| timestampId | id of the timestamp                       |
| layer       | id of the layer or object\* describing it |
| maxZoom     | maxZoomlevel of the layer                 |
| token       | token of the user (optional)              |
| mask        | Mask of type multipolygon (optional)      |

*For the possible methods and parameters of *layer\*, refer to this documentation about it: https://docs.ellipsis-drive.com/developers/api-v2/raster/raster-layers/add-raster-layer

<details>
<summary>Or this copied info</summary>

method names: 'contour', 'hillShade', 'vector', 'rgb', 'colorScale' or 'index'.

parameters:

for method = bandToColor

{ "bandNumber": <band number as int>, "transitionPoints":[{"color":<color as hex>,"value":<transition value as float>},{"color":<color as hex>,"value":<transition value as float>},{"color":<color as hex>,"value":<transition value as float>}], 'alpha':<float between 0 ad 1>, "period":<periodicity as float>}

or

{ "bandNumber": <band number as int>, "rangeToColor":[{"color":<color as hex>,"fromValue":<start value as float>,"toValue":<end value as float>}], 'alpha':<float between 0 ad 1>, "period":<periodicity as float>}

for method=rgb

{'bands': [{"bandNumber":<band number as int>, "weight": <weight as float>, "bias": <bias af float>, "color":<one of red, green or blue>},{"bandNumber":<band number as int>, "weight": <weight as float>, "bias": <bias af float>, "color":<one of red, green or blue>},{"bandNumber":<band number as int>, "weight": <weight as float>, "bias": <bias af float>, "color":<one of red, green or blue>} ], 'alpha': <flaot between 0 and 1>}

for method = index

{ "positiveBand":{"bandNumber":<band number as int>, "weight":<weight as float>, "bias":<bias as float>},"negativeBand":{"bandNumber":<band number as int>, "weight":<weight as float>, "bias":<bias as float>}, "transitionPoints":[{"color":<color as hex>,"value":<transition value as float>},{"color":<color as hex>,"value":<transition value as float>},{"color":<color as hex>,"value":<transition value as float>}], 'alpha':<float between 0 ad 1>}

or

{ "positiveBand":{"bandNumber":<band number as int>, "weight":<weight as float>, "bias":<bias as float>},"negativeBand":{"bandNumber":<band number as int>, "weight":<weight as float>, "bias":<bias as float>}, "rangeToColor":[{"color":<color as hex>,"fromValue":<start value as float>,"toValue":<end value as float>}], 'alpha':<float between 0 ad 1>}

for method=hillShade

{"angle": <float between 0 and 90>, "bandNumber": <band number as int>, "alpha":<float between 0 and 1>}

for method=vectorField

{"clipValueMin":<value to clip to as float>,"clipValueMax":<value to clip from as float>, "xDirection":{"bandNumber":<band number as int>, "weight":<weight as float>, "bias":<bias as float>}, "yDirection":{"bandNumber":<band number as int>, "weight":<weight as float>, "bias":<bias as float>}}

Each method can have an optional parameter noData. No data must be an array of objects. Each object must have a bandNumber as int, fromValue as float and toValue as float. Pixels for which values is the given bandNumber are between fromValue and toValue are made transparent.

</details>

#### VectorLayer props

| Name [mutable]     | Description                                                                                  |
| ------------------ | -------------------------------------------------------------------------------------------- |
| pathId [M]         | Id of the path                                                                               |
| layerId [M]        | Id of the layer                                                                              |
| onFeatureClick [M] | A function to run on feature click, with as argument the clicked feature                     |
| maxZoom            | (Optional) maxZoomlevel of the layer. If not specified, use the one specified in layer info. |
| token [M]          | (Optional) Token of the user                                                                 |
| styleId [M]        | (Optional) Id of the layer style. Uses default style if not set.                             |
| style [M]          | (Optional) Object with style properties. Only used if styleId is not set.                    |
| filter [M]         | (Optional) A property filter to use                                                          |
| levelOfDetail      | The level of detail ranging from 1 to 5, or 6 to disable this feature. Default 6.  	        |
| levelOfDetailMode  | A string of value 'dynamic' (=default) to change the level of detail with zoom, or 'static'. |
| levelOfDetailMapper| (Optional) A function that transforms `zoom` to a `levelOfDetail`, used in dynamic mode.     |
| centerPoints [M]   | Boolean whether to render only center points. Default false.                                 |
| pageSize [M]       | Size to retreive per step. Default 25, max 3000.                                             |
| maxMbPerTile       | The maximum mb to load per tile. Default 16mb.                                               |
| maxTilesInCache    | The number of tiles to keep in cache. Default 500.                                           |
| maxFeaturesPerTile | The maximum number of vectors to load per tile. Default 200.                                 |
| loadAll [M]        | Always load all vectors, even if not visible or far away. Default false                      |
| fetchInterval      | The interval in ms between finishing a request and starting a new request. Default 0.        |


_warning_ `loadAll=true` will ignore maxMbPerTile, maxTilesInCache and maxFeaturesPerTile settings.

_note_ for the style object, refer to this documentation about it: https://docs.ellipsis-drive.com/developers/api-v2/vector/vector-layers/vector-styling/add-style.

<details>
<summary>Or this copied info</summary>
○ 'rules': Parameters contains the property 'rules' being an array of objects with required properties 'property', 'value' and 'color' and optional properties 'operator' and 'alpha'. 'property' should be the name of the property to style by and should be of type string, 'value' should be the cutoff point of the style and must be the same type as the property, 'color' is the color of the style and must be a rgb hex code, 'operator'determines whether the styling should occur at, under or over the cutoff point and must be one of '=', '<', '>', '<=', '>=' or '!=' with default '=' and 'alpha' should be the transparency of the color on a 0 to 1 scale with default 0.5.

○ 'rangeToColor': Parameters contains the required property 'rangeToColor' and optional property 'periodic', where 'rangeToColor' should be an array of objects with required properties 'property', 'fromValue', 'toValue' and 'color' and optional property 'alpha', where 'property' should be the name of the property to style by and should be of type string, 'fromValue' and 'toValue' should be the minimum and maximum value of the range respectively, 'color' is the color to use if the property falls inclusively between the fromValue and toValue and should be a rgb hex code color and 'alpha' should be the transparency of the color on a 0 to 1 scale with default 0.5. 'periodic' should be a positive float used when the remainder from dividing the value of the property by the periodic should be used to evaluate the ranges instead.

○ 'transitionPoints': Parameters contains the required properties 'property' and 'transitionPoints' and optional property 'periodic', where 'property' should be the name of the property to style by and should be of type string, 'transitionPoints' should be an array of objects with required properties 'value' and 'color' and optional property 'alpha', where 'value' should be the value at which the next transition starts, 'color' is the color to use if the property falls in the interval before or after the transition point and should be a rgb hex code color and 'alpha' should be the transparency of the color on a 0 to 1 scale with 0.5 as default. 'periodic' should be a positive float used when the remainder from dividing the value of the property by the periodic should be used to evaluate the ranges instead.

○ 'random': Parameters contains the required property 'property' and optional property 'alpha', where 'property' should be the name of the property by which to randomly assign colors and should be of type string and 'alpha' should be the transparency of the color on a 0 to 1 scale with default 0.5.

</details>
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
