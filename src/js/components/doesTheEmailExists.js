import hashMessage from "./hash_func";
export default async function doesTheEmailExist(dataObject, emailInput) {
  let emailHash,
    exists = false;
  emailHash = await hashMessage(emailInput.value);
  console.log(dataObject);
  for (const key in dataObject) {
    console.log(key, "\n", emailHash);
    console.log(key === emailHash);
    if (key === emailHash) {
      exists = true;
    }
  }

  return exists;
}
