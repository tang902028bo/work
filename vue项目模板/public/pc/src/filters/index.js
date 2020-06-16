const timeFormat = (value, format) => {
  value = new Date(value).toString().includes("1970") ? value * 1000 : value;
  let date = new Date(value);
  let y = date.getFullYear();
  let m = date.getMonth() + 1;
  let d = date.getDate();
  let h = date.getHours();
  let min = date.getMinutes();
  let s = date.getSeconds();
  let result = "";
  if (format == undefined) {
    result = `${y}-${m < 10 ? "0" + m : m}-${d < 10 ? "0" + d : d} ${
      h < 10 ? "0" + h : h
    }:${min < 10 ? "0" + min : min}:${s < 10 ? "0" + s : s}`;
  }
  if (format == "yyyy-mm-dd") {
    result = `${y}-${m < 10 ? "0" + m : m}-${d < 10 ? "0" + d : d}`;
  }
  if (format == "yyyy-mm") {
    result = `${y}-${m < 10 ? "0" + m : m}`;
  }
  if (format == "mm-dd") {
    result = ` ${m < 10 ? "0" + m : m}:${d < 10 ? "0" + d : d}`;
  }
  if (format == "hh:mm") {
    result = ` ${h < 10 ? "0" + h : h}:${min < 10 ? "0" + min : min}`;
  }
  if (format == "yyyy") {
    result = `${y}`;
  }
  return result.includes("1970") ? "" : result;
};
const numberFormat = (value, len) => {
  if (value) {
    let radix = 10 ** len;
    return Math.round(value * radix) / radix;
  } else {
    return 0;
  }
};
export { timeFormat, numberFormat };
