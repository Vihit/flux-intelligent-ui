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
          enableTopToolbar={false}
          // enableColumnActions={false}
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
          muiTableBodyRowProps={({ row }) => ({
            sx: {
              backgroundColor: "var(--white) !important",
              borderBottom: "0.1rem solid var(--main)",
            },
          })}
          muiTableContainerProps={config.mrtStyle.muiTableContainerProps}
          initialState={{
            density: "compact",
            columnVisibility: { id: false },
          }}
          muiTableHeadCellProps={config.mrtStyle.muiTableHeadCellProps}
          muiTableHeadCellFilterTextFieldProps={
            config.mrtStyle.muiTableHeadCellFilterTextFieldProps
          }
          muiTableHeadCellColumnActionsButtonProps={
            config.mrtStyle.muiTableHeadCellColumnActionsButtonProps
          }
          muiTableBodyCellProps={config.mrtStyle.muiTableBodyCellProps}
          muiTableBodyProps={config.mrtStyle.muiTableBodyProps}
          muiBottomToolbarProps={config.mrtStyle.muiBottomToolbarProps}
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
