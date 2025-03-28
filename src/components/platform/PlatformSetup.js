import { useState } from "react";
import { config } from "../config";
import AuditMgmt from "./AuditMgmt";
import DepartmentMgmt from "./DepartmentMgmt";
import "./PlatformSetup.css";
import RoleMgmt from "./RoleMgmt";
import SettingsMgmt from "./SettingsMgmt";
import UserMgmt from "./UserMgmt";

function PlatformSetup(props) {
  const [itemClicked, setItemClicked] = useState("");

  return (
    <div className="dashboard-container">
      <div className="u-d-container">
        <div className="f-a-options">
          <div className="f-options">
            {!JSON.parse(localStorage.getItem("user")).role.includes(
              "ROLE_QA"
            ) && (
              <div
                className={
                  "f-option " + (itemClicked === "user" ? "f-sel" : "")
                }
                onClick={() => setItemClicked("user")}
              >
                Users
              </div>
            )}
            {!JSON.parse(localStorage.getItem("user")).role.includes(
              "ROLE_QA"
            ) && (
              <div
                className={
                  "f-option " + (itemClicked === "role" ? "f-sel" : "")
                }
                onClick={() => setItemClicked("role")}
              >
                Roles
              </div>
            )}
            {!JSON.parse(localStorage.getItem("user")).role.includes(
              "ROLE_QA"
            ) && (
              <div
                className={
                  "f-option " + (itemClicked === "department" ? "f-sel" : "")
                }
                onClick={() => setItemClicked("department")}
              >
                Departments
              </div>
            )}
            <div
              className={"f-option " + (itemClicked === "audit" ? "f-sel" : "")}
              onClick={() => setItemClicked("audit")}
            >
              Audit
            </div>
            {JSON.parse(localStorage.getItem("user")).role.includes(
              "ROLE_ADMIN"
            ) && (
              <div
                className={
                  "f-option " + (itemClicked === "settings" ? "f-sel" : "")
                }
                onClick={() => setItemClicked("settings")}
              >
                Settings
              </div>
            )}
          </div>
        </div>
        {itemClicked === "department" && (
          <DepartmentMgmt raiseAlert={props.raiseAlert}></DepartmentMgmt>
        )}
        {itemClicked === "role" && (
          <RoleMgmt raiseAlert={props.raiseAlert}></RoleMgmt>
        )}
        {itemClicked === "user" && (
          <UserMgmt raiseAlert={props.raiseAlert}></UserMgmt>
        )}
        {itemClicked === "audit" && (
          <AuditMgmt raiseAlert={props.raiseAlert}></AuditMgmt>
        )}
        {itemClicked === "settings" && (
          <SettingsMgmt raiseAlert={props.raiseAlert}></SettingsMgmt>
        )}
      </div>
    </div>
  );
}

export default PlatformSetup;
