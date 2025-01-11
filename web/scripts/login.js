window.addEventListener("load",()=>{
    document.getElementsByTagName("form")[0].addEventListener("submit",async (e)=>{
        e.preventDefault()
        let data = new FormData(e.target)
        let user = await (await fetch(`http://localhost:5500/users?email=${data.get("email").trim().toLowerCase()}&password=${data.get("password").trim()}`)).json()
        console.log(user)
        if(user.length==1){
            alert("logged in as "+user[0].name)
        }
    })
})