import { useEffect, useState } from "react";
import { config } from "../config";
import MaterialReactTable from "material-react-table";
import { Box, IconButton, Typography } from "@mui/material";
import { Fullscreen } from "@mui/icons-material";
import RoleEdit from "./RoleEdit";

function RoleMgmt(props) {
  const [tableData, setTableData] = useState({ header: [], rows: [] });
  const [toggleEdit, setToggleEdit] = useState(false);
  const [selectedRole, setSelectedRole] = useState({});
  const [roles, setRoles] = useState([]);
  const [newRole, setNewRole] = useState(false);
  var cols = ["ID", "Role", "Description"];
  var keys = ["id", "role", "description"];

  useEffect(() => {
    getRoles();
  }, []);

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
        props.raiseAlert("green", "Fetched Roles!");
        const filterData = actualData.filter((role) => role.id > 1);
        setRoles(filterData);
        setTableData({
          rows: filterData.map((aD) => {
            let data = { ...aD };
            return data;
          }),
          header: cols.map((element, inx) => {
            return {
              accessorKey: keys[inx],
              header: element,
            };
          }),
        });
      });
  }

  function handleRowClick(role) {
    setNewRole(false);
    setSelectedRole(role.original);
    setToggleEdit(true);
  }

  function closeWindow(check) {
    setToggleEdit(check);
    getRoles();
  }

  function addANewRole() {
    setNewRole(true);
    setToggleEdit(true);
    setSelectedRole((prev) => {
      return {
        role: "",
        description: "",
      };
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
          // enableColumnActions={false}
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
                Roles
              </Typography>
              <div className="i-btn" onClick={() => addANewRole()}>
                Add
              </div>
            </Box>
          )}
          enableRowActions
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
          muiTableHeadCellColumnActionsButtonProps={{
            sx: {
              path: {
                stroke: "white",
                fill: "white",
                strokeWidth: "1.5px",
              },
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
          muiTableBodyProps={{
            sx: {
              margin: "20px",
            },
          }}
        ></MaterialReactTable>
      </div>
      {toggleEdit && selectedRole != {} && (
        <RoleEdit
          raiseAlert={props.raiseAlert}
          role={selectedRole}
          closeWindow={closeWindow}
        ></RoleEdit>
      )}
    </div>
  );
}

export default RoleMgmt;
