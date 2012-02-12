// This file contains functions for Database control
// the begining of it all... setting up the db object and doing the first transaction to create the table
function log(s){
    console.log(s);
}

// function to set the current time when it is called
function setCurrTime(){
    var now = new Date(),
        hours = now.getHours();
        hours = ( hours > 12 ? hours-12 : ( hours == 0 ? 12 : hours ) ),
        minutes = now.getMinutes(),
        seconds = now.getSeconds(),
        meridiem = ( hours == 0 ? ' AM' : ( hours > 11 ? ' PM' : ' AM' ) );
        // fix the leading zero issue for minutes
        if (minutes < 10 ){
            minutes = "0" + minutes;
        }
        
        if (seconds < 10){
            seconds = "0" + seconds;
        }
    
        time = now.toDateString() + ' ' +hours+':'+minutes+':'+seconds+' '+meridiem;
    return time;
}

function toHHMMSS( seconds ){
    //convert seconds variable to HH:MM:SS
    sec_numb    = parseInt( seconds );
    var hours   = Math.floor(sec_numb / 3600),
        minutes = Math.floor((sec_numb - (hours * 3600)) / 60),
        seconds = sec_numb - (hours * 3600) - (minutes * 60);
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

filterInputText = function(str){
    //function to sanatize DOM input fields 
    try
    {
        return str.replace(/\s+/gm, ' ').match(/[a-zA-Z0-9\(\), \.!\/:%@&\?\+_=\-\$]+/gm).join('');
    }
    catch(e)
    {
        return '';
    }
}


function notifyBanner( type, msg ){
        //set class variable based on type of notifyBanner caller function
        var bannerType = ( type == 'success' ? 'banner-success' : 'banner-error' );
        //remove banner-notify from DOM if already showing
        if( $('.banner-notify').length > 0 ) $('.banner-notify').detach();
        setTimeout(function(){
            $('.pages')
            //append the banner div and add the banner-notify class and success/error class
                .append( $('<div/>').addClass('banner-notify ' + bannerType)
                //add explanation content to banner div
                            .html( msg )
                        )
                //find the banner just created within the parent document
                .find('.banner-notify')
                //animate the banner up from below the viewport
                .animate({'bottom':'0px'}, 150)
                //leave it visible for 4 seconds
                .delay(4000)
                //animate the banner back below the viewport bottom and remove it from the DOM
                .animate({'bottom':'-52px'}, 500, function(){
                         $(this).detach();
                });
        },300);
    }

function phoneReady(){
    // **** first, open the database ****
    dbShell = window.openDatabase("TimeBlogger", 1, "TimeBlogger", 1000000);
    //and run another function if the setup is successful (displayEntries)
    dbShell.transaction(setupDBTable, errorHandler, getDBProjectEntries);
    
    //create background process event listeners
    document.addEventListener("pause", onPause, false);
    document.addEventListener("resume", onResume, false);
}

//set global variable to be used within onPause and onResume
var pauseTimeMS = 0;
function onPause(){
    //create new date object to use when getting current date time
    var d = new Date(); 
    //get milliseconds from 1 January 1970 00:00:00 to now
    pauseTimeMS = Date.UTC( d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds(), d.getUTCMilliseconds() );
    //stop the active timers from incrementing
    clearInterval( $('a.timerbtn.redButton').data('timer') );
}

function onResume(){
    //create new date object to use when getting current date time
    var d = new Date(),
        //get milliseconds from 1 January 1970 00:00:00 to now
        resumeTimeMS = Date.UTC( d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds(), d.getUTCMilliseconds() ),
        //calculate the difference between the pauseTime and resumeTime, divide by 1000 to convert from milliseconds to seconds, then round down to nearest whole number
        timeDiff = Math.floor( ( resumeTimeMS - pauseTimeMS )/1000 );
    
    //get all active timer buttons that are red and assign them to a variable
    //var $this = $('a.timerbtn.redButton'),
    $('a.timerbtn.redButton').each(function(){
        var $this = $(this),
            //get all active time label divs that are related to the active timer btn retrieved above
            timediv = $this.parent().find('h2.time'),
            //get the current time inside the timediv
            aTime   = timediv.text().split(':'),
            //calculate new time in seconds by adding pause-resume time difference to current time in h2.time label
            seconds = toSeconds( aTime ) + timeDiff;
        //create 1 second interal loop which increments seconds var and calls toHHMMSS func then writes results to timer label
        $this.data('timer', setInterval( function(){ 
                                seconds++;
                                timediv.text( toHHMMSS( seconds ) ); 
                            },1000)
                  );
    });
}

// setup the db
function setupDBTable(tx){
    // we will want to remove the following three lines before go live
    tx.executeSql("DROP TABLE IF EXISTS tbProjects");
    tx.executeSql("DROP TABLE IF EXISTS tbTasks");
    log("All tables dropped!");
    // this statement creates the table named 'tb'. We use 'IF NOT EXISTS' so that this statement
    // is safe to run again and again
    // setup project table
    tx.executeSql("CREATE TABLE IF NOT EXISTS tbProjects(projectId INTEGER PRIMARY KEY AUTOINCREMENT, projectName TEXT, created DATE)");
    log("Project Table Setup successfully");
    // setup tasks table
    tx.executeSql("CREATE TABLE IF NOT EXISTS tbTasks(taskId INTEGER PRIMARY KEY AUTOINCREMENT, projectId INTEGER, taskName TEXT, taskTime INTEGER, taskDetails TEXT, taskStatus INTEGER, taskCreated TEXT, taskUpdated TEXT)");
    log("Tasks Table Setup successfully");
    
    // test fill of the DB
    // for now the date and time is hardcoded... this will need to be changed to generate the date & time when task is created
    log("generating dummy data");
    tx.executeSql("INSERT INTO tbProjects(projectName, created) VALUES (?,?)",["Project 1", setCurrTime()]);
    tx.executeSql("INSERT INTO tbProjects(projectName, created) VALUES (?,?)",["Project 2", setCurrTime()]);
    tx.executeSql("INSERT INTO tbProjects(projectName, created) VALUES (?,?)",["Project 3", setCurrTime()]);
    //created many more projects to test what happens with jqtouch rendering objects that exceed the height of the originally set page height
    
    tx.executeSql("INSERT INTO tbTasks(projectId, taskName, taskTime, taskDetails, taskStatus, taskCreated, taskUpdated) VALUES (?,?,?,?,?,?,?)",[1, "Mowed Lawn", 60, "Mowed the lawn next to the church", 3, setCurrTime(), setCurrTime()]);
    tx.executeSql("INSERT INTO tbTasks(projectId, taskName, taskTime, taskDetails, taskStatus, taskCreated, taskUpdated) VALUES (?,?,?,?,?,?,?)",[1, "Trimmed Hedges", 120, "Trimmed the hedges of the bushes that were growing over my fence", 1, setCurrTime(), setCurrTime()]);
    tx.executeSql("INSERT INTO tbTasks(projectId, taskName, taskTime, taskDetails, taskStatus, taskCreated, taskUpdated) VALUES (?,?,?,?,?,?,?)",[1, "Cleaned Garage", 0, "Cleaned the garage so I could fit the car in it", 1, setCurrTime(), setCurrTime()]);
    tx.executeSql("INSERT INTO tbTasks(projectId, taskName, taskTime, taskDetails, taskStatus, taskCreated, taskUpdated) VALUES (?,?,?,?,?,?,?)",[2, "Cooked Dinner", 2232, "Cooked some great turkey in the stove that we are having for dinner tomorrow", 2, setCurrTime(), setCurrTime()]);
    tx.executeSql("INSERT INTO tbTasks(projectId, taskName, taskTime, taskDetails, taskStatus, taskCreated, taskUpdated) VALUES (?,?,?,?,?,?,?)",[2, "Payed Bills", 23332, "Paid all those bills, those telephone bills, the auto-mo-bills.", 3, setCurrTime(), setCurrTime()]);
    log("generated dummy data");
}

// Database query function
function getDBProjectEntries(){
    // embedding the function with the transaction call, if successful run 'renderDBEntries,
    // if result is bad run errorHandler, if the whole transaction fails run erroHandler
    // executeSQL('THE SQL STATEMENT', empty array, successFunc, failFunc)
    log("collecting DB Project entries...");
    dbShell.transaction(function(tx){
                        tx.executeSql("SELECT tbProjects.projectId, SUM(tbTasks.taskTime) AS totalTime, tbProjects.projectName FROM tbProjects LEFT OUTER JOIN tbTasks ON tbTasks.projectId = tbProjects.projectId GROUP BY tbProjects.projectId ORDER BY tbProjects.created DESC", [], renderProjectDBEntries, errorHandler)}, errorHandler);
    log("got DB entries!...");
}

// Database Task query function to get the general task information (taskId, taskname, taskCreated)
function getDBTaskEntries(id, sortOrder){
    sortOrder = ( sortOrder ? sortOrder : 'taskUpdated DESC' );
    // embedding the function with the transaction call, if successful run 'renderDBEntries,
    // if result is bad run errorHandler, if the whole transaction fails run erroHandler
    // executeSQL('THE SQL STATEMENT', empty array, successFunc, failFunc)
    log("collecting DB Task entries...");
    dbShell.transaction(function(tx){
                        tx.executeSql("SELECT taskId, projectId, taskName, taskStatus, taskUpdated FROM tbTasks WHERE projectId="+id+" ORDER BY "+sortOrder+"", [], renderTaskDBEntries, errorHandler)}, errorHandler); //taskUpdated DESC
    log("got DB entries!...");
}

// database call to get the specific task details that is selected (taskDetails)
function getDBDetailEntries(id){
    log("collecting Task Detail information...");
    dbShell.transaction(function(tx){
                        tx.executeSql("SELECT taskId, taskName, taskDetails, taskTime, taskStatus FROM tbTasks WHERE taskId="+id+"", [], renderTaskDetails, errorHandler)}, errorHandler);
    log("got Task Details!...");

}

// Database function to fetch the DB entries and render them in HTML format
function renderProjectDBEntries(tx, results){
    log("rendering db project entries...");
    var $fpage = $("#firstPage");
    if(results.rows.length == 0){
        //hide edit button and ul from view
        $('.toolbar a.edit, ul#project_ul').css('display','none');
        //show project create instructions
        $('#noProjects').css('display','block');
        log("No entries to display");
    } else {
        //show edit button and ul in view
        $('.toolbar a.edit').css('display','block');
        //hide project create instructions
        $('#noProjects').css('display','none');
        // html is where we are storing the rendered html
        // for loop to run through the db query results
        var listitems = '';
        for(var i=0; i<results.rows.length; i++){
            var row = results.rows.item(i),
                totTime = ( row.totalTime ? toHHMMSS(row.totalTime) : "00:00:00" );
            (function(pid, proj_name, totTime){
                proj_name = filterInputText( proj_name );
                listitems += "<li class='arrow project' id='_"+pid+"'><a class='item' href='#detailView' id='"+pid+"'><div class='all-sub'>&nbsp;<div class='delete-icon'></div>&nbsp;<span class='item_header'>"+proj_name+"</span><br><span class='item_sub'>Total Time: "+totTime+"</span></div></a><a class='delete-button button redButton' href='#'>Delete</a></li>";
            })(row.projectId, row.projectName, totTime);
            
        }
        // clear out whatever entries were there in the first place
        //append accumulated listitems into parent container
        $("ul#project_ul").html( listitems ).css('display','block');
    }
    //log("...db project entries rendered!");
}

// Database function to fetch the DB entries for Tasks and render them in HTML format
function renderTaskDBEntries(tx, results){
    log("...rendering db task entries");
    var $dpage = $("#detailView");
    if(results.rows.length == 0){
        //hide ul from view
        $('ul#detail_ul, ul#detail_sort_seg').css('display','none');
        //show task create instructions
        $('#noTasks').css('display','block');
        log("No entries to display");
    } else {
        //hide task create instructions
        $('#noTasks').css('display','none');
        $('ul#detail_sort_seg').css('display','block');
        // for loop to run through the db query results
        var listitems = '';
        for(var i=0; i<results.rows.length; i++){
            var row = results.rows.item(i);
            //create inner function to define/limit scope of row variable
            (function(tid, pid, task_name, taskStatus, task_updated){
                var taskStatusText  = '',
                    task_name       = filterInputText( task_name );
                switch( taskStatus ){ case 1: taskStatusText='Not Started'; break; case 2: taskStatusText='In Process'; break; case 3: taskStatusText='Complete'; break; }
                listitems += "<li class='arrow task' id='_"+tid+"'><a class='item' href='#taskDetailView_"+tid+"' id='"+tid+"' rel='"+pid+"'><div class='all-sub'>&nbsp;<div class='delete-icon'></div>&nbsp;<span class='item_header'>"+task_name+"</span><br><span class='item_sub'><div class='inner-item-sub' style='color:#eaeaea;'>"+taskStatusText+"</div><div style='margin-left:75px;'>"+task_updated+"</div></span></div></a><a class='delete-button button redButton' href='#'>Delete</a></li>";
            })(row.taskId, row.projectId, row.taskName, row.taskStatus, row.taskUpdated);
        }
        //clear out whatever entries were there in the first place
        //append accumulated listitems into parent container
        $("ul#detail_ul").html( listitems ).css('display','block');
    }
    //log("...db task entries rendered!");
}

// this renders the task detail view for the DOM
function renderTaskDetails(tx, results){
    log("...rendering task detail entries");
    if(results.rows.length > 0){    
        var listitems = '';
        for(var i=0; i<results.rows.length; i++){
            var row             = results.rows.item(i),
                taskId          = row.taskId,
                taskDetailView  = "#taskDetailView_"+taskId,
                taskStatus      = row.taskStatus,
                taskDetails     = filterInputText( row.taskDetails ),
                taskName        = filterInputText( row.taskName );
            // append to the already existing DOM elements here since we are just dealing with one
            $(taskDetailView + " h2.time").html(toHHMMSS(row.taskTime));
            $(taskDetailView + " ul.segmented li#_"+taskStatus +" a").addClass('activated');
            if( taskName.length > 0 ) $(taskDetailView + " #taskname_input").attr('placeholder', '').val(taskName);
            if( taskDetails.length > 0 ){
                $(taskDetailView + " #taskdetails_input").attr('placeholder', '').text(taskDetails);
            } else {
                $(taskDetailView + " #taskdetails_input").attr('placeholder', 'Enter a Description of Your Task').text("");
            }
        }
    } else {
        log("No entries to display");
    }
    log("...task detail entry rendered!");
}


// write a project to the database
function createProject(pName){
        // call to insert the project name into the DB
        log("Inserting "+pName+" Project Name into database...");
        dbShell.transaction(function(tx){
                            tx.executeSql("INSERT INTO tbProjects(projectName, created) VALUES (?,?)",[pName, setCurrTime()])}, errorHandler);
                                      
        log("...grabbing Project Name!");
        // need to re-run the sql call to generate the new project table
        getDBProjectEntries();
        // reset the project name field for the user
        $("#createProjectPage #projectname_input").val("");
}

// write a project to the database
function createTask(projId){
    // grab the task name that the user typed in
    var tName       = $("#createTaskPage #taskname_input").val().trim(),
        tDetails    = $("#createTaskPage #taskdetails_input").val().trim(),
        tTime       = toSeconds($("#createTaskPage h2.time").text().split(':')),
        taskStatus  = ( tTime > 0 ? 2 : 1 ),
        sortOrder   = $("ul#detail_sort_seg li a.activated").attr('rel');
    //set task name to "New Task" if task name is blank
    tName = ( tName.length > 0 ? tName : "New Task" );

    // call to insert the project name into the DB
    log("Inserting "+tName+" task into database...");
    log("With the following details: "+tDetails+" ");
    dbShell.transaction(function(tx){
                        tx.executeSql("INSERT INTO tbTasks(projectId, taskName, taskTime, taskDetails, taskStatus, taskCreated, taskUpdated) VALUES (?,?,?,?,?,?,?)",[projId, tName, tTime, tDetails, taskStatus, setCurrTime(), setCurrTime()])}, errorHandler);
    
    log("...inserting Task into database");
    // need to re-run the sql call to generate the new project table
    getDBTaskEntries(projId, sortOrder);
    // reset the project name field for the user
    $("#createTaskPage #taskname_input, #createTaskPage #taskdetails_input").text("").val("");
    $("#createTaskPage ul h2.time").text("00:00:00");
    // need to re-run the sql call to generate the new project table
    getDBProjectEntries();
}

function updateTask(taskId, projId){
    log("...updating task");
    var taskDetailView  = "#taskDetailView_"+taskId,
        tName           = $(taskDetailView +" #taskname_input").val().trim(),
        tDetails        = $(taskDetailView +" #taskdetails_input").val().trim(),
        tTime           = toSeconds($(taskDetailView +" h2.time").text().split(':')),
        noStartStatus   = $(taskDetailView + " ul.segmented li:not(:first-child) a.activated").length,
        compStatus      = $(taskDetailView + " ul.segmented li:last-child a.activated").length,
        selectedStatus  = $(taskDetailView + " ul.segmented li a.activated").attr('rel'),
        taskStatus      = ( tTime > 0 ? ( !noStartStatus ? 2 : selectedStatus )  : ( compStatus ? selectedStatus : 1 ) ),
        sortDiv         = $("ul#detail_sort_seg li a.activated"),
        sortOrder       = sortDiv.attr('rel') +' '+ sortDiv.attr('sort');
       if( selectedStatus == 2 && tTime == 0 ) notifyBanner( 'error', "Status Not Updated<br><span style='font-size:12px;'>Status cannot be 'In Process' while timer is empty</span>" );
    // call to update the record entry
    dbShell.transaction(function(tx){
                        tx.executeSql("UPDATE tbTasks SET taskName='"+tName+"', taskTime='"+tTime+"', taskDetails='"+tDetails+"', taskStatus='"+taskStatus+"', taskUpdated='"+setCurrTime()+"' WHERE taskId='"+taskId+"'")}, errorHandler);
    log("task updated successfully!");
    getDBTaskEntries(projId, sortOrder);
    // need to re-run the sql call to generate the new project table
    getDBProjectEntries();
}


// database calls to delete project and any related task entries
function deleteProject(projId){
    log("deleting project and related tasks...");
    dbShell.transaction(function(tx){
                        tx.executeSql("DELETE FROM tbProjects WHERE projectId="+projId+"")}, errorHandler);
    deleteTaskEntries(projId);
    log("...removed project!");
    // deleted a project, animate the project list item out of view
    $("#firstPage li#_"+projId+"").animate({'height':'0px', 'paddingTop':'0px', 'paddingBottom':'0px', 'opacity':0}, 250, function(){
        //remove the list item from the DOM
        $(this).detach();
        //if no more list items are present execute functions to display the project create instructions and hide UL and Edit button.
        if( $("#firstPage li.project").length == 0 ){
            $('.toolbar a.edit, ul#project_ul').css('display','none');
            //show project create instructions
            $('#noProjects').css('display','block');
        }
    });
}

// database call to delete task entries *** This is related to deleting a project!!
function deleteTaskEntries(projId){
    log("deleting tasks related to project...");
    dbShell.transaction(function(tx){
                        tx.executeSql("DELETE FROM tbTasks WHERE projectId="+projId+"")}, errorHandler);
    log("...removed all associated project tasks!");
}

// database call to delete individual task entries
function deleteTask(projId, taskId){
    log("deleting task...");
    dbShell.transaction(function(tx){
                        tx.executeSql("DELETE FROM tbTasks WHERE taskId="+taskId+"")}, errorHandler);
    log("...removed task!");
    // deleted a task, animate the task list item out of view
    $("#detailView li#_"+taskId+"").animate({'height':'0px', 'paddingTop':'0px', 'paddingBottom':'0px', 'opacity':0}, 250, function(){
        //remove the list item from the DOM
        $(this).detach();
        //if no more list items are present execute functions to display the project create instructions and hide UL and Edit button.
        if( $("#detailView li.task").length == 0 ){
            $('ul#detail_ul, .toolbar a.edit').css('display','none');
            //show project create instructions
            $('#noTasks').css('display','block');
        }
    });
    // update the project page as well since the total time needs to change
    getDBProjectEntries();

}


//Transaction Error Processing
function errorHandler(err){
    //this is a descriptive error handler... use at your own risk... take out before go-live
    for(e in err){
        alert("Error: "+err[e]);
    }
}

//Transaction Success
function successCB(){
    // test alert to make sure DB is made
    //alert("DB Trans Success!");
    dbShell.transaction(writeToDatabase, errorHandler);
}

function init(){
    document.addEventListener("deviceready", phoneReady, false);
}

