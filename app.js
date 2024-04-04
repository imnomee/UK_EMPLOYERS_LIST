import data from './data.js';

// Function to filter out duplicates and add unique objects to a new array
function filterDuplicates(array) {
    const map = new Map();
    const uniqueObjects = [];

    array.forEach((obj) => {
        const firstKey = Object.values(obj)[0]; // Get the value of the first key in the object
        if (!map.has(firstKey)) {
            map.set(firstKey, true); // Add value to the map if it doesn't already exist
            uniqueObjects.push(obj); // Add unique object to the new array
        }
    });

    return uniqueObjects;
}

const uniqueObjectsArray = filterDuplicates(data);
console.log('Unique objects:', uniqueObjectsArray.length);
