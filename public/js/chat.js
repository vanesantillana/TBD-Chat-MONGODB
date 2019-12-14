var socket = io();
var messages = document.getElementById("messages");

(function() {
  $("form").submit(function(e) {
    let li = document.createElement("li");
    e.preventDefault(); // prevents page reloading
    socket.emit("chat message", $("#message").val());

    //messages.appendChild(li).append($("#message").val());
    //let span = document.createElement("span");
    //messages.appendChild(span).append("by " + "Anonymous" + ": " + "just now");

    $("#message").val("");
   
    return false;
  });

  socket.on("received", data => {
    console.log('dato recivido',data.message);
    let li = document.createElement("li");
    let span = document.createElement("span");
    var messages = document.getElementById("messages");
    messages.appendChild(li).append(data.message);
    messages.appendChild(span).append("Enviado por " + "anonimo" + ": " + "justo ahora");
    $('#messages').animate({scrollTop: $('#messages').prop("scrollHeight")}, 5);
  });
})();

// fetching initial chat messages from the database
(function() {
  fetch("/chats")
    .then(data => {
      return data.json();
    })
    .then(json => {
      json.map(data => {
        let li = document.createElement("li");
        let span = document.createElement("span");
        messages.appendChild(li).append(data.message);
        messages
          .appendChild(span)
          .append("Enviado por " + data.sender + ": " + formatTimeAgo(data.createdAt)); //
      });
      $('#messages').animate({scrollTop: $('#messages').prop("scrollHeight")}, 500);
    });
})();

//is typing...

let messageInput = document.getElementById("message");
let typing = document.getElementById("typing");

//isTyping event
messageInput.addEventListener("keypress", () => {
  socket.emit("typing", { user: "Alguien", message: "esta escribiendo..." });
});

socket.on("notifyTyping", data => {
  typing.innerText = data.user + " " + data.message;
  console.log(data.user + data.message);
});

//stop typing
messageInput.addEventListener("keyup", () => {
  socket.emit("stopTyping", "");
});

socket.on("notifyStopTyping", () => {
  typing.innerText = "";
});
