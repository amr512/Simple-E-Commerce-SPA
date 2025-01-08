const navigateTo =async (relativePath) =>{
    const pathParts = relativePath.split("/")
    const page = await (await fetch("pages/"+relativePath+ ".html")).text()
    window.history.pushState({"html":page,"pageTitle":pathParts[pathParts.length-1]},"",relativePath)
    return page;
}

const capitalize = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

export {navigateTo}