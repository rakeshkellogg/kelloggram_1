

// declare variables which enable information to be passed between functions
let projectId
let formStatus = document.querySelector('#image-url').id
let formCheck ='no'

firebase.auth().onAuthStateChanged(async function(user) {
  
  if (user) {
    // Signed in
    console.log('signed in')
     
    // // Write the user's info to firebase -- firebase can still ientify our signed-in users, even without writing them to a users collection
    // let data = firebase.firestore()
    // data.collection('users').doc(user.uid).set({
    //    name: user.displayName,
    //    email: user.email
    //  })

    // Sign-out button
    document.querySelector('.sign-in-or-sign-out').innerHTML = `
      <button class="text-pink-500 underline sign-out">Sign Out</button>
    `
    document.querySelector('.sign-out').addEventListener('click', function(event) {
      console.log('sign out clicked')
      firebase.auth().signOut()
      document.location.href = 'index.html'
    })
    
    // console.log(formStatus)

    // Listen for the form submit and create/render the new post
    document.querySelector('form').addEventListener('submit', async function(event) {
      event.preventDefault()

      // if the user hasn't clicked into an ugly room yet...
      if(formCheck == 'no') {
        let postUsername = user.displayName
        let postImageUrl = document.querySelector('#image-url').value

        // add the newly-posted ugly room to firebase in the posts collection
        let response = await fetch('/.netlify/functions/create_post', {
        method: 'POST',
        body: JSON.stringify({
          userId: user.uid,
          username: postUsername,
          imageUrl: postImageUrl
        })
      })

      let post = await response.json()
      document.querySelector('#image-url').value = '' // clear the image url field
      renderPost(post)
      console.log(post.id)

      } else { // if the user clicked into an ugly room, they can now use this button to post a design idea to the firebase projectposts collection

        // Listen for the form submit and create/render the new design idea post
        let postUsername = user.displayName
        console.log(projectId) // the project ID is the ID of the ugly room ... that's how we associate design submissions with each ugly room
        console.log(formCheck)
        let postImageUrl = document.querySelector('#image-url2').value

        // create the project post AKA the design submission to fix an ugly room. Pass the project ID to the backend to be stored in firebase
        let response = await fetch('/.netlify/functions/create_project_post', {
          method: 'POST',
          body: JSON.stringify({
            project: projectId,
            userId: user.uid,
            username: postUsername,
            imageUrl: postImageUrl
          })
        })

        let post = await response.json()
        document.querySelector('#image-url2').value = '' // clear the image url field
        renderProjectPost(post)
      
      }
    })
    
    let response = await fetch('/.netlify/functions/get_posts')
    let posts = await response.json()
    for (let i=0; i<posts.length; i++) {
      let post = posts[i]
      renderPost(post)
    }
      
  } else {

    // Signed out
    console.log('signed out')

    // Hide the form when signed-out
    document.querySelector('form').classList.add('hidden')

    // Initializes FirebaseUI Auth
    let ui = new firebaseui.auth.AuthUI(firebase.auth())

    // FirebaseUI configuration
    let authUIConfig = {
      signInOptions: [
        firebase.auth.EmailAuthProvider.PROVIDER_ID
      ],
      signInSuccessUrl: 'index.html'
    }

    // Starts FirebaseUI Auth
    ui.start('.sign-in-or-sign-out', authUIConfig)
  }
})

// render user's posts of ugly rooms that need help!
async function renderPost(post) {
  let postId = post.id
  document.querySelector('.posts').insertAdjacentHTML('beforeend', `
    
    <div class="post-${postId} md:mt-16 mt-8 space-y-8">
      <div class="md:mx-0 mx-4">
        <span class="font-bold text-gray-700 text-xl">Home of: ${post.username}</span>
      </div>

      <div>
        <img src="${post.imageUrl}" class="w-full rounded-lg shadow-lg">
      </div>

      <div class="text-2xl md:mx-0 mx-4">
        <button class="submit-button bg-indigo-900 hover:bg-blue-600 text-white px-4 py-2 rounded-xl">I want to redesign this space!</button>
      </div>
    </div>
     
  `)
  
  // listen for a user to click the "I can help!" button on an ugly room
  let submitButton = document.querySelector(`.post-${post.id} .submit-button`)
  submitButton.addEventListener('click', async function(event) {
    event.preventDefault()
    console.log(`post ${post.id} submit button clicked!`)
    let currentUserId = firebase.auth().currentUser.uid
    formCheck = 'yes' // indicate that any subsequent url submitted by the user is a design idea rather than an ugly room
    projectId = post.id // the project ID is the ID of the ugly room ... that's how we associate design submissions with each ugly room 
    formStatus = 'image-url2' // change the html name of the form - we'll use this distinction to call a different lambda function
    //console.log(formCheck)
    //console.log(projectId)

    // pass the projectId to the back end to be stored in firebase
    let response = await fetch('/.netlify/functions/get_project_posts', {
      method: 'POST',
      body: JSON.stringify({
        project: projectId,
      })
    })

    let posts = await response.json()

    // populate the design proposals for the chosen ugly room
    document.querySelector('.posts').innerHTML = ``   // first clear the ugly rooms from the html
    for (let i=0; i<posts.length; i++) {              // then populate all the design submissions
      let post = posts[i]
      renderProjectPost(post)
    }

    // provide the form field for new design submissions to save ugly rooms
    document.querySelector('form').innerHTML = `
      <div>
        <form class="w-full mt-8">
          <input type="text" id="image-url2" name="image-url2" placeholder="Design proposal URL goes here" class="my-2 p-2 w-64 border border-gray-400 rounded shadow-xl focus:outline-none focus:ring-purple-500 focus:border-purple-500">
          <button class="bg-indigo-900 hover:bg-green-600 text-white px-4 py-2 rounded-xl">Submit Design</button>
        </form>
      </div>
    `
 })
    
  // simple console log to confirm whether we are on the ugly room or design page and to display which ugly project was clicked
  console.log(projectId)
  console.log(formCheck)
}

// render the design ideas that users submit to fix ugly rooms
async function renderProjectPost(post) {
  let postId = post.id
  document.querySelector('.posts').insertAdjacentHTML('beforeend', `
    
    <div class="post-${postId} md:mt-16 mt-8 space-y-8">
      <div class="md:mx-0 mx-4">
        <span class="font-bold text-gray-700 text-xl">Designer: ${post.username}</span>
      </div>

      <div>
        <img src="${post.imageUrl}" class="w-full rounded-lg shadow-lg">
      </div>

      <div class="text-2xl md:mx-0 mx-4">
        <button class="up-button"><img src="http://www.pngmart.com/files/10/Thumbs-UP-PNG-Transparent-Image.png" width="20" height="20" border="0" alt="javascript button"></button>
        <span class="ups">${post.ups}</span>
  
        <button class="down-button"><img src="https://www.nicepng.com/png/detail/223-2238128_thumbs-down-emoji-discord-emoji-thumbs-down.png" width="20" height="20" border="0" alt="javascript button"></button>
        <span class="downs">${post.downs}</span>     
      </div>
    </div> 
  `)
    
  // listen for the up button on this post - note a user can only thumbs up or down a post once, and they can't thumbs up AND thumbs down a post
  let upButton = document.querySelector(`.post-${post.id} .up-button`)
  upButton.addEventListener('click', async function(event) {
    event.preventDefault()
    console.log(`post ${post.id} up button clicked!`)
    let currentUserId = firebase.auth().currentUser.uid

    let response = await fetch('/.netlify/functions/up', {
      method: 'POST',
      body: JSON.stringify({
        postId: post.id,
        userId: currentUserId
      })
    })

    console.log(response.ok)

    if (response.ok) {
      console.log(response.ok)
      let existingNumberOfUps = document.querySelector(`.post-${post.id} .ups`).innerHTML
      console.log(existingNumberOfUps)
      let newNumberOfUps = parseInt(existingNumberOfUps) + 1
      console.log(newNumberOfUps)
      document.querySelector(`.post-${post.id} .ups`).innerHTML = newNumberOfUps
    }
  })


  // listen for the down button on this post
  let downButton = document.querySelector(`.post-${post.id} .down-button`)
  downButton.addEventListener('click', async function(event) {
    event.preventDefault()
    console.log(`post ${post.id} down button clicked!`)
    let currentUserId = firebase.auth().currentUser.uid

    let response = await fetch('/.netlify/functions/down', {
      method: 'POST',
      body: JSON.stringify({
        postId: post.id,
        userId: currentUserId
      })
    })

    if (response.ok) {
      let existingNumberOfDowns = document.querySelector(`.post-${post.id} .downs`).innerHTML
      console.log(existingNumberOfDowns)
      let newNumberOfDowns = parseInt(existingNumberOfDowns) + 1
      console.log(newNumberOfDowns)
      document.querySelector(`.post-${post.id} .downs`).innerHTML = newNumberOfDowns
    }

  })

}

