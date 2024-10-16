function makeCoprime(divisor) {
  let coprime = divisor;
  let powers_of_two = 0;
  let powers_of_five = 0;
  while (coprime % 2n == 0n) {
    coprime /= 2n;
    powers_of_two++;
  }
  while (coprime % 5n == 0n) {
    coprime /= 5n;
    powers_of_five++;
  }
  return { coprime, powers_of_two, powers_of_five };
}
function makeRule(divisor) {
  let rule = 0n;
  switch (divisor % 10n) {
    case 1n:
      rule = -(divisor / 10n);
      break;
    case 3n:
      rule = 3n * (divisor / 10n) + 1n;
      break;
    case 7n:
      rule = -3n * (divisor / 10n) - 2n;
      break;
    case 9n:
      rule = divisor / 10n + 1n;
      break;
  }
  return rule;
}
function reduce(dividend, divisor, rule) {
  let eqs = "<br>";
  let remainder = dividend;
  let steps = 0;
  let [a, b, c] = [0n, 0n, 0n];
  while (
    remainder > remainder / 10n + rule * (remainder % 10n) &&
    remainder / 10n + rule * (remainder % 10n) > 0
  ) {
    eqs += `${remainder} -> `;
    a = remainder / 10n;
    b = remainder % 10n;
    remainder = a + rule * b;
    if (rule < 0) {
      c = -rule;
      eqs += `${a} - ${c} * ${b} = ${remainder}<br>`;
    } else {
      eqs += `${a} + ${rule} * ${b} = ${remainder}<br>`;
    }
    steps++;
  }
  if (remainder % divisor != 0n) {
    eqs += `${remainder} is not divisble by ${divisor}. <br>`;
  } else {
    eqs += `${remainder} is divisble by ${divisor}. <br>`;
  }
  return { remainder, eqs };
}
function egcd(a, b) {
  let swapped = false;
  if (a < b) [a, b, swapped] = [b, a, true];
  let s = 0n,
    old_s = 1n;
  let t = 1n,
    old_t = 0n;
  let r = b,
    old_r = a;
  while (r != 0n) {
    let q = old_r / r;
    [r, old_r] = [old_r - q * r, r];
    [s, old_s] = [old_s - q * s, s];
    [t, old_t] = [old_t - q * t, t];
  }
  if (swapped) [old_s, old_t] = [old_t, old_s];
  return [old_s, old_t];
}
function combine(a, b, p, q) {
  let [s, t] = egcd(p, q);
  return (a * q * t + b * p * s) % (p * q);
}
function solve() {
  let string = document.getElementById("divisor").value;
  let divisor = BigInt(string);
  string = document.getElementById("dividend").value;
  let dividend = BigInt(string);
  let { coprime, powers_of_two, powers_of_five } = makeCoprime(divisor);
  let rule = makeRule(coprime);
  let twos = 2 ** powers_of_two;
  let fives = 5 ** powers_of_five;
  let factors = twos * fives;
  let rule_text = "";
  let digits = Math.max(powers_of_two, powers_of_five);
  rule_text = `If a number is divisible by ${divisor} it has to be divisible by ${coprime} and ${factors}. `;
  if (coprime == 1n) {
    rule_text = "";
  }
  rule_text += `To check if a number is divisible by ${factors}, look at the last `;
  if (digits == 1) {
    rule_text += `digit. `;
  }
  if (digits != 1) {
    rule_text += `${digits} digits. `;
  }
  if (factors == 1) {
    rule_text = "";
  }
  if (coprime != 1n) {
    rule_text += `To check if a number is divisible by ${coprime},`;
    if (rule > 0n) {
      rule_text += ` add ${rule} times the last digit to the rest. `;
    } else {
      rule_text += ` subtract ${rule * -1n} times the last digit from the rest. `;
    }
    rule_text += `repeat this step until divisibilty is obvious.`;
  }
  if (divisor == 1n) {
    rule_text = "Every integer is divisible by 1!";
  }
  let rule_box = document.getElementById("Rule");
  rule_box.innerHTML =
    rule_text +
    " <div id='eqs' onclick='reduced()'> <br> --- Show Solution --- </div><div id='remainder' onclick='remainder()'> <br> --- Show Remainder --- </div>";
}
function reduced() {
  let string = document.getElementById("divisor").value;
  let divisor = BigInt(string);
  string = document.getElementById("dividend").value;
  let dividend = BigInt(string);
  let { coprime, powers_of_two, powers_of_five } = makeCoprime(divisor);
  let rule = makeRule(coprime);
  let { remainder, eqs } = reduce(dividend, coprime, rule);
  if (coprime == 1n) {
    eqs = "<br>";
  }
  let factors = 2 ** powers_of_two * 5 ** powers_of_five;
  let tens = 10 ** Math.max(powers_of_two, powers_of_five);
  if (factors != 1) {
    eqs += `<br>${dividend} -> ${dividend % BigInt(tens)}`;
  }
  if (dividend % BigInt(factors) == 0n) {
    eqs += `<br>${dividend % BigInt(tens)} is divisble by ${factors}<br>`;
  } else {
    eqs += `<br>${dividend % BigInt(tens)} is not divisble by ${factors}<br>`;
  }
  if (dividend % divisor == 0n) {
    eqs += `<br><br>${dividend} is divisible by ${divisor}`;
  } else {
    eqs += `<br><br>${dividend} is not divisible by ${divisor}`;
  }
  let eqs_box = document.getElementById("eqs");
  eqs_box.innerHTML = eqs;
}
function remainder() {
  let string = document.getElementById("divisor").value;
  let divisor = BigInt(string);
  string = document.getElementById("dividend").value;
  let dividend = BigInt(string);
  let remainder = dividend % divisor;
  let answer = `<br>The remainder of ${dividend} divided by ${divisor} is ${remainder}`;
  let remainder_box = document.getElementById("remainder");
  remainder_box.innerHTML = answer;
}
