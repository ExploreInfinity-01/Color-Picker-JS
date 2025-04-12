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

    // Horizontal Gradient (Saturation)
    const satGradient = ctx.createLinearGradient(0, 0, width, 0);
    satGradient.addColorStop(0, `hsl(${hue}, 0%, 50%)`);
    satGradient.addColorStop(1, `hsl(${hue}, 100%, 50%)`);
    ctx.fillStyle = satGradient;
    ctx.fillRect(0, 0, width, height);
    
    // Vertical Gradient (Saturation)
    const brightnessGrad = ctx.createLinearGradient(0, 0, 0, height);
    brightnessGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
    brightnessGrad.addColorStop(1, `rgba(0, 0, 0, 1)`);
    ctx.fillStyle = brightnessGrad;
    ctx.fillRect(0, 0, width, height);
}

function extractColor() {
    const { x, y } = colorSliderPos;
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

function toPixels(value) {
    return `${value}px`;
}

function clamp2D(x, y, dx, dy, dw, dh) {
    x = Math.max(dx, Math.min(x, dx + dw - 1));
    y = Math.max(dy, Math.min(y, dy + dh - 1));
    return {x, y};
}


const canvasMetrics = canvas.getBoundingClientRect();
const hueCanvasMetrics = hueCanvas.getBoundingClientRect();
const alphaCanvasMetrics = alphaCanvas.getBoundingClientRect();

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
                canvasMetrics.width, canvasMetrics.height);
            const x = pos.x - canvasMetrics.x,
                  y = pos.y - canvasMetrics.y;
            setColorSliderPos(x, y);
        } else if(hueBar) {
            const { x } = clamp2D(
                e.x, e.y, 
                hueCanvasMetrics.x, hueCanvasMetrics.y, 
                hueCanvasMetrics.width, hueCanvasMetrics.height);
            setHueSliderPos(x - hueCanvasMetrics.left);
            const hue = (x - hueCanvasMetrics.left) / hueCanvasMetrics.width * 360;
            drawColorPalette(hue);
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
        updateNotations();
    }
});
window.addEventListener('mouseup', () => dragging = colorPicker = hueBar = alphaBar = false);

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

function rgbToHsv(r, g, b, a=1) {
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

function rgbToHsl(r, g, b, a=1) {
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

function hslToRgb(h, s, l, a=1) {
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

function updateRGBANotation(rgba) {
    for(const inputNode of rgbaInputNodes) {
        inputNode.value = rgba[inputNode.getAttribute('key')];
    }
}
function updateHSLANotation(hsla) {
    for(const inputNode of hslaInputNodes) {
        inputNode.value = hsla[inputNode.getAttribute('key')];
    }
}
function updateHSVANotation(hsvl) {
    for(const inputNode of hsvlInputNodes) {
        inputNode.value = hsvl[inputNode.getAttribute('key')];
    }
}

function updateResult({ r, g, b, a }) {
    result.r = r;
    result.g = g;
    result.b = b;
    result.a = a;
}
function updateColorPalette() {
    const { r, g, b, a } = result; 
    const hsv = rgbToHsv(r, g, b);

    const sliderX = hsv.s * 0.01 * canvasMetrics.width;
    const sliderY = (1 - hsv.v * 0.01) * canvasMetrics.height;
    setColorSliderPos(sliderX, sliderY);

    const huePos = (hsv.h / 360) * hueCanvasMetrics.width;
    setHueSliderPos(huePos);
    
    const alphaPos = (1 - a) * alphaCanvasMetrics.height;
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

for(const inputNode of rgbaInputNodes) {
    inputNode.addEventListener('input', () => {
        const rgba = getNotationValues(rgbaInputNodes);
        const { r, g, b, a } = rgba;
        const hsla = rgbToHsl(r, g, b, a);
        updateHSLANotation(hsla);

        updateAndDraw(rgba);
    });
} 

for(const inputNode of hslaInputNodes) {
    inputNode.addEventListener('input', () => {
        const { h, s, l, a } = getNotationValues(hslaInputNodes);
        const rgba = hslToRgb(h, s, l, a);
        updateRGBANotation(rgba);

        updateAndDraw(rgba);
    });
}

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

// Edit Btns
const editRGBABtn = document.getElementById('editRGBA');
editRGBABtn.addEventListener('click', () => {
    const string = window.prompt('Enter your RGB/RGBA value') ?? '';
    if(string.length > 0) {
        const rgba = parseRGBA(string.trim());
    
        if(!rgba) {
            return alert('Not a valid RGB/RGBA value!');
        }
    
        const { r, g, b, a } = rgba;
        updateRGBANotation(rgba);
        updateHSLANotation(rgbToHsl(r, g, b, a));
        updateAndDraw(rgba);
    }
});
const editHSLABtn = document.getElementById('editHSLA');
editHSLABtn.addEventListener('click', () => {
    const string = window.prompt('Enter your HSL/HSLA value!') ?? '';
    if(string.length > 0) {
        const hsla = parseHSLA(string.trim());
    
        if(!hsla) {
            return alert('Not a valid HSL/HSLA value!');
        }
    
        const { h, s, l, a } = hsla;
        const rgba = hslToRgb(h, s, l, a);
        updateRGBANotation(rgba)
        updateHSLANotation(hsla);
        updateAndDraw(rgba);
    }
});

// Copy Btn
const copyRGBA = document.getElementById('copyRGBA');
const copyHSLA = document.getElementById('copyHSLA');

copyRGBA.addEventListener('click', () => copyText(rgba(getNotationValues(rgbaInputNodes))));
copyHSLA.addEventListener('click', () => copyText(hsla(getNotationValues(hslaInputNodes))));


const notations = {
    rgba: { nodes: rgbaInputNodes, update: updateRGBANotation }, 
    hsla: { nodes: hslaInputNodes, conversion: rgbToHsl, update: updateHSLANotation }
};

function updateNotations() {
    const { r, g, b, a } = result;
    for(const { conversion, update }  of Object.values(notations)) {
        const values = conversion ? conversion(r, g, b, a) : result;
        update(values); 
    }
}
updateNotations();