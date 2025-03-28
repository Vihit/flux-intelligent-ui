import { useEffect, useState } from "react";
import "./Navbar.css";
import { Link, useHistory, useLocation } from "react-router-dom";
import { config } from "./config";
import jwt from "jwt-decode";

function Navbar(props) {
  const location = useLocation();
  const [forms, setForms] = useState([]);
  const [searchLog, setSearchLog] = useState("");
  const [selected, setSelected] = useState(location.pathname);
  const [accountClick, setAccountClick] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [user, setUser] = useState(
    localStorage.getItem("user") != null
      ? JSON.parse(localStorage.getItem("user"))["sub"]
      : ""
  );
  const [pwd, setPwd] = useState("");
  let history = useHistory();
  const [apps, setApps] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    setSelected(location.pathname);
    setInterval(() => {
      if (
        localStorage.getItem("user") == null ||
        localStorage.getItem("user").exp <= Date.now()
      ) {
        props.onLogout();
      } else {
        if (
          Date.now() / 1000 - JSON.parse(localStorage.getItem("user")).exp >=
          -60
        ) {
          console.log("Refreshing Token");
          renewToken();
        }
      }
    }, 59 * 60 * 1000);
    if (props.isLoggedIn) {
      getAllForms();
      getApps();
    }
  }, [props.isLoggedIn]);

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

  function getAllForms() {
    fetch(config.apiUrl + "forms/", {
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

  function handleAccountClick() {
    setAccountClick(!accountClick);
  }

  function renewToken() {
    let tokenStr = localStorage.getItem("access");
    if (tokenStr !== "undefined") {
      let token = JSON.parse(tokenStr);
      if (token != null) {
        fetch(config.apiUrl + "token/refresh", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: "Bearer " + JSON.parse(tokenStr).refresh_token,
          },
        })
          .then((response) => {
            if (response.ok) {
              return response.json();
            } else {
              props.onLogout();
            }
          })
          .then((actualData) => {
            localStorage.setItem("access", JSON.stringify(actualData));
            localStorage.setItem(
              "user",
              JSON.stringify(jwt(actualData["access_token"]))
            );
          });
      }
    }
  }

  function handleLogout() {
    setAccountClick(false);
    props.onLogout();
  }

  function cancelExtend() {
    setShowLogin(false);
  }

  function pressedKey(e) {
    if (e.key === "Enter") {
      extend();
    }
  }

  function extend() {
    var formBody = [];
    formBody.push(
      encodeURIComponent("username") + "=" + encodeURIComponent(user)
    );
    formBody.push(
      encodeURIComponent("password") + "=" + encodeURIComponent(pwd)
    );
    formBody = formBody.join("&");
    fetch(config.apiUrl + "login", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        Accept: "application/json",
      },
      body: formBody,
    })
      .then((response) => {
        if (response.ok) return response.json();
        else {
          props.raiseAlert("red", "Username or Password incorrect!", 3000);
          props.onLogout();
          setPwd("");
          throw new Error("");
        }
      })
      .then((actualData) => {
        props.raiseAlert("green", "Session extended!");
        localStorage.setItem("access", JSON.stringify(actualData));
        localStorage.setItem(
          "user",
          JSON.stringify(jwt(actualData["access_token"]))
        );
        setPwd("");
        setShowLogin(false);
      });
  }

  function goToForm(appId, formId) {
    history.push("/dashboard/" + appId + "/" + formId);
  }

  if (props.isLoggedIn) {
    return (
      <div className="navbar">
        {showSettings && <div></div>}
        <div
          className="logo"
          style={{ cursor: "pointer" }}
          onClick={() => history.push("/")}
        >
          <div className="delogo"></div>
          <div className="appname">Logever</div>
          {/* <div className="client-logo"></div> */}
        </div>
        <div
          style={{
            display: "flex",
            flexGrow: "1",
            height: "8vh",
            justifyContent: "flex-start",
            alignItems: "center",
          }}
        >
          <div className="srch-control">
            <form autoComplete="false">
              <input
                type="text"
                placeholder="Search for Log"
                value={searchLog}
                onChange={(e) => setSearchLog(e.target.value)}
              ></input>
            </form>
            {searchLog.length > 0 && (
              <div className="app-options">
                {forms
                  .filter((f) =>
                    f.name.toLowerCase().includes(searchLog.toLowerCase())
                  )
                  .map((f) => {
                    return (
                      <div
                        className="app-option"
                        key={f.id}
                        onClick={() => {
                          goToForm(f.appId, f.id);
                          setSearchLog("");
                        }}
                      >
                        <div className="app-o-i">
                          <i
                            className={
                              "fa-solid " +
                              apps?.filter((a) => a.id + "" === f.appId)[0]
                                ?.icon
                            }
                          ></i>
                        </div>
                        <div className="app-o-n">{f.name}</div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
        <div className="option-a">
          <div
            className="l-option"
            onClick={() => {
              if (props.notifications.length > 0) {
                setShowNotifications(true);
              }
            }}
            onMouseLeave={() => setShowNotifications(false)}
          >
            <i className="fa-regular fa-bell"></i>
            {props.notifications.length > 0 && <div className="notif"></div>}
            {showNotifications && (
              <div
                className="notif-cont"
                onMouseLeave={() => setShowNotifications(false)}
              >
                {props.notifications.map((n, inx) => {
                  return (
                    <div
                      onClick={() =>
                        goToForm(
                          apps.filter((a) => a.name === n.app)[0]?.id,
                          n.primaryId
                        )
                      }
                      key={inx}
                    >
                      {n.msg}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <div className="l-option" onClick={handleLogout}>
            <i className="fa-solid fa-power-off"></i>
          </div>
        </div>
        {/* <div className="r-nav">
          <div className={selected === "/dashboard" ? "sel-nav" : ""}>
            <Link to="/dashboard" onClick={() => setSelected("/dashboard")}>
              <i className="fa-solid fa-house"></i>
            </Link>
          </div>
          {JSON.parse(localStorage.getItem("user")).role.includes(
            "ROLE_ADMIN"
          ) && (
            <div className={selected === "/platform" ? "sel-nav" : ""}>
              <Link to="/platform" onClick={() => setSelected("/platform")}>
                <i className="fa-solid fa-briefcase"></i>
              </Link>
            </div>
          )}
          {JSON.parse(localStorage.getItem("user")).role.includes(
            "ROLE_SYSTEM_ADMIN"
          ) && (
            <div className={selected === "/platform" ? "sel-nav" : ""}>
              <Link to="/platform" onClick={() => setSelected("/platform")}>
                <i className="fa-solid fa-briefcase"></i>
              </Link>
            </div>
          )}
          {JSON.parse(localStorage.getItem("user")).role.includes(
            "ROLE_QA"
          ) && (
            <div className={selected === "/platform" ? "sel-nav" : ""}>
              <Link to="/platform" onClick={() => setSelected("/platform")}>
                <i className="fa-solid fa-briefcase"></i>
              </Link>
            </div>
          )}
          {JSON.parse(localStorage.getItem("user")).role.filter((role) =>
            ["ROLE_SYSTEM_ADMIN", "ROLE_ADMIN"].includes(role)
          ).length > 0 && (
            <div className={selected === "/reports" ? "sel-nav" : ""}>
              <Link to="/reports" onClick={() => setSelected("/reports")}>
                <i className="fa-solid fa-book"></i>
              </Link>
            </div>
          )}
          {JSON.parse(localStorage.getItem("user")).role.includes(
            "ROLE_ADMIN"
          ) && (
            <div className={selected === "/form-studio" ? "sel-nav" : ""}>
              <Link
                to="/form-studio"
                onClick={() => setSelected("/form-studio")}
              >
                <i className="fa-solid fa-folder-plus"></i>
              </Link>
            </div>
          )}
          <div onClick={handleLogout}>
            <a>
              <i className="fa-solid fa-power-off"></i>
            </a>
          </div>
        </div> */}

        <div className={"esign-modal " + (showLogin ? " " : " close-flex")}>
          <div className="create-job-header">
            <div className="flex-row-title margin-btm">
              <i className="fa-solid fa-signature new-job-icon"></i>
              <div className="new-job-head">Extend</div>
            </div>
            <div className="new-esign-input">
              <div className="new-esign-label">Username</div>
              <div className="new-job-ta">
                <input type="text" value={user} disabled></input>
              </div>
            </div>
            <div className="new-esign-input">
              <div className="new-esign-label">Password</div>
              <div className="new-job-ta">
                <input
                  type="password"
                  value={pwd}
                  onChange={(e) => setPwd(e.target.value)}
                  onKeyDown={(e) => pressedKey(e)}
                ></input>
              </div>
            </div>
            <div className="flex-row-title">
              <div className="btn-save" onClick={extend}>
                Extend
              </div>
              <div className="btn-cancel" onClick={cancelExtend}>
                Cancel
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div className="navbar">
        <div className="logo">
          <img className="delogo"></img>
          <div className="appname">Logever</div>
          {/* <img className="client-logo"></img> */}
        </div>
      </div>
    );
  }
}

export default Navbar;
