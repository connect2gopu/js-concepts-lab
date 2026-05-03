function timeToPixels(hour, minute, totalHeight) {
  // your logic here

  let totalMinuts = hour * 60 + minute;
  let pixelEachMinute = totalHeight / (24 * 60)

  let totalPixels = totalMinuts * pixelEachMinute;
  return totalPixels
}

// Test it
const TOTAL_HEIGHT = 1200;
console.log(timeToPixels(9, 30, TOTAL_HEIGHT));  // expected: ?
console.log(timeToPixels(0, 0, TOTAL_HEIGHT));   // midnight → should be 0
console.log(timeToPixels(12, 0, TOTAL_HEIGHT));  // noon → should be 600

console.log('eventHeight')
function eventHeight(startHour, startMin, endHour, endMin, totalHeight) {
  let endMinutes = endHour * 60 + endMin;
  let startMinutes = startHour * 60 + startMin;

  let totalEventMinutes = endMinutes - startMinutes;
  let pixelEachMinute = totalHeight / (24 * 60)

  return pixelEachMinute * totalEventMinutes;
}


console.log(eventHeight(10, 30, 11, 15, TOTAL_HEIGHT)); 
console.log(eventHeight(10, 45, 11, 45, TOTAL_HEIGHT)); 
console.log(eventHeight(12, 30, 12, 45, TOTAL_HEIGHT)); 
console.log(eventHeight(0, 0, 23, 59, TOTAL_HEIGHT)); 
console.log(eventHeight(0, 0, 24, 0, TOTAL_HEIGHT)); 


// Step 1: Generate the 24 hour labels
// Expected output:
// ["12 AM", "1 AM", "2 AM", ..., "11 AM", "12 PM", "1 PM", ..., "11 PM"]

function generateHourLabels() {
  // your logic here

  let labels = []

  for (let i = 0; i < 24; i++) {
    let amOrPm = i > 11 ? 'PM' : 'AM';

    let hour = i % 12 
    let finalHour = hour == 0 ? 12 : hour

    let currLabel = finalHour + ' ' + amOrPm;
    labels.push(currLabel)
  }

  return labels
}

console.log(generateHourLabels());





