import { useState } from "react";
import "./CreatedCell.css";

function CreatedCell(props) {
  const [vals, setVals] = useState([]);
  var values = "";

  function changed(what, value) {
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
  return (
    <div
      className={
        props.conf.label !== "" ? "created-cell " : "empty-created-cell"
      }
    >
      <div className="cell-name">
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
            {props.conf.selectValues.split(",").map((value, indx) => {
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
      </div>
    </div>
  );
}

export default CreatedCell;
