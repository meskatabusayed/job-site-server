const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors({
  origin:['http://localhost:5173'],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fohhaen.mongodb.net/?retryWrites=true&w=majority`;


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


// middleware
const logger = async(req , res , next) => {
  console.log('called:' , req.host , req.originalUrl)
  next();
}

const verifyToken = async(req , res , next) => {
  const token = req.cookies?.token;
  //console.log('Value of token in middleware' , token)
  if(!token){
    return res.status(401).send({message: 'Not Authorized'})
  }
  jwt.verify(token , process.env.ACCESS_TOKEN_SECRET, (err , decoded) => {
    if(err){
      console.log(err);
      return res.status(401).send({message: 'unauthorized'})
    }
    // if token is valid then it would be decoded
    console.log('value in the token' , decoded)
    req.user = decoded;
    next();
  })
  }

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const jobCollection = client.db('jobDB').collection('job');
    const bidCollection = client.db('jobDB').collection('bid');

    // Auth related api
    app.post('/jwt' , logger , async(req , res) => {
      const user = req.body;
      console.log(user);
      const token = jwt.sign(user , process.env.ACCESS_TOKEN_SECRET , {expiresIn: '1h'})
      res
      .cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', 
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        
        })
      .send({success: true});
    }) 


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

  app.put('/jobs/:id' , async(req , res) => {
    const id = req.params.id;
    const filter = {_id: new ObjectId(id)};
    const options = { upsert: true};
    const updatedJob = req.body;
    const upJob = {
      $set: {
        employerEmail: updatedJob.employerEmail,
        category: updatedJob.category,
        jobTitle: updatedJob.jobTitle,
        deadline: updatedJob.deadline,
        description:updatedJob.description,
        minPrice: updatedJob.minPrice,
        maxPrice: updatedJob.maxPrice,
      }
    }

    const result = await jobCollection.updateOne(filter , upJob , options)
    res.send(result)

  })

// job post data
  app.get('/job' , logger , async(req , res) => {
    console.log('Token is' , req.cookies.token)
   
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
      const myEmail = req.query?.email;
      const buyerEmail = req.query?.buyerEmail;
      let query ={};
      if(myEmail){
        query = { email: myEmail }
      } 
      if(buyerEmail){
        query = { buyerEmail: buyerEmail }
      }
      const result = await bidCollection.find(query).toArray();
      res.send(result);
    })

  //   app.get('/bid/:id' , async(req , res) => {
  //     const id = req.params.id;
  //     const query = {_id: new ObjectId(id)};
  //     const result = await jobCollection .findOne(query);
  //     res.send(result);
  // })


    app.patch('/bid/:id' , async(req , res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const updateDoc = req.body
      const option = {upsert: true}
      const updateValuess = {
        $set: updateDoc


      }
      const result = await bidCollection.updateOne(query , updateValuess , option)
      res.send(result)
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