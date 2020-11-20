const get404 = (req, res, next) => {
    res.status(404)
        .render(
            '404-notfound', 
            {pageTitle: 'Not Found!',
            path:'',
            isAuthenticated: req.isAuthenticated

        }
        )
}

const errors = {
    get404
}
export default errors