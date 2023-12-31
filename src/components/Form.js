import { useEffect, useState } from "react";
import CreatedCell from "./CreatedCell";
import "./Form.css";
import { config } from "./config";

function Form(props) {
  console.log(props);
  const [to, setTo] = useState("");
  let user = JSON.parse(localStorage.getItem("user"))["sub"];
  const layout = JSON.parse(props.form.template).layout;
  const conf = JSON.parse(props.form.template).controls;
  const currState =
    props.entry.id == -1 ||
    (props.entry.state ===
      props.form.workflow.states.filter((st) => st.endState)[0].label &&
      props.form.app.name === "Master Data Management")
      ? props.form.workflow.states.filter((st) => st.firstState)[0].label
      : props.entry.state;
  const toStates = props.form.workflow.transitions
    .filter(
      (t) =>
        t.fromState.id ==
        props.form.workflow.states.filter((st) => st.label === currState)[0].id
    )
    .map((t) => t.toState.label);

  const stateConfig = props.form.workflow.states.filter(
    (st) => st.label === currState
  )[0];
  const disabledColumns = stateConfig.disabledColumns.split(",");
  const viewableColumns = stateConfig.visibleColumns.split(",");
  const [data, setData] = useState(props.entry.id == -1 ? {} : props.entry);
  const [showESign, setShowESign] = useState(false);
  const [esignPwd, setESignPwd] = useState("");

  function cancelESign() {
    setESignPwd("");
    setShowESign(false);
  }

  function esign() {
    verifyESign();
  }

  function verifyESign() {
    var formBody = [];
    formBody.push(
      encodeURIComponent("username") +
        "=" +
        encodeURIComponent(JSON.parse(localStorage.getItem("user"))["sub"])
    );
    formBody.push(
      encodeURIComponent("password") + "=" + encodeURIComponent(esignPwd)
    );
    formBody = formBody.join("&");
    fetch(config.apiUrl + "login", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        Accept: "application/json",
      },
      body: formBody,
    }).then((response) => {
      if (response.ok) {
        setShowESign(false);
        setESignPwd("");
        props.raiseAlert("green", "E-signed Successfully!");
        var finalData = {};
        var check = false;
        conf
          .flatMap((f) => f)
          .forEach((ctrl) => {
            if (
              stateConfig.visibleColumns.split(",").includes(ctrl.key) &&
              JSON.parse(ctrl.isRequired) &&
              (data[ctrl.key] === "" || data[ctrl.key] == undefined) &&
              check == false
            ) {
              console.log(ctrl);
              props.raiseAlert("red", "Please fill up " + ctrl.label);
              check = true;
            }
          });
        conf
          .flatMap((f) => f)
          .forEach((ctrl) => {
            if (
              checkConditionalVibility(ctrl) &&
              stateConfig.visibleColumns.split(",").includes(ctrl.key) &&
              data[ctrl.key] != null
            ) {
              finalData[ctrl.key] = data[ctrl.key];
            }
          });
        if (!check) sendEntry(finalData, to);
        return true;
      } else {
        props.raiseAlert("red", "Error while authenticating!");
        return false;
      }
    });
  }

  function submitEntry(to) {
    setShowESign(true);
    setTo(to);
  }

  function sendEntry(finalData, to) {
    let logEntry = {
      id: props.entry.id == -1 ? null : props.entry.id,
      state: to,
      endState: props.form.workflow.states.filter((st) => st.label === to)[0]
        .endState,
      data: finalData,
    };
    console.log(logEntry);
    fetch(config.apiUrl + "entry/" + props.form.id, {
      method: props.entry.id == -1 ? "POST" : "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization:
          "Bearer " + JSON.parse(localStorage.getItem("access")).access_token,
      },
      body: JSON.stringify(logEntry),
    }).then((response) => {
      if (response.ok) {
        console.log("Response ok");

        props.closeInit(props.form);
        props.raiseAlert("green", "Entry submitted!");
      }
    });
  }
  function dataChanged(what, value) {
    console.log("Data changed for " + what + " to " + value);
    setData((prev) => {
      let currData = { ...prev };
      var obj = currData;
      let splitWhat = what.split(".");
      for (var i = 0; i < splitWhat.length - 1; i++) {
        let prop = splitWhat[i];
        obj = obj[prop];
      }
      let finalProp = splitWhat[i];
      obj[finalProp] = value;

      return currData;
    });
  }
  function checkConditionalVibility(controlConf) {
    var check = false;
    if (JSON.parse(controlConf.conditionalVisibility)) {
      let dep = controlConf.conditionalControl
        .toLowerCase()
        .replaceAll(" ", "_");
      let op = controlConf.conditionalCondition;
      let value = controlConf.conditionalValue;
      if (op === "==") return data[dep] === value;
      else if (op === "!=") return data[dep] !== value;
      else if (op === ">") return data[dep] > value;
      else if (op === ">=") return data[dep] >= value;
      else if (op === "<") return data[dep] < value;
      else if (op === "<=") return data[dep] <= value;
    } else {
      return true;
    }
  }
  return (
    <div className="analytics-preview">
      <div className="viz-preview-details">
        <div className="viz-name">{props.form.name}</div>
        <div className="grow"></div>
        <div className="close-icon">
          <i
            className="fa-solid fa-close"
            onClick={() => props.closeInit(false)}
          ></i>
        </div>
      </div>
      <div className="created-container">
        {layout.map((rows, idx) => {
          return (
            <div
              className="created-row"
              // style={{ height: "calc(100%/" + layout.length + ")" }}
            >
              {rows.map((row, inx) => {
                return (
                  <CreatedCell
                    rowId={idx}
                    colId={inx}
                    totalCells={rows.length}
                    conf={
                      viewableColumns.includes(conf[idx][inx].key) &&
                      checkConditionalVibility(conf[idx][inx])
                        ? conf[idx][inx]
                        : {}
                    }
                    key={"1" + idx + "" + inx}
                    disabled={disabledColumns.includes(conf[idx][inx].key)}
                    dataChanged={dataChanged}
                    type={"form"}
                    values={data[conf[idx][inx].key]}
                    value={
                      props.entry.id == -1
                        ? null
                        : props.entry[conf[idx][inx].key]
                    }
                    formData={data}
                  ></CreatedCell>
                );
              })}
            </div>
          );
        })}
        <div className="btn-controls">
          {props.type !== "view" &&
            toStates.map((ts, ind) => (
              <div
                key={ind}
                onClick={() => submitEntry(ts)}
                className="create-btn"
              >
                {ts}
              </div>
            ))}
          <div className="cancel-btn" onClick={() => props.cancel(false)}>
            Cancel
          </div>
        </div>
        <div className={"esign-modal " + (showESign ? " " : " close-flex")}>
          <div className="create-job-header">
            <div className="flex-row-title margin-btm">
              <i class="fa-solid fa-signature new-job-icon"></i>
              <div className="new-job-head">E-Sign</div>
            </div>
            <div className="new-esign-input">
              <div className="new-esign-label">Username</div>
              <div className="new-job-ta">
                <input type="text" value={user} disabled></input>
              </div>
            </div>
            <div className="new-esign-input">
              <div className="new-esign-label">Password</div>
              <div className="new-job-ta">
                <input
                  type="password"
                  value={esignPwd}
                  onChange={(e) => setESignPwd(e.target.value)}
                ></input>
              </div>
            </div>
            <div className="flex-row-title">
              <div className="btn-save" onClick={esign}>
                E-Sign
              </div>
              <div className="btn-cancel" onClick={cancelESign}>
                Cancel
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Form;
