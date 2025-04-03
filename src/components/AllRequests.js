import { useEffect, useRef, useState } from "react";
import Form from "./Form";
import "./UserFormDetail.css";
import { config } from "./config";
import MaterialReactTable from "material-react-table";
import { Box, IconButton, Button } from "@mui/material";
import { AccessTime, Fullscreen, Add, Remove } from "@mui/icons-material";
import LogAudit from "./LogAudit";
import { Typography } from "@mui/material/";
import { jsPDF } from "jspdf";

function AllRequests(props) {
  const [columnFilters, setColumnFilters] = useState([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [totalRows, setTotalRows] = useState(-1);
  const [initiated, setInitiated] = useState(false);
  const [entry, setEntry] = useState({ id: -1 });
  const [allEntries, setAllEntries] = useState([]);
  const [gridEntries, setGridEntries] = useState([]);
  const [initiatedAudit, setInitiatedAudit] = useState(false);
  const [tableData, setTableData] = useState({ rows: [], header: [] });
  const [gridLogEntryId, setGridLogEntryId] = useState(-1);
  const [logEntryId, setLogEntryId] = useState(-1);

  useEffect(() => {
    props.raiseAlert("loading", "start");
    getAllLogEntries(props.form);
  }, [pagination, columnFilters]);

  function getAllLogEntries(f) {
    fetch(
      config.apiUrl +
        "entry/" +
        f.id +
        "/last-state/?pageSize=" +
        pagination.pageSize +
        "&pageNumber=" +
        pagination.pageIndex +
        "&totalRows=" +
        totalRows,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization:
            "Bearer " + JSON.parse(localStorage.getItem("access")).access_token,
        },
        body: JSON.stringify(columnFilters),
      }
    )
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
      })
      .then((actualData) => {
        props.raiseAlert("green", "Fetched Entries");
        var fKL = reduceLabels(
          JSON.parse(f.template)
            ["controls"].flatMap((ctrl) => ctrl)
            .filter((ctrl) => !["grid", "section-heading"].includes(ctrl.type))
        );
        var fLabels = fKL.fLabels.concat([
          "ID",
          "State",
          "Created By",
          "Log Create Dt",
          "Updated By",
          "Log Update Dt",
        ]);

        var matCols = [];
        var fKeys = fKL.fKeys.concat([
          "id",
          "state",
          "created_by",
          "log_create_dt",
          "updated_by",
          "log_update_dt",
        ]);
        var settings = JSON.parse(f.settings);
        var filterColumns = settings?.view?.filters;
        fKeys.forEach((element, inx) => {
          matCols.push({
            accessorKey: element,
            header: fLabels[inx],
            enableColumnFilter: filterColumns?.split(",").includes(element),
          });
        });
        setTableData({ rows: actualData.data, header: matCols });
        setTotalRows(actualData.totalRows);
        props.raiseAlert("loading", "end");
      });
  }

  function reduceLabels(arr) {
    let keyMap = new Map();

    arr.forEach(({ key, label }) => {
      if (keyMap.has(key)) {
        keyMap.set(key, keyMap.get(key) + "/" + label);
      } else {
        keyMap.set(key, label);
      }
    });

    let fKeys = Array.from(keyMap.keys());
    let fLabels = Array.from(keyMap.values());

    return { fKeys, fLabels };
  }

  const detailPanel =
    props.detailColumns.length > 0 &&
    JSON.parse(props.form.template)
      .controls.flatMap((f) => f)
      .filter((ctrl) => ctrl.type === "grid").length > 0
      ? (row, table) => {
          return (
            <Box
              sx={{
                backgroundColor: "var(--main)",
                padding: "2rem",
                fontSize: "1.4rem",
                fontFamily: "Poppins",
                letterSpacing: "-0.06rem",
                display: "flex",
                gap: "2rem",
                flexWrap: "wrap",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "row",
              }}
            >
              {props.detailColumns.map((c, i) => {
                return (
                  <Box
                    key={i}
                    sx={{
                      display: "flex",
                      gap: "1rem",
                      borderRadius: "2rem",
                      border: "0.1rem solid var(--black)",
                      boxShadow: "0.05rem 0.05rem 0.5rem rgba(0, 0, 0, 0.2)",
                      overflow: "hidden",
                    }}
                  >
                    <Box
                      sx={{
                        fontWeight: 400,
                        padding: "0.5rem 1rem",
                        backgroundColor: "white",
                      }}
                    >
                      {c.label}
                    </Box>
                    <Box
                      sx={{
                        backgroundColor: "var(--accent)",
                        padding: "0.5rem 2rem",
                        fontWeight: "500",
                      }}
                    >
                      {row.row.original[c.key]}
                    </Box>
                  </Box>
                );
              })}
              <Box sx={{ width: "100%" }}>
                {logEntryId == gridLogEntryId &&
                  JSON.parse(props.form.template)
                    .controls.flatMap((f) => f)
                    .filter((ctrl) => ctrl.type === "grid").length > 0 &&
                  gridEntries.map((data, indx) => {
                    var matCols = [];
                    var fKL = reduceLabels(
                      data.columns.split(",").map((c, i) => {
                        return { key: c, label: data.labels.split(",")[i] };
                      })
                    );
                    fKL.fKeys.forEach((element, inx) => {
                      matCols.push({
                        accessorKey: element,
                        header: fKL.fLabels[inx],
                      });
                    });
                    // var matCols = data.columns.split(",").map((col, inx) => {
                    //   return {
                    //     accessorKey: col,
                    //     header: data.labels.split(",")[inx],
                    //   };
                    // });
                    var rows = [];
                    data.data.data.forEach((dt) => {
                      let obj = {};
                      data.columns.split(",").forEach((col) => {
                        obj[col] = dt[col];
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
                            enableToolbarInternalActions={false}
                            enableBottomToolbar={false}
                            renderTopToolbarCustomActions={({ table }) => (
                              <Typography
                                variant="h10"
                                style={{
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  fontFamily: "Poppins",
                                  fontSize: "1.6rem",
                                  alignSelf: "center",
                                  padding: "1rem",
                                  background: "var(--main)",
                                  borderRadius: "1rem",
                                  fontWeight: "500",
                                  letterSpacing: "-0.05rem",
                                }}
                              >
                                {data.gridLabel}
                              </Typography>
                            )}
                            muiTableBodyProps={{
                              sx: {
                                margin: "2rem",
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
                              columnVisibility: {
                                id: false,
                                log_entry_id: false,
                              },
                            }}
                            muiTableHeadCellProps={{
                              sx: {
                                fontWeight: "500",
                                fontSize: "1.3rem",
                                backgroundColor: "var(--dark)",
                                color: "var(--black)",
                                border: "1px solid var(--dark)`",
                                fontFamily: "Poppins",
                                height: "3rem",
                                lineHeight: "3.2rem",
                              },
                            }}
                            muiTableBodyCellProps={{
                              sx: {
                                backgroundColor: "var(--white)",
                                borderRight: "0.1px solid var(--main)",
                                fontFamily: "Poppins",
                                fontSize: "1.3rem",
                              },
                            }}
                          ></MaterialReactTable>
                        </div>
                      </div>
                    );
                  })}
              </Box>
            </Box>
          );
        }
      : false;

  const handleExportRows = (rows, table) => {
    const columnVisibility = table.getState().columnVisibility;
    const doc = new jsPDF("p", "pt");
    const tableHeaders = tableData.header
      .filter(
        (c) => columnVisibility[c.id] == undefined || columnVisibility[c.id]
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
      }
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
        pageWidth - 28
      );
      if (i == pageCount) {
        doc.text(splits, pageWidth / 2, pageHeight - 20, { align: "center" });
        doc.text(
          String("Total Records : " + rows.length),
          pageWidth / 2,
          pageHeight - 10,
          { align: "center" }
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
    setLogEntryId(row.original.id);
    setEntry(row.original);
    await getAllForEntry(props.form.id, row.original.id);
    setInitiated(true);
  }

  async function openAuditView(row) {
    setLogEntryId(row.original.id);
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
        setAllEntries(actualData.data);
      }
    } catch (error) {
      // Handle errors here
      console.error("Error fetching data:", error);
    }
  }

  function getGridEntriesFor(formId, entryId) {
    props.raiseAlert("loading", "start");
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
        setGridLogEntryId(entryId);
        props.raiseAlert("loading", "end");
      });
  }

  function closeLogAudit() {
    setInitiatedAudit(false);
  }

  return (
    <div className="f-dtl-container" style={{ marginTop: "0rem" }}>
      <div className="f-table">
        <MaterialReactTable
          columns={tableData.header}
          data={tableData.rows}
          enableStickyHeader
          enableStickyFooter
          enableTopToolbar={false}
          enableRowActions
          renderRowActions={({ row }) => (
            <Box className="c-actions">
              {
                <div>
                  <IconButton onClick={() => openAuditView(row)}>
                    <AccessTime
                      style={{}}
                      sx={{ fontSize: "3rem" }}
                      // className="a-icon"
                    />
                  </IconButton>
                  <IconButton onClick={() => openFormView(row)}>
                    <Fullscreen sx={{ fontSize: "3rem" }} />
                  </IconButton>
                </div>
              }
            </Box>
          )}
          renderDetailPanel={detailPanel}
          initialState={{
            density: "compact",
            columnVisibility: {
              ...props.hiddenColumns,
            },
          }}
          muiExpandButtonProps={({ row, table }) => ({
            onClick: () =>
              table.setExpanded({ [row.id]: !row.getIsExpanded() }),
            children: row.getIsExpanded() ? (
              <Remove />
            ) : (
              <Add
                onClick={() => {
                  setLogEntryId(row.original.id);
                  getGridEntriesFor(props.form.id, row.original.id);
                }}
              />
            ),
          })}
          onColumnFiltersChange={setColumnFilters}
          onPaginationChange={setPagination}
          state={{ pagination }}
          rowCount={totalRows}
          manualPagination={true}
          pageCount={Math.ceil(totalRows / pagination.pageSize)}
          muiTableContainerProps={config.mrtStyle.muiTableContainerProps}
          muiTableBodyRowProps={({ row }) => ({
            onClick: (event) => {
              getGridEntriesFor(props.form.id, row.original.id);
            },
            sx: {
              backgroundColor: "var(--white) !important",
              borderBottom: "0.1rem solid var(--main)",
            },
          })}
          muiTableHeadCellColumnActionsButtonProps={
            config.mrtStyle.muiTableHeadCellColumnActionsButtonProps
          }
          muiTableHeadCellFilterTextFieldProps={
            config.mrtStyle.muiTableHeadCellFilterTextFieldProps
          }
          muiTableHeadCellProps={config.mrtStyle.muiTableHeadCellProps}
          muiTableBodyCellProps={config.mrtStyle.muiTableBodyCellProps}
          muiTableBodyProps={config.mrtStyle.muiTableBodyProps}
          muiBottomToolbarProps={config.mrtStyle.muiBottomToolbarProps}
        ></MaterialReactTable>
      </div>
      {gridLogEntryId == logEntryId && initiated && (
        <Form
          form={props.form}
          closeInit={() => {
            setInitiated(false);
          }}
          cancel={setInitiated}
          entry={{ ...entry, grids: gridEntries }}
          entries={allEntries.sort((a, b) => {
            return a.id > b.id ? 1 : -1;
          })}
          raiseAlert={props.raiseAlert}
          key={props.form.id}
          type={props.type}
        ></Form>
      )}
      {gridLogEntryId == logEntryId &&
        initiatedAudit &&
        allEntries.length > 0 && (
          <LogAudit
            form={props.form}
            entries={allEntries.sort((a, b) => {
              return a.id > b.id ? 1 : -1;
            })}
            closeInit={closeLogAudit}
          ></LogAudit>
        )}
    </div>
  );
}

export default AllRequests;
