function getPosition() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      displayPrayerTimes(position);
    }, function() {
      alert("Please enable location access in your browser settings to view prayer times.");
    });
  } else {
    alert("Geolocation is not supported by this browser.");
  }
}


function getHijriDate() {
  var date = new Date();
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var day = date.getDate();
  var apiUrl = `https://api.aladhan.com/v1/gToH?date=${day}-${month}-${year}`;
  axios.get(apiUrl)
    .then(function(response) {
      var hijriDate = response.data.data.hijri;
      var gregorianDate = response.data.data.gregorian;
      var hijriDayName = hijriDate.weekday.ar;
      var hijriDay = hijriDate.day;
      var hijriMonth = hijriDate.month.ar;
      var hijriYear = hijriDate.year;
      var gregorianDayName = gregorianDate.weekday.en;
      var gregorianDay = gregorianDate.day;
      var gregorianMonth = gregorianDate.month.en;
      var gregorianYear = gregorianDate.year;
      var hijriDateStr = `${hijriDayName} ${hijriDay} ${hijriMonth} ${hijriYear} هـ`;
      var gregorianDateStr = `${gregorianDayName} ${gregorianDay} ${gregorianMonth} ${gregorianYear}`;
      document.getElementById("hijri-date").innerHTML = hijriDateStr;
      document.getElementById("gregorian-date").innerHTML = gregorianDateStr;
    })
    .catch(function(error) {
      console.log(error);
    });
}

function getPosition() {
  if (navigator.permissions) {
    navigator.permissions.query({name:'geolocation'}).then(function(permissionStatus) {
      if (permissionStatus.state === 'granted') {
        // User has granted permission, continue to get location
        getPosition();
      } else if (permissionStatus.state === 'prompt') {
        // Permission is not granted or denied, show a prompt to ask for permission
        navigator.geolocation.getCurrentPosition(function(position) {
          // User has granted permission, continue to get location
          displayPrayerTimes(position);
        }, function() {
          // User has denied permission, show an error message
          alert("Please enable location services to use this feature.");
        });
      } else if (permissionStatus.state === 'denied') {
        // Permission is denied, show an error message
        alert("Please enable location services to use this feature.");
      }
    });
  } else {
    // Geolocation not supported, show an error message
    alert("Geolocation is not supported by your browser.");
  }
  
  navigator.geolocation.getCurrentPosition(function(position) {
    displayPrayerTimes(position);
  });
}

function displayPrayerTimes(position) {
  var latitude = position.coords.latitude;
  var longitude = position.coords.longitude;
  var currentDate = new Date().toISOString().slice(0, 10);
  var apiUrl = `https://api.aladhan.com/v1/timings/${currentDate}?latitude=${latitude}&longitude=${longitude}&method=2`;

  axios.get(apiUrl)
    .then(function(response) {
      var prayerTimes = response.data.data.timings;
      var fajrTime12Hour = convertTo12HourFormat(prayerTimes.Fajr);
      var dhuhrTime12Hour = convertTo12HourFormat(prayerTimes.Dhuhr);
      var asrTime12Hour = convertTo12HourFormat(prayerTimes.Asr);
      var maghribTime12Hour = convertTo12HourFormat(prayerTimes.Maghrib);
      var ishaTime12Hour = convertTo12HourFormat(prayerTimes.Isha);
      document.getElementById("fajr-time").innerHTML = fajrTime12Hour;
      document.getElementById("dhuhr-time").innerHTML = dhuhrTime12Hour;
      document.getElementById("asr-time").innerHTML = asrTime12Hour;
      document.getElementById("maghrib-time").innerHTML = maghribTime12Hour;
      document.getElementById("isha-time").innerHTML = ishaTime12Hour;
      
      displayRemainingTime(prayerTimes);
    })
    .catch(function(error) {
      console.log(error);
    });
}

function displayRemainingTime(prayerTimes) {
  var currentTime = new Date();
  var currentUtcOffset = currentTime.getTimezoneOffset() / 60;
  var currentHour = currentTime.getHours() + currentUtcOffset;
  var currentMinute = currentTime.getMinutes();
  var nextPrayerTime = '';
  var nextPrayerName = '';

  var timeList = [
    { name: "الفجر", time: prayerTimes.Fajr },
    { name: "الظهر", time: prayerTimes.Dhuhr },
    { name: "العصر", time: prayerTimes.Asr },
    { name: "المغرب", time: prayerTimes.Maghrib },
    { name: "العشاء", time: prayerTimes.Isha },
  ];

  for (var i = 0; i < timeList.length; i++) {
    var currentPrayerHour = parseInt(timeList[i].time.split(":")[0]);
    var currentPrayerMinute = parseInt(timeList[i].time.split(":")[1]);

    if (
      currentHour < currentPrayerHour ||
      (currentHour === currentPrayerHour && currentMinute < currentPrayerMinute)
    ) {
      nextPrayerTime = timeList[i].time;
      nextPrayerName = timeList[i].name;
      break;
    }
  }

  if (!nextPrayerTime) {
    nextPrayerTime = timeList[0].time;
    nextPrayerName = timeList[0].name;
  }

  var remainingTime = getRemainingTime(nextPrayerTime, currentTime);
  var nextPrayerStr =
    "الصلاة القادمة في: " +
    nextPrayerName +
    " (" +
    convertTo12HourFormat(nextPrayerTime) +
    ") " +
    "بعد " +
    remainingTime;
  document.getElementById("next-prayer").innerHTML = nextPrayerStr;

  // Update remaining time every second
  setTimeout(function () {
    displayRemainingTime(prayerTimes);
  }, 1000);
}

function getRemainingTime(prayerTime, currentTime) {
  var endTime = new Date(currentTime.toDateString() + " " + prayerTime);
  var diff = endTime - currentTime;
  var hours = Math.floor(diff / 1000 / 60 / 60);
  var minutes = Math.floor(diff / 1000 / 60) % 60;
  var seconds = Math.floor(diff / 1000) % 60;
  return `${hours} ساعة ${minutes} دقيقة ${seconds} ثانية`;
}

function convertTo12HourFormat(time24Hour) {
  var time24 = time24Hour.split(":");
  var hours24 = parseInt(time24[0]);
  var hours = ((hours24 + 11) % 12) + 1;
  var minutes = time24[1];
  var amPm = hours24 >= 12 ? "مساءً" : "صباحًا";
  return hours + ":" + minutes + " " + amPm;
}

getHijriDate();
getPosition();


