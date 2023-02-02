function toggleFieldErr(element, switcher) {
  element.classList.toggle("form--input__field-error", switcher);
}

function toggleErrText(element, switcher, message) {
  const brotherElement = element.nextElementSibling;
  if (brotherElement?.classList.contains("form--input__text-error")) {
    brotherElement.style.display = switcher ? "block" : "none";
  } else if (switcher) {
    const errorTextParagraph = document.createElement("p");
    errorTextParagraph.classList.add("form--input__text-error");
    errorTextParagraph.style.display = "block";
    errorTextParagraph.innerHTML = message;
    element.after(errorTextParagraph);
  }
}

export { toggleErrText, toggleFieldErr };
