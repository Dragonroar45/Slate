

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
    isDoneForDay: false,
    currentlyViewing: 'today',
    targetDateForClock: new Date()
}

function updateState(){

    const currentTIme = new Date();
    Appstate.targetDateForClock = new Date();

    if (Appstate.currentlyViewing === 'tomorrow'){
        const day = Appstate.targetDateForClock.getDay();
        if (day === 5){
            Appstate.targetDateForClock.setDate(Appstate.targetDateForClock.getDate()+3);
        } else if (day === 6){
            Appstate.targetDateForClock.setDate(Appstate.targetDateForClock.getDate()+2);
        } else{
            Appstate.targetDateForClock.setDate(Appstate.targetDateForClock.getDate()+1);
        }
    }
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
        Appstate.isDoneForDay = true;
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
        subjectName.classList = 'text-4xl text-white font-bold';
        room.classList = "text-3xl text-white font-bold mt-2"
        room.textContent = `Room: ${classInfo.room}`;
        listItem.id = `current-class`;
    } else if (status === 'upcoming'){
        subjectName.classList = 'text-2xl text-slate-400 font-bold';
        room.classList = "text-xl text-slate-400 font-bold mt-2"
        room.textContent = `Room: ${classInfo.room}`
    } else if (status === 'next'){
        eyeBrow.classList = "text-amber-300 text-sm"
        eyeBrow.textContent = "Next";
        subjectName.classList = "text-3xl text-slate-300 font-bold mt-1";
        room.classList = "text-3xl text-slate-300 font-bold mt-4";
        room.textContent = `Room: ${classInfo.room}`;
    }else {
        subjectName.classList = 'text-xl text-slate-500 font-bold line-through';
        room.classList = "text-xl text-slate-600 font-bold mt-1 line-through";
        room.textContent = `Room: ${classInfo.room}`;
    }
    subjectName.textContent = classInfo.subject;
    let classTime = document.createElement('p');
    if (status === 'now') {
        classTime.classList = 'text-slate-400 mt-2 text-2xl';
        classTime.textContent = `Started at: ${classInfo.startTime}`;
    } else if (status === 'upcoming'){
        classTime.classList = 'text-slate-500 mt-2 text-xl';
        classTime.textContent = `Starts at: ${classInfo.startTime}`;
    }else if (status === 'next'){
        let textNode = document.createTextNode('Starts in: ');
        let timerNext = document.createElement("span");
        timerNext.id = "countdown-timer";
        timerNext.textContent = "...";

        classTime.appendChild(textNode);
        classTime.appendChild(timerNext);
        classTime.classList = "text-amber-300 font-semibold text-xl mt-2";
    }else{
        classTime.classList = 'text-slate-400 mt-1 text-bold';
        classTime.textContent = `Ended at: ${classInfo.endTime}`;
    }

    listItem.appendChild(eyeBrow);
    listItem.appendChild(subjectName);
    listItem.appendChild(room);
    listItem.appendChild(classTime);

    return listItem;

}

function renderUI(){
    mainClasses.textContent = " ";
    let todayBtn = document.getElementById("today-btn");
    let tomorrowBtn = document.getElementById("tomorrow-btn");
    if (Appstate.currentlyViewing === 'today'){
        todayBtn.classList.add("bg-purple-700");
        tomorrowBtn.classList.remove("bg-purple-700");
    } else{
        todayBtn.classList.remove("bg-purple-700");
        tomorrowBtn.classList.add("bg-purple-700");
    }
    Appstate.pastClasses.forEach(c => mainClasses.appendChild(createTimelineItem(c, 'past')));
    if (Appstate.currentClass){
        mainClasses.appendChild(createTimelineItem(Appstate.currentClass, 'now'));
    }
    if (Appstate.nextClass){
        mainClasses.appendChild(createTimelineItem(Appstate.nextClass, 'next'));
    }

    Appstate.laterClasses.forEach(c => mainClasses.appendChild(createTimelineItem(c, 'upcoming')));

    if (new Date().getDay() === 6 || new Date().getDay() === 0){
        const weekendMessage = document.createElement('p');
        weekendMessage.textContent = "🎉 No Classes today. Enjoy our day off!";
        weekendMessage.classList = "text-slate-300 font-bold mt-2 text-2xl text-center m-auto";
        mainClasses.appendChild(weekendMessage);
        
    }

    if (Appstate.isDoneForDay && !(new Date().getDay() === 6 || new Date().getDay() === 0)){
        const message = document.createElement('p');
        message.textContent = "✅ All classes are done for today!";
        message.id = "endofdayid";
        mainClasses.appendChild(message);
    } else{
        scrolltoRelevantItem();
    }
}

function updateCountdown(){

    let nextCount = document.getElementById("countdown-timer");

    if (Appstate.currentlyViewing !== 'today' || !nextCount) {
        if (nextCount){
            nextCount.textContent = "--:--" 
        }
        return;
    }
    if (!nextCount){
        return;
    }
    let nextClass = Appstate.nextClass;
    if (!nextClass) {
        nextCount.textContent = "--:--";
      return;
    }
    const timeNow = new Date();
    const nextClassTime = parseTime(nextClass.startTime);
    let timediffMs = nextClassTime - timeNow;

    if (timediffMs < 0){
        repeat();
        return;
    }

    let formattedTime;

    const totalSeconds = Math.floor(timediffMs/1000);
    const totalMinutes = Math.floor(totalSeconds/60);

    if (totalMinutes >= 60){
        let hours = Math.floor(totalMinutes/60);
        let minutes = Math.floor(totalMinutes % 60);
        formattedTime = `${hours}h ${String(minutes).padStart(2, '0')}m`;
    } else{
        const remainSecond = totalSeconds % 60;
        formattedTime = `${String(totalMinutes).padStart(2, '0')}:${String(remainSecond).padStart(2, '0')}`;
    }
    nextCount.textContent = formattedTime;
}

function changeviewToday(){
    if (Appstate.currentlyViewing === 'today'){
        return;
    } else{
        Appstate.currentlyViewing = 'today';
        updateState();
        renderUI();
    }
}

function changeviewTomorrow(){
    if (Appstate.currentlyViewing === 'tomorrow'){
        return;
    } else{
        Appstate.currentlyViewing = 'tomorrow';
        updateState();
        renderUI();
    }
}

let deferredPrompt;

async function initiliazeApp() {
    try {
        mainClasses.textContent = "Loading....";

        const timetableData = await fetchTimeTable();
        Appstate.fullTable = timetableData;
        console.log(Appstate.fullTable);
        let todayBtn = document.getElementById("today-btn");
        let tomorrowBtn = document.getElementById("tomorrow-btn");
        todayBtn.addEventListener('click', changeviewToday);
        tomorrowBtn.addEventListener('click', changeviewTomorrow);

        const installButton = document.getElementById('install-button');

        installButton.classList.add('hidden');

        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
  
            installButton.classList.remove('hidden');
        });

        installButton.addEventListener('click', async () => {
  
            if (deferredPrompt) {
        
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                console.log(`User response to the install prompt: ${outcome}`);
                
                deferredPrompt = null;
                
                installButton.classList.add('hidden');
            }
        });


        setInterval(repeat, runTIme);
        repeat();
        setInterval(updateCountdown, 1000);
    } catch (error) {
        mainClasses.textContent = `ERROR: ${error}`;
        console.error(error);
    }
}


function repeat(){
    updateState();
    renderUI();
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
    const day = new Date().getDay();

    let key;
    if (Appstate.currentlyViewing === 'today') {
        key = weekdays[day]
    } else{
        if (day === 6 || day === 0){
            key = 'monday';
        } else if (day === 5){
            key = 'monday';
        }
        else{
            key = weekdays[day+1]
        }
    }

    return data[key] || [];
}

function parseTime(time){
    const [hours, minutes] = time.split(':');
    const timeObject = new Date(Appstate.targetDateForClock);
    timeObject.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0)
    return timeObject;
};

function getStatus(classInfo, currentTIme){
    const startClassTime = parseTime(classInfo.startTime);
    const endClassTime = parseTime(classInfo.endTime);

    if (currentTIme < startClassTime){
        return "upcoming";
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
            block: 'start'
        })
    }
}

initiliazeApp();

