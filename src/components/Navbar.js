import { useState } from "react";
import "./Navbar.css";
import { Link, useHistory } from "react-router-dom";
import { config } from "./config";

function Navbar(props) {
  const [accountClick, setAccountClick] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  function handleAccountClick() {
    setAccountClick(!accountClick);
  }

  function handleLogout() {
    setAccountClick(false);
    props.onLogout();
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
