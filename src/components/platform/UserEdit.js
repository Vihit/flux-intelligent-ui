import "./UserEdit.css";
import { config } from "../config";
import { useEffect, useState } from "react";

function UserEdit(props) {
  const [user, setUser] = useState(props.user);
  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
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
        setRoles(actualData.filter((role) => role.id > 1));
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
    setUser((prev) => {
      let toBeUpdated = { ...prev };
      if (what !== "final") {
        if (what === "department") {
          // let department = [departments.filter((d) => d.name === value)[0].id];
          toBeUpdated["department"] = value;
        } else if (what === "roles") {
          // let roles = [roles.filter((r) => r.role === value)[0].id];
          // toBeUpdated["roles"] = value;
          if (value.checked) {
            let arr =
              toBeUpdated["roles"] === undefined ? [] : toBeUpdated["roles"];
            let arrr = arr.split(",");
            arrr.push(value.value);
            toBeUpdated["roles"] = arrr.join(",");
          } else {
            let arr = toBeUpdated["roles"];
            let arrr = arr.split(",");
            arrr.splice(arrr.indexOf(value.value), 1);
            toBeUpdated["roles"] = arrr.join(",");
          }
        } else {
          toBeUpdated[what] = value;
        }
      }
      return toBeUpdated;
    });
  }
  function updateUser() {
    let rolesArr = roles
      .filter((r) => user.roles.split(",").includes(r.role))
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
      reporting_manager: user.reporting_manager,
      designation: user.designation,
      employee_code: user.employee_code,
      windows_id: user.windows_id,
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
                type="text"
                value={user.username}
                disabled={user.id != undefined}
                onChange={(e) => userChanged("username", e.target.value)}
              ></input>
            </div>
          </div>
          <div className="creation-cell" style={{ width: "50%" }}>
            <div className="cell-name">
              <div>Emp Code</div>
            </div>
            <div className="cell-control">
              <input
                type="text"
                value={user.employee_code}
                disabled={user.id != undefined}
                onChange={(e) => userChanged("employee_code", e.target.value)}
              ></input>
            </div>
          </div>
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
                // onChange={(e) => userChanged("email", e.target.value)}
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
          <div className="creation-cell" style={{ width: "50%" }}>
            <div className="cell-name">
              <div>Designation</div>
            </div>
            <div className="cell-control">
              <input
                type="text"
                value={user.designation}
                disabled={user.id != undefined}
                onChange={(e) => userChanged("designation", e.target.value)}
              ></input>
            </div>
          </div>
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
              <div>Windows ID</div>
            </div>
            <div className="cell-control">
              <input
                type="text"
                value={user.windows_id}
                disabled={user.id != undefined}
                onChange={(e) => userChanged("windows_id", e.target.value)}
              ></input>
            </div>
          </div>
        </div>
        <div className="created-row">
          <div className="creation-cell" style={{ width: "50%" }}>
            <div className="cell-name">
              <div>Reporting Manager</div>
            </div>
            <div className="cell-control">
              <select
                value={user.reporting_manager}
                onChange={(e) =>
                  userChanged("reporting_manager", e.target.value)
                }
              >
                <option value={null}>Select</option>
                {props.users.map((user, inx) => {
                  return (
                    <option key={inx} value={user.username}>
                      {user.username}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        </div>
        <div className="created-row">
          <div className="role-creation-cell" style={{ width: "100%" }}>
            <div className="role-cell-name">
              <div>Roles</div>
            </div>
            <div className="role-cell-control">
              {roles.map((sV, ind) => {
                return (
                  <div
                    key={ind}
                    className="r-group"
                    style={{
                      width: "20%",
                    }}
                  >
                    <div className="r-label">{sV.role}</div>
                    <div className="r-r">
                      <input
                        type="checkbox"
                        value={sV.role}
                        disabled={props.disabled}
                        onChange={(e) => userChanged("roles", e.target)}
                        checked={
                          user.roles != undefined
                            ? user.roles
                                .split(",")
                                .map((r) => r)
                                .includes(sV.role)
                            : false
                        }
                      ></input>
                    </div>
                  </div>
                );
              })}
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
