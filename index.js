const app = require('express')();
const express = require("express");
const server = require('http').createServer(app);
const io = require('socket.io')(server);

const fs = require("fs");
const { isObject, assign } = require('lodash');

// Local vars
const foldir = process.cwd() + "/public";
let helperAtStartup = false 

//initialse local folder
if (!fs.existsSync("./trees")){
  fs.mkdirSync("./trees");
}

// Master keywords
let masterKeywords = { //includes
  createObjectK: 'n', // new
  addToObjectK: 'a', // add
  setActiveObjectK: 's', //set
  listObjectsK: 'l', //list
  navigateObject: 'ss', //set subkey as active
  getTreeStructureK: 'what' //
}

let masterKeywordsHelper = {
  createObjectK: ['create an object: \''+ masterKeywords.createObjectK + ' objname\''], // new
  addToObjectK: ['add property to existing object: \''+ masterKeywords.addToObjectK+ '\''],
  setActiveObjectK: ['set active object: \''+ masterKeywords.setActiveObjectK + ' objname\''], //set
  listObjectsK: ['list object in tree folder: \''+ masterKeywords.listObjectsK + '\''], //list
  navigateObject: ['set sub key as active: (unfinished method) \''+ masterKeywords.navigateObject + '\''], //list
  getTreeStructureK: ['print tree \''+ masterKeywords.getTreeStructureK + '\''] //list
}

// Data structure


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

// Method to read Tree architecture of Object
getTreeStructure = (o,s)=>!o|[o]==o||Object.keys(o).map( k => getTreeStructure(o[k],k=s?s+['.'+k]:k,io.emit("channel2", k)   ))

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
      if (helperAtStartup == true) {
      io.emit("channel1", "help: existing methods: ")
      showarr(masterKeywordsHelper, 2)
      }

      // Store json 
      function store(arg) {
       fs.writeFileSync(process.cwd() + "/trees/" + activeTree._.name + ".json", JSON.stringify(activeTree, null, 2), 'utf8')
       io.emit("channel1", "object modified and saved, added key " + arg)
}

        socket.on('channel1', (msg) => {

          // printing self to the browser
          io.emit('channel1', msg);

          // secret methods
          if (msg === "chebka") {
            io.emit('channel1', "tan tan tan!")
          }

          // Core methods
          try {

            ////// Retrieve arguments given at each request and store it in arg variable
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
          ////// Data Structure
          const dataStruct = {
            '_': {
              'name': arg[1],
               createdTime: new Date()
               }
          }

          ////// Create new obj using keyword routine
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

             ////// Actual create object method
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

            ////// Prevent general misuse of masterkeywords 
          if(arg[0] != masterKeywords.listObjectsK && arg.length === 1 && arg[0] != masterKeywords.getTreeStructureK)  {
            if (Object.values(masterKeywords).includes(arg[0]) == true && arg.length == 1
             || Object.values(masterKeywords).includes(arg[0]) == true && arg.length >= 3
             || Object.values(masterKeywords).includes(arg[0]) == true && arg.length >= 3)  {

              io.emit('channel1', "invalid syntax: " + arg[0] + " method needs 1 arg")
              console.error("invalid syntax: " + arg[0] + " method needs arg")
            }
          }

          ////// master method: add property to existing object // branch level 1
          if(arg[0] == masterKeywords.addToObjectK && arg.length === 2 )  {
            try {
              if (typeof activeTree != undefined)  {
                if (treePath.length == 0) {
                  activeTree[arg[1]] = dataStruct
                  store(arg[1])
                } else {
                  dataStructStr = JSON.stringify(dataStruct, null, 2)
                  console.log(eval("activeTree" + branchage + "['" + arg[1] + "'] = " + dataStructStr))
                  eval("activeTree" + branchage + "['" + arg[1] + "'] = " + dataStructStr)
                  store(arg[1])
                }
                
              }
          } catch(e) {
            if (e.name == "ReferenceError") {
              if (e.message == "activeTree is not defined")
              io.emit("channel1", "can't modify as no active obj is set")
            }
              else {
            console.log(e)}
            
          }
          if (typeof activeBranch === 'undefined' && typeof activeTree === 'undefined') {
            console.log("no branch no chocolate")
          }
          }

          ////// Master method: list existing objects
          if(arg[0] == masterKeywords.listObjectsK && arg.length === 1 )  {
            var files = fs.readdirSync(process.cwd() + "/trees")
            showarr(files)
            if (files.length == 0) {
              io.emit("channel1", "no object yet, try creating one using \'" + masterKeywords.createObjectK + "\' master keyword")
            }
            console.log(files)
          }

          ////// Master method: print tree architecture
          if(arg[0] == masterKeywords.getTreeStructureK && arg.length === 1 && typeof activeTree != 'undefined')  {
            getTreeStructure(activeTree)
          }
         

          ////// Treat with undefined objects


          ////// Master method: set active object // once method
          if(arg[0] == masterKeywords.setActiveObjectK && arg.length === 2 )  {
            fs.access(process.cwd() + "\\trees/" + arg[1] + ".json", fs.constants.F_OK, (e) => {
              try {
                if(e == null) {
                  activeTree = JSON.parse(fs.readFileSync(process.cwd() + "\\trees\\" + arg[1] + ".json"))
                  treePath = []
                  branchage = ""
                  io.emit("channel1", "object " + arg[1] + " is now active")
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
         ////// Set subobject as active branch  // ss method
         if(arg[0] == masterKeywords.navigateObject && arg.length === 2 )  {
           if (typeof activeTree === 'undefined') {
             io.emit("channel1", "Can\'t navigate when object is not set")
             console.error("Can\'t navigate when object is not set")
           }
           if (true) { //obj.nom //obj.nom.nom 
              branchageOriginal = branchage
              branchage += "['" +arg[1]+ "']"
              if (typeof eval("activeTree" + branchage) == 'undefined') {
                let arglen = arg[1].length + 4
                branchage = branchage.substr(0, branchage.length - arglen)
                io.emit("channel1", "key doesnt exists")
             //  throw("Cant open non existing subkey")
            }
            if (typeof eval("activeTree" + branchage) != 'undefined')  {
              let branchName = eval("activeTree" + branchage)

            //  console.log(activeTree[])
              if(branchageOriginal != branchage) {
              io.emit("channel1", "Active branch is: "+ activeTree._.name + branchage)
              treePath.push(arg[1])
              console.log(treePath)
            }
            }

           }
         }

        /// Catch method for initial try:
          } catch(e) {console.error(e)}
        });
      });


server.listen(80);