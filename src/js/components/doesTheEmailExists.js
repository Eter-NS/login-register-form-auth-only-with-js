import hashMessage from "./hash_func";
export default function doesTheEmailExist(dataObject, emailInput) {
  let emailHash,
    exists = false;
  hashMessage(emailInput.value).then((hashedValue) => {
    emailHash = hashedValue;
  });
  for (const key in Object.keys(dataObject)) {
    if (key === emailHash) {
      exists = true;
    }
  }

  return exists;
}
