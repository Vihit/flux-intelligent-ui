import { useEffect, useState } from "react";
import { config } from "../config";
import DagreGraph from "dagre-d3-react";
import DepartmentEdit from "./DepartmentEdit";

function DepartmentMgmt(props) {
  const [toggleEdit, setToggleEdit] = useState(false);
  const [selectedDept, setSelectedDept] = useState({});
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [deptNodes, setDeptNodes] = useState([]);
  const [deptHierarchy, setDeptHierarchy] = useState([]);
  const [newDept, setNewDept] = useState(false);
  const [graphReady, setGraphReady] = useState(false);

  useEffect(() => {
    getDepartments();
    getUsers();
  }, []);

  function getUsers() {
    fetch(config.apiUrl + "users/", {
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
        // props.raiseAlert("green", "Fetched Users!");
        setUsers(actualData.filter((aD) => aD["username"] !== "admin"));
      });
  }
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
                  "</li>" +
                  "<li>" +
                  (d.hod != null ? "HOD:" + d.hod + "  " : "HOD :") +
                  "</li>" +
                  "<li>" +
                  (d.designee1 != null
                    ? "Designee-1:" + d.designee1 + "  "
                    : "Designee-1 :") +
                  "</li>" +
                  "<li>" +
                  (d.designee2 != null
                    ? "Designee-2:" + d.designee2 + "  "
                    : "Designee-2 :") +
                  "</li>",
                labelType: "html",
                class: "dept-node",
                site: d.site,
                code: d.code,
                parentId: d.parentId,
                name: d.name,
                hod: d.hod,
                designee1: d.designee1,
                designee2: d.designee2,
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
      <div className="f-p-dtl-head">
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
            // fitBoundaries
            // options={{
            //   rankdir: "BT",
            //   ranksep: 100,
            //   align: "UL",
            //   ranker: "tight-tree",
            // }}
            zoomable
            onNodeClick={(e) => handleRowClick(e)}
            config={{
              rankdir: "BT",
              // align: "DL",
              ranksep: 200,
              ranker: "tight-tree",
              edgesep: 20,
            }}
          ></DagreGraph>
        )}
      </div>
      {toggleEdit && selectedDept != {} && (
        <DepartmentEdit
          raiseAlert={props.raiseAlert}
          dept={selectedDept}
          closeWindow={closeWindow}
          depts={departments}
          users={users}
        ></DepartmentEdit>
      )}
    </div>
  );
}

export default DepartmentMgmt;
