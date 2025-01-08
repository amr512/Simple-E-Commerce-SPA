import { navigateTo, DocElement } from "./helpers.js";
import { pages as p, STORE_NAME } from "./constants.js";

window.addEventListener("load", () => {
  console.log(window.location.hash);
  const container = document.getElementById("content");
  let pages = p.map((obj) => {
    if (!obj.hidden)
      return new DocElement("a")
        .text(obj.name)
        .setAttribute("id", obj.name)
        .addClass("nav-link")
        .setAttribute("path", obj.path)
        .appendTo("navbar");
        console.log(document.querySelector("#navbar").children[1].constructor.name)
        console.log((new DocElement(document.querySelector("#navbar").children[1])).getAttribute("path"))
    // const a = document.createElement("a")
    // a.innerText = obj.name
    // a.id = obj.name
    // a.classList.add("nav-link")
    // a.path = obj.path
    // document.getElementById("navbar").appendChild(a)
  });
  // document.getElementById("content").innerText = "testing capitalize".capitalize(true)
  // document.getElementById("content").innerText = "testing capitalize".capitalize()
  console.log(pages);
  document.addEventListener("click", async (e) => {
    console.log(e.target.classList);
    if (e.target.classList.contains("nav-link")) {
      e.preventDefault();
      console.log(e.target);
      container.innerHTML = await navigateTo(
        e.target.getAttribute(path),
        e.target.innerText,
        window
      );
      document.title = STORE_NAME + " - " + e.target.innerText.capitalize();
    }
  });

  window.addEventListener("popstate", (e) => {
    if (e.state) {
      document.getElementById("content").innerHTML = e.state.html;
      document.title = e.state.pageTitle;
    }
  });
});
