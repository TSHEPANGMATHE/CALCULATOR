// Calculator logic
// Using an object to hold the calculator's state instead of a bunch of
// separate variables floating around - easier to keep track of what's
// what, and I can log the whole thing to console.log(state) when debugging.
const state = {
  currentInput: "0",
  firstNumber: null,
  operator: null,
  justCalculated: false,
};

let historyEntries = [];

const displayEl = document.getElementById("display");
const expressionEl = document.getElementById("expression");
const historyListEl = document.getElementById("historyList");

// Operators that need two numbers vs. just one.
const twoNumberOps = ["add", "subtract", "multiply", "divide", "modulus", "power"];

const operatorSymbols = {
  add: "+",
  subtract: "-",
  multiply: "x",
  divide: "/",
  modulus: "mod",
  power: "^",
};

// Doing the actual maths with an object of functions instead of a big
// switch statement - each key is the operation name, each value is a
// function that takes the number(s) and returns the answer.
const operations = {
  add: (a, b) => a + b,
  subtract: (a, b) => a - b,
  multiply: (a, b) => a * b,
  divide: (a, b) => {
    if (b === 0) throw new Error("Cannot divide by zero");
    return a / b;
  },
  modulus: (a, b) => {
    if (b === 0) throw new Error("Cannot use modulus with zero");
    return a % b;
  },
  power: (a, b) => Math.pow(a, b),
  square: (a) => a * a,
  sqrt: (a) => {
    if (a < 0) throw new Error("Cannot get the square root of a negative number");
    return Math.sqrt(a);
  },
  percent: (a) => a / 100,
  negate: (a) => -a,
  sin: (a) => Math.sin((a * Math.PI) / 180),
  cos: (a) => Math.cos((a * Math.PI) / 180),
  tan: (a) => Math.tan((a * Math.PI) / 180),
  log: (a) => {
    if (a <= 0) throw new Error("Log only works on positive numbers");
    return Math.log10(a);
  },
  ln: (a) => {
    if (a <= 0) throw new Error("Ln only works on positive numbers");
    return Math.log(a);
  },
};

const unaryLabels = {
  square: "sqr",
  sqrt: "sqrt",
  negate: "negate",
  sin: "sin",
  cos: "cos",
  tan: "tan",
  log: "log",
  ln: "ln",
};

function calculate(op, a, b) {
  const fn = operations[op];
  if (!fn) throw new Error(`Unknown operation: ${op}`);
  return fn(a, b);
}

// Rounds long decimals so things like sin(30) show "0.5" instead of
// "0.49999999999999994", and drops ".0" off whole numbers.
function formatNumber(value) {
  if (Number.isInteger(value)) {
    return String(value);
  }
  return value
    .toFixed(10)
    .replace(/0+$/, "")
    .replace(/\.$/, "");
}

function buildExpressionText(op, a, b) {
  if (twoNumberOps.includes(op)) {
    return `${formatNumber(a)} ${operatorSymbols[op]} ${formatNumber(b)}`;
  }
  if (op === "percent") {
    return `${formatNumber(a)}%`;
  }
  return `${unaryLabels[op]}(${formatNumber(a)})`;
}

function updateDisplay() {
  displayEl.textContent = state.currentInput;
}

function showError(message) {
  displayEl.textContent = message;
  state.currentInput = "0";
  state.firstNumber = null;
  state.operator = null;
  state.justCalculated = true;
}

// --- Button handlers ---

function pressDigit(digit) {
  if (state.justCalculated) {
    state.currentInput = digit;
    state.justCalculated = false;
  } else {
    state.currentInput = state.currentInput === "0" ? digit : state.currentInput + digit;
  }
  updateDisplay();
}

function pressDecimal() {
  if (state.justCalculated) {
    state.currentInput = "0.";
    state.justCalculated = false;
  } else if (!state.currentInput.includes(".")) {
    state.currentInput += ".";
  }
  updateDisplay();
}

function pressBackspace() {
  state.currentInput =
    state.currentInput.length > 1 ? state.currentInput.slice(0, -1) : "0";
  updateDisplay();
}

function pressClear() {
  state.currentInput = "0";
  state.firstNumber = null;
  state.operator = null;
  state.justCalculated = false;
  expressionEl.textContent = "";
  updateDisplay();
}

function pressTwoNumberOperator(op) {
  const number = parseFloat(state.currentInput);

  // Chain calculations, e.g. 5 + 3 + 2 - resolve what's pending first.
  if (state.operator && !state.justCalculated) {
    try {
      const result = calculate(state.operator, state.firstNumber, number);
      addToHistory(buildExpressionText(state.operator, state.firstNumber, number), formatNumber(result));
      state.firstNumber = result;
    } catch (err) {
      showError(err.message);
      return;
    }
  } else {
    state.firstNumber = number;
  }

  state.operator = op;
  state.justCalculated = false;
  state.currentInput = "0"; // ready for the next number to be typed

  expressionEl.textContent = `${formatNumber(state.firstNumber)} ${operatorSymbols[op]}`;
  updateDisplay();
}

function pressOneNumberOperator(op) {
  const number = parseFloat(state.currentInput);
  try {
    const result = calculate(op, number);
    const expressionText = buildExpressionText(op, number);
    expressionEl.textContent = expressionText;
    addToHistory(expressionText, formatNumber(result));
    state.currentInput = formatNumber(result);
    state.justCalculated = true;
    updateDisplay();
  } catch (err) {
    showError(err.message);
  }
}

function pressEquals() {
  if (!state.operator || state.firstNumber === null) return;

  const secondNumber = parseFloat(state.currentInput);

  try {
    const result = calculate(state.operator, state.firstNumber, secondNumber);
    const expressionText = buildExpressionText(state.operator, state.firstNumber, secondNumber);
    expressionEl.textContent = `${expressionText} =`;
    addToHistory(expressionText, formatNumber(result));
    state.currentInput = formatNumber(result);
    state.firstNumber = null;
    state.operator = null;
    state.justCalculated = true;
    updateDisplay();
  } catch (err) {
    showError(err.message);
  }
}

function pressConstant(name) {
  state.currentInput = name === "pi" ? String(Math.PI) : String(Math.E);
  state.justCalculated = false;
  updateDisplay();
}

// --- History ---

function addToHistory(expressionText, resultText) {
  historyEntries.push(`${expressionText} = ${resultText}`);
  if (historyEntries.length > 20) {
    historyEntries.shift(); // drop the oldest one
  }
  renderHistory();
}

function renderHistory() {
  historyListEl.innerHTML = "";

  if (historyEntries.length === 0) {
    historyListEl.innerHTML = `<li class="empty-message">No calculations yet</li>`;
    return;
  }

  // Show newest first.
  [...historyEntries].reverse().forEach((entry) => {
    const li = document.createElement("li");
    li.textContent = entry;
    historyListEl.appendChild(li);
  });
}

function clearHistory() {
  historyEntries = [];
  renderHistory();
}

// --- Wiring up the buttons ---

document.querySelectorAll("[data-digit]").forEach((btn) =>
  btn.addEventListener("click", () => pressDigit(btn.dataset.digit))
);

document.querySelectorAll("[data-op]").forEach((btn) =>
  btn.addEventListener("click", () => {
    const op = btn.dataset.op;
    twoNumberOps.includes(op) ? pressTwoNumberOperator(op) : pressOneNumberOperator(op);
  })
);

document.querySelectorAll("[data-const]").forEach((btn) =>
  btn.addEventListener("click", () => pressConstant(btn.dataset.const))
);

document.getElementById("clearBtn").addEventListener("click", pressClear);
document.getElementById("backspaceBtn").addEventListener("click", pressBackspace);
document.getElementById("decimalBtn").addEventListener("click", pressDecimal);
document.getElementById("equalsBtn").addEventListener("click", pressEquals);
document.getElementById("clearHistoryBtn").addEventListener("click", clearHistory);

// --- Keyboard support ---

const KEY_ACTIONS = {
  "+": () => pressTwoNumberOperator("add"),
  "-": () => pressTwoNumberOperator("subtract"),
  "*": () => pressTwoNumberOperator("multiply"),
  Enter: () => pressEquals(),
  "=": () => pressEquals(),
  Backspace: () => pressBackspace(),
  Escape: () => pressClear(),
  ".": () => pressDecimal(),
};

window.addEventListener("keydown", (event) => {
  const { key } = event;

  if (/^[0-9]$/.test(key)) {
    pressDigit(key);
    return;
  }

  if (key === "/") {
    event.preventDefault(); // stop the browser's quick-find from popping up
    pressTwoNumberOperator("divide");
    return;
  }

  const action = KEY_ACTIONS[key];
  if (action) action();
});

// --- Init ---
updateDisplay();
renderHistory();
