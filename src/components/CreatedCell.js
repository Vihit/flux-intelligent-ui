import { useEffect, useState } from "react";
import "./CreatedCell.css";
import { config } from "./config";
import Html5QrcodePlugin from "./Html5QrcodeScannerPlugin";
import Multiselect from "multiselect-react-dropdown";

function CreatedCell(props) {
  const now = new Date();
  const dateMax =
    props.conf.dateMaxValue != undefined &&
    props.conf.dateMaxValue != null &&
    props.conf.dateMaxValue != ""
      ? new Date(
          now.getTime() +
            props.conf.dateMaxValue * 24 * 60 * 60 * 1000 -
            now.getTimezoneOffset() * 60000
        )
          .toISOString()
          .substring(0, 19)
      : null;
  const dateMin =
    props.conf.dateMinValue != undefined &&
    props.conf.dateMinValue != null &&
    props.conf.dateMinValue != ""
      ? new Date(now.getTime() - now.getTimezoneOffset() * 60000)
          .toISOString()
          .substring(0, 19)
      : null;
  const [vals, setVals] = useState([]);
  var values = "";
  const [refData, setRefData] = useState([]);
  const [refMulData, setRefMulData] = useState({ selected: [], all: [] });
  const [externalInputActivated, setExternalInputActivated] = useState(false);
  const [accessibleData, setAccessibleData] = useState(
    props.gridControl
      ? props.formData[props.gridKey] != undefined
        ? props.formData[props.gridKey][props.rowNum]
        : {}
      : props.formData
  );
  const [usersData, setUsersData] = useState([]);
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
          if (props.conf.type === "datetime") {
            const cVal = value;
            var fVal = "";
            if (cVal >= dateMin && cVal <= dateMax) {
              fVal = cVal;
            } else if (cVal < dateMin) {
              props.raiseAlert("red", "Minimum date could be " + dateMin, 3000);
              fVal = dateMin;
            } else {
              props.raiseAlert("red", "Maximum date could be " + dateMax, 3000);
              fVal = dateMax;
            }
            props.dataChanged(what, fVal);
          } else {
            props.dataChanged(what, value);
          }
        }
      }
    }
  }

  function downloadAttachment() {
    fetch(
      config.apiUrl +
        "attachment/" +
        props.formId +
        "/" +
        props.formData.id +
        "/" +
        props.values,
      {
        method: "GET",
        headers: {
          Authorization:
            "Bearer " + JSON.parse(localStorage.getItem("access")).access_token,
        },
      }
    )
      .then((response) => {
        return response.blob();
      })
      .then((blob) => {
        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", props.values);

        document.body.appendChild(link);

        link.click();

        link.parentNode.removeChild(link);
      });
  }

  function handleButtonClick(what) {
    let updatedValue =
      props.values == undefined ||
      props.values == null ||
      props.values === "null"
        ? "1"
        : props.values + "1";
    var obj = {};
    obj[what] = updatedValue;
    if (props.conf.apiCall) {
      let url = props.conf.apiUrl;
      var reg = /\${(\w+)}/g;
      var matches = url.match(reg);
      if (matches != null)
        matches.forEach((variable) => {
          url = url.replace(variable, accessibleData[variable.split(/{|}/)[1]]);
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
            const timer = setTimeout(() => {
              props.sendEntry(obj);
            }, 1000);
            // clearTimeout(timer);
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

  function fetchUsersData() {
    fetch(config.apiUrl + "users/", {
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
        setUsersData((prev) => {
          return actualData
            .filter((aD) => aD["username"] !== "admin")
            .map((d) => {
              return {
                userName: d.username,
                firstName: d.first_name,
                lastName: d.last_name,
                employeeCode: d.employee_code,
                userID: d.user_id,
                email: d.email,
                department: d.department.name,
                reporting_manager: d.reporting_manager,
                windowsID: d.windows_id,
                hireDate: d.hire_date,
                designation: d.designation,
                fullName: d.fullName,
              };
            });
        });
      });
  }
  useEffect(() => {
    let aData = props.gridControl
      ? props.formData[props.gridKey] != undefined
        ? props.formData[props.gridKey][props.rowNum]
        : {}
      : props.formData;
    setAccessibleData(
      props.gridControl
        ? props.formData[props.gridKey] != undefined
          ? props.formData[props.gridKey][props.rowNum]
          : {}
        : props.formData
    );
    if (props.conf.referData && !props.disabled) {
      var check = false;
      let conds = props.conf.referenceFilterQuery;
      if (props.conf.referenceFilterQuery.length > 0) {
        var regex = /\${(\w+)}/g;
        var matches = props.conf.referenceFilterQuery.match(regex);
        if (matches != null) {
          matches.forEach((variable) => {
            if (
              aData[variable.split(/{|}/)[1]] == undefined ||
              aData[variable.split(/{|}/)[1]] === ""
            ) {
              check = true;
            }
            conds = conds.replace(variable, aData[variable.split(/{|}/)[1]]);
          });
        }
      }
      if (!check)
        fetchReferenceData(
          props.conf.referenceMaster,
          props.conf.referenceColumn,
          conds
        );
    }
    if (props.conf.referApi && !props.disabled) {
      let url = props.conf.apiUrl;
      var reg = /\${(\w+)}/g;
      var matches = url.match(reg);
      if (matches != null)
        matches.forEach((variable) => {
          url = url.replace(variable, aData[variable.split(/{|}/)[1]]);
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
      })
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else {
            return [];
          }
        })
        .then((actualData) => {
          if (props.conf.type === "multiselect" && actualData != []) {
            setRefMulData(actualData);
          } else if (props.conf.type === "text") {
            const arr = [];
            arr.push(actualData.value);
            changed(props.conf.key, actualData.value);
            setRefData((prev) => {
              return arr;
            });
          } else if (actualData != [])
            setRefData((prev) => {
              return actualData.map((d) => d.split("|")[0]);
            });
        });
    }
    if (props.conf.type === "user" && !props.disabled) {
      changed(
        props.conf.key,
        JSON.parse(localStorage.getItem("user"))[
          props.conf.userDetail === "username" ? "sub" : props.conf.userDetail
        ]
      );
    }
    if (props.conf.type === "all-users" && !props.disabled) {
      fetchUsersData();
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
          var ad = actualData
            .map((data) => data.data[refColumn])
            .filter((val, index, arr) => arr.indexOf(val) === index);
          ad.sort(function (a, b) {
            return a.toLowerCase().localeCompare(b.toLowerCase());
          });
          return ad;
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
    setExternalInputActivated(true);
  }

  function onNewScanResult(decodedText, decodedResult) {
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
          (props.gridControl
            ? props.conf.type === "button" && props.rowNum > 0
              ? "close-flex "
              : "cell-name-grid "
            : "cell-name ") + (props.rowNum > 0 ? "" : "")
        }
      >
        {props.conf.type !== "button" && (
          <div className={props.rowNum > 0 ? "hidden-header" : ""}>
            {props.conf.label}
            {props.conf.isRequired && <span style={{ color: "red" }}> *</span>}
          </div>
        )}
      </div>
      <div className="cell-control">
        {props.conf.type === "text" && (
          <input
            type="text"
            placeholder={props.conf.placeholder}
            value={
              props.conf.referApi && !props.disabled ? refData[0] : props.values
            }
            disabled={props.disabled}
            onChange={(e) => changed(props.conf.key, e.target.value)}
          ></input>
        )}
        {props.conf.type === "select" && !props.disabled && (
          <select
            placeholder={props.conf.placeholder}
            value={props.values == null ? "" : props.values}
            disabled={props.disabled}
            onChange={(e) => changed(props.conf.key, e.target.value)}
          >
            <option value="">Select</option>
            {props.conf.referData || props.conf.referApi
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
        {props.conf.type === "select" && props.disabled && (
          <input
            type="text"
            placeholder={props.conf.placeholder}
            value={props.values}
            disabled={props.disabled}
            onChange={(e) => changed(props.conf.key, e.target.value)}
          ></input>
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
            id={props.conf.key}
            type="datetime-local"
            value={
              (props.values == undefined || props.values == null) &&
              props.conf.dateDefaultValue != ""
                ? props.conf.dateDefaultValue === "sysdate"
                  ? new Date(now.getTime() - now.getTimezoneOffset() * 60000)
                      .toISOString()
                      .substring(0, 19)
                  : new Date(now.getTime() - now.getTimezoneOffset() * 60000)
                      .toISOString()
                      .substring(0, 19)
                : props.values
            }
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
            disabled={props.disabled}
          >
            {props.conf.label}
          </button>
        )}
        {props.conf.type === "user" && (
          <input
            type="text"
            placeholder={props.conf.placeholder}
            value={props.values}
            disabled
            onChange={(e) => changed(props.conf.key, e.target.value)}
          ></input>
        )}
        {props.conf.type === "all-users" && !props.disabled && (
          <Multiselect
            style={config.multiSelectStyle}
            disabled={props.disabled}
            onSelect={(e) => {
              changed(
                props.conf.key,
                e[0][
                  props.conf.allUserKey === ""
                    ? "userName"
                    : props.conf.allUserKey
                ]
              );
            }}
            onRemove={(e) => changed(props.conf.key, "")}
            selectedValues={
              props.values != undefined
                ? usersData.filter(
                    (user) =>
                      user[
                        props.conf.allUserKey === ""
                          ? "userName"
                          : props.conf.allUserKey
                      ] === props.values.split(",")[0]
                  )
                : []
            }
            options={usersData}
            displayValue={
              props.conf.allUserValue === "" ||
              props.conf.allUserValue == undefined
                ? "firstName"
                : props.conf.allUserValue.split(",")[0]
            }
            // singleSelect={true}
            selectionLimit={1}
          ></Multiselect>
        )}
        {props.conf.type === "all-users" && props.disabled && (
          <input
            type="text"
            placeholder={props.conf.placeholder}
            value={props.values}
            disabled={props.disabled}
            onChange={(e) => changed(props.conf.key, e.target.value)}
          ></input>
        )}
        {props.conf.type === "multiselect" &&
          !props.disabled &&
          (props.conf.referData || props.conf.referApi ? (
            <Multiselect
              style={config.multiSelectStyle}
              disabled={props.disabled}
              onSelect={(e) => {
                changed(props.conf.key, e.join(","));
              }}
              onRemove={(e) => changed(props.conf.key, e.join(","))}
              selectedValues={
                props.values == undefined
                  ? refMulData.selected
                  : props.values != null && props.values.length > 0
                  ? props.values.split(",")
                  : ""
              }
              isObject={false}
              options={refMulData.all == undefined ? [] : refMulData.all}
            ></Multiselect>
          ) : (
            <Multiselect
              style={config.multiSelectStyle}
              disabled={props.disabled}
              onSelect={(e) => changed(props.conf.key, e.join(","))}
              onRemove={(e) => changed(props.conf.key, e.join(","))}
              selectedValues={
                props.values == undefined ? [] : props.values.split(",")
              }
              isObject={false}
              options={props.conf.selectValues.split(",")}
            ></Multiselect>
          ))}
        {props.conf.type === "multiselect" && props.disabled && (
          <Multiselect
            style={config.multiSelectStyle}
            disable={props.disabled}
            selectedValues={
              props.values == undefined ? [] : props.values.split(",")
            }
            isObject={false}
          ></Multiselect>
        )}
        {props.conf.type === "attachment" && !props.disabled && (
          <input
            type="file"
            onChange={(e) => {
              changed(props.conf.key, e.target.files[0].name);
              changed("_files_" + props.conf.key, e.target.files[0]);
            }}
          ></input>
        )}
        {props.conf.type === "attachment" && props.disabled && (
          <div className="attachment-disabled">
            {props.values != undefined && (
              <i
                className="fa-solid fa-download a-download-icon"
                onClick={downloadAttachment}
              ></i>
            )}
            <div className="disabled-attachment-name">{props.values}</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CreatedCell;
