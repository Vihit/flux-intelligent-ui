import { useEffect, useState } from "react";
import { config } from "../config";
import MaterialReactTable from "material-react-table";
import { Box, IconButton, Typography } from "@mui/material";

function AuditMgmt(props) {
  const [tableData, setTableData] = useState({ header: [], rows: [] });
  const [auditLogs, setAuditLogs] = useState([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [totalPages, setTotalPages] = useState(20);
  var cols = [
    "ID",
    "UserName",
    "Type",
    "Action",
    "PKValue",
    "PrevState",
    "NewState",
    "AuditDt",
  ];
  var keys = [
    "id",
    "userName",
    "type",
    "action",
    "pkValue",
    "prevState",
    "newState",
    "auditDt",
  ];

  useEffect(() => {
    getAuditLogs();
    console.log(pagination);
  }, [pagination.pageIndex]);

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
                Audit Trail
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
              backgroundColor: "var(--main)",
              color: "var(--white)",
              border: "1px solid",
              fontFamily: "Poppins",
            },
          }}
          muiTableBodyCellProps={{
            sx: {
              backgroundColor: "var(--grey)",
              borderRight: "1px solid var(--white)",
              borderBottom: "1px solid var(--main)",
              fontFamily: "Poppins",
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
              margin: "20px",
            },
          }}
          // autoResetPageIndex={false}
        ></MaterialReactTable>
      </div>
    </div>
  );
}

export default AuditMgmt;
