import React, { useState, useEffect } from "react";
import { differenceInMilliseconds } from "date-fns";
import { createPathAnalyst } from "positic";
import * as d3Array from "d3-array";

import styled from "./style";
import Home from "../home/Home";
import Map from "../map/Map";
import Options from "../options/Options";
import Sections from "../sections/Sections";
import Analytics from "../analytics/Analytics";
import Live from "../live/Live";
import Message from "../message/Message";
import AutoSizer from "../autoSizer/AutoSizer";
import usePresistedState from "../../hooks/usePersistedState";
import { ReactComponent as Compass } from "../../assets/compass.svg";
import { ReactComponent as Direction } from "../../assets/direction.svg";

const Main = ({ className }) => {
  const [route, setRoute] = usePresistedState("route", null);
  const [name, setName] = usePresistedState("name", null);
  const [checkpoints, setCheckpoints] = usePresistedState("checkpoints", null);
  const [sections, setSections] = usePresistedState("sections", null);
  const [locations, setLocations] = usePresistedState("locations", null);
  const [currentSectionIndex, setCurrentSectionIndex] = usePresistedState(
    "current-section",
    -1
  );
  const [currentLocation, setCurrentLocation] = usePresistedState(
    "current-location",
    null
  );
  const [currentLocationIndex, setCurrentLocationIndex] = usePresistedState(
    "current-location-index",
    -1
  );
  const [runnerAnalytics, setRunnerAnalytics] = usePresistedState(
    "runnerAnalytics",
    null
  );
  const [routeAnalytics, setRouteAnalytics] = usePresistedState(
    "route-analytics",
    null
  );

  const [helper, setHelper] = useState();
  const [toggle, setToggle] = useState(false);
  const [pageIndex, setPageIndex] = useState(5);
  const [domain, setDomain] = useState({
    x: { min: 0, max: 0 },
    y: { min: 0, max: 0 },
  });

  const clearData = () => {
    setRoute(null);
    setCheckpoints(null);
    setSections(null);
    setCurrentSectionIndex(-1);
    setCurrentLocationIndex(-1);
    setCurrentLocation(null);
    setRunnerAnalytics(null);
    setLocations(null);
    setName(null);
    setRouteAnalytics(null);
  };

  // get trace stats
  useEffect(() => {
    if (!helper) return;
    const distance = helper.calculatePathLength();
    const elevation = helper.calculatePathElevation();
    setRouteAnalytics({ distance, elevation });
  }, [helper, setRouteAnalytics]);

  // get route
  useEffect(() => {
    if (!route) return;
    setLocations(route.features[0].geometry.coordinates);
  }, [route, setLocations]);

  // set domain
  useEffect(() => {
    if (!locations) return;
    const altitudes = locations.map((location) => location[2]);
    const extentY = d3Array.extent(altitudes);
    const lowerFullHundred = Math.floor(extentY[0] / 100) * 100;
    setDomain((domain) => ({
      ...domain,
      x: { min: 0, max: locations.length },
      y: { min: lowerFullHundred, max: extentY[1] },
    }));
  }, [locations]);

  // get trailer runnerAnalytics
  useEffect(() => {
    if (currentLocationIndex === -1 || !helper) return;
    const runnerAnalytics = helper.getProgressionStatistics(
      currentLocationIndex
    );
    setRunnerAnalytics(runnerAnalytics);
  }, [currentLocationIndex, helper, setRunnerAnalytics]);

  // set route helper
  useEffect(() => {
    if (!locations) return;
    // const helper = trace(...locations);
    const analyst = createPathAnalyst(locations);
    setHelper(analyst);
  }, [locations]);

  // set current location and sections indices
  useEffect(() => {
    if (!helper || !currentLocation) return;

    const index = helper.getPositionIndex(currentLocation);
    setCurrentLocationIndex(index);

    if (!sections) return;

    const sectionIndex = sections.findIndex((section) => {
      return index >= section.indices[0] && index <= section.indices[1];
    });
    setCurrentSectionIndex(sectionIndex);
  }, [
    currentLocation,
    helper,
    sections,
    setCurrentLocationIndex,
    setCurrentSectionIndex,
  ]);

  // set trail sections
  useEffect(() => {
    if (!checkpoints || !locations || !helper) return;

    const distances = checkpoints.map(
      (checkpoint) => checkpoint.distance * 1000
    );
    const locationsIndices = helper.getPositionsIndicesAlongPath(...distances);

    // compute section indices (start - stop)
    const sectionsIndices = locationsIndices.reduce(
      (accu, locationIndex, index, array) => {
        if (index > 0) {
          return [...accu, [array[index - 1], locationIndex - 1]];
        } else return accu;
      },
      []
    );

    // split trace into sections
    const sectionsLocations = sectionsIndices.reduce((accu, sectionIndices) => {
      const section = locations.slice(sectionIndices[0], sectionIndices[1]);
      return [...accu, section];
    }, []);

    // compute section stats
    const sectionsStats = sectionsLocations.map((section) => {
      const analyst = createPathAnalyst(section);
      return {
        distance: analyst.calculatePathLength(),
        elevation: analyst.calculatePathElevation(),
        coordinates: section,
      };
    });

    // aggregate sections details
    const sectionsDetails = checkpoints.reduce(
      (accu, checkpoint, index, array) => {
        if (index > 0) {
          const endingDate = new Date(checkpoint.cutOffTime);
          const startingDate = new Date(array[index - 1].cutOffTime);
          const duration = differenceInMilliseconds(endingDate, startingDate);
          return [
            ...accu,
            {
              startingDate,
              endingDate,
              depatureLocation: array[index - 1].location,
              arrivalLocation: checkpoint.location,
              duration,
              cutOffTime: checkpoint.cutOffTime,
              ...sectionsStats[index - 1],
              fromKm: helper.getProgressionStatistics(
                sectionsIndices[index - 1][0]
              )[0],
              toKm: helper.getProgressionStatistics(
                sectionsIndices[index - 1][1]
              )[0],
              indices: sectionsIndices[index - 1],
            },
          ];
        }
        return accu;
      },
      []
    );

    setSections(sectionsDetails);
  }, [checkpoints, locations, helper, setSections, setCurrentSectionIndex]);

  return (
    <div className={className}>
      <div className={`sections-wrapper ${toggle ? "menu-open" : ""}`}>
        <h1>Menu</h1>
        <section className={`one ${pageIndex < 0 && "after"}`}>
          <div className="container">
            <h1
              onClick={() => {
                setPageIndex(0);
                setToggle(!toggle);
              }}
            >
              Options
            </h1>
            <div className="section-content">
              <Options clearData={clearData} />
            </div>
          </div>
        </section>
        <section className={`two ${pageIndex < 1 && "after"}`}>
          <div className="container">
            <h1
              onClick={() => {
                setPageIndex(1);
                setToggle(!toggle);
              }}
            >
              Analytics
            </h1>
            <div className="section-content">
              {runnerAnalytics && sections ? (
                <Analytics
                  routeAnalytics={routeAnalytics}
                  runnerAnalytics={runnerAnalytics}
                  currentSectionIndex={currentSectionIndex}
                  sections={sections}
                />
              ) : (
                <Message message="get current location ?">
                  <Compass width={100} />
                </Message>
              )}
            </div>
          </div>
        </section>
        <section className={`three ${pageIndex < 2 && "after"}`}>
          <div className="container">
            <h1
              onClick={() => {
                setPageIndex(2);
                setToggle(!toggle);
              }}
            >
              Live
            </h1>
            <div className="section-content">
              {runnerAnalytics && sections && checkpoints ? (
                <AutoSizer>
                  {(width, height) => (
                    <Live
                      sections={sections}
                      checkpoints={checkpoints}
                      width={width}
                      height={height}
                    />
                  )}
                </AutoSizer>
              ) : (
                <Message message="timetable not loaded yet!">
                  <Direction width={100} />
                </Message>
              )}
            </div>
          </div>
        </section>
        <section className={`four ${pageIndex < 3 && "after"}`}>
          <div className="container">
            <h1
              onClick={() => {
                setPageIndex(3);
                setToggle(!toggle);
              }}
            >
              Sections
            </h1>
            <div className="section-content">
              {route && sections ? (
                <Sections
                  setCurrentLocation={setCurrentLocation}
                  setCurrentLocationIndex={setCurrentLocationIndex}
                  currentSectionIndex={currentSectionIndex}
                  currentLocation={currentLocation}
                  currentLocationIndex={currentLocationIndex}
                  sections={sections}
                  locations={locations}
                  domain={domain}
                />
              ) : (
                <Message message="timetable not loaded yet!">
                  <Direction width={100} />
                </Message>
              )}
            </div>
          </div>
        </section>
        <section className={`five ${pageIndex < 4 && "after"}`}>
          <div className="container">
            <h1
              onClick={() => {
                setPageIndex(4);
                setToggle(!toggle);
              }}
            >
              Map
            </h1>
            <div className="section-content">
              <Map
                enableGPS={pageIndex === 4}
                sections={sections}
                setCurrentSectionIndex={setCurrentSectionIndex}
                currentSectionIndex={currentSectionIndex}
                currentLocation={currentLocation}
                setCurrentLocation={setCurrentLocation}
                currentLocationIndex={currentLocationIndex}
                setCurrentLocationIndex={setCurrentLocationIndex}
                route={route}
                checkpoints={checkpoints}
              />
            </div>
          </div>
        </section>
        <section className={`six ${pageIndex < 5 && "after"}`}>
          <div className="container">
            <h1
              onClick={() => {
                setPageIndex(5);
                setToggle(!toggle);
              }}
            >
              {name ? name : "Home"}
            </h1>
            <div className="section-content">
              <Home
                name={name}
                setName={setName}
                route={route}
                checkpoints={checkpoints}
                setRoute={setRoute}
                setCheckpoints={setCheckpoints}
                setSections={setSections}
                domain={domain}
                locations={locations}
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default styled(Main);
