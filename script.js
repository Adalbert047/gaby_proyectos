async function getCategories() {
    console.log("getCategories");
    const response = await fetch('https://dummyjson.com/products/categories');
    const data = await response.json();
    createCategories(data);
    return data;
}

function createCategories(categories) {
    const template_categories = document.querySelector("#template-categories");
    const container_categories = document.querySelector(".categories ul");
    container_categories.style.color = "white";
    container_categories.style.textAlign = "center";
    container_categories.innerHTML = "Obteniendo categorias...";
    const fragment = document.createDocumentFragment();

    categories.forEach(category => {
        const template = document.importNode(template_categories.content, true)
        const title = template.querySelector(".category > div > a");
        title.textContent = category.toUpperCase();
        fragment.appendChild(template);
    });

    container_categories.innerHTML = "";
    container_categories.appendChild(fragment);
}
getCategories()

document.addEventListener("DOMContentLoaded", function () {
    const containerCategories = document.querySelector(".categories ul");

    containerCategories.addEventListener("click", async function (event) {
        if (event.target.tagName === "A") {
            const category = event.target.textContent.toLowerCase();
            await getProductsByCategory(category);
        }
    });

    async function getProductsByCategory(category) {
        try {
            const response = await fetch(`https://dummyjson.com/products/category/${category}?limit=10`);
            const products = await response.json();
            renderProducts(products, category);
        } catch (error) {
            console.error("Error obteniendo los produtos :", error);
        }
    }

    function renderProducts(response, category) {
        const containerProductsContent = document.querySelector(".products");
        const categoryTitle = document.querySelector(".categorie-title h1");
        const totalProducts = document.querySelector(".categorie-title h4");

        categoryTitle.textContent = category.toUpperCase();

        if (!Array.isArray(response.products)) {
            console.error("Los datos del producto no se encuentran:", response);
            totalProducts.textContent = "Error cargando productos";
            return;
        }

        totalProducts.textContent = `Total productos ${response.total}`;

        const templateProduct = document.getElementById("template-product");
        const fragment = document.createDocumentFragment();

        response.products.forEach(productData => {
            const template = document.importNode(templateProduct.content, true);

            template.querySelector("h3").textContent = productData.title;
            template.querySelector(".product-circle img").src = productData.images[1];
            template.querySelector(".price span").textContent = `Precio: $${productData.price}`;
            template.querySelector(".stock span").textContent = `Stock: ${productData.stock} pza`;
            template.querySelector(".off span").textContent = `Descuento: $${calculateDiscount(productData.price, productData.discountPercentage)}`;
            template.querySelector(".brand span").textContent = `Brand: ${productData.brand}`;

            const addButton = template.querySelector(".btn-buy");
            addButton.addEventListener("click", function () {
                if (productData.stock >= 50) {
                    const isProductInLocalStorage = checkProductInLocalStorage(productData.id);
                    if (!isProductInLocalStorage) {
                        addToLocalStorage(productData);
                    } else {
                        alert("El producto ya está en el carrito.");
                    }
                } else {
                    alert("No hay suficiente stock para agregar este producto.");
                }
            });

            const deleteButton = template.querySelector(".btn-danger");
            deleteButton.addEventListener("click", function () {
                const confirmation = confirm(`¿Desea eliminar el producto ${productData.title}?`);
                if (confirmation) {
                    removeFromLocalStorage(productData.id);
                }
            });

            fragment.appendChild(template);
        });

        containerProductsContent.innerHTML = "";
        containerProductsContent.appendChild(fragment);
    }

    function calculateDiscount(price, discountPercentage) {
        const discount = (price * discountPercentage) / 100;
        return price - discount;
    }

    function addToLocalStorage(productData) {
        let cartProducts = JSON.parse(localStorage.getItem("cart")) || [];
        cartProducts.push(productData);
        localStorage.setItem("cart", JSON.stringify(cartProducts));
        alert("Producto agregado al carrito");
    }

    function checkProductInLocalStorage(productId) {
        const cartProducts = JSON.parse(localStorage.getItem("cart")) || [];
        return cartProducts.find(product => product.id === productId) !== undefined;
    }

    function removeFromLocalStorage(productId) {
        let cartProducts = JSON.parse(localStorage.getItem("cart")) || [];
        cartProducts = cartProducts.filter(product => product.id !== productId);
        localStorage.setItem("cart", JSON.stringify(cartProducts));
        alert("Producto eliminado del carrito");
    }

    getCategories();
});
