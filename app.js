const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const MongoClient = require("mongodb").MongoClient;
const router = express.Router();
const port = process.env.PORT || 5000;

const url = require("./secret");
const json = require("body-parser");
const { CommandStartedEvent, ObjectId } = require("mongodb");

app.use(bodyParser.json());
const client = new MongoClient(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
client.connect().then(() => {
  const myDatabase = client.db("registration").collection("user");
  console.log("connected successfully");

  // for finding the match of element with the database using the different routes
  // setting the route outside of the main route
  app.get("/user/:user", (req, res) => {
    console.log(req.params);
    myDatabase
      .find(req.params)
      .toArray()
      .then((results) => {
        console.log(results);
        res.contentType("application/json");
        res.send(JSON.stringify(results));
      });
  });

  // simple route to get , post , put and delete
  app
    .route("/users")
    .get((req, res) => {
      myDatabase
        .find()
        .toArray()
        .then((result) => {
          console.log(result);
          res.contentType("application/json");
          res.send(JSON.stringify(result));
        });
    })
    .post((req, res) => {
      console.log(req.body);
      myDatabase.insertOne(req.body).then((result) => {
        console.log(result);
        res.contentType("application/json");
        res.send(JSON.stringify(result));
      });
    })
    .put((req, res) => {
      console.log(req.body);
      myDatabase
        .findOneAndUpdate(
          { _id: new ObjectId(req.body._id) },
          {
            $set: {
              user: req.body.user,
              support: req.body.support,
              email: req.body.email,
            },
          },
          // {
          //   // there is one problem email is not updating
          //   $set: { email: req.body.email },
          // },
          {
            upsert: false,
          }
        )
        .then((result) => {
          res.contentType("application/json");
          res.send({ status: true });
        });
    })
    .delete((req, res) => {
      console.log(req.body);
      myDatabase
        .deleteOne({ _id: new ObjectId(req.body._id) })
        .then((result) => {
          let boo = true;
          if (result.deletedCount === 0) {
            boo: false;
          }
          res.send({ status: boo });
        })
        .catch((error) => {
          console.log(error);
        });
    });
});

app.get("/", (req, res) => {
  //   res.send("Hello World");
  res.sendFile(__dirname + "/public/index.html");
});

app.listen(port, () => {
  console.log(`server ready`);
});
