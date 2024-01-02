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

function App() {
  const [alert, setAlert] = useState(false);
  const [alertContent, setAlertContent] = useState("");
  const [color, setColor] = useState("");
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
  useEffect(() => {
    // setInterval(() => {
    //   renewToken();
    // }, 500000);
  }, []);

  function raiseAlert(type, message, time) {
    setAlert(true);
    setAlertContent(message);
    setColor("var(--" + type + ")");
    const timeId = setTimeout(
      () => {
        setAlert(false);
        setAlertContent("");
      },
      time == undefined ? 500 : time
    );
  }

  function loginHandler() {
    setLoggedIn(true);
    history.push("/dashboard");
  }

  function logoutHandler() {
    localStorage.clear();
    setLoggedIn(false);
  }

  return (
    <div>
      <div
        style={{ backgroundColor: color }}
        className={"notification " + (alert ? "" : " notification-hidden")}
      >
        <div className="notif-icon">
          {color === "var(--green)" && (
            <i className="fa-solid fa-circle-check"></i>
          )}
          {color === "var(--red)" && (
            <i className="fa-solid fa-circle-exclamation"></i>
          )}
        </div>
        <div className="not-msg">
          <div>{alertContent}</div>
        </div>
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
        <div>
          <div>
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
