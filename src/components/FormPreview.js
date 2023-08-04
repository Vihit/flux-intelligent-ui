import { useEffect, useState } from "react";
import CreatedCell from "./CreatedCell";
import "./FormPreview.css";
import CreatedGrid from "./CreatedGrid";

function FormPreview(props) {
  const layout = props.layout;
  const conf = props.conf;
  const [data, setData] = useState({});

  useEffect(() => {}, []);

  function dataChanged(what, value) {
    setData((prev) => {
      let currData = { ...prev };
      var obj = currData;
      let splitWhat = what.split(".");
      for (var i = 0; i < splitWhat.length - 1; i++) {
        let prop = splitWhat[i];
        obj = obj[prop];
      }
      let finalProp = splitWhat[i];
      obj[finalProp] = value;

      return currData;
    });
    // setLayout((prev) => {
    //   let toBeUpdated = [...prev];
    //   return props.layout;
    // });
    // updateConditionalVisibility();
  }

  function checkConditionalVibility(controlConf) {
    if (controlConf.conditionalVisibility) {
      let dep = controlConf.conditionalControl
        .toLowerCase()
        .replaceAll(" ", "_");
      let op = controlConf.conditionalCondition;
      let value = controlConf.conditionalValue;
      if (op === "==") return data[dep] === value;
      else if (op === "!=") return data[dep] !== value;
      else if (op === ">") return data[dep] > value;
      else if (op === ">=") return data[dep] >= value;
      else if (op === "<") return data[dep] < value;
      else if (op === "<=") return data[dep] <= value;
    } else {
      return true;
    }
  }

  return (
    <div className="analytics-preview">
      <div className="viz-preview-details">
        <div className="viz-name">{props.vizName}</div>
        <div className="grow"></div>
        <div className="close-icon">
          <i
            className="fa-solid fa-close"
            onClick={() => props.closePreview(false)}
          ></i>
        </div>
      </div>
      <div className="created-container">
        {layout.map((rows, idx) => {
          return (
            <div
              className="created-row"
              // style={{ height: "calc(100%/" + layout.length + ")" }}
            >
              {rows.map((row, inx) => {
                return row == 0 ? (
                  <CreatedCell
                    dataChanged={dataChanged}
                    rowId={idx}
                    colId={inx}
                    totalCells={rows.length}
                    values={data[conf[idx][inx].key]}
                    conf={
                      checkConditionalVibility(conf[idx][inx])
                        ? conf[idx][inx]
                        : {}
                    }
                    key={"1" + idx + "" + inx}
                    type="form"
                    formData={{}}
                  ></CreatedCell>
                ) : (
                  <CreatedGrid
                    dataChanged={dataChanged}
                    rowId={idx}
                    colId={inx}
                    totalCells={rows.length}
                    values={data[conf[idx][inx].key]}
                    conf={
                      checkConditionalVibility(conf[idx][inx])
                        ? conf[idx][inx]
                        : {}
                    }
                    key={"1" + idx + "" + inx}
                    type="form"
                    formData={{}}
                  ></CreatedGrid>
                );
              })}
            </div>
          );
        })}
        <div className="btn-controls">
          <div className="create-btn">Submit</div>
          <div className="cancel-btn" onClick={() => props.closePreview(false)}>
            Cancel
          </div>
        </div>
      </div>
    </div>
  );
}

export default FormPreview;
