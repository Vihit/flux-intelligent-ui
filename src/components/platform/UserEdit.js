import "./UserEdit.css";
import { config } from "../config";
import { useEffect, useState } from "react";

function UserEdit(props) {
  const [user, setUser] = useState(props.user);
  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    console.log(props.user);
    getDepartments();
    getRoles();
  }, []);

  function getRoles() {
    fetch(config.apiUrl + "roles/", {
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
        props.raiseAlert("green", "Fetched Roles!");
        setRoles(actualData);
      });
  }

  function getDepartments() {
    fetch(config.apiUrl + "departments/", {
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
        props.raiseAlert("green", "Fetched Departments!");
        setDepartments(actualData);
      });
  }

  function userChanged(what, value) {
    console.log(value);
    setUser((prev) => {
      let toBeUpdated = { ...prev };
      if (what !== "final") {
        if (what === "department") {
          // let department = [departments.filter((d) => d.name === value)[0].id];
          toBeUpdated["department"] = value;
        } else if (what === "roles") {
          // let roles = [roles.filter((r) => r.role === value)[0].id];
          toBeUpdated["roles"] = value;
        } else {
          toBeUpdated[what] = value;
        }
      }
      return toBeUpdated;
    });
  }
  function updateUser() {
    let rolesArr = roles
      .filter((r) => r.role === user.roles)
      .map((r) => {
        return {
          id: r.id,
        };
      });
    let department = {
      id: departments.filter((d) => user.department === d.name)[0].id,
    };
    let updatedUser = {
      username: user.username,
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      password: user.password,
      email: user.email,
      roles: rolesArr,
      department: department,
      dateOfBirth: user.dateOfBirth,
    };
    fetch(config.apiUrl + "users/", {
      method: user.id == undefined ? "POST" : "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization:
          "Bearer " + JSON.parse(localStorage.getItem("access")).access_token,
      },
      body: JSON.stringify(updatedUser),
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
    <div className="user-preview">
      <div className="viz-preview-details">
        <div className="viz-name">Edit User</div>
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
              <div>Username</div>
            </div>
            <div className="cell-control">
              <input
                type="username"
                value={user.username}
                disabled={user.id != undefined}
                onChange={(e) => userChanged("username", e.target.value)}
              ></input>
            </div>
          </div>
          <div className="empty-creation-cell" style={{ width: "50%" }}></div>
        </div>
        <div className="created-row">
          <div className="creation-cell" style={{ width: "50%" }}>
            <div className="cell-name">
              <div>FirstName</div>
            </div>
            <div className="cell-control">
              <input
                type="text"
                value={user.first_name}
                onChange={(e) => userChanged("first_name", e.target.value)}
              ></input>
            </div>
          </div>
          <div className="creation-cell" style={{ width: "50%" }}>
            <div className="cell-name">
              <div>LastName</div>
            </div>
            <div className="cell-control">
              <input
                type="text"
                value={user.last_name}
                onChange={(e) => userChanged("last_name", e.target.value)}
              ></input>
            </div>
          </div>
        </div>
        <div className="created-row">
          <div className="creation-cell" style={{ width: "50%" }}>
            <div className="cell-name">
              <div>Email</div>
            </div>
            <div className="cell-control">
              <input
                type="text"
                value={user.email}
                onChange={(e) => userChanged("email", e.target.value)}
              ></input>
            </div>
          </div>
          <div className="creation-cell" style={{ width: "50%" }}>
            <div className="cell-name">
              <div>DateOfBirth</div>
            </div>
            <div className="cell-control">
              <input
                type="date"
                value={user.dateOfBirth}
                disabled={user.id != undefined}
                onChange={(e) => userChanged("dateOfBirth", e.target.value)}
              ></input>
            </div>
          </div>
        </div>
        <div className="created-row">
          <div className="creation-cell" style={{ width: "50%" }}>
            <div className="cell-name">
              <div>Password</div>
            </div>
            <div className="cell-control">
              <input
                type="password"
                value={user.password}
                onChange={(e) => userChanged("password", e.target.value)}
              ></input>
            </div>
          </div>
          <div className="empty-creation-cell" style={{ width: "50%" }}></div>
        </div>
        <div className="created-row">
          <div className="creation-cell" style={{ width: "50%" }}>
            <div className="cell-name">
              <div>Department</div>
            </div>
            <div className="cell-control">
              <select
                value={user.department}
                onChange={(e) => userChanged("department", e.target.value)}
              >
                <option value={""}>Select</option>
                {departments.map((dept, inx) => {
                  return (
                    <option key={inx} value={dept.name}>
                      {dept.name}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
          <div className="creation-cell" style={{ width: "50%" }}>
            <div className="cell-name">
              <div>Role</div>
            </div>
            <div className="cell-control">
              <select
                value={user.roles}
                onChange={(e) => userChanged("roles", e.target.value)}
              >
                <option value={""}>Select</option>
                {roles.map((role, inx) => {
                  return (
                    <option key={inx} value={role.name}>
                      {role.role}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        </div>
        <div className="btn-controls">
          <div onClick={updateUser} className="create-btn">
            {user.id == undefined ? "Add" : "Update"}
          </div>

          <div className="cancel-btn" onClick={() => props.closeWindow(false)}>
            Cancel
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserEdit;
