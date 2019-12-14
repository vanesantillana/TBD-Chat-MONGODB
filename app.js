const express = require("express");
const app = express();
const dateTime = require("simple-datetime-formater");
const bodyParser = require("body-parser");
const chatRouter = require("./route/chatroute");
const loginRouter = require("./route/loginRoute");
var faker = require('faker');

const http = require("http").Server(app);

// INICIALIZA SOCKETS
const io = require("socket.io");

const port = 5000;

//bodyparser middleware
app.use(bodyParser.json());

//routes
app.use("/chats", chatRouter);
//app.use("/login", loginRouter);

//set the express.static middleware
app.use(express.static(__dirname + "/public"));

//integrating socketio
socket = io(http);

// CONEXION A LA DB
const Chat = require("./models/Chat");
const connect = require("./dbconnect");


////////////////////////////////////

function emit_message(tsocket,message){
  console.log("message: " + message);

  tsocket.emit("received", { message: message }); // PARA MI
  tsocket.broadcast.emit("received", { message: message }); //PARA LOS DEMAS
  connect.then(db => {
    console.log("Conexion correcta con express");
    let chatMessage = new Chat({ message: message, sender: "Anomimo" }); //Anonymous
    chatMessage.save();
  });
}

function infinity_messages(tsocket){
  for(let i=0; i<100; i++){
    var tmessage = faker.lorem.sentence();
    emit_message(tsocket,tmessage);
  }
}

//inicializo socket
socket.on("connection", socket => {
  console.log("user connected");

  socket.on("disconnect", function() {
    console.log("user disconnected");
  });

  //Alguien esta escribiendo
  socket.on("typing", data => {
    socket.broadcast.emit("notifyTyping", {
      user: data.user,
      message: data.message
    });
  });

  //Cuando alguien para de escribir
  socket.on("stopTyping", () => {
    socket.broadcast.emit("notifyStopTyping");
  });

  socket.on("chatmessage", function(msg) {
    emit_message(socket,msg);
    if(msg=="infinity"){
      infinity_messages(socket);
    }
  });
});

http.listen(port, () => {
  console.log("Running on Port: " + port);
});

