import { useEffect, useState } from "react";
import "./CreatedCell.css";
import { config } from "./config";
import Html5QrcodePlugin from "./Html5QrcodeScannerPlugin";

function CreatedCell(props) {
  console.log(props);
  const [vals, setVals] = useState([]);
  var values = "";
  const [refData, setRefData] = useState([]);
  const [externalInputActivated, setExternalInputActivated] = useState(false);

  function changed(what, value) {
    if (value != undefined && value !== props.values) {
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
        } else {
          props.dataChanged(what, value);
        }
      }
    }
  }

  function handleButtonClick(what) {
    let updatedValue = props.values == undefined ? "1" : props.values + "1";
    var obj = {};
    obj[what] = updatedValue;
    if (props.conf.apiCall) {
      let url = props.conf.apiUrl;
      console.log(url);
      var reg = /\${(\w+)}/g;
      var matches = url.match(reg);
      console.log(matches);
      matches.forEach((variable) => {
        url = url.replace(variable, props.formData[variable.split(/{|}/)[1]]);
      });
      fetch(config.apiUrl + url, {
        method: props.conf.apiMethod,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization:
            "Bearer " + JSON.parse(localStorage.getItem("access")).access_token,
        },
        body: props.conf.apiBody,
      }).then((response) => {
        if (response.ok) {
          props.dataChanged(what, updatedValue);
          if (props.conf.sendToDraftState) {
            props.sendEntry(obj);
          }
        }
      });
    } else {
      props.dataChanged(what, updatedValue);
      if (props.conf.sendToDraftState) {
        props.sendEntry(obj);
      }
    }
  }

  useEffect(() => {
    if (props.conf.referData) {
      let conds = props.conf.referenceFilterQuery;
      if (props.conf.referenceFilterQuery.length > 0) {
        console.log(props.conf.referenceFilterQuery);
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
  }, [props.dataUpdated]);

  function fetchReferenceData(refForm, refColumn, refCondition) {
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
          ? props.gridControl
            ? props.rowNum > 0
              ? "grid-creation-cell-wh"
              : "grid-creation-cell "
            : "created-cell "
          : "empty-created-cell"
      }
    >
      <div
        className={
          "cell-name " +
          (props.rowNum > 0 || props.conf.type === "button" ? "close-flex" : "")
        }
      >
        <div>
          {props.conf.label}
          {props.conf.isRequired && <span style={{ color: "red" }}> *</span>}
        </div>
      </div>
      <div className="cell-control">
        {props.conf.type === "text" && (
          <input
            type="text"
            placeholder={props.conf.placeholder}
            value={props.values}
            disabled={props.disabled}
            onChange={(e) => changed(props.conf.key, e.target.value)}
          ></input>
        )}
        {props.conf.type === "select" && (
          <select
            placeholder={props.conf.placeholder}
            value={props.values}
            disabled={props.disabled}
            onChange={(e) => changed(props.conf.key, e.target.value)}
          >
            <option value="">Select</option>
            {props.conf.referData
              ? refData.map((value, indx) => {
                  return (
                    <option key={indx} value={value}>
                      {value}
                    </option>
                  );
                })
              : props.conf.selectValues.split(",").map((value, indx) => {
                  return (
                    <option key={indx} value={value}>
                      {value}
                    </option>
                  );
                })}
          </select>
        )}
        {props.conf.type === "textarea" && (
          <textarea
            placeholder={props.conf.placeholder}
            value={props.values}
            disabled={props.disabled}
            onChange={(e) => changed(props.conf.key, e.target.value)}
          ></textarea>
        )}
        {props.conf.type === "radio" &&
          props.conf.selectValues.split(",").map((sV, ind) => {
            return (
              <div
                className="r-group"
                style={{
                  width: 98 / props.conf.selectValues.split(",").length + "%",
                }}
              >
                <div className="r-label">{sV}</div>
                <div className="r-r">
                  <input
                    type="radio"
                    placeholder={props.conf.placeholder}
                    value={sV}
                    name={props.conf.key}
                    disabled={props.disabled}
                    onChange={(e) => changed(props.conf.key, e.target.value)}
                    checked={
                      props.values != undefined ? props.values === sV : false
                    }
                  ></input>
                </div>
              </div>
            );
          })}
        {props.conf.type === "checkbox" &&
          props.conf.selectValues.split(",").map((sV, ind) => {
            return (
              <div
                className="r-group"
                style={{
                  width: 98 / props.conf.selectValues.split(",").length + "%",
                }}
              >
                <div className="r-label">{sV}</div>
                <div className="r-r">
                  <input
                    type="checkbox"
                    value={sV}
                    disabled={props.disabled}
                    onChange={(e) => changed(props.conf.key, e.target)}
                    checked={
                      props.values != undefined
                        ? props.values.split(",").includes(sV)
                        : false
                    }
                  ></input>
                </div>
              </div>
            );
          })}
        {props.conf.type === "barcode" && (
          <input
            type="text"
            placeholder={props.conf.placeholder}
            value={props.values}
            disabled={props.disabled}
            onFocus={(e) => activateBarcode(e)}
          ></input>
        )}
        {props.conf.type === "barcode" && externalInputActivated && (
          <div className="scanner">
            <Html5QrcodePlugin
              fps={10}
              qrbox={250}
              disableFlip={false}
              qrCodeSuccessCallback={onNewScanResult}
            />
          </div>
        )}
        {props.conf.type === "datetime" && (
          <input
            type="datetime-local"
            placeholder={props.conf.placeholder}
            value={props.values}
            disabled={props.disabled}
            onChange={(e) => changed(props.conf.key, e.target.value)}
          ></input>
        )}
        {props.conf.type === "button" && (
          <button
            className="f-btn-active"
            style={{
              color: props.conf.fontColor,
              background: props.conf.color,
            }}
            onClick={(e) => handleButtonClick(props.conf.key)}
          >
            {props.conf.label}
          </button>
        )}
      </div>
    </div>
  );
}

export default CreatedCell;
