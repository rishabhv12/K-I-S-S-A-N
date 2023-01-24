
CREATE TABLE products (
   id int(11) NOT NULL AUTO_INCREMENT,
   name varchar(255),
   description text,
   price float(8,2),
   sale_price float(8,2) NULL,
   quantity int(11),
   image text,
   category varchar(255) NULL,
   type varchar(255) NULL,
   PRIMARY KEY (id)
);


INSERT INTO products (id, name, description,price,sale_price,quantity,image,category,type) VALUES
                         (1, "Wheat Grains","Fresh wheat grains",30.00,24.00,0,"f1.png","wheat","wheat"),
                         (2, "Masoor","Masoor Dal",70.00,NULL,0,"f2.png","dal","dal"),
                         (3, "Basmati","Basmati Rice",200.00,NULL,0,"f3.png","rice","rice"),
                         (4, "Arhar Dal","Fresh arhar dal at doorstep",108.00,NULL,0,"f4.png","dal","dal"),
                         (5, "Soya Beans","Crispy and fresh beans of Soya",120.00,NULL,0,"f5.png","soyabean","soyabean"),
                         (6, "Indrayani","Indrayani Rice",99.99,NULL,0,"f6.png","rice","rice"),
                         (7, "Moong","Moong Dal",100.00,NULL,0,"f7.png","dal","dal"),
                         (8, "Corn","Corn Seeds",160.00,NULL,0,"f8.png","corn","corn"),
                         (9, "Urad","Urad Dal",120.00,102.00,0,"f9.png","dal","dal");


CREATE TABLE review (
   id int(11) NOT NULL AUTO_INCREMENT,
   name varchar(255),
   email varchar(255),
   phone varchar(255),
   experience varchar(255),
   suggestion varchar(255),
   date DATETIME,
   PRIMARY KEY (id)
);

CREATE TABLE orders (
   id BIGINT NOT NULL AUTO_INCREMENT,
   name varchar(255),
   cost float(8,2),
   email varchar(255),
   status text,
   city varchar(255),
   address text,
   phone varchar(255),
   date DATETIME,
   product_ids int(11),
   PRIMARY KEY (id)
);

CREATE TABLE payments (
   id BIGINT NOT NULL AUTO_INCREMENT,
   order_id BIGINT,
   transaction_id text,
   date DATETIME,
   PRIMARY KEY (id)
);

CREATE TABLE order_item (
   id int(11) NOT NULL AUTO_INCREMENT,
   name varchar(255),
   description text,
   price float(8,2),
   sale_price float(8,2) IS NULL,
   quantity int(11),
   image text,
   category varchar(255) IS NULL,
   type varchar(255) IS NULL,
   PRIMARY KEY (id)
);
