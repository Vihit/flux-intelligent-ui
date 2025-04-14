import { useEffect, useState } from "react";
import { config } from "./config";
import "./Dashboard.css";
import AppCard from "./subcomponents/AppCard";
import UserDashboard from "./UserDashboard";
import { Link, useHistory, useLocation } from "react-router-dom";
import AppDashboard from "./AppDashboard";
import { useParams } from "react-router-dom/cjs/react-router-dom.min";

function Dashboard(props) {
  let location = useParams();
  let history = useHistory();
  const [apps, setApps] = useState([]);
  const [open, setOpen] = useState("");
  const [app, setApp] = useState(location?.appId);
  const [form, setForm] = useState(location?.formId);
  const [forms, setForms] = useState([]);

  useEffect(() => {
    props.raiseAlert("loading", "start");
    getApps();
    getPendingEntries();
    getDetailedForms();
    if (location?.formId > 0) {
      setForm(location?.formId);
    } else setForm(0);
    if (location?.appId > 0) {
      setApp(location?.appId);
      openApp(location?.appId);
    } else setApp(0);
  }, [location.appId]);

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
        setApps(actualData.filter((a) => a.type === "Logever"));
        props.raiseAlert("loading", "end");
      });
  }

  function getPendingEntries() {
    fetch(config.apiUrl + "entry/logever/all-pending", {
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
        props.setNotifications(
          actualData.map((a) => {
            return {
              msg: JSON.parse(a.payload)["msg"],
              primaryId: a.primaryId,
              app: a.app,
            };
          })
        );
      });
  }

  function getDetailedForms() {
    fetch(config.apiUrl + "forms/detailed/", {
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
        setForms(actualData);
      });
  }

  function openApp(appId) {
    // setApp((prev) => {
    //   return appId;
    // });
    let x = location?.formId > 0 ? location.formId : 0;
    history.push("/dashboard/" + appId + "/" + x + "");
    setOpen("fill");
  }

  return (
    <div className="dashboard-container">
      <div className="dash-nav">
        <div className="app-nav">
          {apps.map((app, ind) => {
            return <AppCard key={ind} app={app} openApp={openApp}></AppCard>;
          })}
        </div>
      </div>
      <div className="dash-cont">
        {forms.length > 0 && apps.length > 0 && app > 0 && (
          <UserDashboard
            name={apps.filter((a) => a.id == app)[0]?.name}
            id={app}
            icon={apps.filter((a) => a.id == app)[0]?.icon}
            raiseAlert={props.raiseAlert}
            selectedFormId={location?.formId}
            refreshNotifications={getPendingEntries}
            forms={forms}
          ></UserDashboard>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
