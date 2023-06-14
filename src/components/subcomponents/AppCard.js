import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { bgcolor } from "@mui/system";
import { useState } from "react";
import "./AppCard.css";
import { config } from "../config";
import { Link, useHistory } from "react-router-dom";

function AppCard(props) {
  const [newCard, setNewCard] = useState(props.new);
  const [appName, setAppName] = useState("");
  const [type, setType] = useState("internal");
  const [url, setUrl] = useState("");
  const [icon, setIcon] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  let iconOptions = [
    "fa-list-check",
    "fa-book",
    "fa-address-card",
    "fa-star",
    "fa-database",
    "fa-chart-bar",
  ];

  let history = useHistory();

  function addApp() {
    var app = { name: appName, type: type, url: url, icon: icon };
    fetch(config.apiUrl + "apps/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization:
          "Bearer " + JSON.parse(localStorage.getItem("access")).access_token,
      },
      body: JSON.stringify(app),
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
      })
      .then((actualData) => {
        props.raiseAlert("green", "App Added!");
        props.appAdded(actualData);
        setIsAdding(false);
        setAppName("");
      });
  }

  function appClicked() {
    if (props.app.name === "Create an App!") {
      setIsAdding(true);
    }
  }

  const openInNewTab = () => {
    console.log(localStorage.getItem("access"));
    let windowName = localStorage.getItem("access");
    window.open(props.app.url, windowName);
  };

  function openApp(id) {
    history.push("/app/" + id, props.app.name);
  }

  return (
    <div className="app-card-wrapper">
      <div
        className="app-card"
        style={
          props.app.name === "Create an App!"
            ? { backgroundColor: "var(--accent)" }
            : { backgroundColor: "white" }
        }
        onClick={() => {
          appClicked();
          if (props.app.type === "external") openInNewTab();
          else if (props.app.type === "internal") openApp(props.app.id);
        }}
      >
        {props.app.type === "external" && <Link to={props.app.url}></Link>}
        <div className="ac-icon">
          <i className={"fa-solid " + props.app.icon}></i>
        </div>
        <div className="ac-name">{props.app.name}</div>
      </div>
      {isAdding && (
        <div className="settings-container">
          <div className="set-close" onClick={() => setIsAdding(false)}>
            <i className="fa-solid fa-close"></i>
          </div>
          <div className="set-head">App Details</div>
          <div className="grow-20"></div>
          <div className="set-ctrl">
            <div className="set-label">App Name</div>
            <div className="set-text">
              <input
                type="text"
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
              ></input>
            </div>
          </div>
          <div className="set-ctrl">
            <div className="set-label">Type</div>
            <div className="set-text">
              <select
                type="text"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="internal">Internal</option>
                <option value="external">External</option>
              </select>
            </div>
          </div>
          {type === "external" && (
            <div className="set-ctrl">
              <div className="set-label">URL</div>
              <div className="set-text">
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                ></input>
              </div>
            </div>
          )}
          <div className="set-ctrl">
            <div className="set-label">Icon</div>
            <div className="set-icon">
              {iconOptions.map((icn, indx) => {
                return (
                  <div
                    key={indx}
                    className="set-icon-option"
                    onClick={() => setIcon(icn)}
                    style={
                      icn === icon
                        ? {
                            backgroundColor: "var(--accent)",
                            color: "var(--main)",
                          }
                        : {}
                    }
                  >
                    <i className={"fa-solid " + icn}></i>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="set-ctrl">
            <div className="create-btn" onClick={addApp}>
              Create
            </div>
            <div className="cancel-btn" onClick={() => setIsAdding(false)}>
              Cancel
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AppCard;
