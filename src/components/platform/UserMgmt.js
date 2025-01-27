import { useEffect, useState } from "react";
import { config } from "../config";
import MaterialReactTable from "material-react-table";
import { Box, IconButton, Typography } from "@mui/material";
import { Fullscreen } from "@mui/icons-material";
import UserEdit from "./UserEdit";

function UserMgmt(props) {
  const [tableData, setTableData] = useState({ header: [], rows: [] });
  const [toggleEdit, setToggleEdit] = useState(false);
  const [selectedUser, setSelectedUser] = useState({});
  // const [users, setUsers] = useState([]);
  // const [newUser, setNewUser] = useState(false);
  var cols = [
    "ID",
    "Username",
    "FirstName",
    "LastName",
    "Designation",
    "Email",
    "DateOfBirth",
    "Department",
    "Roles",
    "Reporting Manager",
    "Employee Code",
    "Windows ID",
    "Date of Joining",
  ];
  var keys = [
    "id",
    "username",
    "first_name",
    "last_name",
    "designation",
    "email",
    "dateOfBirth",
    "department",
    "roles",
    "reporting_manager",
    "employee_code",
    "windows_id",
    "hireDate",
  ];

  useEffect(() => {
    getUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function getUsers() {
    fetch(config.apiUrl + "users/", {
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
        props.raiseAlert("green", "Fetched Users!");
        // setUsers(actualData);
        setTableData({
          rows: actualData
            .filter((aD) => aD["username"] !== "admin")
            .map((aD) => {
              let data = { ...aD };
              data["department"] = aD.department.name;
              data["roles"] = aD.roles.map((r) => r.role).join(",");
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

  function handleRowClick(user) {
    // setNewUser(true);
    setSelectedUser(user.original);
    setToggleEdit(true);
  }

  function closeWindow(check) {
    setToggleEdit(check);
    getUsers();
  }

  function addANewUser() {
    // setNewUser(true);
    setToggleEdit(true);
    setSelectedUser((prev) => {
      return {
        username: "",
        first_name: "",
        last_name: "",
        email: "",
        dateOfBirth: "",
        password: "",
        department: "",
        roles: "",
        employee_code: "",
        windows_id: "",
        designation: "",
        reporting_manager: "",
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
          muiTableHeadCellColumnActionsButtonProps={{
            sx: {
              path: {
                stroke: "white",
                fill: "white",
                strokeWidth: ".15rem",
              },
            },
          }}
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
                Users
              </Typography>{" "}
              {JSON.parse(localStorage.getItem("user")).role.includes(
                "ROLE_ADMIN"
              ) && (
                <div className="i-btn" onClick={() => addANewUser()}>
                  Add
                </div>
              )}
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
          muiTableBodyCellProps={{
            sx: {
              backgroundColor: "var(--grey)",
              borderRight: ".1rem solid var(--white)",
              borderBottom: ".1rem solid var(--main)",
              fontFamily: "Poppins",
            },
          }}
          muiTableBodyProps={{
            sx: {
              margin: "2.0rem",
            },
          }}
        ></MaterialReactTable>
      </div>
      {toggleEdit && selectedUser != {} && (
        <UserEdit
          raiseAlert={props.raiseAlert}
          user={selectedUser}
          closeWindow={closeWindow}
          users={tableData.rows}
        ></UserEdit>
      )}
    </div>
  );
}

export default UserMgmt;
