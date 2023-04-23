import "./UserDashboard.css";
import { config } from "./config";
import { useEffect, useState } from "react";
import UserFormDetail from "./UserFormDetail";

function UserDashboard(props) {
  const [iClicked, setIClicked] = useState(false);
  const [pClicked, setPClicked] = useState(false);
  const [aClicked, setAClicked] = useState(false);
  const [iSelection, setISelection] = useState("");
  const [pSelection, setPSelection] = useState("");
  const [forms, setForms] = useState([]);
  const [iApps, setIApps] = useState([]);
  const [aApps, setAApps] = useState([]);
  const [pApps, setPApps] = useState([]);
  const [selectedForm, setSelectedForm] = useState({});
  const [selectedType, setSelectedType] = useState("");
  const [tableData, setTableData] = useState({ rows: [], header: [] });
  const [logEntries, setLogEntries] = useState([]);
  const [pendingEntries, setPendingEntries] = useState([]);
  const [allForms, setAllForms] = useState([]);
  const [accessibleForms, setAccessibleForms] = useState([]);

  useEffect(() => {
    getAllForms();
    getInitForms();
    getAccessibleForms();
  }, []);

  function getAllForms() {
    fetch(config.apiUrl + "forms/", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization:
          "Bearer " + JSON.parse(localStorage.getItem("access")).access_token,
      },
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
      })
      .then((actualData) => {
        setAllForms(actualData);
        getPendingEntries(actualData);
      });
  }

  function getInitForms() {
    fetch(config.apiUrl + "forms/init-forms/", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization:
          "Bearer " + JSON.parse(localStorage.getItem("access")).access_token,
      },
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
      })
      .then((actualData) => {
        setForms(actualData);
        console.log(
          actualData
            .map((f) => f.app)
            .reduce((op, a) => {
              if (op.filter((oA) => oA.id == a.id).length == 0) op.push(a);
              return op;
            }, [])
        );
        let apps = actualData
          .map((f) => f.app)
          .reduce((op, a) => {
            if (op.filter((oA) => oA.id == a.id).length == 0) op.push(a);
            return op;
          }, []);
        setIApps(apps);
      });
  }
  function getAccessibleForms() {
    fetch(config.apiUrl + "forms/accessible-forms/", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization:
          "Bearer " + JSON.parse(localStorage.getItem("access")).access_token,
      },
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
      })
      .then((actualData) => {
        setAccessibleForms(actualData);

        let apps = actualData
          .map((f) => f.app)
          .reduce((op, a) => {
            if (op.filter((oA) => oA.id == a.id).length == 0) op.push(a);
            return op;
          }, []);
        setAApps(apps);
      });
  }

  function getPendingEntries(fs) {
    console.log(fs);
    fetch(config.apiUrl + "entry/all-pending", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization:
          "Bearer " + JSON.parse(localStorage.getItem("access")).access_token,
      },
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
      })
      .then((actualData) => {
        let apps = fs
          .filter((f) => actualData.map((aD) => aD.formId).includes(f.id))
          .map((f) => f.app)
          .reduce((op, a) => {
            if (op.filter((oA) => oA.id == a.id).length == 0) op.push(a);
            return op;
          }, []);
        setPendingEntries(actualData);
        console.log(apps);
        setPApps(apps);
      });
  }

  function getLogEntries(f) {
    fetch(config.apiUrl + "entry/" + f.id, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization:
          "Bearer " + JSON.parse(localStorage.getItem("access")).access_token,
      },
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
      })
      .then((actualData) => {
        props.raiseAlert("green", "Fetched Entries");
        var fCols =
          f.columns +
          ",state,created_by,log_create_dt,updated_by,log_update_dt";
        var fLabels = JSON.parse(f.template)
          ["controls"].flatMap((ctrl) => ctrl)
          .map((c) => c.label)
          .concat([
            "State",
            "Created By",
            "Log Create Dt",
            "Updated By",
            "Log Update Dt",
          ]);
        setLogEntries(actualData);
        var matCols = [];
        var rows = [];
        fCols
          .split(",")
          .map((c) => {
            return fLabels.filter(
              (l) => l.toLowerCase().replaceAll(" ", "_") === c
            )[0];
          })
          .forEach((element) => {
            matCols.push({
              accessorKey: element.toLowerCase().replaceAll(" ", "_"),
              header: element,
            });
          });
        actualData.forEach((data) => {
          let obj = {};
          fCols.split(",").forEach((col) => {
            obj[col] = data.data[col];
          });
          rows.push(obj);
        });
        console.log(rows);
        setTableData({ rows: rows, header: matCols });
        setSelectedForm(f);
      });
  }

  function getPendingLogEntries(f) {
    fetch(config.apiUrl + "entry/" + f.id + "/pending", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization:
          "Bearer " + JSON.parse(localStorage.getItem("access")).access_token,
      },
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
      })
      .then((actualData) => {
        props.raiseAlert("green", "Fetched Pending Entries");
        var fCols =
          "id," +
          f.columns +
          ",state,created_by,log_create_dt,updated_by,log_update_dt";
        var fLabels = JSON.parse(f.template)
          ["controls"].flatMap((ctrl) => ctrl)
          .map((c) => c.label)
          .concat([
            "ID",
            "State",
            "Created By",
            "Log Create Dt",
            "Updated By",
            "Log Update Dt",
          ]);
        console.log(fLabels);
        setLogEntries(actualData);
        var matCols = [];
        var rows = [];
        fCols
          .split(",")
          .map((c) => {
            return fLabels.filter(
              (l) => l.toLowerCase().replaceAll(" ", "_") === c
            )[0];
          })
          .forEach((element) => {
            matCols.push({
              accessorKey: element.toLowerCase().replaceAll(" ", "_"),
              header: element,
            });
          });
        actualData.forEach((data) => {
          let obj = {};
          fCols.split(",").forEach((col) => {
            obj[col] = data.data[col];
          });
          rows.push(obj);
        });
        setTableData({ rows: rows, header: matCols });
        setSelectedForm(f);
      });
  }

  function handleFormClick(type, f) {
    console.log("Handling form click");
    setSelectedType(type);
    if (type === "initiate" || type === "view") {
      getLogEntries(f);
    } else {
      getPendingEntries(allForms);
      getPendingLogEntries(f);
    }
  }

  return (
    <div className="u-d-container">
      <div className="u-menu">
        <div className="u-menu-head" onClick={() => setIClicked(!iClicked)}>
          Initiate Actions
        </div>
        <div className={"u-menu-part " + (iClicked ? "" : "close-flex")}>
          {iApps.map((a, inx) => {
            return (
              <div key={inx} className="u-menu-i-head">
                {a.name}
                {forms
                  .filter((f) => f.app.id == a.id)
                  .map((f, idx) => {
                    return (
                      <div
                        key={idx}
                        className="u-menu-i"
                        onClick={() => handleFormClick("initiate", f)}
                      >
                        {f.name}
                      </div>
                    );
                  })}
              </div>
            );
          })}
        </div>
        <div className="u-menu-head" onClick={() => setPClicked(!pClicked)}>
          Pending Actions {pApps.length > 0 && <div className="p-not"></div>}
        </div>
        <div className={"u-menu-part " + (pClicked ? "" : "close-flex")}>
          {pApps.map((a, inx) => {
            return (
              <div key={inx} className="u-menu-i-head">
                {a.name}
                {allForms
                  .filter((f) => f.app.id == a.id)
                  .map((f, idx) => {
                    return (
                      <div
                        className="u-menu-i"
                        onClick={() => {
                          handleFormClick("pending", f);
                        }}
                      >
                        {f.name}
                      </div>
                    );
                  })}
              </div>
            );
          })}
        </div>
        <div className="u-menu-head" onClick={() => setAClicked(!aClicked)}>
          My Actions {pApps.length > 0 && <div className="p-not"></div>}
        </div>
        <div className={"u-menu-part " + (aClicked ? "" : "close-flex")}>
          {aApps.map((a, inx) => {
            return (
              <div key={inx} className="u-menu-i-head">
                {a.name}
                {allForms
                  .filter((f) => f.app.id == a.id)
                  .map((f, idx) => {
                    return (
                      <div
                        className="u-menu-i"
                        onClick={() => {
                          handleFormClick("view", f);
                        }}
                      >
                        {f.name}
                      </div>
                    );
                  })}
              </div>
            );
          })}
        </div>
      </div>
      {selectedForm.id != undefined && selectedType !== "" && (
        <UserFormDetail
          type={selectedType}
          form={selectedForm}
          raiseAlert={props.raiseAlert}
          key={selectedForm}
          tableData={tableData}
          updateData={handleFormClick}
        ></UserFormDetail>
      )}
    </div>
  );
}

export default UserDashboard;
