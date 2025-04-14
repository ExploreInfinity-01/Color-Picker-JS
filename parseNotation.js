function parseHex(string) {
    string = string.replace(/^#/, '').trim();

    const hex = string.split('').map(l => l + l).join('');

    if(hex.length !== 6 && hex.length !== 8) {
        return null;
    }
    return hex;
}

function parseRGBA(string) {
    const regex = /^\s*(?:rgba?\s*)?\(?\s*(\d+)\s*(?:\s+|,)\s*(\d+)\s*(?:\s+|,)\s*(\d+)\s*(?:\s*(?:\s+|,)\s*(\d*\.?\d+))?\)?\s*$/i;
    const match = string.match(regex);

    if (!match) return null;

    return {
      r: clamp(parseInt(match[1], 10), 0, 255),
      g: clamp(parseInt(match[2], 10), 0, 255),
      b: clamp(parseInt(match[3], 10), 0, 255),
      a: clamp(parseFloat(match[4] ?? 1), 0, 1)
    };
}

function parseHSLA(string) {
    const regex = /^\s*(?:hsl[a]?\s*)?\(?\s*(\d+)\s*(?:,|\s)\s*(\d+)\s*(%)?\s*(?:,|\s)\s*(\d+)\s*(%)?\s*(?:,|\s)*(\d*\.?\d+)?\s*\)?\s*$/i;
    const match = string.match(regex);

    console.log(match)
  
    if (!match) return null;
  
    return {
        h: Math.abs(parseInt(match[1], 10)) % 360, 
        s: clamp(parseInt(match[2], 10), 0, 100), 
        l: clamp(parseInt(match[4], 10), 0, 100), 
        a: clamp(parseFloat(match[6] ?? 1), 0, 1)
    }
}

function parseHSVA(string) {
    const regex = /^\s*(?:hsv[a]?\s*)?\(?\s*(\d+)\s*(?:,|\s)\s*(\d+)\s*(%)?\s*(?:,|\s)\s*(\d+)\s*(%)?\s*(?:,|\s)*(\d*\.?\d+)?\s*\)?\s*$/i;
    const match = string.match(regex);
  
    if (!match) return null;
  
    return {
        h: Math.abs(parseInt(match[1], 10)) % 360,
        s: clamp(parseInt(match[2], 10), 0, 100),
        v: clamp(parseInt(match[4], 10), 0, 100),
        a: clamp(parseFloat(match[6] ?? 1), 0, 1)
    }
}
