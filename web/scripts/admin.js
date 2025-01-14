import { DocElement } from "./helpers.js";

window.addEventListener("load", async () => {
  const admin =
    JSON.parse(localStorage.getItem("currentuser"))?.id ===
    "00000000-0000-0000-0000-000000000000";
  if (!admin) window.location.assign("login.html");
  const currentuser = await (
    await fetch(
      `http://localhost:5500/users/${
        JSON.parse(localStorage.getItem("currentuser")).id
      }`,
      {
        credentials: "include",
      }
    )
  ).json();
  if (currentuser.id == undefined) window.location.assign("login.html");
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
  const updateUsers = async (page) => {
    const usersTable = new DocElement(
      document.getElementById("users-table-body")
    );
    usersTable.element.innerHTML = "";
    document.getElementById(
      "selected-user"
    ).innerHTML = `<div id="user-fields"></div>`;
    document.getElementById("page-number").value = page;
    const users = await (
      await fetch(
        `http://localhost:5500/users?includeDeleted=${includeDeleted.checked}&page=${page}&limit=5`,
        {
          credentials: "include",
        }
      )
    ).json();
    users.forEach((user) => {
      const classes = [];
      user.admin
        ? classes.push("admin-row")
        : user.seller
        ? classes.push("seller-row")
        : classes.push("user-row");
      user?.deleted ? classes.push("deleted") : "";
      const row = new DocElement("tr", "", { id: "row" + user.id }, classes);
      usersTable.append(row);
      row.append(new DocElement("td", user.name));
      row.append(new DocElement("td", user.email));
      row.append(new DocElement("td", user.phone));
      row.append(new DocElement("td", user.address));
      const selected = new DocElement("td");
      const selectedRadio = new DocElement("input", "", {
        type: "radio",
        name: "selected",
        id: "user-radio-" + user.id,
      });
      selected.append(selectedRadio);
      row.append(selected);
      // const deleted = new DocElement("td");
      // const deletedCheck = new DocElement("input", "", {
      //   type: "checkbox",
      //   name: "deleted",
      //   checked: user.deleted,
      //   id: "check-" + user.id,
      //   disabled: user.id == currentuser.id,
      // });
      // deleted.append(deletedCheck);
      // row.append(deleted);
      selectedRadio.element.addEventListener("change", async (e) => {
        document.querySelectorAll("*").forEach((element) => {
          element.classList.add("progress");
        });
        selectedID = selectedRadio.element.id;
        document.getElementById(
          "selected-user"
        ).innerHTML = `<div id="user-fields">
              
            </div>`;
        // document.querySelector("#selected-user input[type=button]")?.remove();
        if (e.target.checked == true) {
          let _user = await (
            await fetch(`http://localhost:5500/users/${user.id}/`, {
              method: "GET",
              credentials: "include",
            })
          ).json();
          let inputs = [];
          for (let key in _user) {
            let div = new DocElement("div", "", {});
            let input = new DocElement("input", "", {
              value: _user[key],
              placeholder: key,
              id: key,
              name: key,
              type: typeof _user[key] == "boolean" ? "checkbox" : "text",
              checked: _user[key],
              dataType: _user[key]?.constructor.name || null,
              disabled:
                key == "id" ||
                key == "orderIds" ||
                key == "storeID" ||
                ((key == "deleted" || key == "admin" || key == "seller") &&
                  _user.id == "00000000-0000-0000-0000-000000000000"),
            });
            let label = new DocElement("label", key, { for: key });
            inputs.push(input);
            label.appendTo(div);
            input.appendTo(div);
            div.appendTo("#user-fields");
          }
          let submit = new DocElement("input", "", {
            type: "button",
            value: "submit",
          });
          submit.appendTo("#selected-user");
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
            let res = await fetch(`http://localhost:5500/users/${user.id}/`, {
              method: "PUT",
              body: JSON.stringify(obj),
              credentials: "include",
              headers: {
                "Content-Type": "application/json",
              },
            });
            Swal.fire({
              icon: "success",
              title: "User updated successfully",
              showConfirmButton: true,
            });
            updateUsers(page).then(() =>
              document.getElementById(selectedID).click()
            );
          });
        }
        document.querySelectorAll("*").forEach((element) => {
          element.classList.remove("progress");
        });
      });
      // deletedCheck.element.addEventListener("change", async (e) => {
      //   document.querySelectorAll("*").forEach((element) => {
      //     element.classList.add("progress");
      //   });

      //   await (
      //     await fetch(`http://localhost:5500/users/${user.id}/`, {
      //       method: "PUT",
      //       credentials: "include",
      //       headers: {
      //         "Content-Type": "application/json",
      //       },
      //       body: JSON.stringify({ id: user.id, deleted: e.target.checked }),
      //     })
      //   ).json();

      //   updateUsers(page).then(() =>
      //     document.getElementById(selectedID).click()
      //   );
      //   // e.target.checked ? row.addClass("deleted") : row.removeClass("deleted");
      //   document.querySelectorAll("*").forEach((element) => {
      //     element.classList.remove("progress");
      //   });
      // });
      //   actionsCell.appendChild(deleteButton);
    });
  };
  includeDeleted.addEventListener("change", () => {
    page = 1;
    updateUsers(page);
  });
  await updateUsers(page);
  // document
  //   .getElementById("page-controls")
  //   .addEventListener("click", async function (e) {
  //     switch (e.target.id) {
  //       case "previous":
  //         if (page > 1) {
  //           page--;
  //         }
  //         break;
  //       case "next":
  //         page++;
  //         break;
  //       default:
  //         break;
  //     }
  //     await updateUsers(page);
  //   });

  const updateOrders = async (page) => {
    const ordersTable = new DocElement(
      document.getElementById("orders-table-body")
    );
    ordersTable.element.innerHTML = "";
    document.getElementById("page-number").value = page;
    const orders = await (
      await fetch(`http://localhost:5500/orders?page=${page}&limit=5`, {
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
                  `${prod.quantity.toString()} x ${
                    (
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
      const status = new DocElement("select");
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
      status.element.addEventListener("click", async (e) => {
        if (e.target.tagName == "OPTION") {
          document.querySelectorAll("*").forEach((element) => {
            element.classList.add("progress");
          });
          let res = await fetch(`http://localhost:5500/orders/${order.id}/`, {
            method: "PUT",
            body: JSON.stringify({status:e.target.value}),
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          });
          Swal.fire({
            icon: "success",
            title: "Order updated successfully",
            showConfirmButton: true,
          });


          document.querySelectorAll("*").forEach((element) => {
            element.classList.remove("progress");
          });
        }
      });
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
    console.log(products);
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
      updateUsers(page);
    });
});
