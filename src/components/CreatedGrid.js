import { useEffect, useState } from "react";
import "./CreatedGrid.css";
import { config } from "./config";
import Html5QrcodePlugin from "./Html5QrcodeScannerPlugin";
import CreatedCell from "./CreatedCell";

function CreatedGrid(props) {
  // console.log(props);
  const [vals, setVals] = useState([]);
  var values = "";
  const [refData, setRefData] = useState([]);
  const [externalInputActivated, setExternalInputActivated] = useState(false);
  const [gridRows, setGridRows] = useState(
    props.values != null ? props.values.length : 1
  );
  const [updateCount, setUpdateCount] = useState(1);

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
      if (gridData.length - 1 < index) {
        gridData.push({});
      }
      let obj = gridData[index];
      obj[what] = value;
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
            <div className="grid-controls" key={inx}>
              {[...Array(parseInt(props.conf.numCols)).keys()].map((i, idx) => {
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
                      // props.values == null || props.values[inx] == null
                      //   ? null
                      //   : props.values[inx].data[props.conf.controls[idx].key]
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
                    raiseAlert={props.raiseAlert}
                  ></CreatedCell>
                );
              })}
              {!props.disabled && (
                <div className="gr-default-control">
                  {j == 0 && <div className="filler"></div>}
                  <div className="delete-gr" onClick={() => deleteRow(j)}>
                    <i className="fa-solid fa-close"></i>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      {!props.disabled && (
        <div className="add-new-gr" onClick={addRow}>
          Add New
        </div>
      )}
    </div>
  );
}

export default CreatedGrid;
