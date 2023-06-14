import "./LogAudit.css";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import delogo from "../delogo1.png";

function LogAudit(props) {
  console.log(props);
  const fLabels = JSON.parse(props.form.template)
    ["controls"].flatMap((ctrl) => ctrl)
    .map((c) => c.label);

  const sortedEntries = props.entries.sort(function (a, b) {
    return new Date(a.data.log_create_dt) - new Date(b.data.log_create_dt);
  });
  function downloadAudit() {
    const input = document.getElementById("audit-window");

    const downloads = document.getElementsByClassName("download-btn");
    for (let download of downloads) {
      download.classList.add("close-flex");
    }
    const closeBtns = document.getElementsByClassName("close-icon");
    for (let btn of closeBtns) {
      btn.classList.add("close-flex");
    }

    input.classList.remove("a-w-shadow");

    html2canvas(input).then((canvas) => {
      const imgData = canvas.toDataURL("image/png", 1.0);
      let pdf = null;
      if (canvas.width > canvas.height) {
        pdf = new jsPDF({
          orientation: "landscape",
          unit: "pt",
          format: [canvas.width, canvas.height],
        });
      } else {
        pdf = new jsPDF({
          orientation: "potrait",
          unit: "pt",
          format: [canvas.width, canvas.height],
        });
      }

      pdf.addImage(imgData, "JPEG", 0, 0, canvas.width, canvas.height);
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

    input.classList.add("a-w-shadow");
  }
  return (
    <div className="audit-window a-w-shadow" id="audit-window">
      <div className="viz-preview-details dark-bg">
        <div className="de-logo">
          <img src={delogo}></img>
        </div>
        <div className="viz-name m-top">
          Audit for <div className="a-f-name">{props.form.name}</div> Entry
          <div className="a-id">{"#" + props.entries[0].data.log_entry_id}</div>
        </div>
        <div className="grow"></div>
        <div className="download-btn" onClick={downloadAudit}>
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
          for (let i = 0; i < props.entries.length; i++) {
            td.push(
              <div className="a-row-head">
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
              <div className="a-row a-sub-head">
                <div className="a-e-cell">Field</div>
                <div className="a-e-cell">Old Value</div>
                <div className="a-e-cell">New Value</div>
              </div>
            );
            for (let j = 0; j < fLabels.length; j++) {
              if (i == 0) {
                td.push(
                  <div className="a-row">
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
                  <div className="a-row">
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
          }
          return td;
        })()}
      </div>
    </div>
  );
}

export default LogAudit;
