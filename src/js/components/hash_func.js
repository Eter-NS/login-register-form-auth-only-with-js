export default async function hashMessage(message) {
  const msg = Array.from(message);
  // encode as (utf-8) Uint8Array
  const msgUint8 = new TextEncoder().encode(msg.join(""));
  // hash the message
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
  // convert buffer to byte array
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  // convert bytes to hex string
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
}
