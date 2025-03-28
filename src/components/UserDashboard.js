import "./UserDashboard.css";
import { config } from "./config";
import { Fragment, useEffect, useState } from "react";
import UserFormDetail from "./UserFormDetail";
import { useParams } from "react-router-dom";
import MyRequests from "./MyRequests";
import Pending from "./Pending";
import AllRequests from "./AllRequests";
import Form from "./Form";
import { useHistory } from "react-router-dom/cjs/react-router-dom";

function UserDashboard(props) {
  console.log(props);
  let history = useHistory();
  const [forms, setForms] = useState([]);
  const [selectedForm, setSelectedForm] = useState({});
  const [tableData, setTableData] = useState({ rows: [], header: [] });
  const [logEntries, setLogEntries] = useState([]);
  const [pendingEntries, setPendingEntries] = useState([]);
  const [allForms, setAllForms] = useState([]);
  const [accessibleForms, setAccessibleForms] = useState([]);
  const [lastStateAccessibleForms, setLastStateAccessibleForms] = useState([]);
  const [selectionUpdate, setSelectionUpdate] = useState(110);
  const [hiddenColumns, setHiddenColumns] = useState({});
  const [detailColumns, setDetailColumns] = useState([]);
  const [prevIndex, setPrevIndex] = useState(0);
  const [option, setOption] = useState("");
  const [initiated, setInitiated] = useState(false);
  const [entry, setEntry] = useState({ id: -1 });
  const [gridEntries, setGridEntries] = useState([]);

  useEffect(() => {
    getAllForms();
    getInitForms();
    getAccessibleForms();
    getLastStateAccessibleForms();
    setOption("");
    setSelectedForm({});
  }, [props.id, props.selectedFormId]);

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
        setAllForms(actualData.filter((f) => f.status === "Published"));
        if (props.selectedFormId > 0) {
          var f = actualData.filter((a) => a.id == props.selectedFormId)[0];
          setSelectedForm(f);
          var fKeys = JSON.parse(f.template)
            ["controls"].flatMap((ctrl) => ctrl)
            .filter((ctrl) => !["grid", "section-heading"].includes(ctrl.type))
            .map((c) => c.key)
            .concat([
              "id",
              "state",
              "created_by",
              "log_create_dt",
              "updated_by",
              "log_update_dt",
            ]);
          var settings = JSON.parse(f.settings);
          var viewColumns = settings?.view?.columns;
          var filterColumns = settings?.view?.filters;
          var detailCols = settings?.view?.details;
          var fLabels = JSON.parse(f.template)
            ["controls"].flatMap((ctrl) => ctrl)
            .filter((ctrl) => !["grid", "section-heading"].includes(ctrl.type))
            .map((c) => c.label)
            .concat([
              "ID",
              "State",
              "Created By",
              "Log Create Dt",
              "Updated By",
              "Log Update Dt",
            ]);
          var hiddenColumns = {};
          var detailColumns = [];
          fKeys.forEach((element, inx) => {
            if (!viewColumns?.split(",").includes(element))
              hiddenColumns[element] = false;
            if (detailCols?.split(",").includes(element))
              detailColumns.push({ key: element, label: fLabels[inx] });
          });
          setHiddenColumns(hiddenColumns);
          setDetailColumns(detailColumns);
        }
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
        // let apps = actualData
        //   .map((f) => f.app)
        //   .reduce((op, a) => {
        //     if (op.filter((oA) => oA.id == a.id).length == 0) op.push(a);
        //     return op;
        //   }, []);
        // setIApps(apps);
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

        // let apps = actualData
        //   .map((f) => f.app)
        //   .reduce((op, a) => {
        //     if (op.filter((oA) => oA.id == a.id).length == 0) op.push(a);
        //     return op;
        //   }, []);
        // setAApps(apps);
      });
  }

  function getLastStateAccessibleForms() {
    fetch(config.apiUrl + "forms/last-state-accessible-forms/", {
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
        setLastStateAccessibleForms(actualData);

        // let apps = actualData
        //   .map((f) => f.app)
        //   .reduce((op, a) => {
        //     if (op.filter((oA) => oA.id == a.id).length == 0) op.push(a);
        //     return op;
        //   }, []);
        // setLSAApps(apps);
      });
  }

  return (
    <>
      <div className="app-main-c">
        <div className="app-dtl-c">
          <div className="app-dtl-i">
            <i className={"fa-solid " + props.icon}></i>
          </div>
          <div className="app-dtl-n">
            {props.name?.split(" ").map((a, ij) => (
              <Fragment key={ij}>
                {a}
                <br key={ij} />
              </Fragment>
            ))}
          </div>
        </div>
        <div className="app-logs-c">
          {allForms
            .filter((f) => f.appId == props.id)
            .map((f) => (
              <div
                key={f.id}
                className={
                  "app-log-c " + (selectedForm.id == f.id ? "sel-app-log" : "")
                }
                onClick={() => {
                  history.push("/dashboard/" + props.id + "/" + f.id + "");
                  console.log("/dashboard/" + props.id + "/" + f.id + "");
                  setSelectedForm(f);
                  var fKeys = JSON.parse(f.template)
                    ["controls"].flatMap((ctrl) => ctrl)
                    .filter(
                      (ctrl) => !["grid", "section-heading"].includes(ctrl.type)
                    )
                    .map((c) => c.key)
                    .concat([
                      "id",
                      "state",
                      "created_by",
                      "log_create_dt",
                      "updated_by",
                      "log_update_dt",
                    ]);
                  var settings = JSON.parse(f.settings);
                  var viewColumns = settings?.view?.columns;
                  var filterColumns = settings?.view?.filters;
                  var detailCols = settings?.view?.details;
                  var fLabels = JSON.parse(f.template)
                    ["controls"].flatMap((ctrl) => ctrl)
                    .filter(
                      (ctrl) => !["grid", "section-heading"].includes(ctrl.type)
                    )
                    .map((c) => c.label)
                    .concat([
                      "ID",
                      "State",
                      "Created By",
                      "Log Create Dt",
                      "Updated By",
                      "Log Update Dt",
                    ]);
                  var hiddenColumns = {};
                  var detailColumns = [];
                  fKeys.forEach((element, inx) => {
                    if (!viewColumns?.split(",").includes(element))
                      hiddenColumns[element] = false;
                    if (detailCols?.split(",").includes(element))
                      detailColumns.push({ key: element, label: fLabels[inx] });
                  });
                  setHiddenColumns(hiddenColumns);
                  setDetailColumns(detailColumns);
                }}
              >
                {f.name}
              </div>
            ))}
        </div>
      </div>
      {selectedForm.id > 0 && (
        <div className="f-a-options">
          {accessibleForms.filter((a) => a.id == selectedForm.id).length >
            0 && (
            <div className="f-options">
              {
                <div
                  className={"f-option " + (option === "my" ? "f-sel" : "")}
                  onClick={() => setOption("my")}
                >
                  My Requests
                </div>
              }
              {
                <div
                  className={
                    "f-option " + (option === "pending" ? "f-sel" : "")
                  }
                  onClick={() => setOption("pending")}
                >
                  Pending Requests
                </div>
              }
              {selectedForm?.id > 0 &&
                lastStateAccessibleForms.filter((a) => a.id == selectedForm.id)
                  .length > 0 && (
                  <div
                    className={"f-option " + (option === "all" ? "f-sel" : "")}
                    onClick={() => setOption("all")}
                  >
                    All Requests
                  </div>
                )}
            </div>
          )}
          {selectedForm?.id > 0 &&
            forms.filter((a) => a.id == selectedForm.id).length > 0 && (
              <div className="f-init-option" onClick={() => setInitiated(true)}>
                {
                  selectedForm.workflow.states.filter((s) => s.firstState)[0]
                    .label
                }
              </div>
            )}
          {lastStateAccessibleForms.filter((a) => a.id == selectedForm.id)
            .length == 0 &&
            accessibleForms.filter((a) => a.id == selectedForm.id).length ==
              0 && (
              <div className="unauth-msg">You do not have access to this!</div>
            )}
        </div>
      )}
      {option === "my" && (
        <MyRequests
          detailColumns={detailColumns}
          hiddenColumns={hiddenColumns}
          form={selectedForm}
          raiseAlert={props.raiseAlert}
        ></MyRequests>
      )}
      {option === "all" && (
        <AllRequests
          detailColumns={detailColumns}
          hiddenColumns={hiddenColumns}
          form={selectedForm}
          raiseAlert={props.raiseAlert}
        ></AllRequests>
      )}
      {option === "pending" && (
        <Pending
          detailColumns={detailColumns}
          hiddenColumns={hiddenColumns}
          form={selectedForm}
          raiseAlert={props.raiseAlert}
        ></Pending>
      )}
      {initiated && (
        <Form
          form={selectedForm}
          closeInit={(a, b) => setInitiated(false)}
          cancel={setInitiated}
          entry={{ ...entry, grids: gridEntries }}
          entries={[]}
          raiseAlert={props.raiseAlert}
          key={selectedForm.id}
          type={"initiate"}
        ></Form>
      )}
    </>
  );
}

export default UserDashboard;
