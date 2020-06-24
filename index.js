const app = require('express')();
const express = require("express");
const { createCipheriv } = require('crypto');

const server = require('http').createServer(app);
const io = require('socket.io')(server);

const fs = require("fs");
const { isObject, assign } = require('lodash');
const { emit } = require('process');
//const { emit } = require('process');
const foldir = process.cwd() + "/public";


// Master keywords

let masterKeywords = { //includes
  createObjectK: 'n', // new
  addToObjectK: 'e', // edit
  setActiveObjectK: 's', //set
  listObjectsK: 'l' //list
}

//array string proto method
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

//print all object and subobjects
function show(obj) {

  for (o in obj) {
    io.emit('channel2', [o, obj[o]].str() )
    if (isObject( obj[o])) {
       show(obj[o])
    }
    else {
     
    }
  }
}

function showarr(obj) {

  for (o in obj) {
    if ( typeof(obj[o]) != 'function' ) {
    io.emit('channel1', obj[o].substr(0,  obj[o].length -5) ) 
  }
  }
}

var files = fs.readdirSync(process.cwd() + "/trees")
names = []
for (file of files) {
  names.push(file.split('.').slice(0, -1).join('.'))
}

//serving
    app.set("view engine", "pug");
    app.use(express.static(foldir));
    app.get("/", function (req, res, next) {
    res.render("acte/index", {
        title: "Acte"
      });
      next();
    });

    io.on('connection', (socket) => {
        socket.on('channel1', (msg) => {
          io.emit('channel1', msg);
          if (msg === "chebka") {
            io.emit('channel1', "tan tan tan!")
          }

          try {
          let arg = []
          for (let i = 0; i < msg.split(" ").length; i++) {
            arg[i] =  msg.split(" ")[i]
            if (arg[i] == '') {arg.splice(i)}
            if (/\W/g.test(arg[i]) == true ) {
              io.emit("channel1", "Error Type Nikoumouk")
              throw("Nikoumouk")
            }
          }
          // create new obj using keyword
          if(arg[0] == masterKeywords.createObjectK && arg.length === 2 )  {
            fs.access(process.cwd() + "\\trees\\" + arg[1] + ".json", fs.constants.F_OK, (e) => {
              try{ 
                //  prevent create object method to overwrite existing objects
              if (e == null) {
              console.log("you ain\'t god")
              io.emit('channel1', "new is new, use \'" + masterKeywords.addToObjectK + "\' special keyword to modify existing object")
              throw("Can't create an existing object.")
             }
          else {
              // create object method
             var tree = {'_': {'name': arg[1] }}
             tree._.createdTime = new Date()
              // print obj to webbrowser
             show(tree) 
              // write local json file
             fs.writeFileSync(process.cwd() + "/trees/" + tree._.name + ".json", JSON.stringify(tree, null, 2), 'utf8') 
            }
           } catch (err) {console.error(err)}
         })
        }
            // prevent misuse of masterkeywords
          if(arg[0] != masterKeywords.listObjectsK && arg.length === 1 )  {
          if (Object.values(masterKeywords).includes(arg[0]) == true && arg.length == 1
           || Object.values(masterKeywords).includes(arg[0]) == true && arg.length >= 3
           || Object.values(masterKeywords).includes(arg[0]) == true && arg.length >= 3)  {
            io.emit('channel1', "invalid syntax: " + arg[0] + " method needs 1 arg")
            throw("invalid syntax: " + arg[0] + " method needs arg")
          }
        }
          // master method: list existing objects 
          if(arg[0] == masterKeywords.listObjectsK && arg.length === 1 )  {
            var files = fs.readdirSync(process.cwd() + "/trees")
            showarr(files)
            console.log(files, process.cwd())
          }
          // master method: set active object
          if(arg[0] == masterKeywords.setActiveObjectK && arg.length === 2 )  {
            fs.access(process.cwd() + "\\trees/" + arg[1] + ".json", fs.constants.F_OK, (e) => {
              try {
              if(e == null) {
            activeTree = JSON.parse(fs.readFileSync(process.cwd() + "\\trees\\" + arg[1] + ".json"))
            show(activeTree)
            console.log(arg[1], "object loaded")
              }
            // prevent set method to activate non-existing object
          else { 
            io.emit("channel1", "Object 404")
            throw("Invalid Tree name")
          }
        } catch(err) {console.error(err)}
          })
        }
          } catch(e) {console.error(e)}
        });
      });

server.listen(80);