//to separate terminal code on save to make readability easier
console.log("\n","\n","---REFRESHED---", "\n","\n",)


// FIRST THINGS TO DO
  //1. CHANGE NAME in "package.json to match file name"
  //2. ADD DESCRIPTION if nescessary
  //3. run "NPM i" in the TERMINAL to import middlewares 


//Database
/*
CREATE TABLE books(
id SERIAL PRIMARY KEY UNIQUE NOT NULL,
title varchar(255),
author varchar(255),
key_value varchar(25) UNIQUE NOT NULL,
category varchar(15),
rating varchar(1),
date_complete date,
notes text
);
*/

//import npm packages

//this is for hosting the website on render
import dotenv from "dotenv"

//regular backend middleware
import express from "express";
import bodyParser from "body-parser";

/* this would be for a local database
import pg from "pg";
*/

//set constants for repeated use
const app = express();
const port = 3001;

//set body parser middleware path
app.use(bodyParser.urlencoded({ extended: true }));
//Serve static content for the app from the "public" directory
app.use(express.static("public"));


//function to import database 
import pg from "pg";


const { Pool } = pg;
const items_pool = new Pool({
    connectionString: process.env.db_conn_link,
    ssl: {
        rejectUnauthorized: false
    }
});

const db = items_pool;


//use dotenv to set up the environment file
dotenv.config();

/* code for using local postgres database
//set database credentials
const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "book_notes", //update this info
  password: "P05tB7ad3$",
  port: 5433,
});

//connect to database
db.connect();
*/


//variable to store the add/edit book
let upsert_book_key = 0;

//update book array
async function book_collect_update(){
  const books_info = await db.query(
    "SELECT * FROM books ORDER BY id"
  );

  return books_info.rows;
}

//update completed book array
async function book_category_update(category){
  const books_info = await db.query(
    "SELECT * FROM books WHERE category = $1 ",
    [category]
  );


  return books_info.rows;
}

//hero section book random book selection
async function hero_random_books(hero_books_amt, book_collect, book_collect_length){
  let random_books = [];
  let random_select_numbers = [];

  if (upsert_book_key !== 0){
    const upsert_book = await db.query(
      "SELECT * FROM books WHERE key_value = $1",
      [upsert_book_key]
    );
      
    console.log("upsert book: ", upsert_book.rows[0].id);
    random_books.push(upsert_book.rows[0]);
    random_select_numbers.push(upsert_book.rows[0].id);
    console.log("upsert random_select_numbers: ", random_select_numbers);
  }

  //array to store random generated numbers
  while(random_books.length < hero_books_amt){
    let random_select = Math.floor(Math.random()*book_collect_length); 
    random_select = book_collect[random_select].id;
    if (random_select_numbers.includes(random_select) === false && random_select !== 0){
      random_select_numbers.push(random_select);
      const selected_book_id = await db.query(
        "SELECT * FROM books WHERE id = $1",
        [random_select]
      );
      random_books.push(selected_book_id.rows[0]);
    };
  };
    console.log("filled random_select_numbers: ", random_select_numbers);
    console.log("filled random books array: ", random_books.map(value => value.id));
  return random_books            
}

//default route
app.get("/", async(req, res) =>{ 
  let book_collect = await book_collect_update();
  let completed_books_collect = await book_category_update("completed");
  let current_books_collect = await book_category_update("current");
  let future_books_collect = await book_category_update("future");
  
  //set variable for hero display books
  let hero_books_amt
  if(book_collect.length < 8){
    hero_books_amt = book_collect.length;
  } else{
    hero_books_amt = 7; 
  };

  //run function for random book selection for hero section
  let hero_books = await hero_random_books(hero_books_amt, book_collect, book_collect.length);
  console.log("selected hero books: ", hero_books.map(value => value.id));
  
  console.log("book_collect ids: ", book_collect.map(value => value.id));

  try{
    res.render("index.ejs",{
    book_collect: book_collect,
    completed_books_collect: completed_books_collect,
    current_books_collect: current_books_collect,
    future_books_collect: future_books_collect,

    hero_books: hero_books,
    hero_books_amt: hero_books_amt,
    });  

  } catch (err){
    console.log(err);
  }

});

//new route
app.post("/new", async (req,res) => { 

  const book_title = req.body["new_book_title"];
  const book_author = req.body["new_book_author"];
  const key_value = req.body["new_key_value"];
  const book_categ  = req.body["new_book_categ"];
  let rating = req.body["new_rating"];
  const date = req.body["new_date"];
  let book_notes = req.body["new_book_notes"];

  console.log(
    "key_value: ", key_value, "\n",
    "book_categ: ", book_categ, "\n",
    "rating: ", rating, "\n",
    "date: ", date, "\n",
    "notes:", book_notes, "\n"
    )

    if(rating === undefined ){ rating=""};

  try{
    if(date === "" ){ 
      let new_book_data = await db.query(
        "INSERT INTO books(title, author, key_value, category, rating, notes) VALUES ($1, $2, $3, $4, $5, $6);",
        [book_title, book_author, key_value, book_categ, rating, book_notes]
        );
    }else {
      let new_book_data = await db.query(
        "INSERT INTO books(title, author, key_value, category, rating, date_complete, notes) VALUES ($1, $2, $3, $4, $5, $6, $7);",
        [book_title, book_author, key_value, book_categ, rating, date, book_notes]
        );
      };
  upsert_book_key = key_value;   
 
    res.redirect("/");
  } catch (err){
    console.log("BROKEN, here is why:", "\n", err, "\n");
    if (err.code === '23505'){
      console.log("success");
      res.redirect("/");
    }
    res.status(500);
  }

});


//edit route
app.post("/edit", async (req,res) => { 

  const key_value = req.body["edit_key_value"];
  const book_categ  = req.body["edit_book_categ"];
  let rating = req.body["edit_rating"];
  const date = req.body["edit_date"];
  let book_notes = req.body["edit_book_notes"];

  console.log(
    "key_value: ", key_value, "\n",
    "book_categ: ", book_categ, "\n",
    "rating: ", rating, "\n",
    "date: ", date, "\n",
    "notes:", book_notes, "\n"
    )

    if(rating === undefined ){ rating=""};

  try{
    if(date === "" ){ 
      let edit_book_data = await db.query(
        "UPDATE books SET  category = $1, rating = $2, notes = $3 WHERE key_value = $4;",
        [ book_categ, rating, book_notes, key_value]
        );
    }else {
      let edit_book_data = await db.query(
        "UPDATE books SET category = $1, rating = $2, date_complete = $3, notes = $4  WHERE key_value = $5;",
        [book_categ, rating, date, book_notes, key_value]
        );
      };
 
    upsert_book_key = key_value;

    res.redirect("/");
  } catch (err){
    console.log("BROKEN, here is why:", "\n", err, "\n");
    res.status(500);
  }

});

//delete route
app.post("/delete", async (req,res) => { 

  const key_value = req.body["delete_key_value"];

  console.log(
    "key_value: ", key_value, "\n",
    )

  try{  
      let delete_book_data = await db.query(
        "DELETE FROM books WHERE key_value = $1;",
        [key_value]
        );
    res.redirect("/");
  } catch (err){
    console.log("BROKEN, here is why:", "\n", err, "\n");
    res.status(500);
  }

});


//console log that the server is running
app.listen(port, () => {
  console.log(`Server running on port ${port}`, "\n");
});
