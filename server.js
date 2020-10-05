const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.afmg3.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;


const app = express();
app.use(morgan('dev'));
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send('Home Page...');
});


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const productsCollections = client.db("emaJonStore").collection("products");
    const ordersCollections = client.db("emaJonStore").collection("orders");

    // product add post req
    app.post('/addProduct', (req, res) => {
        const products = req.body;
        productsCollections.insertOne(products)
            .then(result => {
                 res.send(result.insertedCount);
            });
    });

    // all product show get req
    app.get('/products',(req,res)=>{
        productsCollections.find({})
        .toArray((err,documents)=>{
            res.send(documents);
        })
    })

    // single product show get req
    app.get('/product/:key',(req,res)=>{
        productsCollections.find({key: req.params.key})
        .toArray((err,documents)=>{
            res.send(documents[0]);
        })
    })

    // review product post req
    app.post('/productsByKeys',(req,res)=>{
        const productKeys = req.body;
        productsCollections.find({key: {$in: productKeys}})
        .toArray((err,documents)=>{
            res.send(documents);
        })
    })

    // user orders add post req
    app.post('/addOrder', (req, res) => {
        const order = req.body;
        ordersCollections.insertOne(order)
            .then(result => {
                 res.send(result.insertedCount > 0);
            });
    });

    console.log('DB Connect')
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is Running on PORT  ${PORT}`);
});