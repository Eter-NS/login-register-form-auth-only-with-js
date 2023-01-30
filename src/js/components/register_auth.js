import hashMessage from "./hash_func";
import doesTheEmailExist from "./doesTheEmailExists";

export default class RegisterAuth {
  constructor(place, errMessagesObject) {
    this.place = place;
    this._form = document.querySelector(place);
    // turning off HTML validation
    this._form.setAttribute("novalidate", true);

    this._inputs = this.filterInputs([...this._form.querySelectorAll("input")]);
    this._submit = this._form.querySelector("[type=submit]");
    this._authenticationError = false;

    this._errTextMessages = this.defineErrMessages(errMessagesObject);

    // Connecting event listeners
    this.connectListeners();
  }

  defineErrMessages(userMessages) {
    const defaultErrMessages = {
      invalidLength: "The element is empty",
      tooShort: "The answer is too short",
      tooLong: "The answer is too long",
      invalidPassword:
        "Please write a proper Password (min. 1 upper letter, 1 lower letter, 1 digit, 1 special character, minimum length is 8)",
      invalidEmail:
        "Please write a proper Email (example@example.domain, minimum length is 8)",
      emailExists:
        "The account with this email already exists. Please choose another one",
    };

    return Object.assign({}, defaultErrMessages, userMessages);
  }

  filterInputs(inputs) {
    return inputs.filter((el) => el.type !== "submit");
  }

  connectListeners() {
    this.checkElement = this.checkElement.bind(this);
    this.checkElements = this.checkElements.bind(this);

    this._inputs.map((input) => {
      input.addEventListener("blur", (e) => {
        this.checkElement(e.target);
      });
    });

    this._form.addEventListener("submit", (e) => {
      e.preventDefault();
      this.checkElements(this._inputs);
    });
  }

  toggleFieldErr(element, switcher) {
    element.classList.toggle("form--input__field-error", switcher);
  }

  toggleErrText(element, switcher, message) {
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

  removeErrText(element) {
    this.toggleFieldErr(element, false);
    this.toggleErrText(element, false);
  }

  checkElement(element) {
    if (element.required) {
      // if (!element.value.length) {
      //   this._authenticationError = true;
      //   this.toggleFieldErr(element, true);
      //   this.toggleErrText(element, true, this._errTextMessages.invalidLength);
      // } else {
      //   this.removeErrText(element);
      // }

      // Checks if the element has enough length
      if (element.minLength > -1) {
        if (element.value.length < element.minLength) {
          this._authenticationError = true;
          this.toggleFieldErr(element, true);
          this.toggleErrText(element, true, this._errTextMessages.tooShort);
        } else {
          this.removeErrText(element);
        }
      }

      // Checks if the element has any length

      // Checks if the element overflowed the length
      if (element.maxLength > -1) {
        if (element.value.length < element.maxLength) {
          this._authenticationError = true;
          this.toggleFieldErr(element, true);
          this.toggleErrText(element, true, this._errTextMessages.tooLong);
        } else {
          this.removeErrText(element);
        }
      }

      // if the element type is password
      if (element.type === "password") {
        // const properValue = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/g;
        // const properValue = /^(.{0,7}|[^0-9]*|[^A-Z]*|[^a-z]*|[a-zA-Z0-9]*)$/g;

        const properValue =
          /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-]).{8,}$/g;
        this._authenticationError = !properValue.test(element.value);
        this.toggleFieldErr(element, this._authenticationError);
        this.toggleErrText(
          element,
          this._authenticationError,
          this._errTextMessages.invalidPassword
        );
      }

      // if the element type is email
      if (element.type === "email") {
        const properValue = /[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+/g;
        this._authenticationError = !properValue.test(element.value);
        this.toggleFieldErr(element, this._authenticationError);
        this.toggleErrText(
          element,
          this._authenticationError,
          this._errTextMessages.invalidEmail
        );
      }
    }

    return this._authenticationError;
  }

  checkElements(elementsArray) {
    let hasError;
    for (let i = 0; i < elementsArray.length; i++) {
      if (this.checkElement(elementsArray[i])) {
        hasError = true;
      }
    }

    if (hasError) {
      this.buttonShaking();
    } else {
      this.sendForm();
    }
  }

  buttonShaking() {
    this._submit.classList.add("error-shake");
    setTimeout(() => {
      this._submit.classList.remove("error-shake");
    }, 1000);
  }

  sendForm() {
    const existingAccounts =
      JSON.parse(sessionStorage.getItem("accounts")) || null;

    if (existingAccounts) {
      const emailInput = this._form.querySelector("[type=email]");
      const hasExists = doesTheEmailExist(existingAccounts, emailInput);

      if (hasExists) {
        // the email already exists inside the database, error handling
        this.toggleFieldErr(emailInput, true);
        this.toggleErrText(emailInput, true, this._errTextMessages.emailExists);
        return;
      } else {
        this.toggleFieldErr(emailInput, false);
        this.toggleErrText(emailInput, false);
        this.saveData(existingAccounts);
      }
    } else {
      const accountsObj = {};
      this.saveData(accountsObj);
    }
    location.href = location.origin + "/login.html";
    this._form.submit();
  }

  async saveData(databaseObject) {
    let email,
      cache = {};

    for (let i = 0; i < this._inputs.length; i++) {
      const { type, id, value } = this._inputs[i];

      // hashes the sensitive data
      if (type === "password") {
        cache[id] = await hashMessage(value);
      } else if (type === "email") {
        email = await hashMessage(value);
      } else {
        // other input data is saving here  without security
        cache[id] = value;
      }
    }
    databaseObject[email] = {};
    databaseObject[email]["created"] = this.returnTimestamp();

    // assigns user data to database
    for (const [key, value] of Object.entries(cache)) {
      databaseObject[email][key] = value;
    }

    console.log(databaseObject);
    sessionStorage.setItem("accounts", JSON.stringify(databaseObject));
  }

  returnTimestamp() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const value = `${hours < 10 ? "0" + hours : hours}:${
      minutes < 10 ? "0" + minutes : minutes
    }:${seconds < 10 ? "0" + seconds : seconds}`;

    return value;
  }
}
