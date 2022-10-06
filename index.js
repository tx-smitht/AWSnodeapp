// Copy of Final project, thomas smith section 002
// installed things: init, express, ejs, knex, pg, nodemon
const express = require("express"); // require express
const app = express(); // create app as an express object
const path = require("path"); // require path
const port = 5000;
app.use(express.static("public"));

// connect to database postgres
const knex = require("knex")({
    client: "pg",
    connection: {
      host: "drink-db-aws.cw82rnokcj7v.us-west-1.rds.amazonaws.com",
      user: "postgres",
      password: "password",
      database: "postgres",
      port: 5432,
    }, 
    pool: { min: 0, max: 7 }
  });

app.use(express.urlencoded({ extended: true })); // make it so we can read from body
app.set("view engine", "ejs"); // make ejs the view engine and make it look for a views folder for the .ejs files



// home page
app.get("/", (req,res) => {
    res.render("home")
});

// take to the API page
app.get("/apipage", (req,res) => {
    res.render("apipage")
})

// take to the azure ML page this time
app.get("/azureml", (req,res) => {
  res.render("azureml")
})

// crud ops

// create
// first, direct to the add drink page to collect the drink information
    app.get("/addDrink", (req, res) => {
        res.render("addDrink");
    });
 
  // then, when the form is submitted, send to the add drink post, which adds the info collected to the database and redirects to conf page
 app.post("/addDrink", (req, res) => {
   
        knex("drink")
    .insert({
      drink_name: req.body.drink_name,
      drink_ingredients: req.body.drink_ingredients,
      drink_price: parseFloat(req.body.drink_price),
      drink_ranking: parseInt(req.body.drink_ranking),
      drink_sweetness: req.body.drink_sweetness,
      tasted: req.body.tasted ? "Y" : "N"
    })
    .then((drinks) => {
        drinkOps = " added";
      res.redirect("/confPage");
    });
});



//confpage route with dynamic message
let drinkOps = "" // create global drinkOps variable
app.get("/confPage", (req,res) => {
    res.render("confPage", {drinkOps:drinkOps});
    // set the indicator of drink operation to nothing again. 
});



// read
// take to display page
app.get("/postgres", (req, res) => {
    knex
      .select()
      .from("drink")  // query is made here
      .then((drinks) => {
        res.render("displayDrinks", { drinks: drinks}); //query is passed here to the dynamic ejs page
      })
      .catch((err) => {
        // catch can catch error and display error so that source code doesn't crash
        console.log(err);
        res.status(500).json({ err });
      });
  });


  //sort data
// ordering
        // order ascending
        app.get("/sortRanking", (req, res) => {
               knex("drink")
            .orderBy("drink_ranking", "asc")
            .then(drinks => {
                res.render("displayDrinks", {drinks:drinks});
            }); 
        });

        // order ascending
        app.get("/sortDesc", (req, res) => {
            knex("drink")
         .orderBy("drink_name", "asc")
         .then(drinks => {
             res.render("displayDrinks", {drinks:drinks});
         }); 
     });






  // update/edit data

  // redirect to page that displays current info and makes it modifyable
  app.get("/editDrink/:drink_id", (req, res) => {
    knex
        .select() // need to include the primary key (drink_id in this case), but dont include in form!
        .from("drink")
        .where("drink_id", req.params.drink_id)
        .then((drinks) => {
        res.render("editDrink", { drinks: drinks });
        })
        .catch((err) => {
        console.log(err);
        res.status(500).json({ err });
        });
});

    // once the data has been modified, save it to the database using update. redirect to conf page
    app.post("/editDrink", (req, res) => {
        // basically is saying find record where the private key is the same as the hidden private key from the search (now part of the req.body cause its a post)
        
        knex("drink")
            .where("drink_id", BigInt(req.body.drink_id)) // make sure to bigint so it matches with ID
            .update({
                drink_name: req.body.drink_name,
                drink_ingredients: req.body.drink_ingredients,
                drink_price: parseFloat(req.body.drink_price),
                drink_ranking: parseInt(req.body.drink_ranking),
                drink_sweetness: req.body.drink_sweetness,
                tasted: req.body.tasted ? "Y" : "N"})
            .then((drink) => {
                drinkOps = " updated" // change dynamic conf message
            res.redirect("/confPage");
            })
            .catch((err) => {
            console.log(err);
            res.status(500).json({ err });
            });
    });

// delete route
// delete one record and send to conf route
app.post("/deleteDrink/:drink_id", (req, res) => {
    
      knex("drink")
        .where("drink_id", req.params.drink_id)
        .del()
        .then((drinks) => { // drinks is array of objects
          drinkOps = " deleted"; // change dynamic conf message
          res.redirect("/confPage");
        })
        .catch((err) => {
          console.log(err);
          res.status(500).json({ err });
        });
  });


app.listen(port, () => console.log("Website is started")); // listen start
