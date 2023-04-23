import { useEffect, useState } from "react";
import { config } from "../config";
import "./DepartmentEdit.css";

function DepartmentEdit(props) {
  const [department, setDepartment] = useState(props.dept);
  const [depts, setDepts] = useState(props.depts);
  useEffect(() => {}, []);

  function deptChanged(what, value) {
    setDepartment((prev) => {
      let toBeUpdated = { ...prev };
      toBeUpdated[what] = value;
      return toBeUpdated;
    });
  }
  function updateDept() {
    let updatedDept = {
      name: department.name,
      id: department.id,
      parentId: department.parentId,
      code: department.code,
      site: department.site,
    };
    fetch(config.apiUrl + "departments/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization:
          "Bearer " + JSON.parse(localStorage.getItem("access")).access_token,
      },
      body: JSON.stringify(updatedDept),
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
      })
      .then((actualData) => {
        props.raiseAlert("green", "Department updated!");
        props.closeWindow(false);
      });
  }
  return (
    <div className="dept-preview">
      <div className="viz-preview-details">
        <div className="viz-name">Edit Department</div>
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
                value={department.name}
                onChange={(e) => deptChanged("name", e.target.value)}
              ></input>
            </div>
          </div>
          <div className="creation-cell" style={{ width: "50%" }}>
            <div className="cell-name">
              <div>Site</div>
            </div>
            <div className="cell-control r-e-text-area">
              <input
                type="text"
                value={department.site}
                onChange={(e) => deptChanged("site", e.target.value)}
              ></input>
            </div>
          </div>
        </div>
        <div className="created-row">
          <div className="creation-cell" style={{ width: "50%" }}>
            <div className="cell-name">
              <div>Code</div>
            </div>
            <div className="cell-control r-e-text-area">
              <input
                type="text"
                value={department.code}
                onChange={(e) => deptChanged("code", e.target.value)}
              ></input>
            </div>
          </div>
          <div className="creation-cell" style={{ width: "50%" }}>
            <div className="cell-name">
              <div>Parent Dept.</div>
            </div>
            <div className="cell-control r-e-text-area">
              <select
                type="text"
                value={department.parentId}
                onChange={(e) => deptChanged("parentId", e.target.value)}
              >
                <option value={null}>Select A Department</option>
                {depts
                  .filter((d) => d.id != department.id)
                  .map((dpt, inx) => {
                    return (
                      <option key={inx} value={dpt.id}>
                        {dpt.name}
                      </option>
                    );
                  })}
              </select>
            </div>
          </div>
        </div>
        <div className="btn-controls">
          <div onClick={updateDept} className="create-btn">
            {department.id == undefined ? "Add" : "Update"}
          </div>

          <div className="cancel-btn" onClick={() => props.closeWindow(false)}>
            Cancel
          </div>
        </div>
      </div>
    </div>
  );
}

export default DepartmentEdit;
