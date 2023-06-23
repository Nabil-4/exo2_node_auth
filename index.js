const express = require('express')
const mysql = require('mysql')
const session = require('express-session')
const bcrypt = require('bcrypt')

const app = express()

app.use(express.urlencoded({extended : true}))

const connect = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "auth_exo_node"
})

connect.connect((err) => {
    console.log('Connection')
})

const port = 8080
app.listen(port, () => {
    console.log(`http://localhost:${port}`)
})

app.set("view engine", 'ejs')

app.use(session({
    secret : 'secret',
    resave : true,
    saveUninitialized : true
}))

app.get('/', (req, res) => {
    res.render('login')
})

app.get('/register', (req, res) => {
    res.render('register')
})

app.get('/login', (req, res) => {
    res.render('login')
})

app.get('/dashboard', (req, res) => {
    const user = req.session.user
    res.render('dashboard', {user : user})
})

app.get('/addProduct', (req, res) => {
    res.render('addProduct')
})

app.get('/listProduct', (req, res) => {
    const getAllProduct = "SELECT * FROM produit"
    connect.query(getAllProduct, (err, result) => {
        res.render('listProduct', {allProduct : result})
    })
})

app.get('/logout', (req, res) => {
    req.session.destroy()
    res.redirect('/login')
})


app.post('/register', (req, res) => {
    const {username, email, password} = req.body
    const ifUserExist = "SELECT * FROM users WHERE username = ? OR email = ?"
    connect.query(ifUserExist, [username, email], (err, result) => {
        if (!result[0]) {
            bcrypt.hash(password, 10, (err, passwordHash) => {
                const userRegistration = "INSERT INTO users(username, email, password) VALUES(?, ?, ?) "
                connect.query(userRegistration, [username, email, passwordHash], (err, result) => {
                    res.redirect('/login')
                }) 
            })
        } else {
            res.send('username ou email deja utilise')
        }
    })
})


app.post('/login', (req, res) => {
    const {username, password} = req.body
    const userConnect = "SELECT * FROM users WHERE username = ?"
    connect.query(userConnect, [username], (err, result) => {
        if (result[0]) {
            bcrypt.compare(password, result[0].password, (err, isMatch) => {
                if (isMatch) {
                    req.session.user = result[0]
                    res.redirect('dashboard')
                } else {
                    res.send("password incorrect")
                }
            })
        } else {
            res.send("username inconnu ou mdp incorrect")
        }
    })
})


app.post('/addProduct', (req, res) => {
    const {titre, description, img} = req.body
    const productExists = "SELECT * FROM produit WHERE titre = ?"
    connect.query(productExists, [titre], (err, result) => {
        if (!result[0]) {
            const addProduct = "INSERT INTO produit(titre, description, img) VALUES(?, ?, ?)"
            connect.query(addProduct, [titre, description, img], (err, result) => {
                res.redirect('/listProduct')
            }) 
        } else {
            res.send('Ce produit existe deja')
        }
    })
})