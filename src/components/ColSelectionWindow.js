import { useState } from "react";
import "./ColSelectionWindow.css";

function ColSelectionWindow(props) {
  const [selectedCols, setSelectedCols] = useState(props.selectedCols);
  const [columns, setColumns] = useState(props.columns);

  function addTo(where, what) {
    if (where === "group") {
      setSelectedCols((prev) => {
        let updatedArr = [...prev];
        updatedArr.push(what);
        return updatedArr;
      });
    }
  }

  function removeFrom(where, what) {
    if (where === "group") {
      setSelectedCols((prev) => {
        let udpdatedArr = [...prev];
        let idx = prev.indexOf(what);
        udpdatedArr.splice(idx, 1);
        return udpdatedArr;
      });
    }
  }

  return (
    <div className="col-options">
      <div className="c-o-head">
        <div className="c-o-heading">
          <div className="c-o-label">Columns</div>
        </div>
        <div
          onClick={() => {
            props.setSelectedCols(selectedCols);
            props.windowClose();
          }}
        >
          <i className="add-icon fa-solid fa-close"></i>
        </div>
      </div>
      {columns.length > 0 && selectedCols.length >= 0 && (
        <div className="available-cols">
          {columns.map((col, idx) => {
            return (
              <div className="col">
                <div className="col-name-sel">{col}</div>
                <div className="grow"></div>
                {selectedCols.includes(col) && !props.multiSelect && (
                  <div
                    key={idx}
                    className="col-icon"
                    onClick={() => removeFrom("group", col)}
                  >
                    <i className="add-icon fa-solid fa-minus"></i>
                  </div>
                )}
                {(!selectedCols.includes(col) || props.multiSelect) && (
                  <div
                    key={idx}
                    className="col-icon"
                    onClick={() => addTo("group", col)}
                  >
                    <i className="add-icon fa-solid fa-plus"></i>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ColSelectionWindow;
