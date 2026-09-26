# Calculator

A calculator I built using just HTML, CSS and JavaScript - no backend, no frameworks, no libraries. Everything runs in the browser.

## What it does

- Basic maths: add, subtract, multiply, divide
- A few extra operations: percentage, square, square root, power (x^y), modulus, +/-
- Scientific buttons: sin, cos, tan, log, ln, pi, e
- Remembers your last calculations in a history list (and you can clear it)
- Shows a message instead of crashing if you do something like divide by zero
- Works with your keyboard, not just clicking buttons

## Technologies

- **HTML** - the page structure
- **CSS** - how it looks
- **JavaScript** - everything else: reading button clicks, doing the maths, showing the answer, keeping the history

## Project files

```
calculator-app/
│
├── index.html    <- the page structure
├── style.css      <- how it looks
├── script.js       <- all the logic (maths + button handling + history)
├── README.md
└── LICENSE
```

I kept it to one HTML file, one CSS file and one JS file since the whole project is small enough that splitting it up more would probably make it harder to follow, not easier.

## How it works

Everything happens inside `script.js`:

1. Every button has a `data-` attribute in the HTML (like `data-digit="7"` or `data-op="add"`) so JavaScript knows what was clicked without needing a separate `if` for every single button.
2. Numbers get built up as a string (`currentInput`) as you press digits.
3. When you press an operator or `=`, the `doCalculation()` function does the actual maths with a `switch` statement.
4. The result gets shown on the screen and added to the history list, which is just a plain JavaScript array.

There's no server involved at all - the moment you press `=`, the answer is calculated right there in your browser.

## How to run it

You don't need to install anything. Just open `index.html` in your browser - double-click the file, or right-click it and choose "Open with" your browser.

(If you're using VS Code, the "Live Server" extension also works well for this, but it's not required.)

## Things I'd like to improve later

- Save the history so it doesn't disappear when you refresh the page (using `localStorage`)
- Add proper order of operations (right now it just calculates left to right, so it doesn't know PEMDAS/BODMAS yet)
- Maybe add a light/dark mode switch

## What I learned

This project pushed me to write cleaner JavaScript than my first attempt. I moved from a big switch statement to an object of arrow functions (`operations`) for the actual maths - it made adding a new operation a one-liner instead of another switch case. I also grouped all the "what's currently happening" variables into one `state` object instead of separate loose variables, which made it a lot easier to reason about, especially once I added chained calculations (like `5 + 3 + 2`). I picked up a bug in testing too - my error messages were getting overwritten right after they appeared, because I was calling the display-update function twice. That was a good reminder to actually click through every button combination instead of just assuming the code works because it compiles.

## Author

Tshepang Mathe
Computer Science student (Diploma), Tshwane University of Technology
