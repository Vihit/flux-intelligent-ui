import { useEffect, useState } from "react";
import { config } from "../config";
import MaterialReactTable from "material-react-table";
import { Box, IconButton, Typography, Button } from "@mui/material";
import { Fullscreen, ExitToApp, GetApp } from "@mui/icons-material";
import { jsPDF } from "jspdf";

function AuditMgmt(props) {
  const [tableData, setTableData] = useState({ header: [], rows: [] });
  const [auditLogs, setAuditLogs] = useState([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [totalPages, setTotalPages] = useState(20);
  var cols = [
    "ID",
    "UserName",
    "Module",
    "Action",
    "PrevState",
    "NewState",
    "Activity Timestamp",
  ];
  var keys = [
    "id",
    "userName",
    "type",
    "action",
    "prevState",
    "newState",
    "auditDt",
  ];

  useEffect(() => {
    getAuditLogs();
  }, [pagination.pageIndex]);

  const handleExportRows = (rows) => {
    var orientation = "l";
    const tD = rows.map((row) => keys.map((key) => row.original[key]));
    const tableHeaders = tableData.header.map((c) => c.header);

    console.log(rows[0].original);
    console.log(tD);
    console.log(tableHeaders);

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
      doc.text("Audit Trail", pageWidth / 2, 25, { align: "center" });
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

    doc.autoTable(tableHeaders, tD, {
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

    doc.save("Audit_trail.pdf");
  };

  function getAuditLogs() {
    fetch(
      config.apiUrl +
        "audit/?pageSize=" +
        pagination.pageSize +
        "&pageNumber=" +
        pagination.pageIndex,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization:
            "Bearer " + JSON.parse(localStorage.getItem("access")).access_token,
        },
      }
    )
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
      })
      .then((actualData) => {
        props.raiseAlert("green", "Fetched Audit Logs!");
        setAuditLogs((prev) => {
          let toBeUpdated = [...prev];
          toBeUpdated.concat(actualData.auditTrails);
          return toBeUpdated;
        });
        setTotalPages(actualData.totalPages);
        setTableData((prev) => {
          let toBeUpdated = { ...prev };
          let rows = actualData.auditTrails.map((aD) => {
            let data = { ...aD };
            return data;
          });
          let header = cols.map((element, inx) => {
            return {
              accessorKey: keys[inx],
              header: element,
            };
          });
          toBeUpdated.rows = rows;
          toBeUpdated.header = header;
          return toBeUpdated;
        });
        //   setTableData((prev) => {
        //     let toBeUpdated = { ...prev };
        //     toBeUpdated.rows.push(
        //       actualData.auditTrails.map((aD) => {
        //         let data = { ...aD };
        //         return data;
        //       })
        //     );
        //     toBeUpdated.header = cols.map((element, inx) => {
        //       return {
        //         accessorKey: keys[inx],
        //         header: element,
        //       };
        //     });
        //     return toBeUpdated;
        //   });
      });
  }

  return (
    <div className="f-dtl-container">
      <div className="f-table">
        <MaterialReactTable
          columns={tableData.header}
          data={tableData.rows}
          enableStickyHeader
          enableStickyFooter
          renderTopToolbarCustomActions={({ table }) => (
            <Box sx={{ display: "flex", gap: "1rem", p: ".4rem" }}>
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
                Audit Trail
              </Typography>
              <Button
                disabled={table.getPrePaginationRowModel().rows.length === 0}
                onClick={() =>
                  handleExportRows(table.getPrePaginationRowModel().rows)
                }
                style={{
                  background: "var(--green)",
                  color: "white",
                  fontWeight: "bold",
                  textTransform: "none",
                  fontFamily: "Poppins",
                  boxShadow: ".2rem .2rem .2rem #00000055",
                }}
              >
                {<GetApp />} &nbsp;Download Page
              </Button>
            </Box>
          )}
          muiTableContainerProps={{
            sx: {
              maxHeight: "55.0rem",
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
              backgroundColor: "var(--main)",
              color: "var(--white)",
              border: ".1rem solid",
              fontFamily: "Poppins",
            },
          }}
          muiTableHeadCellColumnActionsButtonProps={{
            sx: {
              path: {
                stroke: "white",
                fill: "white",
                strokeWidth: ".15rem",
              },
            },
          }}
          muiTableBodyCellProps={{
            sx: {
              backgroundColor: "var(--grey)",
              borderRight: ".1rem solid var(--white)",
              borderBottom: ".1rem solid var(--main)",
              fontFamily: "Poppins",
            },
          }}
          muiTableHeadCellFilterTextFieldProps={{
            sx: {
              strokeWidth: ".15rem",
              backgroundColor: "var(--white)",
              input: {
                fontFamily: "Poppins",
                color: "var(--main)",
              },
            },
          }}
          onPaginationChange={setPagination}
          state={{ pagination }}
          rowCount={pagination.pageSize * totalPages}
          manualPagination={true}
          // pageIndex={pagination.pageIndex}
          // pageIndex={}
          pageCount={totalPages}
          muiTableBodyProps={{
            sx: {
              margin: "2.0rem",
            },
          }}
          // autoResetPageIndex={false}
        ></MaterialReactTable>
      </div>
    </div>
  );
}

export default AuditMgmt;
