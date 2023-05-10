USE garagedb;

CREATE TABLE customers (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(30) NOT NULL,
  email VARCHAR(50) NOT NULL UNIQUE,
  phone VARCHAR(15) NOT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    universal_product_code VARCHAR(255) UNIQUE NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE garage_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    description TEXT,
    product_cost DECIMAL(10, 2),
    retail_price DECIMAL(10, 2),
    quantity_on_hand INT,
    category_id INT NOT NULL,
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE orders (
  id INT NOT NULL AUTO_INCREMENT,
  customer_id INT NOT NULL,
  order_date DATE NOT NULL,
  order_type ENUM('sell', 'buy') NOT NULL,
  garage_item_id INT NOT NULL,
  quantity INT NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (garage_item_id) REFERENCES garage_items(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE monthly_profit_cost (
  year INT,
  month INT,
  profit DECIMAL(10, 2),
  cost DECIMAL(10, 2),
  pure_profit DECIMAL(10, 2),
  PRIMARY KEY (year, month)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


DELIMITER $$
CREATE TRIGGER update_monthly_profit_cost_trigger
AFTER INSERT ON orders
FOR EACH ROW
BEGIN
  IF NEW.order_type = 'sell' THEN
    UPDATE monthly_profit_cost
    SET profit = profit + (NEW.quantity * (SELECT retail_price FROM garage_items WHERE id = NEW.garage_item_id)),
        pure_profit = pure_profit + (NEW.quantity * (SELECT retail_price - product_cost FROM garage_items JOIN products ON garage_items.product_id = products.id WHERE garage_items.id = NEW.garage_item_id))
    WHERE year = EXTRACT(YEAR FROM NEW.order_date) AND month = EXTRACT(MONTH FROM NEW.order_date) AND NEW.quantity <= (SELECT quantity_on_hand FROM garage_items WHERE id = NEW.garage_item_id);
  ELSEIF NEW.order_type = 'buy' THEN
    UPDATE monthly_profit_cost
    SET cost = cost + (NEW.quantity * (SELECT product_cost FROM garage_items WHERE id = NEW.garage_item_id)),
        pure_profit = pure_profit - (NEW.quantity * (SELECT product_cost FROM garage_items WHERE id = NEW.garage_item_id))
    WHERE year = EXTRACT(YEAR FROM NEW.order_date) AND month = EXTRACT(MONTH FROM NEW.order_date) AND NEW.quantity <= (SELECT quantity_on_hand FROM garage_items WHERE id = NEW.garage_item_id);
  END IF;
END$$
DELIMITER ;
