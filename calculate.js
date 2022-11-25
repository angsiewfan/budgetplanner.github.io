const input = document.getElementById("inputIncome")
const inputExpense = document.getElementById("inputExpense")
const clearButton = document.getElementById("clearAll")
const button = document.getElementById("buttonIncome")
const add = document.getElementById("buttonAdd")
const income = document.getElementById("idIncome")
const balance = document.getElementById("idBalance")
const expense = document.getElementById("idExpense")
const expenseList = document.createElement('li')
const list = document.getElementById('list')
const currency = "RM"
let totalIncome = 0
let arrayOfArray = []

// Load google charts
google.charts.load('current', {'packages':['corechart']});
google.charts.setOnLoadCallback(drawChart);

const localStorageCategory = JSON.parse(
    localStorage.getItem('categories')
);

let categories = localStorage.getItem('categories') !== null ? localStorageCategory : []

const localStorageIncome = JSON.parse(
    localStorage.getItem('arrIncome')
);
let arrIncome = localStorage.getItem('arrIncome') !== null ? localStorageIncome : []

// income
function submitIncome() {
    message.innerHTML = ''
    messageIncome.innerHTML = ''
    if (input.value.trim() === "") 
    {
        messageIncome.innerHTML = `<span style="color: red">*Income cannot be empty.</span>`
    }
    else
    {
        const savedIncome = {
            input: "inputIncome",
            amount: parseFloat(input.value)
        }

        if(arrIncome.some(item => item.input === "inputIncome"))
        {
            console.log("Income already exists")
            arrIncome = []
        }

        arrIncome.push(savedIncome)
    
        updateLocalStorageIncome()

        totalIncome = input.value

        // calculate amounts
        updateTotal()

        let displayIncome = parseFloat(input.value).toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2})

        income.innerHTML = `${currency} ${displayIncome}`
    }
}
button.addEventListener("click", submitIncome)

// add expenses drop down list
let expenses = ["Transportation",
"Housing",
"Food",
"Utilities",
"Insurance",
"Medical",
"Savings",
"Entertainment",
"Shopping",
"Miscellaneous"]

const select = document.getElementById("arrayExpenses")
function createDropDownList(event) {
    for (var i = 0; i < expenses.length; i++) {
        var optn = expenses[i];
        var option = document.createElement("option")
        option.textContent = optn;
        option.value = optn;
        select.appendChild(option);
    }
 }
createDropDownList()

let totalExpenses = 0
// Add Expenses 
function addExpense(event) {
    let desc = select.options[select.selectedIndex].text
    message.innerHTML = ''
    messageIncome.innerHTML = ''

    if (inputExpense.value.trim() === "") 
    {
        message.innerHTML = `<span style="color: red">*Amount cannot be empty.</span>`
    }
    else
    {
        const category = {
            id: generateID(),
            description: desc,
            amount: parseFloat(inputExpense.value)
        };

        // check whether category already exists
        if(categories.some(cat => cat.description === desc)){
            console.log(desc + " already exists")
            message.innerHTML = `<span style="color: red">*${desc} is already added. Please delete the item before adding new amount.</span>`
        } else{
            console.log(desc + " not yet created")

            // categories is an array - push the new object into array
            categories.push(category)
            updateLocalStorage()

            // display insertion
            addExpensesHistory(category)

            // calculate amounts
            updateTotal()
        }
    }

    document.getElementById("arrayExpenses").selectedIndex = 0
    inputExpense.value = ''
}
add.addEventListener("click", addExpense);

function generateID() {
    return Math.floor(Math.random() * 100000000)
}

function addExpensesHistory(category) {
    const item = document.createElement('li')

    item.innerHTML = `
        <button class="deleteItem" onclick="deleteExpenses(${category.id})">x</button>
        ${category.description} <span style="float: right; color: blue">${currency} ${(category.amount).toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2})}</span>
    `;

    list.appendChild(item)
}

function deleteExpenses(id) {
    // if item.id === id, keep in the categories array
    categories = categories.filter(item => item.id !== id);

    updateLocalStorage();

    updateTotal();

    init();
}

function showIncome(savedIncome) {
    totalIncome = savedIncome.amount
    income.innerHTML = `${currency} ${(savedIncome.amount).toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2})}`
}

function updateTotal() {
    const amounts = categories.map(cat => cat.amount);
    const totExpenses = amounts.reduce((acc, item) => (acc += item), 0)
    
    const totBalance = totalIncome - totExpenses
    if (Math.sign(totBalance) === -1)
    {
        balance.innerHTML = `<span style="color: red">${currency} ${totBalance.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2})}</span>`;
    }
    else
    {
        balance.innerHTML = `<span style="color: green">${currency} ${totBalance.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2})}</span>`;
    }

    expense.innerHTML = `${currency} ${totExpenses.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2})}`;

    getObject(categories);

    drawChart();
}

// function reset() {
//     console.log("Reset all record")
//     console.log("before: " + localStorage.length)
//     window.localStorage.clear()
//     console.log("after: " + localStorage.length)
// }
// clearButton.addEventListener("click", reset);

function updateLocalStorage() {
    localStorage.setItem('categories', JSON.stringify(categories))
}

function updateLocalStorageIncome() {
    localStorage.setItem('arrIncome', JSON.stringify(arrIncome))
}

// Draw the chart and set the chart values
function drawChart() {
    console.log("draw chart")
    console.log(arrayOfArray)

    let data = google.visualization.arrayToDataTable(arrayOfArray);
  
    // Optional; add a title and set the width and height of the chart
    let options = {'title':'My Expenses', 'width':550, 'height':400};
  
    // Display the chart inside the <div> element with id="piechart"
    var chart = new google.visualization.PieChart(document.getElementById('piechart'));
    chart.draw(data, options);
  }

function getObject(categories)
{
    console.log(categories)
    // let tempCategories = Object.assign({}, categories)
    let tempCategories = JSON.parse(JSON.stringify(categories))
    console.log(tempCategories)

    const enumerableLength = Object.keys(tempCategories).length

    let spending = {} //an object of key value pair

    arrayOfArray = []
    arrayOfArray.push(['Category', 'Amount'])
 
    for (let i=0; i<enumerableLength; i++)
    {
        spending = tempCategories[i] // return object -> {id: 1, description: 'Transportation', amount: 14129456.9}
        
        delete spending['id'];

        // const propertyKeys = Object.keys(person);
        // console.log(propertyKeys); 

        // return an array of object values
        const propertyValues = Object.values(spending);
        // console.log(propertyValues); //after delete id return -> ['Transportation', 14129456.9]

        arrayOfArray.push(propertyValues)
    }

    return arrayOfArray
}

function init() {
    list.innerHTML = ''
    message.innerHTML = ''
    messageIncome.innerHTML = ''

    categories.forEach(addExpensesHistory)

    arrIncome.forEach(showIncome)

    updateTotal()
}

init()

