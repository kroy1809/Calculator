// Calculator class to simulate a standard calculator operations
class Calculator {
  constructor(previousOutTextElement, currentOutTextElement, pastPrev, pastCurr, pastOp ) {
    this.previousOutTextElement = previousOutTextElement;
    this.currentOutTextElement = currentOutTextElement;
    this.clear();
    this.loadPrevSession(pastPrev, pastCurr, pastOp);
  }

  // Clears display
  clear() {
    this.previousOut = "";
    this.currentOut = "";
    this.operation = undefined;
  }

  // Load previous session from local storage of browser
  loadPrevSession(prev, curr, op) {
    if (prev && prev !== "") {
      this.previousOut = prev;
    }
    if (curr && curr !== "") {
      this.currentOut = curr;
    }
    if (op && op != "undefined") {
      this.operation = op;
    }
    this.updateDisplay();
  }

  // Backspace operation
  delete() {
    this.currentOut = this.currentOut.toString().slice(0, -1);
  }

  // Add number with each number button click
  appendNumber(number) {
    if (number === "." && this.currentOut.includes(".")) return;
    this.currentOut = this.currentOut.toString() + number.toString();
  }
  
  // Define operation when a corresponding mathematical operation is selected
  chooseOperation(operation) {
    if (this.currentOut === "") return;
    if (this.previousOut !== "") {
      this.compute();
    }
    this.operation = operation;
    this.previousOut = this.currentOut;
    this.currentOut = "";
  }
  
  // Compute the output based on the values and operation passed
  compute() {
    let computedVal;
    const prev = parseFloat(this.previousOut);
    const curr = parseFloat(this.currentOut);
    if (isNaN(prev) || isNaN(curr)) return;
    switch (this.operation) {
      case "+":
        computedVal = prev + curr;
        break;
      case "-":
        computedVal = prev - curr;
        break;
      case "×":
        computedVal = prev * curr;
        break;
      case "÷":
        computedVal = prev / curr;
        break;
      default:
        return;
    }
    this.currentOut = computedVal;
    this.operation = undefined;
    this.previousOut = "";
  }
  
  // Display the output with proper comma separated notation in output window
  getDisplayNumber(number) {
    const stringNumber = number.toString();
    const integerDigits = parseFloat(stringNumber.split(".")[0]);
    const decimalDigits = stringNumber.split(".")[1];
    let integerDisplay;
    if (isNaN(integerDigits)) {
      integerDisplay = "";
    } else {
      integerDisplay = integerDigits.toLocaleString("en", {maximumFractionDigits: 0});
    }
    if (decimalDigits != null) {
      return `${integerDisplay}.${decimalDigits}`;
    } else {
      return integerDisplay;
    }
  }
  
  // Update display with every operation
  updateDisplay() {
    this.currentOutTextElement.innerText = this.getDisplayNumber(this.currentOut);
    if (this.operation != null) {
      this.previousOutTextElement.innerText = `${this.getDisplayNumber(this.previousOut)} ${this.operation}`;
    } else {
      this.previousOutTextElement.innerText = "";
    }
    localStorage.setItem("prevOut", this.previousOut);
    localStorage.setItem("operator", this.operation);
    localStorage.setItem("currOut", this.currentOut);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // Connect to web socket SocketIO
  var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

  // Define various buttons
  const numberButtons = document.querySelectorAll("[data-num]");
  const operationButtons = document.querySelectorAll("[data-ops]");
  const equalsButton = document.querySelector("[data-equals]");
  const deleteButton = document.querySelector("[data-del]");
  const allClearButton = document.querySelector("[data-allclr]");
  const previousOutTextElement = document.querySelector("[data-prevout]");
  const currentOutTextElement = document.querySelector("[data-currout]");

  // Load prev data if any from local storage
  var pastSessionPrev = localStorage.getItem("prevOut");
  var pastSessionCurr = localStorage.getItem("currOut");
  var pastSessionOp = localStorage.getItem("operator");

  var stringBuilder = new Array();

  var pastCalc = localStorage.getItem("pastCalc");

  if (pastCalc) {
    stringBuilder.push(pastCalc);
  }

  // Create instance of calculator class
  const calculator = new Calculator(previousOutTextElement, currentOutTextElement, pastSessionPrev, pastSessionCurr, pastSessionOp);

  // Simulate number button click
  numberButtons.forEach(button => {
    button.addEventListener("click", () => {
      calculator.appendNumber(button.innerText);
      calculator.updateDisplay();
      stringBuilder.push(button.innerText);
      localStorage.setItem("pastCalc", stringBuilder.join(""));
    });
  });

  // Simulate operator button click
  operationButtons.forEach(button => {
    button.addEventListener("click", () => {
      if (currentOutTextElement.innerText !== '') {
          stringBuilder.push(" ", button.innerText, " ");
          localStorage.setItem("pastCalc", stringBuilder.join(""));
      }
      calculator.chooseOperation(button.innerText);
      calculator.updateDisplay();
    });
  });

  // Simulate AC button click
  allClearButton.addEventListener("click", button => {
    calculator.clear();
    calculator.updateDisplay();
    stringBuilder = new Array();
    localStorage.setItem("pastCalc", stringBuilder.join(""));
  });

  // Simulate equals button click
  equalsButton.addEventListener("click", button => {
    calculator.compute();
    calculator.updateDisplay();
    stringBuilder.push(" = ", currentOutTextElement.innerText.replace(/,/g, ""));
    // Post operation to server which will be fanned out to all the clients connected
    socket.send(stringBuilder.join(""))
    stringBuilder = new Array();
    stringBuilder.push(currentOutTextElement.innerText.replace(/,/g, ""));
    localStorage.setItem("pastCalc", stringBuilder.join(""));
  });

  // Simulate delete button click
  deleteButton.addEventListener("click", button => {
    calculator.delete();
    calculator.updateDisplay();
    // Delete entry from local storage
    let lastItem = stringBuilder.pop();
    let lastCh = lastItem.slice(-1);
    if (lastItem) {
      if (lastItem.length !== 1) {
        if (!isNaN(lastCh)) {
          lastItem = lastItem.slice(0, -1);
        }
        stringBuilder.push(lastItem);
      } else {
        if (isNaN(lastItem) || lastItem === " ") {
          stringBuilder.push(lastItem);
        }
      }
    }
    localStorage.setItem("pastCalc", stringBuilder.join(""));
  });

  // Receive socket information from server to update the calculator logs
  socket.on('message', data => {
      let histElement = document.querySelector('[data-history]');
      histElement.innerHTML = ''
      if (data) {
        let data_iterator = data.split(";");
        let unord_list = document.createElement("ul");
        for (var i=0; i<data_iterator.length-1; i++) {
          let list_item = document.createElement("li");
          list_item.innerText = data_iterator[i];
          unord_list.appendChild(list_item);
        }
        histElement.appendChild(unord_list);
      } else {
        let no_hist = document.createElement("div");
        no_hist.className = "no-hist";
        no_hist.innerText = " No logs";
        histElement.appendChild(no_hist);
      }
  })
});
  