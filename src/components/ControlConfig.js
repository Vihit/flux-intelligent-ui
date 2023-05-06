import { useEffect, useState } from "react";
import "./ControlConfig.css";
import { config } from "./config.js";
import ColSelectionWindow from "./ColSelectionWindow.js";

function ControlConfig(props) {
  const [toggleBasicDetails, setToggleBasicDetails] = useState(false);
  const [toggleDataDetails, setToggleDataDetails] = useState(false);
  const [toggleReferenceDataDetails, setToggleReferenceDataDetails] =
    useState(false);
  const [conf, setConf] = useState(props.conf);
  const [form, setForm] = useState();

  useEffect(() => {
    console.log(props);
  }, []);

  function toggle(what) {
    if (what === "basic-details") setToggleBasicDetails(!toggleBasicDetails);
    else if (what === "data-details") setToggleDataDetails(!toggleDataDetails);
    else if (what === "reference-data-details")
      setToggleReferenceDataDetails(!toggleReferenceDataDetails);
  }

  function confChanged(what, value) {
    let currConf = { ...conf };
    setConf((prev) => {
      if (what === "final") {
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
        if (what === "label")
          obj["key"] = value.toLowerCase().replaceAll(" ", "_");
      }
      return currConf;
    });
    if (what === "final") {
      props.saveConf(props.currCell, currConf);
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
            </div>
          )}
        </div>
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
                    onChange={(e) => confChanged("placeholder", e.target.value)}
                  ></input>
                </div>
              </div>
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
                      value={conf.conditionalCondition}
                      onChange={(e) =>
                        confChanged("conditionalCondition", e.target.value)
                      }
                    >
                      <option value="">Select Master Column</option>
                      {conf.referenceMaster !== "" &&
                        props.masters
                          .filter((f) => f.name === conf.referenceMaster)[0]
                          .columns.split(",")
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
      </div>
    </div>
  );
}

export default ControlConfig;
