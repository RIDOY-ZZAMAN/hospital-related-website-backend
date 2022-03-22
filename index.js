const express = require('express');
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();
const app = express();
app.use(cors());
app.use(express.json());
const port = process.env.PORT || 5000;


const { MongoClient } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.r53mt.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
async function run() {
    try {
        await client.connect();
        const database = client.db("hospital");
        const servicesCollection = database.collection("services");
        const doctorsCollection = database.collection("doctors");
        const reviewsCollection = database.collection("reviews");
        const usersCollection = database.collection("users");
        const pendingReviewsCollection = database.collection("pendingReviews");

        console.log("Database connected");

        //GET API
        app.get('/', (req, res) => {
            res.send("Hello from the Hospital Assignment");

        })

        //GETTING SERVICES 
        app.get('/services', async (req, res) => {
            const cursor = servicesCollection.find({});
            const page = req.query.page;
            const size = parseInt(req.query.size);
            let services;
            const count = await cursor.count();
            if (page) {
                services = await cursor.skip(page * size).limit(size).toArray();

            }
            else {
                services = await cursor.toArray();
            }
            res.send({
                count,
                services,
            });
        })

        //GET SPECIFIC DATA USING ID
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const service = await servicesCollection.findOne(query);
            res.send(service);
        })

        //GETTING DOCTORS

        app.get('/doctors', async (req, res) => {
            const cursor = doctorsCollection.find({});
            const page = req.query.page;
            const size = parseInt(req.query.size);
            let doctors;
            const count = await cursor.count();
            if (page) {
                doctors = await cursor.skip(page * size).limit(size).toArray();

            }
            else {
                doctors = await cursor.toArray();
            }
            res.send({
                count,
                doctors,
            });
        })

        // GETTING REVIEW
        app.get("/reviews", async (req, res) => {
            const cursor = reviewsCollection.find({});
            const result = await cursor.toArray(cursor);
            res.send(result);


        })


        //POST METHOD FOR CREATING USER
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.json(result)

        })

        //Checking Admin

        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;

            }
            res.json({ admin: isAdmin })

        })

        //POST METHOD FOR CREATING REVIEW
        app.post('/reviews', async (req, res) => {
            const review = req.body;
            const result = await reviewsCollection.insertOne(review);
            res.json(result)

        })

        //POST METHOD FOR CREATING REVIEW
        app.post('/pendingreviews', async (req, res) => {
            const review = req.body;
            const result = await pendingReviewsCollection.insertOne(review);
            res.json(result)

        })
        //GETTING PENDING REVIEWS
        app.get("/pendingreviews", async (req, res) => {
            const cursor = pendingReviewsCollection.find({});
            const result = await cursor.toArray(cursor);
            res.send(result)

        })

        //DELETE A PENDING REVIEW
        app.delete('/pendingreviews/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await pendingReviewsCollection.deleteOne(query);
            res.send(result);


        })










    } finally {
        // await client.close();
    }
}
run().catch(console.dir);




app.listen(port, () => {
    console.log("Listening to port", port)
})