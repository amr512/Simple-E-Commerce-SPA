import { createNavbar, createProductDetailsPage } from "./components.js";

window.addEventListener("load",async()=>{
    document.body.prepend(createNavbar("product").element);

    const urlParams = new URLSearchParams(window.location.search);
    const prodID = urlParams.get('id');
    (await createProductDetailsPage(prodID)).appendTo("#content");
})
