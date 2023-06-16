export const config = {
  // apiUrl: "http://localhost:8080/",
  apiUrl: "http://ec2-13-234-66-36.ap-south-1.compute.amazonaws.com:8080/",
  measures: ["sum", "avg", "max", "min", "count"],
  filterOps: ["=", "<>", ">", "<", ">=", "<="],
  logicalOps: ["and", "or"],
};
