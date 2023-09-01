import { useEffect, useState } from "react";
import { config } from "../config";
import MaterialReactTable from "material-react-table";
import { Box, IconButton } from "@mui/material";
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
    "Email",
    "DateOfBirth",
    "Department",
    "Roles",
  ];
  var keys = [
    "id",
    "username",
    "first_name",
    "last_name",
    "email",
    "dateOfBirth",
    "department",
    "roles",
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
          rows: actualData.map((aD) => {
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
      };
    });
  }

  return (
    <div className="f-dtl-container">
      <div className="f-dtl-head">
        <div className="f-dtl-name">Users</div>
        <div className="i-btn" onClick={() => addANewUser()}>
          Add
        </div>
      </div>
      <div className="f-table">
        <MaterialReactTable
          columns={tableData.header}
          data={tableData.rows}
          enableStickyHeader
          enableStickyFooter
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
      {toggleEdit && selectedUser != {} && (
        <UserEdit
          raiseAlert={props.raiseAlert}
          user={selectedUser}
          closeWindow={closeWindow}
        ></UserEdit>
      )}
    </div>
  );
}

export default UserMgmt;
