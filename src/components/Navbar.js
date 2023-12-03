import { useEffect, useState } from "react";
import "./Navbar.css";
import { Link, useHistory } from "react-router-dom";
import { config } from "./config";
import jwt from "jwt-decode";

function Navbar(props) {
  const [accountClick, setAccountClick] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [user, setUser] = useState(
    localStorage.getItem("user") != null
      ? JSON.parse(localStorage.getItem("user"))["sub"]
      : ""
  );
  const [pwd, setPwd] = useState("");

  useEffect(() => {
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
        )
          // setShowLogin(true);
          renewToken();
      }
    }, 10000);
  }, []);

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
            }
          })
          .then((actualData) => {
            console.log(actualData);
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
          props.raiseAlert("red", "Username or Password incorrect!");
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

  function goToSettings() {}
  if (props.isLoggedIn) {
    return (
      <div className="navbar">
        {showSettings && <div></div>}
        <div className="logo">
          <div className="delogo"></div>
          <div className="appname">Flux-Intelligent</div>
          <div className="client-logo"></div>
        </div>
        <div className="options">
          <div>
            <Link to="/dashboard">Dashboard</Link>
          </div>
          {JSON.parse(localStorage.getItem("user")).role.includes(
            "ROLE_ADMIN"
          ) && (
            <div>
              <Link to="/platform">Platform</Link>
            </div>
          )}
          {JSON.parse(localStorage.getItem("user")).role.includes(
            "ROLE_SYSTEM_ADMIN"
          ) && (
            <div>
              <Link to="/platform">Platform</Link>
            </div>
          )}
          {JSON.parse(localStorage.getItem("user")).role.includes(
            "ROLE_ADMIN"
          ) && (
            <div>
              <Link to="/form-studio">Form-Studio</Link>
            </div>
          )}{" "}
        </div>
        <div className="account" onClick={handleAccountClick}>
          <i className="fas fa-user-circle icon-account"></i>
        </div>
        <ul className={"dropdown " + (accountClick ? "show" : "")}>
          <li className="dropdown-item user">
            {JSON.parse(localStorage.getItem("user")).firstName}
          </li>
          <li className="dropdown-item" onClick={() => setShowSettings(true)}>
            Settings
          </li>
          <li className="dropdown-item" onClick={handleLogout}>
            Logout
          </li>
        </ul>
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
          <div className="appname">Flux-Intelligent</div>
          <img className="client-logo"></img>
        </div>
      </div>
    );
  }
}

export default Navbar;
