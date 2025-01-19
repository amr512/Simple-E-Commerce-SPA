import { createNavbar } from "./components.js";
import { errorAlert, requests, successAlert, validateInput } from "./helpers.js";
window.addEventListener("load", () => {
  document.body.prepend(createNavbar("checkout").element);
  document
    .getElementsByTagName("form")[0]
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      const inputs = Array.from(document.querySelectorAll("form input"));
      let errArr = [];
      //   .reverse()
      inputs.forEach((element) => {
        let err;
        if (["button", "submit"].includes(element.type)) return;
        if (["email", "password"].includes(element.type)) {
          err = validateInput(element.value, element.type);
        } else {
          err = validateInput(element.value, element.name);
        }
        if (err) {
          errArr.push(err);
        }
      });
      if (errArr.length > 0) {
        errorAlert(errArr.join("\n"));
      }

      let data = new FormData(e.target);
      if (data.get("password").length < 6) {
        document.getElementById("invalid-password").classList.remove("hidden");
      }
      if (data.get("password") != data.get("passwordConfirmation")) {
        document
          .getElementById("invalid-passwordConfirmation")
          .classList.remove("hidden");
      }
      // {
      //   "id": "00000000-0000-0000-0000-000000000000",
      //   "email": "admin@bricks.store",
      //   "password": "admin123",
      //   "name": "Admin",
      //   "orderIDs": [],
      //   "seller": true,
      //   "storeID": "00000000-0000-0000-0000-000000000000",
      //   "deleted": false,
      //   "admin": true,
      //   "phone": "0123456789",
      //   "address": "Here, he lives"
      // },
      const user = {
        id: "",
        email: data.get("email"),
        password: data.get("password"),
        name: data.get("name"),
        orderIds: [],
        seller: false,
        storeID: null,
        deleted: false,
        admin: false,
        phone: data.get("phone"),
        address: data.get("address"),
      };
      const res = await requests.POST(`http://localhost:5500/users/new`, user);
      if(res.status == 200){
        await successAlert("user created sucessfully")
        window.location.assign("user.html")
      }else{
        errorAlert((await res.json()).message)
      }
    });
});
