import { DocElement } from "./helpers.js";

window.addEventListener("load", async () => {

  const userID =
    JSON.parse(localStorage.getItem("currentuser"))
  const currentuser = await (
    await fetch(
      `http://localhost:5500/users/${JSON.parse(localStorage.getItem("currentuser")).id
      }`,
      {
        credentials: "include",
      }
    )
  ).json();
  if (currentuser.id == undefined) window.location.assign("login.html");
  if (!currentuser.seller) window.location.assign("user.html");
  const store = await (
    await fetch(`http://localhost:5500/stores/${currentuser.storeID}`, {
      credentials: "include",
    })
  ).json();
  const greeting = document.getElementById("greeting");
  const email = document.getElementById("email");
  const includeDeleted = document.getElementById("includeDeleted");
  greeting.innerText = greeting.innerText.replace("{{name}}", currentuser.name);
  email.innerText = currentuser.email;
  let selectedID;
  let page = 1;

  const tabs = document.querySelectorAll(".tablinks");
  const tabContents = document.querySelectorAll(".tabs .tabcontent");
  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("active"));
      tabContents.forEach((content) => content.classList.add("hidden"));
      selectedID = undefined;
      page = 1;

      tab.classList.add("active");
      tabContents[index].classList.remove("hidden");
    });
  });
  tabs[0].click();
  // click first tab to hide the content of the rest

  const updateOrders = async (page) => {
    const ordersTable = new DocElement(
      document.getElementById("orders-table-body")
    );
    ordersTable.element.innerHTML = "";
    document.getElementById("page-number").value = page;
    const orders = await (
      await fetch(`http://localhost:5500/store/orders/${store.id}?limit=5`, {
        credentials: "include",
      })
    ).json();
    orders.forEach(async (order) => {
      const row = new DocElement("tr", "", { id: "row" + order.id });
      ordersTable.append(row);
      row.append(
        new DocElement(
          "td",
          (
            await (
              await fetch(`http://localhost:5500/users/${order.userID}`, {
                credentials: "include",
              })
            ).json()
          ).name
        )
      );
      // const userCell = row.append(new DocElement("td", order.userId));
      row.append(
        new DocElement(
          "td",
          (
            await Promise.all(
              order.products.map(
                async (prod) =>
                  `${prod.quantity.toString()} x ${(
                    await (
                      await fetch(
                        `http://localhost:5500/products/${prod.productID}`,
                        {
                          credentials: "include",
                        }
                      )
                    ).json()
                  ).name
                  }`
              )
            )
          ).toString()
        )
      );
      row.append(new DocElement("td", order.address));
      row.append(new DocElement("td", order.date));
      const statusTd = new DocElement("td")
      const status = new DocElement("select", "", {
        id: "order-status-" + order.id
      });
      status.append(
        new DocElement("option", "pending", {
          value: "pending",
          // id: "order-pending-" + order.id,
          selected: order.status == "pending",
        })
      );
      status.append(
        new DocElement("option", "shipped", {
          value: "shipped",
          // id: "order-shipped-" + order.id,
          selected: order.status == "shipped",
        })
      );
      status.append(
        new DocElement("option", "delivered", {
          value: "delivered",
          // id: "order-delivered-" + order.id,
          selected: order.status == "delivered",
        })
      );
      row.append(statusTd.append(status));
      // const selected = new DocElement("td");
      // const selectedRadio = new DocElement("input", "", {
      //   type: "radio",
      //   name: "selected",
      //   id: "order-radio-" + order.id,
      // });
      // selected.append(selectedRadio);
      // row.append(selected);
      // document.querySelector("*").tagName
      // document.querySelector("order-status-"+order.id)
      status.element.addEventListener("change", async (e) => {
        console.log(e.target.value)
        // if (e.target.tagName.toLowerCase() == "option") {

          document.querySelectorAll("*").forEach((element) => {
            element.classList.add("progress");
          });
          let res = await fetch(`http://localhost:5500/orders/${order.id}/`, {
            method: "PUT",
            body: JSON.stringify({ status: e.target.value }),
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          });
          res.status == 200?
          Swal.fire({
            icon: "success",
            title: "Order updated successfully",
            showConfirmButton: true,
          })
          :
          Swal.fire({
            icon: "error",
            title: "Failed to update order",
            showConfirmButton: true,
          })


          document.querySelectorAll("*").forEach((element) => {
            element.classList.remove("progress");
          });
        }
      // }
      )
    });
  };

  await updateOrders(page);

  const updateProducts = async (page) => {
    const productsTable = new DocElement(
      document.getElementById("products-table-body")
    );
    productsTable.element.innerHTML = "";
    document.getElementById(
      "selected-product"
    ).innerHTML = `<div id="product-fields"></div>`;
    document.getElementById("page-number").value = page;
    const products = await (
      await fetch(`http://localhost:5500/products?page=${page}&limit=5`, {
        credentials: "include",
      })
    ).json();

    products.forEach((product) => {
      const row = new DocElement("tr", "", { id: "row" + product.id }, [
        product.deleted ? "deleted" : undefined,
      ]);
      productsTable.append(row);
      const nameCell = row.append(new DocElement("td", product.name));
      const priceCell = row.append(
        new DocElement("td", product.price.toString())
      );
      const categoriesCell = row.append(
        new DocElement("td", product.categories.toString())
      );
      const descriptionCell = row.append(
        new DocElement("td", product.description)
      );
      const imageCell = new DocElement("td");
      product.images.forEach((img) => {
        imageCell.append(
          new DocElement("img", "", {
            src: "http://localhost:5500/images/" + img,
          })
        );
      });
      row.append(imageCell);
      const selected = new DocElement("td");
      const selectedRadio = new DocElement("input", "", {
        type: "radio",
        name: "selected",
        id: "product-radio-" + product.id,
      });
      selected.append(selectedRadio);
      row.append(selected);
      selectedRadio.element.addEventListener("change", async (e) => {
        document.querySelectorAll("*").forEach((element) => {
          element.classList.add("progress");
        });
        selectedID = selectedRadio.element.id;
        document.getElementById(
          "selected-product"
        ).innerHTML = `<div id="product-fields">
              
            </div>`;
        // document.querySelector("#selected-product input[type=button]")?.remove();

        if (e.target.checked == true) {
          let _product = await (
            await fetch(`http://localhost:5500/products/${product.id}/`, {
              method: "GET",
              credentials: "include",
            })
          ).json();
          let inputs = [];
          for (let key in _product) {
            let div = new DocElement("div", "", {});
            let input = new DocElement("input", "", {
              value: _product[key],
              placeholder: key,
              id: key,
              name: key,
              type: typeof _product[key] == "boolean" ? "checkbox" : "text",
              checked: _product[key],
              dataType: _product[key]?.constructor.name || null,
              disabled: key == "id",
            });
            let label = new DocElement("label", key, { for: key });
            inputs.push(input);
            label.appendTo(div);
            input.appendTo(div);
            div.appendTo("#product-fields");
          }
          let submit = new DocElement("input", "", {
            type: "button",
            value: "submit",
          });
          submit.appendTo("#selected-product");
          submit.element.addEventListener("click", async (e) => {
            let obj = {};
            inputs.forEach((input) => {
              switch (input.element.dataType) {
                case "Boolean":
                  obj[input.element.id] = input.element.checked ? true : false;
                  break;
                case "Array":
                  obj[input.element.id] = input.element.value
                    .split(",")
                    .filter((e) => e);
                  break;
                case "String":
                  obj[input.element.id] = input.element.value;
                  break;
                case "Number":
                  obj[input.element.id] = Number(input.element.value);
                  break;
                case null:
                  obj[input.element.id] =
                    input.element.value === "" ? null : input.element.value;
                  break;
                default:
                  break;
              }
            });
            let res = await fetch(
              `http://localhost:5500/products/${product.id}/`,
              {
                method: "PUT",
                body: JSON.stringify(obj),
                credentials: "include",
                headers: {
                  "Content-Type": "application/json",
                },
              }
            );
            Swal.fire({
              icon: "success",
              title: "Product updated successfully",
              showConfirmButton: true,
            });
            updateProducts(page).then(() =>
              document.getElementById(selectedID).click()
            );
          });
        }
        document.querySelectorAll("*").forEach((element) => {
          element.classList.remove("progress");
        });
      });
    });
  };
  await updateProducts(page);
  document
    .getElementById("page-controls")
    .addEventListener("click", async (e) => {
      switch (e.target.id) {
        case "previous":
          if (page > 1) {
            page--;
          }
          break;
        case "next":
          page++;
          break;
        default:
          break;
      }
      updateProducts(page);
      updateOrders(page);
    });
});
