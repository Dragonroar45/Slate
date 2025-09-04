import './style.css';

let mainClasses = document.getElementById("main-classes");

const Appstate = {
    'day': null,
    'startTime': null,
    'endTime': null,
    'status':null
}

const URL = "https://harshslatedata.blob.core.windows.net/public/timetable.json";

function createTimelineItem(classInfo){
    let listItem = document.createElement('li');
    listItem.classList = 'text-center justify-center items-center p-8 flex flex-col gap-8';

    let subjectName = document.createElement('p');
    subjectName.classList = 'text-5xl text-white font-bold';
    subjectName.textContent = classInfo.subject;

    let classTime = document.createElement('p');
    classTime.classList = 'text-slate-500 mt-4';
    classTime.textContent = `Time: ${classInfo.startTime} - ${classInfo.endTime}`;

    listItem.appendChild(subjectName);
    listItem.appendChild(classTime);

    return listItem;

}

async function initiliazeApp() {
    try {
        const timetableData = await fetchTimeTable();
        const todaySchedule = getTodaySchedule(timetableData);

        mainClasses.textContent = "Loading....";

        todaySchedule.forEach(classItem => {
            let item = createTimelineItem(classItem);
            mainClasses.appendChild(item);
        });
    } catch (error) {
        mainClasses.textContent = `ERROR: ${error}`;
    }
}

async function fetchTimeTable() {
    try {
        const timeTablePromise = await fetch(URL);
        if (!timeTablePromise.ok){
            throw new Error(`HTTP ERROR: ${timeTablePromise.status}`);
        }
        const timeTableTemp = await timeTablePromise.json();
        return timeTableTemp;
    } catch (err) {
        return null;
    }
} 

function getTodaySchedule(data){
    const weekdays = ['sunday', 'monday', 'tuesday', 'wednesday','thursday','friday','saturday'];
    const date = new Date();
    const day = weekdays[date.getDay()];

    return data[day] || [];
}

function parseTime(time){
    const timeArr = time.split(':');
    console.log(timeArr);
    const timeObject = new Date();
    timeObject.setHours(parseInt(timeArr[0]), parseInt(timeArr[1]));
    return timeObject;
}

initiliazeApp();

