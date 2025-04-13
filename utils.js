function clamp(value, min, max) {
    return Math.max(min, Math.min(value, max));
}

function hex(hexValue) {
    return '#' + hexValue;
}

function rgba({r, g, b, a=1}) {
    return a === 1 ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${a})`;
}

function hsla({h, s, l, a=1}) {
    return a === 1 ? `hsl(${h}, ${s}, ${l})` : `hsla(${h}, ${s}, ${l}, ${a})`;
}

function copyText(string) {
    navigator.clipboard.writeText(string)
      .catch(err => {
        console.error("Error copying to clipboard: ", err);
        alert("Failed to copy to clipboard!.");
      });
}

function truncate(value, decimal=0) {
    return Math.trunc(value * (10 ** decimal)) / 10 ** decimal;
}