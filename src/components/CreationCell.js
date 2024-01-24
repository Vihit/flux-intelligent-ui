import { useState } from "react";
import { useDrop, useDrag } from "react-dnd";
import "./CreationCell.css";
import Multiselect from "multiselect-react-dropdown";
import { config } from "./config";

function CreationCell(props) {
  const [isGrid, setIsGrid] = useState(props.gridControl);
  const [viz, setViz] = useState(props.conf.type);

  const [{ isDragging }, drag] = useDrag({
    type: "control-option",
    item: {
      type: "control-option",
      name: props.type,
      prevViz: {
        col: props.colId,
        row: props.rowId,
        conf: props.conf,
      },
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

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
    props.vizChosen(item.name, props.rowId, props.colId, item.prevViz);
  }

  function cellClicked(e) {
    e.cancelBubble = true;
    if (e.stopPropagation) e.stopPropagation();
    if (viz !== "") {
      if (props.conf.type !== "grid") props.showConf(props.rowId, props.colId);
    }
  }
  return (
    <div
      ref={drop}
      className={
        (props.gridControl ? "grid-creation-cell " : "creation-cell ") +
        (isOver ? "item-drop" : "") +
        (props.clicked ? " clicked-cell" : "")
      }
      style={{ width: "calc(100%/" + props.totalCells + ")" }}
      onClick={(e) => cellClicked(e)}
    >
      <div className="sample-div" ref={drag}>
        {/* {viz !== "" && <i className={"fa-solid " + viz}></i>} */}
        {/* {viz !== "" && <div className={"cell-img " + viz + "-png"}></div>} */}
        <div
          className={
            (props.gridControl ? "cell-name-grid " : "cell-name ") +
            (props.conf.type === "button" ||
            props.conf.type === "section-heading"
              ? " close-flex"
              : "")
          }
        >
          <div>
            {props.conf.label}
            {props.conf.isRequired && <span style={{ color: "red" }}> *</span>}
          </div>
        </div>
        <div
          className={
            props.conf.type === "button" ||
            props.conf.type === "section-heading"
              ? "btn-cell-control"
              : "cell-control"
          }
        >
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
          {props.conf.type === "button" && (
            <button
              className="f-btn transparent-btn"
              style={{
                color: props.conf.fontColor,
                background: props.conf.color,
              }}
              disabled
            >
              {props.conf.label}
            </button>
          )}
          {props.conf.type === "user" && (
            <input
              type="text"
              placeholder={props.conf.placeholder}
              value={null}
              disabled
            ></input>
          )}
          {props.conf.type === "all-users" && (
            <select placeholder={props.conf.placeholder} value={null} disabled>
              {props.conf.selectValues.split(",").map((value, indx) => {
                return <option value={value}>{value}</option>;
              })}
            </select>
          )}
          {props.conf.type === "multiselect" && (
            <Multiselect
              isObject={false}
              style={config.multiSelectStyle}
              options={[1, 2, 3]}
              showCheckbox={true}
              showArrow={true}
            ></Multiselect>
          )}
          {props.conf.type === "attachment" && (
            <input type="file" value={null} disabled></input>
          )}
          {props.conf.type === "section-heading" && (
            <div className="section-heading-ctrl">{props.conf.label}</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CreationCell;
