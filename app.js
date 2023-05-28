const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");
const _ = require("lodash");

const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


mongoose.connect("mongodb+srv://admin-haris:Test123@cluster0.wdvdphn.mongodb.net/todolistDB", {useNewUrlParser: true},);

const itemsSchema = {
  name: String,
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to my todolist."
});

const item2 = new Item({
  name: "Hti the + button to add a new item"
});

const item3 = new Item({
  name: "Hit this to delete an item."
})

const defaultItem = [item1, item2, item3];


const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

const day = date.getDay();

app.get("/", function(req, res){
    
    Item.find({})
      .then((results) => {
        // Handle the query results

        
        if( results.length === 0){
          Item.insertMany(defaultItem)
          .then(docs => {
              console.log('Default Documents inserted successfully');
            })
            .catch(error => {
              console.error('Error inserting documents:', error);
            });
            res.redirect("/");
        } else {
          res.render("list", {listTitle: day, newListItems: results});
        }

      })
      .catch((error) => {
        // Handle any errors that occurred during the query
        console.error(error);
      });

});

app.get("/:customListName", function(req, res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName})
  .then((exist) => {
    if(exist){
      //Show an existing list
      res.render("List", {listTitle: exist.name, newListItems: exist.items})
    } else{
      // Creat a new list
      const list = new List({
        name: customListName,
        items: defaultItem
      });
      list.save();
      res.redirect("/" + customListName);
    }
  });
    
});


app.post("/", function(req, res){

    const itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item({
      name: itemName
    });


if(listName === day){
  item.save();
  res.redirect("/");
} else{
  List.findOne({name: listName})
  .then((foundList) =>{
    foundList.items.push(item);
    foundList.save();
    res.redirect("/" + listName);
  });
}



    
});

app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === day){
    Item.findByIdAndRemove(checkedItemId)
  .then((removedDocument) => {
    console.log(removedDocument);
    res.redirect("/");
  })
  .catch((error) => {
    console.log(error);
  });
  
  } else{
    List.findOneAndUpdate(
      {name: listName},
      {$pull:{items:{_id: checkedItemId}}},
    )
    .then(updatedList => {
      res.redirect("/" + listName);
    })
    .catch(error => {
      console.log(error);
    });
  }

});


app.get("/work", function(req, res){
    res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
    res.render("about");
});


app.post("/work", function(req, res){
    let item = req.body.newItem;
    workItems.push(item);
    res.redirect("/work");
});






app.listen(3000, function(){
    console.log("Server started on port 3000");
});