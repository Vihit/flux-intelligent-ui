import "./Reports.css";
import "./ReportEdit";
import { config } from "./config";
import { useEffect, useState } from "react";
import MaterialReactTable from "material-react-table";
import { Box, Typography } from "@mui/material";
import { Fullscreen } from "@mui/icons-material";
import ReportEdit from "./ReportEdit";

function Reports(props) {
  const [reports, setReports] = useState([]);
  const [activeReport, setActiveReport] = useState({});
  const [reportData, setReportData] = useState({ rows: [], header: [] });
  const [newReport, setNewReport] = useState(false);
  const [selectedReport, setSelectedReport] = useState({});

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
        setReports(actualData);
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
        console.log(cReport.columns);
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

  function closeWindow() {
    setNewReport(false);
    getReports();
  }

  return (
    <div className="dashboard-container">
      <div className="u-d-container">
        <div className="u-menu p-menu-sidebar">
          {reports.map((report) => {
            return (
              <div
                className="u-menu-head p-menu"
                onClick={() => setReportClicked(report.id)}
              >
                {report.name}
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
      {newReport && selectedReport != {} && (
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
