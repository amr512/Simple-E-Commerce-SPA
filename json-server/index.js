import { JSONFilePreset, JSONFileSync, JSONFileSyncPreset } from "lowdb/node";
import e from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { NIL, v4 as newUUID, stringify as UUIDString } from "uuid";
import cookieParser from "cookie-parser";
import fs from "fs";

// #region init
const app = e();
app.use(e.json());
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "http://localhost:5500",
      "http://127.0.0.1:5500",
      "http://localhost:5501",
      "http://127.0.0.1:5501",
    ],
    credentials: true,
  })
);
app.use(cookieParser("superdupersecret"));
app.use(bodyParser.json({ type: "*" }));
const PORT = 5500;
const db = await JSONFilePreset("./db.json", {
  users: [],
  stores: [],
  products: [],
  reviews: [],
  orders: [],
});
await db.read();
const { users, stores, products, reviews, orders } = db.data;
// #endregion

// #region helper functions

const addUser = async (data) => {
  data.id = newUUID();
  if (!users.find((user) => user.email === data.email)) {
    users.push(data);
    await db.write();
    return true;
  } else {
    return false;
  }
};

const addStore = async (data) => {
  data.id = newUUID();
  if (
    !(
      stores.find((store) => store.name === data.name) ||
      stores.find((store) => store.ownerID === data.ownerID)
    ) &&
    users.find((user) => user.id === data.ownerID)
  ) {
    stores.push(data);
    users[users.findIndex((user) => user.id === data.ownerID)].storeID =
      data.id;
    await db.write();
    return true;
  } else {
    return false;
  }
};

Object.prototype.removeEmpty = function () {
  return Object.fromEntries(
    Object.entries(this).filter(
      ([_, b]) => b !== null && b !== "" && b !== undefined
    )
  ); //.filter(([_, v]) => v != null));
};

// #endregion

// #region express routes

// #region get routes
app.get("/images/:name", (req, res) => {
  try {
    const img = fs.readFileSync(`./images/${req.params.name}`);
    res.send(img);
  } catch {
    const img = fs.readFileSync(`./images/notfound.png`);
    res.status(404).send(img);
  }
});
app.get("/users/:id", (req, res) => {
  const user = users.find((user) => user.id === req.params.id);
  if (
    req.signedCookies["user"] != NIL &&
    req.signedCookies["user"] != req.params.id
  ) {
    res.status(200).send({name:user.name});
    return;
  }
  if (user?.deleted && req.signedCookies["user"] != NIL) {
    res.status(401).send({ error: "Unauthorized" });
    return;
  }
  res.status(200).send(user);
});
app.get("/users/", (req, res) => {
  if (req.signedCookies["user"] != NIL) {
    res.status(401).send({ error: "Unauthorized" });
    return;
  }

  const includeDeleted = req.query.includeDeleted
    ? req.query.includeDeleted === "true"
    : false;
  const filteredUsers = includeDeleted
    ? users
    : users.filter((user) => !user?.deleted);

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 100;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);
  if (paginatedUsers.length == 0) {
    res.status(404).send({ error: `page ${page} is out of range` });
    return;
  }
  res.status(200).send(paginatedUsers);
});

app.get("/products/:id", (req, res) => {
  const product = products.find((product) => product.id === req.params.id);
  res.status(200).send(product);
});
app.get("/stores/:id", (req, res) => {
  const store = stores.find((store) => store.id === req.params.id);
  
  res.status(200).send(store);
});
app.get("/products/", (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 100;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const paginatedProducts = products.slice(startIndex, endIndex);
  if (paginatedProducts.length == 0) {
    res.status(404).send({ error: `page ${page} is out of range` });
    return;
  }
  res.status(200).send(paginatedProducts);
});
app.get("/reviews/:id", (req, res) => {
  const review = reviews.find((review) => review.id === req.params.id);
  res.status(200).send(review);
});

app.get("/orders/", (req, res) => {
  if (req.signedCookies["user"] != NIL) {
    res.status(401).send({ error: "Unauthorized" });
    return;
  }
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 100;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const paginatedOrders = orders.slice(startIndex, endIndex);
  if (paginatedOrders.length == 0) {
    res.status(404).send({ error: `page ${page} is out of range` });
    return;
  }
  res.status(200).send(paginatedOrders);
});
app.get("/orders/:id", (req, res) => {
  const order = orders.find((order) => order.id === req.params.id);
  if (
    req.signedCookies["user"] != NIL &&
    req.signedCookies["user"] != order.userID
  ) {
    res.status(401).send({ error: "Unauthorized" });
    return;
  }
  res.status(200).send(order);
});
app.get("/store/orders/:storeid", (req, res) => {
  // console.log(req.params.storeid)
  const _order = [...orders.filter((order) =>
    order.products = order.products.filter((product) => product.storeID == req.params.storeid))]
    // .map(
    //   order=> (order
    // )
    
  
  // console.log(req.signedCookies["user"])
  // console.log(stores.find((store) => store.id == req.params.storeid));
  
  if (
    req.signedCookies["user"] != NIL &&
    req.signedCookies["user"] != stores.find((store) => store.id == req.params.storeid).ownerID
  ) {
    res.status(401).send({ error: "Unauthorized" });
    return;
  }
  res.status(200).send(_order);
});


// #endregion
// #region post routes
app.post("/users/auth", async (req, res) => {
  // console.log(req.headers["content-type"]);
  // console.log(req.signedCookies["user"])
  // console.log(await req.body);
  // console.log(req.body)
  const user = {
    ...users.find(
      (user) =>
        user.email === req.body.email && user.password === req.body.password
    ),
  };
  console.log(user)
  user.password = undefined;
  if (user) {
    res
      .cookie("user", user.id, {
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        signed: true,
        sameSite: "none",
        secure: true,
        httpOnly: false,
      })
      .status(200)
      .send(user);
  } else {
    res.status(401).send({ message: "wrong email or password" });
  }
});

app.post("/users/logout", async (req, res) => {
  res
    .cookie("user", "", {
      signed: true,
      sameSite: "none",
      secure: true,
      httpOnly: false,
    })
    .status(200)
    .send({ message: "logged out successfully" });
});

//#endregion
//#region put routes
app.put("/users/:id", async (req, res) => {
  // console.log(req.body)
  if (
    req.signedCookies["user"] == req.params.id ||
    req.signedCookies["user"] == NIL
  ) {
    const user = users.find((user) => user.id === req.params.id);
    if (user) {
      const data = req.body.removeEmpty();
      console.log(data);
      for (let key in data) {
        user[key] = data[key];
      }
      await db.write();
      res.status(200).send(user);
    }
  } else {
    res.status(401).send({ message: "Unauthorized" });
  }
});
app.put("/users/password/:id", async (req, res) => {
  const user = users.find((user) => user.id === req.signedCookies["user"]);
  if (user && user.password === req.body.oldPassword) {
    user.password = req.body.password;
    await db.write();
    res.status(200).send(user);
  } else {
    res.status(401).send({ message: "incorrect old password" });
  }
});
app.put("/products/:id", async (req, res) => {
  const product = products.find((product) => product.id === req.params.id);
  console.log(product)
  console.log(req.body)
  if (product) {
    const data = req.body.removeEmpty();
    for (let key in data) {
      product[key] = data[key];
    }
    await db.write();
    res.status(200).send(product);
  } else {
    res.status(404).send({ message: "product not found" });
  }
});
app.put("/stores/:id", async (req, res) => {
  const store = stores.find((store) => store.id === req.params.id);
  if (
    req.signedCookies["user"] != NIL &&
    req.signedCookies["user"] != store.ownerID
  ) {
    res.status(401).send({ message: "Unauthorized" });
    return;
  }
  if (store) {
    const data = req.body.removeEmpty();
    for (let key in data) {
      store[key] = data[key];
    }
    await db.write();
    res.status(200).send(store);
  } else {
    res.status(404).send({ message: "store not found" });
  }
});
app.put("/reviews/:id", async (req, res) => {
  const review = reviews.find((review) => review.id === req.params.id);
  if (review) {
    const data = req.body.removeEmpty();
    for (let key in data) {
      review[key] = data[key];
    }
    await db.write();
    res.status(200).send(review);
  } else {
    res.status(404).send({ message: "review not found" });
  }
});
app.put("/orders/:id", async (req, res) => {
  const order = orders.find((order) => order.id === req.params.id);
  // if (
  //   req.signedCookies["user"] != NIL &&
  //   req.signedCookies["user"] != order.userID
  // ) {
  //   res.status(401).send({ message: "Unauthorized" });
  //   return;
  // }
  if (order) {
    const data = req.body.removeEmpty();
    for (let key in data) {
      order[key] = data[key];
    }
    await db.write();
    res.status(200).send(order);
  }
  // } else {
  //   res.status(404).send({ message: "order not found" });
  // }
});

//#endregion
//#region delete routes
//#endregion
// #endregion express routes

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
