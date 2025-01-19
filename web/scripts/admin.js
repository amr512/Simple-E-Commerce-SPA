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
  if (
    currentuser.id == undefined &&
    currentuser.id != "00000000-0000-0000-0000-000000000000"
  )
    window.location.assign("login.html");
  new DocElement("#greeting").text(`Hello, ${currentuser.name}!`);
  new DocElement("#email").text(currentuser.email);
  const includeDeleted = new DocElement("#includeDeleted");
  let selectedID;
  let page = 1;
  let currentTab = "users";

  const tabs = [
    new DocElement("#users"),
    new DocElement("#stores"),
    new DocElement("#products"),
    new DocElement("#orders"),
  ];

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
        `http://localhost:5500/${content}?page=${page}&limit=5&includeDeleted=${includeDeleted.element.checked}`
      )
    ).json();
    let table = createTable(response);
    let tableChildren = Array.from(table.element.children);

    table.appendTo("#table-container");
    tableChildren.forEach((child,i) => {
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
  includeDeleted.addEventListener("change", () => {
    page = 1;
    updateContent(currentTab, page);
  });

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.removeClass("active"));
      tab.addClass("active");
      selectedID = undefined;
      try{
        new DocElement("#submit").element.remove()
      }catch{}
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
