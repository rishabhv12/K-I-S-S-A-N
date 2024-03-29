var express = require("express")
var ejs = require("ejs")
var bodyParser = require("body-parser")
var mysql = require("mysql")
var session = require("express-session")



var app = express();

mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "node_project"
})

app.use(express.static('public'))
app.set('view engine', 'ejs')

app.use(session({
    secret: 'your-secret-key', // Replace with your own secret key
    resave: false,
    saveUninitialized: true
  }));
  

app.listen(process.env.PORT || 3000, function(){
    console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});


app.use(bodyParser.urlencoded({ extended: true }));

function isProductInCart(cart, id) {
    for (let i = 0; i < cart.length; i++) {
        if (cart[i].id == id) {
            return true;
        }
    }
    return false;
}


function calculateTotal(cart, req) {
    total = 0;
    for (let i = 0; i < cart.length; i++) {
        if (cart[i].sale_price) {
            total = total + (cart[i].sale_price * cart[i].quantity)
            console.log(total);
            console.log(cart[i].quantity);
        } else {
            total = total + (cart[i].price * cart[i].quantity)
            console.log(total);
            console.log(cart[i].quantity);
        }
    }
    req.session.total = total;
    return total;
}

app.get('/', function(req, res) {
    var loggedIn = req.query.loggedIn === 'true';
  
    var con = mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "",
      database: "node_project"
    });
  
    con.connect((err) => {
      if (err) {
        console.log(err);
        res.status(500).send("An error occurred. Please try again later.");
      } else {
        con.query("SELECT * FROM products", function(err, result) {
          if (err) {
            console.log(err);
            res.status(500).send("An error occurred. Please try again later.");
          } else {
            res.render('pages/index', { result: result, loggedIn: loggedIn });
          }
        });
      }
    });
  });
  

app.get('/login', function(req, res) {

    
    res.render('pages/login')

})



app.post('/logout', function(req, res) {
    if (req.session.user) {
      req.session.destroy(function(err) {
        if (err) {
          console.log(err);
          res.status(500).send("An error occurred. Please try again later.");
        } else {
          // Update the loggedIn variable
          loggedIn = false;
          res.redirect('/');
        }
      });
    } else {
      res.redirect('/');
    }
});
  
  
  app.post('/signin', function(req, res) {
    var email = req.body.email;
    var password = req.body.password;
  
    var con = mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "",
      database: "node_project"
    });
  
    con.connect((err) => {
      if (err) {
        console.log(err);
        res.status(500).send("An error occurred. Please try again later.");
      } else {
        con.query("SELECT * FROM signup WHERE email =" + mysql.escape(email), function(err, result) {
          if (err) {
            console.log(err);
            res.status(500).send("An error occurred. Please try again later.");
          } else {
            if (result.length > 0) {
              // Email exists in the signup table
              var storedPassword = result[0].password;
  
              // Compare the stored password with the provided password
              if (storedPassword === password) {
                // Password is correct
                req.session.user = {
                  email: email,
                  name: result[0].name
                };
                loggedIn = req.session.user ? true : false;
                res.redirect('/?loggedIn=' + loggedIn);
              } else {
                // Password is incorrect
                res.redirect('/login');
              }
            } else {
              // Email does not exist in the signup table
              res.redirect('/login');
            }
          }
        });
      }
    });
  });
  

app.post("/signup",function(req,res){
    var name = req.body.name;
    var email = req.body.email;
    var password = req.body.password;
    console.log(name,email,password);
    var con = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "",
        database: "node_project"
    })
    con.connect((err) => {
        if (err) {
            console.log(err);
        } else {
            var query = "INSERT INTO signup (name,email,password) VALUES ?";
            var values = [
                [name, email, password]
            ];

            con.query(query, [values], (err, result) => {})
            console.log(values)
            res.redirect('/login')
        }
    })


})
app.post("/add_to_cart", function(req, res) {
    var id = req.body.id;
    var name = req.body.name;
    var price = req.body.price;
    var sale_price = req.body.sale_price;
    var quantity = req.body.quantity;
    var image = req.body.image;
    var product = { id: id, name: name, price: price, sale_price: sale_price, quantity: quantity, image: image };

    if (req.session.cart) {
        var cart = req.session.cart;

        if (!isProductInCart(cart, id)) {
            cart.push(product);
        }

    } else {
        req.session.cart = [product]
        var cart = req.session.cart;
    }

    // Calculate total price and quantity
    calculateTotal(cart, req);

    // return to cart
    res.redirect('/cart');

});

app.post("/remove_product", function(req, res) {
    var id = req.body.id;
    var cart = req.session.cart;

    for (let i = 0; i < cart.lenth; i++) {
        if (cart[i].id == id) {
            cart.splice(cart.indexOf(i), 1);
        }
    }
    // Calculate total price and quantity
    calculateTotal(cart, req);

    // return to cart
    res.redirect('/cart');

});

app.get('/cart', function(req, res) {
    var cart = req.session.cart;
    var total = req.session.total;
    res.render("pages/cart", { cart: cart, total: total });
})

app.post('/edit_product_quantity', function(req, res) {
    //  Get value from input

    var id = req.body.id;
    var quantity = req.body.quantity;
    var increase_btn = req.body.increase_product_quantity_btn;
    var decrease_btn = req.body.decrease_product_quantity_btn;

    var cart = req.session.cart;
    if (increase_btn) {
        for (let i = 0; i < cart.length; i++) {
            if (cart[i].id == id) {
                if (cart[i].quantity > 0) {
                    cart[i].quantity = parseInt(cart[i].quantity) + 1;
                }
            }
        }
    }
    if (decrease_btn) {
        for (let i = 0; i < cart.length; i++) {
            if (cart[i].id == id) {
                if (cart[i].quantity > 0) {
                    cart[i].quantity = parseInt(cart[i].quantity) - 1;
                }
            }
        }
    }

    calculateTotal(cart, req);
    res.redirect('/cart')
})

app.get('/checkout', function(req, res) {
    var total = req.session.total
    res.render("pages/checkout", { total: total })
})

app.post('/place_order', function(req, res) {
    var name = req.body.name;
    var email = req.body.email;
    var phone = req.body.phone;
    var city = req.body.city;
    var address = req.body.address;
    var cost = req.session.total;
    var status = "Not paid"
    var date = new Date();
    var product_ids = "";
    var id = Date.now();
    req.session.order_id = id;

    var con = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "",
        database: "node_project"
    })
    var cart = req.session.cart;
    for (let i = 0; i < cart.length; i++) {
        product_ids = product_ids + "," + cart[i].id;
    }
    console.log(product_ids);
    con.connect((err) => {
        if (err) {
            console.log(err);
        } else {
            var query = "INSERT INTO orders (id,name,cost,email,status,city,address,phone,date,product_ids) VALUES ?";

            var values = [
                [id, name, cost, email, status, city, address, phone, date, product_ids]
            ];
            con.query(query, [values], (err, result) => {

                for (let i = 0; i < cart.length; i++) {
                    var query = "INSERT INTO order_items (order_id,product_id,product_name,product_price,product_image,product_quantity,order_date) VALUES ?";

                    var values = [
                        [id, cart[i].id, cart[i].name, cart[i].price, cart[i].image, cart[i].quantity, new Date()]
                    ];
                    con.query(query, [values], (err, result) => {})
                }

                res.redirect('/payment')
            })
        }
    })
})

app.post('/', function(req, res) {
    var name = req.body.name;
    var email = req.body.email;
    var phone = req.body.phone;
    var star = req.body.star;
    console.log(star);
    var suggest = req.body.suggestion;
    var date = new Date();
    var con = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "",
        database: "node_project"
    })
    con.connect((err) => {
        if (err) {
            console.log(err);
        } else {
            var query = "INSERT INTO review (name,email,phone,experience,suggestion,date) VALUES ?";
            var values = [
                [name, email, phone, star, suggest, new Date()]
            ];

            con.query(query, [values], (err, result) => {})
            res.redirect('/')
        }
    })

})

app.get("/payment", function(req, res) {
    var total = req.session.total
    res.render('pages/payment', { total: total })
})

app.get("/verify_payment", function(req, res) {
    var transaction_id = req.query.transaction_id;
    var order_id = req.session.order_id;

    var con = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "",
        database: "node_project"
    })
    con.connect((err) => {
        if (err) {
            console.log(err);
        } else {
            var query = "INSERT INTO payments (order_id,transaction_id,date) VALUES ?";

            var values = [
                [order_id, transaction_id, new Date()]
            ];
            con.query(query, [values], (err, result) => {
                con.query("UPDATE orders SET status='paid' WHERE id='" + order_id + "'", (err, result) => {})
                res.redirect('/thank_you')
            })
        }
    })
})

app.get("/thank_you", function(req, res) {
    var order_id = req.session.order_id;
    res.render("pages/thank_you", { order_id: order_id })
})

app.get("/single_product", function(req, res) {
    var id = req.query.id;
    var con = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "",
        database: "node_project"
    })
    con.query("SELECT * FROM products WHERE id='" + id + "'", (err, result) => {
        res.render('pages/single_product', { result: result })
    })
})

app.get("/products", function(req, res) {
    var con = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "",
        database: "node_project"
    })
    con.query("SELECT * FROM products", (err, result) => {
        res.render('pages/products', { result: result })
    })
})

app.get("/help", function(req, res) {
    var con = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "",
        database: "node_project"
    })
    res.render('pages/help');
});
app.get("/about", function(req, res) {
    res.render("pages/about")
})