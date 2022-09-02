const socket = io('http://localhost:3505/client')
let username = document.getElementById('username').value;
let tableToken = document.getElementById('tableToken').value;
let userId
let order
let restaurantId
let isCreateOrder = true;
socket.on('connect', (s) => {
    // console.log(s)
    const socketIdElement = document.getElementById('socketId');
    socketIdElement.innerText = socket.id
})

const joinButton = document.getElementById('joinTable')
joinButton.addEventListener('click', (event) => {
    username = document.getElementById('username').value;
    tableToken = document.getElementById('tableToken').value;
    socket.emit('joinTable', {
        username: username,
        tableToken: tableToken,
    })
})

// Begin Order
const orderButton = document.getElementById('orderAction')
orderButton.addEventListener('click', (event) => {
    tableToken = document.getElementById('tableToken').value;
    const selectedFoodListElem = document.getElementById('onSelectedFood').children;
    const clientGroupId = document.getElementById('clientGroupId').innerText
    const menuArr = Array.from(selectedFoodListElem)
    const foodOrderList = menuArr.map(menu => {
        const regex = /{.+}/gi
        const menuString = menu.outerText.match(regex)[0]
        return JSON.parse(menuString)
    })
    console.log('Selected food', foodOrderList)
    // const selectedFoodList = getValues(menuList)
    if (isCreateOrder) {
        socket.emit('handleCreateOrder', {
            foodOrderList: foodOrderList,
            restaurantId: restaurantId,
            clientGroupId: clientGroupId,
            tableToken,
        })
    } else {
        socket.emit('handleUpdateOrder', {
            orderId: order.id,
            additionalFoodOrderList: foodOrderList,
            clientGroupId: clientGroupId,
            tableToken
        })
    }
})

socket.on('updatedOrder', (message) => {
    const selectedFoodListElem = document.getElementById('onSelectedFood');
    selectedFoodListElem.innerHTML = '';
})
// End of Order

const leaveTable = document.getElementById('leaveTable')
leaveTable.addEventListener('click', () => {
    username = document.getElementById('username').value;
    tableToken = document.getElementById('tableToken').value;
    socket.emit('leaveTable', {
        username: username,
        tableToken: tableToken,
    })
})
socket.on('joinedTable', (message) => {
    console.log('joinedTable: ', message)
    const joinedTable = document.getElementById('joinedTable')
    const userIdElem = document.getElementById('userId')
    leaveTable.style = 'display: block;'
    joinedTable.innerText = JSON.stringify(message)
    userId = message.userId
    userIdElem.innerText = userId
})

socket.on('leftTable', (message) => {
    console.log('leftTable', message)
    const joinedTable = document.getElementById('joinedTable')
    const leaveTable = document.getElementById('leaveTable')
    const onSelectedFood = document.getElementById('onSelectedFood')
    const userInRoom = document.getElementById('userInRoom')
    const messageElem = document.getElementById('message')
    const type = document.getElementById('type')
    joinedTable.innerText = ''
    messageElem.innerHTML = ''
    type.innerHTML = ''
    onSelectedFood.innerHTML = '';
    userInRoom.innerHTML = '';
    leaveTable.style = 'display: none;'
})


const selectFood = document.getElementById('selectFood')
selectFood.addEventListener('click', () => {
    const menuList = document.getElementById('menuList').options
    const selectedFood = getValues(menuList)
    console.log('select food', selectedFood)
    if (!selectedFood) return;
    for (const food of selectedFood) {
        socket.emit('selectFood', {
            userId,
            username,
            tableToken,
            selectedFood: food,
        })
    }
})

function getValues(options) {
    const selected = []
    for (const option of options) {
        if (option.selected) {
            const split = option.value.split('&')
            selected.push({
                menuId: split[0],
                foodName: split[1],
                selectedOptions: [],
            })
        }
    }
    return selected
}

socket.on('selectedFood', (data) => {
    const selectedFood = document.getElementById('selectedFoodList')
    const li = document.createElement('li')
    li.innerHTML = JSON.stringify(data)
    selectedFood.appendChild(li)
})

let lastestDeselectFood;
function deselectFood(foodOrderId) {
    socket.emit('deselectFood', {
        userId,
        username,
        tableToken,
        foodOrderId: foodOrderId
    })
}
socket.on('deselectedFood', (data) => {
    console.log('deselectedFood', data)
    const deselectedFood = document.getElementById('deselectedFood')
    deselectedFood.innerText = JSON.stringify(data)
})

socket.on('noti-table', async (data) => {
    console.log('noti-table', data)
    const onSelectedFood = document.getElementById('onSelectedFood')
    const userInRoom = document.getElementById('userInRoom')
    const message = document.getElementById('message')
    const type = document.getElementById('type')
    const clientGroupId = document.getElementById('clientGroupId')
    clientGroupId.innerText = data.clientGroupId
    message.innerHTML = data.message
    type.innerHTML = data.type
    onSelectedFood.innerHTML = '';
    userInRoom.innerHTML = '';
    for (const user of data.usernameInRoom) {
        const li = document.createElement('li')
        li.innerText = JSON.stringify(user)
        userInRoom.appendChild(li)
    }
    for (const food of data.selectedFoodList) {
        const div = document.createElement('div')
        const li = document.createElement('li')
        // const button = `<button class='deselect' onclick="deselectFood('${food.foodOrderId}')"  > deselect </button>`
        const button = document.createElement('button')
        button.className = 'deselect'
        button.addEventListener('click', () => {
            deselectFood(`${food.foodOrderId}`)
        })
        button.innerText = 'deselect'
        li.innerHTML = JSON.stringify(food)
        div.appendChild(li)
        div.appendChild(button)
        onSelectedFood.appendChild(div)
    }
    restaurantId = data.restaurantId;
    const res = await fetch(`http://192.168.1.104:4000/api/menu/restaurant/${data.restaurantId}`)
    const json = await res.json();
    const menuList = json.data.menu
    console.log('menuList', menuList)
    const menuListElem = document.getElementById('menuList')
    menuListElem.innerHTML = '';
    for (const menu of menuList) {
        const option = document.createElement('option')
        option.value = `${menu.id}&${menu.foodName}`
        option.innerText = `menuId: ${menu.id} foodName: ${menu.foodName}`
        menuListElem.appendChild(option)
    }
    if (data.order) {
        order = data.order;
        const foodOrderListElem = document.getElementById('foodOrderList')
        foodOrderListElem.innerHTML = ''
        isCreateOrder = false;
        orderButton.innerText = 'Update order'
        for (const foodOrder of data.order.foodOrderList) {
            const foodOrderLi = document.createElement('li')
            foodOrderLi.innerText = JSON.stringify(foodOrder)
            foodOrderListElem.appendChild(foodOrderLi)
        }
    }
})

socket.on('error', (data) => {
    const error = document.getElementById('error')
    error.innerText = JSON.stringify(data)
})