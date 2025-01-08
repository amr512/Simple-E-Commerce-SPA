import {navigateTo} from "./helpers.js"
const STORE_NAME = "Store"

window.addEventListener("load",()=>{
    console.log(window.location.hash)
    const container = document.getElementById("content")
    const links = document.getElementsByClassName("nav-link")


    document.addEventListener("click",async (e)=>{
        console.log(e.target.classList)
        if(e.target.classList.contains("nav-link")){
            e.preventDefault()
            const page = await (await fetch("pages/"+relativePath+ ".html")).text()
            container.innerHTML = page
            document.title = STORE_NAME + " - "  +  e.target.innerText.capitalize
            
        }

    })
    
    window.addEventListener("popstate", (e) => {
        if(e.state){
            document.getElementById("content").innerHTML = e.state.html;
            document.title = e.state.pageTitle;
        }
    });



})
