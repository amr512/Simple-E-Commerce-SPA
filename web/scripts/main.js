import { DocElement } from "./helpers.js";
import { createNavbar, createTable } from "./components.js";

window.addEventListener("load", () => {
  const container = document.getElementById("content");
  const navbar = createNavbar("home");
  document.body.prepend(navbar.element);

  const content = new DocElement(".content");
  content.append(
    createTable([
      { real: "shit", goes: "jhe345re", number: 2, id: "ideeznuts" },
      { real: "s3453hit", goes: "jhe45re", number: 552 },
      { real: "shit", goes: "jh666ere", number: 266 },
      { real: "sh3453it", goes: "jh43ere", number: 25 },
      { real: "453shit", goes: "jhere", number: 2345 },
      { real: "shit", goes: "j35here", number: 234 },
    ])
  );
  Array.from(
    content.element.children[0]
    .children).forEach(child => {
    child
    .addEventListener("click",e=>{
      alert(e.currentTarget.id)
    })
  });

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

// console.log(
//   await (
//     await fetch("http://localhost:5500/users/auth", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         password: "123456",
//         username: "a@a",
//       }),
//     })
//   ).json()
// );
