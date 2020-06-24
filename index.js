const app = require('express')();
const express = require("express");
const server = require('http').createServer(app);
const io = require('socket.io')(server);

const fs = require("fs");
const { isObject, assign } = require('lodash');

// Local vars
const foldir = process.cwd() + "/public";

// Master keywords
let masterKeywords = { //includes
  createObjectK: 'n', // new
  addToObjectK: 'e', // edit
  setActiveObjectK: 's', //set
  listObjectsK: 'l' //list
}

let masterKeywordsHelper = {
  createObjectK: ['create an object: \''+ masterKeywords.createObjectK + ' objname\''], // new
  addToObjectK: ['modify method not implemented: \''+ masterKeywords.addToObjectK+ '\''],
  setActiveObjectK: ['set active object: \''+ masterKeywords.setActiveObjectK + ' objname\''], //set
  listObjectsK: ['list object: \''+ masterKeywords.listObjectsK + '\''] //list
}

// New toString proto method for arrays (: instead of ,)
Array.prototype.str = function() {
  b = ""
    for (a of this) {
      if(this.indexOf(a) != this.length -1)  {
      b += a + ": "}
      else {
      b += a }
    }
    return b
  }

// Method to print all object and subobjects to the webbrowser
function show(obj) {
  for (o in obj) {
    io.emit('channel2', [o, obj[o]].str() )
    if (isObject( obj[o])) {
       show(obj[o])
    }
  }
}

// Methods to print arrays to the webbrowser
function showarr(obj, type = 1) {
  for (o in obj) {
    if ( typeof(obj[o]) != 'function' ) {
      if(type == 1) {
    io.emit('channel1', obj[o].substr(0,  obj[o].length -5) )
    }
    if(type == 2) {
      io.emit('channel1', obj[o] )
      }
    }
  }
}

// Serving app
    app.set("view engine", "pug");
    app.use(express.static(foldir));
    app.get("/", function (req, res, next) {
    res.render("acte/index", {
        title: "Acte"
      });
      next();
    });
// Socket.io instance listening to user input: opening dialog
    io.on('connection', (socket) => {

      // helper notice
      io.emit("channel1", "help: existing methods: ")
      showarr(masterKeywordsHelper, 2)

        socket.on('channel1', (msg) => {

          // printing self to the browser
          io.emit('channel1', msg);

          // secret methods
          if (msg === "chebka") {
            io.emit('channel1', "tan tan tan!")
          }

          // Core methods
          try {

            // Retrieve arguments given at each request and store it in arg variable
          let arg = []

           // Split arguments into words
          for (let i = 0; i < msg.split(" ").length; i++) {
            arg[i] =  msg.split(" ")[i]
            if (arg[i] == '') {arg.splice(i)}

              // Remove all non alphanumerical characters from user input and throw error if any
            if (/\W/g.test(arg[i]) == true ) {
              io.emit("channel1", "Error Type Nikoumouk")
              throw("Nikoumouk")
            }
          }

          // Create new obj using keyword routine

          if(arg[0] == masterKeywords.createObjectK && arg.length === 2 )  {
            //  Prevent create object method overwriting existing objects

            fs.access(process.cwd() + "\\trees\\" + arg[1] + ".json", fs.constants.F_OK, (e) => {
              try{
              if (e == null) {
              console.log("you ain\'t god")
              io.emit('channel1', "new is new, use \'" + masterKeywords.addToObjectK + "\' special keyword to modify existing object")
              throw("Can't create an existing object.")
             }
             else {

              // Actual create object method
             var tree = {'_': {'name': arg[1] }}
             tree._.createdTime = new Date()

              // Print obj to webbrowser
             show(tree)

              // Write local json file
             fs.writeFileSync(process.cwd() + "/trees/" + tree._.name + ".json", JSON.stringify(tree, null, 2), 'utf8') 
            }
           } catch (err) {console.error(err)}
         })
        }
            // Prevent misuse of masterkeywords
          if(arg[0] != masterKeywords.listObjectsK && arg.length === 1 )  {
            if (Object.values(masterKeywords).includes(arg[0]) == true && arg.length == 1
             || Object.values(masterKeywords).includes(arg[0]) == true && arg.length >= 3
             || Object.values(masterKeywords).includes(arg[0]) == true && arg.length >= 3)  {

              io.emit('channel1', "invalid syntax: " + arg[0] + " method needs 1 arg")
              throw("invalid syntax: " + arg[0] + " method needs arg")
            }
          }

          // Master method: list existing objects 
          if(arg[0] == masterKeywords.listObjectsK && arg.length === 1 )  {
            var files = fs.readdirSync(process.cwd() + "/trees")
            showarr(files)
            if (files.length == 0) {
              io.emit("channel1", "no object yet, try creating one using \'" + masterKeywords.createObjectK + "\' master keyword")
            }
            console.log(files)
          }

          // Master method: set active object
          if(arg[0] == masterKeywords.setActiveObjectK && arg.length === 2 )  {
            fs.access(process.cwd() + "\\trees/" + arg[1] + ".json", fs.constants.F_OK, (e) => {
              try {
                if(e == null) {
                  activeTree = JSON.parse(fs.readFileSync(process.cwd() + "\\trees\\" + arg[1] + ".json"))
                  show(activeTree)
                  console.log(arg[1], "object loaded")
                 }

                // Prevent set method to activate non-existing object
               else {
                  io.emit("channel1", "Object 404")
                  throw("Invalid Tree name")
                 }
              } catch(err) {console.error(err)}
            })
         }


        // Catch method for initial try:
          } catch(e) {console.error(e)}
        });
      });


server.listen(80);