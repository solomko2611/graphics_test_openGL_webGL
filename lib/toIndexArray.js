
/**
 * Converts the values property from data object to array of color indexes
 * @param {*} data Input data
 * @returns {number[]} array of color indexes from 0 to value.max - value.min
 */
export function toIndexArray(data) {
    const {values, value} = data;
    const arr = new Array(data.total_radial_gates * data.gate_depth);
    const transparent = (value.max - value.min) + 1;

    for (let i = 0; i < data.total_radial_gates; i++) {
        const row = values[i];
        
        for (let j = 0; j < data.gate_depth; j++) {
            let col = row[j];
            const index = i * data.gate_depth + j;
            
            if(col === value.none) {
                arr[index] = transparent;
            } else {
                arr[index] = col - value.min;
            }
        }
    }

    return arr;
}