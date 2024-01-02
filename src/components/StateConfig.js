import { useEffect, useState } from "react";
import "./StateConfig.css";
import { config } from "./config.js";
import ColSelectionWindow from "./ColSelectionWindow.js";

function StateConfig(props) {
  const [toggleBasicDetails, setToggleBasicDetails] = useState(false);
  const [toggleDataDetails, setToggleDataDetails] = useState(false);
  const [toggleAccessDetails, setToggleAccessDetails] = useState(false);
  const [toggleColumnsDetails, setToggleColumnDetails] = useState(false);
  const [conf, setConf] = useState(props.conf);
  const [form, setForm] = useState();
  const [selectedRoles, setSelectedRoles] = useState(props.conf.selectedRoles);
  const [selectedDepartments, setSelectedDepartments] = useState(
    props.conf.selectedDepartments
  );
  const [prevStates, setPrevStates] = useState(
    props.transitions
      .filter((t) => t.target == props.currCell)
      .map((t) => t.source)
      .map((sId) => props.states.filter((st) => st.id == sId)[0].label)
  );
  const [writableColumns, setWritableColumns] = useState(
    props.conf.writableColumns !== undefined ? props.conf.writableColumns : []
  );
  const [viewableColumns, setViewableColumns] = useState(
    props.conf.viewableColumns !== undefined
      ? props.conf.viewableColumns
      : props.formColumns.map((col) => col.toLowerCase().replaceAll(" ", "_"))
  );
  useEffect(() => {}, []);

  function toggle(what) {
    if (what === "basic-details") setToggleBasicDetails(!toggleBasicDetails);
    else if (what === "data-details") setToggleDataDetails(!toggleDataDetails);
    else if (what === "access-details")
      setToggleAccessDetails(!toggleAccessDetails);
    else if (what === "column-details")
      setToggleColumnDetails(!toggleColumnsDetails);
  }

  function confChanged(what, value) {
    let currConf = { ...conf };
    setConf((prev) => {
      if (what === "final") {
        currConf["selectedRoles"] = selectedRoles;
        currConf["selectedDepartments"] = selectedDepartments;
        currConf["viewableColumns"] = viewableColumns;
        currConf["writableColumns"] = writableColumns;
        props.saveConf(props.currCell, currConf);
      } else {
        let currConf = { ...conf };
        var obj = currConf;
        let splitWhat = what.split(".");
        for (var i = 0; i < splitWhat.length - 1; i++) {
          let prop = splitWhat[i];
          obj = obj[prop];
        }
        let finalProp = splitWhat[i];
        obj[finalProp] = value;
      }
      return currConf;
    });
    if (what === "final") {
      currConf["selectedRoles"] = selectedRoles;
      currConf["selectedDepartments"] = selectedDepartments;
      currConf["viewableColumns"] = viewableColumns;
      currConf["writableColumns"] = writableColumns;
      // props.saveConf(props.currCell, currConf);
    } else {
      var obj = currConf;
      let splitWhat = what.split(".");
      for (var i = 0; i < splitWhat.length - 1; i++) {
        let prop = splitWhat[i];
        obj = obj[prop];
      }
      let finalProp = splitWhat[i];
      obj[finalProp] = value;
    }
  }

  function addToSelectedRoles(id) {
    setSelectedRoles((prev) => {
      let toBeUpdated = [...prev];
      toBeUpdated.push(id);
      return toBeUpdated;
    });
  }
  function addToSelectedDepartments(id) {
    setSelectedDepartments((prev) => {
      let toBeUpdated = [...prev];
      toBeUpdated.push(id);
      return toBeUpdated;
    });
  }

  function removeRole(id) {
    setSelectedRoles((prev) => {
      let toBeUpdated = [...prev];
      return toBeUpdated.filter((r) => r != id);
    });
  }

  function removeDepartment(id) {
    setSelectedDepartments((prev) => {
      let toBeUpdated = [...prev];
      let updated = toBeUpdated.filter((r) => r + "" !== id);
      return updated;
    });
  }

  function updateViewableColumns(column, value) {
    setViewableColumns((prev) => {
      let toBeUpdated = [...prev];
      if (value) toBeUpdated.push(column);
      else toBeUpdated.splice(toBeUpdated.indexOf(column), 1);
      return toBeUpdated;
    });
  }

  function updateWritableColumns(column, value) {
    setWritableColumns((prev) => {
      let toBeUpdated = [...prev];
      if (!value) toBeUpdated.push(column);
      else toBeUpdated.splice(toBeUpdated.indexOf(column), 1);
      return toBeUpdated;
    });
  }

  return (
    <div
      className={
        "cell-configure-window " +
        (props.confVisible ? "slide-out-move" : "slide-in-move")
      }
    >
      <div className="viz-conf-header">
        <div>Configuration</div>
        <div className="conf-icons">
          <i
            className="fa-solid fa-trash"
            onClick={(e) => props.deleteState(props.currCell)}
          ></i>
          <i
            className="fa-solid fa-floppy-disk"
            onClick={(e) => confChanged("final", "")}
          ></i>
        </div>
      </div>
      <div className="config-form">
        <div className="dtl">
          <div className="dtl-head" onClick={() => toggle("basic-details")}>
            <div>Basic Details</div>
            {toggleBasicDetails && (
              <div>
                <i className="fa-solid fa-minus"></i>
              </div>
            )}
            {!toggleBasicDetails && (
              <div>
                <i className="fa-solid fa-plus"></i>
              </div>
            )}
          </div>
          {toggleBasicDetails && (
            <div className="dtls">
              <div className="label-n-text">
                <div className="label">Name</div>
                <div className="text">
                  <input
                    type="text"
                    value={conf.name}
                    onChange={(e) => confChanged("name", e.target.value)}
                  ></input>
                </div>
              </div>
            </div>
          )}
          {toggleBasicDetails && (
            <div className="dtls">
              <div className="label-n-text">
                <div className="label">Label</div>
                <div className="text">
                  <input
                    type="text"
                    value={conf.label}
                    onChange={(e) => confChanged("label", e.target.value)}
                  ></input>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="dtl">
          <div className="dtl-head" onClick={() => toggle("data-details")}>
            <div>State Details</div>
            {toggleDataDetails && (
              <div>
                <i className="fa-solid fa-minus"></i>
              </div>
            )}
            {!toggleDataDetails && (
              <div>
                <i className="fa-solid fa-plus"></i>
              </div>
            )}
          </div>
          {toggleDataDetails && (
            <div className="dtls">
              <div className="label-n-text">
                <div className="label">Prev State</div>
                <div className="text">
                  <select
                    value={conf.isRequired}
                    onChange={(e) => {
                      if (e.target.value != -1) {
                        props.addTransition(e.target.value, props.currCell);
                        setPrevStates((prev) => {
                          let toBeUpdated = [...prev];
                          toBeUpdated.push(
                            props.states.filter(
                              (st) => st.id === e.target.value
                            )[0].label
                          );
                          return toBeUpdated;
                        });
                      }
                    }}
                  >
                    <option value={-1}>---</option>
                    <option value={props.currCell}>Self</option>
                    {props.states
                      .filter(
                        (st) =>
                          st.id !== props.currCell &&
                          !prevStates.includes(st.name)
                      )
                      .map((state, idx) => {
                        return (
                          <option key={idx} value={state.id}>
                            {state.name + " | " + state.label}
                          </option>
                        );
                      })}
                  </select>
                </div>
              </div>
              <div className="selected-accesses">
                {prevStates.map((ps, ind) => {
                  return (
                    <div
                      key={ind}
                      className="selected-access"
                      onClick={() => {
                        setPrevStates((prev) => {
                          let toBeUpdated = [...prev];
                          return toBeUpdated.filter((st) => st !== ps);
                        });
                        props.removeTransition(
                          props.states.filter((st) => st.label === ps)[0].id,
                          props.currCell
                        );
                      }}
                    >
                      {ps}
                    </div>
                  );
                })}
              </div>
              <div className="label-n-text">
                <div className="label">First State</div>
                <div className="text">
                  <select
                    value={conf.isFirstState}
                    onChange={(e) =>
                      confChanged("isFirstState", JSON.parse(e.target.value))
                    }
                  >
                    <option value={false}>No</option>
                    <option value={true}>Yes</option>
                  </select>
                </div>
              </div>
              <div className="label-n-text">
                <div className="label">Last State</div>
                <div className="text">
                  <select
                    value={conf.isLastState}
                    onChange={(e) => confChanged("isLastState", e.target.value)}
                  >
                    <option value={false}>No</option>
                    <option value={true}>Yes</option>
                  </select>
                </div>
              </div>
              <div className="label-n-text">
                <div className="label">Condition</div>
                <div className="text">
                  <textarea
                    value={conf.stateCondition}
                    onChange={(e) =>
                      confChanged("stateCondition", e.target.value)
                    }
                  ></textarea>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="dtl">
          <div className="dtl-head" onClick={() => toggle("access-details")}>
            <div>Access Details</div>
            {toggleAccessDetails && (
              <div>
                <i className="fa-solid fa-minus"></i>
              </div>
            )}
            {!toggleAccessDetails && (
              <div>
                <i className="fa-solid fa-plus"></i>
              </div>
            )}
          </div>
          {toggleAccessDetails && (
            <div className="dtls">
              <div className="label-n-text">
                <div className="label">Roles</div>
                <div className="text">
                  <select
                    value={""}
                    onChange={(e) => addToSelectedRoles(e.target.value)}
                  >
                    <option value={""}>Add Role</option>
                    {props.roles
                      .filter((role) => {
                        return !selectedRoles.includes(role.id + "");
                      })
                      .map((role, idx) => {
                        return (
                          <option key={idx} value={role.id}>
                            {role.role}
                          </option>
                        );
                      })}
                  </select>
                </div>
              </div>
              <div className="selected-accesses">
                {selectedRoles.map((sR, ins) => {
                  return (
                    <div
                      className="selected-access"
                      key={ins}
                      onClick={() => removeRole(sR)}
                    >
                      {props.roles.filter((r) => r.id == sR)[0].role}
                    </div>
                  );
                })}
              </div>
              <div className="label-n-text">
                <div className="label">Departments</div>
                <div className="text">
                  <select
                    value={""}
                    onChange={(e) => addToSelectedDepartments(e.target.value)}
                  >
                    <option value={""}>Add Department</option>
                    {props.departments
                      .filter(
                        (dept) => !selectedDepartments.includes(dept.id + "")
                      )
                      .map((dpt, idx) => {
                        return (
                          <option key={idx} value={dpt.id}>
                            {dpt.name}
                          </option>
                        );
                      })}
                  </select>
                </div>
              </div>
              <div className="selected-accesses">
                {selectedDepartments.map((sD, ins) => {
                  return (
                    <div
                      className="selected-access"
                      key={ins}
                      onClick={() => removeDepartment(sD)}
                    >
                      {props.departments.filter((d) => d.id == sD)[0].name}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        <div className="dtl">
          <div className="dtl-head" onClick={() => toggle("column-details")}>
            <div>Data Details</div>
            {toggleColumnsDetails && (
              <div>
                <i className="fa-solid fa-minus"></i>
              </div>
            )}
            {!toggleColumnsDetails && (
              <div>
                <i className="fa-solid fa-plus"></i>
              </div>
            )}
          </div>
          {toggleColumnsDetails && (
            <div className="dtls-col">
              <div className="dtl-col-row-head">
                <div className="dtl-col-col">Column</div>
                <div className="dtl-col-col">Editable</div>
                <div className="dtl-col-col">Viewable</div>
              </div>
              {props.formColumns.map((col, ind) => {
                return (
                  <div key={ind} className="dtl-col-row">
                    <div className="dtl-col-col">{col}</div>
                    <div className="dtl-col-col">
                      <input
                        type="checkbox"
                        checked={
                          !writableColumns.includes(
                            col.toLowerCase().replaceAll(" ", "_")
                          )
                        }
                        onChange={(e) =>
                          updateWritableColumns(
                            col.toLowerCase().replaceAll(" ", "_"),
                            e.target.checked
                          )
                        }
                      ></input>
                    </div>
                    <div className="dtl-col-col">
                      <input
                        type="checkbox"
                        checked={viewableColumns.includes(
                          col.toLowerCase().replaceAll(" ", "_")
                        )}
                        onChange={(e) =>
                          updateViewableColumns(
                            col.toLowerCase().replaceAll(" ", "_"),
                            e.target.checked
                          )
                        }
                      ></input>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default StateConfig;
