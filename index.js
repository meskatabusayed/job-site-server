const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fohhaen.mongodb.net/?retryWrites=true&w=majority`;


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const jobCollection = client.db('jobDB').collection('job');
    const bidCollection = client.db('jobDB').collection('bid');

    


    app.get('/job/:category' , async(req , res) => {
        const category = req.params.category;
        const query = {category : category};
        const cursor = jobCollection.find(query);
        const result = await cursor.toArray();
        res.send(result);
    })


    app.get('/jobs/:id' , async(req , res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await jobCollection .findOne(query);
      res.send(result);
  })

// job post data
  app.get('/job' , async(req , res) => {
    let query ={};
    if(req.query?.employerEmail){
      query = { employerEmail: req.query.employerEmail}
    } 
    const result = await jobCollection.find(query).toArray();
    res.send(result);
    
  })

  

  app.delete('/job/:id' , async(req , res) => {
    const id = req.params.id;
    const query = {_id: new ObjectId(id)}
    const result = await jobCollection.deleteOne(query)
    res.send(result);
  })




    app.post('/job' , async(req , res) => {
        const newJob = req.body;
        console.log(newJob);
        const result = await jobCollection.insertOne(newJob);
        res.send(result);
    })


    // Bids

    app.get('/bid' , async(req , res) => {
      
      let query ={};
      if(req.query?.email){
        query = { email: req.query.email }
      } 
      const result = await bidCollection.find(query).toArray();
      res.send(result);
    })

    app.post('/bid' , async(req , res) => {
      const newBid = req.body;
      console.log(newBid);
      const result = await bidCollection.insertOne(newBid);
      res.send(result);
    })







    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);





app.get('/' , (req , res) => {
    res.send('Assignment 11 is running')
})

app.listen(port , () => {
    console.log(`Assignment 11 is running on port: ${port}`)
})