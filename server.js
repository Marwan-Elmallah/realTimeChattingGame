const cookieParser = require("cookie-parser");
const express = require("express"),
    fs = require("fs"),
    bodyParser = require("body-parser"),
    app = express(),
    http = require('http').Server(app),
    io = require('socket.io')(http),
    urlencodedParser = bodyParser.urlencoded({ extended: false });
let response = []
app.use(express.static('public'));
app.use(cookieParser());

let usersNames = [];

app.get('/' || '/Login', function (req, res) {
    res.sendFile( __dirname + "/public/" + "Login.html" );
})

app.get('/show', function (req, res) {
    res.sendFile( __dirname + "/" + "users.json" );
})

app.post('/Signup', function (req, res) {
    res.sendFile( __dirname + "/public/" + "Signup.html" );
})

app.post('/processUp', urlencodedParser, function (req, res) {
    let data = JSON.parse(fs.readFileSync(__dirname + "/" + "users.json", 'utf8'))
    let id = Object.keys(data).length + 1;
    let val = true;
    response = {
        name :req.body.userName,
        email:req.body.inputEmail,
        pass:req.body.inputPassword,
        rePass:req.body.reEnterPass
    };
    if(response.pass == response.rePass){
        data[id] = response;
        fs.writeFileSync(__dirname + "/" + "users.json", JSON.stringify(data));
        console.log(data);
        res.sendFile( __dirname + "/public/" + "Login.html" );
    }else{
        console.log("Not Valid");
        res.sendFile( __dirname + "/public/" + "Signup.html" );
    }

})

app.post('/processIn', urlencodedParser, function (req, res) {
    checker = {
        myEmail : req.body.inputEmail,
        myPass: req.body.inputPassword
    }
    let data = JSON.parse(fs.readFileSync(__dirname + "/" + "users.json", 'utf8'));
    let val = true;
    let Name = "";
    for(let i=1 ; i<=Object.keys(data).length ; i++){
        if(checker.myEmail == data[i].email && checker.myPass == data[i].pass){
            console.log(data);
            Name = data[i].name;
            res.cookie('username', Name);
            usersNames.push(Name);
            res.sendFile( __dirname + "/public/" + "Home.html" );
            val = false;
        }
    }
    if(val){
        res.sendFile( __dirname + "/public/" + "Login.html");
    }
})

const activeUsers = new Set();

io.on("connection", function (socket) {
    console.log("Made socket connection");

    socket.on("IamNewUSER", function (data) {
        socket.userId = data;
        activeUsers.add(data);
        console.log('activeUsers', JSON.stringify([...activeUsers]));
        io.emit("newUserForALL", [...activeUsers]);
    });

    socket.on("disconnect", () => {
        activeUsers.delete(socket.userId);
        io.emit("user disconnected", socket.userId);
    });

    socket.on("chat message", function (data) {
        io.emit("chat message", data);
    });

    socket.on("typing", function (data) {
        socket.broadcast.emit("typing", data);
    });

    socket.on('DataGame', function (data) {
        // Do something with the data sent from the server
        io.emit("dataPlayer", data)
        io.emit("UsersNo",usersNames)
        console.log("Recived data game " + data);
    });
});




const PORT = process.env.PORT || 5000;
http.listen(PORT, () => console.log("Listening on http://localhost:" + PORT));





