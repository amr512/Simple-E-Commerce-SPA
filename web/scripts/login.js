import { validateInput, requests, errorAlert, DocElement, successAlert } from "./helpers.js";
window.addEventListener("load", () => {
  try {
    if (JSON.parse(localStorage.getItem("currentuser")).id) {
      window.location.assign("user.html");
    }
  } catch {}
  const form = new DocElement("-form");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    let data = new FormData(e.target);
    let err = [];
    data.forEach((value, key) => {
      err.push(validateInput(value, key));
    });
    err = err.filter((e) => e.length > 0);
    if (err.length > 0) {
      errorAlert(err.join("\n&\n"));
      return;
    }

    let user;
    let res = await requests.POST("http://localhost:5500/users/auth", {
      email: data.get("email").trim().toLowerCase(),
      password: data.get("password").trim(),
    });
    console.log(res)
    if (res.status == 200) {
      user = await res.json();
      localStorage.setItem("currentuser", JSON.stringify(user));
      window.location.assign("user.html");
    } else {
      errorAlert((await res.json()).message)
    }
  });

  const forgot = new DocElement("#forgot")
  console.log(forgot.element)
  forgot.addEventListener("click", () => {
    successAlert("too bad, make a new account")
  });
});
