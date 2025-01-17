/*
    <div class="nav-container">
      <div class="navbar" id="navbar">
        <div class="logo" id="logo">
          <img class="nav-logo" src="/images/logo.png" />
        </div>
        <div class="nav-links" id="nav-links">
          <a class="nav-link" id="home">Home</a>
          <a class="nav-link" id="bigbricks">BigBricks</a>
          <a class="nav-link" id="smallbricks">SmallBricks</a>
          <a class="nav-link" id="notbricks">NotBricks</a>
        </div>
        <div class="search">
          <input id="search" type="text" placeholder="Search..." />
          <i class="fa-solid fa-magnifying-glass search-button"></i>
        </div>
        <div class="icons" id="icons">
          <a href="/pages/login.html"><i class="fa-solid fa-user"></i></a>
          <i class="fa-solid fa-cart-shopping"></i>
        </div> 
      </div>
    </div>
*/

import { DocElement } from "./helpers.js";

const createNavbar = (currentPage) => {
  const conatiner = new DocElement("div", "", {}, "nav-container");
  conatiner.append(
    new DocElement("div", "", { id: "navbar" }, "navbar").append([
      new DocElement("div", "", { id: "logo" }, "logo").append(
        new DocElement("img", "", { src: "/images/logo.png" }, "nav-logo")
      ),
      new DocElement("div", "", { id: "nav-links" }, "nav-links").append(
        currentPage == "home" && [
          new DocElement("a", "Home", { id: "home" }, "nav-link"),
          new DocElement("a", "BigBricks", { id: "bigbricks" }, "nav-link"),
          new DocElement("a", "SmallBricks", { id: "smallbricks" }, "nav-link"),
          new DocElement("a", "NotBricks", { id: "notbricks" }, "nav-link"),
        ]
      ),
      new DocElement("div", "", { id: "search" }, "search").append([
        new DocElement("input", "", {
          id: "search",
          type: "text",
          placeholder: "Search...",
        }),
        new DocElement(
          "i",
          "",
          {},
          "fa-solid fa-magnifying-glass search-button"
        ),
      ]),
      new DocElement("div", "", { id: "icons" }, "icons").append([
        currentPage != "login" &&
          currentPage != "user" &&
          new DocElement("a", "", { href: "/pages/login.html" }).append(
            new DocElement("i", "", {}, "fa-solid fa-user")
          ),
        currentPage != "cart" &&
          new DocElement("a", "", { href: "/pages/cart.html" }).append(
            new DocElement("i", "", {}, "fa-solid fa-cart-shopping")
          ),
      ]),
    ])
  );
  return conatiner;
};

const createTable = (tableObj = [{}]) => {
  /*
    {header:cell}
    */

  const table = new DocElement("table");
  const header = new DocElement("tr");
  Object.entries(tableObj[0]).forEach(([key, value]) => {
    if (key != "id") header.append(new DocElement("th", key.toString()));
  });
  table.append(header);
  //   let rows = []
  tableObj.forEach((obj) => {
    const row = new DocElement("tr", "", { id: (obj?.id || "")},`id${obj?.id}`);
    Object.entries(obj).forEach(([key, value]) => {
      if(key=="deleted"&&value == true){row.addClass("deleted")}
      if(key=="approved"&&value == false){row.addClass("unapproved")}
      if(key=="admin"&&value == true){row.addClass("admin")}
      if(key=="seller"&&value == true){row.addClass("seller")}
      if (key != "id") {
        if (key == "images") {
          row.append(
            new DocElement("td").append(
              value.map(
                (v) =>
                  new DocElement("img", "", {
                    src: "http://localhost:5500/images/" + v,
                  })
              )
            )
          );
        } else if (typeof value == "object") {
          row.append(new DocElement("td", JSON.stringify(value)));
        } else {
          row.append(new DocElement("td", value?.toString()));
        }
      }
    });
    // rows.push(row)
    table.append(row);
  });
  return table;
};

export { createNavbar, createTable };
