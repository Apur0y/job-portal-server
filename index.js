const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
  origin:['http://localhost:5173'],
  credentials:true
}));
app.use(express.json())
app.use(cookieParser())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@thelaststand.sh6jy.mongodb.net/?retryWrites=true&w=majority&appName=thelaststand`;

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
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");



    const jobsCollection = client.db('JobPortal').collection('jobs')  

    //Auth related APIs
    app.post('/jwt', async(req,res)=>{
      const user = req.body;
      const token = jwt.sign(user, process.env.DB_TOKEN , {expiresIn: '1h'})
      res
      .cookie('token', token, {
        httpOnly:true,
        secure:false
      })
      .send({success:true})
    })


    app.get('/alljobs/:id', async(req,res)=>{
        
        const id = req.params.id;
        const job = await jobsCollection.findOne({_id: new ObjectId(id)})
        res.send(job)
    })

    app.get('/alljobs', async(req,res)=>{


        const cursor = jobsCollection.find();
        const result = await cursor.toArray();
        console.log(req.cookies)
        res.send(result)
    })

  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/',(req,res)=>{
    res.send("Job server is running")
})



app.listen(port,()=>{
    console.log(`Port is running:${port}`)
})

