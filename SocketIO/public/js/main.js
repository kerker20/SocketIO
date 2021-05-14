
const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');
let myID = "";
// Get username and room from URL
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

console.log(username, room);

const socket = io();

var timeout;

function timeoutFunction() {
  typing = false;
  socket.emit("typing", false);
}

$('.input').keyup(function () {
  typing = true;
  socket.emit('typing', typing);
  console.log('happening');
  clearTimeout(timeout);
  timeout = setTimeout(timeoutFunction, 1000);
});

socket.on('typing', function (data) {
  if (data) {
    $('#typing').show().delay(300).fadeOut();
  } else {
    $('.typing').text("");
  }
});


socket.on("user data", (data) => {
  myID = data.id;
  console.log("My id is " + myID)
})

// Join chatroom
socket.emit('joinRoom', { username, room });

// Get room and users
socket.on('roomUsers', ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});



// Message from server
socket.on('message', (message) => {
  console.log(message);
  outputMessage(message);

  // Scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
});
socket.on('bago user', (message) => {
  $('.chat-messages').append(` 
    <p class="small text-center">${message.text}</p>
  `)
  chatMessages.scrollTop = chatMessages.scrollHeight;
});
// Message submit
chatForm.addEventListener('submit', (e) => {
  e.preventDefault();

  // Get message text
  let msg = e.target.elements.msg.value;

  msg = msg.trim();

  if (!msg) {
    return false;
  }

  // Emit message to server
  socket.emit('chatMessage', msg);

  // Clear input
  e.target.elements.msg.value = '';
  e.target.elements.msg.focus();
});


// Output message to DOM
function outputMessage(message) {

  var user = message.username;
  if (user == username) {
    $('.chat-messages').append(` <small class='type' href=''>${message.username}&nbsp;<span class='text-success'>${message.time}</span></small> <div class="you">
    <p class="text">${message.text}</p>
  </div>`)
  } else {
    $('.chat-messages').append(` <a class='other' href='index.html' style='text-decoration:none;color:black;font-size:small;' data-toggle="tooltip" data-html="true" title="Click here for private message"">${message.username}&nbsp;<span class='text-success'>${message.time}</span></a> <div class="others mt-1">
    <p class="text1">${message.text}</p>
  </div>`)
  }

}


// Add room name to DOM
function outputRoomName(room) {
  roomName.innerText = room;
}


// Add users to DOM
function outputUsers(users) {
  userList.innerHTML = '';
  $('#users').empty()
  users.forEach((user) => {
    const stats = `&nbsp;&nbsp;<span><img src='https://i.ibb.co/nkBzrPF/removal-ai-tmp-609cb7c64018a.png' width='10' ></span>`;
    if (user.username == username) {
      // alert("hi")
      $('#users').append(`<li class="p-2 text-dark mt-2" style="border-radius:5rem;width:fit-content;background-color:white;"><small class='text-muted'>You -</small>&nbsp;${user.username}${stats}</li>`);
    } else {
      $('#users').append(`<li class="p-2  mt-2 " style="border-radius:5rem;width:fit-content;background-color:rgba(196, 196, 196);"><i class="fas fa-user-friends"></i><input type='hidden' id='idOther' value='${user.id}'>&nbsp;<button onclick="private()" id='btn-fr' class='btn-fr'>${user.username}${stats}</button></li>`);
    }
  });
}

function private() {
  var x = document.getElementById("private-card");
  if (x.style.display == "none") {
    x.style.display = "block";
    $('.chat-messages').hide();
    $('#privateChat').append(`<h5>${username}</h5>`);

  } else {
    x.style.display = "none";
    $('.chat-messages').show();
  }
}


//Prompt the user before leave chat room
document.getElementById('leave-btn').addEventListener('click', () => {
  const leaveRoom = confirm('Are you sure you want to leave the chatroom?');
  if (leaveRoom) {
    window.location = '../index.html';
  } else {
  }
});
