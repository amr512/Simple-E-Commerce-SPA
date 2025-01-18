import { JSONFilePreset } from "lowdb/node";
import e from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { NIL, v4 as newUUID } from "uuid";
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

// await db.write()
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

const addStore = async (data, user, res) => {
  const store = {
    id: newUUID(),
    ownerID: data.user,
    name: data.name,
    approved:false
  };

  const storeExists = stores.find((_store) => _store.ownerID === store.ownerID);
  if (storeExists?.name === store.name) {
    res.status(400).send({ message: "store already exists" });
    return false;
  }
  if (storeExists || user.storeID) {
    res.status(400).send({ message: "user already has a store" });
    return false;
  }
  if (!user) {
    res.status(400).send({ message: "user does not exist" });
    return false;
  }
  stores.push(store);
  user.storeID = store.id;
  user.seller = true
  await db.write();
  return store
};

const checkAuthorized = (req) => {
  console.log(req.signedCookies["user"]);
  if (users.find((user) => user.id == req.signedCookies["user"]).admin)
    return true;
  if (req.signedCookies["user"] && req.signedCookies["user"] === req.params?.id)
    return true;
  return false;
};

const requireOwner = (req) => {
  if (req.signedCookies["user"] === NIL) return true;
  return false;
};

const unauthorizedError = (res) =>
  res.status(401).send({ error: "Unauthorized" });

const removeDeleted = (arr) => {
  return arr.filter((item) => !item.deleted);
};
const removeUnapproved = (arr) => {
  return arr.filter((item) => item.approved);
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
  // const authorized = checkAuthorized(req);
  // if (!authorized) {
  //   unauthorizedError(res);
  //   return;
  // }
  res.status(200).send(user);
});
app.get("/users/", (req, res) => {
  if (!checkAuthorized(req)) {
    unauthorizedError(res);
    return;
  }

  const includeDeleted = req.query.includeDeleted
    ? req.query.includeDeleted === "true"
    : //set to false if unset or false
      false;
  const filteredUsers = includeDeleted ? users : removeDeleted(users);

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

app.get("/stores/", (req, res) => {
  const includeDeleted = req.query.includeDeleted
    ? req.query.includeDeleted === "true"
    : false;
  const filteredStores = includeDeleted ? stores : removeUnapproved(stores);

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 100;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const paginatedStores = filteredStores.slice(startIndex, endIndex);
  if (paginatedStores.length == 0) {
    res.status(404).send({ error: `page ${page} is out of range` });
    return;
  }
  res.status(200).send(paginatedStores);
});

app.get("/products/", (req, res) => {
  const includeDeleted = req.query.includeDeleted
    ? req.query.includeDeleted === "true"
    : //set to false if unset or false
      false;
  const fliteredProducts = includeDeleted
    ? products
    : removeDeleted(removeUnapproved(products));
  console.log(fliteredProducts);
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 100;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const paginatedProducts = fliteredProducts.slice(startIndex, endIndex);
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
  res.status(200).send(order);
});
app.get("/store/orders/:storeid", (req, res) => {
  // console.log(req.params.storeid)
  const _order = [
    ...orders.filter(
      (order) =>
        (order.products = order.products.filter(
          (product) => product.storeID == req.params.storeid
        ))
    ),
  ];
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
  if (user.deleted) {
    res.status(401).send({ message: "Account deleted/suspended" });
    return;
  }

  if (Object.keys(user).length > 0) {
    user.password = undefined;
    res
      .cookie("user", user.id, {
        expires: new Date(Date.now() + 24 * 60 * 60 * 100000),
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

app.post("/users/create-store/", async (req, res) => {
  const data = req.body;
  console.log(data);
  const user = users.find((user) => user.id === req.signedCookies["user"]);
  if (user) {
    let store = await addStore(data, user, res);
    res.status(200).send(store)
  } else {
    res.status(401).send({ message: "Unauthorized" });
  }
});

//#endregion
//#region put routes
app.put("/users/:id", async (req, res) => {
  // console.log(req.body)
  const user = users.find((user) => user.id === req.params.id);
  if (user) {
    const data = req.body; //.removeEmpty();
    if (user.admin != data.admin && !requireOwner(req)) {
      unauthorizedError(res);
      return;
    }
    console.log(data);
    for (let key in data) {
      user[key] = data[key] == "null" ? null : data[key];
    }
    await db.write();
    res.status(200).send(user);
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
  if (product) {
    const data = req.body; //.removeEmpty();
    for (let key in data) {
      product[key] = data[key] == "null" ? null : data[key];
    }
    await db.write();
    res.status(200).send(product);
  } else {
    res.status(404).send({ message: "product not found" });
  }
});
app.put("/stores/:id", async (req, res) => {
  const store = stores.find((store) => store.id === req.params.id);
  if (store) {
    const data = req.body; //.removeEmpty();
    for (let key in data) {
      store[key] = data[key] == "null" ? null : data[key];
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
    const data = req.body; //.removeEmpty();
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
  if (order) {
    const data = req.body;
    for (let key in data) {
      order[key] = data[key] == "null" ? null : data[key];
    }
    await db.write();
    res.status(200).send(order);
  }
});

//#endregion
//#region delete routes

//#endregion
// #endregion express routes

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
