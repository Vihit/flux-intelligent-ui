export const config = {
  // apiUrl: "http://localhost:8080/",
  apiUrl: "http://ec2-65-2-57-3.ap-south-1.compute.amazonaws.com:8080/",
  // apiUrl: "http://180.190.51.15:8080/",
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
      maxHeight: "13.0rem",
    },
    option: {
      fontFamily: "Poppins",
      display: "flex",
      justifyContent: "left",
      alignItems: "center",
      align: "center",
      maxHeight: "4.0rem",
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
      maxHeight: "13.0rem",
    },
    option: {
      fontFamily: "Poppins",
      display: "flex",
      justifyContent: "left",
      alignItems: "center",
      align: "center",
      maxHeight: "4.0rem",
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
  mrtStyle: {
    muiBottomToolbarProps: {
      sx: {
        display: "flex",
        justifyContent: "flex-start",
        alignItems: "flex-start",
        height: "4vh",
      },
    },
    muiTableContainerProps: {
      sx: {
        maxHeight: "60vh",
        minHeight: "10vh",
        maxWidth: "100%",
        overflowX: "auto",
      },
    },
    muiFullTableContainerProps: {
      sx: {
        maxHeight: "70vh",
        minHeight: "70vh",
        maxWidth: "100%",
        overflowX: "auto",
      },
    },
    muiTableHeadCellProps: {
      sx: {
        fontWeight: "400",
        fontSize: "1.4rem",
        backgroundColor: "var(--dark)",
        color: "var(--white)",
        border: "0.1rem solid",
        fontFamily: "Poppins",
        height: "4rem",
        verticalAlign: "middle",
        // lineHeight: "4rem",
      },
    },
    muiTableHeadCellColumnActionsButtonProps: {
      sx: {
        path: {
          stroke: "white",
          fill: "white",
          strokeWidth: "15rem",
        },
      },
    },
    muiTableBodyCellProps: {
      sx: {
        backgroundColor: "var(--white)",
        borderRight: "0.1rem solid var(--white)",
        borderBottom: "0.1rem solid var(--grey)",
        fontFamily: "Poppins",
        fontSize: "1.4rem",
      },
    },

    muiTableBodyProps: {
      sx: {
        margin: "2rem",
      },
    },
    muiTableHeadCellFilterTextFieldProps: {
      sx: {
        strokeWidth: "0.15rem",
        backgroundColor: "var(--white)",
        input: {
          fontFamily: "Poppins",
          color: "var(--dark)",
          fontSize: "1.4rem",
        },
      },
    },
  },
};
