

import './style.css';

let mainClasses = document.getElementById("main-classes");
const URL = "https://harshslatedata.blob.core.windows.net/public/timetable.json";
let runTIme = 10000;

const Appstate = {
    fullTable: null,
    pastClasses: [],
    currentClass: null,
    nextClass: null,
    laterClasses: [],
    isDoneForDay: false
}

function updateState(){

    const currentTIme = new Date();
    Appstate.pastClasses = [];
    Appstate.currentClass = null;
    Appstate.nextClass = null;
    Appstate.laterClasses = [];
    Appstate.isDoneForDay = false;

    const todaySchedule = getTodaySchedule(Appstate.fullTable);

    if (todaySchedule.length === 0){
            Appstate.isDoneForDay = true;
            return;
    }
    let foundNext = false;

    todaySchedule.forEach(classInfo =>{
        let status = getStatus(classInfo, currentTIme)
        if (status === 'past'){
            Appstate.pastClasses.push(classInfo);
        } else if (status === 'now'){
            Appstate.currentClass = classInfo
        } else if(status === 'upcoming' && foundNext === false){
            foundNext = true;
            Appstate.nextClass = classInfo;
        } else{
            Appstate.laterClasses.push(classInfo);
        }
    })
    if (Appstate.pastClasses.length === todaySchedule.length) {
        if (!Appstate.currentClass) {
        Appstate.isDoneForTheDay = true;
        }
    }
}

function createTimelineItem(classInfo, status){
    let listItem = document.createElement('li');
    listItem.classList = 'text-center justify-center items-center p-8 flex flex-col gap-8';

    let eyeBrow = document.createElement("p");
    
    let subjectName = document.createElement('p');
    let room = document.createElement("p");
    if (status === 'now') {
        eyeBrow.classList = "text-green-400 font-bold text-sm";
        eyeBrow.textContent = 'Now';
        subjectName.classList = 'text-5xl text-white font-bold';
        room.classList = "text-5xl text-white font-bold mt-4"
        room.textContent = `Room: ${classInfo.room}`;
        listItem.id = `current-class`;
    } else if (status === 'upcoming'){

        subjectName.classList = 'text-3xl text-slate-300 font-bold mt-1';
        room.classList = "text-2xl text-slate-300 font-bold mt-4"
        room.textContent = `Room: ${classInfo.room}`
    } else if (status === 'next'){
        subjectName.classList = "text-3xl text-slate-300 font-bold mt-1";
        room.classList = "text-3xl text-slate-300 font-bold mt-4";
        room.textContent = `Room: ${classInfo.room}`;
    }else {
        subjectName.classList = 'text-xl text-slate-300 font-bold mt-1';
        room.classList = "text-xl text-slate-300 font-bold mt-1";
        room.textContent = `Room: ${classInfo.room}`;
    }
    subjectName.textContent = classInfo.subject;
    let classTime = document.createElement('p');
    if (status === 'now') {
        classTime.classList = 'text-slate-500 mt-4';
    } else if (status === 'upcoming'){
        classTime.classList = 'text-slate-400 mt-2';
    } else{
        classTime.classList = 'text-slate-400 mt-';
    }

    classTime.textContent = `Time: ${classInfo.startTime} - ${classInfo.endTime}`;
    listItem.appendChild(eyeBrow);
    listItem.appendChild(subjectName);
    listItem.appendChild(classTime);

    return listItem;

}

function renderUI(){
    mainClasses.textContent = " ";
    Appstate.pastClasses.forEach(c => mainClasses.appendChild(createTimelineItem(c, 'past')));
    if (Appstate.currentClass){
        mainClasses.appendChild(createTimelineItem(Appstate.currentClass, 'now'));
    }
    if (Appstate.nextClass){
        mainClasses.appendChild(createTimelineItem(Appstate.nextClass, 'next'));
    }

    Appstate.laterClasses.forEach(c => mainClasses.appendChild(createTimelineItem(c, 'upcoming')));

    if (Appstate.isDoneForDay){
        const message = document.createElement('p');
        message.textContent = "✅ All classes are done for today!";
        message.id = "endofdayid";
        mainClasses.appendChild(message);
    } else{
        scrolltoRelevantItem();
    }
}

async function initiliazeApp() {
    try {
        mainClasses.textContent = "Loading....";
        const timetableData = await fetchTimeTable();
        Appstate.fullTable = timetableData;
        console.log(Appstate.fullTable);

        function repeat(){
            updateState();
            renderUI();
        }

        setInterval(repeat, runTIme);
        repeat();
    } catch (error) {
        mainClasses.textContent = `ERROR: ${error}`;
        console.error(error);
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
    const timeObject = new Date();
    timeObject.setHours(parseInt(timeArr[0]), parseInt(timeArr[1]));
    return timeObject;
};

function getStatus(classInfo, currentTIme){
    const startClassTime = parseTime(classInfo.startTime);
    const endClassTime = parseTime(classInfo.endTime);

    if (currentTIme < startClassTime){
        return "Upcoming";
    } else if (currentTIme >= startClassTime && currentTIme < endClassTime){
        return "now";
    } else{
        return "past";
    }
}

function scrolltoRelevantItem(){
    let elementToScroll = null;

    if (Appstate.isDoneForDay){
        elementToScroll = document.getElementById("endofdayid");
    } else if (Appstate.currentClass){
        elementToScroll = document.getElementById("current-class");
    }

    if (elementToScroll){
        elementToScroll.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        })
    }
}

initiliazeApp();

