import { createProductDetailsPage } from "./components.js";

window.addEventListener("load",async()=>{
    const urlParams = new URLSearchParams(window.location.search);
    const prodID = urlParams.get('id');
    (await createProductDetailsPage(prodID)).appendTo("#content");
})
