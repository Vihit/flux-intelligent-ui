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
        <div className="u-menu p-menu-sidebar">
          <div
            className="u-menu-head p-menu"
            onClick={() => setItemClicked("user")}
          >
            User Management
          </div>
          <div
            className="u-menu-head p-menu"
            onClick={() => setItemClicked("role")}
          >
            Role Management
          </div>
          <div
            className="u-menu-head p-menu"
            onClick={() => setItemClicked("department")}
          >
            Departments
          </div>
          <div
            className="u-menu-head p-menu"
            onClick={() => setItemClicked("audit")}
          >
            Audit Trail
          </div>
          <div
            className="u-menu-head p-menu"
            onClick={() => setItemClicked("settings")}
          >
            Settings
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
