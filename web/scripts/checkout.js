import { createCheckoutTable, createNavbar } from "./components.js";
import { DocElement, errorAlert, requests } from "./helpers.js";

window.addEventListener("load", async (e) => {
  document.body.prepend(createNavbar("checkout").element);
  (await createCheckoutTable()).appendTo("#content");
  new DocElement("#empty-cart").addEventListener("click", (e) => {
    localStorage.removeItem("cart");
    window.location.reload();
  });
  const submit = new DocElement("button", "Checkout").appendTo("#content");
  submit.addEventListener("click", async (e) => {
    let currentUser = JSON.parse(localStorage.getItem("currentuser"))
    if(!JSON.parse(localStorage.getItem("currentuser"))){
      await errorAlert("You need to be logged in to checkout")
      window.location.assign("login.html")
      return
    }
    const cart = JSON.parse(localStorage.getItem("cart") || `{"items":[]}`);
    const order = {
      "id": "",
      "userID": currentUser.id,
      "products": cart.items,
      "address": currentUser.address,
      "date": new Date().toString(),
      "total": cart.items.reduce((acc, curr) => acc + Number(curr.quantity) * Number(curr.price), 0),
      "status": "pending"
    }
    const res = await requests.POST("http://localhost:5500/orders/new", order);
    if (res.status == 200) {
      localStorage.removeItem("cart");
      Swal.fire({
        icon: "success",
        title: "Order placed successfully",
        showConfirmButton: true,
      }).then((e) => window.location.assign("user.html"));
    } else {
      Swal.fire({
        icon: "error",
        title: "Failed to place order",
        showConfirmButton: true,
      });
    }
  });
});
