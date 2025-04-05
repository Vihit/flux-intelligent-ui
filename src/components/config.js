import { height } from "@fortawesome/free-solid-svg-icons/fa0";

export const config = {
  // apiUrl: "http://localhost:8080/",
  apiUrl: "http://ec2-13-234-24-38.ap-south-1.compute.amazonaws.com:8080/",
  // apiUrl: "http://180.190.51.15:8080/",
  // apiUrl: "https://backend1.digitedgy.com/",
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
        height: "4rem",
      },
    },
    muiTableContainerProps: {
      sx: {
        maxHeight: "55vh",
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
        "& .Mui-TableHeadCell-Content": {
          justifyContent: "space-between",
          alignItems: "center",
        },
        fontWeight: "500",
        fontSize: "1.5rem",
        backgroundColor: "var(--dark)",
        color: "var(--black)",
        borderRight: "0.1rem solid white",
        fontFamily: "Poppins",
        height: "5rem",
        verticalAlign: "middle",
        // padding: "0rem 0rem 1rem 1rem",
        lineHeight: "2rem",
      },
    },
    muiTableHeadCellColumnActionsButtonProps: {
      sx: {
        path: {
          stroke: "var(--black)",
          fill: "var(--black)",
          strokeWidth: "1",
        },
        svg: {
          fontSize: "2rem !important",
        },
      },
    },
    muiTableBodyCellProps: {
      sx: {
        // backgroundColor: "var(--black)",
        borderRight: "0.1rem solid var(--white)",
        // borderBottom: "0.1rem solid var(--white)",
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
          color: "var(--black)",
          fontSize: "1.4rem",
          fontWeight: "200",
        },
      },
    },
  },
  borderColors: [
    "#003f5c",
    // "#2f4b7c",
    "#665191",
    "#a05195",
    // "#d45087",
    "#f95d6a",
    "#ff7c43",
    "#ffa600",
    // "#0f3375",
    "#2382f7",
    "#c586dd",
    // "#9739c8",
    // "#FF4D6D",
    "#FF8FA3",
    "#FFE14C",
    // "#FFAA00",
    // "#FF7B00",
    "#B3EFB2",
    "#9EF01A",
    "#008000",
    "#FF5800",
    // "#77b6fb",
    // "#8013bd",
    // "#F9172B",
    "#cce4fd",
    "#1557c0",
    "#dcace8",
    "#ae60d3",
    "#FFCCD5",
    "#FFF2B2",
    "#38B000",
    "#006400",
  ],
};
