import { useEffect, useState } from "react";
import { config } from "../config";
import DagreGraph from "dagre-d3-react";
import DepartmentEdit from "./DepartmentEdit";

function DepartmentMgmt(props) {
  const [toggleEdit, setToggleEdit] = useState(false);
  const [selectedDept, setSelectedDept] = useState({});
  const [departments, setDepartments] = useState([]);
  const [deptNodes, setDeptNodes] = useState([]);
  const [deptHierarchy, setDeptHierarchy] = useState([]);
  const [newDept, setNewDept] = useState(false);
  const [graphReady, setGraphReady] = useState(false);

  useEffect(() => {
    getDepartments();
  }, []);

  function getDepartments() {
    fetch(config.apiUrl + "departments/", {
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
        // props.raiseAlert("green", "Fetched Roles!");
        setDepartments(actualData);
        setDeptNodes((prev) => {
          return actualData
            .filter((d) => d.parentId >= 0)
            .map((d) => {
              return {
                id: d.id + "",
                label:
                  "<p>" +
                  d.name +
                  "</p><li>" +
                  (d.site != null ? "Site:" + d.site + "  " : "") +
                  "Code:" +
                  d.code +
                  "</li>",
                labelType: "html",
                class: "dept-node",
                site: d.site,
                code: d.code,
                parentId: d.parentId,
                name: d.name,
              };
            });
        });
        setDeptHierarchy((prev) => {
          return actualData
            .filter((d) => d.parentId > 0)
            .map((d) => {
              return {
                source: d.id + "",
                target: d.parentId + "",
              };
            });
        });
        setGraphReady(true);
      });
  }

  function handleRowClick(node) {
    setGraphReady(false);
    setNewDept(false);
    setSelectedDept(node.original);
    setToggleEdit(true);
  }

  function closeWindow(check) {
    setGraphReady(false);
    setToggleEdit(check);
    getDepartments();
  }

  function addANewDept() {
    setGraphReady(false);
    setNewDept(true);
    setToggleEdit(true);
    setSelectedDept((prev) => {
      return {
        name: "",
        site: "",
        code: "",
        parentId: null,
      };
    });
  }

  return (
    <div className="f-dtl-container">
      <div className="f-dtl-head">
        <div className="f-dtl-name">Departments</div>
        <div className="i-btn" onClick={() => addANewDept()}>
          Add
        </div>
      </div>
      <div className="f-dept-table">
        {graphReady && (
          <DagreGraph
            nodes={deptNodes}
            links={deptHierarchy}
            width="100%"
            height="100%"
            shape="rect"
            fitBoundaries
            options={{ rankdir: "BT", ranksep: 100, ranker: "longest-path" }}
            zoomable
            onNodeClick={(e) => handleRowClick(e)}
            config={{ rankdir: "BT", ranksep: 100, ranker: "longest-path" }}
          ></DagreGraph>
        )}
      </div>
      {toggleEdit && selectedDept != {} && (
        <DepartmentEdit
          raiseAlert={props.raiseAlert}
          dept={selectedDept}
          closeWindow={closeWindow}
          depts={departments}
        ></DepartmentEdit>
      )}
    </div>
  );
}

export default DepartmentMgmt;
