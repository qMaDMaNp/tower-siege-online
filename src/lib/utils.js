export const getObjectByKeyValue = (arr, value, key = 'id') => {
    for (let i = 0; i < arr.length; i++) {
        if (arr[i][key] === value) return arr[i];
    }

    return null;
}

export const getObjectIndexByKeyValue = (arr, value, key = 'id') => {
    for (let i = 0; i < arr.length; i++) {
        if (arr[i][key] === value) return i;
    }

    return null;
}
