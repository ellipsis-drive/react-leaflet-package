import logo from "./logo.svg";
import "./App.css";

import EllipsisRasterLayer from "./lib/EllipsisRasterLayer";
import EllipsisVectorLayer from "./lib/EllipsisVectorLayer";
import "leaflet/dist/leaflet.css";

import { MapContainer, TileLayer } from "react-leaflet";
import React, { useEffect, useState } from "react";

const position = [51.505, -0.09];

function App() {
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
        <EllipsisVectorLayer
          pathId="3bb84f08-c885-4809-a3a3-3204c924c676"
          maxFeaturesPerTile={1000}
          pageSize={30}
          loadAll={true}
          onFeatureHover={(f, e) => {
            console.log(f, e);
          }}
        />

        <TileLayer
          noWrap={true}
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
      </MapContainer>
    </>
  );
}

export default App;
