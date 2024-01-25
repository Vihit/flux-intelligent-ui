import { useEffect, useRef, useState } from "react";
import Form from "./Form";
import "./UserFormDetail.css";
import { config } from "./config";
import MaterialReactTable from "material-react-table";
import { Box, IconButton, Button } from "@mui/material";
import { AccessTime, Fullscreen } from "@mui/icons-material";
import LogAudit from "./LogAudit";
import { Typography } from "@mui/material/";

function UserFormDetail(props) {
  const [initiated, setInitiated] = useState(false);
  const [entry, setEntry] = useState({ id: -1 });
  const [allEntries, setAllEntries] = useState([]);
  const [gridEntries, setGridEntries] = useState([]);
  const [initiatedAudit, setInitiatedAudit] = useState(false);
  const hiddenFileInput = useRef(null);
  const [type, setType] = useState(props.type);
  const handleClick = (event) => {
    hiddenFileInput.current.click();
  };
  const [file, setFile] = useState();

  useEffect(() => {
    setType(props.type);
  }, [props.type]);
  function handleFileChange(e) {
    if (e.target.files) {
      const f = new FormData();
      f.append("file", e.target.files[0]);
      fetch(config.apiUrl + "master/entry/bulk/upload/" + props.form.id, {
        method: "POST",
        headers: {
          Authorization:
            "Bearer " + JSON.parse(localStorage.getItem("access")).access_token,
        },
        body: f,
      }).then((response) => {
        if (response.ok) {
          props.raiseAlert("green", "Data Uploaded");
          props.updateData(props.type, props.form);
        }
      });
    }
  }

  async function openFormView(row) {
    setEntry(row.original);
    await getAllForEntry(props.form.id, row.original.id);
    setInitiated(true);
  }

  async function openAuditView(row) {
    await getAllForEntry(props.form.id, row.original.id);
    setInitiatedAudit(true);
  }

  async function getAllForEntry(formId, entryId) {
    try {
      const response = await fetch(
        config.apiUrl + "entry/metadata/" + formId + "/" + entryId,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization:
              "Bearer " +
              JSON.parse(localStorage.getItem("access")).access_token,
          },
        }
      );

      if (response.ok) {
        const actualData = await response.json();
        setAllEntries(actualData);
      }
    } catch (error) {
      // Handle errors here
      console.error("Error fetching data:", error);
    }
  }

  function getGridEntriesFor(formId, entryId) {
    fetch(config.apiUrl + "entry/grid/" + formId + "/" + entryId, {
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
        setGridEntries(actualData);
      });
  }

  function updateAndCloseInit(f) {
    setInitiated(false);
    props.updateData(props.type, f);
  }

  function closeLogAudit() {
    setInitiatedAudit(false);
  }

  return (
    <div className="f-dtl-container">
      {/* <div className="f-dtl-head">
        <div className="f-dtl-name">{props.form.name}</div>
        {props.type === "initiate" && (
          <div className="i-btn" onClick={() => setInitiated(true)}>
            {props.form.workflow.states.filter((st) => st.firstState)[0].label}
          </div>
        )}
        {props.type === "view" &&
          props.form.app.name === "Master Data Management" && (
            <div className="btns">
              <div className="i-btn">
                <a
                  href={
                    config.apiUrl +
                    "master/entry/bulk/template/" +
                    props.form.id
                  }
                  target="_blank"
                  download
                >
                  Download Bulk Upload Template
                </a>
              </div>
              <div className="i-btn" onClick={handleClick}>
                Bulk Upload
                <input
                  type="file"
                  ref={hiddenFileInput}
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />
              </div>
            </div>
          )}
      </div> */}
      <div className="f-dtl"></div>
      <div className="f-table">
        <MaterialReactTable
          columns={props.tableData.header}
          data={props.tableData.rows}
          enableStickyHeader
          enableStickyFooterenableTopToolbar={true}
          renderTopToolbarCustomActions={({ table }) => (
            <Box sx={{ display: "flex", gap: "1rem", p: "4px" }}>
              <Typography
                variant="h6"
                style={{
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  fontFamily: "Poppins",
                }}
              >
                {props.form.name}
              </Typography>
              {props.type === "initiate" && (
                <div className="i-btn" onClick={() => setInitiated(true)}>
                  {
                    props.form.workflow.states.filter((st) => st.firstState)[0]
                      .label
                  }
                </div>
              )}
              {props.type === "view" &&
                props.form.app.name === "Master Data Management" && (
                  <div className="btns">
                    <div className="i-btn">
                      <a
                        href={
                          config.apiUrl +
                          "master/entry/bulk/template/" +
                          props.form.id
                        }
                        target="_blank"
                        download
                      >
                        Download Bulk Upload Template
                      </a>
                    </div>
                    <div className="i-btn" onClick={handleClick}>
                      Bulk Upload
                      <input
                        type="file"
                        ref={hiddenFileInput}
                        onChange={handleFileChange}
                        style={{ display: "none" }}
                      />
                    </div>
                  </div>
                )}
            </Box>
          )}
          enableRowActions={
            type === "pending" || type === "view" || type === "view-all"
          }
          renderRowActions={({ row }) => (
            <Box className="c-actions">
              {type === "pendings" ? (
                <IconButton onClick={() => openFormView(row)}>
                  <Fullscreen />
                </IconButton>
              ) : (
                <div>
                  <IconButton onClick={() => openAuditView(row)}>
                    <AccessTime
                      style={{ color: "#00ffee" }}
                      className="a-icon"
                    />
                  </IconButton>
                  <IconButton onClick={() => openFormView(row)}>
                    <Fullscreen />
                  </IconButton>
                </div>
              )}
            </Box>
          )}
          muiTableContainerProps={{
            sx: {
              maxHeight: "550px",
              maxWidth: "100%",
              overflowX: "auto",
            },
          }}
          initialState={{
            density: "compact",
            columnVisibility: { id: false },
          }}
          muiTableHeadCellProps={{
            sx: {
              fontWeight: "bold",
              fontSize: "14px",
              backgroundColor: "var(--white)",
              color: "var(--dark)",
              border: "1px solid",
              fontFamily: "Poppins",
            },
          }}
          muiTableBodyCellProps={{
            sx: {
              backgroundColor: "var(--grey)",
              borderRight: "0.1px solid var(--white)",
              fontFamily: "Poppins",
            },
          }}
          muiTableBodyRowProps={({ row }) => ({
            onClick: (event) => {
              getGridEntriesFor(props.form.id, row.original.id);
            },
          })}
          muiTableBodyProps={{
            sx: {
              margin: "20px",
            },
          }}
        ></MaterialReactTable>
      </div>
      {JSON.parse(props.form.template)
        .controls.flatMap((f) => f)
        .filter((ctrl) => ctrl.type === "grid").length > 0 &&
        gridEntries.map((data, indx) => {
          var matCols = data.columns.split(",").map((col) => {
            return {
              accessorKey: col,
              header: col.replaceAll("_", " ").toUpperCase(),
            };
          });
          var rows = [];

          data.data.forEach((dt) => {
            let obj = {};
            data.columns.split(",").forEach((col) => {
              obj[col] = dt.data[col];
            });
            rows.push(obj);
          });

          return (
            <div className="f-table" key={indx}>
              <div className="f-table">
                <MaterialReactTable
                  columns={matCols}
                  data={rows}
                  enableStickyHeader
                  enableStickyFooter
                  enableTopToolbar={true}
                  renderTopToolbarCustomActions={({ table }) => (
                    <Typography
                      variant="h10"
                      style={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {data.grid.toUpperCase()}
                    </Typography>
                  )}
                  muiTableBodyProps={{
                    sx: {
                      margin: "20px",
                    },
                  }}
                  muiTableContainerProps={{
                    sx: {
                      maxHeight: "550px",
                      maxWidth: "100%",
                      overflowX: "auto",
                    },
                  }}
                  initialState={{
                    density: "compact",
                    columnVisibility: { id: false, log_entry_id: false },
                  }}
                  muiTableHeadCellProps={{
                    sx: {
                      fontWeight: "bold",
                      fontSize: "12px",
                      backgroundColor: "var(--white)",
                      color: "var(--dark)",
                      border: "1px solid",
                      fontFamily: "Poppins",
                    },
                  }}
                  muiTableBodyCellProps={{
                    sx: {
                      backgroundColor: "var(--grey)",
                      borderRight: "0.1px solid var(--white)",
                      fontFamily: "Poppins",
                      fontSize: "13px",
                    },
                  }}
                ></MaterialReactTable>
              </div>
            </div>
          );
        })}
      {initiated && (
        <Form
          form={props.form}
          closeInit={updateAndCloseInit}
          cancel={setInitiated}
          entry={{ ...entry, grids: gridEntries }}
          entries={allEntries.sort((a, b) => {
            return a.data.id > b.data.id ? 1 : -1;
          })}
          raiseAlert={props.raiseAlert}
          key={props.form.id}
          type={props.type}
        ></Form>
      )}
      {initiatedAudit && allEntries.length > 0 && (
        <LogAudit
          form={props.form}
          entries={allEntries.sort((a, b) => {
            return a.data.id > b.data.id ? 1 : -1;
          })}
          closeInit={closeLogAudit}
        ></LogAudit>
      )}
    </div>
  );
}

export default UserFormDetail;
