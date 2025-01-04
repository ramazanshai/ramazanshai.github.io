document.getElementById('calculate').addEventListener('click', function () {
    const num1 = document.getElementById('num1').value;
    const num2 = document.getElementById('num2').value;
    const operation = document.getElementById('operation').value;

    if (num1 === '' || num2 === '') {
        alert('Please enter both numbers.');
        return;
    }

    let result;

    // Perform the operation based on user selection
    switch (operation) {
        case '+':
            result = parseFloat(num1) + parseFloat(num2);
            break;
        case '-':
            result = parseFloat(num1) - parseFloat(num2);
            break;
        case '*':
            result = parseFloat(num1) * parseFloat(num2);
            break;
        case '/':
            if (num2 == 0) {
                alert("Division by zero is not allowed.");
                return;
            }
            result = parseFloat(num1) / parseFloat(num2);
            break;
        case '%':
            result = parseFloat(num1) % parseFloat(num2);
            break;
        default:
            alert('Invalid operation');
            return;
    }

    // Display the result
    document.getElementById('result').textContent = 'Result: ' + result;
});

// Handle orientation change (rotation of the device)
window.addEventListener('orientationchange', function() {
    if (window.orientation === 90 || window.orientation === -90) {
        console.log("Landscape mode");
    } else {
        console.log("Portrait mode");
    }
});
