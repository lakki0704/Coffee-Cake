//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
// mongoose.connect("mongodb+srv://admin-Lakshmi:Lakshmi07@cluster0.lydrlcw.mongodb.net/todolistDB", { useNewUrlParser: true });


// const uriAtlas = "mongodb+srv://admin-Lakshmi:Lakshmi07@cluster0.lydrlcw.mongodb.net/?retryWrites=true";
// mongoose.connect(uriAtlas, { useNewUrlParser: true, dbName: "todolistDB" });

const url = "mongodb+srv://lakshmi:lakshmi123@cluster0.h7zrxl3.mongodb.net/todolistDB";

const connectionParams = {
    useNewUrlParser: true,
    useUnifiedTopology: true
}
mongoose.connect(url, connectionParams)
    .then(() => {
        console.log('Connected to the database ')
    })
    .catch((err) => {
        console.error(`Error connecting to the database. n${err}`);
    })

const itemsSchema = {
    name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
    name: "Welcome to Coffee&Cake"
});
const item2 = new Item({
    name: "Click add button to add new tasks"
});
const item3 = new Item({
    name: " <-- Hit this to delete your completed tasks"
});

const defaultItems = [item1, item2, item3];

//creating a new Schema 
const listSchema = {
    name: String,
    items: [itemsSchema]
}

//its moongose model (down)
const List = mongoose.model("List", listSchema)



app.get("/", function(req, res) {

    Item.find({}, function(err, foundItems) {
        if (foundItems.length === 0) {

            Item.insertMany(defaultItems, function(err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Success");
                }
            })
            res.redirect("/");

        } else {
            // console.log(foundItems);
            res.render("list", { listTitle: day, newListItems: foundItems });
        }
    });

    const day = date.getDate();
});


//custom lists name
app.get("/:customListName", function(req, res) {
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({ name: customListName }, function(err, foundList) {
        if (!err) {
            if (!foundList) {
                // console.log("Doesn't exists");
                //create a new list

                const list = new List({
                    name: customListName,
                    items: defaultItems
                });
                list.save();
                res.redirect("/" + customListName);

            } else {
                // console.log("Exists!");
                //show an existing list
                res.render("list", { listTitle: foundList.name, newListItems: foundList.items })
            }
        }
    })

});


//for deleting items
app.post("/delete", function(req, res) {
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;
    const day = date.getDate();

    if (listName == day) {

        Item.findByIdAndRemove(checkedItemId, function(err) {
            if (err) {
                console.log(err);
            } else {
                console.log("Successfully deleted ");
                res.redirect("/");
            }
        });
    } else {
        List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkedItemId } } }, function(err, foundList) {
            if (!err) {
                res.redirect("/" + listName);
            }
        });
    }


});



app.post("/", function(req, res) {
    const day = date.getDate();
    const itemName = req.body.newItem;
    const listName = req.body.list; //accessing list name
    const item = new Item({ //creating a new model
        name: itemName
    });

    if (listName === day) {
        item.save(); //once it is saved , redirect to home page 
        res.redirect("/");
    } else {
        List.findOne({
            name: listName
        }, function(err, foundList) {
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);

        });
    }
});

// app.get("/work", function(req, res) {
//     res.render("list", { listTitle: "Work List", newListItems: workItems });
// });

app.get("/home", function(req, res) {
    res.redirect("/home");
});

app.get("/work", function(req, res) {
    res.redirect("/work");
});

app.get("/others", function(req, res) {
    res.redirect("/others");
});


let port = process.env.PORT;
if (port == null || port == "") {
    port = 3000;
}


app.listen(port, function() {
    console.log("Server started on port 3000");
});