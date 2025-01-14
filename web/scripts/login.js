window.addEventListener("load", () => {
  try{
    if(JSON.parse(localStorage.getItem("currentuser")).id)
      {
        window.location.assign("user.html")
      }
    }catch{

    }
  document
    .getElementsByTagName("form")[0]
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      document.getElementById("error").innerText = "";
      let data = new FormData(e.target);
      console.log(data)
      // let user = await (await fetch(`http://localhost:5500/users?email=${data.get("email").trim().toLowerCase()}&password=${data.get("password").trim()}`)).json()
      //         console.log(user)
      let user;
        let res = await fetch("http://localhost:5500/users/auth", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            email: data.get("email").trim().toLowerCase(),
            password: data.get("password").trim(),
          }),
        }
      )
      if (res.status == 200) {
        user = await res.json();
        localStorage.setItem("currentuser", JSON.stringify(user));
        window.location.assign("user.html");
      } else {
        document.getElementById("error").innerText = (await res.json()).message;
        document.getElementById("password").value = "";
      }
    });
});
