const date = require('date-and-time')

exports.addDays = function addDays(currentDate, daysToAdd) {
    return date.addDays(currentDate, daysToAdd);
}

exports.isBoolean = (value) => {
    return typeof value === 'boolean';
}

function removeKeys(obj, keys) {
    
    obj = JSON.parse(JSON.stringify(obj))
    keys = JSON.parse(JSON.stringify(keys))

    if (typeof obj !== 'object' || obj === null) {
        return obj;
    }
    const newObj = Array.isArray(obj) ? [] : {};
    for (const key in obj) {
        if (obj.hasOwnProperty(key) && !keys.includes(key)) {
            newObj[key] = removeKeys(obj[key], keys);
        }
    }
    return newObj;
}

exports.compareObjects = (obj1, obj2, keysToIgnore) => {
    console.log('enter')

    const cleanObj1 = removeKeys(obj1, keysToIgnore);
    const cleanObj2 = removeKeys(obj2, keysToIgnore);

    const sortedCleanObj1 = {};
    const sortedCleanObj2 = {};


    Object.keys(cleanObj1).sort().forEach(key => {
        sortedCleanObj1[key] = cleanObj1[key];
    });

    Object.keys(cleanObj2).sort().forEach(key => {
        sortedCleanObj2[key] = cleanObj2[key];
    });

    console.log(JSON.parse(JSON.stringify(sortedCleanObj1)), "compare one")
    console.log(JSON.parse(JSON.stringify(sortedCleanObj2)),"compare two")   

    return JSON.stringify(sortedCleanObj1) === JSON.stringify(sortedCleanObj2);
}