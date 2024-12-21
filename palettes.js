/**
 * Fetches CSS named colors from a GitHub repository.
 * @async
 * @function getCSSNamedColors
 * @returns {Promise<Object.<string, string>>} A promise that resolves to an object where keys are color names and values are their hex codes.
 * On error returns an empty object {}.
 * @throws {Error} May throw a fetch error which is caught internally
 * @example
 * // Returns object like:
 * {
 *   "red": "#ff0000",
 *   "blue": "#0000ff",
 *   // ... more colors
 * }
 */
export async function getCSSNamedColors() {
  try {
    const response = await fetch('https://raw.githubusercontent.com/bahamas10/css-color-names/master/css-color-names.json');
    const colors = await response.json();
    console.log('Fetched color names:', colors);
    return colors;
  } catch (error) {
    console.error('Error fetching named colors:', error);
    return {};
  }
}

/**
 * Fetches Material Design color palette from GitHub repository.
 * @async
 * @function getMaterialColors
 * @returns {Promise<Object.<string, string>>} A promise that resolves to an object where keys are color names and values are their hex codes.
 * On error returns an empty object {}.
 * @throws {Error} If there is an error fetching or parsing the color data.
 * @example
 * // Returns object like:
 * {
 *   "red50": "#ffebee",
 *   "red100": "#ffcdd2"
 *   // ... more colors
 * }
 */
export async function getMaterialColors() {
  try {
    const response = await fetch('https://raw.githubusercontent.com/carbon-native/carbon-native/master/src/material-colors.json');
    const colors = await response.json();
    console.log('Material-style Colors:', colors);
    return colors;
  } catch (error) {
    console.error('Error fetching material colors:', error);
    return {};
  }
}

/**
 * Converts hex color to RGB values
 * @param {string} hex The hex color code
 * @returns {number[]} Array of [r, g, b] values
 */
function hexToRgb(hex) {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)
    ] : null;
}

/**
 * Finds the closest colors from the provided palettes
 * @param {string} targetColor The color to match against
 * @param {Array<{name: string, colors: Object.<string, string>}>} palettes Array of palette objects
 * @returns {Array} Array of closest color matches with their names and values
 */
export function findClosestColors(targetColor, palettes) {
    const target = hexToRgb(targetColor);
    if (!target) return [];

    const allColors = palettes.flatMap(palette => 
        Object.entries(palette.colors).map(([name, hex]) => ({
            name,
            hex,
            type: palette.name
        }))
    );

    return allColors
        .map(color => {
            const rgb = hexToRgb(color.hex);
            if (!rgb) return null;
            
            const distance = Math.sqrt(
                Math.pow(target[0] - rgb[0], 2) +
                Math.pow(target[1] - rgb[1], 2) +
                Math.pow(target[2] - rgb[2], 2)
            );
            
            return { ...color, distance };
        })
        .filter(Boolean)
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 3);
}
