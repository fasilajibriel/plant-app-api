const {Client} = require("pg");
const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

const client = new Client({
    "user": "waqufrcs",
    "password": "WEhbPBRe7G33dNrFxH_Fy4xPK82_vo-p",
    "host": "drona.db.elephantsql.com",
    "port": 5432,
    "database": "waqufrcs"
});


app.get("/", (req, res) => res.sendFile(`${__dirname}/index.html`));

// Users
app.post("/users/get", async (req, res) => {
    let result = [];
    try {
        if (req.body.phone === undefined && req.body.password === undefined) {
            let queryResult = await getUser();
            result.push(queryResult);
        } else {
            const reqJson = req.body;
            let queryResult = await authUser(reqJson.phone, reqJson.password);
            result.push(queryResult);
        }
    } catch (e) {
        result.push({success: false});
        console.log(result)
    } finally {
        res.setHeader("content-type", "application/json");
        res.send(JSON.stringify(result))
    }
});
async function authUser(phone, password) {
    try {
        const results = await client.query("SELECT * FROM users WHERE phone_number = $1 and password = $2", [phone, password]);
        return results.rows[0];
    } catch (e) {
        return [];
    }
}
async function getUser() {
    try {
        const results = await client.query("SELECT * FROM users");
        return results.rows[0];
    } catch (e) {
        return [];
    }
}

app.post("/users/create", async (req, res) => {
    let result = [];
    try {
        const reqJson = req.body;
        let queryResult = await addUser(reqJson.firstName, reqJson.lastName, reqJson.email, reqJson.phoneNumber, reqJson.password);
        result.push(queryResult);
    } catch (e) {
        result.push({success: false});
    } finally {
        res.setHeader("content-type", "application/json");
        res.send(JSON.stringify(result))
    }
});
async function addUser(firstName, lastName, email, phone, password) {
    try {
        const results = await client.query("INSERT INTO users(first_name, last_name, email, \"phone_number\", password, \"role\") VALUES($1, $2, $3, $4, $5, 'user')", [firstName, lastName, email, phone, password]);
        return results.rows[0];
    } catch (e) {
        return [];
    }
}

// Product
app.post("/products/get", async (req, res) => {
    let result = [];
    try {
        let queryResult = await getProducts();
        result.push(queryResult);
    } catch (e) {
        result.push({success: false});
        console.log(result)
    } finally {
        res.setHeader("content-type", "application/json");
        res.send(JSON.stringify(result))
    }
});
async function getProducts() {
    try {
        const results = await client.query("SELECT * FROM products");
        return results.rows;
    } catch (e) {
        return [];
    }
}

app.post("/products/create", async (req, res) => {
    let result = [];
    try {
        const reqJson = req.body;
        let queryResult = await addProduct(reqJson.name, reqJson.quantity, reqJson.price, reqJson.imgLink);
        result.push(queryResult);
    } catch (e) {
        result.push({success: false});
    } finally {
        res.setHeader("content-type", "application/json");
        res.send(JSON.stringify(result))
    }
});
async function addProduct(name, quantity, price, imgLink) {
    try {
        const results = await client.query("INSERT INTO products(\"name\", price, image, quantity) VALUES($1, $2, $3, $4)", [name, price, imgLink, quantity]);
        console.log(results);
        return results.rows[0];
    } catch (e) {
        return [];
    }
}

// Requests
app.post("/requests/get", async (req, res) => {
    let result = [];
    try {
        if (req.body.id === undefined) {
            let queryResult = await allRequest();
            result.push(queryResult);
        } else {
            const reqJson = req.body;
            let queryResult = await userRequest(reqJson.id);
            result.push(queryResult);
        }
    } catch (e) {
        result.push({success: false});
        console.log(result)
    } finally {
        res.setHeader("content-type", "application/json");
        res.send(JSON.stringify(result))
    }
});
async function userRequest(id) {
    try {
        const results = await client.query("SELECT * FROM requests r INNER JOIN users u ON u.id = r.user_id WHERE r.user_id = $1;", [id]);
        return results.rows;
    } catch (e) {
        return [];
    }
}
async function allRequest() {
    try {
        const results = await client.query("SELECT * FROM requests r INNER JOIN users u ON u.id = r.user_id;");
        return results.rows;
    } catch (e) {
        return [];
    }
}

app.post("/requests/create", async (req, res) => {
    let result = [];
    try {
        const reqJson = req.body;
        let queryResult = await addRequest(reqJson.id, reqJson.content);
        result.push(queryResult);
    } catch (e) {
        result.push({success: false});
    } finally {
        res.setHeader("content-type", "application/json");
        res.send(JSON.stringify(result))
    }
});
async function addRequest(id, content) {
    try {
        const results = await client.query("INSERT INTO requests(user_id, content) VALUES($1, $2)", [id, content]);
        console.log(results);
        return results.rows[0];
    } catch (e) {
        return [];
    }
}

// Order
app.post("/cart/create", async (req, res) => {
    let result = [];
    try {
        const reqJson = req.body;
        let queryResult = await addToCart(reqJson.user_id, reqJson.product_id);
        result.push(queryResult);
    } catch (e) {
        result.push({success: false});
    } finally {
        res.setHeader("content-type", "application/json");
        res.send(JSON.stringify(result))
    }
});
async function addToCart(user_id, product_id) {
    try {
        const results = await client.query("INSERT INTO cart(user_id, product_id) VALUES($1, $2)", [user_id, product_id]);
        console.log(results);
        return results.rows[0];
    } catch (e) {
        return [];
    }
}

// app.listen(8080, () => console.log("Web server is listening.. on port 8080"));
app.listen(process.env.PORT || 5000);

start();

async function start() {
    await connect();
}

async function connect() {
    try {
        await client.connect();
    } catch (e) {
        console.error(`Failed to connect ${e}`)
    }
}
