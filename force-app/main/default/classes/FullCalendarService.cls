public with sharing class FullCalendarService {
    
    @AuraEnabled
    public static List<Task> fetchAllTasks(){
        List<task> taskList = new List<Task>();
        taskList = [Select Id, Subject,FORMAT (ReminderDateTime),Category__c, who.name,what.name, Task_Category__r.Name,
                     Status,Comments__c, OwnerId, ActivityDate From Task
                   /*WHERE ownerid = :UserInfo.getUserId()*/
                   WHERE whatid != null];
        return taskList;
    }
    @AuraEnabled
    public static void updateTask(string id, string dateString){
        system.debug(dateString);
        string dueDate = dateString.split('T')[0];
        Integer yy = integer.valueof(dueDate.split('-')[0]);
        Integer mm = integer.valueof(dueDate.split('-')[1]);
        Integer dd = integer.valueof(dueDate.split('-')[2]);
        Integer hr = integer.valueof(dateString.split('T')[1].split(':')[0]);
        Integer min = integer.valueof(dateString.split('T')[1].split(':')[1]);
        Integer sec = integer.valueof(dateString.split('T')[1].split(':')[2]);
        Task record = [SELECT id,ActivityDate from task where id =: id];
        if(record != null) {
            system.debug(dueDate);
            system.debug(yy+'::'+mm+'::'+dd+'::'+hr+'::'+min+'::'+sec);
            system.debug(date.valueOf(dueDate));
            record.ActivityDate = date.valueOf(dueDate);
            dateTime dt = Datetime.valueOf( DateTime.newInstance(yy, mm, dd, 9, min,sec).format('yyyy-MM-dd HH:mm:ss'));
            record.ReminderDateTime = dt;
        }
        update record;
    }
}