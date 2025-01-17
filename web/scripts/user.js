import { createNavbar } from "./components.js";
import { DocElement, errorAlert, requests, successAlert } from "./helpers.js";

window.addEventListener("load", async () => {
  createNavbar("user").prependTo("body");
  const currentuser = await (
    await requests.GET(
      `http://localhost:5500/users/${
        JSON.parse(localStorage.getItem("currentuser")).id
      }`,
      {
        credentials: "include",
      }
    )
  ).json();
  if (currentuser.id == undefined) {
    localStorage.setItem("currentuser", undefined);
    window.location.assign("login.html");
  }
  const adminPortal = new DocElement("#admin-portal");
  const storePortal = new DocElement("#store");
  const createStore = new DocElement("#create-store");
  const admin = currentuser.id === "00000000-0000-0000-0000-000000000000";
  if (admin) {
    adminPortal.removeClass("hidden");
  } else if (currentuser.seller) {
    storePortal.removeClass("hidden");
  } else {
    createStore.removeClass("hidden");
  }
  new DocElement("#greeting").text(`Hello, ${currentuser.name}!`);
  new DocElement("#email").text(currentuser.email);
  new DocElement("#name").setAttribute("value", currentuser.name);
  new DocElement("#phone").setAttribute("value", currentuser.phone);
  new DocElement("#address").setAttribute("value", currentuser.address);

  document.addEventListener("submit", async (e) => {
    if (e.target.id == "info") {
      e.preventDefault();
      let data = new FormData(e.target);
      let user = {
        name: data.get("name"),
        email: data.get("email"),
        phone: data.get("phone"),
        address: data.get("address"),
      };
      let res = await requests.PUT(
        `http://localhost:5500/users/${currentuser.id}`,
        user
      );
      res.status != 200
        ? Swal.fire({
            icon: "error",
            title: (await res.json()).message,
            showConfirmButton: true,
            // timer: 1500,
          })
        : Swal.fire({
            icon: "success",
            title: "Your information has been updated",
            showConfirmButton: true,
            // timer: 1500,
          });
    }
    if (e.target.id == "password") {
      e.preventDefault();
      let data = new FormData(e.target);

      let user = {
        password: data.get("newPassword"),
        oldPassword: data.get("oldPassword"),
        passwordConfirmation: data.get("confirmNewPassword"),
      };
      console.log(user);
      if (user.password.length < 6 || user.oldPassword.length < 6) {
        Swal.fire({
          icon: "error",
          title: "Password must be at least 6 characters long",
          showConfirmButton: true,
        });
        return;
      } else if (user.password != user.passwordConfirmation) {
        errorAlert("Passwords do not match");
        return;
      } else if (user.password == user.oldPassword) {
        errorAlert("New password cannot be the same as old password");
        return;
      }
      let res = await requests.PUT(
        `http://localhost:5500/users/password/${currentuser.id}`,
        user
      );
      res.status != 200
        ? errorAlert((await res.json()).message)
        : successAlert("Your password has been changed");
    }
  });
  new DocElement("#convert").addEventListener("click", async (e) => {
    let storeName = new DocElement("#store-name").element.value.trim()
    console.log(storeName)
    if(!storeName){
      errorAlert("Store name can't be empty");
      return;
    }
    storeName = storeName
    let res = await requests.POST(`http://localhost:5500/users/create-store`, {
      user: currentuser.id,
      name: storeName,
    });
    if(res==200){
      await successAlert(`Store ${storeName} created! Redirecting...`)
      window.location.assign("seller.html")
    }else{
      await errorAlert(`Store ${storeName} can't be created! Reason:\n${(await res.json()).message}`)
    }
  });
  new DocElement("#logout").addEventListener("click", (e) => {
    e.preventDefault();
    window.localStorage.setItem("currentuser", undefined);
    requests
      .POST("http://localhost:5500/users/logout", {
        method: "POST",
        credentials: "include",
      })
      .then(() => window.location.assign("login.html"));
  });
});
