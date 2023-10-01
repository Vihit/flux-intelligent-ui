export const config = {
  apiUrl: "http://localhost:8080/",
  // apiUrl: "http://ec2-13-234-66-36.ap-south-1.compute.amazonaws.com:8080/",
  measures: ["sum", "avg", "max", "min", "count"],
  filterOps: ["=", "<>", ">", "<", ">=", "<="],
  logicalOps: ["and", "or"],
  multiSelectStyle: {
    multiselectContainer: {
      background: "white",
      padding: "2px",
      maxHeight: "95%",
      maxWidth: "99%",
      borderRadius: "12px",
    },
    searchBox: {
      borderRadius: "12px",
      fontSize: "15px",
      maxHeight: "95%",
      padding: "0",
      maxWidth: "100%",
      overflow: "auto",
      textAlign: "center",
    },
    optionListContainer: {
      position: "relative !important",
    },
    optionContainer: {
      border: "1px solid black",
      fontSize: "15px",
      maxHeight: "130px",
    },
    option: {
      fontFamily: "Poppins",
      display: "flex",
      justifyContent: "left",
      alignItems: "center",
      align: "center",
      maxHeight: "40px",
    },
    chips: {
      color: "white",
      fontSize: "16px",
    },
  },
};
