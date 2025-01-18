import { createCheckoutTable, createNavbar } from "./components.js";
import { DocElement } from "./helpers.js";

window.addEventListener("load", async (e) => {
  document.body.prepend(createNavbar("checkout").element);
  (await createCheckoutTable()).appendTo("#content");
});
