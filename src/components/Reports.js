import "./Reports.css";
import "./ReportEdit";
import { config } from "./config";
import { useEffect, useState } from "react";
import MaterialReactTable from "material-react-table";
import { Box, Typography, Button } from "@mui/material";
import { Fullscreen, ExitToApp, GetApp } from "@mui/icons-material";
import ReportEdit from "./ReportEdit";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

function Reports(props) {
  const [reports, setReports] = useState([]);
  const [activeReport, setActiveReport] = useState({});
  const [reportData, setReportData] = useState({ rows: [], header: [] });
  const [newReport, setNewReport] = useState(false);
  const [selectedReport, setSelectedReport] = useState({});
  const [reportEdit, setReportEdit] = useState(false);

  useEffect(() => {
    getReports();
  }, []);

  function getReports() {
    fetch(config.apiUrl + "report/", {
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
        props.raiseAlert("green", "Fetched Reports!");
        setReports(actualData.filter((report) => report.active));
      });
  }

  function setReportClicked(id) {
    const clickedReport = reports.filter((report) => report.id == id)[0];
    setActiveReport((prev) => {
      return clickedReport;
    });
    loadReportData(clickedReport);
  }

  function loadReportData(cReport) {
    fetch(config.apiUrl + "report/run/" + cReport.id, {
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
        props.raiseAlert("green", "Fetched Reports!");
        setReportData((prev) => {
          return {
            header: cReport.columns.split(",").map((col) => {
              return { accessorKey: col, header: col };
            }),
            rows: actualData.map((data) => data.data),
          };
        });
      });
  }

  function addReport() {
    setNewReport(!newReport);
    setSelectedReport((prev) => {
      return {
        name: "",
        template: "",
        columns: "",
      };
    });
  }

  const handleExportRows = (rows) => {
    const doc = new jsPDF("p", "pt");
    const tableData = rows.map((row) => Object.values(row.original));
    const tableHeaders = reportData.header.map((c) => c.header);

    var header = function (data) {
      doc.setFontSize(18);
      doc.setTextColor(40);
      // doc.setFontStyle("normal");
      //doc.addImage(headerImgData, 'JPEG', data.settings.margin.left, 20, 50, 50);
      doc.text(activeReport.name, data.settings.margin.left, 50);
    };

    doc.autoTable(tableHeaders, tableData, {
      margin: { top: 80 },
      beforePageContent: header,
    });

    doc.save(activeReport.name.toLowerCase().replaceAll(" ", "_") + ".pdf");
  };

  function closeWindow() {
    setNewReport(false);
    setReportEdit(false);
    getReports();
  }

  function editReport(r) {
    setReportEdit(true);
    setSelectedReport((prev) => {
      return r;
    });
  }

  return (
    <div className="dashboard-container">
      <div className="u-d-container">
        <div className="u-menu p-menu-sidebar">
          {reports.map((report) => {
            return (
              <div className="u-menu-head r-menu">
                <div
                  className="r-name"
                  onClick={() => setReportClicked(report.id)}
                >
                  {report.name}
                </div>
                {JSON.parse(localStorage.getItem("user")).role.includes(
                  "ROLE_ADMIN"
                ) && (
                  <i
                    className="fa-solid fa-edit"
                    onClick={() => editReport(report)}
                  ></i>
                )}
              </div>
            );
          })}
          {JSON.parse(localStorage.getItem("user")).role.includes(
            "ROLE_ADMIN"
          ) && (
            <div className="i-a-btn" onClick={() => addReport()}>
              Add New Report
            </div>
          )}
        </div>

        <div className="f-dtl-container">
          <div className="f-table">
            {activeReport.name != undefined && (
              <MaterialReactTable
                columns={reportData.header}
                data={reportData.rows}
                enableStickyHeader
                enableStickyFooter
                renderTopToolbarCustomActions={({ table }) => (
                  <Box sx={{ display: "flex", gap: "1rem", p: "4px" }}>
                    <Typography
                      variant="h6"
                      style={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        fontFamily: "Poppins",
                        fontSize: "18px",
                        alignSelf: "center",
                      }}
                    >
                      {activeReport.name}
                    </Typography>
                    <Button
                      disabled={
                        table.getPrePaginationRowModel().rows.length === 0
                      }
                      //export all rows, including from the next page, (still respects filtering and sorting)
                      onClick={() =>
                        handleExportRows(table.getPrePaginationRowModel().rows)
                      }
                      style={{
                        background: "var(--green)",
                        color: "white",
                        fontWeight: "bold",
                        textTransform: "none",
                        fontFamily: "Poppins",
                        boxShadow: "2px 2px 2px #00000055",
                      }}
                    >
                      {<GetApp />} &nbsp;Download Report
                    </Button>
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
                muiTableBodyProps={{
                  sx: {
                    margin: "20px",
                  },
                }}
              ></MaterialReactTable>
            )}
          </div>
        </div>
      </div>
      {(newReport || reportEdit) && selectedReport != {} && (
        <ReportEdit
          raiseAlert={props.raiseAlert}
          report={selectedReport}
          closeWindow={closeWindow}
        ></ReportEdit>
      )}
    </div>
  );
}

export default Reports;
