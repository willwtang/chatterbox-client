// YOUR CODE HERE:

$(document).ready(function() {
  app.init();
});

window.app = {};
app.rooms = {};
app.currentRoom = 'main';
app.server = 'https://api.parse.com/1/classes/messages';
app.friends = {};

app.init = function() {
  app.fetch();

  $('#chats').on('click', '.username', function(event) {
    app.toggleFriend($(this).text());
    app.refresh();
  });

  $('.submit').on('click', function(event) {
    app.handleSubmit();
  });

  $('.refresh').on('click', function(event) {
    app.refresh();
  });

  $('#roomSelect').on('change', function(event) {
    app.currentRoom = $('#roomSelect').val();
    app.refresh();
  });
};

app.refresh = function() {
  app.clearMessages();
  app.clearRooms();
  //console.log('Room is ' + room);
  app.fetch();
};

app.send = function(message) {
  $.ajax({
    // This is the url you should use to communicate with the parse API server.
    url: app.server,
    type: 'POST',
    data: JSON.stringify(message),
    contentType: 'application/json',
    success: (data) => {
      // console.log('chatterbox: POST success');
      // console.log(data);
    },
    error: (data) => {
      // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
      // console.error('chatterbox: Failed to send message', data);
    }
  });
};

app.fetch = function() {
  $.ajax({
    url: app.server,
    success: function (data) {
      // console.log('chatterbox: GET success');
      let filteredData = _.filter(data.results, function(element) { 
        return element.roomname === app.currentRoom;
      });

      _.each(filteredData, function(message) {
        for (let property in message) {
          message[property] = _.escape(message[property]);
        }
        app.addMessage(message);
      });
      
      _.each(data.results, function(message) {
        app.rooms[message.roomname] = true;
      });

      for (let roomname in app.rooms) {
        app.addRoom(roomname);
      }
      $('#roomSelect').val(app.currentRoom);
    },
    dataType: 'json'
  });
};

app.clearMessages = function() {
  $('#chats').empty();
};

app.addMessage = function(message) {
  let $chat = $(`<div class="chat"></div>`);
  let $username = $(`<div class="username">${message.username}</div>`);
  let $message = $(`<div class="text">${message.text}</div>`);

  if (message.username in app.friends) {
    $username.addClass('friend');
    $message.addClass('friend-message');
  }

  $chat.append($username);
  $chat.append($message);
  $('#chats').append($chat);
};

app.clearRooms = function() {
  $('#roomSelect').empty();
};

app.addRoom = function(room) {
  let $roomOption = $(`<option value="${room}"> ${room} </option>`);
  $('#roomSelect').append($roomOption);
};

app.toggleFriend = function(username) {
  if ( app.friends[username] ) {
    delete app.friends[username];
  } else {
    app.friends[username] = true;
  }
};

app.handleSubmit = function() {
  let message = {
    username: $('#username').val(),
    text: $('#message').val(),
    roomname: app.currentRoom
  };

  app.send(message);
  app.refresh();
};
