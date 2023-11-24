export const convertHexToUint8Array = (hexString: string): Uint8Array => {
  if (hexString.slice(0, 2) === "0x") {
    hexString = hexString.slice(2);
  }
  return new Uint8Array(Buffer.from(hexString, "hex"));
};

export const convertToBytes32 = (inputArray: Uint8Array): string[] => {
  const result: string[] = [];
  for (let i = 0; i < inputArray.length; i += 32) {
    const slice = inputArray.slice(i, i + 32);
    const hex = "0x" + Buffer.from(slice).toString("hex").padStart(64, "0");
    result.push(hex);
  }
  return result;
};

export const convertToBytes = (inputArray: Uint8Array): string => {
  const hex = Buffer.from(inputArray).toString("hex");
  return hex;
};
