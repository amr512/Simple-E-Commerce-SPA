window.addEventListener("load", async () => {
  const currentuser = await (
    await fetch(`http://localhost:5500/users/${JSON.parse(localStorage.getItem("currentuser")).id}`, {
      credentials: "include",
    })
  ).json();
  if (currentuser.id == undefined) {
    localStorage.setItem("currentuser",undefined)
    window.location.assign("login.html")
  };
  const seller = currentuser.seller;
  const admin = currentuser.id === "00000000-0000-0000-0000-000000000000";
  if (admin) {
    document.getElementById("admin-portal").classList.remove("hidden");
  } else if (seller) {
    document.getElementById("store").classList.remove("hidden");
  } else {
    document.getElementById("create-store").classList.remove("hidden");
  }
  const greeting = document.getElementById("greeting");
  const email = document.getElementById("email");
  const nameInput = document.getElementById("name");
  const phoneInput = document.getElementById("phone");
  const addressInput = document.getElementById("address");
  greeting.innerText = greeting.innerText.replace("{{name}}", currentuser.name);
  email.innerText = currentuser.email;
  nameInput.value = currentuser.name;
  phoneInput.value = currentuser.phone;
  addressInput.value = currentuser.address;
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
      let res = await fetch(`http://localhost:5500/users/${currentuser.id}`, {
        method: "PUT",
        body: JSON.stringify(user),
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
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
        Swal.fire({
          icon: "error",
          title: "Passwords do not match",
          showConfirmButton: true,
        });
        return;
      } else if (user.password == user.oldPassword) {
        Swal.fire({
          icon: "error",
          title: "New password cannot be the same as old password",
          showConfirmButton: true,
        });
        return;
      }
      let res = await fetch(`http://localhost:5500/users/password/${currentuser.id}`, {
        method: "PUT",
        body: JSON.stringify(user),
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      res.status != 200
        ? Swal.fire({
            icon: "error",
            title: (await res.json()).message,
            showConfirmButton: true,
            // timer: 1500,
          })
        : Swal.fire({
            icon: "success",
            title: "Your password has been changed",
            showConfirmButton: true,
            // timer: 1500,
          });
    }
  });
  document.getElementById("logout").addEventListener("click", (e) => {
    e.preventDefault();
    window.localStorage.setItem("currentuser",undefined)
    fetch("http://localhost:5500/users/logout", {
      method: "POST",
      credentials: "include",
    }).then(() => window.location.assign("login.html"));
    
  });
});
