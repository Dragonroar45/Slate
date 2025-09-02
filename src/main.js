import './style.css';

let mainClasses = document.getElementById("main-classes");

const URL = "https://harshslatedata.blob.core.windows.net/public/timetable.json";

async function initiliazeApp() {
    const timetableData = await fetchTimeTable();
    const todaySchedule = fetchSchedule(timetableData);
    console.log(todaySchedule);
}

async function fetchTimeTable() {
    try {
        const timeTablePromise = await fetch(URL);
        if (!timeTablePromise.ok){
            throw new Error(`HTTP ERROR: ${timeTablePromise.status}`)
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

initiliazeApp();
