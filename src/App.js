import logo from "./logo.svg";
import "./App.css";

import EllipsisRasterLayer from "./lib/EllipsisRasterLayer";
import EllipsisVectorLayer from "./lib/EllipsisVectorLayer";
import "leaflet/dist/leaflet.css";

import { MapContainer, TileLayer } from "react-leaflet";
import React, { useEffect, useState } from "react";

const position = [51.505, -0.09];

function App() {
  const style = {
    id: "648674a6-afd5-445c-940e-6816503da0e9",
    pathId: "fb64d613-c100-471d-933c-51d63841f0de",
    name: "Default style",
    default: true,
    method: "fromColorProperty",
    parameters: {
      alpha: 0,
      width: 2,
      radius: { method: "constant", parameters: { value: 2.121320343559643 } },
      defaultColor: "#c75b1c",
      custom: true,
    },
    tempId: 0,
    version: 1,
    custom: true,
  };

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
          pathId="fb64d613-c100-471d-933c-51d63841f0de"
          style={style}
          onFeatureHover={(f, e) => {}}
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
