import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import ControlConfig from "./ControlConfig";
import ControlOption from "./ControlOption";
import CreationCell from "./CreationCell";
import CreationGrid from "./CreationGrid";
import FormPreview from "./FormPreview";
import "./FormStudio.css";
import { config } from "./config";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import DagreGraph from "dagre-d3-react";
import StateConfig from "./StateConfig";
// import * as d3 from "d3";

function FormStudio(props) {
  const [layout, setLayout] = useState([]);
  const [confVisible, setConfVisible] = useState(false);
  const [gridClicked, setGridClicked] = useState(false);
  const [stateConfVisible, setStateConfVisible] = useState(false);
  const [currStateId, setCurrStateId] = useState(0);
  const [conf, setConf] = useState([]);
  const [currCell, setCurrCell] = useState({ row: -1, col: -1 });
  const [toggleLayout, setToggleLayout] = useState(false);
  const [toggleViz, setToggleViz] = useState(false);
  const [selectedFWOption, setSelectedFWOption] = useState("form");
  const [stateRevision, setStateRevision] = useState(0);
  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [workflowConf, setWorkflowConf] = useState({
    id: null,
    states: [],
    transitions: [],
  });
  let emptyConf = {
    label: "",
    type: "",
    isRequired: false,
    key: "",
    selectValues: "",
    conditionalVisibility: false,
    conditionalCondition: "",
    conditionalValue: "",
    referData: false,
    referenceMaster: "",
    referenceFilterQuery: "",
    referenceColumn: "",
  };
  let emptyGridConf = {
    label: "",
    type: "grid",
    numCols: 1,
    controls: [
      {
        label: "",
        type: "",
        isRequired: false,
        key: "",
        selectValues: "",
        conditionalVisibility: false,
        conditionalCondition: "",
        conditionalValue: "",
        referData: false,
        referenceMaster: "",
        referenceFilterQuery: "",
        referenceColumn: "",
      },
    ],
    conditionalVisibility: false,
  };
  const [showPreview, setShowPreview] = useState(false);
  const [vizName, setVizName] = useState("");
  const [apps, setApps] = useState([]);
  const [app, setApp] = useState("");
  const [forms, setForms] = useState([]);
  const location = useLocation();
  const [id, setId] = useState(null);
  const [states, setStates] = useState([]);
  const [transitions, setTransitions] = useState([]);
  const [selectedLayoutRow, setSelectedLayoutRow] = useState(-1);

  useEffect(() => {
    if (location.state != null) {
      const template = JSON.parse(location.state.template);
      setLayout((prev) => {
        return template.layout;
      });
      setVizName(location.state.name);
      setConf((prev) => {
        return template.controls;
      });
      setApp(location.state.app.id);
      setId(location.state.id);
      setWorkflowConf((prev) => {
        return location.state.workflow != null
          ? location.state.workflow
          : {
              id: null,
              states: [],
              transitions: [],
            };
      });
      setStates(
        location.state.workflow != null
          ? location.state.workflow.states.map((st) => {
              return {
                id: st.id + "",
                label: st.name,
                labelType: "string",
                class: JSON.parse(st.firstState)
                  ? "start-node"
                  : st.endState
                  ? "end-node"
                  : "success-node",
                type: "main",
                stLabel: st.label,
                selectedRoles: st.roles.map((r) => r.id),
                selectedDepartments: st.departments.map((r) => r.id),
                isLastState: st.endState,
                isFirstState: st.firstState,
                viewableColumns: st.visibleColumns.split(","),
                writableColumns: st.disabledColumns.split(","),
                name: st.name,
                stateCondition: st.stateCondition,
                sendNotification: st.sendNotification,
                userAccessField: st.userAccessField,
              };
            })
          : []
      );
      setTransitions(
        location.state.workflow != null
          ? location.state.workflow.transitions.map((t) => {
              return {
                source: t.fromState.id,
                target: t.toState.id,
              };
            })
          : []
      );
    }
    getApps();
    getRoles();
    getDepartments();
    getForms();
  }, []);

  function getForms() {
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
        setForms(actualData);
      });
  }

  function getRoles() {
    fetch(config.apiUrl + "roles/", {
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
        setRoles(actualData);
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
        setDepartments(actualData);
      });
  }
  function getApps() {
    fetch(config.apiUrl + "apps/", {
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
        setApps(actualData);
      });
  }

  function showConf(row, col, type) {
    if (type === "grid") {
      setGridClicked(true);
    } else {
      setGridClicked(false);
    }
    if ((currCell.row !== row || currCell.col !== col) && !confVisible) {
      setCurrCell({ row: row, col: col });
      setConfVisible(!confVisible);
    } else if (currCell.row === row && currCell.col === col) {
      if (confVisible) {
        setConfVisible(!confVisible);
        setCurrCell({ row: -1, col: -1 });
      } else setCurrCell({ row: -1, col: -1 });
    } else if (confVisible) {
      setCurrCell({ row: row, col: col });
    }
  }

  function addCell(row) {
    setLayout((prev) => {
      let currLayout = [...prev];
      let rowToBeUpdated = prev[row];
      rowToBeUpdated.push(0);
      currLayout.splice(row, rowToBeUpdated);
      return currLayout;
    });
    setConf((prev) => {
      let currConf = [...conf];
      let confToBeUpdated = prev[row];
      confToBeUpdated.push(emptyConf);
      currConf.splice(row, confToBeUpdated);
      return currConf;
    });
  }

  function removeCell(row) {
    setLayout((prev) => {
      let currLayout = [...prev];
      let rowToBeUpdated = prev[row];
      rowToBeUpdated.pop();
      if (rowToBeUpdated.length === 0) currLayout.splice(row, 1);
      else currLayout.splice(row, rowToBeUpdated);
      return currLayout;
    });
    setConf((prev) => {
      let currConf = [...conf];
      let confToBeUpdated = prev[row];
      confToBeUpdated.pop();
      if (confToBeUpdated.length === 0) currConf.splice(row, 1);
      else currConf.splice(row, confToBeUpdated);
      return currConf;
    });
  }

  function convertToGrid(row, col) {
    if (layout[row].length <= 1) {
      setLayout((prev) => {
        let currLayout = [...prev];
        let rowToBeUpdated = prev[row];
        rowToBeUpdated.splice(0, 1, "1");
        currLayout.splice(row, 1, rowToBeUpdated);
        return currLayout;
      });
      setConf((prev) => {
        let currConf = [...conf];
        let confToBeUpdated = prev[row];
        confToBeUpdated.pop();
        confToBeUpdated.push(emptyGridConf);
        currConf.splice(row, confToBeUpdated);
        return currConf;
      });
    }
  }

  function addRow() {
    setLayout((prev) => {
      let currLayout = [...prev];
      if (selectedLayoutRow == -1) {
        currLayout.push([0]);
      } else {
        currLayout.splice(selectedLayoutRow + 1, 0, [0]);
      }
      return currLayout;
    });
    setConf((prev) => {
      let currConf = [...prev];
      if (selectedLayoutRow == -1) currConf.push([emptyConf]);
      else currConf.splice(selectedLayoutRow + 1, 0, [emptyConf]);
      return currConf;
    });
  }

  function toggle(what) {
    if (what === "viz") {
      setToggleViz(!toggleViz);
    } else if (what === "layout") {
      setToggleLayout(!toggleLayout);
    }
  }

  function saveConfFor(cell, updatedConf) {
    setConf((prev) => {
      let currConf = [...prev];
      let confToBeUpdated = prev[cell.row];
      confToBeUpdated.splice(parseInt(cell.col), 1, updatedConf);
      return currConf;
    });
    setConfVisible(false);
    setCurrCell({ row: -1, col: -1 });
  }
  function saveStateConfFor(cell, updatedConf) {
    updatedConf["label"] = updatedConf["stLabel"];
    setStates((prev) => {
      let currStates = [...prev];
      let confToBeUpdated = currStates.filter((st) => st.id !== cell);
      confToBeUpdated.push(updatedConf);
      return confToBeUpdated;
    });
    setStateConfVisible(false);
    setCurrStateId(0);
  }

  function vizChosen(viz, row, col, prevViz) {
    setConf((prev) => {
      let currConf = [...prev];
      let confToBeUpdated = prev[row];
      if (confToBeUpdated[0]["type"] !== "grid") {
        let updatedConf = confToBeUpdated[col];

        if (prevViz == undefined) {
          if (updatedConf["type"] !== viz) {
            updatedConf = emptyConf;
          }
          updatedConf["type"] = viz;
          confToBeUpdated.splice(parseInt(col), 1, updatedConf);
        } else {
          let oldConf = updatedConf;
          updatedConf = prevViz.conf;
          confToBeUpdated.splice(parseInt(col), 1, updatedConf);
          let oldConfToBeUpdated = prev[prevViz.row];
          oldConfToBeUpdated.splice(parseInt(prevViz.col), 1, oldConf);
        }
      } else {
        let updatedConf = confToBeUpdated[0];
        let updatedControlConf = updatedConf.controls[col];
        if (updatedControlConf["type"] !== viz) {
          updatedControlConf = emptyConf;
        }
        updatedControlConf["type"] = viz;
        updatedConf.controls.splice(parseInt(col), 1, updatedControlConf);
        confToBeUpdated.splice(0, 1, updatedConf);
      }
      return currConf;
    });
  }

  function addAState() {
    setStates((prev) => {
      let toBeUpdated = [...prev];
      let d = new Date();
      toBeUpdated.push({
        id: d.getTime() + "",
        label: "Sample name",
        labelType: "string",
        class: "success-node",
        type: "main",
        selectedRoles: [],
        selectedDepartments: [],
        isLastState: false,
        isFirstState: false,
        sendNotification: false,
      });
      return toBeUpdated;
    });
  }

  function openConfForState(event) {
    setCurrStateId(event.original.id);
    setStateConfVisible(!stateConfVisible);
  }

  function saveAnalytics(state) {
    var fullConf = { controls: conf, layout: layout };
    var form = {
      id: id,
      name: vizName,
      app: { id: app },
      template: JSON.stringify(fullConf),
      workflow: {},
      columns: conf
        .flatMap((f) => f)
        .filter((c) => c.label !== "" && c.type !== "section-heading")
        .map((c) => c.label.toLowerCase().replaceAll(" ", "_"))
        .reduce((a, b) => a + "," + b),
      type:
        apps.filter((a) => a.id == app)[0].name === "Master Data Management"
          ? "master"
          : "form",
    };
    fetch(config.apiUrl + "forms/", {
      method: form.id == null ? "POST" : "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization:
          "Bearer " + JSON.parse(localStorage.getItem("access")).access_token,
      },
      body: JSON.stringify(form),
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          console.log("Error");
          props.raiseAlert("red", "Some error occurred!", 3000);
          throw new Error("");
        }
      })
      .then((actualData) => {
        props.raiseAlert("green", "Form saved");
        setId(actualData.id);
        setWorkflowConf((prev) => {
          let toBeUpdated = { ...prev };
          toBeUpdated.id = actualData.workflow.id;
          return toBeUpdated;
        });
      });
  }

  function addTransition(from, to) {
    setTransitions((prev) => {
      let toBeUpdated = [...prev];
      toBeUpdated.push({
        source: from,
        target: to,
      });
      return toBeUpdated;
    });
  }

  function removeTransition(from, to) {
    setTransitions((prev) => {
      let toBeUpdated = [...prev];
      return toBeUpdated.filter((t) => !(t.source == from && t.target == to));
    });
  }

  function saveWorkflow() {
    let stateWorkflow = {
      workflowId: workflowConf.id,
      states: states.map((st) => {
        return {
          stateId: st.id,
          workflowId: workflowConf.id,
          name: st.name,
          label: st.stLabel,
          visibleColumns: st.viewableColumns.join(","),
          disabledColumns: st.writableColumns.join(","),
          endState: st.isLastState,
          firstState: st.isFirstState,
          stateCondition: st.stateCondition,
          userAccessField: st.userAccessField,
          roles: st.selectedRoles.map((r) => {
            return { id: r };
          }),
          departments: st.selectedDepartments.map((r) => {
            return { id: r };
          }),
          sendNotification: st.sendNotification,
        };
      }),
      transitions: transitions.map((t) => {
        return {
          fromState: t.source,
          toState: t.target,
        };
      }),
    };
    fetch(config.apiUrl + "states/", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization:
          "Bearer " + JSON.parse(localStorage.getItem("access")).access_token,
      },
      body: JSON.stringify(stateWorkflow),
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
      })
      .then((actualData) => {
        props.raiseAlert("green", "States saved");
        setStates((prev) => {
          let toBeUpdated = [...prev];
          return toBeUpdated.map((dt) => {
            dt["stateId"] = actualData.states.filter(
              (st) => st.name === dt.name
            )[0].id;
            return dt;
          });
        });
      });
  }

  function deleteState(id) {
    setStates((prev) => {
      let toBeUpdated = [...prev];
      return toBeUpdated.filter((u) => u.id != id);
    });
    setTransitions((prev) => {
      let toBeUpdated = [...prev];
      return toBeUpdated.filter((t) => !(t.source == id || t.target == id));
    });
    setStateConfVisible(false);
    setCurrStateId(0);
  }

  const delay = (ms) => new Promise((res) => setTimeout(res, ms));
  const delayWith = (ms, fn) =>
    new Promise((resolve, reject) =>
      setTimeout(() => {
        resolve(fn);
      }, ms)
    );

  async function generateForm() {
    setLayout([]);
    setConf([]);
    if (vizName != undefined && vizName != null && vizName.length > 0) {
      props.raiseAlert("loading", "start");
      fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization:
            "Bearer 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",
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "user",
              content:
                "give me proper html code for an elaborate " +
                vizName +
                " form with section headers as h3 and without css",
            },
          ],
          temperature: 1.0,
        }),
      })
        .then((response) => {
          if (response.ok) {
            return response.json();
            // return config.chatGPTResponse;
          } else {
            props.raiseAlert("loading", "end");
            props.raiseAlert(
              "red",
              "Some error occurred! Please try again later.",
              3000
            );
            return config.chatGPTResponse;
          }
        })
        .then((actualData) => {
          parseResponse(actualData);
        })
        .catch((error) => {
          console.log(error);
          props.raiseAlert("loading", "end");
          props.raiseAlert(
            "red",
            "Some error occurred! Please try again later.",
            3000
          );
        });
      // parseResponse(config.chatGPTResponse);
    } else {
      props.raiseAlert("red", "Please fill up Form Name", 3000);
    }
  }

  async function parseResponse(chatGPTResponse) {
    let response = chatGPTResponse["choices"][0]["message"]["content"];
    let htmlCode = response.split("```")[1];
    var controls = [];

    var parser = new DOMParser();
    var doc = parser.parseFromString(htmlCode, "text/html");
    var formElements = doc.body.children;
    console.log(formElements);
    var form = null;
    for (var i = 0; i < formElements.length; i++) {
      if (formElements[i].localName === "form") {
        form = formElements[i];
        break;
      }
    }
    console.log(form);
    if (form != null) {
      // var labels = form.getElementsByTagName("label");
      var children = form.children;
      for (var l = 0; l < children.length; l++) {
        var elem = children[l];
        var control = {};
        if (elem.tagName === "H3") {
          control["type"] = "section-heading";
          control["label"] = elem.innerHTML;
          controls.push(control);
        } else if (elem.tagName === "LABEL") {
          // var label = labels[l];

          var labelName = elem.innerHTML.replace(/[^\w\s]/gi, "");
          control["label"] = labelName;
          control["key"] = labelName.replaceAll(" ", "_");
          var f = elem.htmlFor;
          var input = doc.getElementById(f);
          control["isRequired"] = input.required ? true : false;
          if (input.tagName === "INPUT") {
            if (input.type === "text") {
              control["type"] = "text";
            } else if (input.type === "date") {
              control["type"] = "datetime";
            } else if (input.type === "file") {
              control["type"] = "attachment";
            } else {
              control["type"] = "text";
            }
          } else if (input.tagName === "TEXTAREA") {
            control["type"] = "textarea";
          } else if (input.tagName === "SELECT") {
            control["type"] = "select";
            var arrValues = [];
            for (var i = 0; i < input.children.length; i++) {
              if (
                input.children[i].value != null &&
                input.children[i].value !== ""
              ) {
                arrValues.push(input.children[i].innerHTML);
              }
            }
            control["selectValues"] = arrValues.join(",");
          }
          controls.push(control);
        }
      }

      for (var c = 0; c < controls.length; c++) {
        delayWith(1000 * c, c).then((c) => {
          let control = controls[c];
          setLayout((prev) => {
            let toBeUpdated = [...prev];
            toBeUpdated.push([0]);
            return toBeUpdated;
          });
          setConf((prev) => {
            let toBeUpdated = [...prev];
            toBeUpdated.push([control]);
            return toBeUpdated;
          });
        });
      }
    } else {
      props.raiseAlert(
        "red",
        "Some error occurred! Please try again later.",
        3000
      );
    }
    props.raiseAlert("loading", "end");
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="create-container">
        <div className="components-container">
          <div className="form-workflow-container">
            <div
              className={
                "fw-option " +
                (selectedFWOption === "form" ? "fw-option-selected" : "")
              }
              onClick={() => setSelectedFWOption("form")}
            >
              Form
            </div>
            <div
              className={
                "fw-option " +
                (selectedFWOption === "workflow" ? "fw-option-selected" : "")
              }
              onClick={() => {
                if (workflowConf.id != null) setSelectedFWOption("workflow");
                else
                  props.raiseAlert("red", "Save the form to add a workflow!");
              }}
            >
              Workflow
            </div>
          </div>
          <div className="app-name-container">
            <select value={app} onChange={(e) => setApp(e.target.value)}>
              <option value={""}>Select an App</option>
              {apps.map((app, idx) => {
                return (
                  <option key={idx} value={app.id}>
                    {app.name}
                  </option>
                );
              })}
            </select>
          </div>
          <div className="layout-container">
            <div className="layout">
              <div
                className="component-header"
                onClick={() => toggle("layout")}
              >
                <div>Layout</div>
                {toggleLayout && (
                  <div>
                    <i className="fa-solid fa-minus"></i>
                  </div>
                )}
                {!toggleLayout && (
                  <div>
                    <i className="fa-solid fa-plus"></i>
                  </div>
                )}
              </div>
              {toggleLayout &&
                layout.map((rows, idx) => {
                  return (
                    <div className="layout-row" key={idx}>
                      <i
                        className="fa-solid fa-minus layout-add"
                        onClick={() => removeCell(idx)}
                      ></i>
                      <div
                        className={
                          selectedLayoutRow == idx
                            ? "selected-layout-row"
                            : "layout-cells"
                        }
                        onClick={() => setSelectedLayoutRow(idx)}
                      >
                        {rows.map((r, inx) => {
                          return (
                            <i
                              key={inx}
                              className={
                                r == 0
                                  ? "fa-solid fa-square layout-cell"
                                  : "fa-solid fa-grip layout-cell"
                              }
                              onClick={() => convertToGrid(idx, inx)}
                            ></i>
                          );
                        })}
                      </div>
                      <i
                        className="fa-solid fa-plus layout-add"
                        onClick={() => addCell(idx)}
                      ></i>
                    </div>
                  );
                })}
              {toggleLayout && (
                <div className="add-row" onClick={addRow}>
                  <i className="fa-solid fa-plus"></i>
                </div>
              )}
            </div>
          </div>
          <div className="viz-container">
            <div className="component-header" onClick={() => toggle("viz")}>
              <div>Control Options</div>
              {toggleViz && (
                <div>
                  <i className="fa-solid fa-minus"></i>
                </div>
              )}
              {!toggleViz && (
                <div>
                  <i className="fa-solid fa-plus"></i>
                </div>
              )}
            </div>
            {toggleViz && (
              <div className="viz-options">
                <div className="viz-option-container">
                  <ControlOption type="text"></ControlOption>
                  <ControlOption type="select"></ControlOption>
                  <ControlOption type="textarea"></ControlOption>
                  <ControlOption type="radio"></ControlOption>
                  <ControlOption type="checkbox"></ControlOption>
                </div>
                <div className="viz-option-container">
                  <ControlOption type="barcode"></ControlOption>
                  <ControlOption type="datetime"></ControlOption>
                  <ControlOption type="button"></ControlOption>
                  <ControlOption type="user"></ControlOption>
                  <ControlOption type="all-users"></ControlOption>
                </div>
                <div className="viz-option-container">
                  <ControlOption type="multiselect"></ControlOption>
                  <ControlOption type="attachment"></ControlOption>
                  <ControlOption type="section-heading"></ControlOption>
                </div>
              </div>
            )}
          </div>
          <div className="preview">
            <button
              className="preview-btn"
              onClick={() => {
                setShowPreview(!showPreview);
                setConfVisible(false);
                setCurrCell({ row: -1, col: -1 });
              }}
            >
              Preview
            </button>
            <button
              className="save-btn"
              onClick={() => {
                if (selectedFWOption === "form") saveAnalytics("Draft");
                else saveWorkflow();
              }}
            >
              Save
            </button>
          </div>
        </div>
        {selectedFWOption === "form" && (
          <div className="creation-container">
            <div className="viz-details">
              <div className="form-viz-name">
                <input
                  type="text"
                  placeholder="Form Name*"
                  value={vizName}
                  onChange={(e) => setVizName(e.target.value)}
                ></input>
              </div>
              <div className="ai-create-btn" onClick={generateForm}>
                <i className="fa-solid fa-hat-wizard"></i>Generate with AI
              </div>
            </div>
            {layout.map((rows, idx) => {
              return (
                <div
                  key={idx}
                  className="creation-row"
                  // style={{ height: "calc(100%/" + layout.length + ")" }}
                >
                  {rows.map((row, inx) => {
                    return row == 0 ? (
                      <CreationCell
                        rowId={idx}
                        colId={inx}
                        totalCells={rows.length}
                        showConf={showConf}
                        conf={conf[idx][inx]}
                        key={"1" + idx + "" + inx}
                        clicked={idx === currCell.row && inx === currCell.col}
                        vizChosen={vizChosen}
                      ></CreationCell>
                    ) : (
                      <CreationGrid
                        rowId={idx}
                        colId={inx}
                        totalCells={rows.length}
                        showConf={showConf}
                        conf={conf[idx][inx]}
                        key={"1" + idx + "" + inx}
                        clicked={idx === currCell.row && inx === currCell.col}
                        vizChosen={vizChosen}
                      ></CreationGrid>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}
        {selectedFWOption === "workflow" && (
          <div className="workflow-creation-container">
            <div className="viz-details">
              <div className="create-btn" onClick={() => addAState()}>
                Add a State
              </div>
            </div>
            <div className="wf-creation-container">
              <DagreGraph
                nodes={states}
                links={transitions}
                width="100%"
                height="100%"
                shape="ellipse"
                fitBoundaries
                zoomable
                onNodeClick={(e) => openConfForState(e)}
                config={{
                  rankdir: "LR",
                  ranksep: 100,
                  ranker: "network-simplex",
                }}
              ></DagreGraph>
            </div>
          </div>
        )}
      </div>
      {selectedFWOption === "form" &&
        conf.length > 0 &&
        confVisible &&
        app !== "" && (
          <ControlConfig
            confVisible={confVisible}
            currCell={currCell}
            conf={
              !gridClicked && conf[currCell.row][0].type === "grid"
                ? conf[currCell.row][0].controls[currCell.col]
                : conf[currCell.row][currCell.col]
            }
            key={currCell.row + "" + currCell.col}
            otherControls={
              !gridClicked && conf[currCell.row][0].type === "grid"
                ? conf[currCell.row][0].controls.map((f) => f.label)
                : conf.flatMap((f) => f).map((f) => f.label)
            }
            saveConf={saveConfFor}
            app={apps.filter((a) => a.id == app)[0]}
            masters={forms.filter((f) => f.type === "master")}
            gridConf={!gridClicked && conf[currCell.row][0].type === "grid"}
            fullConf={conf}
          ></ControlConfig>
        )}
      {selectedFWOption === "workflow" && stateConfVisible && app !== "" && (
        <StateConfig
          confVisible={stateConfVisible}
          currCell={currStateId}
          conf={states.filter((st) => st.id === currStateId)[0]}
          key={currStateId}
          saveConf={saveStateConfFor}
          states={states}
          addTransition={addTransition}
          removeTransition={removeTransition}
          transitions={transitions}
          roles={roles}
          departments={departments}
          deleteState={deleteState}
          formColumns={conf
            .flatMap((f) => f)
            .filter((c) => c.label !== "")
            .map((c) => c.label)}
        ></StateConfig>
      )}
      {showPreview && (
        <FormPreview
          conf={conf}
          layout={layout}
          vizName={vizName}
          closePreview={setShowPreview}
        />
      )}
    </DndProvider>
  );
}

export default FormStudio;
