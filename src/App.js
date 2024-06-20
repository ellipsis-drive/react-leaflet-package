import logo from "./logo.svg";
import "./App.css";

import EllipsisRasterLayer from "./lib/EllipsisRasterLayer";
import EllipsisVectorLayer from "./lib/EllipsisVectorLayer";
import "leaflet/dist/leaflet.css";

import { MapContainer, TileLayer } from "react-leaflet";
import React, { useEffect, useState } from "react";

const position = [51.505, -0.09];

function App() {
  const [loadAll, setLoadAll] = useState(false);
  const [time, setTime] = useState(Date.now());

  useEffect(() => {
    const timeout = setTimeout(() => {
      setTime(Date.now());
    }, 1000);

    return () => clearTimeout(timeout);
  }, [time]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoadAll(!loadAll);
    }, 5000);

    return () => clearTimeout(timeout);
  }, [loadAll]);

  let initialStyle = {
    method: "bandToColor",
    parameters: {
      alpha: 1,
      bandNumber: 1,
      transitionPoints: [
        { color: "#68bc00", value: 0 },
        { color: "#a4dd00", value: 5 },
        { color: "#dbdf00", value: 10 },
        { color: "#fcdc00", value: 15 },
        { color: "#fb9e00", value: 20 },
        { color: "#d33115", value: 25 },
        { color: "#fa28ff", value: 30 },
        { color: "#0062b1", value: 35 },
        { color: "#009ce0", value: 40 },
        { color: "#73d8ff", value: 45 },
      ],
      period: 45,
      continuous: true,
    },
  };

  const [timestampId, setTimestampId] = useState(
    "84276200-1d52-4eef-8462-1767a5ac2a12"
  );
  const timestamps = [
    "84276200-1d52-4eef-8462-1767a5ac2a12",
    "90769ba0-bfa6-4afd-bece-4bcf16e2fae0",
    "9fd29902-ad63-49ad-9bd1-74baa8712ef8",
  ];
  const onChagne = (_, e) => {
    console.log("e", e);
    setTimestampId(timestamps[e]);
  };
  console.log("timestampId", timestampId);
  return (
    <>
      <h1 style={{ textAlign: "center", margin: "20px" }}>
        Below is a test of the map. {time}
      </h1>

      <MapContainer
        style={{ height: "70vh", width: "80vw", margin: "0 auto" }}
        center={position}
        zoom={13}
        scrollWheelZoom={true}
      >
        <EllipsisVectorLayer
          pathId="55f102b7-e660-4045-8f99-35dbba2a53fb"
          maxFeaturesPerTile={1000}
          pageSize={3000}
          loadAll={true}
        />
        <EllipsisRasterLayer
          pathId="8b76e5ea-2483-4ffd-be23-a050dd0aa558"
          timestampId={timestampId}
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
