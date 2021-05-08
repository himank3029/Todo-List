const express= require("express");
const bodyParser=require("body-parser");
const mongoose=require("mongoose");
const path = require('path');
const date=require(__dirname + "/views/date.js");
const _=require("lodash");


const app=express();

app.use(bodyParser.urlencoded({extended:true}));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine','ejs');
app.use(express.static('public'));

mongoose.connect("mongodb+srv://himank3029:himank@cluster0.c1jqd.mongodb.net/todolistDB",{useNewUrlParser: true, useUnifiedTopology: true});


 const itemSchema =mongoose.Schema({
     name:String
 });
 const Item =mongoose.model("item",itemSchema);

 const listSchema = mongoose.Schema({
     name: String,
     items:[itemSchema]
 });

 const List=mongoose.model("List",listSchema);

 const item1= new Item({
     name:"Welcome to todolist:"
 });
 const item2= new Item({
    name:"Hit + button to add a new item."
});
const item3= new Item({
    name:"<-- Hit this to delete item"
});
const defaultItem=[item1,item2,item3];




app.get("/",function(req,res){
    
    Item.find({},function(err,founditems){

        if(founditems.length===0){
            Item.insertMany(defaultItem,function(err){
                if(err){
                    console.log(err);
                }else {
                    console.log("data inserted successfuly");
                }
            });
            res.redirect("/");
        }
        
        else{
       
        res.render("list",{listTitle :"Today",newListitems:founditems});
        }

    });
      
});

app.post("/",function(req,res){
    const itemName = req.body.newItem;
    const listName=req.body.list;

    
       const item=new Item({
           name:itemName
       });


       if(listName === "Today"){
        item.save();
        res.redirect("/");
       }else{
           List.findOne({name:listName},function(err,foundList){
               foundList.items.push(item);
               foundList.save();
               res.redirect("/"+listName);
           });
       }
      
});


app.post("/delete",function(req,res){
   const checkedItemId=req.body.checkbox; 
   const listName=req.body.listName;
    
   if(listName==="Today"){
    Item.findByIdAndRemove(checkedItemId,function(err){
        if(err){
            console.log(err);
        }
        else{
            console.log("deleted successfully");
            res.redirect("/");
        }
    });
   }else{
       List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},function(err,foundItem){
           if(!err){
               res.redirect("/"+listName);
           }
       });
   }

   
});

app.get("/:customListName",function(req,res){
      const customListName= _.capitalize(req.params.customListName);
    List.findOne({name:customListName},function(err,foundList){
        if(!err){

            if(!foundList){
                const list=new List({
                    name:customListName,
                    items:defaultItem
                });
                list.save(); 
               res.redirect("/"+customListName);
            }else{
                res.render("list",{listTitle :foundList.name,newListitems:foundList.items});
            }
        }
    });


});

app.get("/about",function(req,res){
    
  res.render("about");
});

let port = process.env.PORT;
if(port== null|| port==""){
port =3000;
}



app.listen(port,function(){
    console.log("server started successfully");
});



// username himank_3029
// password himank3029