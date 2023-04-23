import { useEffect, useState } from "react";
import { useHistory, useLocation, useParams } from "react-router-dom";
import "./AppDashboard.css";
import { config } from "./config";
import FormPreview from "./FormPreview";

function AppDashboard(props) {
  const [forms, setForms] = useState([]);
  const [apps, setApps] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [prevForm, setPrevForm] = useState({});

  let params = useParams();
  let history = useHistory();
  useEffect(() => {
    getForms();
  }, []);

  function getForms() {
    fetch(config.apiUrl + "forms/" + params.id, {
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
        setForms(actualData);
      });
  }

  function appAdded(app) {
    setApps((prev) => {
      let prevApps = [...apps];
      prevApps.push(app);
      return prevApps;
    });
  }

  function goToEdit(viz) {
    history.push("/form-studio", viz);
  }

  function showFormPreview(form) {
    setPrevForm(form);
    setShowPreview(true);
  }

  return (
    <div className="dashboard-app-container">
      <div className="app-viz-container">
        <div className={"viz-lvl"}>
          {forms.map((form, idx) => {
            return (
              <div key={idx} className="viz-lvl-name">
                <div className="f-a-icon">
                  <i className={"fa-solid " + form.app.icon}></i>
                </div>
                <div className="viz-n">{form.name}</div>
                <div className="viz-i" onClick={() => showFormPreview(form)}>
                  <i className="fa-solid fa-eye"></i>
                </div>
                <div className="viz-i" onClick={() => goToEdit(form)}>
                  <i className="fa-solid fa-edit"></i>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {showPreview && (
        <FormPreview
          conf={JSON.parse(prevForm.template).controls}
          layout={JSON.parse(prevForm.template).layout}
          vizName={prevForm.name}
          closePreview={setShowPreview}
        />
      )}
    </div>
  );
}

export default AppDashboard;
