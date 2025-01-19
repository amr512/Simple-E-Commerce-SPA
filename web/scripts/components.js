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

import { DocElement, errorAlert } from "./helpers.js";

const createNavbar = (currentPage) => {
  const conatiner = new DocElement("div", "", {}, "nav-container");
  let cartButton = conatiner.append(
    new DocElement("div", "", { id: "navbar" }, "navbar").append([
      new DocElement("div", "", { id: "logo" }, "logo").append(
        new DocElement("a", "", { href: "/index.html" }).append(
          new DocElement("img", "", { src: "/images/logo.png" }, "nav-logo")
        )
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
        currentPage != "checkout" &&
          new DocElement("a", "", { href: "/pages/checkout.html" }).append(
            new DocElement(
              "i",
              "",
              { id: "cart-button" },
              "fa-solid fa-cart-shopping",
              { position: "relative" }
            )
          ),
      ]),
    ])
  );

  cartButton.addEventListener("click", (e) => {
    createCartPopover().then((e) => {
      e.appendTo(cartButton);
    });
  });

  return conatiner;
};

const createCartPopover = async () => {
  let visible = false;
  let popover = new DocElement("div", "", {}, "");
  const btn = new DocElement("#cart-button");
  btn.addEventListener("click", async (e) => {
    if (e.currentTarget.id == "cart-button") {
      // console.log(getComputedStyle(new DocElement("i", "", {}, "fa-solid fa-cart-shopping").element).height)
      if (visible) {
        btn.element.innerHTML = "";
      } else {
        const cart = JSON.parse(localStorage.getItem("cart") || "[]");
        popover = new DocElement(
          "div",
          "",
          { id: "cart-popover" },
          "cart-popover hidden",
          { position: "absolute", top: 45, right: 0 }
        );
        const title = new DocElement("h3", "Cart");
        const items = new DocElement("ul");
        let totalPrice = 0;
        if (cart.length === 0) {
          items.append(new DocElement("li", "Your cart is empty"));
        } else {
          await Promise.all(
            cart.map(async (item) => {
              const product = await (
                await fetch(`http://localhost:5500/products/${item.id}`)
              ).json();
              const li = new DocElement(
                "li",
                `${product.name} x ${item.quantity}`
              );
              totalPrice += Number(product.price) * Number(item.quantity);
              items.append(li);
            })
          );
        }
        const totalPriceElement = new DocElement("p", `Total: $${totalPrice}`);
        popover.append([title, items, totalPriceElement]);
      }
    }
  });

  return popover;
};

const createTable = (tableObj) => {
  /*
    {header:cell}
    */
  if(tableObj.length==0 || !tableObj[0])return new DocElement("table")
  const table = new DocElement("table");
  const header = new DocElement("tr");
  Object.entries(tableObj[0]).forEach(([key, value]) => {
    if (key != "id") header.append(new DocElement("th", key.toString()));
  });
  table.append(header);
  //   let rows = []
  tableObj.forEach((obj) => {
    const row = new DocElement("tr", "", { id: obj?.id || "" }, `id${obj?.id}`);
    Object.entries(obj).forEach(([key, value]) => {
      if (key == "deleted" && value == true) {
        row.addClass("deleted");
      }
      if (key == "approved" && value == false) {
        row.addClass("unapproved");
      }
      if (key == "admin" && value == true) {
        row.addClass("admin");
      }
      if (key == "seller" && value == true) {
        row.addClass("seller");
      }
      if (key != "id") {
        if (key == "images") {
          row.append(
            new DocElement("td").append(
              value.map(
                (v) =>
                  new DocElement("img", "", {
                    src: v.startsWith("http") ? v : "http://localhost:5500/images/" + v,
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

const createProductCard = async (product) => {
  const card = new DocElement("div", "", {}, "product-card");
  card.addEventListener("click", (e) => {
    if (e.target.id !== "add-to-cart")
      window.location.assign(`/pages/product.html?id=${product.id}`);
  });
  const div1 = new DocElement("div");
  const div2 = new DocElement("div");
  const img = new DocElement("img", "", {
    src: product.images[0].startsWith("http") ? product.images[0] : "http://localhost:5500/images/" + product.images[0],
  });
  const title = new DocElement("h3", product.name);
  const price = new DocElement(
    "p",
    product.price == 0 ? "FREE" : `$${product.price}`
  );
  const addToCart = new DocElement(
    "i",
    "",
    { id: "add-to-cart", product: product.id },
    "fa-solid fa-cart-shopping"
  );
  addToCart.text(
    JSON.parse(localStorage.getItem("cart") || `{"items":[]}`).items.find(
      (item) => item.id == product.id
    )?.quantity || ""
  );
  addToCart.addEventListener("click", (e) => {
    const cart = JSON.parse(localStorage.getItem("cart") || `{"items":[]}`);
    const index = cart.items.findIndex(
      (item) => item.id == e.currentTarget.product
    );
    // console.log(index)
    if (index > -1) {
      // console.log("found",cart.items[index])
      cart.items[index].quantity++;
      if (cart.items[index].quantity > product.stock) {
        errorAlert(`Product quantity can't exceed available stock`);
        cart.items[index].quantity = product.stock;
      }
      addToCart.text(cart.items[index].quantity);
    } else {
      cart.items.push({ id: e.target.product, quantity: 1,price:product.price });
      // console.log("not found",cart.items[cart.items.length-1])
      addToCart.text(1);
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    // localStorage.setItem("cart",JSON.stringify([...JSON.parse(localStorage.getItem("cart")||"[]"),product.id]))
  });
  div1.append(img);
  div2.append([title, price, addToCart]);
  card.append([div1, div2]);
  return card;
};

const createCheckoutTable = async () => {
  const cart = JSON.parse(localStorage.getItem("cart") || `{"items":[]}`);
  const table = new DocElement("table");
  const header = new DocElement("tr");
  header.append(new DocElement("th", "Image"));
  header.append(new DocElement("th", "Product"));
  header.append(new DocElement("th", "Quantity"));
  header.append(new DocElement("th", "Price"));
  table.append(header);
  let totalPrice = 0;
  await Promise.all(
    cart.items.map(async (item) => {
      const product = await (
        await fetch(`http://localhost:5500/products/${item.id}`)
      ).json();
      const row = new DocElement("tr");
      const amount = new DocElement("input", "", {
        type: "number",
        value: item.quantity,
        min: 0,
      });
      const deleteBtn = new DocElement("button", "delete");
      row.append([
        new DocElement("td").append(
          new DocElement("a", "", {
            href: `/pages/product.html?id=${product.id}`,
          }).append(
            new DocElement("img", "", {
              src: product.images[0].startsWith("http") ? product.images[0] : "http://localhost:5500/images/" + product.images[0]
            })
          )
        ),
        new DocElement("td", product.name),
        new DocElement("td").append(amount).append(deleteBtn),
        new DocElement("td", (product.price * item.quantity).toString()),
      ]);
      totalPrice += product.price * item.quantity;
      table.append(row);
      amount.addEventListener("change", (e) => {
        if (e.target.value > product.stock) {
          amount.setAttribute("value", product.stock);
          errorAlert(`Product quantity can't exceed available stock`);
        }
      });
      deleteBtn.addEventListener("click", (e) => {
        localStorage.setItem(
          "cart",
          JSON.stringify({
            items: cart.items.filter((item) => item.id != product.id),
          })
        );
        row.element.remove();
      });
    })
  );
  const totalRow = new DocElement("tr");
  totalRow.append(new DocElement("td", "Total", {}, "total-label"));
  totalRow.append(new DocElement("td", "", {}, "total-label"));
  totalRow.append(new DocElement("td", "", {}, "total-label"));
  totalRow.append(new DocElement("td", totalPrice.toString()));
  table.append(totalRow);

  return table;
};

const createProductDetailsPage = async (prodID) => {
  const product = await (
    await fetch(`http://localhost:5500/products/${prodID}`)
  ).json();
  const page = new DocElement(
    "div",
    "",
    { id: "product-page" },
    "product-page"
  );
  let currentImg = 0;
  let imgLen = product.images.length;
  const img = new DocElement(
    "img",
    "",
    { src: product.images[currentImg].startsWith("http")?product.images[currentImg]: `http://localhost:5500/images/${product.images[currentImg]}` },
    "product-image"
  );
  const controls = new DocElement(
    "div",
    "",
    { id: "product-controls" },
    "product-controls"
  );
  const prevImg = new DocElement("button", "previous image");
  const crnt = new DocElement("p", `Image ${currentImg + 1}/${imgLen}`);
  const nextImg = new DocElement("button", "next image");
  controls.append([prevImg, crnt, nextImg]);
  prevImg.addEventListener("click", (e) => {
    if (currentImg > 0) {
      currentImg--;
      crnt.text(`Image ${currentImg + 1}/${imgLen}`);

      img.setAttribute(
        "src",
        product.images[currentImg].startsWith("http")?product.images[currentImg]:`http://localhost:5500/images/${product.images[currentImg]}`
      );
    }
  });
  nextImg.addEventListener("click", (e) => {
    if (currentImg < imgLen - 1) {
      currentImg++;
      crnt.text(`Image ${currentImg + 1}/${imgLen}`);
      img.setAttribute(
        "src",
        product.images[currentImg].startsWith("http")?product.images[currentImg]:`http://localhost:5500/images/${product.images[currentImg]}`
      );
    }
  });
  const titleDiv = new DocElement("div", "", {}, "product-title-container");
  const title = new DocElement("h1", product.name, "", "product-title");
  const addToCart = new DocElement(
    "button",
    "",
    { id: "add-to-cart" },
    "add-to-cart"
  );
  const icon = new DocElement(
    "i",
    `in cart ${
      JSON.parse(localStorage.getItem("cart"))?.items?.find(
        (item) => item.id == product.id
      )?.quantity || 0
    }`,
    {},
    "fa-solid fa-cart-shopping"
  );
  addToCart.append(icon);
  addToCart.addEventListener("click", (e) => {
    const cart = JSON.parse(localStorage.getItem("cart") || `{"items":[]}`);
    const index = cart.items.findIndex((item) => item.id == product.id);
    if (index > -1) {
      cart.items[index].quantity++;
      if (cart.items[index].quantity > product.stock) {
        errorAlert(`Product quantity can't exceed available stock`);
        cart.items[index].quantity = product.stock;
      }
      icon.text(
        `in cart ${
          cart.items.find((item) => item.id == product.id).quantity || 0
        }`
      );
    } else {
      cart.items.push({ id: product.id, quantity: 1,price:product.price });
      icon.text(`in cart 1`);
    }
    localStorage.setItem("cart", JSON.stringify(cart));
  });

  titleDiv.append([title, addToCart]);
  const price = new DocElement("h2", `$${product.price}`, "", "product-price");
  const description = new DocElement(
    "p",
    product.description,
    "",
    "product-description"
  );
  page.append([img, controls, titleDiv, price, description]);
  return page;
};

export {
  createNavbar,
  createTable,
  createProductCard,
  createCheckoutTable,
  createProductDetailsPage,
};
