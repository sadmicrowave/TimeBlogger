// This file contains functions for Database control
//
//
//
//
// the begining of it all... setting up the db object and doing the first transaction to create the table
function log(s){
    console.log(s);
}

function phoneReady(){
    // **** first, open the database ****
    dbShell = window.openDatabase("TimeBlogger", 1, "TimeBlogger", 1000000);
    //and run another function if the setup is successful (displayEntries)
    dbShell.transaction(setupDBTable, errorHandler, getDBProjectEntries)
}

// setup the db
function setupDBTable(tx){
    tx.executeSql("DROP TABLE IF EXISTS tb");
        // this statement creates the table named 'tb'.  We use 'IF NOT EXISTS' so that this statement
        // is safe to run again and again
        // **** the db needs the following fields for production:
        // **** dTime - date/time (can we use epoch to cover both in one field?)
        // **** projName - project name
        // **** taskName - task name
        // **** taskText - information about job performed
        // **** amtTime - derived time doing task (i.e., 1.5 hrs)
     tx.executeSql("CREATE TABLE IF NOT EXISTS tb(id INTEGER PRIMARY KEY, projectName, taskName, taskText)");    
     log("DB Setup successfully");
        
        // test fill of the DB
        tx.executeSql('INSERT INTO tb (id, projectName, taskName, taskText) VALUES (1, "Project 1", "Task 1", "I did some stuff that was awesome!")');
        tx.executeSql('INSERT INTO tb (id, projectName, taskName, taskText) VALUES (2, "Project 2", "Task 2", "I did some stuff that was part of Project 2 but was somewhat boring!")');
}

// Database query function    
function getDBProjectEntries(){
        // embedding the function with the transaction call, if successful run 'renderDBEntries,
        // if result is bad run errorHandler, if the whole transaction fails run erroHandler
        // executeSQL('THE SQL STATEMENT', empty array, successFunc, failFunc)
        // **** Want to order the SQL results by something?  date, project name? 
     log("collecting DB Project entries...");
     dbShell.transaction(function(tx){
                         tx.executeSql("SELECT id, projectName FROM tb", [], renderProjectDBEntries, errorHandler)}, errorHandler);
     log("got DB entries!...");
}

/*
// Database query function    
function getDBTaskEntries(){
        // embedding the function with the transaction call, if successful run 'renderDBEntries,
        // if result is bad run errorHandler, if the whole transaction fails run erroHandler
        // executeSQL('THE SQL STATEMENT', empty array, successFunc, failFunc)
        // **** Want to order the SQL results by something?  date, project name? 
     log("collecting DB Task entries...");
     dbShell.transaction(function(tx){
     tx.executeSql("SELECT taskName, FROM tb", [], renderProjectDBEntries, errorHandler)}, errorHandler);
     log("got DB entries!...");
}
*/

// Database function to fetch the DB entries and render them in HTML format
function renderProjectDBEntries(tx, results){
    log("rendering db entries...");
     if(results.rows.length == 0){
        // **** needs be to changed to manipulate the DOM
        // **** ideally, we would have an <li> entry to say the message below
         $("#firstPage").html("<li>You have no projects</li>");
      } else {
        // html is where we are storing the rendered html
        // for loop to run through the db query results
        for(var i=0; i<results.rows.length; i++){
             // store the output in the html variable
             // results.rows.item(i).projectName will give us the projectname
             // results.rows.item(i).taskName will give us the project .... which should be shown
             //   on the next page after clicking the project name
             // this is the html that shows for the projects
             // **** jquery statement to pass relevant peices to the right 'page' needs to be added
            $("#firstPage ul").append("<li class='arrow' id="+results.rows.item(i).projectName+"><a href='#detailView'>"+results.rows.item(i).projectName+"</a><a class='delete-button button redButton' href='#'>Delete</a></li>");
             // we need to also get the taskName and taskText that fall under the project selected
         }
         
          
         // .listview is pretty cool... jquery mobile
         //$("#firstPage").listview("refresh"); <---- what does listview do?  is that only a mobile thing?
        }
    
    }
    
// This function writes the relevant fields to the database that we have built    
function writeToDatabase(projectName, taskName, taskText){
    // notice how executeSQL is within the transaction function ... transaction(funcToRun, errorFunc, successFunc)
    dbShell.transaction(function(tx){tx.executeSQL("INSERT INTO tb (projectName, taskName, taskText) VALUES ("+projectName+","+taskName+","+taskText+")");}, errorHandler);
    alert("Record Inserted Successfully!");
    alert("DB Write Unsuccessful: "+e);
}

// Get the data from form fields
function getFormData(){
    // this targets the form fields specific to form1
    // **** probably want to do input validation here before passing to writeToDatabase
    var pName = document.form1.pName.value.trim();
    var tName = document.form1.tName.value.trim();
    var tText = document.form1.tText.value.trim();
        
    // try writing the fields to the DB
    writeToDatabase(pName, tName, tText);
        
    // clear the form field values
    document.form1.reset();
}
    
//Transaction Error Processing
function errorHandler(err){
    //alert("Error processing SQL: "+err);
    //this is a descriptive error handler... use at your own risk... take out before go-live
    for(e in err){
        alert("Error: "+err[e]);
    }
}
                            
//Transaction Success
function successCB(){
    // test alert to make sure DB is made
    alert("DB Trans Success!");
    dbShell.transaction(writeToDatabase, errorHandler);
}
      
function init(){
    document.addEventListener("deviceready", phoneReady, false);
}

