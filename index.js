require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb')
const cors = require('cors')
const express = require('express')
const app = express()
const port = process.env.PORT || 3000

// middleware
app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@first-cloud.j7wkmls.mongodb.net/?appName=first-cloud`

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
})

app.get('/', (req, res) => {
  res.send('akm skillverse server is running')
})

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect()

    const db = client.db('akm_skillverse')
    const coureseColl = db.collection('courses')
    const enrolledColl = db.collection('enrolledCourses')

    app.get('/courses', async (req, res) => {
      const cursor = coureseColl.find().sort({ price: 1 })
      const result = await cursor.toArray()
      res.send(result)
    })

    app.get('/myaddedcourses', async (req, res) => {
      const email = req.query.email
      const query = {}
      if (email) {
        query.email = email
      }

      const cursor = coureseColl.find(query)
      const result = await cursor.toArray()
      res.send(result)
    })

    app.get('/courses/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await coureseColl.findOne(query)
      res.send(result)
    })

    app.post('/courses', async (req, res) => {
      const newCourse = req.body
      const result = await coureseColl.insertOne(newCourse)
      res.send(result)
    })

    app.patch('/myaddedcourses/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const updatedCourse = req.body
      const update = {
        $set: updatedCourse,
      }
      const result = await coureseColl.updateOne(query, update)
      res.send(result)
    })

    // app.patch('/myaddedcourses/:id', async (req, res) => {
    //   const id = req.params.id
    //   const query = { _id: new ObjectId(id) }
    //   const updatedCourse = req.body

    //   try {
    //     const updateDoc = {
    //       $set: {
    //         title: updatedCourse.title,
    //         image_url: updatedCourse.image_url,
    //         price: updatedCourse.price,
    //         duration: updatedCourse.duration,
    //         category: updatedCourse.category,
    //         description: updatedCourse.description,
    //       },
    //     }

    //     const result = await coursesColl.updateOne(query, updateDoc)
    //     res.send(result)
    //   } catch (error) {
    //     console.error('Error updating course:', error)
    //     res.status(500).send({ error: 'Failed to update course' })
    //   }
    // })

    app.delete('/myaddedcourses/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await coureseColl.deleteOne(query)
      res.send(result)
    })

    // enrolled
    app.post('/enrolled', async (req, res) => {
      const newEnrollment = req.body
      const { courseId, email } = newEnrollment
      const existing = await enrolledColl.findOne({ courseId, email })

      if (existing) {
        return res.send({ alreadyEnrolled: true })
      }

      const result = await enrolledColl.insertOne(newEnrollment)
      res.send(result)
    })

    app.get('/enrolled', async (req, res) => {
      const email = req.query.email
      const query = email ? { email } : {}
      const cursor = enrolledColl.find(query)
      const result = await cursor.toArray()
      res.send(result)
    })

    app.delete('/enrolled/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await enrolledColl.deleteOne(query)
      res.send(result)
    })

    // Send a ping to confirm a successful connection
    // await client.db('admin').command({ ping: 1 })
    console.log('Pinged your deployment. You successfully connected to MongoDB!')
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir)

app.listen(port, () => {
  console.log(`akm skillverse is running on port ${port}`)
})
