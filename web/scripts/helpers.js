// #region helpers
const navigateTo = async function (
  path = String(),
  name = String(),
  window = new Window()
) {
  // if (typeof path != "string") return;
  
  const page = await (await fetch(path)).text();
  window.location.assign("#" + name);
  return page;
};

class DocElement {
  element;
  constructor(
    _element,
    _text = undefined,
    _attributes = {},
    _classes = [],
    _css = {}
  ) {
    if (!_element.constructor.name.includes("Element")) {
      this.element = document.createElement(_element);
    } else {
      this.element = _element;
    }
    if (typeof _text == "string") this.text(_text);
    if (_attributes) {
      Object.entries(_attributes).forEach(([key, value]) => {
        this.setAttribute(key, value);
      });
    }
    if (_classes) {
      _classes.forEach((className) => {
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
    selector.constructor.name == "DocElement"?
    selector.append(this.element):
    document.querySelector(selector).appendChild(this.element);
    return this;
  }
  append(element) {
    element.constructor.name == "DocElement"?
    this.element.appendChild(element.element):
    this.element.appendChild(element);
    return this;
  }
  text(text) {
    this.element.innerText = text;
    return this;
  }
  addClass(className) {
    this.element.classList.add(className);
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
  this = this.element;
}

const validateInput = (inputElement, validateAs = inputElement.type) => {
  let isValid = false;
  switch (validateAs) {
    case "email":
      isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inputElement.value);
      break;
    case "password":
      isValid = inputElement.value.length >= 8;
      break;
    default:
      isValid = inputElement.value.length > 0;
      break;
  }
  if (!isValid) {
    inputElement.classList.add("invalid");
    document
      .getElementById(`invalid-${inputElement.name}`)
      ?.classList.remove("hidden");
  } else {
    inputElement.classList.remove("invalid");
    document
      .getElementById(`invalid-${inputElement.name}`)
      ?.classList.add("hidden");
  }
  return isValid;
};
export { navigateTo, DocElement, validateInput };
// #endregion helpers

// #region proto-changes
// i read online that i should not be modifying the prototype of
// built in classes so i'm doing it anyway (don't care + didn't ask)
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
// #endregion
