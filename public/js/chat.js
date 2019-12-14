var socket = io();
var messages = document.getElementById("messages");

(function() {
  $("form").submit(function(e) {
    let li = document.createElement("li");
    e.preventDefault(); 
    // Emito mi mensaje a mi mismo
    socket.emit("chatmessage", $("#message").val());
    $("#message").val("");
    return false;
  });

  //RECIBO MENSAJES DE TODOS LOS USUARIOS
  socket.on("received", data => {
    console.log('dato recibido',data.message);

    let li = document.createElement("li");
    let span = document.createElement("span");
    var messages = document.getElementById("messages");
    messages.appendChild(li).append(data.message);
    messages.appendChild(span).append("Enviado por " + "anonimo" + ": " + "justo ahora");
    $('#messages').animate({scrollTop: $('#messages').prop("scrollHeight")}, 5);
  });
})();

// IINICIA CHAT CON RECUPERACION DE DATOS
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



let messageInput = document.getElementById("message");
let typing = document.getElementById("typing");

//ESCRIBIENDO
messageInput.addEventListener("keypress", () => {
  socket.emit("typing", { user: "Alguien", message: "esta escribiendo..." });
});

socket.on("notifyTyping", data => {
  typing.innerText = data.user + " " + data.message;
  console.log(data.user + data.message);
});

//PARA DE ESCRIBIR
messageInput.addEventListener("keyup", () => {
  socket.emit("stopTyping", "");
});

socket.on("notifyStopTyping", () => {
  typing.innerText = "";
});
