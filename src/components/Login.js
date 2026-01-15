import { useEffect, useState } from "react";
import "./Login.css";
import { config } from "./config";
import jwt from "jwt-decode";
import LoginModal from "./LoginModal";

function Login(props) {
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    if (
      window.name === "" ||
      JSON.parse(window.name).access_token == undefined
    ) {
    } else {
      let accessToken = JSON.parse(window.name);
      localStorage.setItem("access", window.name);
      localStorage.setItem(
        "user",
        JSON.stringify(jwt(accessToken.access_token))
      );
      props.onLogin();
    }
  });

  function loginHandler(username, pwd) {
    let user = { username, pwd };
    var formBody = [];
    formBody.push(
      encodeURIComponent("username") + "=" + encodeURIComponent(username)
    );
    formBody.push(
      encodeURIComponent("password") + "=" + encodeURIComponent(pwd)
    );
    formBody = formBody.join("&");
    fetch(config.apiUrl + "login", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        Accept: "application/json",
      },
      body: formBody,
    })
      .then((response) => {
        if (response.ok) return response.json();
        else {
          props.raiseAlert("red", "Username or Password incorrect!", 3000);
          throw new Error("Login unsuccessful!");
        }
      })
      .then((actualData) => {
        props.raiseAlert("green", "Login Successful!");
        localStorage.setItem("access", JSON.stringify(actualData));
        localStorage.setItem(
          "user",
          JSON.stringify(jwt(actualData["access_token"]))
        );
        props.onLogin();
      });
  }

  return (
    <div className="login-flex-container">
      <div className="login-btn" onClick={() => setShowLogin(true)}>
        <i className="fa-solid fa-fingerprint"></i>
      </div>

      <div className={"login-header"}>
        <div className="no-login-header">
          <div style={{ display: "flex", alignItems: "center" }}>
            <i
              className="fa-solid fa-book"
              style={{ fontSize: "9rem", marginRight: "1rem" }}
            ></i>
          </div>
          <div>Logever</div>
        </div>
        <div className={"login-sub-header"}>
          by pharma
          <div
            style={{
              position: "relative",
              display: "flex",
            }}
          >
            <span
              style={{
                fontSize: "3rem",
                paddingLeft: "3.05rem",
                marginTop: "0.1rem",
              }}
            >
              S
            </span>
            <div className="app-os"></div>
          </div>
        </div>
      </div>

      {showLogin && (
        <LoginModal
          loginHandler={loginHandler}
          close={() => setShowLogin(false)}
        ></LoginModal>
      )}
      <div className="version">Version 1.0</div>
    </div>
  );
}

export default Login;
