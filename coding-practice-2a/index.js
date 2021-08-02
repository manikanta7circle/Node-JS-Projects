const addDays = require("date-fns/addDays");

const result = (days) => {
  const r = addDays(new Date(2020, 7, 22), days);
  return `${r.getDate()}-${r.getMonth() + 1}-${r.getFullYear()}`;
};
console.log(result(50));
module.exports = result;
