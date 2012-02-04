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

function toHHMMSS( seconds ){
    //convert seconds variable to HH:MM:SS
    sec_numb    = parseInt( seconds );
    var hours   = Math.floor(sec_numb / 3600);
    var minutes = Math.floor((sec_numb - (hours * 3600)) / 60);
    var seconds = sec_numb - (hours * 3600) - (minutes * 60);
    //add leading zero (0) if value is less than 10
    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    return hours+':'+minutes+':'+seconds;
}

function toSeconds( aTime ) {
    //convert text string HH:MM:SS to seconds variable
    return (parseInt(aTime[0])*60*60) + (parseInt(aTime[1])*60) + parseInt(aTime[2]);
}

function phoneReady(){
    // **** first, open the database ****
    dbShell = window.openDatabase("TimeBlogger", 1, "TimeBlogger", 1000000);
    //and run another function if the setup is successful (displayEntries)
    dbShell.transaction(setupDBTable, errorHandler, getDBProjectEntries);
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
    tx.executeSql("CREATE TABLE IF NOT EXISTS tbTasks(taskId INTEGER PRIMARY KEY AUTOINCREMENT, projectId INTEGER, taskName TEXT, taskTime INTEGER, taskDetails TEXT, taskCreated TEXT, taskUpdated TEXT)");
    log("Tasks Table Setup successfully");
    
    // test fill of the DB
    // for now the date and time is hardcoded... this will need to be changed to generate the date & time when task is created
    log("generating dummy data");
    tx.executeSql("INSERT INTO tbProjects(projectName, created) VALUES (?,?)",["Project 1", setCurrTime()]);
    tx.executeSql("INSERT INTO tbProjects(projectName, created) VALUES (?,?)",["Project 2", setCurrTime()]);
    tx.executeSql("INSERT INTO tbTasks(projectId, taskName, taskTime, taskDetails, taskCreated, taskUpdated) VALUES (?,?,?,?,?,?)",["1", "Mowed Lawn", "??", "Mowed the lawn next to the church", setCurrTime(), setCurrTime()]);
    tx.executeSql("INSERT INTO tbTasks(projectId, taskName, taskTime, taskDetails, taskCreated, taskUpdated) VALUES (?,?,?,?,?,?)",["1", "Trimmed Hedges", "??", "Trimmed the hedges of the bushes that were growing over my fence", setCurrTime(), setCurrTime()]);
    tx.executeSql("INSERT INTO tbTasks(projectId, taskName, taskTime, taskDetails, taskCreated, taskUpdated) VALUES (?,?,?,?,?,?)",["1", "Cleaned Garage", "??", "Cleaned the garage so I could fit the car in it", setCurrTime(), setCurrTime()]);
    tx.executeSql("INSERT INTO tbTasks(projectId, taskName, taskTime, taskDetails, taskCreated, taskUpdated) VALUES (?,?,?,?,?,?)",["2", "Cooked Dinner", "??", "Cooked some great turkey in the stove that we are having for dinner tomorrow", setCurrTime(), setCurrTime()]);
    tx.executeSql("INSERT INTO tbTasks(projectId, taskName, taskTime, taskDetails, taskCreated, taskUpdated) VALUES (?,?,?,?,?,?)",["2", "Payed Bills", "??", "Paid all those bills, those telephone bills, the auto-mo-bills.", setCurrTime(), setCurrTime()]);
    log("generated dummy data");
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


// Database Task query function to get the general task information (taskId, taskname, taskCreated)
function getDBTaskEntries(id){
    // embedding the function with the transaction call, if successful run 'renderDBEntries,
    // if result is bad run errorHandler, if the whole transaction fails run erroHandler
    // executeSQL('THE SQL STATEMENT', empty array, successFunc, failFunc)
    // **** Want to order the SQL results by something? date, project name?
    // **** Eventually will add a WHERE statement within the SQL, but just wanted to get the damn thing to work first ... 'WHERE projectId = id'
    log("collecting DB Task entries...");
    dbShell.transaction(function(tx){
                        tx.executeSql("SELECT taskId, taskName, taskCreated FROM tbTasks WHERE projectId='"+id+"'", [], renderTaskDBEntries, errorHandler)}, errorHandler);
    log("got DB entries!...");
}

// database call to get the specific task details that is selected (taskDetails)
function getDBDetailEntries(id){
    log("collecting Task Detail information...");
    dbShell.transaction(function(tx){
                        tx.executeSql("SELECT taskName, taskDetails, taskTime FROM tbTasks WHERE taskId='"+id+"'", [], renderTaskDetails, errorHandler)}, errorHandler);
    log("got Task Details!...");

}

// Database function to fetch the DB entries and render them in HTML format
function renderProjectDBEntries(tx, results){
    log("rendering db project entries...");
    if(results.rows.length == 0){
        // **** needs be to changed to manipulate the DOM
        // **** ideally, we would have an <li> entry to say the message below
        log("No entries to display");
    } else {
        // html is where we are storing the rendered html
        // for loop to run through the db query results
        var listitems = '';
        for(var i=0; i<results.rows.length; i++){
            var row = results.rows.item(i);
            // ***** testing line to see what is coming out of DB ********
            // store the output in the html variable
            // results.rows.item(i).projectID will give us the projectID to tie into the tasks table
            // results.rows.item(i).projectName will give us the projectname
            // on the next page after clicking the project name
            // this is the html that shows for the projects
            //create inner function to define/limit scope of row variable
            (function(pid, proj_name){
                listitems += "<li class='arrow project'><a class='item' href='#detailView' id='"+pid+"'>&nbsp;<div class='delete-icon'></div>&nbsp;"+proj_name+"</a><a class='delete-button button redButton' href='#'>Delete</a></li>";
            })(row.projectId, row.projectName);
            
        }
        // clear out whatever entries were there in the first place
        $("#firstPage ul").html("");
        //append accumulated listitems into parent container
        $("#firstPage ul").append( listitems );
    }
    log("...db project entries rendered!");
}

// Database function to fetch the DB entries for Tasks and render them in HTML format
function renderTaskDBEntries(tx, results){
    log("...rendering db task entries");
    if(results.rows.length == 0){
        // alert of simply an li to create a task ?
        log("No entries to display");
    } else {
        // for loop to run through the db query results
        // some things to pull:
        // results.rows.item(i).taskId - the id of the task (used to pull the taskDetails on the next page
        // results.rows.item(i).taskName - the name of the task which displays on this page (eventually)
        // results.rows.item(i).taskCreated - the creation date/time of the task
        var listitems = '';
        for(var i=0; i<results.rows.length; i++){
            var row = results.rows.item(i);
            //create inner function to define/limit scope of row variable
            (function(tid, task_created){
                listitems += "<li class='arrow task'><a class='item' href='#taskDetailView' id='"+tid+"'>&nbsp;<div class='delete-icon'></div>&nbsp;"+task_created+"</a><a class='delete-button button redButton' href='#'>Delete</a></li>";
            })(row.taskId, row.taskCreated);
        }
        // clear out whatever entries were there in the first place
        $("#detailView ul").html("");
        //append accumulated listitems into parent container
        $("#detailView ul").append( listitems );
    }
    log("...db task entries rendered!");
}

// this renders the task detail view for the DOM
function renderTaskDetails(tx, results){
    log("...rendering task detail entries");
    if(results.rows.length == 0){
        log("No entries to display");
    } else {
        var listitems = '';
        for(var i=0; i<results.rows.length; i++){
            // append to the already existing DOM elements here since we are just dealing with one
            $("#taskDetailView h2.time").html(toHHMMSS(results.rows.item(i).taskTime));
            $("#taskname_input").attr('placeholder', '').val(results.rows.item(i).taskName);
            $("#taskdetails_input").text(results.rows.item(i).taskDetails);
        }
    }
    log("...task detail entry rendered!");
}


// write a project to the database
function createProject(){
    // grab the project name that the user typed in
    var pName = $("#createProjectPage #projectname_input").val().trim();
    // call to insert the project name into the DB
    log("Inserting "+pName+" Project Name into database...");
    dbShell.transaction(function(tx){
                        tx.executeSql("INSERT INTO tbProjects(projectName, created) VALUES (?,?)",[pName, setCurrTime()])}, errorHandler);
                                      
    log("...grabbing Project Name!");
    // need to re-run the sql call to generate the new project table
    getDBProjectEntries();
    // reset the project name field for the user
    $("#createProjectPage #projectname_input").val("")
}

// write a project to the database
function createTask(projId){
    // grab the task name that the user typed in
    var tName = $("#createTaskPage #taskname_input").val().trim();
    var tDetails = $("#createTaskPage #taskdetails_input").val().trim();
    var tTime = toSeconds($("#createTaskPage h2.time").text().split(':'));
    // call to insert the project name into the DB
    log("Inserting "+tName+" task into database...");
    log("With the following details: "+tDetails+" ");
    dbShell.transaction(function(tx){
                        tx.executeSql("INSERT INTO tbTasks(projectId, taskName, taskTime, taskDetails, taskCreated, taskUpdated) VALUES (?,?,?,?,?,?)",[projId, tName, tTime, tDetails, setCurrTime(), setCurrTime()])}, errorHandler);
    
    log("...inserting Task into database");
    // need to re-run the sql call to generate the new project table
    getDBTaskEntries(projId);
    // reset the project name field for the user
    $("#createTaskPage #taskname_input, #createTaskPage #taskdetail_input").val("");
}

function updateTask(taskId){
    log("...updating task");
    var tName = $("#taskDetailView #taskname_input").val().trim();
    var tDetails = $("#taskDetailView #taskdetails_input").val().trim();
    var tTime = toSeconds($("#taskDetailView h2.time").text().split(':'));
    //alert(tName +" "+ tDetails +" "+ tTime +" "+ taskId);
    // call to update the record entry
    dbShell.transaction(function(tx){
                        tx.executeSql("UPDATE tbTasks SET taskName='"+tName+"', taskTime='"+tTime+"', taskDetails='"+tDetails+"', taskUpdated='"+setCurrTime()+"' WHERE taskId='"+taskId+"'")}, errorHandler);
    log("task updated successfully!");
    getDBDetailEntries(taskId);
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

