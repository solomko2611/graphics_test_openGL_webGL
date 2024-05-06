

/**
 * Converts hex string in format of #xxxxxx to array of RGB values
 * @param {string} hex 
 * @returns {number[]}
 */
export const hexToRgb = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return [ r, g, b ];
}
