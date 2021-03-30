const express = require('express')
const port = 4000;
const bodyParser = require('body-parser');
const cors = require('cors')
const app = express();
const admin = require('firebase-admin');
require('dotenv').config()

app.use(cors())
app.use(bodyParser.json());
const MongoClient = require('mongodb').MongoClient;

var serviceAccount = require("./configs/bruj-al-arab-d4c3a-firebase-adminsdk-jhvok-7f336a6bd6.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rk4xi.mongodb.net/burjAlArab?retryWrites=true&w=majority`;




const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
client.connect(err => {
  const bookings = client.db("burjAlArab").collection("bookings");
  // perform actions on the collection object
  console.log("Connected");

  app.post('/addBooking', (req, res) => {
    const newBooking = req.body;
    bookings.insertOne(newBooking)
      .then(result => {
        res.send(result.insertedCount > 0);
      })

  })

  app.get('/addBooking', (req, res) => {
    const bearer = req.headers.authorization;
    if (bearer && bearer.startsWith('Bearer ')) {


      const idToken = bearer.split(' ')[1]


      admin.auth().verifyIdToken(idToken)
        .then((decodedToken) => {
          const tokenEmail = decodedToken.email;
          const queryEmail = req.query.email;

          if (tokenEmail == queryEmail) {

            bookings.find({
                email: req.query.email
              })
              .toArray((err, docu) => {
                res.send(docu);
              })
          }
          else{
            res.status(401).send('Unauth')
          }
          // ...
        })
        .catch((error) => {
          res.status(401).send('Unauth')
        })
    }
    else{
      res.status(401).send('Unauth')
    }

  })

});

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})