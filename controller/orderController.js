// Función para mostrar el historial de pedidos
async function displayOrderHistory() {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

    if (!loggedInUser) {
        Swal.fire({
            icon: 'error',
            title: 'No estás logueado',
            text: 'Debes iniciar sesión para ver tu historial de pedidos.',
        });
        return;
    }

    try {
        // Obtener el usuario logueado con sus pedidos
        const response = await fetch(`http://localhost:3005/users/${loggedInUser.id}`);
        const userData = await response.json();

        // Obtener los pedidos del usuario
        const orders = userData.orders || [];

        // Verificar si hay pedidos
        if (orders.length === 0) {
            document.getElementById('order-history').innerHTML = '<p>No tienes pedidos en tu historial.</p>';
            return;
        }

        // Pintar cada pedido en el historial
        const orderHistoryContainer = document.getElementById('order-history');
        orderHistoryContainer.innerHTML = ''; // Limpiar el contenedor

        orders.forEach(order => {
            const orderDate = new Date(order.orderDate).toLocaleDateString();

            let orderItemsHtml = '';
            order.items.forEach(item => {
                orderItemsHtml += `
                    <div class="order-item">
                        <img src="${item.image}" alt="${item.title}">
                        <div>
                            <p><strong>${item.title}</strong></p>
                            <p>Color: ${item.color}</p>
                            <p>Tamaño: ${item.size}</p>
                            <p>Precio: €${item.price.toFixed(2)}</p>
                            <p>Cantidad: ${item.quantity}</p>
                        </div>
                    </div>
                `;
            });

            // Insertar la información del pedido en el historial
            orderHistoryContainer.innerHTML += `
                <div class="order">
                    <h3>Pedido #${order.orderId} - Fecha: ${orderDate}</h3>
                    <div class="order-items">
                        ${orderItemsHtml}
                    </div>
                    <p><strong>Total del Pedido: €${order.total.toFixed(2)}</strong></p>
                </div>
            `;
        });
    } catch (error) {
        console.error('Error al obtener el historial de pedidos:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error al cargar el historial',
            text: 'Hubo un problema al cargar tu historial de pedidos. Intenta nuevamente más tarde.',
        });
    }
}

// Ejecutar la función cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', displayOrderHistory);