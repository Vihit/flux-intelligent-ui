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
              if (!col.endsWith("Date"))
                return { accessorKey: col, header: col };
              else {
                return {
                  accessorKey: col,
                  header: col,
                  filterVariant: "range",
                  filterFn: "between",
                };
              }
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
    var orientation = "p";
    const tableData = rows.map((row) => Object.values(row.original));
    const tableHeaders = reportData.header.map((c) => c.header);

    if (tableHeaders.length > 7) {
      orientation = "l";
    }
    const doc = new jsPDF(orientation, "pt");
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
      doc.text(activeReport.name, pageWidth / 2, 25, { align: "center" });
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

    var cStyles = {};
    var arr = [...Array(tableHeaders.length).keys()];
    arr.forEach((element) => {
      cStyles[element] = {
        cellWidth: (pageWidth - 28) / tableHeaders.length,
        minCellWidth: 50,
      };
    });

    doc.autoTable(tableHeaders, tableData, {
      margin: { top: 60, left: 14, right: 14 },
      beforePageContent: header,
      styles: {
        lineColor: "white",
        lineWidth: 1,
      },
      columnStyles: cStyles,
      headStyles: {
        fontStyle: "normal",
      },
    });

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
          {reports.map((report, idx) => {
            return (
              <div className="u-menu-head r-menu" key={idx}>
                <div
                  className="r-name"
                  onClick={() => setReportClicked(report.id)}
                >
                  {report.name}
                </div>
                {JSON.parse(localStorage.getItem("user")).role.includes(
                  "ROLE_ADMIN",
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
            "ROLE_ADMIN",
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
                      {activeReport.name}
                    </Typography>
                    {table.getPrePaginationRowModel().rows.length > 0 && (
                      <div
                        onClick={() =>
                          handleExportRows(
                            table.getPrePaginationRowModel().rows,
                          )
                        }
                        className="i-btn"
                      >
                        Download Report
                      </div>
                    )}
                  </Box>
                )}
                muiTableContainerProps={{
                  sx: {
                    maxHeight: "40vh",
                    minHeight: "40vh",
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
                  },
                }}
                muiTableBodyProps={{
                  sx: {
                    margin: "2rem",
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
