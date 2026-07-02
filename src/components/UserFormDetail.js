import { useEffect, useRef, useState } from "react";
import Form from "./Form";
import "./UserFormDetail.css";
import { config } from "./config";
import MaterialReactTable from "material-react-table";
import { Box, IconButton, Button } from "@mui/material";
import { AccessTime, Fullscreen, GetApp } from "@mui/icons-material";
import LogAudit from "./LogAudit";
import { Typography } from "@mui/material/";
import { jsPDF } from "jspdf";

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
      })
        .then((response) => {
          if (response.ok) {
            return null;
          } else {
            return response.text();
          }
        })
        .then((actualData) => {
          if (actualData != null)
            props.raiseAlert("red", "Error occurred : " + actualData, 5000);
          props.raiseAlert("green", "Data Uploaded");
          props.updateData(props.type, props.form);
        });
    }
  }

  const handleExportRows = (rows, table) => {
    const columnVisibility = table.getState().columnVisibility;
    const doc = new jsPDF("p", "pt");
    const tableHeaders = props.tableData.header
      .filter(
        (c) => columnVisibility[c.id] == undefined || columnVisibility[c.id],
      )
      .map((c) => {
        return { header: c.header, id: c.id };
      });
    var tableData = rows.map((row) => {
      let out = {};
      tableHeaders
        .map((c) => c.id)
        .forEach((c) => {
          out[c] = row.original[c];
        });
      return Object.values(out);
    });

    var pageWidth =
      doc.internal.pageSize.width || doc.internal.pageSize.getWidth();
    var pageHeight =
      doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
    var header = function (data) {
      doc.rect(0, 0, pageWidth, 40, "F", [204, 204, 204]);
      var img = new Image();
      img.src = "delogo1.png";
      doc.addImage(img, "png", 10, 5, pageWidth / 12, 30);
      doc.setFontSize(18);
      doc.setTextColor("white");
      doc.text(props.form.name, pageWidth / 2, 25, { align: "center" });
      var client_logo = new Image();
      client_logo.src = "client-logo.png";
      doc.rect(pageWidth * 0.9, 1, pageWidth * 0.1, 38, "F", "#fff");
      doc.addImage(client_logo, "png", pageWidth * 0.9, 2, pageWidth * 0.1, 35);
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(18);
      doc.setTextColor(40);
      // doc.setFontStyle("normal");
      //doc.addImage(headerImgData, 'JPEG', data.settings.margin.left, 20, 50, 50);
    };

    doc.autoTable(
      tableHeaders.map((c) => c.header),
      tableData,
      {
        margin: { top: 50, left: 14, right: 14 },
        beforePageContent: header,
      },
    );

    const pageCount = doc.internal.getNumberOfPages();
    var now = new Date();
    const user = JSON.parse(localStorage.getItem("user"))[
      "fullName"
    ].replaceAll("null", "");
    for (var i = 1; i <= pageCount; i++) {
      doc.setFontSize(10).setFont(undefined, "italic", "normal");
      doc.setPage(i);

      var splits = doc.splitTextToSize(
        "This document has been generated electronically. E-signed by " +
          user +
          " at " +
          now.toLocaleDateString("en-IN", { hour12: false }) +
          " " +
          now.toLocaleTimeString("en-IN", { hour12: false }),
        pageWidth - 28,
      );
      if (i == pageCount) {
        doc.text(splits, pageWidth / 2, pageHeight - 20, { align: "center" });
        doc.text(
          String("Total Records : " + rows.length),
          pageWidth / 2,
          pageHeight - 10,
          { align: "center" },
        );
        doc.setFont(undefined, "normal", "normal");
        doc.text(String(i), pageWidth - 15, pageHeight - 10);
      } else {
        doc.text(splits, pageWidth / 2, pageHeight - 10, { align: "center" });
        doc.setFont(undefined, "normal", "normal");
        doc.text(String(i), pageWidth - 15, pageHeight - 10);
      }
    }

    doc.save(props.form.name.toLowerCase().replaceAll(" ", "_") + ".pdf");
  };

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
        },
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
      <div className="f-dtl"></div>
      <div className="f-table">
        <MaterialReactTable
          columns={props.tableData.header}
          data={props.tableData.rows}
          enableStickyHeader
          enableStickyFooterenableTopToolbar={true}
          renderTopToolbarCustomActions={({ table }) => (
            <Box sx={{ display: "flex", gap: "1rem", p: "0.4rem" }}>
              <Typography
                variant="h6"
                style={{
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  fontFamily: "Poppins",
                  fontSize: "1.8rem",
                  alignSelf: "center",
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
              {props.type === "view-all" && (
                <Button
                  disabled={table.getPrePaginationRowModel().rows.length === 0}
                  //export all rows, including from the next page, (still respects filtering and sorting)
                  onClick={() =>
                    handleExportRows(
                      table.getPrePaginationRowModel().rows,
                      table,
                    )
                  }
                  style={{
                    background: "var(--green)",
                    color: "white",
                    fontWeight: "bold",
                    textTransform: "none",
                    fontFamily: "Poppins",
                    boxShadow: "0.2rem 0.2rem 0.2rem #00000055",
                  }}
                >
                  {<GetApp />} &nbsp;Download
                </Button>
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
              minHeight: "40vh",
              maxHeight: "40vh",
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
              fontSize: "1.4rem",
              backgroundColor: "var(--white)",
              color: "var(--dark)",
              border: "0.1rem solid",
              fontFamily: "Poppins",
              height: "4rem",
              verticalAlign: "middle",
              lineHeight: "4rem",
            },
          }}
          muiTableBodyCellProps={{
            sx: {
              backgroundColor: "var(--grey)",
              borderRight: "0.01rem solid var(--white)",
              fontFamily: "Poppins",
              fontSize: "1.3rem",
              padding: "0.8rem",
            },
          }}
          muiTableBodyRowProps={({ row }) => ({
            onClick: (event) => {
              getGridEntriesFor(props.form.id, row.original.id);
            },
          })}
          muiTableBodyProps={{
            sx: {
              margin: "2rem",
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
                      margin: "2rem",
                    },
                  }}
                  muiTableContainerProps={{
                    sx: {
                      maxHeight: "55rem",
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
                      fontSize: "1.2rem",
                      backgroundColor: "var(--white)",
                      color: "var(--dark)",
                      border: "0.1rem solid",
                      fontFamily: "Poppins",
                    },
                  }}
                  muiTableBodyCellProps={{
                    sx: {
                      backgroundColor: "var(--grey)",
                      borderRight: "0.01rem solid var(--white)",
                      fontFamily: "Poppins",
                      fontSize: "1.3rem",
                      padding: "0.3rem",
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
