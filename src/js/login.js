import "../scss/main.scss";
import "../scss/login components/login.scss";
import opacityListener from "./components/label_opacity_listener";
import loginAuth from "./components/login_auth";

document.addEventListener("DOMContentLoaded", (e) => {
  document.querySelectorAll(".form--input-container").forEach((el) => {
    opacityListener(el.lastElementChild, el.firstElementChild);
  });
  const loginForm = new loginAuth(".form");
});
