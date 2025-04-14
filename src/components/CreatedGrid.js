import { useEffect, useState } from "react";
import "./CreatedGrid.css";
import { config } from "./config";
import Html5QrcodePlugin from "./Html5QrcodeScannerPlugin";
import CreatedCell from "./CreatedCell";

function CreatedGrid(props) {
  const [showHistoryTab, setShowHistoryTab] = useState(false);
  const [histories, setHistories] = useState([]);

  const gridRowDetails = getMessages();
  const gridRowDeleteDisabled = getDisabledRows();

  function checkConditionalVisibility(row, col) {
    let controlConf = props.conf.controls[col];
    let rowData =
      props.formData == null || props.formData[props.conf.key] == undefined
        ? {}
        : props.formData[props.conf.key][row];
    var check = false;
    if (JSON.parse(controlConf.conditionalVisibility)) {
      let dep = controlConf.conditionalControl
        .toLowerCase()
        .replaceAll(" ", "_");
      let op = controlConf.conditionalCondition;
      let value = controlConf.conditionalValue;
      if (op === "==") return rowData[dep] === value;
      else if (op === "!=") return rowData[dep] !== value;
      else if (op === ">") return rowData[dep] > value;
      else if (op === ">=") return rowData[dep] >= value;
      else if (op === "<") return rowData[dep] < value;
      else if (op === "<=") return rowData[dep] <= value;
      else if (op === "in") return value.split(",").includes(rowData[dep]);
    } else {
      return true;
    }
    return true;
  }

  function changed(index, what, value) {
    let gridKey = props.conf.key;
    if (props.type === "form") {
      // props.dataChanged(what, value);
      var gridData = props.formData[gridKey];
      if (gridData == undefined || gridData.length == 0) {
        gridData = [];
      }
      while (gridData.length - 1 < index) {
        gridData.push({});
      }
      let obj = gridData[index];
      if (what != null) obj[what] = value;
      gridData.splice(index, 1, obj);
      props.dataChanged(gridKey, gridData);
    }
    // setUpdateCount((prev) => prev + 1);
  }

  function deleteRow(indx) {
    var gridData = props.formData[props.conf.key];
    if (indx >= 0) {
      gridData.splice(indx, 1);
      props.dataChanged(props.conf.key, gridData);
    }
  }

  function showHistory(indx) {
    var gridData = props.formData[props.conf.key];
    fetchHistory(gridData[indx]);
    setShowHistoryTab(true);
  }

  function fetchHistory(grData) {
    props.raiseAlert("loading", "start");
    var where = props.conf.historyBasedOn
      .split(",")
      .map((c) => c + "='" + grData[c] + "'");
    where.push("1=1");

    fetch(
      config.apiUrl +
        "entry/grid/" +
        props.formId +
        "/?logEntryId=" +
        props.formData.id +
        "&numPrevHistory=" +
        props.conf.numPrevHistory +
        "&gridKey=" +
        props.conf.key +
        "&where=" +
        where.join(" and "),
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization:
            "Bearer " + JSON.parse(localStorage.getItem("access")).access_token,
        },
      }
    )
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
      })
      .then((actualData) => {
        const uniqueKeys = props.conf.uniqueHistoryColumns?.split(",");
        const uData = removeConsecutiveDuplicates(actualData.data, uniqueKeys);
        setHistories(
          uData.map((d) => {
            var stmt = props.conf.historyFormat;
            return transformStringToJSX(stmt, d);
          })
        );
        props.raiseAlert("loading", "end");
      });
  }

  const removeConsecutiveDuplicates = (data, uniqueKeys) => {
    if (uniqueKeys == undefined || uniqueKeys.length === 0) return data; // No uniqueness constraints, return original list

    const seen = new Set();
    const result = [];

    // Traverse from last to first
    for (let i = data.length - 1; i >= 0; i--) {
      const key = uniqueKeys.map((k) => data[i][k]).join("-");

      if (!seen.has(key)) {
        seen.add(key);
        result.push(data[i]);
      }
    }

    return result.reverse(); // Reverse back to maintain original order
  };

  const transformStringToJSX = (template, values) => {
    return template.split(/(\$\{\w+\})/g).map((part, index) => {
      if (part.match(/\$\{(\w+)\}/)) {
        const key = part.replace(/\$\{|\}/g, "");
        return (
          <span
            key={index}
            style={{
              backgroundColor: config.borderColors[index],
              padding: "0 1rem",
            }}
          >
            {values[key]}
          </span>
        );
      }
      return part;
    });
  };

  function getMessages() {
    let data =
      props.formData[props.conf.key] != undefined
        ? [...props.formData[props.conf.key]]
        : [];
    if (props.conf.gridRowDetailFormat?.length > 0) {
      var msg = props.conf.gridRowDetailFormat;
      var msgs = [...Array(props.values.length).keys()].map((a, i) => msg);
      var reg = /\${(\w+)}/g;
      var matches = msg.match(reg);
      if (matches != null)
        matches.forEach((variable) => {
          data.forEach((d, i) => {
            msgs[i] = msgs[i].replace(
              variable,
              data[i][variable.split(/{|}/)[1]]
            );
          });
        });

      return msgs;
    } else {
      return [];
    }
  }

  function getDisabledRows() {
    let dataa =
      props.formData[props.conf.key] != undefined
        ? [...props.formData[props.conf.key]]
        : [];
    var gridRowDisabledLogic = props.conf.disableRowLogic;
    var gridRowStats = [...Array(props.values.length).keys()].map((a, i) => {
      if (props.values[i]["id"] > 0) {
        let data = dataa[i];
        data["state"] = props.formData["state"];
        return eval(gridRowDisabledLogic);
      } else {
        return false;
      }
    });

    return gridRowStats;
  }

  useEffect(() => {}, []);

  function addRow() {
    changed(props.values.length, null, null);
  }
  return (
    <div
      className={
        props.conf.label !== undefined
          ? "created-grid-cell "
          : "empty-created-cell"
      }
    >
      {Object.keys(props.conf).length > 0 && (
        <div className="grid-head">{props.conf.label}</div>
      )}
      {Object.keys(props.conf).length > 0 &&
        props.values != undefined &&
        [...Array(props.values.length).keys()].map((j, inx) => {
          return (
            <>
              <div className="grid-controls" key={inx}>
                {(!props.disabled || props.conf.showHistory) && (
                  <div
                    className={
                      j > 0 ? "grid-creation-cell-wh" : "grid-creation-cell "
                    }
                    style={{
                      flexGrow: "0",
                      minWidth: "2.5rem",
                      width: "auto",
                      background: "none",
                    }}
                  >
                    <div className="cell-name-grid"></div>
                    <div className="gr-default-control">
                      {/* {!props.disabled && j == 0 && (
                        <div className="filler"></div>
                      )} */}
                      {props.conf.showHistory && (
                        <div
                          className="history-gr"
                          onClick={() => showHistory(j)}
                        >
                          <i className="fa-solid fa-history"></i>
                        </div>
                      )}
                      {!props.disabled && !gridRowDeleteDisabled[inx] && (
                        <div className="delete-gr" onClick={() => deleteRow(j)}>
                          <i className="fa-solid fa-close"></i>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {[...Array(parseInt(props.conf.numCols)).keys()].map(
                  (i, idx) => {
                    return (
                      <CreatedCell
                        rowId={props.rowId}
                        colId={idx}
                        totalCells={props.conf.numCols}
                        showConf={props.showConf}
                        conf={
                          checkConditionalVisibility(inx, idx)
                            ? props.conf.controls[idx]
                            : {}
                        }
                        key={"11" + props.rowId + "" + idx}
                        clicked={false}
                        vizChosen={props.vizChosen}
                        gridControl={true}
                        dataChanged={(a, b) => changed(j, a, b)}
                        formData={props.formData}
                        type={props.type}
                        rowNum={j}
                        disabled={props.disabled}
                        values={
                          props.formData == null ||
                          props.formData[props.conf.key] == undefined
                            ? null
                            : props.formData[props.conf.key][inx][
                                props.conf.controls[idx].key
                              ]
                        }
                        sendEntry={props.sendEntry}
                        gridKey={props.conf.key}
                        dataUpdated={props.dataUpdated}
                        formId={props.formId}
                        updateFormErrors={props.updateFormErrors}
                        raiseAlert={props.raiseAlert}
                        formErrors={props.formErrors}
                      ></CreatedCell>
                    );
                  }
                )}
              </div>
              {props.values[inx]["id"] > 0 &&
                props.conf.gridRowDetailFormat?.length > 0 && (
                  <div className="grid-row-detail">{gridRowDetails[inx]}</div>
                )}
            </>
          );
        })}
      {!props.disabled && (
        <div className="add-new-gr" onClick={addRow}>
          Add New
        </div>
      )}
      {showHistoryTab && (
        <div className="history-tab">
          <div className="h-hdr">{props.conf.label + " history"}</div>
          <div
            className="h-close"
            onClick={() => {
              setShowHistoryTab(false);
              setHistories([]);
            }}
          >
            <i className="fa-solid fa-close"></i>
          </div>
          <div className="h-content">
            {histories.map((h, i) => (
              <div key={i} className="h-msg">
                {h}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default CreatedGrid;
