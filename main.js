function upDataLocalStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

async function getProducts() {
    try {
        const data = await fetch(
            "https://ecommercebackend.fundamentos-29.repl.co/"
        );
        const res = await data.json();

        upDataLocalStorage("products", res);

        return res;
    } catch (error) {
        console.error(error);
    }
}

function printProducts(db) {

    let html = "";

    db.products.forEach(({ image, name, price, quantity, id, category}) => {
        html += `
            <div class="product ${category}">
                <div class="product__img">
                    <img src="${image}"
                    alt="${name}">
                </div>
                <div class="product__body">

                        <h3>
                            $${price}.00
                            <span class=" product__body--${quantity ? "" : "soldOut "}">
                                ${quantity ? "stock:" : "" }  ${quantity ? quantity : "sold Out" }
                            </span>
                        </h3>

                    ${
                        quantity
                            ? `<i class='bx bx-plus' id="${id}"></i>`
                            : "<div></div>"
                    }
                    <h4=>${name}</h4>
                </div>
            </div>
        `;
    });

    document.querySelector(".products").innerHTML = html;
}

function handleShowCart() {
    const iconCartHTML = document.querySelector("#iconCart");
    const cartHTML = document.querySelector(".cart");

    iconCartHTML.addEventListener("click", function () {
        cartHTML.classList.toggle("cart__show");
    });
}

function printProductsCart(db) {
    let html = "";

    Object.values(db.cart).forEach((item) => {
        html += `
              <div class="cartItem">
                     <div class="cartItem__img">
                         <img src="${item.image}" alt="${item.name}"/>
                     </div>

                     <div class="cartItem__body">
                         <h4>${item.name}</h4>
                         <p>stock: ${item.quantity} | <span>$${item.price}.00</span> </p>
                         <span>Subtotal:$${item.price * item.amount}.00</span>

                         <div class="cartItem__options" data-id="${item.id}">
                             <i class="bx bx-minus"></i>
                             <p>${item.amount} unit</p>
                             <i class="bx bx-plus"></i>
                             <i class="bx bx-trash"></i>
                        </div>
                     </div>

              </div>
         `;
    });

    document.querySelector(".cart__products").innerHTML = html;
}

function addCartFromProducts(db) {
    const productsHTML = document.querySelector(".products");

    productsHTML.addEventListener("click", function (e) {
        if (e.target.classList.contains("bx-plus")) {
            const productId = Number(e.target.id);

            const productFind = db.products.find(function (product) {
                return product.id === productId;
            });

            if (db.cart[productId]) {
                if (db.cart[productId].amount === db.cart[productId].quantity)
                    return alert("stock insuficiente");

                db.cart[productId].amount += 1;
            } else {
                db.cart[productId] = structuredClone(productFind);
                db.cart[productId].amount = 1;
            };

            upDataLocalStorage("cart", db.cart);

            printProductsCart(db);
            printTotal(db);

        }
    });
}

function printTotal(db) {
    const amountItemsHTML = document.querySelector("#amountItems")
    const cartTotalInfoHTML = document.querySelector(".cart__total--info");

    let amountProducts = 0
    let priceTotal = 0

    Object.values(db.cart).forEach((item) => {
        amountProducts += item.amount;
        priceTotal += item.amount * item.price;

    });

    let html = `
    <p>
        <b> Items: </b> ${amountProducts} Unit
    </p>
    <p>
        <b> Total:</b>$${priceTotal}.00 USD
    </p>
    `;



    cartTotalInfoHTML.innerHTML = html;
    amountItemsHTML.textContent = amountProducts;
}

function handleCart(db) {
    const cartProductsHTML = document.querySelector(".cart__products");

    cartProductsHTML.addEventListener("click", function (e) {
        if (e.target.classList.contains("bx-minus")) {
            const productId = Number(e.target.parentElement.dataset.id)
            if (db.cart[productId].amount === 1) {

                const response = confirm("Esta seguro de eliminar este producto")
                if (!response) return;
                delete db.cart[productId];
            } else {
                db.cart[productId].amount -= 1;
            };

        };
        if (e.target.classList.contains("bx-plus")) {
            const productId = Number(e.target.parentElement.dataset.id)

            if (db.cart[productId].amount === db.cart[productId].quantity)
                return alert("stock insuficiente");
            db.cart[productId].amount += 1;
        };
        if (e.target.classList.contains("bx-trash")) {
            const productId = Number(e.target.parentElement.dataset.id)

            const response = confirm("Esta seguro de eliminar este producto")
            if (!response) return;
            delete db.cart[productId];
        };
        printProductsCart(db);
        upDataLocalStorage("cart", db.cart);
        printTotal(db);
    });
}

function handleBuy(db) {

    document.querySelector("#btn__buy").addEventListener("click", function() {
        if (!Object.values(db.cart).length)
            return alert("Debe de tener un producto para realizar la compra");

            const newProducts =[];

            for (const product of db.products) {
                const productCart = db.cart[product.id]

                if (product.id === productCart?.id) {
                   newProducts.push({
                      ...product,
                      quantity: product.quantity - productCart.amount
                   });
                } else {
                    newProducts.push( product);
                }
            }
            db.products = newProducts;
            db.cart = {};

            upDataLocalStorage("products", db.products);
            upDataLocalStorage("cart", db.cart);

            printProducts(db);
            printProductsCart(db);
            printTotal(db);
    });
}

function handleFilter(){
    mixitup(".products", {
        selectors: {
            target: '.product'
        },
        animation: {
            duration: 300
        }
    });
}

async function main() {
    const db = {
        products:
            JSON.parse(localStorage.getItem("products")) ||
            (await getProducts()),
        cart: JSON.parse(localStorage.getItem("cart")) || {},
    };

    printProducts(db);
    handleShowCart();
    printProductsCart(db);
    addCartFromProducts(db);
    handleCart(db);
    printTotal(db);
    handleBuy(db);
    handleFilter()

}

 window.addEventListener("load", function () {
     main();
 })
