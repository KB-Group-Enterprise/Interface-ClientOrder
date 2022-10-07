let socket;
let isJoined = false;
function setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    let expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}
function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return undefined;
}
const joinBtn = document.getElementById('join')
joinBtn.addEventListener('click', () => {
    let tokenElem = document.getElementById('token')
    const token = tokenElem.value
    const socketOptions = {
        transportOptions: {
            polling: {
                extraHeaders: {
                    Authorization: `Bearer ${token}`, //'Bearer h93t4293t49jt34j9rferek...'
                }
            }
        }
    };
    socket = io.connect('http://localhost:3505/client', socketOptions)
    isJoined = true
    socket.emit('getCurrentOrder')
    socket.on('currentOrder', (data) => {
        const ordersElem = document.getElementById('orders')
        ordersElem.innerHTML = ''
        for (const order of data.orders) {
            const li = document.createElement('li');
            li.innerHTML = JSON.stringify(order)
            ordersElem.appendChild(li);
        }
    })

    socket.on('error', (error) => {
        console.log(error)
    })
    socket.on('updatedClientOrder', (message) => {
        console.log('updatedClientOrder', message)
    })
})
const form = document.getElementById('updateOrderForm')
form.addEventListener('submit', (event) => {
    event.preventDefault();
    const orderId = document.getElementById('orderId')?.value;
    const clientState = document.getElementById('clientState')?.value;
    const overallFoodStatus = document.getElementById('overallFoodStatus')?.value;
    const status = document.getElementById('orderStatus')?.value;
    const deleteFoodOrderList = document.getElementById('deleteFoodOrderList')?.value;
    const updateFoodOrderId = document.getElementById('updateFoodOrderId')?.value;
    const foodOrderStatus = document.getElementById('foodOrderStatus')?.value;
    const transferTableId = document.getElementById('transferTableId')?.value;
    // console.log(orderId, clientState, overallFoodStatus, status, deleteFoodOrderList, transferTableId)
    const updateFoodOrderList = [{
        foodOrderId: updateFoodOrderId || undefined,
        status: foodOrderStatus || undefined
    }]
    socket.emit('updateClientOrder', {
        orderId,
        clientState,
        overallFoodStatus,
        status,
        updateFoodOrderList: updateFoodOrderList,
        deleteFoodOrderList: deleteFoodOrderList ? deleteFoodOrderList?.split(',') : undefined,
        transferTableId: transferTableId ? transferTableId : undefined
    })
})
