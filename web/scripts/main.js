import { navigateTo, DocElement } from "./helpers.js";
import { pages as p, STORE_NAME } from "./constants.js";

window.addEventListener("load", () => {
  const container = document.getElementById("content");
  // let loadedPage = "Home";
  // let pages = p.filter(obj => !obj.hidden).map((obj) => {
  //     return new DocElement("a", obj.name, {id:obj.name,path:obj.path}, ["nav-link"]).appendTo("#navbar #nav-links")
  //   });
  //   console.log(pages)
  // document.addEventListener("click", async (e) => {
  //   console.log(e.target.classList);
  //   if (e.target.classList.contains("nav-link")) {
  //     container.innerHTML = `<img src="images/loading.svg"/>`;
  //     let element = new DocElement(e.target);
  //     if (e.target.classList.contains("nav-link")) {
  //       e.preventDefault();

  //       container.innerHTML = await navigateTo(
  //         element.getAttribute("path"),
  //         element.innerText,
  //         window
  //       );
  //       document.title = STORE_NAME + " - " + e.target.innerText.capitalize();
  //     }
  //   }
  // });
});

console.log(
  await (
    await fetch("http://localhost:5500/users/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        password: "123456",
        username: "a@a",
      }),
    })
  ).json()
);
