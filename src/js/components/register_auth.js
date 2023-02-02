import hashMessage from "./hash_func";
import { toggleErrText, toggleFieldErr } from "./toggleErrField&Text";
import doesTheEmailExist from "./doesTheEmailExists";

export default class RegisterAuth {
  constructor(place, errMessagesObject) {
    this.place = place;
    this._form = document.querySelector(place);
    // turning off HTML validation
    this._form.setAttribute("novalidate", true);

    this._inputs = this.filterInputs([...this._form.querySelectorAll("input")]);
    this._submit = this._form.querySelector("[type=submit]");
    this._API_REQUEST = "http://localhost:6561/accounts";
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
        this.checkElement(e.target, this._authenticationError);
      });
    });

    this._form.addEventListener("submit", (e) => {
      e.preventDefault();
      this.checkElements(this._inputs);
    });
  }

  removeErrText(element) {
    toggleFieldErr(element, false);
    toggleErrText(element, false);
  }

  checkElement(element, errFlag) {
    if (element.required) {
      if (!element.value.length) {
        errFlag = true;
        toggleFieldErr(element, true);
        toggleErrText(element, true, this._errTextMessages.invalidLength);
      } else {
        this.removeErrText(element);
      }

      // Checks if the element has enough length
      if (element.minLength > -1) {
        if (element.value.length < element.minLength) {
          errFlag = true;
          toggleFieldErr(element, true);
          toggleErrText(element, true, this._errTextMessages.tooShort);
        } else {
          this.removeErrText(element);
        }
      }

      // Checks if the element has any length

      // Checks if the element overflowed the length
      if (element.maxLength > -1) {
        if (element.value.length < element.maxLength) {
          errFlag = true;
          toggleFieldErr(element, true);
          toggleErrText(element, true, this._errTextMessages.tooLong);
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
        errFlag = !properValue.test(element.value);
        toggleFieldErr(element, errFlag);
        toggleErrText(element, errFlag, this._errTextMessages.invalidPassword);
      }

      // if the element type is email
      if (element.type === "email") {
        const properValue = /[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+/g;
        errFlag = !properValue.test(element.value);
        toggleFieldErr(element, errFlag);
        toggleErrText(element, errFlag, this._errTextMessages.invalidEmail);
      }
    }

    return errFlag;
  }

  checkElements(elementsArray) {
    let hasError;
    for (let i = 0; i < elementsArray.length; i++) {
      // if true, the hasError flag is true, even if the next input is false, it does not change
      if (this.checkElement(elementsArray[i], this._authenticationError)) {
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

  async sendForm() {
    const emailInput = this._inputs.find((el) => el.type === "email");
    const doesExists = await doesTheEmailExist(this._API_REQUEST, emailInput);
    if (doesExists) {
      // the email already exists inside the database, error handling
      toggleFieldErr(emailInput, true);
      toggleErrText(emailInput, true, this._errTextMessages.emailExists);
      this.buttonShaking();
      return;
    } else {
      toggleFieldErr(emailInput, false);
      toggleErrText(emailInput, false);
      this.saveData();
      this._form.submit();
      location.href = location.origin + "/login.html";
    }
  }

  async saveData() {
    const databaseObject = {},
      cache = {};

    for (const { type, id, value } of this._inputs) {
      // hashes the sensitive data
      if (type === "password") {
        cache[id] = await hashMessage(value);
      } else if (type === "email") {
        cache["id"] = await hashMessage(value);
      } else {
        // other input data is saving here without security
        cache[id] = value;
      }
    }
    // the new account subtree
    //log when the account as created
    databaseObject["created"] = this.returnTimestamp();

    // assigns user data to database
    for (const [key, value] of Object.entries(cache)) {
      databaseObject[key] = value;
    }

    fetch(this._API_REQUEST, {
      method: "post",
      mode: "cors",
      cache: "no-cache",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(databaseObject),
    });
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
