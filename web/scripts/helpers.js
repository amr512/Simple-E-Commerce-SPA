// #region prototype changes
String.prototype.capitalize = function (capitalizeAll) {
  if (typeof capitalizeAll != "boolean") capitalizeAll = false;
  if (capitalizeAll) {
    if (this.includes(" "))
      return this.split(" ")
        .map((word) => word.trim().capitalize())
        .join(" ");
  }
  return this.charAt(0).toUpperCase() + this.slice(1);
};
const removeEmpty = (obj) => {
  return Object.fromEntries(
    Object.entries(obj).filter(
      ([_, b]) => b !== null && b !== "" && b !== undefined
    )
  );
};
localStorage.ge;
// #endregion

//#region helpers

//#region sweet alert wrappers
const successAlert = (title) =>
  Swal.fire({
    icon: "success",
    title: title,
    showConfirmButton: true,
  });
const errorAlert = (title) =>
  Swal.fire({
    icon: "error",
    title: title,
    showConfirmButton: true,
  });
//#region

//#region functions
const POST = async (url, data) => {
  return await fetch(url, {
    method: "POST",
    credentials: "include",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
    },
  });
};

const GET = async (url) => {
  return await fetch(url, {
    credentials: "include",
  });
};

const PUT = async (url, data) => {
  return await fetch(url, {
    method: "PUT",
    credentials: "include",
    body: JSON.stringify(removeEmpty(data)),
    headers: {
      "Content-Type": "application/json",
    },
  });
};

const DELETE = async (url) => {
  return await fetch(url, {
    credentials: "include",
    method: "DELETE",
  });
};

const requests = {
  POST,
  GET,
  PUT,
  DELETE,
};

const validateInput = (value, validateAs) => {
  let isValid = false;
  let errorMessage = "";
  switch (validateAs) {
    case "email":
      isValid = /^((?!\.)[\w\-_.]*[^.])(@\w+)(\.\w+(\.\w+)?[^.\W])$/.test(
        value
      );
      break;
    case "password":
      isValid = value.length >= 6;
      break;
    default:
      isValid = value.length > 0;
      break;
  }
  if (!isValid)
    errorMessage = `Invalid ${validateAs || "- field can't be empty"}`;
  return errorMessage;
};

//#endregion
//#region classes
class DocElement {
  element;
  constructor(
    _element,
    _text = undefined,
    _attributes = {},
    _classes = "",
    _css = {}
  ) {
    if (_element.constructor.name.includes("Element")) {
      this.element = _element;
    } else if (_element.trim().match(/^[\.#\-]/)) {
      let el = document.querySelector(_element.replace(/^\-/, "")); // ||
      if (el == null) throw new Error("Element not found");
      this.element = el;
    } else if (_element.constructor.name == "String") {
      this.element = document.createElement(_element);
    }
    if (typeof _text == "string") this.text(_text);
    if (_attributes) {
      Object.entries(_attributes).forEach(([key, value]) => {
        this.setAttribute(key, value);
      });
    }
    if (_classes) {
      _classes.split(" ").forEach((className) => {
        this.addClass(className);
      });
    }
    if (_css) {
      Object.entries(_css).forEach(([key, value]) => {
        this.element.style[key] = value;
      });
    }
    return this;
  }
  appendTo(selector) {
    selector.constructor.name == "DocElement"
      ? selector.append(this.element)
      : document.querySelector(selector).appendChild(this.element);
    return this;
  }
  prependTo(selector) {
    selector.constructor.name == "DocElement"
      ? selector.prepend(this.element)
      : document.querySelector(selector).prepend(this.element);
    return this;
  }
  append(element) {
    if (!element) return this;
    element.constructor.name == "Array"
      ? element.forEach((e) => this.append(e))
      : element.constructor.name == "DocElement"
      ? this.element.appendChild(element.element)
      : this.element.appendChild(element);
    return this;
  }
  text(text) {
    this.element.innerText = text;
    return this;
  }
  addClass(className) {
    className.includes(" ")
      ? className.split(" ").forEach((c) => this.element.classList.add(c))
      : this.element.classList.add(className);
    return this;
  }
  style(attribute, value) {
    this.element.style[attribute] = value;
    return this;
  }
  removeClass(className) {
    this.element.classList.remove(className);
    return this;
  }
  setAttribute(attribute, value) {
    this.element[attribute] = value;
    return this;
  }
  getAttribute(attribute) {
    return this.element[attribute];
  }
  addEventListener(event, listener) {
    this.element.addEventListener(event, listener);
    return this;
  }
}
//#endregion
// #endregion helpers

export { requests, DocElement, validateInput, errorAlert, successAlert,removeEmpty };
