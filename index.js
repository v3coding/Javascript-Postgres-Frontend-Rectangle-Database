const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});


const express = require('express');
const path = require('path');
const PORT = process.env.PORT || 5000;

//ADDED
var bodyParser = require('body-parser');
const e = require('express');
//

var app = express();

  app.use(express.static(path.join(__dirname, 'public')));
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'ejs');
  app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
  })); 
  app.use(express.urlencoded());
  //ADDED-2


//main address paths
app.get('/rectangles', async(req,res) => res.render('pages/rectangles'));
app.get('/indexapp', (req,res) => res.render('/public/viewRectangles'));

app.get('/', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM rectangles');
    const results = { 'results': (result) ? result.rows : null};
    res.render('pages/rectangles', results );
    client.release();
  } catch (err) {
    console.error(err);
    res.send("Error " + err);
  }
});


//VIEW RECTANGLE---------------------------------------

app.get('/rectangle', async (req,res) => {
try{

//connect to database and get data about rectangle to be viewed and pass to page to be rendered

const client = await pool.connect();
const queryResult = await client.query(`SELECT * FROM rectangles WHERE id = ${req.query.id}`);
const results = { 'results' : queryResult.rows[0] };
res.render('pages/rectangle', results);
client.release();

}

  catch(error)
  {
    console.error(error);
    res.send("Error " + error);
  }

});

//INSERT-----------------------------------------------------------------------
app.post('/', async (req, res)=> {
  try{

    //get data from input fields on page

 var inputId = req.body.id;   
 var inputName = req.body.name;
 var inputWidth = req.body.width;
 var inputHeight = req.body.height;
 var inputColor = req.body.color;
 var inputSentience = req.body.sentience;
 var inputMaxSpeed = req.body.maxspeed;
 var inputReligion = req.body.religion;

 if(inputId > Number.MAX_SAFE_INTEGER || inputId < 0 || inputWidth > Number.MAX_SAFE_INTEGER || inputWidth < 0 || inputHeight > Number.MAX_SAFE_INTEGER || inputHeight < 0 || inputMaxSpeed > Number.MAX_SAFE_INTEGER || inputMaxSpeed < 0){
  res.send("ERROR: The value of all numbers must be less than 9007199254740991 and greater than 0!");
 }

 //verify string is not too long for database field
 if(inputName.length > 25 || inputColor.length > 25 || inputSentience.length > 25 || inputReligion.length > 25){
  res.send("ERROR: The length of all text fields must be less 25 characters or less!");
 }

    //error if you don't enter an id because that is unique identifier required to do anything

 if(!req.body.id){
  console.log("it doesn't exist");
  res.send("ERROR: You must enter an ID");
 }

 //connect to database and see if id is a duplicate or if its available

 const client = await pool.connect();
 const existsQuery = await client.query(`SELECT EXISTS(SELECT FROM rectangles WHERE id = ${inputId})`);
 const existsQueryResult = {'existQueryResult' : existsQuery.rows[0].exists};
 var doesExist = 0;
 const existsQueryResultString = JSON.stringify(existsQueryResult);

 if(existsQueryResultString.includes('{"existQueryResult":true}')){
  doesExist = 1;
 }

 client.release();

 //errors for duplicate ID and incomplete form respectively

 if(doesExist){
  res.send("ERROR: This ID exists in the table already");
 }

 if(!req.body.id || !req.body.name || !req.body.width || !req.body.height || !req.body.color || !req.body.sentience || !req.body.maxspeed || !req.body.religion ){
  res.send("ERROR: Please complete the form in full if adding a rectangle!");
 }
 else{

   //if the id is unique and the form is filled then we go ahead and insert the rectangle into the database

  if(!(doesExist)){
  const client = await pool.connect();
  const rectanglesAddRectangleQuery = await client.query(`INSERT INTO rectangles (id, name, width, height, color, sentience, maxspeed, religion) VALUES (${inputId}, '${inputName}', ${inputWidth}, ${inputHeight}, '${inputColor}', '${inputSentience}', ${inputMaxSpeed}, '${inputReligion}')`,);
  res.redirect('/');
  client.release();
  }
 }

  }
  catch(error)
  {
    console.error(error);
    res.send("Error " + error);
  }
});

//DELETE----------------------------------------------------------------------

app.post('/delete', async (req,res)=>{

  //get id to be removed from the input form

  var idRemove = req.body.id;
  var inputId = req.body.id;

  if(inputId > Number.MAX_SAFE_INTEGER || inputId < 0 || idRemove > Number.MAX_SAFE_INTEGER || idRemove < 0){
    res.send("ERROR: The value of all numbers must be less than 9007199254740991 and greater than 0!");
  }
  

  //error for if the id does not exist in the database

  if(!req.body.id){
    res.send("ERROR: You must enter an ID");
  }

const client = await pool.connect();

const existsQuery = await client.query(`SELECT EXISTS(SELECT FROM rectangles WHERE id = ${inputId})`);
const existsQueryResult = {'existQueryResult' : existsQuery.rows[0].exists};
var doesExist = 0;
const existsQueryResultString = JSON.stringify(existsQueryResult);

if(existsQueryResultString.includes('{"existQueryResult":true}')){
 doesExist = 1;
}

if(!doesExist){
  res.send("ERROR: ID does not exist so cannot delete!");
  client.release();
}


    //if the id does exist, then delete it from the database

  const deleteQuery = await client.query(`DELETE FROM rectangles WHERE id = ${idRemove};`);
  res.redirect('/');
  client.release();

});


//UPDATE-----------------------------------------------------------------------------

app.post('/update', async (req, res)=> {
  
  try{

    //get data to be updated from the input form

    var inputId = req.body.id;   
    var inputName = req.body.name;
    var inputWidth = req.body.width;
    var inputHeight = req.body.height;
    var inputColor = req.body.color;
    var inputSentience = req.body.sentience;
    var inputMaxSpeed = req.body.maxspeed;
    var inputReligion = req.body.religion;

    if(inputId > Number.MAX_SAFE_INTEGER || inputId < 0 || inputWidth > Number.MAX_SAFE_INTEGER || inputWidth < 0 || inputHeight > Number.MAX_SAFE_INTEGER || inputHeight < 0 || inputMaxSpeed > Number.MAX_SAFE_INTEGER || inputMaxSpeed < 0){
      res.send("ERROR: The value of all numbers must be less than 9007199254740991 and greater than 0!");
     }
    
    //verify string is not too long for database field
    if(inputName.length > 25 || inputColor.length > 25 || inputSentience.length > 25 || inputReligion.length > 25){
      res.send("ERROR: The length of all text fields must be less 25 characters or less!");
    }

 const client = await pool.connect();

//if no unique identifier we cant process anything so throw error for no id

 if(!req.body.id){
  res.send("ERROR: You must enter an ID");
  client.release();
}

//check if rectangle to be updated exists and throw error if it does not

const existsQuery = await client.query(`SELECT EXISTS(SELECT FROM rectangles WHERE id = ${inputId})`);
const existsQueryResult = {'existQueryResult' : existsQuery.rows[0].exists};
var doesExist = 0;
const existsQueryResultString = JSON.stringify(existsQueryResult);

if(existsQueryResultString.includes('{"existQueryResult":true}')){
 doesExist = 1;
}

if(!doesExist){
  res.send("ERROR: ID does not exist so cannot update!");
  client.release();
}


//update whichever fields have been filled out in the form (consecutive queries is more intense processing wise but easier than coding 7! individual if statements)
//however if required this could be made more efficient processing wise by investing more coding time to fix it and make if statements with bitwise operators for
//every combination

if(req.body.name && req.body.id){
  const rectanglesUpdateRectangleQuery = await client.query(`UPDATE rectangles SET name = '${inputName}' WHERE id = ${inputId};`);
}

if(req.body.width && req.body.id){
  const rectanglesUpdateRectangleQuery = await client.query(`UPDATE rectangles SET width = ${inputWidth} WHERE id = ${inputId};`);
}

if(req.body.height && req.body.id){
  const rectanglesUpdateRectangleQuery = await client.query(`UPDATE rectangles SET height = ${inputHeight} WHERE id = ${inputId};`);
}

if(req.body.color && req.body.id){
  const rectanglesUpdateRectangleQuery = await client.query(`UPDATE rectangles SET color = '${inputColor}' WHERE id = ${inputId};`);
}

if(req.body.sentience && req.body.id){
  const rectanglesUpdateRectangleQuery = await client.query(`UPDATE rectangles SET  sentience = '${inputSentience}' WHERE id = ${inputId};`);
}

if(req.body.maxspeed && req.body.id){
  const rectanglesUpdateRectangleQuery = await client.query(`UPDATE rectangles SET maxspeed = '${inputMaxSpeed}' WHERE id = ${inputId};`);
}

if(req.body.religion && req.body.id){
  const rectanglesUpdateRectangleQuery = await client.query(`UPDATE rectangles SET religion = '${inputReligion}' WHERE id = ${inputId};`);
}

client.release();

  }
  catch(error)
  {
    console.error(error);
    res.send("Error " + error);
  }

  res.redirect('/');

});

//--------------------------------------------------------------------------------

module.exports = app;
  
app.listen(PORT, () => console.log(`Listening on ${ PORT }`));
