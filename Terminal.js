#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// -----------------------------
// CMD-ready persistent memory
// -----------------------------
const memoryFile = path.join(__dirname, 'memory.json');
let symbolicMemory = {};
if(fs.existsSync(memoryFile)){
    try { symbolicMemory = JSON.parse(fs.readFileSync(memoryFile,'utf-8')); }
    catch(e){ symbolicMemory = {}; console.error("\x1b[31mFailed to read memory.json, starting fresh.\x1b[0m"); }
}
function saveMemory(){ fs.writeFileSync(memoryFile, JSON.stringify(symbolicMemory,null,2)); }

// -----------------------------
// Mapping و الردود
const baseLines = [
    "Welcome to CMD Terminal 🌕",
    "Type 'help' for commands",
    "Try 'learn hello Hi there!'",
    "Simulated particle effects 🔹✨"
];

const commandActions = {
    "clear": () => console.clear(),
    "mood": () => console.log("\x1b[33mFeeling sunny today! ☀️\x1b[0m"),
    "help": () => {
        console.log("\x1b[36mAvailable commands:\x1b[0m learn, teach, recall, reset mind, intent, clear, mood, help");
    }
};

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
// CMD functions
function handleLearningCommand(input){
    if(input.startsWith("learn ")){
        const parts = input.split(" ");
        const cmd = parts[1];
        const response = parts.slice(2).join(" ");
        symbolicMemory[cmd] = response;
        saveMemory();
        console.log(`\x1b[32m📚 Learned: "${cmd}" → "${response}"\x1b[0m`);
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
            console.log(`\x1b[36m🔣 "${symbol}" linked to: ${concept}\x1b[0m`);
            return true;
        }
    }
    return false;
}

function handleRecallCommand(input){
    if(input === "recall"){
        console.log("\x1b[35m🧠 Learned elements:\x1b[0m");
        Object.entries(symbolicMemory).forEach(([k,v]) => console.log(`${k} → ${v}`));
        return true;
    }
    return false;
}

function handleResetMind(input){
    if(input === "reset mind"){
        symbolicMemory = {};
        saveMemory();
        console.log("\x1b[31m🧹 Memory cleared.\x1b[0m");
        return true;
    }
    return false;
}

function handleIntent(input){
    if(input.startsWith("intent ")){
        const intentTarget = input.split(" ").slice(1).join(" ");
        let guess = "⚙️ General intent.";
        if(intentTarget.includes("why")) guess = "❔ Intent: Seeking meaning.";
        if(intentTarget.includes("feel")) guess = "❤️ Intent: Emotional expression.";
        console.log(`\x1b[33m🧭 ${guess}\x1b[0m`);
        return true;
    }
    return false;
}

function symbolicSelfLearn(input){
    return handleLearningCommand(input) || handleTeachSymbol(input) ||
           handleRecallCommand(input) || handleResetMind(input) ||
           handleIntent(input);
}

// -----------------------------
// interpretInput
function interpretInput(input){
    const trimmedInput = input.trim();
    const lowerInput = trimmedInput.toLowerCase();

    if(questionResponses[lowerInput]){
        const answers = questionResponses[lowerInput];
        return `Answer 1: ${answers[0]} | Answer 2: ${answers[1]}`;
    }

    if(symbolicSelfLearn(lowerInput)) return;

    if(symbolicMemory[lowerInput]) return symbolicMemory[lowerInput];

    if(commandActions[lowerInput]){
        commandActions[lowerInput]();
        return;
    }

    const result = [];
    const words = trimmedInput.split(/\s+/);
    words.forEach(word => {
        const mapped = grammarMapping[word] || mathMapping[word] || emotionMapping[word] || emojiResponseMap[word];
        if(mapped){
            if(emojiResponseMap[word]){
                result.push(`${word} → Feeling: ${emojiResponseMap[word].feeling}, Opposite: ${emojiResponseMap[word].opposite}`);
            } else {
                result.push(word + " → " + mapped);
            }
        }
    });

    const clean = trimmedInput.toUpperCase().replace(/[^A-Z0-9]/g,'').split('');
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

    return result.length ? result.join(" | ") : "I don't understand this command.";
}

// -----------------------------
// Typing effect & ASCII particles
function typeReply(text, charSpeed = 20, callback = null){
    let idx = 0;
    function typeChar(){
        if(idx < text.length){
            process.stdout.write(text[idx]);
            idx++;
            setTimeout(typeChar,charSpeed);
        } else {
            process.stdout.write("\n");
            if(callback) callback();
        }
    }
    typeChar();
}

function asciiParticles(){
    const chars = ['.', '*', '+', '•', '°'];
    let line = '';
    for(let i=0;i<30;i++){
        line += chars[Math.floor(Math.random()*chars.length)];
    }
    console.log("\x1b[36m"+line+"\x1b[0m");
}

function displayLinesSequentially(lines, i=0){
    if(i >= lines.length) return;
    asciiParticles();
    typeReply(lines[i], 15, ()=> displayLinesSequentially(lines, i+1));
}

// -----------------------------
// Run CMD
displayLinesSequentially(baseLines);

const args = process.argv.slice(2);
if(args.length){
    const userInput = args.join(" ");
    const output = interpretInput(userInput);
    if(output) console.log(output);
} else {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, prompt: '\x1b[36m> \x1b[0m' });
    rl.prompt();
    rl.on('line', line=>{
        const out = interpretInput(line);
        if(out) console.log(out);
        rl.prompt();
    });
}