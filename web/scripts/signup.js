import { validateInput } from "./helpers.js";
window.addEventListener("load", () => {
  document.getElementsByTagName("form")[0].addEventListener("submit", async(e) => {
    e.preventDefault();
    const inputValidity = Array.from(document.getElementsByTagName("input"))
      //   .reverse()
      .map((element = new HTMLInputElement()) => {
        if (element.type != "password") {
          return validateInput(element);
        }
      });
    if (inputValidity.includes(false)) return;
    let data = new FormData(e.target);
    if (data.get("password").length <6) {
        document
          .getElementById("invalid-password")
          .classList.remove("hidden");
    }
    if (data.get("password") != data.get("passwordConfirmation")) {
      document
        .getElementById("invalid-passwordConfirmation")
        .classList.remove("hidden");
    }
    const user = {
        email:data.get("email"),
        password:data.get("password"),
        name:data.get("name"),
        phone:data.get("phone"),
        address:data.get("address")
    }
    if((await (await fetch(`http://localhost:5500/users?email=${user.email.trim().toLowerCase()}`)).json()).length==0){
        await fetch("http://localhost:5500/users",{
            method:"POST",
            body:JSON.stringify(user)
        })
    }
  });
});
