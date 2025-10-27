#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const chalk = require('chalk');
const gradient = require('gradient-string');
const figlet = require('figlet');

// -----------------------------
// إعداد الذاكرة الرمزية
const memoryFile = path.join(__dirname, 'memory.json');
let symbolicMemory = {};
if(fs.existsSync(memoryFile)){
  try { symbolicMemory = JSON.parse(fs.readFileSync(memoryFile,'utf-8')); }
  catch(e){ symbolicMemory = {}; console.log(chalk.red("⚠️ Failed to load memory.")); }
}
function saveMemory(){ fs.writeFileSync(memoryFile, JSON.stringify(symbolicMemory,null,2)); }

// -----------------------------
// القواعد و الردود
const questionResponses = {
  "hi": ["Hello!", "Hi there!"],
  "how are you": ["I'm fine, thanks!", "Doing well!"],
  "bye": ["Goodbye!", "See you!"]
};

const grammarMapping = { "run": "VERB", "walk": "VERB", "happy": "ADJ" };
const mathMapping = { "one": 1, "two": 2, "three": 3 };
const emotionMapping = { "love": "❤️", "sad": "😢" };
const emojiResponseMap = { "😀": { feeling: "happy", opposite: "sad" } };
const numToLetter = { "0":"A", "1":"B", "2":"C" };
const exampleCommands = { "A":["Alpha"], "B":["Beta"], "C":["Gamma"] };

// -----------------------------
// الأوامر الرمزية
function handleLearningCommand(input){
  if(input.startsWith("learn ")){
    const parts = input.split(" ");
    const cmd = parts[1];
    const response = parts.slice(2).join(" ");
    symbolicMemory[cmd] = response;
    saveMemory();
    console.log(chalk.green(`📚 Learned: "${cmd}" → "${response}"`));
    return true;
  }
  return false;
}

function handleTeachSymbol(input){
  if(input.startsWith("teach ")){
    const parts = input.split(" ");
    const symbol = parts[1];
    const concept = parts.slice(3).join(" ");
    if(symbol && concept){
      symbolicMemory[symbol] = concept;
      saveMemory();
      console.log(chalk.cyan(`🔣 "${symbol}" linked to: ${concept}`));
      return true;
    }
  }
  return false;
}

function handleRecallCommand(input){
  if(input === "recall"){
    console.log(chalk.magenta("🧠 Learned elements:"));
    Object.entries(symbolicMemory).forEach(([k,v]) => console.log(`${chalk.yellow(k)} → ${chalk.white(v)}`));
    return true;
  }
  return false;
}

function handleResetMind(input){
  if(input === "reset mind"){
    symbolicMemory = {};
    saveMemory();
    console.log(chalk.red("🧹 Memory cleared."));
    return true;
  }
  return false;
}

function handleIntent(input){
  if(input.startsWith("intent ")){
    const target = input.split(" ").slice(1).join(" ");
    let guess = "⚙️ General intent.";
    if(target.includes("why")) guess = "❔ Intent: Seeking meaning.";
    if(target.includes("feel")) guess = "❤️ Intent: Emotional expression.";
    console.log(chalk.yellow(`🧭 ${guess}`));
    return true;
  }
  return false;
}

function symbolicSelfLearn(input){
  return (
    handleLearningCommand(input) ||
    handleTeachSymbol(input) ||
    handleRecallCommand(input) ||
    handleResetMind(input) ||
    handleIntent(input)
  );
}

// -----------------------------
// معالجة الإدخال
function interpretInput(input){
  const trimmed = input.trim();
  const lower = trimmed.toLowerCase();

  if(questionResponses[lower]){
    const [a,b] = questionResponses[lower];
    return chalk.green(`Answer 1: ${a} | Answer 2: ${b}`);
  }

  if(symbolicSelfLearn(lower)) return;

  if(symbolicMemory[lower]) return chalk.cyan(symbolicMemory[lower]);

  const result = [];
  const words = trimmed.split(/\s+/);
  words.forEach(word=>{
    const mapped = grammarMapping[word] || mathMapping[word] || emotionMapping[word] || emojiResponseMap[word];
    if(mapped){
      if(emojiResponseMap[word]){
        result.push(`${word} → Feeling: ${emojiResponseMap[word].feeling}, Opposite: ${emojiResponseMap[word].opposite}`);
      } else {
        result.push(word + " → " + mapped);
      }
    }
  });

  const clean = trimmed.toUpperCase().replace(/[^A-Z0-9]/g,'').split('');
  clean.forEach((char,i)=>{
    let letter = char;
    if(numToLetter[char]) letter = numToLetter[char];
    if(exampleCommands[letter]){
      const cmd = exampleCommands[letter][i % exampleCommands[letter].length];
      result.push(letter + " → " + cmd);
    } else {
      result.push("[" + char + "]");
    }
  });

  return result.length ? chalk.blue(result.join(" | ")) : chalk.gray("I don't understand this command.");
}

// -----------------------------
// مؤثرات البداية
function intro(){
  console.clear();
  console.log(gradient.pastel.multiline(figlet.textSync("Symbolic OS", { font: "Slant" })));
  console.log(chalk.yellow("Type 'help' or 'learn <word> <response>' to begin 💫"));
  console.log(chalk.gray("───────────────────────────────────────────────"));
}

// -----------------------------
// التشغيل
intro();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: gradient.pastel("> ")
});

rl.prompt();
rl.on('line', line=>{
  const out = interpretInput(line);
  if(out) console.log(out);
  rl.prompt();
});