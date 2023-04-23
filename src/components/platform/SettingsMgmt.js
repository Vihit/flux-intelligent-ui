import "./SettingsMgmt.css";
import { config } from "../config";
import { useEffect, useState } from "react";

function SettingsMgmt(props) {
  const [selectedSetting, setSelectedSetting] = useState("");
  const [settings, setSettings] = useState([]);
  const [settingHeads, setSettingHeads] = useState([]);
  const [updatedSettings, setUpdatedSettings] = useState([]);

  useEffect(() => {
    getSettings();
  }, []);

  function getSettings() {
    fetch(config.apiUrl + "settings/", {
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
        props.raiseAlert("green", "Fetched Settings!");
        setSettings(actualData);
        setSettingHeads(
          actualData
            .map((aD) => aD.type)
            .reduce(function (op, a) {
              if (op.includes(a)) return op;
              else {
                op.push(a);
                return op;
              }
            }, [])
        );
      });
  }

  function handleSettingMainClick(set) {
    setSelectedSetting(set);
  }

  function settingChanged(id, value) {
    setUpdatedSettings((prev) => {
      let toBeUpdated = [...prev];
      if (toBeUpdated.filter((s) => s.id === id).length > 0) {
        let restOfTheSettings = toBeUpdated.filter((s) => s.id != id);
        let settingToBeAdded = toBeUpdated.filter((s) => s.id == id)[0];
        settingToBeAdded["value"] = value;
        restOfTheSettings.push(settingToBeAdded);
        return restOfTheSettings;
      } else {
        let settingToBeAdded = settings.filter((s) => s.id == id)[0];
        settingToBeAdded["value"] = value;
        toBeUpdated.push(settingToBeAdded);
        return toBeUpdated;
      }
    });
  }

  function updateSetting() {
    let finalUpdates = updatedSettings.map((uS) => {
      return { id: uS.id, key: uS.key, value: uS.value };
    });
    fetch(config.apiUrl + "settings/all", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization:
          "Bearer " + JSON.parse(localStorage.getItem("access")).access_token,
      },
      body: JSON.stringify(finalUpdates),
    }).then((response) => {
      if (response.ok) {
        props.raiseAlert("green", "Settings updated!");
        getSettings();
      }
    });
  }

  return (
    <div className="f-dtl-container">
      <div className="f-dtl-head">
        <div className="f-dtl-name">Settings</div>
      </div>
      <div className="f-setting-table">
        <div className="f-head">
          {settingHeads.map((head, inx) => {
            return (
              <div
                className={
                  "f-head-in " +
                  (selectedSetting === head ? "f-head-in-selected" : "")
                }
                key={inx}
                onClick={() => setSelectedSetting(head)}
              >
                {head}
              </div>
            );
          })}
        </div>
        {selectedSetting != "" && (
          <div className="f-set-container">
            <div className="f-head-set">{selectedSetting + " Settings"}</div>
            <div className="set-ctrls">
              {settings
                .filter((s) => s.type === selectedSetting)
                .map((set, inx) => {
                  return (
                    <div
                      key={inx}
                      className="created-row"
                      style={{ width: "100%" }}
                    >
                      <div className="creation-cell" style={{ width: "100%" }}>
                        <div className="cell-name">
                          <div>{set.key}</div>
                        </div>
                        <div className="cell-control">
                          <input
                            type="text"
                            value={set.value}
                            onChange={(e) =>
                              settingChanged(set.id, e.target.value)
                            }
                          ></input>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
        {selectedSetting != "" && (
          <div className="btn-controls">
            <div onClick={updateSetting} className="create-btn">
              Update
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SettingsMgmt;
