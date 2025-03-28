import { useEffect, useState } from "react";
import "./Login.css";
import { config } from "./config";
import jwt from "jwt-decode";
import fi from "./../fi.png";

function Login(props) {
  const [username, setUsername] = useState("");
  const [pwd, setPwd] = useState("");

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

  function loginHandler() {
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
      })
      .catch((err) => {
        props.raiseAlert("red", "Username or Password incorrect!", 3000);
      });
  }

  function pressedKey(e) {
    if (e.key === "Enter") {
      loginHandler();
    }
  }

  return (
    <div className="login-flex-container">
      {/* <div className="scrum-svg"></div> */}
      <div className="scrum-svg">{/* <img src={fi}></img> */}</div>

      <div className="login-screen">
        <div className="login-header">Login</div>
        <div className="form">
          <div className="control">
            <input
              type="text"
              placeholder="username"
              onChange={(e) => setUsername(e.target.value)}
            ></input>
          </div>
          <div className="control">
            <input
              type="password"
              placeholder="password"
              onKeyDown={(e) => pressedKey(e)}
              onChange={(e) => setPwd(e.target.value)}
            ></input>
          </div>
          <div className="submit" onClick={loginHandler}>
            Go
          </div>
        </div>
      </div>
      <div className="version">Version 1.0</div>
    </div>
  );
}

export default Login;
