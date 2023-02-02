import { toggleErrText, toggleFieldErr } from "./toggleErrField&Text";
import hash from "./hash_func"; // async
import doesTheEmailExist from "./doesTheEmailExists"; // async

export default class loginAuth {
  constructor(place, userErrMessages) {
    this.place = place;
    this._form = document.querySelector(this.place);
    this._form.setAttribute("novalidate", true);
    this._inputs = this._filterInputs([
      ...this._form.querySelectorAll("input"),
    ]);
    this._submit = this._form.querySelector("[type=submit]");
    this._API_REQUEST = "http://localhost:6561/accounts";
    this._validityError = false;
    this._errMessages = this._defineErrMessages(userErrMessages);

    this._bindListeners();
  }

  _filterInputs(inputs) {
    return inputs.filter((el) => el.type !== "submit");
  }

  _defineErrMessages(userMessages) {
    const defaultMessages = {
      invalidInput: "Sorry, your email/password is wrong",
      notAnEmail: "Sorry, this is not an email",
      emptyInput: "There is no data",
      noDatabase: "There are no accounts yet, redirecting to register page in",
    };
    return Object.assign({}, defaultMessages, userMessages);
  }

  _checkInputValue(element) {
    let errFlag = false;
    if (element.required) {
      // if the element type is email
      if (element.type === "email") {
        const properValue = /[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+/g;
        errFlag = !properValue.test(element.value);
        toggleFieldErr(element, errFlag);
        toggleErrText(element, errFlag, this._errMessages.notAnEmail);
      } else {
        errFlag = element.value < 1 ? true : false;
        toggleFieldErr(element, errFlag);
        toggleErrText(element, errFlag, this._errMessages.emptyInput);
      }
    }

    return errFlag;
  }

  _bindListeners() {
    this._loginValidity = this._loginValidity.bind(this);
    this._form.addEventListener("submit", (e) => {
      e.preventDefault();
      this._loginValidity();
    });
  }

  async _loginValidity() {
    this._validityError = false;
    const hashedData = {};
    for (const input of this._inputs) {
      const { type, value } = input;

      if (this._checkInputValue(input)) {
        // error detected
        this._validityError = true;
      } else {
        // no error
        if (!this._validityError) hashedData[type] = await hash(value);
      }
    }

    if (this._validityError) return;
    const { resEmail, resPassword, name } = await this._downloadUserData(
      hashedData
    );
    if (!resEmail)
      toggleErrText(this._form, true, this._errMessages.invalidInput);
    const loginFlag = this._compareData(resEmail, resPassword, hashedData);
    if (loginFlag === "OK") {
      alert(`Welcome on board ${name}`);
    }
  }

  async _downloadUserData({ email }) {
    const req = await fetch(`${this._API_REQUEST}/${email}`),
      res = await req.json();

    return { resEmail: res.id, resPassword: res.password, name: res.name };
  }

  _compareData(resEmail, resPassword, { email, password }) {
    if (
      (resEmail !== email && resPassword !== password) ||
      resEmail !== email ||
      resPassword !== password
    ) {
      toggleErrText(this._form, true, this._errMessages.invalidInput);
      return "error";
      // wrong email
    } else {
      return "OK";
    }
  }
}
