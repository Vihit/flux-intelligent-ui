import { useState } from "react";
import { useDrop } from "react-dnd";
import "./CreationCell.css";

function CreationCell(props) {
  const [viz, setViz] = useState(props.conf.type);

  const [{ isOver }, drop] = useDrop({
    accept: "control-option",
    drop: (item, monitor) => {
      vizDropped(item);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  function vizDropped(item) {
    setViz(item.name);
    props.vizChosen(item.name, props.rowId, props.colId);
  }

  function cellClicked() {
    if (viz !== "") props.showConf(props.rowId, props.colId);
  }
  return (
    <div
      ref={drop}
      className={
        "creation-cell " +
        (isOver ? "item-drop" : "") +
        (props.clicked ? " clicked-cell" : "")
      }
      style={{ width: "calc(100%/" + props.totalCells + ")" }}
      onClick={cellClicked}
    >
      {/* {viz !== "" && <i className={"fa-solid " + viz}></i>} */}
      {/* {viz !== "" && <div className={"cell-img " + viz + "-png"}></div>} */}
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
            value={null}
            disabled
          ></input>
        )}
        {props.conf.type === "select" && (
          <select placeholder={props.conf.placeholder} value={null} disabled>
            {props.conf.selectValues.split(",").map((value, indx) => {
              return <option value={value}>{value}</option>;
            })}
          </select>
        )}
        {props.conf.type === "textarea" && (
          <textarea
            placeholder={props.conf.placeholder}
            value={null}
            disabled
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
                    value={null}
                    name={props.conf.name}
                    disabled
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
                  <input type="checkbox" value={null} disabled></input>
                </div>
              </div>
            );
          })}
        {props.conf.type === "barcode" && (
          <input
            type="text"
            placeholder={props.conf.placeholder}
            value={null}
            disabled
          ></input>
        )}
        {props.conf.type === "datetime" && (
          <input
            type="datetime-local"
            placeholder={props.conf.placeholder}
            value={null}
            disabled
          ></input>
        )}
      </div>
    </div>
  );
}

export default CreationCell;
