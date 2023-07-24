import { useEffect, useState } from "react";
import "./ControlConfig.css";
import { config } from "./config.js";
import ColSelectionWindow from "./ColSelectionWindow.js";

function ControlConfig(props) {
  const [toggleBasicDetails, setToggleBasicDetails] = useState(false);
  const [toggleDataDetails, setToggleDataDetails] = useState(false);
  const [toggleReferenceDataDetails, setToggleReferenceDataDetails] =
    useState(false);
  const [toggleClickDetails, setToggleClickDetails] = useState(false);
  const [conf, setConf] = useState(props.conf);
  const [form, setForm] = useState();
  let emptyControlConf = {
    label: "",
    type: "",
    isRequired: false,
    key: "",
    selectValues: "",
    conditionalVisibility: false,
    conditionalCondition: "",
    conditionalValue: "",
    referData: false,
    apiCall: false,
    referenceMaster: "",
    referenceFilterQuery: "",
    referenceColumn: "",
    color: "",
    fontColor: "",
    apiBody: "",
    apiMethod: "",
    apiUrl: "",
    sendToDraftState: true,
    nextState: "",
    buttonClickPattern: "once",
    userDetail: "",
  };

  useEffect(() => {
    console.log(props);
  }, []);

  function toggle(what) {
    if (what === "basic-details") setToggleBasicDetails(!toggleBasicDetails);
    else if (what === "data-details") setToggleDataDetails(!toggleDataDetails);
    else if (what === "reference-data-details")
      setToggleReferenceDataDetails(!toggleReferenceDataDetails);
    else if (what === "on-click-details")
      setToggleClickDetails(!toggleClickDetails);
  }

  function confChanged(what, value) {
    let currConf = { ...conf };
    console.log(currConf);
    console.log(props);
    setConf((prev) => {
      console.log(what);
      if (what === "final") {
        console.log(props);
        if (
          currConf.type === "grid" &&
          parseInt(currConf.numCols) != currConf.controls.length
        ) {
          let delta = parseInt(currConf.numCols) - currConf.controls.length;
          [...Array(delta).keys()].map((x, inx) =>
            currConf.controls.push(emptyControlConf)
          );
        }
        console.log(props);
        if (JSON.parse(props.gridConf)) {
          let gridConf = [...props.fullConf[props.currCell.row][0].controls];
          gridConf.splice(props.currCell.col, 1, currConf);
          console.log(gridConf);
          props.saveConf({ row: props.currCell.row, col: 0 }, gridConf);
        } else {
          console.log(props);
          props.saveConf(props.currCell, currConf);
        }
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
        if (what === "label")
          obj["key"] = value.toLowerCase().replaceAll(" ", "_");
      }
      return currConf;
    });
    if (what === "final") {
      if (
        currConf.type === "grid" &&
        parseInt(currConf.numCols) != currConf.controls.length
      ) {
        let delta = parseInt(currConf.numCols) - currConf.controls.length;
        [...Array(delta).keys()].map((x, inx) =>
          currConf.controls.push(emptyControlConf)
        );
      }
      console.log(props);
      if (props.gridConf) {
        let gridConf = { ...props.fullConf[props.currCell.row][0] };
        let gridControls = gridConf.controls;
        gridControls.splice(props.currCell.col, 1, currConf);
        console.log(gridConf);
        props.saveConf({ row: props.currCell.row, col: 0 }, gridConf);
      } else {
        console.log(props);
        props.saveConf(props.currCell, currConf);
      }
    } else {
      var obj = currConf;
      let splitWhat = what.split(".");
      for (var i = 0; i < splitWhat.length - 1; i++) {
        let prop = splitWhat[i];
        obj = obj[prop];
      }
      let finalProp = splitWhat[i];
      obj[finalProp] = value;
      if (what === "label")
        obj["key"] = value.toLowerCase().replaceAll(" ", "_");
    }
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
        <div
          style={{ cursor: "pointer" }}
          onClick={(e) => confChanged("final", "")}
        >
          <i className="fa-solid fa-floppy-disk"></i>
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
                <div className="label">Label</div>
                <div className="text">
                  <input
                    type="text"
                    value={conf.label}
                    onChange={(e) => {
                      confChanged("label", e.target.value);
                    }}
                  ></input>
                </div>
              </div>
              {props.conf.type === "grid" && (
                <div className="label-n-text">
                  <div className="label">Columns</div>
                  <div className="text">
                    <input
                      type="text"
                      value={conf.numCols}
                      onChange={(e) => confChanged("numCols", e.target.value)}
                    ></input>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        {conf.type !== "grid" && (
          <div className="dtl">
            <div className="dtl-head" onClick={() => toggle("data-details")}>
              <div>Control Details</div>
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
                  <div className="label">Required</div>
                  <div className="text">
                    <select
                      value={conf.isRequired}
                      onChange={(e) =>
                        confChanged("isRequired", JSON.parse(e.target.value))
                      }
                    >
                      <option value={false}>No</option>
                      <option value={true}>Yes</option>
                    </select>
                  </div>
                </div>
                <div className="label-n-text">
                  <div className="label">Placeholder</div>
                  <div className="text">
                    <input
                      type="text"
                      value={conf.placeholder}
                      onChange={(e) =>
                        confChanged("placeholder", e.target.value)
                      }
                    ></input>
                  </div>
                </div>
                {props.conf.type === "button" && (
                  <div className="label-n-text">
                    <div className="label">Button Color</div>
                    <div className="text">
                      <input
                        type="color"
                        value={conf.color}
                        onChange={(e) => confChanged("color", e.target.value)}
                      ></input>
                    </div>
                  </div>
                )}
                {props.conf.type === "button" && (
                  <div className="label-n-text">
                    <div className="label">Font Color</div>
                    <div className="text">
                      <input
                        type="color"
                        value={conf.fontColor}
                        onChange={(e) =>
                          confChanged("fontColor", e.target.value)
                        }
                      ></input>
                    </div>
                  </div>
                )}
                {props.conf.type === "user" && (
                  <div className="label-n-text">
                    <div className="label">Detail</div>
                    <div className="text">
                      <select
                        value={conf.userDetail}
                        onChange={(e) =>
                          confChanged("userDetail", e.target.value)
                        }
                      >
                        <option value={""}>Select</option>
                        <option value={"username"}>Username</option>
                        <option value={"department"}>Department</option>
                        <option value={"lastName"}>Site</option>
                        <option value={"role"}>Role</option>
                        <option value={"firstName"}>First Name</option>
                        <option value={"lastName"}>Last Name</option>
                      </select>
                    </div>
                  </div>
                )}
                {(props.conf.type === "select" ||
                  props.conf.type === "radio" ||
                  props.conf.type === "checkbox") && (
                  <div className="label-n-text">
                    <div className="label">Values</div>
                    <div className="text">
                      <input
                        type="text"
                        value={conf.selectValues}
                        onChange={(e) =>
                          confChanged("selectValues", e.target.value)
                        }
                      ></input>
                    </div>
                  </div>
                )}
                <div className="label-n-text">
                  <div className="label">Conditional Visibility</div>
                  <div className="text">
                    <select
                      value={conf.conditionalVisibility}
                      onChange={(e) =>
                        confChanged(
                          "conditionalVisibility",
                          JSON.parse(e.target.value)
                        )
                      }
                    >
                      <option value={false}>No</option>
                      <option value={true}>Yes</option>
                    </select>
                  </div>
                </div>
                {conf.conditionalVisibility && (
                  <div className="label-n-text">
                    <div className="label">Control</div>
                    <div className="text">
                      <select
                        value={conf.conditionalControl}
                        onChange={(e) =>
                          confChanged("conditionalControl", e.target.value)
                        }
                      >
                        <option value="">Select Control</option>
                        {props.otherControls
                          .filter((f) => f !== conf.label)
                          .map((col, inx) => {
                            return (
                              <option key={inx} value={col}>
                                {col}
                              </option>
                            );
                          })}
                      </select>
                      <select
                        value={conf.conditionalCondition}
                        onChange={(e) =>
                          confChanged("conditionalCondition", e.target.value)
                        }
                      >
                        <option value="">Select condition</option>
                        <option value="==">is</option>
                        <option value="!=">is not</option>
                        <option value=">">is greater than</option>
                        <option value="<">is lower than</option>
                        <option value=">=">is greater or equals to</option>
                        <option value="<=">is lower or equals to</option>
                      </select>
                      <input
                        type="text"
                        value={conf.conditionalValue}
                        onChange={(e) =>
                          confChanged("conditionalValue", e.target.value)
                        }
                      ></input>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        {conf.type !== "grid" && conf.type !== "button" && (
          <div className="dtl">
            <div
              className="dtl-head"
              onClick={() => toggle("reference-data-details")}
            >
              <div>Reference Data Details</div>
              {toggleReferenceDataDetails && (
                <div>
                  <i className="fa-solid fa-minus"></i>
                </div>
              )}
              {!toggleReferenceDataDetails && (
                <div>
                  <i className="fa-solid fa-plus"></i>
                </div>
              )}
            </div>
            {toggleReferenceDataDetails && (
              <div className="dtls">
                <div className="label-n-text">
                  <div className="label">Reference Data</div>
                  <div className="text">
                    <select
                      value={conf.referData}
                      onChange={(e) =>
                        confChanged("referData", JSON.parse(e.target.value))
                      }
                    >
                      <option value={false}>No</option>
                      <option value={true}>Yes</option>
                    </select>
                  </div>
                </div>
                {conf.referData && (
                  <div className="label-n-text">
                    <div className="label">Master</div>
                    <div className="text">
                      <select
                        value={conf.referenceMaster}
                        onChange={(e) =>
                          confChanged("referenceMaster", e.target.value)
                        }
                      >
                        <option value="">Select Master</option>
                        {props.masters.map((mstr, inx) => {
                          return (
                            <option key={inx} value={mstr.name}>
                              {mstr.name}
                            </option>
                          );
                        })}
                      </select>
                      <select
                        value={conf.referenceColumn}
                        onChange={(e) =>
                          confChanged("referenceColumn", e.target.value)
                        }
                      >
                        <option value="">Select Master Column</option>
                        {conf.referenceMaster !== "" &&
                          props.masters
                            .filter((f) => f.name === conf.referenceMaster)[0]
                            .columns.split(",")
                            .concat("id")
                            .map((col, inx) => {
                              return <option value={col}>{col}</option>;
                            })}
                      </select>
                      <input
                        type="text"
                        value={conf.referenceFilterQuery}
                        placeholder="API Filter Query"
                        onChange={(e) =>
                          confChanged("referenceFilterQuery", e.target.value)
                        }
                      ></input>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        {conf.type === "button" && (
          <div className="dtl">
            <div
              className="dtl-head"
              onClick={() => toggle("on-click-details")}
            >
              <div>Click Event Details</div>
              {toggleClickDetails && (
                <div>
                  <i className="fa-solid fa-minus"></i>
                </div>
              )}
              {!toggleClickDetails && (
                <div>
                  <i className="fa-solid fa-plus"></i>
                </div>
              )}
            </div>
            {toggleClickDetails && (
              <div className="dtls">
                <div className="label-n-text">
                  <div className="label">Click Allowed</div>
                  <div className="text">
                    <select
                      value={conf.buttonClickPattern}
                      onChange={(e) =>
                        confChanged("buttonClickPattern", e.target.value)
                      }
                    >
                      <option value={"once"}>Once</option>
                      <option value={"multiple"}>Multiple</option>
                    </select>
                  </div>
                </div>
                <div className="label-n-text">
                  <div className="label">API Call</div>
                  <div className="text">
                    <select
                      value={conf.apiCall}
                      onChange={(e) =>
                        confChanged("apiCall", JSON.parse(e.target.value))
                      }
                    >
                      <option value={false}>No</option>
                      <option value={true}>Yes</option>
                    </select>
                  </div>
                </div>
                {conf.apiCall && (
                  <div className="label-n-text">
                    <div className="label">API</div>
                    <div className="text">
                      <input
                        type="text"
                        value={conf.apiUrl}
                        placeholder="URL"
                        onChange={(e) => confChanged("apiUrl", e.target.value)}
                      ></input>
                      <select
                        value={conf.apiMethod}
                        onChange={(e) =>
                          confChanged("apiMethod", e.target.value)
                        }
                      >
                        <option value="">Select API Method</option>
                        <option value="GET">GET</option>
                        <option value="POST">POST</option>
                        <option value="PUT">PUT</option>
                      </select>
                      {(conf.apiMethod === "PUT" ||
                        conf.apiMethod === "POST") && (
                        <textarea
                          className="normal-height"
                          type="text"
                          rows="1"
                          value={conf.apiBody}
                          placeholder="Body"
                          onChange={(e) =>
                            confChanged("apiBody", e.target.value)
                          }
                        ></textarea>
                      )}
                    </div>
                  </div>
                )}
                {
                  <div className="label-n-text">
                    <div className="label">Save Draft</div>
                    <div className="text">
                      <select
                        value={conf.sendToDraftState}
                        onChange={(e) =>
                          confChanged(
                            "sendToDraftState",
                            JSON.parse(e.target.value)
                          )
                        }
                      >
                        <option value={false}>No</option>
                        <option value={true}>Yes</option>
                      </select>
                    </div>
                  </div>
                }
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ControlConfig;
