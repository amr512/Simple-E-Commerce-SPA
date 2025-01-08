// #region helpers
const navigateTo = async function (
  path = String(),
  name = String(),
  window = new Window()
) {
  if (typeof path != "string") return;
  const page = await (await fetch(path)).text();
  window.location.hash = name;
  // this.window.history.pushState({"html":page,"pageTitle":pathParts[pathParts.length-1]},"",relativePath)
  return page;
};

class DocElement {
  element;
  constructor(_element) {
    if(!_element.constructor.name.includes("Element"))
        this.element = document.createElement(_element);
    else
        this.element = _element;
    return this;
  }
  setAttribute(key, value) {
    this.element.setAttribute(key, value);
    return this;
  }
  getAttribute(key) {
    return this.element.getAttribute(key);
  }
  addClass(className) {
    this.element.classList.add(className);
    return this;
  }
  removeClass(className) {
    this.element.classList.remove(className);
    return this;
  }
  toggleClass(className) {
    this.element.classList.toggle(className);
    return this;
  }
  appendChild(child) {
    this.element.appendChild(child);
    return this;
  }
  appendTo(parentId) {
    document.getElementById(parentId).appendChild(this.element);
    return this;
  }
  html(html) {
    if (html == undefined) {
      return this.element.innerHTML;
    } else {
      this.element.innerHTML = html;
      return this;
    }
    // this.element.innerHTML = html
    // return this
  }
  text(text) {
    this.element.innerText = text;
    return this;
  }
  on(event, listener) {
    this.element.addEventListener(event, listener);
    return this;
  }
}

export { navigateTo, DocElement };
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
