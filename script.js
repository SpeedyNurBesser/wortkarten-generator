
letterFrequencyTable = {
    "E": 17.22,
    "N": 10.04,
    "I": 7.66,
    "R": 7.01,
    "S": 6.72,
    "T": 6.03,
    "A": 5.67,
    "H": 5.11,
    "D": 4.81,
    "U": 4.03,
    "L": 3.85,
    "C": 3.42,
    "G": 3.29,
	"M": 2.73,
	"O": 2.41,
	"W": 1.83,
	"B": 1.74,
	"F": 1.58,
	"K": 1.45,
	"Z": 1.13,
	"V": 0.98,
	"P": 0.72,
	"Ü": 0.68,
	"Ä": 0.59,
	"ß": 0.33,
	"Ö": 0.29,
	"J": 0.27,
	"Y": 0.04,
	"X": 0.03,
	"Q": 0.02
}

function countLetters(word) {
    return word.replace(/\s+/g, "").length
}

function calcFrequency(word) {
    // average of letter frequency percentage inside the given word
    // really not the thing we're actually looking for

    cleanedWord = word.toUpperCase()

    frequencyTotal = 0
    
    cleanedWord.split("").forEach(letter => {
        frequencyTotal += letterFrequencyTable[letter]
    });

    return Math.round(frequencyTotal / countLetters(cleanedWord))
}

function countSyllables(word) {
  // more or less the real deal
  if (!word || typeof word !== "string" || word.length === 0) return 0;

  word = word
    .toLowerCase()
    .replace(/[^a-zäöüß]/g, "")
    .replace(/(tion|sion)/g, "x");

  const vowels = word.match(/[aeiouyäöü]+/g);
  const count = vowels ? vowels.length : 0;

  return Math.max(1, count);
}

function calcDifficulty(word) {
    // Complexity = Letters + 3 × (Syllables − 1)

    return countLetters(word) + 3 * countSyllables(word)
}

scrabbleValueTable = {
    "A": 1,
    "Ä": 1,
    "B": 3,
    "C": 3,
    "D": 2,
    "E": 1,
    "F": 4,
    "G": 2,
    "H": 4,
    "I": 1,
    "J": 8,
    "K": 5,
    "L": 1,
    "M": 3,
    "N": 1,
    "O": 1,
    "Ö": 1,
    "P": 3,
    "Q": 10,
    "R": 1,
    "S": 1,
    "ß": 1,
    "T": 1,
    "U": 1,
    "Ü": 1,
    "V": 4,
    "W": 4,
    "X": 8,
    "Y": 4,
    "Z": 10
}

function calcScrabbleValue(word) {
    cleanedWord = word.toUpperCase().replace(/\s+/g, "")

    value = 0
    
    cleanedWord.split("").forEach(letter => {
        value += scrabbleValueTable[letter]
    });

    return value
}

const word_text = document.getElementById("word_text");
const description_text = document.getElementById("description_text");
const background_img = document.getElementById("background_img");

const canvas = document.getElementById("card_canvas");


const background_img_selection = document.getElementById("background_img_selection")
background_img_selection.addEventListener("change", () => {
    const file = background_img_selection.files[0]
    if (!file) return

    background_img.src = URL.createObjectURL(file)
})

async function drawWordCard(canvas, {
  word,
  description,
  backgroundImageUrl,
  frequency,
  difficulty,
  scrabbleValue
}) {
  const ctx = canvas.getContext("2d");
  const { width: w, height: h } = canvas;

  function roundedRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  ctx.clearRect(0, 0, w, h);


  // Gold frame
  const frameGradient = ctx.createLinearGradient(0, 0, 0, h);
  frameGradient.addColorStop(0, "#f6c86b");
  frameGradient.addColorStop(1, "#b8862b");
  ctx.fillStyle = frameGradient;
  ctx.fillRect(0, 0, w, h);

  // Inner card
  const margin = 20;
  roundedRect(margin, margin, w - 2 * margin, h - 2 * margin, 25);
  ctx.clip();

  // Background image
  if (backgroundImageUrl) {
    const img = new Image();
    img.src = backgroundImageUrl;
    await img.decode();
    ctx.drawImage(img, margin, margin, w - 2 * margin, h - 2 * margin);
  } else {

  }

  // Overlay gradient
  const bgOverlay = ctx.createRadialGradient(
    w / 2, h / 3, 50,
    w / 2, h / 3, h
  );
  bgOverlay.addColorStop(0, "rgba(255,140,0,0.6)");
  bgOverlay.addColorStop(1, "rgba(0,0,40,0.85)");
  ctx.fillStyle = bgOverlay;
  ctx.fillRect(margin, margin, w, h);

  ctx.restore?.();

  // Word 
  ctx.font = "bold 64px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.shadowColor = "rgba(255,165,0,0.9)";
  ctx.shadowBlur = 20;
  ctx.fillStyle = "#ffb347";
  ctx.fillText(word, w / 2, h / 2 - 60);


  // Description
  ctx.shadowBlur = 0;
  ctx.font = "24px sans-serif";
  ctx.fillStyle = "#ffd27f";
  for (let i = 0; i < description.length; i++) {
    ctx.fillText(description[i], w / 2, h / 2 + 10 + i* 30);
  }


  // Bottom Info Boxes
  const boxY = h - 160;
  const boxH = 100;
  const boxW = (w - 2 * margin) / 3;

  const boxes = [
    { label: "HÄUFIGKEIT", value: frequency, color: "#2ecc71" },
    { label: "SCHWIERIGKEIT", value: difficulty, color: "#3498db" },
    { label: "SCRABBLE", value: scrabbleValue, color: "#e67e22" }
  ];

  boxes.forEach((b, i) => {
    const x = margin + i * boxW;

    ctx.fillStyle = b.color;
    roundedRect(x + 5, boxY, boxW - 10, boxH, 15);
    ctx.fill();

    ctx.fillStyle = "#fff";
    ctx.font = "bold 16px sans-serif";
    ctx.fillText(b.label, x + boxW / 2, boxY + 25);

    ctx.font = "bold 36px sans-serif";
    ctx.fillText(b.value, x + boxW / 2, boxY + 65);
  });
}

const download_button = document.getElementById("download_button")

document.getElementById("generate_button").addEventListener("click", function() {
    document.getElementById("generate_button").innerHTML = "Regenerate"
    download_button.style.visibility = "visible"
    canvas.style.visibility = "visible"

    drawWordCard(
      canvas,
      {
        word: word_text.value,
        description: description_text.value.split("\n"),
        backgroundImageUrl: background_img.src,
        frequency: calcFrequency(word_text.value),
        difficulty: calcDifficulty(word_text.value),
        scrabbleValue: calcScrabbleValue(word_text.value)
      }
    );
})

download_button.addEventListener("click", () => {
    let anchor = document.createElement("a");
    anchor.href = canvas.toDataURL("image/png");
    anchor.download = `Wortkarte_${word_text.value}.png`;
    anchor.click();
})