import fragmentSource from './shaders/fragment.glsl?raw'
import vertexSource from './shaders/vertex.glsl?raw'
import data from './data/data.json'
import colorTable from './data/colortable.json'
import { hexToRgb } from './lib/color';
import { toIndexArray } from './lib/toIndexArray';
import { createRGBTexture2D, createRTexture2D } from './lib/texture';
import { makeProgram } from './lib/program';

const towerLocation = {
    lng: -104.181297,
    lat: 38.459438
}

/**
 * Returns 4 corners of a box around given location
 * @param {*} location 
 * @param {number} radius in meters
 * @returns 
 */
function getRectCoordinates(location, radius) {
    const centerCoords = mapboxgl.MercatorCoordinate.fromLngLat(location);

    const offset = radius * centerCoords.meterInMercatorCoordinateUnits();
    const topLeft = new mapboxgl.MercatorCoordinate(centerCoords.x - offset, 
        centerCoords.y - offset, centerCoords.z);
    const topRight = new mapboxgl.MercatorCoordinate(centerCoords.x + offset, 
        centerCoords.y - offset, centerCoords.z);
    const bottomLeft = new mapboxgl.MercatorCoordinate(centerCoords.x - offset, 
        centerCoords.y + offset, centerCoords.z);
    const bottomRight = new mapboxgl.MercatorCoordinate(centerCoords.x + offset, 
        centerCoords.y + offset, centerCoords.z);

    return {topLeft, topRight, bottomLeft, bottomRight}
}

function main() {

    mapboxgl.accessToken = '';
    const map = new mapboxgl.Map({
        container: 'map',
        zoom: 7,
        center: [towerLocation.lng, towerLocation.lat],
        // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
        style: 'mapbox://styles/mapbox/dark-v11',
        antialias: true, // create the gl context with MSAA antialiasing, so custom layers are antialiased
        projection: 'mercator'
    });

    // create a custom style layer to implement the WebGL content
    const highlightLayer = {
        id: 'highlight',
        type: 'custom',

        // method called when the layer is added to the map
        // https://docs.mapbox.com/mapbox-gl-js/api/#styleimageinterface#onadd
        onAdd: function (map, gl) {
            this.program = makeProgram(gl, vertexSource, fragmentSource);
            
            if(!this.program) return;

            // Save Uniform locations
            this.aPos = gl.getAttribLocation(this.program, 'a_pos');
            this.aUv = gl.getAttribLocation(this.program, 'a_uv');
            this.uTexture = gl.getUniformLocation(this.program, 'u_texture');
            this.uColor = gl.getUniformLocation(this.program, 'u_colorTable');
            this.uInnerRadius = gl.getUniformLocation(this.program, 'u_innerRadius');
            this.uColorTableWidth = gl.getUniformLocation(this.program, 'u_colorTableWidth');

            const radius = data.gate_depth * data.meters_between_gates + data.meters_to_first_gate;
            const innerRadius = data.meters_to_first_gate / radius;

            // Create a rect around tower
            const coords = getRectCoordinates(towerLocation, radius);

            // create and initialize a WebGLBuffer to store vertex and color data
            this.buffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
            gl.bufferData(
                gl.ARRAY_BUFFER,
                new Float32Array([
                    // Position                                 // UV
                    coords.topLeft.x, coords.topLeft.y,         0.0, 1.0, 
                    coords.bottomLeft.x, coords.bottomLeft.y,   0.0, 0.0,
                    coords.topRight.x, coords.topRight.y,       1.0, 1.0,
                    coords.bottomRight.x, coords.bottomRight.y, 1.0, 0.0
                ]),
                gl.STATIC_DRAW
            );
            
            const colorsArr = colorTable.map(c => hexToRgb(c) ).flat();
            const colorsTableWidth = colorsArr.length / 3;
            const mapArr = toIndexArray(data);
            this.colorTexture = createRGBTexture2D(gl, colorsTableWidth, 1, new Uint8Array(colorsArr));
            this.radarTexture = createRTexture2D(gl, data.gate_depth, data.total_radial_gates, new Uint8Array(mapArr));

            // Set uniforms
            gl.useProgram(this.program);
            gl.uniform1f(this.uInnerRadius, innerRadius);
            gl.uniform1f(this.uColorTableWidth, colorsTableWidth);
        },

        render: function (gl, matrix) {
            gl.useProgram(this.program);
            gl.uniformMatrix4fv(
                gl.getUniformLocation(this.program, 'u_matrix'),
                false,
                matrix
            );
            gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
            gl.enableVertexAttribArray(this.aPos);
            gl.vertexAttribPointer(this.aPos, 2, gl.FLOAT, false, 4 * Float32Array.BYTES_PER_ELEMENT, 0);

            gl.enableVertexAttribArray(this.aUv);
            gl.vertexAttribPointer(this.aUv, 2, gl.FLOAT, false, 4 * Float32Array.BYTES_PER_ELEMENT, 2 * Float32Array.BYTES_PER_ELEMENT);

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this.radarTexture);
            gl.uniform1i(this.uTexture, 0);
        
            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, this.colorTexture);
            gl.uniform1i(this.uColor, 1);

            gl.enable(gl.BLEND);
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        }
    };

    // add the custom style layer to the map
    map.on('load', () => {
        map.addLayer(highlightLayer, 'building');
    });

}

main();