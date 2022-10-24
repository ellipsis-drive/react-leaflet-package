import EllipsisRasterLayer from "./lib/EllipsisRasterLayer";
import EllipsisVectorLayer from "./lib/EllipsisVectorLayer";
import "./Test.css";
import "leaflet/dist/leaflet.css";

import { MapContainer, TileLayer } from "react-leaflet";
import React, { useEffect, useState } from "react";

const position = [51.505, -0.09];

function Test() {
  const [loadAll, setLoadAll] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoadAll(!loadAll);
    }, 5000);

    return () => clearTimeout(timeout);
  }, [loadAll]);

  // useEffect(() => {
  //   const i = setInterval(() => {
  //     setWidth(Math.random() * 20);
  //     console.log(`width changed`);
  //   }, 2000);
  //   return () => clearInterval(i);
  // })

  // useEffect(() => {
  //   setTimeout(() => {
  //     const newStyle = style.parameters.borderColor === '#000000' ? '#ffffff' : '#000000';
  //     setStyle({ method: 'fromColorProperty', parameters: { opacity: 0.5, defaultColor: '#ffffff', borderColor: newStyle } });
  //     console.log(`set border color to ${newStyle}`);
  //   }, 10000);
  // }, [style]);

  return (
    <>
      <h1 style={{ textAlign: "center", margin: "20px" }}>
        Below is a test of the map.
      </h1>
      <MapContainer
        style={{ height: "70vh", width: "80vw", margin: "0 auto" }}
        center={position}
        zoom={13}
        scrollWheelZoom={true}
      >
        <TileLayer
          noWrap={true}
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {/* <EllipsisVectorLayer
          pathId='b8468235-31b5-4959-91a4-0e52a1d4feb6'
          layerId='44be2542-d20d-457b-b003-698d048d2c6c'
          onFeatureClick={(feature, layer) => console.log(feature)}
          style={{ "method": "fromColorProperty", "pasting": false, "parameters": { "popupProperty": "color", "alpha": 0.5, "width": 2, "radius": { "method": "constant", "parameters": { "value": 100 } }, "defaultColor": "#C75B1C" } }}
          pageSize={50}
          radius={19}
        /> */}

        {/* BORDERS */}
        {/* <EllipsisVectorLayer
          pathId="1a24a1ee-7f39-4d21-b149-88df5a3b633a"
          // layerId="45c47c8a-035e-429a-9ace-2dff1956e8d9"
          // style={{
          //   method: "fromColorProperty",
          //   parameters: { popupProperty: "NAME", defaultColor: "#C75B1C" },
          // }}
          loadAll={loadAll}
          debug={true}
          fetchInterval={50}
          pageSize={25}
          onFeatureClick={(feature, layer) => console.log(feature)}
        /> */}

        {/* POINTS TEST */}
        {/* <EllipsisRasterLayer
          blockId='0ec49fb8-f577-45de-8e4f-6243fdc62908'
          visualizationId='6fde37d3-3666-40ef-b594-890a4e00a2be'
          captureId={0}
        /> */}

        {/* MEXICO */}
        {/* <EllipsisVectorLayer
          pathId="d917503b-f125-4be8-9ab1-fc0cae845064"
          layerId="25eaa99d-1b3b-4e62-a482-e13fefab2a2e"
          style="def3f179-23ff-452a-9f83-67a981706281"
          onFeatureClick={(feature, layer) => console.log(feature)}
          maxTilesInCache={3}
          debug={true}
        /> */}
        {/* https://api.ellipsis-drive.com/v3/path/2057fd2a-66c5-46ef-9c71-bb8f7a180c44/raster/timestamp/6f4ae070-e084-427c-91d9-e24f97964eca/tile/9/263/167?style=ea97778d-c454-4380-9ef5-94b15985b58e&token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1dWlkIjoiNTM1N2Y0YjktMWRhOC00NDU0LTliNDEtZjE2NmNlMmE4YzNhIiwiaWF0IjoxNjY2NTQ3ODU4LCJleHAiOjE2NjkyMjYyNTh9.wzJQB-mKEVtzhPzSq_Q88puApRcdfwMGqvkpwAZBQVU */}
        <EllipsisRasterLayer pathId="2057fd2a-66c5-46ef-9c71-bb8f7a180c44" />
      </MapContainer>
    </>
  );
}

export default Test;

/*
 <div>
          <MapContainer center={position} zoom={13} scrollWheelZoom={false}>
            {/* <VectorLayer
              mapId='1a24a1ee-7f39-4d21-b149-88df5a3b633a'
              layerId='45c47c8a-035e-429a-9ace-2dff1956e8d9'
              maxZoom={21}
            /> }

            <TileLayer
              attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* <RasterLayer
              mapId='2057fd2a-66c5-46ef-9c71-bb8f7a180c44'
              layerId='ea97778d-c454-4380-9ef5-94b15985b58e'
              timestampNumber={0}
              token='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1dWlkIjoiNTM1N2Y0YjktMWRhOC00NDU0LTliNDEtZjE2NmNlMmE4YzNhIiwiaWF0IjoxNjMzNDQwMzMxLCJleHAiOjE2MzYxMTg3MzF9.ehKhf8-_2mfhgtmZ97lBLfDFgD8_jaYNS6BujAqW40U'

            /> }
          </MapContainer>
      </div>
      */
