var divisorBox = document.getElementById("divisor");
var answerBox = document.getElementById("answer");
var demoBox = document.getElementById("demo");
var demoNumber = document.getElementById("demoNumber");
var stepsBox = document.getElementById("steps");
var hintBox = document.getElementById("hint");
var dividendBox = document.getElementById("dividend");
const base = 10;

var relPrime;
var divisor;
var factors;
var digits;
var rule;

divisorBox.addEventListener("keydown", function (e) {
  if (e.code === "Enter") {
    divisor = isNatural(e, answerBox);
    if (isNaN(divisor)) {
      demoBox.style.display = "none";
      return;
    }
    makeOutput();
  }
});

dividendBox.addEventListener("keydown", function (e) {
  if (e.code === "Enter") {
    makeSteps(e);
  }
});

function makeSteps(e) {
  let dividend = isNatural(e, stepsBox);
  if (isNaN(dividend)) {
    return;
  }
  switch (rule) {
    case 0:
      trailReduce(dividend);
      break;
    case 1:
      sumReduce(dividend);
      break;
    default:
      truncateReduce(dividend);
  }
}

async function truncateReduce(num) {
  let styled, steps, digitList, hint, buffer;
  let numReduced = num;
  let repeat = true;

  dividendBox.style.opacity = "0%";
  demoNumber.style.opacity = "100%";
  stepsBox.style.display = "block";
  hintBox.style.display = "block";

  // Seperate number
  digitList = digitize(num);

  while (repeat) {
    // Highlight last digit, grey the rest
    digitList[0] = accent(digitList[0]);
    for (let i = 1; i < digitList.length; i++) {
      digitList[i] = greyed(digitList[i]);
    }

    // display
    styled = undigitize(digitList);
    steps = "Look at the last digit.";
    hint = "press (spacebar) to advance";

    demoNumber.innerHTML = styled;
    hintBox.textContent = hint;
    stepsBox.textContent = steps;

    // wait for spacebar
    await waitForSpace();

    // seperate last digit, show rule
    buffer = " + (" + rule + " * ";
    digitList.splice(1, 0, buffer);
    digitList.unshift(")");

    // update display
    styled = undigitize(digitList);
    steps = "Multiply by " + rule + " and add to the rest.";

    demoNumber.innerHTML = styled;
    stepsBox.textContent = steps;

    // wait for spacebar (again)
    await waitForSpace();

    // multiply
    buffer = " + " + rule * (numReduced % base);

    digitList.splice(0, 3, buffer);
    styled = undigitize(digitList);
    steps = "Add to the rest";

    // update display
    demoNumber.innerHTML = styled;
    stepsBox.textContent = steps;

    // wait for spacebar (again)
    await waitForSpace();

    // reduce
    numReduced = Math.floor(numReduced / base) + rule * (numReduced % base);
    digitList = digitize(numReduced);

    // update display
    styled = numReduced;
    steps = "Reduced. You may continue if divisiblity is not obvious.";
    hint = "press (spacebar) to repeat process or (r) to reset";

    demoNumber.innerHTML = styled;
    stepsBox.textContent = steps;
    hintBox.textContent = hint;

    // wait for next action
    repeat = await waitForNext();
  }
  dividendBox.value = "";
  dividendBox.style.opacity = "100%";
  demoNumber.style.opacity = "0%";
  stepsBox.style.display = "none";
  hintBox.style.display = "none";
}

async function sumReduce(num) {
  // initialize
  let styled, steps, digitList, hint, buffer;
  let numReduced = num;
  let repeat = true;

  dividendBox.style.opacity = "0%";
  demoNumber.style.opacity = "100%";
  stepsBox.style.display = "block";
  hintBox.style.display = "block";

  // seperate number
  digitList = digitize(num);

  while (repeat) {
    // display
    styled = undigitize(digitList);
    steps = "Sum all the digits";
    hint = "press (spacebar) to advance";

    demoNumber.innerHTML = styled;
    hintBox.textContent = hint;
    stepsBox.textContent = steps;

    // wait for spacebar
    await waitForSpace();

    // expand
    let plus = greyed(" + ");

    // insert + between every digit
    for (let i = 1; i < digitList.length; i += 2) {
      digitList.splice(i, 0, plus);
    }

    // display
    styled = undigitize(digitList);
    demoNumber.innerHTML = styled;

    // wait for spacebar
    await waitForSpace();

    // add the digits
    buffer = numReduced;
    numReduced = 0;
    while (buffer > 0) {
      numReduced += buffer % 10;
      buffer = Math.floor(buffer / 10);
    }
    digitList = digitize(numReduced);

    // display
    styled = numReduced;
    steps = "Reduced. You may continue if divisiblity is not obvious.";
    hint = "press (spacebar) to repeat process or (r) to reset";

    dividendBox.value = numReduced;
    dividendBox.style.opacity = "100%";
    demoNumber.style.opacity = "0%";
    stepsBox.textContent = steps;
    hintBox.textContent = hint;

    // wait for next action
    repeat = await waitForNext();
  }
  dividendBox.value = "";
  dividendBox.style.opacity = "100%";
  demoNumber.style.opacity = "0%";
  stepsBox.style.display = "none";
  hintBox.style.display = "none";
}

async function trailReduce(num) {
  let styled, steps, digitList, hint, buffer;
  let numReduced = num % base ** digits;

  dividendBox.style.opacity = "0%";
  demoNumber.style.opacity = "100%";
  stepsBox.style.display = "block";
  hintBox.style.display = "block";

  // seperate number
  digitList = digitize(num);

  //highlight the important digits
  for (let i = 0; i < digitList.length; i++) {
    if (i < digits) {
      digitList[i] = accent(digitList[i]);
    } else {
      digitList[i] = greyed(digitList[i]);
    }
  }

  styled = undigitize(digitList);

  // deal with plural 's'
  let digitsText;
  if (digits == 1) {
    digitsText = "digit";
  } else {
    digitsText = digits + " digits";
  }

  // display
  steps = "Look at the last " + digitsText;
  hint = "press (spacebar) to advance";

  demoNumber.innerHTML = styled;
  stepsBox.textContent = steps;
  hintBox.textContent = hint;

  // wait for spacebar
  await waitForSpace();

  // remove the digits in front
  digitList.splice(digits, digitList.length - digits);

  // find answer
  if (numReduced % factors == 0) {
    buffer = "";
  } else {
    buffer = " not";
  }
  // display
  styled = undigitize(digitList);
  steps = numReduced + " is" + buffer + " divisible by " + factors;
  hint = "press (r) to reset";

  dividendBox.style.opacity = "100%";
  demoNumber.style.opacity = "0%";
  stepsBox.textContent = steps;
  hintBox.textContent = hint;
  dividendBox.value = numReduced;

  // wait for next action
  await waitForNext();
  dividendBox.value = "";
  dividendBox.style.opacity = "100%";
  demoNumber.style.opacity = "0%";
  stepsBox.style.display = "none";
  hintBox.style.display = "none";
}

function waitForSpace() {
  return new Promise((resolve) => {
    document.addEventListener("keydown", onKeyHandler);
    function onKeyHandler(e) {
      if (e.code === "Space") {
        document.removeEventListener("keydown", onKeyHandler);
        resolve();
      }
    }
  });
}

async function waitForNext() {
  return new Promise((resolve) => {
    document.addEventListener("keydown", onKeyHandler);
    function onKeyHandler(e) {
      if (e.code === "Space") {
        document.removeEventListener("keydown", onKeyHandler);
        resolve(true);
      }
      if (e.key === "r") {
        document.removeEventListener("keydown", onKeyHandler);
        resolve(false);
      }
    }
  });
}

function digitize(n) {
  let digitList = [];
  let currentDigit;
  while (n > 0) {
    currentDigit = n % base;
    digitList.push(currentDigit);
    n = Math.floor(n / base);
  }
  return digitList;
}

function undigitize(digitList) {
  let styled = "";
  for (let i = 0; i < digitList.length; i++) {
    styled = digitList[i] + styled;
  }
  return styled;
}

function makeOutput() {
  // find factors shared with base
  [relPrime, factors] = factor(divisor);

  // useful for interactive demo
  if (relPrime == 1) {
    rule = 0;
  } else {
    rule = solver(relPrime);
  }

  // generate answer
  let answer = explain(divisor, factors, relPrime, rule);
  answerBox.innerHTML = answer;

  // displays interactive solver, if supported
  if (factors == 1 || relPrime == 1) {
    demoBox.style.display = "block";
    dividendBox.style.opacity = "100%";
    demoNumber.style.opacity = "0%";
    stepsBox.style.display = "none";
    hintBox.style.display = "none";
    dividendBox.value = "";
  } else {
    demoBox.style.display = "none";
  }
}

function explain(divisor, factors, relPrime, rule) {
  let text;

  // when the divisor and the base are relitvely prime
  if (factors == 1) {
    if (rule != 1) {
      //explain
      text =
        "Add <b>" +
        rule +
        "</b> times the last digit to the rest of the number.";
    } else {
      // adding one times the last digit is equivelent to summing the digits
      text =
        "<b>Sum the digits.</b> If the sum is divisible by " +
        relPrime +
        " then the whole number is.";
    }
    return text;
  }

  // when divisor is a factor of a power of the base
  if (relPrime == 1) {
    // find how many digits to look at
    digits = 1;
    while (base ** digits % factors) {
      digits += 1;
    }

    // deal with plural 's'
    let digitsText;
    if (digits == 1) {
      digitsText = "digit";
    } else {
      digitsText = digits + " digits";
    }

    //explain
    text =
      "Look at the last <b>" +
      digitsText +
      "</b> of the number. If that is divisible by " +
      factors +
      ", then the whole number is.";
    return text;
  }

  // otherwise
  text =
    "To check divisibility by " +
    divisor +
    " we must check divisibility for " +
    linked(factors) +
    " and " +
    linked(relPrime) +
    ".";
  return text;
}

function isNatural(e, errorBox) {
  // validation of the input
  let n = Number(e.target.value);
  let valid = false;
  let errorMsg;
  switch (true) {
    case isNaN(n):
      errorMsg = "Input a number.";
      break;
    case e.target.value === "":
      errorMsg = "";
      break;
    case n == 1:
      errorMsg = "All numbers are divisible by 1.";
      break;
    case n == 0:
      errorMsg = "Division by 0 is undefined.";
      break;
    case !Number.isInteger(n):
      errorMsg = "Number must be an integer.";
      break;
    case n < 0:
      errorMsg = "Number must be positive";
      break;
    case n > Number.MAX_SAFE_INTEGER:
      errorMsg = "Number is too large";
      break;
    default:
      valid = true;
  }

  // displays error message
  if (!valid) {
    errorBox.textContent = errorMsg;
    return NaN;
  }

  return n;
}

function factor(divisor) {
  // find all factors divisor shares with base
  let relPrime = divisor;
  let [_, gcd] = egcd(relPrime, base);
  let factors = 1;
  while (gcd != 1) {
    [_, gcd] = egcd(relPrime, base);
    relPrime /= gcd;
    factors *= gcd;
  }
  return [relPrime, factors];
}

function solver(divisor) {
  let [rule, _] = egcd(base, divisor);
  return rule;
}

function egcd(a, b) {
  // extended euclidean algorithm
  //
  // a must be the larger value
  let swapped = false;
  if (a < b) [a, b, swapped] = [b, a, true];
  let s = 0,
    oldS = 1;
  let t = 1,
    oldT = 0;
  let r = b,
    oldR = a;
  while (r != 0) {
    let q = Math.floor(oldR / r);
    [r, oldR] = [oldR - q * r, r];
    [s, oldS] = [oldS - q * s, s];
    [t, oldT] = [oldT - q * t, t];
  }

  // swap back
  if (swapped) [oldS, b] = [oldT, a];
  // oldS must be positive and between 1 and b
  oldS = mod(oldS, b);
  return [oldS, oldR];
}

function mod(a, n) {
  // javascript remainder function, but always positive
  let pos = ((a % n) + n) % n;
  return pos;
}

function linked(num) {
  // create links to other rules
  num =
    '<span class="linked" onclick="divisor = ' +
    num +
    '; makeOutput(); divisorBox.value = divisor;">' +
    num +
    "</span>";
  return num;
}

function accent(num) {
  // makes num accent color
  num = '<span class="accent">' + num + "</span>";
  return num;
}

function greyed(num) {
  // makes num grey
  num = '<span class="greyed">' + num + "</span>";
  return num;
}
