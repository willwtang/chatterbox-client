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
  app.fetchMessages();
  app.fetchRooms();

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

  // setInterval( app.refresh, 2000 );
};

app.refresh = function() {
  app.clearMessages();
  app.clearRooms();
  app.fetchMessages();
  app.fetchRooms();
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

app.fetchMessages = function() {
  $.ajax({
    url: app.server,
    data: `where={ "roomname": "${app.currentRoom}" }`,
    success: function (data) {
      app.updateMessages(data.results);
    },
    dataType: 'json'
  });
};

app.fetchRooms = function() {
  app.rooms = {};
  $.ajax({
    url: app.server,
    data: 'keys=roomname',
    success: function (data) {
      _.each(data.results, function(message) {
        app.rooms[message.roomname] = true;
      });

      for (let roomname in app.rooms) {
        app.addRoom(roomname);
      }
      $('#roomSelect').val(app.currentRoom);
      $('#room').val(app.currentRoom);
    },
    dataType: 'json'
  });
};

app.clearMessages = function() {
  $('#chats').empty();
};

app.updateMessages = function(data) {
  let chats = d3.select('#chats')
    .selectAll('.chat').data(data, data => data.objectId);

  // Append new messages
  let newChats = chats.enter().insert('div', ":first-child").attr('class', 'chat');
  console.log(newChats);
  newChats.append('div').attr('class', 'username')
    .text(data => data.username);
  newChats.insert('div').attr('class', 'timestamp')
    .text(data => $.timeago(data.createdAt));
  newChats.insert('div').attr('class', 'message')
    .text(data => data.text);

  // Update existing chats
  chats.select('.username').text(data => data.username);
  chats.select('.timestamp').text(data => $.timeago(data.createdAt));
  chats.select('.message').text(data => data.text);

  // Remove elements
  chats.exit().remove();
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
  app.currentRoom = $('#room').val();
  let message = {
    username: $('#username').val(),
    text: $('#message').val(),
    roomname: app.currentRoom
  };
  
  app.send(message);
  app.refresh();
};
