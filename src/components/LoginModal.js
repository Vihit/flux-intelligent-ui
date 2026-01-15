import "./LoginModal.css";
import { useState } from "react";

function LoginModal(props) {
  const [username, setUsername] = useState("");
  const [pwd, setPwd] = useState("");

  function pressedKey(e) {
    if (e.key === "Enter") {
      props.loginHandler(username, pwd);
    }
  }

  return (
    <div className={"login-modal glass"}>
      <div className="flex-row-title">
        <div
          style={{
            fontSize: "2.5rem",
            fontWeight: "normal",
            marginBottom: "2rem",
          }}
        >
          Hi! Guest
        </div>
      </div>
      <div className="new-esign-input">
        <div className="new-job-ta">
          <input
            style={{
              height: "4rem",
              background: "#ededed",
              outline: "none",
              borderRadius: "4rem",
              width: "100%",
            }}
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          ></input>
        </div>
      </div>
      <div className="new-esign-input">
        <div className="new-job-ta">
          <input
            type="password"
            placeholder="Password"
            style={{
              height: "4rem",
              background: "#ededed",
              outline: "none",
              borderRadius: "4rem",
              width: "100%",
            }}
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            onKeyDown={(e) => pressedKey(e)}
          ></input>
        </div>
      </div>
      <div className="flex-row-title">
        <div
          className="btn-save hand"
          onClick={() => props.loginHandler(username, pwd)}
        >
          Login
        </div>
        <div className="btn-cancel hand" onClick={props.close}>
          Cancel
        </div>
      </div>
    </div>
  );
}

export default LoginModal;
