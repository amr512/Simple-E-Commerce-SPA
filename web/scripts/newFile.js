window.addEventListener("load", () => {
    console.log(window.location.pathname);
    window.history.pushState({ "html": document.body.innerHTML, "pageTitle": "home" }, "", "index.html/home");
    const links = document.getElementsByClassName("nav-link");
    const container = document.getElementById("content");


    document.addEventListener("click", async (e) => {
        console.log(e.target.classList);
        if (e.target.classList.contains("nav-link")) {
            e.preventDefault();
            const page = await (await fetch("pages/" + e.target.id + ".html")).text();
            container.innerHTML = page;
            window.history.pushState({ "html": page, "pageTitle": e.target.id }, "", e.target.id);

        }

    });

    window.addEventListener("popstate", (e) => {
        if (e.state) {
            document.getElementById("content").innerHTML = e.state.html;
            document.title = e.state.pageTitle;
        }
    });



});
