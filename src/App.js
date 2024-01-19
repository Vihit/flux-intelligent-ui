import logo from "./logo.svg";
import "./App.css";
import Navbar from "./components/Navbar";
import Login from "./components/Login";
import { useState } from "react";
import { Route, useHistory } from "react-router-dom";
import { useEffect } from "react";
import { config } from "./components/config";
import Dashboard from "./components/Dashboard";
import FormStudio from "./components/FormStudio";
import AppDashboard from "./components/AppDashboard";
import PlatformSetup from "./components/platform/PlatformSetup";
import jwt from "jwt-decode";
import Reports from "./components/Reports";
import IdleTimer from "./components/IdleTimer";

function App() {
  const [alert, setAlert] = useState(false);
  const [alertTime, setAlertTime] = useState(500);
  const [alertContent, setAlertContent] = useState("");
  const [color, setColor] = useState("");
  const [loading, setLoading] = useState(false);
  const [loggedIn, setLoggedIn] = useState(
    localStorage.getItem("access") != "undefined" &&
      localStorage.getItem("access") != null
      ? jwt(JSON.parse(localStorage.getItem("access"))["access_token"]).exp *
          1000 >
        Date.now()
        ? true
        : false
      : false
  );
  let history = useHistory();
  let timeId = null;
  useEffect(() => {
    // setInterval(() => {
    //   renewToken();
    // }, 500000);
  }, []);

  function raiseAlert(type, message, time) {
    if (type !== "loading") {
      setAlert(true);
      setAlertContent(message);
      setColor("var(--" + type + ")");
      if (timeId != null) {
        clearTimeout(timeId);
      }
      if (time == undefined || time <= 500) {
        setAlertTime(500);
        timeId = setTimeout(() => {
          setAlert(false);
          setAlertContent("");
        }, 500);
      } else {
        setAlertTime(time);
      }
    } else {
      if (message === "start") setLoading(true);
      else setLoading(false);
    }
  }

  function loginHandler() {
    setLoggedIn(true);
    history.push("/dashboard");
  }

  function logoutHandler() {
    localStorage.clear();
    setLoggedIn(false);
  }

  const handleTimeout = () => {
    logoutHandler();
    raiseAlert("red", "User has been logged out due to inactivity", 5000);
  };

  return (
    <div>
      <div className={loading ? "loading " : "close-flex "}>
        <div className="loading-inner">
          <div className="small-e-line"></div>
        </div>
      </div>
      <div
        className={
          "notification " +
          (alert || alertTime > 500 ? "" : " notification-hidden")
        }
      >
        <div style={{ backgroundColor: color }} className="notif-icon">
          {color === "var(--green)" && (
            <i className="fa-solid fa-circle-check"></i>
          )}
          {color === "var(--red)" && (
            <i className="fa-solid fa-circle-exclamation"></i>
          )}
        </div>
        <div style={{ backgroundColor: color }} className="not-msg">
          <div>{alertContent}</div>
        </div>
        {alertTime > 500 && (
          <div
            style={{ color: color, borderColor: color }}
            className="ok-btn"
            onClick={() => {
              setAlert(false);
              setAlertContent("");
              setAlertTime(500);
            }}
          >
            Ok
          </div>
        )}
      </div>
      <Navbar
        raiseAlert={raiseAlert}
        isLoggedIn={loggedIn}
        onLogout={logoutHandler}
      ></Navbar>
      {!loggedIn ? (
        <Login raiseAlert={raiseAlert} onLogin={loginHandler}></Login>
      ) : null}
      {loggedIn && (
        <div className={loading ? "inactive " : ""}>
          <div>
            <IdleTimer onTimeout={handleTimeout} />
            <Route exact path="/">
              <Dashboard raiseAlert={raiseAlert}></Dashboard>
            </Route>
            <Route exact path="/dashboard">
              <Dashboard raiseAlert={raiseAlert}></Dashboard>
            </Route>
            {JSON.parse(localStorage.getItem("user")).role.includes(
              "ROLE_ADMIN"
            ) && (
              <div>
                <Route exact path="/form-studio">
                  <FormStudio raiseAlert={raiseAlert}></FormStudio>
                </Route>
                <Route exact path="/app/:id">
                  <AppDashboard raiseAlert={raiseAlert}></AppDashboard>
                </Route>
                <Route exact path="/platform">
                  <PlatformSetup raiseAlert={raiseAlert}></PlatformSetup>
                </Route>
              </div>
            )}
            {JSON.parse(localStorage.getItem("user")).role.includes(
              "ROLE_SYSTEM_ADMIN"
            ) && (
              <div>
                <Route exact path="/platform">
                  <PlatformSetup raiseAlert={raiseAlert}></PlatformSetup>
                </Route>
              </div>
            )}
            {JSON.parse(localStorage.getItem("user")).role.filter((role) =>
              ["ROLE_SYSTEM_ADMIN", "ROLE_ADMIN"].includes(role)
            ).length > 0 && (
              <div>
                <Route exact path="/reports">
                  <Reports raiseAlert={raiseAlert}></Reports>
                </Route>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
