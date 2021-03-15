// /.netlify/functions/down
let firebase = require('./firebase')

exports.handler = async function(event) {
  let db = firebase.firestore()
  let body = JSON.parse(event.body)
  let postId = body.postId
  let userId = body.userId
  
  console.log(`post: ${postId}`)
  console.log(`user: ${userId}`)

  let downSnapshot = await db.collection('downs')
                              .where('postId', '==', postId)
                              .where('userId', '==', userId)
                              .get()
  let numberOfDowns = downSnapshot.size

  if (numberOfDowns == 0) {
    await db.collection('downs').add({
      postId: postId,
      userId: userId
    })
    return { statusCode: 200 }
  } else {
    return { statusCode: 403 }
  }

}