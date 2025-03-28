import { useState } from "react";
import "./AppCard.css";
import { config } from "../config";
import { Link, useHistory } from "react-router-dom";

function AppCard(props) {
  function openApp(id) {
    props.openApp(id);
  }

  return (
    <>
      <div
        className="app-card"
        style={{ backgroundColor: "var(--main)" }}
        onClick={() => openApp(props.app.id)}
      >
        {props.app.type === "external" && <Link to={props.app.url}></Link>}
        <i className={"fa-solid " + props.app.icon}></i>
      </div>
    </>
  );
}

export default AppCard;
