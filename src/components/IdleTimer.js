import React, { useState, useEffect } from "react";
const IdleTimer = ({ onTimeout }) => {
  const sessionTimeout =
    localStorage.getItem("user") != undefined &&
    localStorage.getItem("user") != null
      ? JSON.parse(localStorage.getItem("user"))["sessionTimeout"] != undefined
        ? JSON.parse(localStorage.getItem("user"))["sessionTimeout"] * 60 * 1000
        : 10 * 60 * 1000
      : 10 * 60 * 1000;
  const [idle, setIdle] = useState(false);
  let timeoutId;
  const resetTimeout = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      onTimeout();
    }, sessionTimeout);
  };

  useEffect(() => {
    resetTimeout();
    window.addEventListener("click", resetTimeout);
    window.addEventListener("mousemove", resetTimeout);
    window.addEventListener("keydown", resetTimeout);
    window.addEventListener("scroll", resetTimeout);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("click", resetTimeout);
      window.removeEventListener("mousemove", resetTimeout);
      window.removeEventListener("keydown", resetTimeout);
      window.removeEventListener("scroll", resetTimeout);
    };
  }, [onTimeout]);
  return <div className="close-flex"></div>;
};
export default IdleTimer;
