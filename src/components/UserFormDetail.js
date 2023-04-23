import { useEffect, useState } from "react";
import Form from "./Form";
import "./UserFormDetail.css";
import { config } from "./config";
import MaterialReactTable from "material-react-table";
import { Box, IconButton } from "@mui/material";
import { Fullscreen } from "@mui/icons-material";

function UserFormDetail(props) {
  const [initiated, setInitiated] = useState(false);
  const [entry, setEntry] = useState({ id: -1 });

  function handleRowClick(row) {
    console.log("handling row click");
    setEntry(row.original);
    setInitiated(true);
  }

  function updateAndCloseInit(f) {
    console.log("Update and close init");
    console.log(f);
    setInitiated(false);
    props.updateData(props.type, f);
  }
  return (
    <div className="f-dtl-container">
      <div className="f-dtl-head">
        <div className="f-dtl-name">{props.form.name}</div>
        {props.type === "initiate" && (
          <div className="i-btn" onClick={() => setInitiated(true)}>
            {props.form.workflow.states.filter((st) => st.firstState)[0].label}
          </div>
        )}
      </div>
      <div className="f-dtl"></div>
      <div className="f-table">
        <MaterialReactTable
          columns={props.tableData.header}
          data={props.tableData.rows}
          enableStickyHeader
          enableStickyFooter
          enableRowActions={props.type === "pending"}
          renderRowActions={({ row }) => (
            <Box>
              <IconButton onClick={() => handleRowClick(row)}>
                <Fullscreen />
              </IconButton>
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
      </div>
      {initiated && (
        <Form
          form={props.form}
          closeInit={updateAndCloseInit}
          cancel={setInitiated}
          entry={entry}
          raiseAlert={props.raiseAlert}
          key={props.form.id}
        ></Form>
      )}
    </div>
  );
}

export default UserFormDetail;
