const canvas = document.getElementById('colorPalette');
const ctx = canvas.getContext('2d', { willReadFrequently: true });
const hueCanvas = document.getElementById('hueBar');
const hueCtx = hueCanvas.getContext('2d');
const alphaCanvas = document.getElementById('alphaBar');
const alphaCtx = alphaCanvas.getContext('2d');

function setPaletteSize(width=500, height=300, hueBarHeight=30, alphaBarWidth=30) {
    canvas.width = hueCanvas.width = width;
    canvas.height = alphaCanvas.height = height || width;
    hueCanvas.height = hueBarHeight;
    alphaCanvas.width = alphaBarWidth;
}
setPaletteSize();

const result = { r: 255, g: 0, b: 0, a: 1 };

function drawColorPalette(hue) {
    const { width, height } = canvas;

    // Fill base with hue
    ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
    ctx.fillRect(0, 0, width, height);
  
    // Overlay white (saturation)
    const whiteGrad = ctx.createLinearGradient(0, 0, width, 0);
    whiteGrad.addColorStop(0.001, 'rgba(255,255,255,1)');
    whiteGrad.addColorStop(0.999, 'rgba(255,255,255,0)');
    ctx.fillStyle = whiteGrad;
    ctx.fillRect(0, 0, width, height);
  
    // Overlay black (value/brightness)
    const blackGrad = ctx.createLinearGradient(0, 0, 0, height);
    blackGrad.addColorStop(0.001, 'rgba(0,0,0,0)');
    blackGrad.addColorStop(0.999, 'rgba(0,0,0,1)');
    ctx.fillStyle = blackGrad;
    ctx.fillRect(0, 0, width, height);
}

function extractColor() {
    const x = floor(colorSliderPos.x), y = floor(colorSliderPos.y);
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    result.r = pixel[0];
    result.g = pixel[1];
    result.b = pixel[2];
}

function drawHueBar() {
    const { width, height } = hueCanvas;
    const hueGradient = ctx.createLinearGradient(0, 0, width, 0);
    for(let i = 0; i <= 360; i++) {
        hueGradient.addColorStop(i / 360, `hsl(${i}, 100%, 50%)`);
    }
    hueCtx.fillStyle = hueGradient;
    hueCtx.fillRect(0, 0, width, height);
}

function drawAlphaBar() {
    const { width, height } = alphaCanvas;

    const sqSize = 5;
    const canvas = new OffscreenCanvas(sqSize * 2, sqSize * 2);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'hsl(0, 0%, 40%)';
    ctx.fillRect(0, 0, sqSize, sqSize);
    ctx.fillRect(sqSize, sqSize, sqSize, sqSize);
    ctx.fillStyle = 'hsl(0, 0%, 20%)';
    ctx.fillRect(sqSize, 0, sqSize, sqSize);
    ctx.fillRect(0, sqSize, sqSize, sqSize);

    const image = new Image();
    canvas.convertToBlob().then(blob => {
        const url = URL.createObjectURL(blob);
        image.src = url;
    });

    image.onload = () => {
        const colorUnderlay = document.getElementById('colorUnderlay');
        colorUnderlay.style.backgroundImage = `url(${image.src})`;

        const pattern = ctx.createPattern(image, 'repeat');
        alphaCtx.fillStyle = pattern;
        alphaCtx.fillRect(0, 0, width, height);
    
        const alphaGradient = ctx.createLinearGradient(0, 0, 0, height);
        alphaGradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        alphaGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        alphaCtx.fillStyle = alphaGradient;
        alphaCtx.fillRect(0, 0, width, height);
    }
}

drawColorPalette(0);
drawHueBar();
drawAlphaBar();

let canvasMetrics = canvas.getBoundingClientRect(), 
    hueCanvasMetrics = hueCanvas.getBoundingClientRect(), 
    alphaCanvasMetrics = alphaCanvas.getBoundingClientRect();
    
window.addEventListener('resize', () => {
    canvasMetrics = canvas.getBoundingClientRect(), 
    hueCanvasMetrics = hueCanvas.getBoundingClientRect(), 
    alphaCanvasMetrics = alphaCanvas.getBoundingClientRect();
});

const colorSlider = document.getElementById('colorSlider');
const hueSlider = document.getElementById('hueSlider');
const alphaSlider = document.getElementById('alphaSlider');

const colorSliderPos = { x: canvasMetrics.width - 1, y: 0 };

function setColorSliderPos(x, y) {
    colorSlider.style.top = toPixels(y);
    colorSlider.style.left = toPixels(x);
    colorSliderPos.x = x;
    colorSliderPos.y = y;
}
function setHueSliderPos(x) {
    hueSlider.style.left = toPixels(x);
    const hue = Math.floor(x / hueCanvasMetrics.width * 360);
    drawColorPalette(hue);
}
function setAlphaSliderPos(y) {
    alphaSlider.style.top = toPixels(y);
}
function drawResultColor() {
    const resultShower = document.getElementById('result');
    const { r, g, b, a } = result;
    resultShower.style.backgroundColor = `rgba(${r}, ${g}, ${b}, ${a})`;
}

let dragging = false, 
    colorPicker = false, 
    hueBar = false, 
    alphaBar = false;
canvas.addEventListener('mousedown', e => {
    if(!dragging) {
        setColorSliderPos(e.offsetX, e.offsetY);
        dragging = colorPicker = true;
    }
});
hueCanvas.addEventListener('mousedown', e => {
    if (!dragging) {
        setHueSliderPos(e.offsetX);
        dragging = hueBar = true;
    }
});
alphaCanvas.addEventListener('mousedown', e => {
    if (!dragging) {
        setAlphaSliderPos(e.offsetY);
        dragging = alphaBar = true;
    }
});
window.addEventListener('mousemove', e => {
    if(dragging) {
        if(colorPicker) {
            const pos = clamp2D(
                e.x, e.y, 
                canvasMetrics.x, canvasMetrics.y, 
                canvasMetrics.width - 1, canvasMetrics.height - 1);
            const x = pos.x - canvasMetrics.x,
                  y = pos.y - canvasMetrics.y;
            setColorSliderPos(x, y);
        } else if(hueBar) {
            const { x } = clamp2D(
                e.x, e.y, 
                hueCanvasMetrics.x, hueCanvasMetrics.y, 
                hueCanvasMetrics.width, hueCanvasMetrics.height);
            setHueSliderPos(x - hueCanvasMetrics.left);
            // hueSlider.style.backgroundColor = `hsl(${hue}, 100%, 50%)`;
        } else if(alphaBar) {
            const { y } = clamp2D(
                e.x, e.y, 
                alphaCanvasMetrics.x, alphaCanvasMetrics.y, 
                alphaCanvasMetrics.width, alphaCanvasMetrics.height);
            setAlphaSliderPos(y - alphaCanvasMetrics.top);
            const alpha = 1 - (y - alphaCanvasMetrics.top) / alphaCanvasMetrics.height;
            result.a = alpha;
        }
        extractColor();
        drawResultColor();
        updateNotations(result);
    }
});
window.addEventListener('mouseup', () => {
    if(dragging) {
        dragging = colorPicker = hueBar = alphaBar = false;
        extractColor();
        drawResultColor();
        updateNotations(result);
    }
});

colorSlider.addEventListener('mousedown', () => {
    if (!dragging) {
        dragging = colorPicker = true;
    }
});
hueSlider.addEventListener('mousedown', () => {
    if (!dragging) {
        dragging = hueBar = true;
    }
});
alphaSlider.addEventListener('mousedown', () => {
    if (!dragging) {
        dragging = alphaBar = true;
    }
});

function hexToRgb(hex) {
    hex = hex.replace(/^#/, '');
  
    if (hex.length === 3 || hex.length === 4) {
        hex = hex.split('').map(char => char + char).join('');
    }
  
    if (hex.length !== 6 && hex.length !== 8) {
        return null;
    }
  
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const a = hex.length === 8 ? parseInt(hex.substring(6, 8), 16) / 255 : 1;

    if(isNaN(r) || isNaN(g) || isNaN(b) || isNaN(a)) return null;
    
    return { r, g, b, a };
}
function rgbToHex({r, g, b, a=1}) {
    const toHex = (value) => {
      const hex = Math.round(value).toString(16).padStart(2, '0');
      return hex;
    };
    return `${toHex(r)}${toHex(g)}${toHex(b)}${a < 1 ? toHex(a * 255) : ''}`;
}
function hsvToRgb({h, s, v, a=1}) {
    s /= 100;
    v /= 100;

    const c = v * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = v - c;

    const i = Math.floor(h / 60) % 6;
    const [r1, g1, b1] = [
        [c, x, 0],
        [x, c, 0],
        [0, c, x],
        [0, x, c],
        [x, 0, c],
        [c, 0, x]
    ][i];

    return {
        r: Math.round((r1 + m) * 255),
        g: Math.round((g1 + m) * 255),
        b: Math.round((b1 + m) * 255),
        a
    };
}
function rgbToHsv({r, g, b, a=1}) {
    r /= 255;
    g /= 255;
    b /= 255;
    let max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, v = max;

    let d = max - min;
    s = max === 0 ? 0 : d / max;

    if (max === min) {
        h = 0; // achromatic
    } else {
        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)); break;
            case g: h = ((b - r) / d + 2); break;
            case b: h = ((r - g) / d + 4); break;
        }
        h /= 6;
    }

    h = Math.round(h * 360);
    s = Math.round(s * 100);
    v = Math.round(v * 100);

    return { h, s, v, a };
}
function hslToRgb({h, s, l, a=1}) {
    s /= 100;
    l /= 100;

    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;

    let [r, g, b] = (h < 60) ? [c, x, 0] :
                    (h < 120) ? [x, c, 0] :
                    (h < 180) ? [0, c, x] :
                    (h < 240) ? [0, x, c] :
                    (h < 300) ? [x, 0, c] : [c, 0, x];

    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);

    return { r, g, b, a };
}
function rgbToHsl({r, g, b, a=1}) {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const delta = max - min;

    let h = 0, s = 0, l = (max + min) / 2;

    if (delta !== 0) {
        s = delta / (1 - Math.abs(2 * l - 1));

        switch (max) {
            case r: h = ((g - b) / delta + (g < b ? 6 : 0)); break;
            case g: h = ((b - r) / delta + 2); break;
            case b: h = ((r - g) / delta + 4); break;
        }

        h *= 60;
    }

    h = Math.round(h);
    s = Math.round(s * 100);
    l = Math.round(l * 100);
    return { h, s, l, a };
}

function updateHexNotation(hex) {
    hexInputNode.value = hex;
}
function updateNotation(notationNodes, values) {
    for(const inputNode of notationNodes) {
        inputNode.value = truncate(values[inputNode.getAttribute('key')], 3);
    }
}
function updateRGBANotation(rgba) {
    updateNotation(rgbaInputNodes, rgba);
}
function updateHSLANotation(hsla) {
    updateNotation(hslaInputNodes, hsla);
}
function updateHSVANotation(hsva) {
    updateNotation(hsvaInputNodes, hsva);
}

function updateResult({ r, g, b, a }) {
    result.r = r;
    result.g = g;
    result.b = b;
    result.a = a;
}
function updateColorPalette() {
    const hsv = rgbToHsv(result);

    const { x: sliderX, y: sliderY } = clamp2D(
        hsv.s * 0.01 * canvasMetrics.width, 
        (1 - hsv.v * 0.01) * canvasMetrics.height,
        0, 0, canvasMetrics.width - 1, canvasMetrics.height - 1
    )
    setColorSliderPos(sliderX, sliderY);

    const huePos = (hsv.h / 360) * hueCanvasMetrics.width;
    setHueSliderPos(huePos);
    
    const alphaPos = (1 - hsv.a) * alphaCanvasMetrics.height;
    setAlphaSliderPos(alphaPos);

    drawColorPalette(hsv.h);
}
function updateAndDraw(rgba) {
    updateResult(rgba);
    updateColorPalette();
    drawResultColor();
}

const rgbaNodeContainer = document.getElementById('rgba');
const rgbaInputNodes = rgbaNodeContainer.querySelectorAll('label input');

const hslaNodeContainer = document.getElementById('hsla');
const hslaInputNodes = hslaNodeContainer.querySelectorAll('label input');

const hsvaNodeContainer = document.getElementById('hsva');
const hsvaInputNodes = hsvaNodeContainer.querySelectorAll('label input');

const hexNodeContainer = document.getElementById('hex');
const hexInputNode = hexNodeContainer.querySelector('label input');

function getNotationValues(currentInputNodes) {
    const notation = {};
    for(const inputNode of currentInputNodes) {
        const value = clamp(inputNode.value, inputNode.min, inputNode.max);
        notation[inputNode.getAttribute('key')] = value;
        if(inputNode.value > 0 && inputNode.value !== value) {
            inputNode.value = value;
        }
    }
    return notation
}

hexInputNode.addEventListener('input', () => {
    const { value } = hexInputNode;
    hexInputNode.value = value.replace(/^#/, '');
    const rgba = hexToRgb(value);
    if(rgba) {
        updateNotations(rgba);
        updateAndDraw(rgba);
    }
});

const inputEventFunctions = [
    { nodes: rgbaInputNodes,  converter: null }, 
    { nodes: hslaInputNodes,  converter: hslToRgb }, 
    { nodes: hsvaInputNodes,  converter: hsvToRgb }, 
];

for(const { nodes, converter } of inputEventFunctions) {
    for(const inputNode of nodes) {
        inputNode.addEventListener('input', () => {
            const notationValues = getNotationValues(nodes);
            const rgba = converter ? converter(notationValues) : notationValues;
            updateNotations(rgba);
            updateAndDraw(rgba);
        });
    }
}

// Edit Btns
function edit({notationType, parser, converter}) {
    const string = window.prompt(`Enter your ${notationType} value`) ?? '';
    if(string.length > 0) {
        const notation = parser(string.trim());
    
        if(!notation) {
            return alert(`Invalid ${notationType} value`);
        }

        const rgba = converter ? converter(notation) : notation;
        updateNotations(rgba);
        updateAndDraw(rgba);
    }
}

const editHexBtn = document.getElementById('editHex');
const editRGBABtn = document.getElementById('editRGBA');
const editHSLABtn = document.getElementById('editHSLA');
const editHSVABtn = document.getElementById('editHSVA');
const editBtnFunctions = [
    {   btn: editHexBtn,  notationType: 'Hex', 
        parser: parseHex, converter: hexToRgb
    }, 
    {   btn: editRGBABtn,  notationType: 'RGB/RGBA', 
        parser: parseRGBA, converter: null
    }, 
    {   btn: editHSLABtn,  notationType: 'HSL/HSLA', 
        parser: parseHSLA, converter: hslToRgb
    }, 
    {   btn: editHSVABtn,  notationType: 'HSV/HSVA', 
        parser: parseHSVA, converter: hsvToRgb
    }, 
];

for(const parameters of editBtnFunctions) {
    parameters.btn.addEventListener('click', () => edit(parameters));
}

// Copy Btn
const copyHex = document.getElementById('copyHex');
const copyRGBA = document.getElementById('copyRGBA');
const copyHSLA = document.getElementById('copyHSLA');
const copyHSVA = document.getElementById('copyHSVA');

copyHex.addEventListener('click', () => copyText(hex(hexInputNode.value)));
copyRGBA.addEventListener('click', () => copyText(rgba(getNotationValues(rgbaInputNodes))));
copyHSLA.addEventListener('click', () => copyText(hsla(getNotationValues(hslaInputNodes))));
copyHSVA.addEventListener('click', () => copyText(hsva(getNotationValues(hsvaInputNodes))));

// Update All Notations
const notations = {
    hex: { nodes: [hexInputNode], conversion: rgbToHex, update: updateHexNotation }, 
    rgba: { nodes: rgbaInputNodes, update: updateRGBANotation }, 
    hsla: { nodes: hslaInputNodes, conversion: rgbToHsl, update: updateHSLANotation }, 
    hsva: { nodes: hsvaInputNodes, conversion: rgbToHsv, update: updateHSVANotation }, 
};

function updateNotations(rgba) {
    for(const { conversion, update }  of Object.values(notations)) {
        const values = conversion ? conversion(rgba) : rgba;
        update(values); 
    }
}
updateNotations(result);