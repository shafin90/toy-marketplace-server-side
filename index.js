const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());


console.log(process.env.MY_PASS)

const uri = `mongodb+srv://mashrafiahnam:IOwrG4DoOlIGCD3G@cluster0.yhuz2xd.mongodb.net/?retryWrites=true&w=majority`;

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
    // await client.connect();
    


    const array = [];
    const userCollection = client.db("Carz").collection('collections');

    app.get('/mytoys',async (req,res)=>{
      res.send(array);
    })

    app.get('/users', async( req, res) => {
        const cursor = userCollection.find()
        const result = await cursor.toArray();
        res.send(result);
    })

    app.get('/users/:id', async(req, res) => {
        const id = req.params.id;
        const query = {_id: new ObjectId(id)}
        const user = await userCollection.findOne(query);
        res.send(user);
    })

    app.post('/users', async(req, res) => {
        const user = req.body;
        console.log('new user', user);
        const result = await userCollection.insertOne(user);
        array.push(user);
        res.send(result);
    });

    app.put('/users/:id', async(req, res) =>{
        const id = req.params.id;
        const user = req.body;
        console.log(id, user);
        
        const filter = {_id: new ObjectId(id)}
        const options = {upsert: true}
        const updatedUser = {
            $set: {
                name: user.name,
                email: user.email
            }
        }

        const result = await userCollection.updateOne(filter, updatedUser, options );
        res.send(result);

    })

    app.delete('/users/:id', async(req, res) =>{
        const id = req.params.id;
        console.log('please delete from database', id);
        const query = { _id: new ObjectId(id)}
        
        const result = await userCollection.deleteOne(query);
        res.send(result);
    })


    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
  
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/hi', (req, res) =>{
    res.send('SIMPLE CRUD IS RUNNING')
})

app.listen(port, () =>{
    console.log(`SIMPLE CRUD is running on port, ${port}`)
})



