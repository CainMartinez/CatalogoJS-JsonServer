// Función para añadir productos al carrito
function addToCart(product, selectedColor, selectedSize) {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

    if (!loggedInUser) {
        Swal.fire({
            icon: 'error',
            title: 'No estás logueado',
            text: 'Debes iniciar sesión para añadir productos al carrito.',
        });
        return;
    }

    // Obtener el carrito del usuario logueado o inicializarlo vacío
    const userCartKey = `cart_${loggedInUser.username}`;
    const cart = JSON.parse(localStorage.getItem(userCartKey)) || [];

    // Crear el objeto del producto
    const cartItem = {
        productId: product.refArticulo,
        title: product.descripcion,
        color: selectedColor,
        size: selectedSize,
        price: product.pvp,
        image: product.imagenes ? product.imagenes['1'].url_med : '',
        quantity: 1 // Cantidad predeterminada
    };

    // Añadir el producto al carrito del usuario
    cart.push(cartItem);

    // Guardar el carrito actualizado en localStorage
    localStorage.setItem(userCartKey, JSON.stringify(cart));

    // Mostrar mensaje de éxito
    Swal.fire({
        icon: 'success',
        title: 'Producto añadido al carrito',
        text: `${product.descripcion} ha sido añadido al carrito.`,
    });

    // Actualizar el highlight del carrito en el header
    updateCartHighlight();
}

// Función para mostrar los productos en el carrito
function displayCartItems() {
    const cartContainer = document.getElementById('cart-items');

    // Verificar si estamos en la página de carrito
    if (!cartContainer) {
        return; // Si no existe el contenedor del carrito, no hacemos nada
    }

    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

    if (!loggedInUser) {
        Swal.fire({
            icon: 'error',
            title: 'No estás logueado',
            text: 'Debes iniciar sesión para ver tu carrito.',
        });
        return;
    }

    const userCartKey = `cart_${loggedInUser.username}`;
    const cartItems = JSON.parse(localStorage.getItem(userCartKey)) || [];

    cartContainer.innerHTML = ''; // Limpiar el contenedor

    if (cartItems.length === 0) {
        cartContainer.innerHTML = '<p>No hay productos en el carrito.</p>';
        document.getElementById('cart-total').textContent = '€0.00';
        return;
    }

    let total = 0;

    // Mostrar cada producto en el carrito
    cartItems.forEach((item, index) => {
        total += item.price * item.quantity;
        cartContainer.innerHTML += `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.title}">
                <div class="cart-item-details">
                    <h4>${item.title}</h4>
                    <p>Color: ${item.color}</p>
                    <p>Tamaño: ${item.size}</p>
                    <p>Precio: €${item.price}</p>
                    <p>Cantidad: ${item.quantity}</p>
                </div>
                <button class="remove-btn" data-index="${index}">Eliminar</button>
            </div>
        `;
    });

    document.getElementById('cart-total').textContent = `€${total.toFixed(2)}`;

    // Añadir eventos a los botones de eliminar
    document.querySelectorAll('.remove-btn').forEach(button => {
        button.addEventListener('click', function() {
            removeCartItem(this.getAttribute('data-index'));
        });
    });
}

// Función para eliminar un producto del carrito
function removeCartItem(index) {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    const userCartKey = `cart_${loggedInUser.username}`;
    const cartItems = JSON.parse(localStorage.getItem(userCartKey)) || [];

    cartItems.splice(index, 1); // Eliminar el producto en la posición indicada
    localStorage.setItem(userCartKey, JSON.stringify(cartItems)); // Actualizar el carrito en localStorage
    displayCartItems(); // Refrescar el carrito

    // Actualizar el highlight del carrito en el header
    updateCartHighlight();
}

// Evento para vaciar el carrito
document.addEventListener('DOMContentLoaded', () => {
    const clearCartBtn = document.getElementById('clearCartBtn');
    const checkoutBtn = document.getElementById('checkoutBtn');

    // Verificar si estamos en la página de carrito
    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', function() {
            const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
            const userCartKey = `cart_${loggedInUser.username}`;
            localStorage.removeItem(userCartKey);
            displayCartItems(); // Refrescar el carrito

            // Actualizar el highlight del carrito en el header
            updateCartHighlight();
        });
    }

    // Verificar si checkoutBtn existe antes de añadir el event listener
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', processOrder);
    }

    // Mostrar el carrito solo en cart.html
    displayCartItems();

    // Actualizar el highlight del carrito en el header
    updateCartHighlight();
});

// Función para procesar el pedido y almacenarlo en los pedidos del usuario
async function processOrder() {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

    if (!loggedInUser) {
        Swal.fire({
            icon: 'error',
            title: 'No estás logueado',
            text: 'Debes iniciar sesión para completar la compra.',
        });
        return;
    }

    const userCartKey = `cart_${loggedInUser.username}`;
    const cartItems = JSON.parse(localStorage.getItem(userCartKey)) || [];

    if (cartItems.length === 0) {
        Swal.fire({
            icon: 'info',
            title: 'Carrito vacío',
            text: 'No tienes productos en el carrito.',
        });
        return;
    }

    // Crear objeto de pedido
    const newOrder = {
        orderId: Date.now(), // Generar un ID único basado en timestamp
        orderDate: new Date().toISOString(),
        items: cartItems,
        total: cartItems.reduce((total, item) => total + (item.price * item.quantity), 0)
    };

    try {
        // Obtener el usuario actualizado con los pedidos actuales
        const userResponse = await fetch(`http://localhost:3005/users/${loggedInUser.id}`);
        const userData = await userResponse.json();

        // Agregar el nuevo pedido a la lista de pedidos
        const updatedOrders = userData.orders ? [...userData.orders, newOrder] : [newOrder];

        // Actualizar el usuario con los nuevos pedidos
        const updatedUser = { ...userData, orders: updatedOrders };

        // Enviar la actualización del usuario con los pedidos al servidor
        const response = await fetch(`http://localhost:3005/users/${loggedInUser.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedUser)
        });

        if (response.ok) {
            // Limpiar el carrito después de la compra
            localStorage.removeItem(userCartKey);
            displayCartItems(); // Refrescar el carrito

// Mostrar mensaje de éxito que no se verá por la modificación de la base de datos y el reinicio del servidor
            Swal.fire({
                icon: 'success',
                title: 'Compra completada',
                text: 'Tu pedido ha sido realizado con éxito.',
            });

            // Redirigir a la página de historial de pedidos
            window.location.href = '/view/order.html';
            
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error al procesar el pedido',
                text: 'Hubo un problema al procesar tu pedido. Intenta nuevamente.',
            });
        }
    } catch (error) {
        console.error('Error al procesar el pedido:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error en el servidor',
            text: 'No se pudo conectar al servidor. Intenta más tarde.',
        });
    }
}