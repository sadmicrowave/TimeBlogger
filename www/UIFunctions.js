$(document).ready(function(){
    function clearUIActions(){
        //reset UI settings like 'Done'/'Edit' button text, delete-button, delete-icon, listitem left margins
        //remove list item main delete button
        $('li.deletemode').toggleClass('deletemode arrow');
        //remove list item a tag padding and hide and rotate UI delete icons
        $('li a.pad').toggleClass('pad').find('.delete-icon.active').toggleClass('active');
        //change inner text of 'done' button to 'edit' if button has active state
        $('.toolbar a.edit-click').toggleClass('edit-click').text( ( $(this).text() == 'Edit' ? 'Done' : 'Edit' ) );
    }
                  
    $(document.body).on('swipe', 'li.arrow', function(){
    //alert('swiped');
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
        //clear text input and textarea fields
        ppel.find('input, textarea').val('').text('');
        //get timer button div for referencing
        var timeel = ppel.find('.timerbtn');
        //check if timer is started
        if( timeel.hasClass('redButton') ){
            //stop the timer
            clearInterval( timeel.data('timer') );
            //reset the timer button to Start & Green
            timeel.toggleClass('greenButton redButton').text('Start');
        }
        //reset timer value to 0 regardless of Green or Red timer button
        //ex: what if user starts and stops timer; timer=('00:04:34'), and cancels the creation
        //we still need to reset the timer value even though button is Stop & Red
        ppel.find('h2.time').text('00:00:00');
    }


    //JUSTIN - USE THIS FUNCTION TO CALL YOUR DELETE DATABASECALL.JS FUNCTION
    $(document.body).on(clickEvent, 'li.deletemode .delete-button', function(){
        var elclass = $(this).parent().attr('class'),
            elid = $(this).parent().find('a.item').attr('id');
        
        if( elclass.indexOf('project') != -1 ){
            deleteProject(elid);
        } else if( elclass.indexOf('task') != -1 ){
            deleteTask(elid);
        }
        //setup delete record function when delete is clicked
        //remove the class which adds the delete button to the listitem
        //$(this).parent().toggleClass('arrow deletemode');
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
                                                 
        //notifyBanner( $(this), 'error', "Request Failed<br><span style='font-size:14px;'>Failure During Data Insertion.</span>" );
                                                 
    });

    //slightly different event listener syntax since at the time this function/page is loaded the li.project/li.task items may or may not actually reside in the DOM yet.
    $(document.body).on(clickEvent, 'li.project, li.task', function(){
        //create functionality for click/tap event for elements added to DOM rather than using onClick within element tag
        var elid = $(this).find('a.item').attr('id'),
            elclass = this.getAttribute('class');
        //execute databasecalls.js function based on class of clicked list item
        if( elclass.indexOf('project') != -1 ){
            getDBTaskEntries( elid );
            $('#createTaskPage').attr('rel', elid);
        } else if( elclass.indexOf('task') != -1 ){
            getDBDetailEntries( elid );
            $('#taskDetailView').attr('rel', elid);
        }
    });

    $(document.body).on(clickEvent, 'a.pad .delete-icon', function(){
        //set animations for UI delete icon click event
        //set active (clicked) status of UI delete icon (rotate icon 90deg)
        $(this).toggleClass('active')
        //reverse event bubble effecting listitem-a link active state (a tag turns green after click)
                .parent().toggleClass('active').parent()
                //show/hide the main list item delete button
                .toggleClass('arrow deletemode');
        //prevent document event bubbling
        return false;
    });
    
    // when the project-save button is clicked
    $('a.save.project').on(clickEvent, function(){
        createProject();
    });
                  
    // when the project-save button is clicked    
    $('a.save.task').on(clickEvent, function(){
        createTask($("#createTaskPage").attr("rel"));
    });
                  
    // when the existing task-save button is clicked (update task info)
    $('a.save.update').on(clickEvent, function(){
        updateTask($("#taskDetailView").attr("rel"));
    });
                 
    //when timerbtn is tapped
    $('.timerbtn').on(clickEvent, function(){
        //toggle the greenButton and redButton classes from themed css making button appear red and green after tap
        $(this).toggleClass('greenButton redButton');
        //get inner text of tapped button and check its value
        if( this.innerHTML == 'Start' ){
            //change text to Stop
            this.innerHTML = 'Stop';
            //get time format string "HH:MM:SS" from the timer label
            var timediv = $(this).parent().find('h2.time'),
                aTime   = timediv.text().split(':'),
                seconds = toSeconds( aTime );
                                     
            //create 1 second interal loop which increments seconds var and calls toHHMMSS func
            //then writes results to timer label
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
                  
    function notifyBanner( type, msg ){
        //set class variable based on type of notifyBanner caller function
        var bannerType = ( type == 'success' ? 'banner-success' : 'banner-error' );
        //remove banner-notify from DOM if already showing
        if( $('.banner-notify').length > 0 ) $('.banner-notify').detach();
        //select .parent()*2 which is document parent
        //$this.parents('.pages')
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
        },500);
    }
                  
// put toSeconds and the HHMMSSS functions into databasecalls.js because they needed to go there. get over it

});
