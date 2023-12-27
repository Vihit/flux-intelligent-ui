import { useEffect, useState } from "react";
import { config } from "../config";
import DepartmentEdit from "./DepartmentEdit";
import OrgTree from "react-org-tree";

function DepartmentMgmt(props) {
  const [toggleEdit, setToggleEdit] = useState(false);
  const [selectedDept, setSelectedDept] = useState({});
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [newDept, setNewDept] = useState(false);
  const [graphReady, setGraphReady] = useState(false);
  const [treeData, setTreeData] = useState({});

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
        props.raiseAlert("green", "Fetched Departments!");
        setDepartments(actualData);
        var rootDept = actualData.filter((d) => d.parentId == 0)[0];
        var data = {
          id: rootDept.id,
          label: rootDept.name,
          dept: rootDept,
          children: [],
        };
        var otherDepts = actualData.filter((d) => d.parentId > 0);
        otherDepts.sort(function (a, b) {
          return a.id > b.id;
        });

        otherDepts.forEach((dept) => {
          findAndAddChild(data, dept);
        });
        setTreeData(data);
        setGraphReady(true);
      });
  }

  function findAndAddChild(tree, dept) {
    if (tree.id == dept.parentId) {
      tree["children"].push({
        id: dept.id,
        label: dept.name,
        dept: dept,
        children: [],
        onClick: handleRowClick,
      });
    } else {
      tree.children.forEach((treeNode) => {
        findAndAddChild(treeNode, dept);
      });
    }
  }
  function handleRowClick(e, node) {
    setGraphReady(false);
    setNewDept(false);
    setSelectedDept(node.dept);
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
          <div className="tree-org">
            <OrgTree
              data={treeData}
              horizontal={false}
              collapsable={true}
              expandAll={false}
              labelClassName="dept-node"
              onClick={handleRowClick}
            />
          </div>
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
