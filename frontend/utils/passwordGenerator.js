// utils/passwordGenerator.js
export const generatePassword = (name, deskNumber) => {
  const prefix = name.slice(0, 3).toLowerCase(); // first 3 letters of name
  const randomNum = Math.floor(1000 + Math.random() * 9000); // 4-digit random
  return `${prefix}${deskNumber}_${randomNum}`;
};
