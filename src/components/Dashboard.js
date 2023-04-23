import { useEffect, useState } from "react";
import { config } from "./config";
import "./Dashboard.css";
import AppCard from "./subcomponents/AppCard";
import UserDashboard from "./UserDashboard";

function Dashboard(props) {
  const [apps, setApps] = useState([]);

  useEffect(() => {
    getApps();
  }, []);

  function getApps() {
    fetch(config.apiUrl + "apps/", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization:
          "Bearer " + JSON.parse(localStorage.getItem("access")).access_token,
      },
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
      })
      .then((actualData) => {
        setApps(actualData);
      });
  }

  function appAdded(app) {
    setApps((prev) => {
      let prevApps = [...prev];
      prevApps.push(app);
      return prevApps;
    });
  }

  return (
    <div className="dashboard-container">
      {JSON.parse(localStorage.getItem("user")).role.includes("ROLE_ADMIN") &&
        apps.map((app, ind) => {
          return <AppCard key={ind} app={app}></AppCard>;
        })}
      {JSON.parse(localStorage.getItem("user")).role.includes("ROLE_ADMIN") && (
        <AppCard
          app={{ name: "Create an App!", icon: "fa-square-plus" }}
          raiseAlert={props.raiseAlert}
          appAdded={appAdded}
        ></AppCard>
      )}
      {!JSON.parse(localStorage.getItem("user")).role.includes(
        "ROLE_ADMIN"
      ) && <UserDashboard raiseAlert={props.raiseAlert}></UserDashboard>}
    </div>
  );
}

export default Dashboard;
