// /.netlify/functions/create_post
let firebase = require('./firebase')

// write the design ideas to firebase
exports.handler = async function(event) {
  let db = firebase.firestore()
  let body = JSON.parse(event.body)
  let userId = body.userId
  let username = body.username
  let imageUrl = body.imageUrl
  let projectId = body.project
  
  console.log(`user: ${userId}`)
  console.log(`imageUrl: ${imageUrl}`)

  let newPost = { 
    userId: userId,
    username: username, 
    imageUrl: imageUrl, 
    project: projectId, // this is the ID of the ugly room ... we use it to remember which ugly room this design was submitted for 
    created: firebase.firestore.FieldValue.serverTimestamp()
  }

  let docRef = await db.collection('projectposts').add(newPost) // write to the collection of design ideas, which is separate from the collection of ugly rooms
  newPost.id = docRef.id
  newPost.ups = 0
  newPost.downs = 0

  return {
    statusCode: 200,
    body: JSON.stringify(newPost)
  }

}