import "./LogAudit.css";
import html2canvas from "html2canvas";
import jsPDF from 'jspdf';
import  autoTable   from "jspdf-autotable";
import delogo from "../delogo1.png";
import { useEffect, useState } from "react";
import { config } from "./config.js";

function LogAudit(props) {
  console.log(props);
  const parsedForm = JSON.parse(props.form.template);
  const fLabels = parsedForm["controls"]
    .flatMap((ctrl) => ctrl)
    .filter((ctrl) => ctrl.type !== "grid")
    .map((c) => c.label);
  const gridControls = parsedForm["controls"]
    .flatMap((ctrl) => ctrl)
    .filter((ctrl) => ctrl.type === "grid");
  const gridLabels = gridControls.map((c) => c.label);
  const [gridLogs, setGridLogs] = useState([]);
  const sortedEntries = props.entries
    .filter((entry) => !entry.data["state"].endsWith("-INPA"))
    .sort(function (a, b) {
      return new Date(a.data.log_create_dt) - new Date(b.data.log_create_dt);
    });
  const [normalGridLogs, setNormalGridLogs] = useState([]);
  const [customGridLogs, setCustomGridLogs] = useState([]);

  function downloadAudit() {
    const input = document.getElementById("audit-window");

    input.classList.remove("height-limit");
    const downloads = document.getElementsByClassName("download-btn");
    for (let download of downloads) {
      download.classList.add("close-flex");
    }
    const closeBtns = document.getElementsByClassName("close-icon");
    for (let btn of closeBtns) {
      btn.classList.add("close-flex");
    }
    input.classList.remove("audit-window");
    input.classList.remove("a-w-shadow");
    input.classList.add("a-w-print-window");

    html2canvas(input).then((canvas) => {
      const imgData = canvas.toDataURL("image/svg", 1.0);
      const htmlHeight = canvas.height;
      let pdf = new jsPDF("p", "px", "a4");
      console.log(pdf.internal.pageSize.getWidth());
      console.log(pdf.internal.pageSize.getHeight());
      var pdfHeight = pdf.internal.pageSize.getHeight();
      var pdfWidth = pdf.internal.pageSize.getWidth();
      canvas.setAttribute("width", pdfWidth);
      var totalPDFPages = Math.ceil(htmlHeight / pdfHeight);
      console.log("img height " + htmlHeight);
      console.log("Page height " + pdfHeight);
      console.log("Total pages " + totalPDFPages);
      for (var i = 0; i < totalPDFPages; i++) {
        pdf.addImage(
          imgData,
          "JPEG",
          0,
          0 - i * pdfHeight,
          canvas.width,
          htmlHeight
        );
        if (i < totalPDFPages - 1) pdf.addPage();
      }
      // pdf.addImage(imgData, "JPEG", 0, 0, canvas.width, canvas.height);
      var file =
        "Audit_trail_" +
        props.form.name.replaceAll(" ", "_") +
        "_" +
        props.entries[0].data.log_entry_id +
        ".pdf";
      pdf.save(file);
    });
    for (let download of downloads) {
      download.classList.remove("close-flex");
    }
    for (let download of closeBtns) {
      download.classList.remove("close-flex");
    }
    input.classList.add("audit-window");
    input.classList.remove("a-w-print-window");
    input.classList.add("a-w-shadow");
    input.classList.add("height-limit");
  }

  function newAuditReportDownload(){

      const doc = new jsPDF();
      
      doc.rect(0, 0, 210, 20, 'F', [204, 204, 204]);
      var img = new Image()
      img.src = "delogo1.png"
      doc.addImage(img, 'png', 10, 2, 20, 15);
      doc.setFontSize(12)
      doc.setTextColor("#00ADB5");
      doc.text(`Audit for ${props.form.name} Entry #${props.entries[0].data.log_entry_id}`, 100, 12);
      var client_logo = new Image()
      client_logo.src = "client-logo.png"
      doc.rect(189, 0, 25, 20, 'F', "#fff");
      doc.addImage(client_logo, 'png', 190, 2, 20, 15);
      doc.setTextColor(0, 0, 0);
      var finalY = doc.lastAutoTable.finalY || 30;
      doc.text(`Form Name  : ${props.form.name}`, 14, finalY);
      doc.text(`Request Id  : ${props.entries[0].data.log_entry_id}`, 14, finalY+10);
  
      sortedEntries.forEach((element,index) => {
        let currentData=element["data"]
        finalY = finalY + 20;
        doc.text(`Target State : ${currentData["state"]}`, 14, finalY);
        finalY = finalY + 5;
        doc.setFontSize(10)
        doc.text(`Performed by  : ${currentData["created_by"]}`, 14, finalY);
        finalY = finalY + 5;
        doc.setFontSize(12)
        let oldData={}
        if(index>0){
          oldData=sortedEntries[index-1]['data']
        }
        const keyValueArray = fLabels.map((key) =>{ 
          let actual_key=key.toLowerCase().replaceAll(" ", "_")
           return  [key,oldData[actual_key] ,currentData[actual_key]]
        });
        autoTable(doc, {
          head: [['Reference', 'Old Value', 'New Value']],
          body: keyValueArray,
          startY: finalY
        });
        finalY = doc.lastAutoTable.finalY
      });
      var file_name =
      "Audit_trail_" +
      props.form.name.replaceAll(" ", "_") +
      "_" +
      props.entries[0].data.log_entry_id +
      ".pdf";
      doc.save(file_name);
  }

  useEffect(() => {
    if (
      JSON.parse(props.form.template)
        ["controls"].flatMap((ctrl) => ctrl)
        .filter((ctrl) => ctrl.type === "grid").length > 0
    )
      getAuditGrids();
  }, []);

  function getAuditGrids() {
    fetch(
      config.apiUrl +
        "entry/grid/metadata/" +
        props.form.id +
        "/" +
        props.entries[0].data.log_entry_id,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization:
            "Bearer " + JSON.parse(localStorage.getItem("access")).access_token,
        },
      }
    )
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
      })
      .then((actualData) => {
        // eval('(function() { console.log("foo");a=a+1;console.log(a); })()');
        setNormalGridLogs(
          actualData
            .filter(
              (aD) =>
                !gridControls
                  .filter((c) => c.customAuditLog)
                  .map((c) => c.key)
                  .includes(aD.grid)
            )
            .map((aD, inx) =>
              aD.data
                .map((d) => {
                  return {
                    ...d.data,
                    grid: aD.grid,
                    state: props.entries.filter(
                      (e) => e.data.id === d.data.history_log_entry_id
                    )[0].data.state,
                  };
                })
                .reduce((x, y) => {
                  (x[y.state] = x[y.state] || []).push(y);
                  return x;
                }, {})
            )
        );

        var customLogs = [];
        gridControls.forEach((element) => {
          if (element.customAuditLog) {
            let stateGroups = actualData
              .filter((aD) => element.key === aD.grid)
              .map((aD, inx) =>
                aD.data
                  .map((d) => {
                    return {
                      ...d.data,
                      grid: aD.grid,
                      state: props.entries.filter(
                        (e) => e.data.id === d.data.history_log_entry_id
                      )[0].data.state,
                      created_by: props.entries.filter(
                        (e) => e.data.id === d.data.history_log_entry_id
                      )[0].data.created_by,
                    };
                  })
                  .reduce((x, y) => {
                    (x[y.state] = x[y.state] || []).push(y);
                    return x;
                  }, {})
              );

            eval(
              "(function(){customLogs=customLogs.concat(" +
                element.customAuditCode
                  .replaceAll("\n", "")
                  .replaceAll('"', "'") +
                ");})()"
            );
          }
        });
        console.log(
          actualData
            .filter(
              (aD) =>
                !gridControls
                  .filter((c) => c.customAuditLog)
                  .map((c) => c.key)
                  .includes(aD.grid)
            )
            .map((aD, inx) =>
              aD.data
                .map((d) => {
                  return {
                    ...d.data,
                    grid: aD.grid,
                    state: props.entries.filter(
                      (e) => e.data.id === d.data.history_log_entry_id
                    )[0].data.state,
                  };
                })
                .reduce((x, y) => {
                  (x[y.state] = x[y.state] || []).push(y);
                  return x;
                }, {})
            )
        );
        //stateGroups.flatMap((a) =>Object.keys(a).map((key) => {let groups = a[key].reduce((x, y) => {(x[y.equipment_name] = x[y.equipment_name] || []).push(y);return x;}, {});return {state: key,logs: Object.keys(groups).map((key) => {return {name: key,logs: groups[key].map((val, inx) => {if (inx == 0) {if (val.start === "1") {return {grid: val.grid,msg: "Started at " + val.log_create_dt,};} else if (val.stop === "1") {return {grid: val.grid,msg: "Stopped at " + val.log_create_dt,};} else {return {grid: val.grid,msg: "",};}} else {if (val.start !== groups[key][inx - 1].start && val.start !== "null" && val.start !== "") {return {grid: val.grid,msg: "Started at " + val.log_create_dt,};} else if (val.stop !== groups[key][inx - 1].stop && val.stop !== "null" && val.stop !== "") {return {grid: val.grid,msg: "Stopped at " + val.log_create_dt,};} else {return {grid: val.grid,msg: "",};}}}),};}),};}))
        setGridLogs(customLogs);
        // eval("(function() { setGridLogs([])})()");
      });
  }
  return (
    <div className="audit-window a-w-shadow height-limit" id="audit-window">
      <div className="viz-preview-details dark-bg">
        <div className="de-logo">
          <img src={delogo}></img>
        </div>
        <div className="viz-name m-top">
          Audit for <div className="a-f-name">{props.form.name}</div> Entry
          <div className="a-id">{"#" + props.entries[0].data.log_entry_id}</div>
        </div>
        <div className="grow"></div>
        <div className="download-btn" onClick={newAuditReportDownload}>
          Download
        </div>
        <div className="close-icon">
          <i
            className="fa-solid fa-close"
            onClick={() => props.closeInit()}
          ></i>
        </div>
      </div>
      <div className="created-container">
        {(() => {
          let td = [];
          for (let i = 0; i < sortedEntries.length; i++) {
            td.push(
              <div className="a-row-head" key={"rh" + i}>
                Sent to
                <div className="a-row-head-state">
                  {sortedEntries[i].data.state}
                </div>
                <div className="a-row-head-actor">
                  by
                  <div className="a-actor">
                    {sortedEntries[i].data.created_by}
                  </div>
                </div>
                <div className="a-row-head-actor">
                  at{" "}
                  <div className="a-at">
                    {sortedEntries[i].data.log_create_dt}
                  </div>
                </div>
              </div>
            );
            td.push(
              <div className="a-row a-sub-head" key={i}>
                <div className="a-e-cell">Field</div>
                <div className="a-e-cell">Old Value</div>
                <div className="a-e-cell">New Value</div>
              </div>
            );
            for (let j = 0; j < fLabels.length; j++) {
              if (i == 0) {
                td.push(
                  <div className="a-row" key={i + "2" + j}>
                    <div className="a-e-cell">{fLabels[j]}</div>
                    <div className="a-e-cell">--</div>
                    <div className="a-e-cell">
                      {
                        sortedEntries[i].data[
                          fLabels[j].toLowerCase().replaceAll(" ", "_")
                        ]
                      }
                    </div>
                  </div>
                );
              } else {
                td.push(
                  <div className="a-row" key={i + "2" + j}>
                    <div className="a-e-cell">{fLabels[j]}</div>
                    <div className="a-e-cell">
                      {
                        sortedEntries[i - 1].data[
                          fLabels[j].toLowerCase().replaceAll(" ", "_")
                        ]
                      }
                    </div>
                    <div className="a-e-cell">
                      {
                        sortedEntries[i].data[
                          fLabels[j].toLowerCase().replaceAll(" ", "_")
                        ]
                      }
                    </div>
                  </div>
                );
              }
            }
            for (let g = 0; g < gridLabels.length; g++)
              if ((sortedEntries.length == 1 && i == 0) || i > 0) {
                td.push(
                  <div className="g-row">
                    <div className="g-row-head">{gridLabels[g]}</div>
                    <div className="g-data-container">
                      {gridLogs
                        .filter((gL) =>
                          i == 0
                            ? gL.state === sortedEntries[i].data.state + "-INPA"
                            : gL.state ===
                              sortedEntries[i - 1].data.state + "-INPA"
                        )
                        .flatMap((f) => f.logs)
                        .filter(
                          (el) =>
                            el.logs.filter(
                              (log) =>
                                log.grid ===
                                gridLabels[g].toLowerCase().replaceAll(" ", "_")
                            ).length > 0
                        )
                        .map((element) => {
                          return (
                            <div className="g-data" key={element.name + g}>
                              <div className="g-data-head">{element.name}</div>
                              <div className="g-data-log">
                                {element.logs
                                  .filter(
                                    (log) =>
                                      log.grid ===
                                      gridLabels[g]
                                        .toLowerCase()
                                        .replaceAll(" ", "_")
                                  )
                                  .map((log) => (
                                    <div>{log.msg}</div>
                                  ))}
                              </div>
                            </div>
                          );
                        })}
                      {normalGridLogs
                        .map((nL) => nL[sortedEntries[i].data.state])
                        .flatMap((f) => f)
                        .filter(
                          (data) =>
                            data != undefined &&
                            data.grid ===
                              gridLabels[g].toLowerCase().replaceAll(" ", "_")
                        )
                        .map((data, id) => {
                          if (id == 0) {
                            return (
                              <div className="n-g-a-row">
                                <div className="n-g-a-head">
                                  {gridControls
                                    .filter((c) => c.key === data.grid)[0]
                                    .controls.map((c) => c.key)
                                    .map((k) => (
                                      <div className="n-g-a-cell">{k}</div>
                                    ))}
                                </div>
                                <div className="n-g-a-log">
                                  {gridControls
                                    .filter((c) => c.key === data.grid)[0]
                                    .controls.map((c) => c.key)
                                    .map((k) => (
                                      <div className="n-g-a-cell">
                                        {data[k]}
                                      </div>
                                    ))}
                                </div>
                              </div>
                            );
                          } else {
                            return (
                              <div className="n-g-a-row">
                                <div className="n-g-a-log">
                                  {gridControls
                                    .filter((c) => c.key === data.grid)[0]
                                    .controls.map((c) => c.key)
                                    .map((k) => (
                                      <div className="n-g-a-cell">
                                        {data[k]}
                                      </div>
                                    ))}
                                </div>
                              </div>
                            );
                          }
                        })}
                    </div>
                  </div>
                );
              }
          }
          return td;
        })()}
      </div>
    </div>
  );
}

export default LogAudit;
