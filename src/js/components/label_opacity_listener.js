export default function (inputElement, standalonePlaceholder) {
  inputElement.addEventListener("focus", (e) => {
    standalonePlaceholder.classList.add("is-active");
  });
  inputElement.addEventListener("blur", (e) => {
    if (!inputElement.value > 0) {
      standalonePlaceholder.classList.remove("is-active");
    }
  });
}
