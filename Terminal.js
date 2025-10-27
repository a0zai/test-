#!/usr/bin/env node

// مكتبة للألوان داخل CMD
const chalk = require("chalk");

// ذاكرة رمزية في الذاكرة المؤقتة
const symbolicMemory = {};

// ردود جاهزة
const questionResponses = {
  "hi": ["Hello!", "Hey there! 👋"],
  "how are you": ["I'm fine, thanks! 😊", "All good, ready to chat!"],
  "bye": ["Goodbye!", "See you next time 👋"]
};

// مؤثر كتابة ببطء
function slowPrint(text, delay = 40) {
  return new Promise(resolve => {
    let i = 0;
    const interval = setInterval(() => {
      process.stdout.write(text[i]);
      i++;
      if (i >= text.length) {
        clearInterval(interval);
        process.stdout.write("\n");
        resolve();
      }
    }, delay);
  });
}

// دالة المعالجة
async function interpretInput(input) {
  const lowerInput = input.trim().toLowerCase();

  if (questionResponses[lowerInput]) {
    const [a1, a2] = questionResponses[lowerInput];
    await slowPrint(chalk.green(`💬 ${a1}`));
    await slowPrint(chalk.green(`💭 ${a2}`));
    return;
  }

  if (symbolicMemory[lowerInput]) {
    await slowPrint(chalk.cyan(`🔁 ${symbolicMemory[lowerInput]}`));
    return;
  }

  if (lowerInput.startsWith("learn ")) {
    const [_, cmd, ...rest] = lowerInput.split(" ");
    symbolicMemory[cmd] = rest.join(" ");
    await slowPrint(chalk.yellow(`📚 Learned: "${cmd}" → "${symbolicMemory[cmd]}"`));
    return;
  }

  await slowPrint(chalk.red("❓ Unknown command. Try 'learn hi Hello there!'"));
}

// التشغيل
(async () => {
  console.clear();
  console.log(chalk.greenBright("🃏 Symbolic Terminal v2"));
  console.log(chalk.gray("Type something... (example: hi, how are you, learn bye see you!)\n"));

  process.stdout.write(chalk.cyan("🧠 > "));
  process.stdin.on("data", async (data) => {
    const input = data.toString().trim();
    await interpretInput(input);
    process.stdout.write(chalk.cyan("🧠 > "));
  });
})();
