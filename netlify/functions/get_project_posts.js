// /.netlify/functions/get_posts
let firebase = require('./firebase')

exports.handler = async function(event) {
  let db = firebase.firestore()    // define a variable so we can use Firestore

  // grab the project ID for the ugly room the user clicked
  let body = JSON.parse(event.body)
  //let userId = body.userId
  //let username = body.username
  //let imageUrl = body.imageUrl
  let projectId = body.project

  let postsData = []                                        // an empty Array
  
  // take the projectId from the front end and only look at project posts with the right ID
  let postsQuery = await db.collection('projectposts').where('project', '==', projectId)             // posts from Firestore
                           //.orderBy('created')              // ordered by created
                           .get()
  let posts = postsQuery.docs                               // the post documents themselves
  
  // loop through the post documents
  for (let i=0; i<posts.length; i++) {
    let postId = posts[i].id
    //let postProject = post[i].project                                // the ID for the given post
    let postData = posts[i].data()                          // the rest of the post data

    let commentsQuery = await db.collection('comments')     // likes from Firestore
                             .where('postId', '==', postId) // for the given postId
                             .get()

    let upsQuery = await db.collection('ups')     // likes from Firestore
                             .where('postId', '==', postId) // for the given postId
                             .get()
   let downsQuery = await db.collection('downs')     // likes from Firestore
                             .where('postId', '==', postId) // for the given postId
                             .get()    

    /* let projectQuery = await db.collection('downs')     // likes from Firestore
    .where('postId', '==', postId) // for the given postId
    .get()   */                             
                             


    let commentsData = []                                   // an empty Array
    let comments = commentsQuery.docs                       // the comments documents

    // loop through the comment documents
    for (let i=0; i<comments.length; i++) {
      let comment = comments[i].data()                      // grab the comment data
      commentsData.push({
        username: comment.username,                         // the author of the comment
        text: comment.text                                  // the comment text
      })
    }

    // add a new Object of our own creation to the postsData Array
    postsData.push({
      id: postId,                                           // the post ID
      imageUrl: postData.imageUrl,                          // the image URL
      username: postData.username,                          // the username
      ups: upsQuery.size,
      downs: downsQuery.size,                               // number of likes
      comments: commentsData                                // an Array of comments
    })
  }
  
  // return an Object in the format that a Netlify lambda function expects
  return {
    statusCode: 200,
    body: JSON.stringify(postsData)
  }
}