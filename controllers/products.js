import Product from '../models/product.js'

const getAddProduct = (req, res, next) => {
    res.render(
        'admin/add-product', 
        {
            docTitle: 'Add product', 
            path: 'add-product',
            productCSS: true,
            formsCSS: true,
            activeAddProduct: true
    })
} 

const postAddProduct = (req, res, next) => {
    const product = new Product(req.body.product);
    product.save(() => {
        res.redirect('/')
    });
               
    
}

const getProducts = (req, res, next) => {
    const products = Product.fetchAll((products) => {
        console.log(products)
        res.render(
            'shop/product-list', 
            {
                prods: products, 
                docTitle: 'Shop', 
                path: 'shop', 
                productCSS: true,
                activeShop: true
        })
    })
    
}

const productOperations = {
    getAddProduct,
    postAddProduct,
    getProducts,
}
// module.exports = productOperations
export default  productOperations