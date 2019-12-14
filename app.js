//require the express module
const express = require("express");
const app = express();
const dateTime = require("simple-datetime-formater");
const bodyParser = require("body-parser");
const chatRouter = require("./route/chatroute");
const loginRouter = require("./route/loginRoute");

//require the http module
const http = require("http").Server(app);

// require the socket.io module
const io = require("socket.io");

const port = 5000;

//bodyparser middleware
app.use(bodyParser.json());

//routes
app.use("/chats", chatRouter);
app.use("/login", loginRouter);

//set the express.static middleware
app.use(express.static(__dirname + "/public"));

//integrating socketio
socket = io(http);

//database connection
const Chat = require("./models/Chat");
const connect = require("./dbconnect");


function emit_message(tsocket,message){
  //console.log("message: " + message);
  //broadcast message to everyone in port:5000 except yourself.
  tsocket.emit("received", { message: message });
  tsocket.broadcast.emit("received", { message: message });
  connect.then(db => {
    console.log("connected correctly to the server");
    let chatMessage = new Chat({ message: message, sender: "Anonymous" });

    chatMessage.save();
  });
}

function infinity_messages(tsocket){
  for(let i=0; i<100; i++){
    emit_message(tsocket,'hola, como');
  }
}
//setup event listener
socket.on("connection", socket => {
  console.log("user connected");

  socket.on("disconnect", function() {
    console.log("user disconnected");
  });

  //Someone is typing
  socket.on("typing", data => {
    socket.broadcast.emit("notifyTyping", {
      user: data.user,
      message: data.message
    });
  });

  //when soemone stops typing
  socket.on("stopTyping", () => {
    socket.broadcast.emit("notifyStopTyping");
  });

  socket.on("chat message", function(msg) {
    emit_message(socket,msg);
    if(msg=="infinity"){
      infinity_messages(socket);
    }
  });
});

http.listen(port, () => {
  console.log("Running on Port: " + port);
});

