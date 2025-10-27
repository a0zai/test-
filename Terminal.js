#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// -----------------------------
// إعداد ملفات الذاكرة
// -----------------------------
const memoryFile = path.join(__dirname, 'memory.json');

let symbolicMemory = {};
if (fs.existsSync(memoryFile)) {
  try {
    symbolicMemory = JSON.parse(fs.readFileSync(memoryFile, 'utf-8'));
  } catch(e) {
    symbolicMemory = {};
    console.error("⚠️ Failed to read memory.json, starting fresh.");
  }
}

function saveMemory() {
  fs.writeFileSync(memoryFile, JSON.stringify(symbolicMemory, null, 2));
}

// -----------------------------
// الردود المدربة
const questionResponses = {
  "hi": ["Hello!", "Hi there!"],
  "how are you": ["I'm fine, thanks!", "Doing well!"],
  "bye": ["Goodbye!", "See you!"]
};

// -----------------------------
// المابات
const grammarMapping = { "run": "VERB", "walk": "VERB", "happy": "ADJ" };
const mathMapping = { "one": 1, "two": 2, "three": 3 };
const emotionMapping = { "love": "❤️", "sad": "😢" };
const emojiResponseMap = { "😀": { feeling: "happy", opposite: "sad" } };
const numToLetter = { "0":"A", "1":"B", "2":"C" };
const exampleCommands = { "A":["Alpha"], "B":["Beta"], "C":["Gamma"] };

// -----------------------------
// أوامر CMD
function handleLearningCommand(input) {
  if(input.startsWith("learn ")) {
    const parts = input.split(" ");
    const cmd = parts[1];
    const response = parts.slice(2).join(" ");
    symbolicMemory[cmd] = response;
    saveMemory();
    console.log(`📚 Learned: "${cmd}" → "${response}"`);
    return true;
  }
  return false;
}

function handleTeachSymbol(input) {
  if(input.startsWith("teach ")) {
    const parts = input.split(" ");
    const symbol = parts[1];
    const concept = parts.slice(3).join(" ");
    if(symbol && concept) {
      symbolicMemory[symbol] = concept;
      saveMemory();
      console.log(`🔣 "${symbol}" linked to: ${concept}`);
      return true;
    }
  }
  return false;
}

function handleRecallCommand(input) {
  if(input === "recall") {
    console.log("🧠 Learned elements:");
    Object.entries(symbolicMemory).forEach(([k,v]) => console.log(`${k} → ${v}`));
    return true;
  }
  return false;
}

function handleResetMind(input) {
  if(input === "reset mind") {
    symbolicMemory = {};
    saveMemory();
    console.log("🧽 Memory cleared.");
    return true;
  }
  return false;
}

function handleIntent(input) {
  if(input.startsWith("intent ")) {
    const intentTarget = input.split(" ").slice(1).join(" ");
    let guess = "⚙️ General intent.";
    if(intentTarget.includes("why")) guess = "❔ Intent: Seeking meaning.";
    if(intentTarget.includes("feel")) guess = "❤️ Intent: Emotional expression.";
    console.log(`🧭 ${guess}`);
    return true;
  }
  return false;
}

// دمج كل الأوامر الرمزية
function symbolicSelfLearn(input) {
  return (
    handleLearningCommand(input) ||
    handleTeachSymbol(input) ||
    handleRecallCommand(input) ||
    handleResetMind(input) ||
    handleIntent(input)
  );
}

// -----------------------------
// interpretInput
function interpretInput(input) {
  const trimmedInput = input.trim();
  const lowerInput = trimmedInput.toLowerCase();

  if(questionResponses[lowerInput]) {
    const answers = questionResponses[lowerInput];
    return `Answer 1: ${answers[0]} | Answer 2: ${answers[1]}`;
  }

  if(symbolicSelfLearn(lowerInput)) return;

  if(symbolicMemory[lowerInput]) return symbolicMemory[lowerInput];

  const result = [];

  // تحليل الكلمات
  const words = trimmedInput.split(/\s+/);
  words.forEach(word => {
    const mapped = grammarMapping[word] || mathMapping[word] || emotionMapping[word] || emojiResponseMap[word];
    if(mapped) {
      if(emojiResponseMap[word]) {
        result.push(`${word} → Feeling: ${emojiResponseMap[word].feeling}, Opposite: ${emojiResponseMap[word].opposite}`);
      } else {
        result.push(word + " → " + mapped);
      }
    }
  });

  // تحليل الحروف
  const clean = trimmedInput.toUpperCase().replace(/[^A-Z0-9]/g, '').split('');
  clean.forEach((char,i) => {
    let letter = char;
    if(numToLetter[char]) letter = numToLetter[char];
    if(exampleCommands[letter]) {
      const cmd = exampleCommands[letter][i % exampleCommands[letter].length];
      result.push(letter + " → " + cmd);
    } else {
      result.push("[" + char + "]");
    }
  });

  return result.length ? result.join(" | ") : "I don't understand this command.";
}

// -----------------------------
// استقبال نص CMD
const args = process.argv.slice(2);
const userInput = args.join(" ");

const output = interpretInput(userInput);
if(output) console.log(output);
})();
