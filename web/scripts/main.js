import { DocElement, requests } from "./helpers.js";
import { createNavbar, createTable, createProductCard } from "./components.js";

window.addEventListener("load", async () => {
  const container = new DocElement("#content");
  const navbar = createNavbar("home");
  document.body.prepend(navbar.element);

  const products = (await (
    await requests.GET(`http://localhost:5500/products`)
  ).json()).filter(prod=>prod.stock>0);
  let searchQuery = new window.URLSearchParams(window.location.search).get("search")
  if(searchQuery){
    const filtered = products.filter(prod=>prod.name.toLowerCase().includes(searchQuery.toLowerCase()))
    if(filtered.length>0){
      filtered.forEach(async prod=>
        (await createProductCard(prod)).appendTo("#cards")
      )
    }else{
      new DocElement("div","",{},"flex-column justify-center align-center").append(
        [
          new DocElement("h1",`no products matching query "${searchQuery}" found`).appendTo("#cards"),
          new DocElement("a", "",{href:"index.html"}).append(new DocElement("button","return home")).appendTo("#cards")
        ]
      ).appendTo("#cards")
    }
  }else{
    products.forEach(async (prod) => {
      (await createProductCard(prod)).appendTo("#cards");
    });
  }
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
