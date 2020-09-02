import { LightningElement, track } from 'lwc';
import { loadScript, loadStyle } from 'lightning/platformResourceLoader';
import FullCalendarJS from '@salesforce/resourceUrl/FullCalendarJS';
import { NavigationMixin } from 'lightning/navigation';
import fetchAllTasks from '@salesforce/apex/FullCalendarService.fetchAllTasks';
import updateTask from '@salesforce/apex/FullCalendarService.updateTask';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';


export default class FullCalendarLWC extends NavigationMixin(LightningElement) {

  fullCalendarJsInitialised = false;
  @track allEvents = [];
  @track selectedEvent = undefined;
  
  @track showEdit = false;
  @track selectedTaskId;
  
  renderedCallback() {

    // Performs this operation only on first render
    if (this.fullCalendarJsInitialised) {
      return;
    }
    this.fullCalendarJsInitialised = true;

    // Executes all loadScript and loadStyle promises
    // and only resolves them once all promises are done
    Promise.all([
      loadScript(this, FullCalendarJS + '/jquery.min.js'),
      loadScript(this, FullCalendarJS + '/moment.min.js'),
      loadScript(this, FullCalendarJS + '/theme.js'),
      loadScript(this, FullCalendarJS + '/fullcalendar.min.js'),
      loadStyle(this, FullCalendarJS + '/fullcalendar.min.css'),
      // loadStyle(this, FullCalendarJS + '/fullcalendar.print.min.css')
    ])
    .then(() => {
      // Initialise the calendar configuration
      this.fetchAllTasks();
    })
    .catch(error => {
      // eslint-disable-next-line no-console
      console.error({
        message: 'Error occured on FullCalendarJS',
        error
      });
    })
  }

  
  initialiseFullCalendarJs(doc) {
    const ele = this.template.querySelector('div.fullcalendarjs');
    // eslint-disable-next-line no-undef
    $(ele).fullCalendar({
      header: {
          left: 'prev,next today',
          center: 'title',
          right: 'month,agendaWeek,agendaDay,'//listWeek'
      },
      themeSystem : 'standard',
      defaultDate: new Date(), 
      navLinks: true,
      editable: true,
      eventLimit: true,
      events: this.allEvents,
      dragScroll : true,
      droppable: true,
      weekNumbers : false,
      displayEventTime: false,
      height: screen.height*.7,
      eventDrop: function(event, delta, revertFunc) {
        // alert(event.title + " was dropped on " + event.start.format());
        // if (!confirm("Are you sure about this change? ")) {
        //   revertFunc();
        // }
        doc.updateTask(event.id,event.start.format());
      },
      eventClick: function(event, jsEvent, view) {
        // doc.selectedEvent =  event;
        let taskId =event.id;
        doc[NavigationMixin.Navigate]({
            type: 'standard__objectPage',
            attributes: {
                recordId: taskId,
                objectApiName: 'Task',
                actionName: 'edit'
            }
        });
      },
      dayClick :function(date, jsEvent, view) {
        jsEvent.preventDefault();
        
      },
      eventMouseover : function(event, jsEvent, view) {
      },
      eventRender: function(event, element) { 
          let appendText = '';
          if(event.extendedProps.Contact== undefined) {
            appendText  = appendText + '<br> No Contact Found';
          }
          else {
            appendText  = appendText + '<br>'+event.extendedProps.Contact;
          }
          if(event.extendedProps.Account== undefined) {
            appendText  = appendText + '<br> No Hospital Found';
          }
          else {
            appendText  = appendText + '<br>'+event.extendedProps.Account;
          }
        element.find('.fc-title').append(appendText); 
    } 
    });
  }

  fetchAllTasks(){
    fetchAllTasks()
      .then(result => {
        this.allEvents = result.map(item => {
          return {
            id : item.Id,
            editable : true,
            title : item.Category__c,
            start : item.ReminderDateTime,
            // end : item.EndDateTime,
            description : item.Comments__c,
            status : item.Status,
            allDay : false,
            extendedProps : {
              whoId : item.WhoId,
              whatId : item.WhatId,
              Account : item.WhatId != undefined? item.What.Name:undefined,
              Contact : item.WhoId != undefined? item.Who.Name:undefined,
            },
            // backgroundColor: "rgb(" + Math.floor(Math.random() * 256) + "," + Math.floor(Math.random() * 256) + "," + Math.floor(Math.random() * 256) + ")",
            // borderColor: "rgb(" + Math.floor(Math.random() * 256) + "," + Math.floor(Math.random() * 256) + "," + Math.floor(Math.random() * 256) + ")"
            backgroundColor:"rgb(12, 101, 218)",
            borderColor:"rgb(12, 101, 218)"
          };
        });
        this.initialiseFullCalendarJs(this);
      })
      .catch(error => {
        window.console.log(' Error Occured ', error)
      })
      .finally(()=>{
        //this.initialiseFullCalendarJs();
      })
  }

  closeModal(){
    this.selectedEvent = undefined;
  }
  showAddTask() {
        this[NavigationMixin.Navigate]({
            type: 'standard__objectPage',
            attributes: {
                recordId: this.selectedTaskId,
                objectApiName: 'Task',
                actionName: 'new'
            }
        });
    
  }
  updateTask(id,date) {
      console.log('Update task called with id : '+id +' and date : '+date);
      updateTask({id:id,dateString:date})
      .then(result => {
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Success',
                message: 'Task Updated',
                variant: 'success'
            })
        );
      })
      .catch(error => {
        window.console.log(' Error Occured ', error)
      })
  }
}