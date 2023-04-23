import "./RoleEdit.css";
import { config } from "../config";
import { useEffect, useState } from "react";

function RoleEdit(props) {
  const [role, setRole] = useState(props.role);

  useEffect(() => {}, []);

  function userChanged(what, value) {
    setRole((prev) => {
      let toBeUpdated = { ...prev };
      toBeUpdated[what] = value;
      return toBeUpdated;
    });
  }
  function updateRole() {
    let updatedRole = {
      role: role.role,
      id: role.id,
      description: role.description,
    };
    fetch(config.apiUrl + "roles/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization:
          "Bearer " + JSON.parse(localStorage.getItem("access")).access_token,
      },
      body: JSON.stringify(updatedRole),
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
      })
      .then((actualData) => {
        props.raiseAlert("green", "User updated!");
        props.closeWindow(false);
      });
  }
  return (
    <div className="role-preview">
      <div className="viz-preview-details">
        <div className="viz-name">Edit Role</div>
        <div className="grow"></div>
        <div className="close-icon">
          <i
            className="fa-solid fa-close"
            onClick={() => props.closeWindow(false)}
          ></i>
        </div>
      </div>
      <div className="created-container">
        <div className="created-row">
          <div className="creation-cell" style={{ width: "50%" }}>
            <div className="cell-name">
              <div>Name</div>
            </div>
            <div className="cell-control">
              <input
                type="text"
                value={role.role}
                onChange={(e) => userChanged("role", e.target.value)}
              ></input>
            </div>
          </div>
          <div className="creation-cell" style={{ width: "50%" }}>
            <div className="cell-name">
              <div>Description</div>
            </div>
            <div className="cell-control r-e-text-area">
              <textarea
                type="text"
                value={role.description}
                onChange={(e) => userChanged("description", e.target.value)}
              ></textarea>
            </div>
          </div>
        </div>
        <div className="btn-controls">
          <div onClick={updateRole} className="create-btn">
            {role.id == undefined ? "Add" : "Update"}
          </div>

          <div className="cancel-btn" onClick={() => props.closeWindow(false)}>
            Cancel
          </div>
        </div>
      </div>
    </div>
  );
}

export default RoleEdit;
