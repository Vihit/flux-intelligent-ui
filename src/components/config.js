export const config = {
  // apiUrl: "http://localhost:8080/",
  // apiUrl: "http://ec2-35-154-102-80.ap-south-1.compute.amazonaws.com:8080/",
  apiUrl: "http://180.190.51.19:8080/",
  measures: ["sum", "avg", "max", "min", "count"],
  filterOps: ["=", "<>", ">", "<", ">=", "<="],
  logicalOps: ["and", "or"],
  multiSelectStyle: {
    multiselectContainer: {
      background: "white",
      padding: ".2rem",
      maxHeight: "95%",
      maxWidth: "99%",
      borderRadius: "1.2rem",
    },
    searchBox: {
      borderRadius: "1.2rem",
      fontSize: "1.5rem",
      maxHeight: "95%",
      padding: "0",
      maxWidth: "100%",
      overflow: "auto",
      textAlign: "center",
      color: "black",
    },
    optionListContainer: {
      position: "relative !important",
    },
    optionContainer: {
      border: ".1rem solid black",
      fontSize: "1.5rem",
      maxHeight: "13rem",
    },
    option: {
      fontFamily: "Poppins",
      display: "flex",
      justifyContent: "left",
      alignItems: "center",
      align: "center",
      maxHeight: "4rem",
    },
    chips: {
      color: "white",
      background: "#0096fb",
      fontSize: "1.6rem",
    },
    chip: {
      background: "#0096fb",
    },
  },
  platformMultiSelectStyle: {
    multiselectContainer: {
      background: "white",
      // padding: ".2rem",
      height: "95%",
      maxWidth: "99%",
      borderRadius: "1.2rem",
    },
    searchBox: {
      borderRadius: "1.2rem",
      fontSize: "1.5rem",
      height: "100%",
      padding: "0",
      maxWidth: "100%",
      overflow: "auto",
      textAlign: "center",
      color: "black",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    },
    optionListContainer: {
      position: "relative !important",
    },
    optionContainer: {
      border: ".1rem solid black",
      fontSize: "1.5rem",
      maxHeight: "13rem",
    },
    option: {
      fontFamily: "Poppins",
      display: "flex",
      justifyContent: "left",
      alignItems: "center",
      align: "center",
      maxHeight: "4rem",
    },
    chips: {
      color: "white",
      background: "#0096fb",
      fontSize: "1.6rem",
    },
    chip: {
      background: "#0096fb",
    },
    inputField: {
      display: "none",
    },
  },
  muiTableBodyProps: {
    sx: {
      margin: "2rem",
    },
  },
  muiTableHeadCellProps: {
    sx: {
      fontWeight: "bold",
      fontSize: "1.5rem",
      backgroundColor: "var(--main)",
      color: "var(--white)",
      border: "0.1rem solid",
      fontFamily: "Poppins",
      height: "4rem",
      verticalAlign: "middle",
      lineHeight: "4rem",
    },
  },
  muiTableBodyCellProps: {
    sx: {
      backgroundColor: "var(--grey)",
      borderRight: "0.1rem solid var(--white)",
      borderBottom: "0.1rem solid var(--main)",
      fontFamily: "Poppins",
      fontSize: "1.3rem",
    },
  },
  muiTableContainerProps: {
    sx: {
      maxHeight: "40vh",
      minHeight: "40vh",
      maxWidth: "100%",
      overflowX: "auto",
    },
  },
  muiTableHeadCellFilterTextFieldProps: {
    sx: {
      strokeWidth: "0.15rem",
      backgroundColor: "var(--white)",
      input: {
        fontFamily: "Poppins",
        color: "var(--main)",
        fontSize: "1.3rem",
      },
    },
  },
  muiTableHeadCellColumnActionsButtonProps: {
    sx: {
      path: {
        stroke: "white",
        fill: "white",
        strokeWidth: "0.15rem",
      },
    },
  },
};
