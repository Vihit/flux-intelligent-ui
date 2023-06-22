import { useEffect, useState } from "react";
import "./CreatedGrid.css";
import { config } from "./config";
import Html5QrcodePlugin from "./Html5QrcodeScannerPlugin";
import CreatedCell from "./CreatedCell";

function CreatedGrid(props) {
  const [vals, setVals] = useState([]);
  var values = "";
  const [refData, setRefData] = useState([]);
  const [externalInputActivated, setExternalInputActivated] = useState(false);

  function changed(what, value) {
    setExternalInputActivated(false);
    if (props.type === "form") {
      if (props.conf.type === "checkbox") {
        if (value.checked) {
          let arr = props.values === undefined ? [] : props.values.split(",");
          arr.push(value.value);
          props.dataChanged(what, arr.join(","));
        } else {
          let arr = props.values.split(",");
          arr.splice(arr.indexOf(value.value), 1);
          props.dataChanged(what, arr.join(","));
        }
      } else props.dataChanged(what, value);
    }
  }

  useEffect(() => {
    if (props.conf.referData) {
      let conds = props.conf.referenceFilterQuery;
      if (props.conf.referenceFilterQuery.length > 0) {
        var regex = /\${(\w+)}/g;
        var matches = props.conf.referenceFilterQuery.match(regex);

        matches.forEach((variable) => {
          conds = conds.replace(
            variable,
            props.formData[variable.split(/{|}/)[1]]
          );
        });
      }
      fetchReferenceData(
        props.conf.referenceMaster,
        props.conf.referenceColumn,
        conds
      );
    }
  }, [props.formData]);

  function fetchReferenceData(refForm, refColumn, refCondition) {
    console.log(refCondition);
    fetch(
      config.apiUrl +
        "master/entry/reference/" +
        refForm +
        "/" +
        refColumn +
        "?where=" +
        refCondition,
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
        setRefData((prev) => {
          return actualData
            .map((data) => data.data[refColumn])
            .filter((val, index, arr) => arr.indexOf(val) === index);
        });
        let inputType = props.conf.type;
        if (inputType === "text" || inputType === "textarea") {
          changed(
            props.conf.key,
            actualData
              .map((data) => data.data[refColumn])
              .filter((val, index, arr) => arr.indexOf(val) === index)
              .join(",")
          );
        }
      });
  }

  function activateBarcode(e) {
    console.log(e);
    setExternalInputActivated(true);
  }

  function onNewScanResult(decodedText, decodedResult) {
    console.log(decodedText + "-" + decodedResult);
    changed(props.conf.key, decodedText);
  }

  return (
    <div
      className={
        props.conf.label !== undefined
          ? "created-grid-cell "
          : "empty-created-cell"
      }
    >
      <div className="grid-head">{props.conf.label}</div>
      <div className="grid-controls">
        {[...Array(parseInt(props.conf.numCols)).keys()].map((i, idx) => {
          return (
            <CreatedCell
              rowId={props.rowId}
              colId={idx}
              totalCells={props.conf.numCols}
              showConf={props.showConf}
              conf={props.conf.controls[idx]}
              key={"1" + props.rowId + "" + idx}
              clicked={false}
              vizChosen={props.vizChosen}
              gridControl={true}
            ></CreatedCell>
          );
        })}
        <div className="gr-default-control">
          <div className="filler"></div>
          <div className="delete-gr">
            <i className="fa-solid fa-close"></i>
          </div>
        </div>
      </div>
      <div className="add-new-gr">Add New</div>
    </div>
  );
}

export default CreatedGrid;
