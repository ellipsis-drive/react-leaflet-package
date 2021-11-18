import EllipsisRasterLayer from './lib/EllipsisRasterLayer';
import EllipsisVectorLayer from './lib/EllipsisVectorLayer';
import './Test.css';
import 'leaflet/dist/leaflet.css';

import EllipsisApi from './lib/EllipsisApi';

import { MapContainer, TileLayer } from 'react-leaflet'
import { useEffect, useRef, useState } from 'react';

const position = [51.505, -0.09]


function Test() {
  const [map,setMap] = useState();

  const username = process.env.REACT_APP_USERNAME;
  const password = process.env.REACT_APP_PASSWORD;
  let token = useRef();
  useEffect(() => {
    EllipsisApi.login(username, password).then((res) => {
      console.log(res)
      token.current = res.token;
    });
    EllipsisApi.getMetadata('1a24a1ee-7f39-4d21-b149-88df5a3b633a').then((res) => {
      console.log(res);
    });
    EllipsisApi.getMetadata('0ec49fb8-f577-45de-8e4f-6243fdc62908').then((res) => {
      console.log(res);
    });
  }, [password, username])

  return (
    <>
    <h1 style={{textAlign:'center', margin:'20px'}}>Below is a test of the map.</h1>
    <MapContainer whenCreated={setMap} style={{height:'70vh', width:'80vw', margin: '0 auto'}} center={position} zoom={13} scrollWheelZoom={true}>
      <TileLayer 
        noWrap={true}
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {/* <EllipsisVectorLayer
        blockId='b8468235-31b5-4959-91a4-0e52a1d4feb6'
        layerId='44be2542-d20d-457b-b003-698d048d2c6c'
        radius={3}
        mapRef={map}
      /> */}

      <EllipsisVectorLayer
        blockId='1a24a1ee-7f39-4d21-b149-88df5a3b633a'
        layerId='45c47c8a-035e-429a-9ace-2dff1956e8d9'
        onFeatureClick={(feature, layer) => console.log(feature)}
        // loadAll={true}
      />

      {/* <EllipsisVectorLayer
        blockId='1a24a1ee-7f39-4d21-b149-88df5a3b633a'
        layerId='45c47c8a-035e-429a-9ace-2dff1956e8d9'
        styleId='a30d5d0e-26a3-43a7-9d23-638cef7600c4'
        token={token.current}
        mapRef={map}
      /> */}
      {/* <EllipsisRasterLayer 
        blockId='0ec49fb8-f577-45de-8e4f-6243fdc62908'
        visualizationId='6fde37d3-3666-40ef-b594-890a4e00a2be'
        captureId={0}
        token={token.current}
      /> */}
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