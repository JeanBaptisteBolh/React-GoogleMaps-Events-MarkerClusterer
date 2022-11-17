/*global google*/
import { useState, useEffect, useRef } from "react";
import { Wrapper } from "@googlemaps/react-wrapper";
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import { createCustomEqual } from "fast-equals";

const markerList = [
  { id: "A12345", uuid: "500924cf83424aad9e7d386bbec88ef6", lat: 44.459744, lng: -73.214126, assetName: "A" },
  { id: "B09423", uuid: "500924cf83424aad9e7d386bbec88ef6", lat: 44.465291, lng: -73.190723, assetName: "A" },
  { id: "C98765", uuid: "c0385833-e483-40d1-803f-2b4c26ae3799", lat: 44.476949, lng: -73.210578, assetName: "B" },
  { id: "D99999", uuid: "c0385833-e483-40d1-803f-2b4c26ae3799", lat: 44.444572, lng: -73.208741, assetName: "B" },
  { id: "E12345", uuid: "500924cf83424aad9e7d386bbec88ef6", lat: 38.459744, lng: -81.214126, assetName: "A" },
  { id: "F09423", uuid: "500924cf83424aad9e7d386bbec88ef6", lat: 38.465291, lng: -81.190723, assetName: "A" },
  { id: "G98765", uuid: "c0385833-e483-40d1-803f-2b4c26ae3799", lat: 38.476949, lng: -81.210578, assetName: "B" },
  { id: "H99999", uuid: "c0385833-e483-40d1-803f-2b4c26ae3799", lat: 38.444572, lng: -81.208741, assetName: "B" },
]

const render = (status) => {
  return <h1>{status}</h1>;
};

const App = () => {
  const [zoom, setZoom] = useState(8); // initial zoom
  const [center, setCenter] = useState({ lat: 44.45, lng: -73.21 });

  const onIdle = (m) => {
    console.log("onIdle");
  };

  return (
    <>
      <div style={{ width: "500px", height: "500px" }}>
        <Wrapper
          apiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
          render={render}
        >
          <Map
            center={center}
            onIdle={onIdle}
            zoom={zoom}
            style={{ flexGrow: "1", height: "100%" }}
          />
        </Wrapper>
      </div>
    </>

  );
};

const Map = ({ onIdle, children, style, ...options }) => {
  const ref = useRef(null);
  const [map, setMap] = useState();

  useEffect(() => {
    if (ref.current && !map) {
      setMap(new window.google.maps.Map(ref.current, {}));
    }

    // Add some markers to the map.
    const markers = markerList.map((m) => {
      return new window.google.maps.Marker({
        position: { lat: parseFloat(m.lat), lng: parseFloat(m.lng) }
        //map: map,
      });
    });

    // Add a marker clusterer to manage the markers.
    new MarkerClusterer({ map, markers });
  }, [ref, map]);

  useDeepCompareEffectForMaps(() => {
    if (map) {
      map.setOptions(options);
    }
  }, [map, options]);

  useEffect(() => {
    if (map) {
      ["click", "idle"].forEach((eventName) =>
        google.maps.event.clearListeners(map, eventName)
      );

      if (onIdle) {
        map.addListener("idle", () => onIdle(map));
      }
    }
  }, [map, onIdle]);

  return (
    <>
      <div ref={ref} style={style} />
    </>
  );
};

const deepCompareEqualsForMaps = createCustomEqual((deepEqual) => (a, b) => {
  if (a instanceof google.maps.LatLng || b instanceof google.maps.LatLng) {
    return new google.maps.LatLng(a).equals(new google.maps.LatLng(b));
  }
  // TODO extend to other types
  // use fast-equals for other objects
  return deepEqual(a, b);
});

function useDeepCompareMemoize(value) {
  const ref = useRef();

  if (!deepCompareEqualsForMaps(value, ref.current)) {
    ref.current = value;
  }
  return ref.current;
}

function useDeepCompareEffectForMaps(callback, dependencies) {
  useEffect(callback, dependencies.map(useDeepCompareMemoize));
}

export default App;
