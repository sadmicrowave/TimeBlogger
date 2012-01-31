// This file contains functions for Database control
//
//
//
//
// the begining of it all... setting up the db object and doing the first transaction to create the table
function log(s){
    console.log(s);
}

// function to set the current time when it is called
function setCurrTime(){
    var time = new Date();
    return time;
}

function phoneReady(){
    // **** first, open the database ****
    dbShell = window.openDatabase("TimeBlogger", 1, "TimeBlogger", 1000000);
    //and run another function if the setup is successful (displayEntries)
    dbShell.transaction(setupDBTable, errorHandler, getDBProjectEntries)
}

// setup the db
function setupDBTable(tx){
    tx.executeSql("DROP TABLE IF EXISTS tbProjects");
    tx.executeSql("DROP TABLE IF EXISTS tbTasks");
    log("All tables dropped!");
    // this statement creates the table named 'tb'. We use 'IF NOT EXISTS' so that this statement
    // is safe to run again and again
    // setup project table
    tx.executeSql("CREATE TABLE IF NOT EXISTS tbProjects(projectId INTEGER PRIMARY KEY AUTOINCREMENT, projectName TEXT, created DATE)");
    log("Project Table Setup successfully");
    // setup tasks table
    /*
    tx.executeSQL("CREATE TABLE IF NOT EXISTS tbTasks(taskId INTEGER PRIMARY KEY AUTOINCREMENT, projectId INTEGER, taskName TEXT, taskTime TEXT, taskDetails TEXT, taskCreated DATE, taskUpdated DATE)");
    log("Tasks Table Setup successfully");
    */
    
    // test fill of the DB
    // for now the date and time is hardcoded... this will need to be changed to generate the date & time when task is created
    // javascript to calculate date/time
    
    tx.executeSql("INSERT INTO tbProjects(projectName, created) VALUES (?,?)",["Project 1", setCurrTime()]);
    tx.executeSql("INSERT INTO tbProjects(projectName, created) VALUES (?,?)",["Project 2", setCurrTime()]);
}

// Database query function
function getDBProjectEntries(){
    // embedding the function with the transaction call, if successful run 'renderDBEntries,
    // if result is bad run errorHandler, if the whole transaction fails run erroHandler
    // executeSQL('THE SQL STATEMENT', empty array, successFunc, failFunc)
    // **** Want to order the SQL results by something? date, project name?
    log("collecting DB Project entries...");
    dbShell.transaction(function(tx){
                        tx.executeSql("SELECT projectId, projectName FROM tbProjects", [], renderProjectDBEntries, errorHandler)}, errorHandler);
    log("got DB entries!...");
}


// Database Task query function
function getDBTaskEntries(id){
    // embedding the function with the transaction call, if successful run 'renderDBEntries,
    // if result is bad run errorHandler, if the whole transaction fails run erroHandler
    // executeSQL('THE SQL STATEMENT', empty array, successFunc, failFunc)
    // **** Want to order the SQL results by something? date, project name?
/*
    log("collecting DB Task entries...");
    dbShell.transaction(function(tx){
                        tx.executeSql("SELECT taskName, FROM tb", [], renderProjectDBEntries, errorHandler)}, errorHandler);
    log("got DB entries!...");
*/
}

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
            // ***** testing line to see what is coming out of DB ********
            // store the output in the html variable
            // results.rows.item(i).projectID will give us the projectID to tie into the tasks table
            // results.rows.item(i).projectName will give us the projectname
            // on the next page after clicking the project name
            // this is the html that shows for the projects
            // **** jquery statement to pass relevant peices to the right 'page' needs to be added
            $("#firstPage ul").append("<li class='arrow'><a class='item' href='#detailView' id='"+results.rows.item(i).projectId+"' onClick='getDBTaskEntries("+results.rows.item(i).projectId+");'>&nbsp;<div class='delete-icon'></div>&nbsp;"+results.rows.item(i).projectName+"</a><a class='delete-button button redButton' href='#'>Delete</a></li>");
        }

    }
    
}
/*
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
*/
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

