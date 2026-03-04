import { useEffect, useState } from "react";
import CreatedCell from "./CreatedCell";
import "./Form.css";
import { config } from "./config";
import CreatedGrid from "./CreatedGrid";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function Form(props) {
  var obj = {};
  let user = JSON.parse(localStorage.getItem("user"))["sub"];
  const [updateCount, setUpdateCount] = useState(1);
  const [layout, setLayout] = useState(JSON.parse(props.form.template).layout);
  const parsedForm = JSON.parse(props.form.template);
  const fLabels = parsedForm["controls"]
    .flatMap((ctrl) => ctrl)
    .filter((ctrl) => ctrl.type !== "grid")
    .map((c) => c.label);
  const conf = JSON.parse(props.form.template).controls;
  const [to, setTo] = useState("");
  const currState =
    props.entry.id == -1
      ? props.form.workflow.states.filter((st) => st.firstState)[0].name
      : props.entry.state.split("-INPA")[0];
  const [sortedEntries, setSortedEntries] = useState([]);
  const toStates = props.form.workflow.transitions
    .filter(
      (t) =>
        t.fromState.id ==
        props.form.workflow.states.filter((st) => st.name === currState)[0].id,
    )
    .sort((a, b) => a.toState.id - b.toState.id);

  const stateConfig = props.form.workflow.states.filter(
    (st) => st.name === currState,
  )[0];
  const disabledColumns = stateConfig.disabledColumns.split(",");
  const viewableColumns = stateConfig.visibleColumns.split(",");
  const [data, setData] = useState({});
  // const [gridObj, setGridObj] = useState();
  const [showESign, setShowESign] = useState(false);
  const [esignPwd, setESignPwd] = useState("");
  const [esigned, setESigned] = useState(false);
  const [formErrors, setFormErrors] = useState([]);

  useEffect(() => {
    if (props.entry.id != -1) {
      props.entry.grids.forEach((grid) => {
        obj[grid.grid] = grid.data.data.map((data) => data);
      });
    }
    setData(props.entry.id == -1 ? { id: -1 } : { ...props.entry, ...obj });
  }, []);

  function cancelESign() {
    setESignPwd("");
    setShowESign(false);
    setESigned(false);
  }

  function esign() {
    verifyESign();
  }

  function updateFormErrors(data) {
    setFormErrors((prev) => {
      let toBeUpdated = [...prev];
      if (data["isError"]) {
        if (toBeUpdated.filter((d) => d.key === data.key).length == 0) {
          toBeUpdated.push(data);
        }
      } else {
        toBeUpdated = toBeUpdated.filter((d) => d.key !== data.key);
      }
      return toBeUpdated;
    });
  }

  function verifyESign() {
    var formBody = [];
    let userDtl = JSON.parse(localStorage.getItem("user"));
    formBody.push(
      encodeURIComponent("username") + "=" + encodeURIComponent(userDtl["sub"]),
    );
    formBody.push(
      encodeURIComponent("password") + "=" + encodeURIComponent(esignPwd),
    );
    formBody = formBody.join("&");
    let action = props.entry.id == -1 ? "add" : "update";
    fetch(config.apiUrl + "esign", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        username: userDtl["sub"],
        password: esignPwd,
        comment: "",
        entityId: props.form.id,
        entityName: props.form.name,
        entityType: "Form",
        application: "Logever",
        actionDesc:
          userDtl["fullName"] +
          " e-signed to " +
          action +
          " a log for " +
          props.form.name,
      }),
    }).then((response) => {
      if (response.ok) {
        setESigned(true);
        setShowESign(false);
        setESignPwd("");
        props.raiseAlert("green", "E-signed Successfully!");
        checkClickEventAndSend();
      } else {
        props.raiseAlert("red", "Error while authenticating!", 3000);
      }
    });
  }

  function send() {
    var finalData = {};
    var check = false;
    conf
      .flatMap((f) => f)
      .forEach((ctrl) => {
        if (
          stateConfig.visibleColumns.split(",").includes(ctrl.key) &&
          JSON.parse(ctrl.isRequired || ctrl.isRequired == undefined) &&
          (data[ctrl.key] === "" || data[ctrl.key] == undefined) &&
          checkConditionalVisibility(ctrl) &&
          check == false
        ) {
          props.raiseAlert("red", "Please fill up " + ctrl.label, 3000);
          check = true;
        }
        if (
          stateConfig.visibleColumns.split(",").includes(ctrl.key) &&
          ctrl.type === "grid" &&
          data[ctrl.key]?.length > 0
        ) {
          ctrl.controls
            .filter((gCtrl) => gCtrl.isRequired)
            .forEach((gCtrl) => {
              data[ctrl.key].forEach((datum) => {
                if (datum[gCtrl.key] === "" || datum[gCtrl.key] == undefined) {
                  check = true;
                  props.raiseAlert(
                    "red",
                    "Please fill up " + gCtrl.label,
                    3000,
                  );
                }
              });
            });
        }
      });
    conf
      .flatMap((f) => f)
      .forEach((ctrl) => {
        if (
          checkConditionalVisibility(ctrl) &&
          stateConfig.visibleColumns.split(",").includes(ctrl.key) &&
          data[ctrl.key] != null
        ) {
          finalData[ctrl.key] = data[ctrl.key];
        }
      });
    finalData["_files"] = Object.keys(data)
      .filter((k) => k.startsWith("_files_"))
      .map((k) => data[k]);

    let error = formErrors.filter((d) => d.preventSubmission).length > 0;

    if (error) {
      check = true;
      props.raiseAlert(
        "red",
        "Error with : " + formErrors.filter((d) => d.preventSubmission)[0].key,
        5000,
      );
    }
    if (!check) sendEntry(finalData, to);
    else console.log("Check true");
  }

  function checkClickEventAndSend() {
    var stConf = props.form.workflow.states.filter((st) => st.name === to)[0]
      .stConf;
    if (
      stConf == null ||
      stConf == undefined ||
      stConf === "{}" ||
      stConf === "null"
    ) {
      send();
    } else {
      var cnf = JSON.parse(stConf);
      if (cnf["apiCall"]) {
        let url = cnf.apiUrl;
        var reg = /\${(\w+)}/g;
        var matches = url.match(reg);
        if (matches != null)
          matches.forEach((variable) => {
            url = url.replace(variable, data[variable.split(/{|}/)[1]]);
          });
        fetch(config.apiUrl + url, {
          method: cnf.apiMethod,
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization:
              "Bearer " +
              JSON.parse(localStorage.getItem("access")).access_token,
          },
          body: cnf.apiBody,
        })
          .then((response) => {
            if (response.ok) {
              return null;
            } else {
              return response.text();
            }
          })
          .then((actualData) => {
            if (actualData == null) {
              send();
            } else {
              props.raiseAlert(
                "red",
                "Some error occurred : " + actualData,
                5000,
              );
            }
          });
      }
    }
  }

  function prepareFinalDataAndSendEntry(updatedParam) {
    var finalData = {};
    var check = false;
    conf
      .flatMap((f) => f)
      .forEach((ctrl) => {
        if (
          stateConfig.visibleColumns.split(",").includes(ctrl.key) &&
          JSON.parse(ctrl.isRequired || ctrl.isRequired == undefined) &&
          (data[ctrl.key] === "" || data[ctrl.key] == undefined) &&
          checkConditionalVisibility(ctrl) &&
          check == false
        ) {
          props.raiseAlert("red", "Please fill up " + ctrl.label, 3000);
          check = true;
        }
      });
    conf
      .flatMap((f) => f)
      .forEach((ctrl) => {
        if (
          checkConditionalVisibility(ctrl) &&
          stateConfig.visibleColumns.split(",").includes(ctrl.key) &&
          data[ctrl.key] != null
        ) {
          finalData[ctrl.key] = data[ctrl.key];
        }
      });
    finalData = { ...finalData, ...updatedParam };
    let error = formErrors.filter((d) => d.preventSubmission).length > 0;
    if (error) {
      check = true;
      props.raiseAlert(
        "red",
        "Unable to submit. Please resolve error on " +
          formErrors
            .filter((d) => d.preventSubmission)
            .map((d) => d.label)
            .join(","),
        5000,
      );
    }
    if (!check) sendEntry(finalData, currState + "-INPA");
    else console.log("Check true");
  }

  function submitEntry(to) {
    setShowESign(true);
    setTo(to);
  }

  function sendEntry(finalData, to) {
    props.raiseAlert("loading", "start");
    let formData = new FormData();
    finalData["_files"]?.forEach((f) => formData.append("files", f));
    delete finalData["_files"];
    let gridColumns = conf
      .flatMap((f) => f)
      .filter((ctrl) => ctrl.type === "grid")
      .map((ctrl) => ctrl.key);
    let gridData = [];
    let dataWithoutGrids = finalData;
    gridColumns.forEach((col) =>
      gridData.push({ name: col, data: finalData[col] }),
    );
    gridColumns.forEach((col) => delete dataWithoutGrids[col]);
    let logEntry = {
      id: props.entry.id == -1 ? null : props.entry.id,
      state: to,
      endState: to.endsWith("-INPA")
        ? false
        : props.form.workflow.states.filter((st) => st.name === to)[0].endState,
      data: dataWithoutGrids,
      gridData: gridData,
      initiator: props.entry.id == -1 ? null : props.entry.created_by,
    };

    formData.append("body", JSON.stringify(logEntry));

    // formData.append("files", finalData["_files"]);
    fetch(config.apiUrl + "entry/" + props.form.id, {
      method: props.entry.id == -1 ? "POST" : "PUT",
      headers: {
        // "Content-Type": "multipart/form-data",
        Accept: "multipart/form-data",
        Authorization:
          "Bearer " + JSON.parse(localStorage.getItem("access")).access_token,
      },
      body: formData,
    }).then((response) => {
      if (response.ok) {
        props.setUpdate(Math.random() * Math.random() * 100);
        props.raiseAlert("loading", "end");
        props.closeInit(props.form);
        props.raiseAlert("green", "Entry submitted!");
      } else {
        props.raiseAlert("red", "Some error occurred!", 3000);
        props.raiseAlert("loading", "end");
      }
    });
  }

  function dataChanged(what, value) {
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
      var controls = conf.flatMap((f) => f);
      controls.forEach((ctrl) => {
        if (!checkConditionalVisibilityAgainst(ctrl, obj, controls)) {
          delete obj[ctrl.key];
        } else if (checkDependency(ctrl, finalProp)) {
          delete obj[ctrl.key];
        }
      });
      return currData;
    });
    setUpdateCount((prev) => prev + 1);
  }
  function pressedKey(e) {
    if (e.key === "Enter") {
      esign();
    }
  }
  function checkDependency(of, on) {
    if (of.referData != undefined && JSON.parse(of.referData)) {
      var refQuery = of.referenceFilterQuery;
      var reg = /\${(\w+)}/g;
      var matches = refQuery.match(reg);
      if (matches != null) {
        return matches.map((match) => match.split(/{|}/)[1]).includes(on);
      }
    } else if (of.referApi != undefined && JSON.parse(of.referApi)) {
      var apiDetail = of.apiUrl + " " + of.apiBody;
      var reg = /\${(\w+)}/g;
      var matches = apiDetail.match(reg);
      if (matches != null) {
        return matches.map((match) => match.split(/{|}/)[1]).includes(on);
      }
    }
    return false;
  }
  function checkConditionalVisibility(controlConf) {
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
      else if (op === "in") return value.split(",").includes(data[dep]);
    } else {
      return true;
    }
  }

  function checkConditionalVisibilityAgainst(controlConf, updData, controls) {
    var check = false;
    return (
      controls
        .filter((c) => c.key === controlConf.key)
        .filter((controlConf) => {
          if (JSON.parse(controlConf.conditionalVisibility)) {
            let dep = controlConf.conditionalControl
              .toLowerCase()
              .replaceAll(" ", "_");
            let op = controlConf.conditionalCondition;
            let value = controlConf.conditionalValue;
            if (op === "==") return updData[dep] === value;
            else if (op === "!=") return updData[dep] !== value;
            else if (op === ">") return updData[dep] > value;
            else if (op === ">=") return updData[dep] >= value;
            else if (op === "<") return updData[dep] < value;
            else if (op === "<=") return updData[dep] <= value;
            else if (op === "in")
              return value.split(",").includes(updData[dep]);
          } else {
            return true;
          }
        }).length > 0
    );
  }

  async function exportToPDF() {
    let sortedEntries = await props.entries
      .filter((entry) => !entry.data["state"].endsWith("-INPA"))
      .sort(function (a, b) {
        return new Date(a.data.log_create_dt) - new Date(b.data.log_create_dt);
      });

    const doc = new jsPDF();

    doc.rect(0, 0, 210, 20, "F", [204, 204, 204]);
    var img = new Image();
    img.src = "delogo1.png";
    doc.addImage(img, "png", 10, 2, 20, 15);
    doc.setTextColor("#00ADB5");
    doc.text(` ${props.form.name}`, 100, 12, { maxWidth: 80 });
    var client_logo = new Image();
    client_logo.src = "client-logo.png";
    doc.rect(189, 0, 25, 20, "F", "#fff");
    doc.addImage(client_logo, "png", 190, 2, 20, 15);
    doc.setTextColor(0, 0, 0);
    let finalY = doc.lastAutoTable.finalY || 30;
    var pageHeight = doc.internal.pageSize.getHeight();
    finalY += 10;

    let updatedData = {};

    for (let label of fLabels) {
      let actual_key = label.toLowerCase().replaceAll(" ", "_");
      updatedData[label] = data[actual_key];
    }
    let keys = Object.keys(updatedData);

    keys.forEach((key, index) => {
      if (index % 4 === 0) {
        let lastIndex = index + 4;
        if (lastIndex >= keys.length) {
          lastIndex = keys.length;
        }
        autoTable(doc, {
          head: [Object.keys(updatedData).slice(index, lastIndex)],
          body: [Object.values(updatedData).slice(index, lastIndex)],
          startY: finalY,
          theme: "grid",
          styles: {
            overflow: "linebreak",
            align: "left",
          },
          headStyles: {
            fillColor: [255, 255, 255],
            textColor: [0, 0, 0],
            lineColor: [128, 128, 128],
            lineWidth: 0.1,
          },
        });
        finalY = doc.lastAutoTable.finalY || 30;
        finalY += 5;
      }
    });
    doc.setFontSize(10);
    var currentFont = "helvetica";
    sortedEntries.forEach((entry) => {
      entry = entry["data"];

      finalY = finalY + 10;
      if (finalY > pageHeight) {
        doc.addPage();
        finalY = 20;
      }
      doc
        .setFont(currentFont, "bold")
        .text(`${entry["state"]} by : `, 14, finalY);
      doc.setTextColor("#FF0000");
      doc
        .setFont(currentFont, "normal ")
        .text(
          `${entry["created_by"]} on ${entry["log_create_dt"]}`,
          entry["state"].length + 50,
          finalY,
          { textColor: [255, 0, 0] },
        );
      doc.setTextColor("#000000");
    });

    var file_name =
      "Form Entry_" +
      props.form.name.replaceAll(" ", "_") +
      "_" +
      data.id +
      ".pdf";

    doc.save(file_name);
  }
  return (
    <div className="analytics-preview">
      <div className="viz-preview-details">
        <div className="viz-name big-font">{props.form.name}</div>
        <div className="grow"></div>
        {props.type === "view" && (
          <div className="download-btn" onClick={exportToPDF}>
            Download
          </div>
        )}
        <div className="close-icon">
          <i
            className="fa-solid fa-close"
            onClick={() => props.closeInit(props.form)}
          ></i>
        </div>
      </div>
      <div className="created-container">
        {Object.keys(data).length > 0 &&
          layout.map((rows, idx) => {
            return (
              <div
                key={idx}
                className={
                  rows.filter(
                    (row, inx) =>
                      !(
                        viewableColumns.includes(conf[idx][inx].key) &&
                        checkConditionalVisibility(conf[idx][inx])
                      ),
                  ).length == rows.length
                    ? "close-flex"
                    : "created-row"
                }
                // style={{ height: "calc(100%/" + layout.length + ")" }}
              >
                {rows.map((row, inx) => {
                  return row == 0 ? (
                    <CreatedCell
                      rowId={idx}
                      colId={inx}
                      totalCells={rows.length}
                      conf={
                        viewableColumns.includes(conf[idx][inx].key) &&
                        checkConditionalVisibility(conf[idx][inx])
                          ? conf[idx][inx]
                          : {}
                      }
                      key={"1" + idx + "" + inx}
                      disabled={
                        disabledColumns.includes(conf[idx][inx].key) ||
                        props.type === "view" ||
                        showESign
                      }
                      dataChanged={dataChanged}
                      type={"form"}
                      values={data[conf[idx][inx].key]}
                      value={
                        props.entry.id == -1
                          ? null
                          : props.entry[conf[idx][inx].key]
                      }
                      formData={data}
                      dataUpdated={updateCount}
                      sendEntry={prepareFinalDataAndSendEntry}
                      formId={props.form.id}
                      updateFormErrors={updateFormErrors}
                      formErrors={formErrors}
                      raiseAlert={props.raiseAlert}
                    ></CreatedCell>
                  ) : (
                    <CreatedGrid
                      dataChanged={dataChanged}
                      rowId={idx}
                      colId={inx}
                      totalCells={rows.length}
                      values={
                        props.entry.id == -1 &&
                        data[conf[idx][inx].key] == undefined
                          ? [{}]
                          : data[conf[idx][inx].key]
                        // props.entry.grids.filter(
                        //     (g) => g.grid === conf[idx][inx].key
                        //   )[0].data
                      }
                      disabled={disabledColumns.includes(conf[idx][inx].key)}
                      conf={
                        viewableColumns.includes(conf[idx][inx].key) &&
                        checkConditionalVisibility(conf[idx][inx])
                          ? conf[idx][inx]
                          : {}
                      }
                      key={"1" + idx + "" + inx}
                      type="form"
                      formData={data}
                      dataUpdated={updateCount}
                      sendEntry={prepareFinalDataAndSendEntry}
                      formId={props.form.id}
                      updateFormErrors={updateFormErrors}
                      formErrors={formErrors}
                      raiseAlert={props.raiseAlert}
                    ></CreatedGrid>
                  );
                })}
              </div>
            );
          })}
        <div className="btn-controls">
          {((props.type !== "view" && props.type !== "view-all") ||
            props.form.type === "master") &&
            toStates
              .filter((t) => {
                return (
                  t.toState.stateCondition == undefined ||
                  t.toState.stateCondition == null ||
                  t.toState.stateCondition === "" ||
                  eval(t.toState.stateCondition)
                );
              })
              // .map((t) => t.toState.label)
              .map((ts, ind) => (
                <div
                  key={ind}
                  onClick={() => submitEntry(ts.toState.name)}
                  className="create-btn"
                >
                  {ts.toState.label}
                </div>
              ))}
          <div className="cancel-btn" onClick={() => props.cancel(false)}>
            Cancel
          </div>
        </div>
      </div>
      <div className={"esign-modal " + (showESign ? " " : " close-flex")}>
        <div className="create-job-header">
          <div className="flex-row-title margin-btm">
            <i className="fa-solid fa-signature new-job-icon"></i>
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
                onKeyDown={(e) => pressedKey(e)}
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
  );
}

export default Form;
