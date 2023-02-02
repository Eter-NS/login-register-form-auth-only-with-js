import hashMessage from "./hash_func";
export default async function doesTheEmailExist(API_STRING, emailInput) {
  const emailHash = await hashMessage(emailInput.value),
    status = await fetch(`${API_STRING}/${emailHash}`).then((data) => {
      return data.statusText;
    });
  // returns OK when the email exists

  return status === "OK" ? true : false;
}
