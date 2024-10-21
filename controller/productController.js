const apiUrl = 'https://www.es-tela.com/api/?cli=003328&apikey=453971e94725572b4d171a6805d1fb95';

let selectedColor = null;  // Almacena el color seleccionado
let selectedSize = null;   // Almacena el tamaño seleccionado

// Función para obtener las familias de productos desde la API
async function fetchFamilies() {
    try {
        const response = await fetch(`${apiUrl}&r=es/familias`);
        if (!response.ok) {
            throw new Error(`Error en la respuesta de la API: ${response.status}`);
        }
        const data = await response.json();
        displayFamilies(data);
    } catch (error) {
        console.error('Error al obtener las familias:', error);
    }
}

// Función para mostrar las familias en el menú
function displayFamilies(familiesData) {
    const families = Object.values(familiesData);
    const familyMenu = document.getElementById('familias');
    familyMenu.innerHTML = ''; // Limpiar el menú

    families.forEach(family => {
        const familyLi = document.createElement('li');
        const familyDescription = document.createElement('p');
        familyDescription.textContent = family.descripcion.replace(/^\d+\s*/, ''); // Limpiar números

        const subfamilyContainer = document.createElement('div');
        subfamilyContainer.classList.add('subfamilias-container');
        subfamilyContainer.id = `subfamilias-${family.refFamilia}`;

        familyLi.addEventListener('click', () => {
            const isOpen = subfamilyContainer.classList.contains('open');
            document.querySelectorAll('.subfamilias-container').forEach(el => el.classList.remove('open'));
            if (!isOpen) subfamilyContainer.classList.add('open');
        });

        familyLi.appendChild(familyDescription);
        familyLi.appendChild(subfamilyContainer);
        displaySubfamilies(family.subfamilias, subfamilyContainer);
        familyMenu.appendChild(familyLi);
    });
}

// Función para mostrar las subfamilias de una familia
function displaySubfamilies(subfamilies, subfamilyContainer) {
    if (!subfamilies.length) {
        subfamilyContainer.innerHTML = '<p>No hay subfamilias disponibles.</p>';
        return;
    }

    subfamilies.forEach(subfamily => {
        const subfamilyDiv = document.createElement('div');
        const subfamilyDescription = document.createElement('p');
        subfamilyDescription.textContent = subfamily.descripcion.replace(/^\d+\s*/, '');

        subfamilyDescription.addEventListener('click', () => {
            const productContainer = document.getElementById('productos');
            fetchProducts(subfamily.refsubfamilia, productContainer);
        });

        subfamilyDiv.appendChild(subfamilyDescription);
        subfamilyContainer.appendChild(subfamilyDiv);
    });
}

// Resetea las variables selectedColor y selectedSize cuando cambies de producto
async function fetchProductDetails(refProducto) {
    try {
        console.log(`Obteniendo detalles para el producto: ${refProducto}`);

        // Resetea las variables cuando cambias de producto
        selectedColor = null;
        selectedSize = null;

        // Llamar a la nueva función fetchGenericProduct para obtener el producto genérico y sus artículos
        const productDetails = await fetchGenericProduct(refProducto);
        if (!productDetails) {
            throw new Error(`Error al obtener los detalles del producto: ${refProducto}`);
        }
        console.log('Detalles del producto:', productDetails);
        saveToRecentlyViewed(productDetails);
        displayProductDetails(productDetails); // Llamar a la función para mostrar los detalles del producto
        } catch (error) {
        console.error('Error al obtener los detalles del producto:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Hubo un problema al obtener los detalles del producto. Por favor, intenta de nuevo más tarde.',
            confirmButtonText: 'OK'
        });
    }
}
// Función para guardar los últimos tres productos visitados
function saveToRecentlyViewed(productDetails) {
    let recentlyViewed = JSON.parse(localStorage.getItem('recentlyViewed')) || [];

    // Si ya hay 3 productos en la lista, elimina el primero
    if (recentlyViewed.length >= 3) {
        recentlyViewed.shift();
    }

    // Agrega el producto actual al final de la lista
    recentlyViewed.push({
        refProducto: productDetails.refProducto,
        titulo: productDetails.titulo || productDetails.descripcion,
        img: productDetails.imagenes ? productDetails.imagenes['1'].url_min : ''
    });

    // Guarda la lista actualizada en localStorage
    localStorage.setItem('recentlyViewed', JSON.stringify(recentlyViewed));
}
// Resetea las opciones de color y talla cuando cambies de subfamilia
async function fetchProducts(refSubfamilia, productContainer) {
    try {
        // Resetea las variables cuando cambias de subfamilia
        selectedColor = null;
        selectedSize = null;

        const response = await fetch(`${apiUrl}&r=es/productosEnSubfamilia/${refSubfamilia}`);
        if (!response.ok) {
            throw new Error(`Error en la respuesta de la API: ${response.status}`);
        }
        const data = await response.json();
        displayProducts(data, productContainer);
    } catch (error) {
        console.error('Error al obtener los productos de la subfamilia:', error);
    }
}

// Función para mostrar detalles del producto
async function displayProductDetails(productDetails) {
    const productContainer = document.getElementById('productos');
    productContainer.innerHTML = ''; // Limpiar el contenedor para mostrar los detalles

    const productDetailsDiv = document.createElement('div');
    productDetailsDiv.classList.add('product-details', 'card');

    let coloresHTML = '';
    let tallasHTML = '';

    let imagenPrincipalHTML = '';
    if (productDetails.imagenes && productDetails.imagenes['1']) {
        imagenPrincipalHTML = `<img src="${productDetails.imagenes['1'].url_med}" alt="${productDetails.titulo || productDetails.descripcion}" class="product-main-image">`;
    }

    // Mostrar los colores disponibles
    if (productDetails.colores && productDetails.colores.length > 0) {
        coloresHTML = `<p><strong>Seleccionar color:</strong></p><ul class="color-options">`;
        productDetails.colores.forEach(color => {
            const refColor = color.refColor; // Obtener refColor correctamente
            console.log(`Opción de color añadida: ${color.descColor}, RefColor: ${refColor}`);
            coloresHTML += `<li class="color-option" data-color="${color.descColor}" data-refcolor="${refColor}">${color.descColor}</li>`;
        });
        coloresHTML += `</ul>`;
    } else {
        coloresHTML = '<p>No hay colores disponibles.</p>';
    }

    // Mostrar tallas disponibles
    if (productDetails.tallas && productDetails.tallas.length > 0) {
        tallasHTML = `<p><strong>Seleccionar tamaño:</strong></p><ul class="size-options">`;
        productDetails.tallas.forEach(size => {
            tallasHTML += `<li class="size-option" data-size="${size.refTalla}">${size.descTalla}</li>`;
        });
        tallasHTML += `</ul>`;
    } else {
        tallasHTML = '<p>No hay tallas disponibles.</p>';
    }

    // Mostrar los detalles del producto
    productDetailsDiv.innerHTML = `
        <h2>${productDetails.titulo || productDetails.descripcion}</h2>
        ${imagenPrincipalHTML}
        <p><strong>Familia:</strong> ${productDetails.descFamilia}</p>
        <p><strong>Subfamilia:</strong> ${productDetails.descSubfamilia}</p>
        <p class="tabla-tallas"> ${productDetails.descripcionLarga || 'No disponible'}
        <p><strong>Composición:</strong> ${productDetails.descComposicion || 'No disponible'}</p>
        ${coloresHTML}
        ${tallasHTML}
    `;

    productContainer.appendChild(productDetailsDiv);

    // Añadir eventos para la selección de color
    const colorOptions = document.querySelectorAll('.color-option');
    colorOptions.forEach(option => {
        option.addEventListener('click', (e) => {
            selectedColor = e.target.getAttribute('data-refcolor');
            console.log(`Color seleccionado: ${selectedColor}`);
            
            // Quitar la clase active de todos los botones de color
            colorOptions.forEach(opt => opt.classList.remove('active'));
            // Añadir la clase active al botón seleccionado
            option.classList.add('active');

            if (selectedColor && selectedSize) {
                displayPriceAndDetails(selectedColor, selectedSize, productDetails);
            }
        });
    });

    // Añadir eventos para la selección de talla
    const sizeOptions = document.querySelectorAll('.size-option');
    sizeOptions.forEach(option => {
        option.addEventListener('click', (e) => {
            selectedSize = e.target.getAttribute('data-size');
            console.log(`Tamaño seleccionado: ${selectedSize}`);

            // Quitar la clase active de todos los botones de talla
            sizeOptions.forEach(opt => opt.classList.remove('active'));
            // Añadir la clase active al botón seleccionado
            option.classList.add('active');

            if (selectedColor && selectedSize) {
                displayPriceAndDetails(selectedColor, selectedSize, productDetails);
            }
        });
    });
}

// Función para mostrar productos
function displayProducts(products, productContainer) {
    productContainer.innerHTML = ''; // Limpiar el contenedor

    if (products.length === 0) {
        productContainer.innerHTML = '<p>No hay productos disponibles.</p>';
        return;
    }

    products.forEach(product => {
        const productDiv = document.createElement('div');
        productDiv.classList.add('product');

        productDiv.innerHTML = `
            <h4>${product.descripcion}</h4>
            <img src="${product.img_ppal_min}" alt="${product.descripcion}">
        `;

        productDiv.addEventListener('click', () => {
            console.log(`Producto seleccionado: ${product.refProducto}`);
            fetchProductDetails(product.refProducto);
        });

        productContainer.appendChild(productDiv);
    });
}

// Función para obtener el producto genérico (con variantes) y sus artículos
async function fetchGenericProduct(refProducto) {
    try {
        // 1. Obtener el producto genérico
        const response = await fetch(`https://www.es-tela.com/api/?r=es/producto/${refProducto}&cli=003328&apikey=453971e94725572b4d171a6805d1fb95`);
        if (!response.ok) throw new Error('Error al obtener el producto genérico.');
        const productData = await response.json(); // Obtenemos el producto genérico

        // 2. Crear un array para almacenar las promesas de los artículos
        const articlePromises = Object.keys(productData.refArticulosHijos).map(async (articleId) => {
            const articleResponse = await fetch(`https://www.es-tela.com/api/?r=es/articulo/${articleId}&cli=003328&apikey=453971e94725572b4d171a6805d1fb95`);
            if (!articleResponse.ok) throw new Error(`Error al obtener el artículo con ID ${articleId}`);
            const articleData = await articleResponse.json(); // Obtener el artículo específico
            return articleData; // Retorna el artículo específico
        });

        // 3. Esperar a que todas las promesas se resuelvan
        const articles = await Promise.all(articlePromises);

        // 4. Combinar el producto genérico con sus artículos
        productData.articulosHijos = articles; // Agregar la propiedad 'articles' al producto genérico

        return productData; // Retorna el objeto combinado
    } catch (error) {
        console.error('Error en fetchGenericProduct:', error);
        return null; // Retornamos null en caso de error
    }
}

// Función para mostrar detalles del artículo basado en color y talla
function displayPriceAndDetails(selectedColor, selectedSize, productDetails) {
    const productContainer = document.getElementById('productos');
    let articleDetailsDiv = productContainer.querySelector('.article-details');

    // Buscar el artículo que coincida con el color y la talla seleccionados
    const article = productDetails.articulosHijos.find(art => art.refColor === selectedColor && art.refTalla === selectedSize);
    console.log(article);

    // Si no se encuentra el artículo, mostrar SweetAlert y limpiar el div si existe
    if (!article) {
        Swal.fire({
            icon: 'warning',
            title: 'Artículo no disponible',
            text: 'No se encontró un artículo que coincida con la selección de color y tamaño.',
        });

        // Limpiar el contenido del div con la clase 'article-details' si ya existe
        if (articleDetailsDiv) {
            articleDetailsDiv.remove(); // Eliminar el div completo si existe
        }
        return; // Salir de la función para evitar más procesamiento
    }

    // Solo si el artículo existe, proceder a crear el div y mostrar los detalles
    if (!articleDetailsDiv) {
        articleDetailsDiv = document.createElement('div');
        articleDetailsDiv.classList.add('article-details', 'card');
        productContainer.appendChild(articleDetailsDiv);
    }

    // Limpiar el contenido del div con la clase 'article-details'
    articleDetailsDiv.innerHTML = '';

    let imagesHTML = '';
    if (article.imagenes) {
        imagesHTML = '<div class="carousel">';
        Object.keys(article.imagenes).forEach((key, index) => {
            imagesHTML += `
                <div class="carousel-item ${index === 0 ? 'active' : ''}">
                    <img src="${article.imagenes[key].url_med}" alt="${article.imagenes[key].nombreOriginal}">
                </div>
            `;
        });
        imagesHTML += `
            <button class="carousel-control prev" onclick="prevSlide()">&#10094;</button>
            <button class="carousel-control next" onclick="nextSlide()">&#10095;</button>
        </div>`;
    } else {
        imagesHTML = '<p>No hay imágenes disponibles para este artículo.</p>';
    }

    articleDetailsDiv.innerHTML = `
        <h2>${article.descripcion}</h2>
        <p><strong>Color:</strong> ${article.descColor || 'No disponible'}</p>
        <p><strong>Tamaño:</strong> ${article.descTalla || 'No disponible'}</p>
        <p><strong>PVP:</strong> €${article.pvp || 'No disponible'}</p>
        ${imagesHTML}
        <button id="addToCartBtn" class="cta-btn">Añadir al Carrito</button>

    `;
    document.getElementById('addToCartBtn').addEventListener('click', () => {
        addToCart(article, selectedColor, selectedSize);
    });
    // Inicializar el carrusel
    initCarousel();
}

// Función para inicializar el carrusel
function initCarousel() {
    const items = document.querySelectorAll('.carousel-item');
    let currentIndex = 0;

    function showSlide(index) {
        items.forEach((item, i) => {
            item.classList.toggle('active', i === index);
        });
    }

    window.prevSlide = function() {
        currentIndex = (currentIndex > 0) ? currentIndex - 1 : items.length - 1;
        showSlide(currentIndex);
    };

    window.nextSlide = function() {
        currentIndex = (currentIndex < items.length - 1) ? currentIndex + 1 : 0;
        showSlide(currentIndex);
    };
}


fetchFamilies();