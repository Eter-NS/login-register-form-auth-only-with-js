import "../scss/main.scss";
import "../scss/register components/register.scss";
import opacityListener from "./components/label_opacity_listener";
import hashFunc from "./components/hash_func";
import RegisterAuth from "./components/register_auth";
// hashFunc(text).then((digestHex) => console.log(digestHex));

document.addEventListener("DOMContentLoaded", (e) => {
  document.querySelectorAll(".form--input-container").forEach((el) => {
    opacityListener(el.lastElementChild, el.firstElementChild);
  });
  const form = new RegisterAuth(".form");
});
