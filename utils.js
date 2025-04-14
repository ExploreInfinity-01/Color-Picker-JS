function clamp(value, min, max) {
    return Math.max(min, Math.min(value, max));
}

function clamp2D(x, y, dx, dy, dw, dh) {
    x = Math.max(dx, Math.min(x, dx + dw));
    y = Math.max(dy, Math.min(y, dy + dh));
    return {x, y};
}

function toPixels(value) {
    return `${value}px`;
}

function hex(hexValue) {
    return '#' + hexValue;
}

function rgba({r, g, b, a=1}) {
    return a === 1 ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${a})`;
}

function hsla({h, s, l, a=1}) {
    return a === 1 ? `hsl(${h}, ${s}%, ${l}%)` : `hsla(${h}, ${s}%, ${l}%, ${a})`;
}

function hsva({h, s, v, a=1}) {
    return a === 1 ? `hsv(${h}, ${s}%, ${v}%)` : `hsva(${h}, ${s}%, ${v}%, ${a})`;
}

function copyText(string) {
    navigator.clipboard.writeText(string)
      .catch(err => {
        console.error("Error copying to clipboard: ", err);
        alert("Failed to copy to clipboard!.");
      });
}

function floor(value) {
    return Math.floor(value);
}

function truncate(value, decimal=0) {
    return Math.trunc(value * (10 ** decimal)) / 10 ** decimal;
}