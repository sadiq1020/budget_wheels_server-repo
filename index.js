const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;

const app = express();

// Middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.e3n1sso.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const productsCollection = client.db('budgetWheels').collection('products');
        const categoriesCollection = client.db('budgetWheels').collection('categories');
        const usersCollection = client.db('budgetWheels').collection('users');
        const bookingsCollection = client.db('budgetWheels').collection('bookings');

        // get all three categories
        app.get('/categories', async (req, res) => {
            const query = {};
            const result = await categoriesCollection.find(query).toArray();
            res.send(result);
        });

        // get products by category
        app.get('/categoryProducts', async (req, res) => {
            const name = req.query.name;
            const query = { categoryName: name };
            const products = await productsCollection.find(query).toArray();
            res.send(products);
        });

        // save booking info to db
        app.post('/bookings', async (req, res) => {
            const booking = req.body;

            // first checking, if the same product already booked
            const query = {
                buyerName: booking.buyerName,
                email: booking.email,
                brand: booking.brand,
                series: booking.series
            }

            const alreadyBooked = await bookingsCollection.find(query).toArray();
            if (alreadyBooked.length) {
                const message = `You already have booked this ${booking.brand} ${booking.series}`
                return res.send({ acknowledged: false, message })
            }

            const result = await bookingsCollection.insertOne(booking);
            res.send(result);
        })

        // save all users info in db
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.send(result);
        });

    }
    finally {

    }
}
run().catch(console.log())




// -----------------------------------------------
app.get('/', async (req, res) => {
    res.send('Budget wheels server is running')
})

app.listen(port, () => console.log(`Budget wheel running on port: ${port}`))
// -----------------------------------------------