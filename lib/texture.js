/**
 * Helper function to create a 2D texture with gl.NEAREST filtering and gl.CLAMP_TO_EDGE
 * @param {WebGL2RenderingContext} gl 
 * @returns {WebGLTexture}
 */
export function createTexture2D(gl) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return texture;
}

/**
 * Helper function to create single channel (Red) 2D texture with gl.UNSIGNED_BYTE data type
 * Uses createTexture2D() function to create the base texture
 * @param {WebGL2RenderingContext} gl 
 * @param {number} width 
 * @param {number} height 
 * @param {*} data 
 * @returns {WebGLTexture}
 */
export function createRTexture2D(gl, width, height, data) {
    const texture = createTexture2D(gl);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8, width, height, 0, gl.RED, gl.UNSIGNED_BYTE, data);
    return texture;
}

/**
 * Helper function to create 3 channel (RGB) 2D texture with gl.UNSIGNED_BYTE data type
 * Uses createTexture2D() function to create the base texture
 * @param {WebGL2RenderingContext} gl 
 * @param {number} width 
 * @param {number} height 
 * @param {*} data 
 * @returns {WebGLTexture}
 */
export function createRGBTexture2D(gl, width, height, data) {
    const texture = createTexture2D(gl);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 4);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, width, height, 0, gl.RGB, gl.UNSIGNED_BYTE, data);
    return texture;
}