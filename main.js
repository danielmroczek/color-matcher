import { getCSSNamedColors, getMaterialColors, findClosestColors } from './palettes.js';

let palettes = [];
let activePalettes = [];

async function init() {
    const namedColors = await getCSSNamedColors();
    const materialColors = await getMaterialColors();
    
    palettes = [
        { name: 'CSS', colors: namedColors },
        { name: 'Material', colors: materialColors }
    ];
    
    activePalettes = [...palettes];
    setupPaletteSelectors();
    setupColorInput();
}

function setupPaletteSelectors() {
    const checkboxes = document.querySelectorAll('input[name="palette"]');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            activePalettes = palettes.filter(p => 
                document.querySelector(`input[value="${p.name}"]`).checked
            );
            
            // Rerun the color matching if we have a current color
            const input = document.getElementById('colorInput');
            if (input.value) {
                input.dispatchEvent(new Event('input'));
            }
        });
    });
}

function setupColorInput() {
    const input = document.getElementById('colorInput');
    const results = document.getElementById('results');

    input.addEventListener('input', (e) => {
        try {
            const color = e.target.value;
            if (!color) {
                results.style.display = 'none';
                return;
            }
            
            // Test if the color is valid
            const testEl = document.createElement('div');
            testEl.style.color = color;
            if (testEl.style.color === '') {
                results.style.display = 'none';
                return;
            }

            // Convert to hex format
            testEl.style.color = color;
            document.body.appendChild(testEl);
            const computedColor = getComputedStyle(testEl).color;
            document.body.removeChild(testEl);
            
            const hex = rgbToHex(computedColor);
            if (!hex) {
                results.style.display = 'none';
                return;
            }

            // Only show results if we got this far (valid color)
            results.style.display = 'block';
            document.body.style.backgroundColor = hex;
            
            const closest = findClosestColors(hex, activePalettes);
            displayResults(closest);
        } catch (error) {
            results.style.display = 'none';
            console.error('Invalid color:', error);
        }
    });
}

function rgbToHex(rgb) {
    const rgbArray = rgb.match(/\d+/g);
    if (!rgbArray) return '';
    const [r, g, b] = rgbArray;
    return '#' + [r, g, b].map(x => {
        const hex = parseInt(x).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');
}

function displayResults(matches) {
    const results = document.getElementById('results');
    const currentColor = document.getElementById('currentColor');
    const matchesDiv = document.getElementById('matches');
    
    // Display current color
    currentColor.innerHTML = `
        <div class="color-swatch" style="background-color: ${document.body.style.backgroundColor}"></div>
        <div class="color-info">
            <span class="color-name">Current Color</span>
            <span class="color-value">${document.body.style.backgroundColor}</span>
        </div>
    `;

    // Display matches
    matchesDiv.innerHTML = matches.map(match => `
        <div class="color-match">
            <div class="color-swatch" style="background-color: ${match.hex}"></div>
            <div class="color-info">
                <span class="color-name">${match.type}: ${match.name}</span>
                <span class="color-value">${match.hex}</span>
            </div>
        </div>
    `).join('');
}

init();
