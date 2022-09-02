let socket;
let isJoined = false;
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
})
