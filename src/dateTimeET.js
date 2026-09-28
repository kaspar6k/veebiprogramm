const dateFormattedET = function(monthType = 0){
    let timeNow = new Date();
	
    const monthNamesET = ['jaanuar', 'veebruar', 'märts', 'aprill', 'mai', 'juuni', 'juuli', 'august', 'september', 'oktoober', 'november', 'detsember'];
	
    const monthNamesFolkET = ['näärikuu', 'küünlakuu', 'paastukuu', 'jürikuu', 'lehekuu', 'jaanikuu', 'heinakuu', 'lõikuskuu', 'mihklikuu', 'talvekuu', 'hingekuu', 'jõulukuu'];
	
    let monthNames = monthNamesET;
    if(monthType === 1){
        monthNames = monthNamesFolkET;
    }
    return timeNow.getDate() + '. ' + monthNames[timeNow.getMonth()] + ' ' + timeNow.getFullYear();
}

const weekDayET = function(){
    const weekdayNamesET = ['pühapäev', 'esmaspäev', 'teisipäev', 'kolmapäev', 'neljapäev', 'reede', 'laupäev'];
    let timeNow = new Date();
    return weekdayNamesET[timeNow.getDay()];
}

const addLeadZero = function(numValue){
    if(numValue < 10){
        numValue = String(numValue).padStart(2, '0');
    }
    return numValue
}

const timeFormattedET = function(){
    let timeNow = new Date();
    let hourNow = timeNow.getHours();
    let minuteNow = timeNow.getMinutes();
    let secondNow = timeNow.getSeconds();
    let timeFormatted = addLeadZero(hourNow) + ':' + addLeadZero(minuteNow) + ':' + addLeadZero(secondNow);
    return timeFormatted;
}
module.exports = {fullDate: dateFormattedET, weekDay: weekDayET, fullTime: timeFormattedET};
