import RasterLayer from './lib/components/RasterLayer';
import VectorLayer from './lib/components/VectorLayer';
import './App.css';
import 'leaflet/dist/leaflet.css';


import { MapContainer, TileLayer } from 'react-leaflet'
import { useState } from 'react';

const position = [51.505, -0.09]


function App() {
  const [map,setMap] = useState();

  const token = process.env.REACT_APP_SECRET_TOKEN;

  return (
    <>
    <h1 style={{textAlign:'center', margin:'20px'}}>Below is a test of the map.</h1>
    <MapContainer whenCreated={setMap} style={{height:'70vh', width:'80vw', margin: '0 auto'}} center={position} zoom={13} scrollWheelZoom={true}>
      
      
      <TileLayer 
        noWrap={true}
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <VectorLayer
        mapId='1a24a1ee-7f39-4d21-b149-88df5a3b633a'
        layerId='45c47c8a-035e-429a-9ace-2dff1956e8d9'
        token={token}
        mapRef={map}
      />
      {/* <RasterLayer 
        mapId='0ec49fb8-f577-45de-8e4f-6243fdc62908'
        layerId='6fde37d3-3666-40ef-b594-890a4e00a2be'
        timestampNumber={0}
        token={token}
      /> */}
    </MapContainer>
    </>
  );
}



export default App;














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