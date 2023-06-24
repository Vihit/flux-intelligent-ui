import { useEffect, useState } from "react";
import "./CreatedGrid.css";
import { config } from "./config";
import Html5QrcodePlugin from "./Html5QrcodeScannerPlugin";
import CreatedCell from "./CreatedCell";

function CreatedGrid(props) {
  // console.log(props);
  const [vals, setVals] = useState([]);
  var values = "";
  const [refData, setRefData] = useState([]);
  const [externalInputActivated, setExternalInputActivated] = useState(false);
  const [gridRows, setGridRows] = useState(1);

  function changed(index, what, value) {
    let gridKey = props.conf.key;
    if (props.type === "form") {
      // props.dataChanged(what, value);
      var gridData = props.formData[gridKey];
      console.log(gridData);
      if (gridData == undefined || gridData.length == 0) {
        gridData = [];
      }
      if (gridData.length - 1 < index) {
        gridData.push({});
      }
      let obj = gridData[index];
      obj[what] = value;
      gridData.splice(index, 1, obj);
      console.log(gridData);
      props.dataChanged(gridKey, gridData);
    }
  }

  function deleteRow(indx) {
    setGridRows((prev) => {
      return prev - 1;
    });
  }

  useEffect(() => {}, []);

  return (
    <div
      className={
        props.conf.label !== undefined
          ? "created-grid-cell "
          : "empty-created-cell"
      }
    >
      <div className="grid-head">{props.conf.label}</div>
      {[...Array(gridRows).keys()].map((j, inx) => {
        return (
          <div className="grid-controls">
            {[...Array(parseInt(props.conf.numCols)).keys()].map((i, idx) => {
              return (
                <CreatedCell
                  rowId={props.rowId}
                  colId={idx}
                  totalCells={props.conf.numCols}
                  showConf={props.showConf}
                  conf={props.conf.controls[idx]}
                  key={"11" + props.rowId + "" + idx}
                  clicked={false}
                  vizChosen={props.vizChosen}
                  gridControl={true}
                  dataChanged={(a, b) => changed(j, a, b)}
                  formData={props.formData}
                  type={props.type}
                  rowNum={j}
                ></CreatedCell>
              );
            })}
            <div className="gr-default-control">
              {j == 0 && <div className="filler"></div>}
              <div className="delete-gr" onClick={() => deleteRow(j)}>
                <i className="fa-solid fa-close"></i>
              </div>
            </div>
          </div>
        );
      })}

      <div
        className="add-new-gr"
        onClick={() =>
          setGridRows((prev) => {
            return prev + 1;
          })
        }
      >
        Add New
      </div>
    </div>
  );
}

export default CreatedGrid;
