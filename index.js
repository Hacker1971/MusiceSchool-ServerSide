const express = require("express");
const app = express();
const morgan = require("morgan");
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fr7a0ud.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    const usersCollection = client.db("musices").collection("users");
    const cardCollection = client.db("musices").collection("addCard");
    const usersTeacher = client.db("musices").collection("teacher");
    const usersClass = client.db("musices").collection("classes");
    const payCollection = client.db("musices").collection("pay");
    const InstructorClass = client.db("musices").collection("addClass");
    //usersCollection
    // users related apis
    app.get("/users", async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    });
    app.post("/users", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const existingUser = await usersCollection.findOne(query);

      if (existingUser) {
        return res.send({ message: "user already exists" });
      }

      const result = await usersCollection.insertOne(user);
      res.send(result);
    });
    //admin instructor
   //http://localhost:5000/users/instructor/Juliana.Silva@example.com
    app.get('/users/instructor/:email',  async (req, res) => {
      const email = req.params.email;
      const query = { email: email }
      const user = await usersCollection.findOne(query);
      const result = { instructor: user?.role === 'instructor' }
      res.send(result);
    })
    app.patch("/users/update/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          role: "instructor",
        },
      };


      const result = await usersCollection.updateOne(filter, updateDoc);
      res.send(result);
    });
    //student dashboard
    // ​http://localhost:5000/student?email=tanvir@gmail.com
    app.get("/student", async (req, res) => {
      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email };
      }
      const result = await cardCollection.find(query).toArray();
      res.send(result);
    });
    app.get("/enroll", async (req, res) => {
      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email };
      }
      const result = await payCollection.find(query).toArray();
      res.send(result);
    });
    app.post("/student/pay", async (req, res) => {
      const booking = req.body;
      const result = await payCollection.insertOne(booking);
      res.send(result);
    });

    app.delete("/student/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await cardCollection.deleteOne(query);
      res.send(result);
    });

    //Instructor Dashboard
    // ​http://localhost:5000/myClass?email=tanvir@gmail.com
    app.get("/myClass", async (req, res) => {
      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email };
      }
      const result = await usersClass.find(query).toArray();
      res.send(result);
    });
    app.post("/addClass", async (req, res) => {
      const booking = req.body;
      const result = await usersClass.insertOne(booking);
      res.send(result);
    });

    //addCard
    app.post("/card", async (req, res) => {
      const user = req.body;
      // const query = { email: user.email, _id: { $ne: user.menuItemId } };
      // const existingUser = await cardCollection.findOne(query);

      // if (existingUser) {
      //   return res.send({ message: "card already exists" });
      // }

      const result = await cardCollection.insertOne(user);
      res.send(result);
    });
    //usersTeacher
    // ​http://localhost:5000/teacher?email=john.doe@example.com
    app.get("/teacher", async (req, res) => {
      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email };
      }
      const result = await usersClass.find(query).toArray();
      res.send(result);
    });
    // app.get("/teacher", async (req, res) => {
    //   const result = await usersTeacher.find().toArray();
    //   res.send(result);
    // });
    //usersClass
    app.get("/class", async (req, res) => {
      const result = await usersClass.find().toArray();
      res.send(result);
    });
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
