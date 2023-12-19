import { useState } from "react";
import "./ReportEdit.css";
import { config } from "./config";

function ReportEdit(props) {
  const [report, setReport] = useState(props.report);

  function reportChanged(what, value) {
    setReport((prev) => {
      let toBeUpdated = { ...prev };
      if (what !== "final") {
        toBeUpdated[what] = value;
      }
      return toBeUpdated;
    });
  }

  function updateReport() {
    let updatedReport = {
      name: report.name,
      template: report.template,
      columns: report.template
        .split(" from ")[0]
        .split("select ")[1]
        .split(",")
        .map((col) => col.split(" as ")[1])
        .filter((col) => col != undefined)
        .join(","),
      type: "sql",
    };
    fetch(config.apiUrl + "report/", {
      method: report.id == undefined ? "POST" : "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization:
          "Bearer " + JSON.parse(localStorage.getItem("access")).access_token,
      },
      body: JSON.stringify(updatedReport),
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
      })
      .then((actualData) => {
        props.raiseAlert("green", "User updated!");
        props.closeWindow(false);
      });
  }

  return (
    <div className="user-preview">
      <div className="viz-preview-details">
        <div className="viz-name">Edit Report</div>
        <div className="grow"></div>
        <div className="close-icon">
          <i
            className="fa-solid fa-close"
            onClick={() => props.closeWindow(false)}
          ></i>
        </div>
      </div>
      <div className="created-container">
        <div className="created-row">
          <div className="creation-cell" style={{ width: "100%" }}>
            <div className="cell-name">
              <div>Name</div>
            </div>
            <div className="cell-control">
              <input
                type="text"
                value={report.name}
                disabled={report.id != undefined}
                onChange={(e) => reportChanged("name", e.target.value)}
              ></input>
            </div>
          </div>
        </div>
        <div className="created-row">
          <div className="creation-cell" style={{ width: "100%" }}>
            <div className="cell-name">
              <div>Template</div>
            </div>
            <div className="cell-control">
              <textarea
                value={report.template}
                disabled={report.id != undefined}
                onChange={(e) => reportChanged("template", e.target.value)}
              ></textarea>
            </div>
          </div>
        </div>
        <div className="btn-controls">
          <div onClick={updateReport} className="create-btn">
            {report.id == undefined ? "Add" : "Update"}
          </div>

          <div className="cancel-btn" onClick={() => props.closeWindow(false)}>
            Cancel
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReportEdit;
