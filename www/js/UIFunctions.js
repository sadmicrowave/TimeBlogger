$(document).ready(function(){
    function clearUIActions(){
        //reset UI settings like 'Done'/'Edit' button text, delete-button, delete-icon, listitem left margins
        //remove list item main delete button
        $('li.deletemode').toggleClass('deletemode arrow');
        //remove list item a tag padding and hide and rotate UI delete icons
        $('li a.pad').toggleClass('pad').attr('href', '#detailView').find('.delete-icon.active').toggleClass('active');
        //change inner text of 'done' button to 'edit' if button has active state
        $('.toolbar a.edit-click').toggleClass('edit-click').text( ( $(this).text() == 'Edit' ? 'Done' : 'Edit' ) );
    }
                  
    $(document.body).on('swipe', 'li.arrow', function(){
    //setup swipe-to-delete functionality
        //clear any other visible UI actions
        clearUIActions();
        //add class to listitem which adds delete button to listitem
        $(this).toggleClass('arrow deletemode');
    });
    
    $(document.body).bind(clickEvent, function(){
    //simulate web 'lost-focus' event when there are active/visible UI actions and anywhere else in the body is clicked
        //clear any other visible UI actions
        clearUIActions();
    });
                 
    $('.cancelbtn').bind(clickEvent, function(){ $(this).clearUIInputs() });
                  
    $.fn.clearUIInputs = function(){
        //clear input, textareas, and timer value (if applicable) when cancel button is clicked
        //get document parent div for referencing throughout function
        var ppel = $(this).parent().parent();
            //get timer button div for referencing
        //clear text input and textarea fields
        ppel.find('input, textarea').val('').text('');
        ppel.clearTimer();
        //check if timer is started
        
        //reset timer value to 0 regardless of Green or Red timer button
        //ex: what if user starts and stops timer; timer=('00:04:34'), and cancels the creation
        //we still need to reset the timer value even though button is Stop & Red
        ppel.find('h2.time').text('00:00:00');
    }
    
    $.fn.clearTimer = function(){
        var timeel = $(this).find('.timerbtn');
        if( timeel.length && timeel.hasClass('redButton') ){
            //stop the timer
            clearInterval( timeel.data('timer') );
            //reset the timer button to Start & Green
            timeel.toggleClass('greenButton redButton').text('Start');
        }
    }

    //JUSTIN - USE THIS FUNCTION TO CALL YOUR DELETE DATABASECALL.JS FUNCTION
    $(document.body).on(clickEvent, 'li.deletemode .delete-button', function(){
        var elclass = $(this).parent().attr('class'),
            // elid holds the task id of the clicked task
            elid = $(this).parent().find('a.item').attr('id'),
            // elrel holds the project id of the clicked task
            elrel = $(this).parent().find('a.item').attr('rel');
        if( elclass.indexOf('project') != -1 ){
            deleteProject(elid);
        } else if( elclass.indexOf('task') != -1 ){
            // pass the project id (elrel) and task id (elid) to the deleteTask function
            deleteTask(elrel, elid);
        }
        //prevent document event bubbling
        return false;
    });
    
    $('a.edit', document.body).bind(clickEvent, function(){
        //show/hide multiple delete UI icons and pad inner content of listitem to simulate iOS behavior
        //change text of button 
        $(this).html( ( this.innerHTML == 'Edit' ? 'Done' : 'Edit' ) )
        //change class of button for clearUIActions() to infer button active status
                .toggleClass('edit-click')
                //find parent page container
                .parents('.pages')
                //find the list item link
                .find('ul li a.item')
                //toggle the inner padding of link and show multiple UI delete buttons
                .toggleClass('pad')
                //find the active (clicked state) UI delete buttons
                .find('.delete-icon.active')
                //toggle the active click state of active UI delete icons found
                .toggleClass('active');
                //hide large delete buttons if any are visible
        $('li.deletemode').toggleClass('arrow deletemode');
        //prevent document event bubbling
        return false;
    });

    //slightly different event listener syntax since at the time this function/page is loaded the li.project/li.task items may or may not actually reside in the DOM yet.
    $(document.body).on(clickEvent, 'li.project, li.task', function(){
        //create functionality for click/tap event for elements added to DOM rather than using onClick within element tag
        var elid = $(this).find('a.item').attr('id');
        //execute databasecalls.js function based on class of clicked list item
        if( $(this).hasClass('project') ){
            getDBTaskEntries( elid );
            $('#createTaskPage').attr('rel', elid);
            //set projid to attribute inside detailView header
            $('#detailView').attr('projid', elid);
        } else if( $(this).hasClass('task') ){
            //create taskDetailsView dynamically when task item is clicked
            var $detailView = $('#taskDetailView_'+elid);
            if( $detailView.length == 0 ){
                //only create the div if it doesn't already exist
                //actually create the DOM element
                $detailView = $("<div>").attr('id','taskDetailView_'+elid);
                //get the project id to assign as an attribute later
                var projId = $('#detailView').attr('projid'),
                    //create all the page elements (for visibility and modularity I assigned them to their own variables)
                    toolbar = "<div class='toolbar'><h1>Task Details</h1><a class='button back' href='#'>Back</a><a class='button save update' href='#' style='right:6px;'>Save</a></div>",
                    statush4lbl = "<h4 style='margin-top:5px !important;'>Task Status</h4>",
                    status_ul = "<ul class='segmented'><li id='_1'><a rel='1' href='#'>Not Started</a></li><li id='_2'><a rel='2' href='#'>In Process</a></li><li id='_3' ><a rel='3' href='#'>Complete</a></li></ul>",
                    timeh4lbl = "<h4>Timer</h4>",
                    detail_timer_ul = "<ul id='detail_timer_ul' class='rounded' style='height:55px;'><li style='height:55px; padding:0px; margin:0px; line-height:55px;'><a class='button greenButton timerbtn' href='#'>Start</a><h2 class='time' style='position:relative; float:right; color:#fff; font-size:23px; right:5px; top:5px; vertical-align:middle;'>00:00:00</h2></li></ul>",
                    detailh4lbl = "<h4>Task Details</h4>",
                    detail_ul = "<ul id='task_detail_ul' class='rounded'><li><input type='text' name='taskname' placeholder='Task Name' id='taskname_input' autocapitalize='off' autocorrect='off' autocomplete='off'></li><li><textarea name='taskdetails' placeholder='Enter a Description of Your Task' rows='3' cols='2' id='taskdetails_input' autocapitalize='on' autocorrect='on' autocomplete='on'></textarea></li></ul>",
                    deletebtn = "<h3 style='width:93%; text-align:center;'>Delete Warning: This action cannot be undone.  Deleting a Task is permanent and cannot be reversed.</h3><a class='button redButton save delete-button' id='taskDelete' href='#detailView'>Delete This Task</a><br><br></div>";
                 //style='height:280px;'       
                //assign attributes
                $detailView.attr({'taskId': elid, 'projId': projId})
                            //assign class
                            .addClass('pages')
                            //append all the page element variables defined above
                            .append( toolbar, status_ul, timeh4lbl, detail_timer_ul, detailh4lbl, detail_ul, deletebtn )
                            //append completed div to body
                            .appendTo('body');
                //populate fields in page view with DB results
                getDBDetailEntries( elid );
                        
            }
        }
    });
    
    $(document.body).on(clickEvent, 'a.pad', function(){
        var href        = this.getAttribute('href'),
            proj_name   = this.getAttribute('projname'),
            projId      = this.getAttribute('id');
        
        this.setAttribute('href', '#editProjectPage');
        $('#editProjectPage').attr('projId', projId)
            .find('ul#edit_project_ul li input').val( proj_name );
            
    });

    $(document.body).on(clickEvent, 'a.pad .all-sub .delete-icon', function(){
    //set animations for UI delete icon click event
        //remove active and deletemode classes for other list items that have been clicked before and still have those states
        $('.delete-icon.active').not(this).toggleClass('active')
                                .closest('li.deletemode')
                                .toggleClass('arrow deletemode');
        
        //set active (clicked) status of UI delete icon (rotate icon 90deg)
        $(this).toggleClass('active')
        //reverse event bubble effecting listitem-a link active state (a tag turns green after click)
                .closest('a.item').toggleClass('active').parent()
                //show/hide the main list item delete button
                .toggleClass('arrow deletemode');
        //prevent document event bubbling
        return false;
    });
    
    //when taskDelete button is clicked within a taskDetail view to delete individual tasks
    $(document.body).on(clickEvent, '#taskDelete', function(){
        //get taskid and projectid to pass to deleteTask databasecall.js function
        var taskid = $(this).parent().attr('taskId'),
            projid = $(this).parent().attr('projId');
        deleteTask(projid, taskid);
    });
    
    // when the project-save button is clicked
    $('a.save.project').on(clickEvent, function(){
    // grab the project name that the user typed in
        var pName = $("#createProjectPage #projectname_input").val().trim();
        if( pName.length > 0 ){
            //create the project with the name if name is not empty
            createProject(pName);
        } else {
            //show an error banner if name is empty
            notifyBanner( 'error', "Request Failed<br><span style='font-size:14px;'>Project Name can not be empty.</span>" );
            return false;
        }
    });
    
    $('a.save.project-edit').on(clickEvent, function(){
        var projId = $('#editProjectPage').attr('projId'),
            proj_name = $('ul#edit_project_ul li input').val();
        updateProject(projId, proj_name);
    });
    
    $('#projectDelete').on(clickEvent, function(){
        var projId = $('#editProjectPage').attr('projId');
        deleteProject(projId);
            //answer = confirm("Are you sure you want to delete this project and all associated tasks?");
        //if( answer ) deleteProject(projId);
        //navigator.notification.confirm("Are you sure you want to delete this project and all associated tasks?", 
          //                          function(i){ if(i==2)deleteProject(projId); window.location('#firstPage'); }, "Delete?", "No,Yes");
    });
                  
    // when the project-save button is clicked    
    $('a.save.task').on(clickEvent, function(){
        createTask($("#createTaskPage").attr("rel"));
        $(this).clearUIInputs();
    });
                  
    // when the existing task-save button is clicked (update task info)
    $(document.body).on(clickEvent, 'a.save.update', function(){
        var $parent = $(this).parent().parent(),
            taskId = $parent.attr('taskId'),
            projId = $parent.attr('projId');
        updateTask(taskId, projId);
        
        $parent.delay(1000).queue(function(){ 
            $(this).detach(); 
        });
    });
                 
    //when timerbtn is tapped
    $(document.body).on(clickEvent, '.timerbtn', function(){
        //toggle the greenButton and redButton classes from themed css making button appear red and green after tap
        $(this).toggleClass('greenButton redButton');
        //get task view list item div to store the timer interval in
        //get inner text of tapped button and check its value
        if( this.innerHTML == 'Start' ){
            //change text to Stop
            this.innerHTML = 'Stop';
            //get time format string "HH:MM:SS" from the timer label
            var timediv = $(this).parent().find('h2.time'),
                aTime   = timediv.text().split(':'),
                seconds = toSeconds( aTime );
                                     
            //create 1 second interal loop which increments seconds var and calls toHHMMSS func then writes results to timer label
            $(this).data('timer', setInterval( function(){ 
                                            seconds++;
                                            timediv.text( toHHMMSS( seconds ) ); 
                                    },1000)
                        );
        } else {
            //change text to Start
            this.innerHTML = 'Start';
            //stop the interval loop from incrementing seconds
            clearInterval( $(this).data('timer') );
        }
    });
    
    //add control event handler for UI Segmented Controls
    $(document.body).on(clickEvent, 'ul.segmented li a', function(){
        //cast $(this) to a variable since it will be used multiple times within this function
        //this results in increased jquery response time since the DOM does not have to be search for the element every time it is called
        var $this = $(this);
        //remove the activated class from a list item that was selected but not clicked now
        //add class to the currently clicked list item
        //note: did not use toggleClass because at any given time at least 1 list item should always be activated
        $this.addClass('activated')
               .parent().parent().find('li a.activated').not(this).toggleClass('activated');
        
        if( $this.closest('ul.segmented').attr('id') == 'detail_sort_seg' ){
            var sortOrder = $this.attr('sort');
            getDBTaskEntries( $this.closest('#detailView').attr('projid'), $this.attr('rel')+' '+sortOrder );
            $this.attr('sort', ( sortOrder == 'ASC' ? 'DESC' : 'ASC' ) );
        }
    });
                  


//put notifyBanner function in databasecalls.js since the database errors should be the ones to call this function                  
//put toSeconds and the HHMMSSS functions into databasecalls.js because they needed to go there. get over it

});
