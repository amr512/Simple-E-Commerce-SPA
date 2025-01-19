import { createNavbar, createTable } from "./components.js";
import { DocElement, requests, successAlert, removeEmpty } from "./helpers.js";

window.addEventListener("load", async () => {
  const navbar = createNavbar("admin");
  document.body.prepend(navbar.element);
  const currentuser = await (
    await requests.GET(
      `http://localhost:5500/users/${
        JSON.parse(localStorage.getItem("currentuser")).id
      }`
    )
  ).json();
  const store = await(
    await requests.GET(`http://localhost:5500/stores/${currentuser.storeID}`)
  ).json();
  if (!currentuser.seller) window.location.assign("user.html");
  new DocElement("#greeting").text(`Hello, ${currentuser.name}!`);
  new DocElement("#email").text(currentuser.email);
  new DocElement("#store").text(
    store.name
  );
  const includeDeleted = false
  let selectedID;
  let page = 1;
  let currentTab = "users";

  const tabs = [new DocElement("#products"), new DocElement("#orders")];

  // const createProduct = async (id) => {
    const form = new DocElement("#new");
    const submit = new DocElement("#submit-new");
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formdata =Object.fromEntries(new FormData(e.target))
      const data =  {
        "id": "",
        "storeID": store.id,
        "name": formdata.name,
        "description": formdata.description,
        "price": formdata.price,
        "deleted": false,
        "categories": formdata.categories.split(","),
        "images": formdata.images.split(",").map(e=>e.replace(/\"/gm,"")),
        "stock": formdata.stock,
        "approved": false
      }
      let res = await requests.POST("http://localhost:5500/products/new" ,data)
      if(res.status == 200){
        await successAlert("Product created successfully")
        form.element.reset()
      }else{
         errorAlert("Failed to create product")
    
      }
      // inputs.forEach((e) => {
      //   switch (e.element.dataType) {
      //     case "Boolean":
      //       data[e.element.name] = Boolean(e.element.checked);
      //       break;
      //     case "String":
      //       data[e.element.name] = e.element.value;
      //       break;
      //     case "Number":
      //       data[e.element.name] = Number(e.element.value);
      //       break;
      //     case null:
      //       data[e.element.name] =
      //         e.element.value === "" ? null : e.element.value;
      //       break;
      //     default:
      //       try {
      //         data[e.element.name] = JSON.parse(e.element.value) || null;
      //       } catch {}
      //       break;
      //   }
      // });
      // console.log(data);
      // console.log(removeEmpty(data));
      // if (
      //   (
      //     await requests.PUT(
      //       `http://localhost:5500/${currentTab}/${data.id}`,
      //       data
      //     )
      //   ).status == 200
      // ) {
      //   successAlert("Data updated successfully").then((e) =>
      //     updateContent(currentTab, page).then((e) => {
      //       let el = new DocElement(`.id${data.id}`);
      //       el.element.click();
      //       setTimeout(
      //         (e) => el.element.scrollIntoView({ behavior: "smooth" }),
      //         200
      //       );
      //     })
      //   );
      // } else {
      //   successAlert("Failed to update data");
      // }
    });
  // };
  const selectToEdit = async (id) => {
    const obj = await (
      await requests.GET(`http://localhost:5500/${currentTab}/${id}`)
    ).json();
    const fields = new DocElement("#fields");
    try {
      new DocElement("#submit").element.remove();
    } catch {}
    Array.from(fields.element.children).forEach((child) => child.remove());
    let inputs = [];
    for (let key in obj) {
      let div = new DocElement("div", "", {});
      let input = new DocElement("input", "", {
        value:
          typeof obj[key] == "object" ? JSON.stringify(obj[key]) : obj[key],
        placeholder: key,
        id: key,
        name: key,
        type: typeof obj[key] == "boolean" ? "checkbox" : "text",
        checked: obj[key],
        dataType: obj[key]?.constructor.name || null,
        disabled: ["id","ownerID","orderIDs","storeID","userID"].includes(key),
      });
      let label = new DocElement("label", key, { for: key });
      inputs.push(input);
      label.appendTo(div);
      input.appendTo(div);
      fields.append(div);
    }
    let submit = new DocElement("input", "", {
      id: "submit",
      type: "button",
      value: "submit",
    });
    submit.appendTo("#selected");
    submit.addEventListener("click", async(e) => {
      const data = {};
      inputs.forEach((e) => {
        switch (e.element.dataType) {
          case "Boolean":
            data[e.element.name] = Boolean(e.element.checked);
            break;
          case "String":
            data[e.element.name] = e.element.value;
            break;
          case "Number":
            data[e.element.name] = Number(e.element.value);
            break;
          case null:
            data[e.element.name] =
              e.element.value === "" ? null : e.element.value;
            break;
          default:
            try {
              data[e.element.name] = JSON.parse(e.element.value) || null;
            } catch {}
            break;
        }
      });
      console.log(data)
      console.log(removeEmpty(data))
      if((await requests.PUT(`http://localhost:5500/${currentTab}/${data.id}`,data)).status == 200){
        successAlert("Data updated successfully")
        .then(e=>updateContent(currentTab,page).then(e=>{
          let el = new DocElement(`.id${data.id}`)
          el.element.click()
          setTimeout(e=>el.element.scrollIntoView({behavior:"smooth"}),200)
        }))
      }else{
        successAlert("Failed to update data")
      }
    });
  };
  const updateContent = async (content, page) => {
    const tableContainer = new DocElement("#table-container");
    const fields = new DocElement("#fields");
    Array.from(tableContainer.element.children).forEach((child) =>
      child.remove()
    );
    Array.from(fields.element.children).forEach((child) => child.remove());
    new DocElement("#page-number").element.value = page;
    const response = await (
      await requests.GET(
        `http://localhost:5500/${content}?page=${page}&limit=5&includeDeleted=${includeDeleted}&store=${store.id}`
      )
    ).json();
    let table = createTable(response);
    let tableChildren = Array.from(table.element.children);

    table.appendTo("#table-container");
    tableChildren.forEach((child, i) => {
      if (i == 0) return;
      child.addEventListener("click", (e) => {
        tableChildren.forEach((child) => {
          child.classList.remove("active");
        });
        e.currentTarget.classList.add("active");
        selectToEdit(e.currentTarget.id);
      });
    });
  };

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.removeClass("active"));
      tab.addClass("active");
      tab.element.id == "products"?
      new DocElement("#new").removeClass("hidden"):
      new DocElement("#new").addClass("hidden")
      try{
        new DocElement("#submit").element.remove()
      }catch{}
      selectedID = undefined;
      page = 1;
      currentTab = tab.element.id;
      updateContent(currentTab, page);
    });
  });
  tabs[0].element.click();

  const pageControls = new DocElement("#page-controls");
  pageControls.addEventListener("click", (e) => {
    switch (e.target.id) {
      case "previous":
        if (page > 1) {
          updateContent(currentTab, --page);
        }
        break;
      case "next":
        updateContent(currentTab, ++page);
        break;
      case "goto":
        page = new DocElement("#page-number").element.value;
        updateContent(currentTab, page);
        break;
      default:
        break;
    }
  });
});
