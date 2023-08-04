import { useState } from "react";
import { useDrop } from "react-dnd";
import "./CreationGrid.css";
import CreationCell from "./CreationCell";

function CreationGrid(props) {
  const [viz, setViz] = useState(props.conf.type);

  // console.log(props);

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
    console.log("grid clicked");
    props.showConf(props.rowId, props.colId, "grid");
  }
  return (
    <div
      className={"creation-grid " + (props.clicked ? " clicked-cell" : "")}
      style={{ width: "100%" }}
      onClick={cellClicked}
    >
      <div className="grid-head">{props.conf.label}</div>
      <div className="grid-controls">
        {[...Array(parseInt(props.conf.numCols)).keys()].map((i, idx) => {
          return (
            <CreationCell
              rowId={props.rowId}
              colId={idx}
              totalCells={props.conf.numCols}
              showConf={props.showConf}
              conf={props.conf.controls[idx]}
              key={"1" + props.rowId + "" + idx}
              clicked={false}
              vizChosen={props.vizChosen}
              gridControl={true}
            ></CreationCell>
          );
        })}
      </div>
    </div>
  );
}

export default CreationGrid;
