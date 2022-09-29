const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");
const _ = require("lodash")


mongoose.connect("mongodb+srv://admin-samuel:Test123@cluster0.ydflds4.mongodb.net/todolistDB");

const itemSchema = new mongoose.Schema({
  name: String
})

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
  name: "today's task"
});

const item2 = new Item({
  name: "tomorrow's Task"
});

const item3 = new Item({
  name: "next weeks task"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemSchema]
};

const List = mongoose.model("List", listSchema);




app.set("view engine", "ejs");

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function(req, res) {
  console.log("server running on port 3000");
});

app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems){
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function(err) {
        err ? console.log(err) : console.log("successfully added the default items")
      });
      res.redirect("/");
    } else {
      res.render("lists", { listTitle: "Today", newItems: foundItems
      });
    }
  });

  let day = date.getDate();


});
app.use(express.static("public"));
app.use(bodyParser.urlencoded({
  extended: true
}));

app.get("/:customListName", function(req, res) {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, function(err, foundList) {
    if(!err) {
      if(!foundList) {
        // creating a new list
        const list = new List({
          name: customListName,
          items: defaultItems
          });
          list.save();
          res.redirect("/" + customListName);
      } else {
        //show existing list

        res.render("lists", {listTitle: foundList.name, newItems: foundList.items});
      }
    }
  });


});

app.post("/", function(req, res) {
  const itemName = req.body.newItem;

  const listName = req.body.list;
  const item = new Item({
    name: itemName
  });
  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, function(err, foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }

});

app.post("/delete", function(req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId, function(err) {
      err ? console.log(err) : console.log("successfully deleted");
    });
    res.redirect("/");
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
      if (!err) {
        res.redirect("/" + listName);
      }
    });
  }
});
