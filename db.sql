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
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE orders (
  id INT NOT NULL AUTO_INCREMENT,
  customer_id INT,
  order_date DATE NOT NULL,
  order_type ENUM('sell', 'buy') NOT NULL,
  garage_item_id INT NOT NULL,
  quantity INT NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  FOREIGN KEY (garage_item_id) REFERENCES garage_items(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE monthly_profit_cost (
  year INT,
  month INT,
  revenue DECIMAL(10, 2),
  cost DECIMAL(10, 2),
  profit DECIMAL(10, 2),
  PRIMARY KEY (year, month)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


DELIMITER $$
CREATE TRIGGER update_monthly_profit_cost_trigger
AFTER INSERT ON orders
FOR EACH ROW
BEGIN
  DECLARE qty_on_hand INT;
  IF NEW.order_type = 'sell' THEN
    SET qty_on_hand = (SELECT quantity_on_hand FROM garage_items WHERE id = NEW.garage_item_id);
    IF NEW.quantity <= qty_on_hand THEN
        INSERT INTO monthly_profit_cost (year, month, revenue, cost, profit)
        VALUES (
          EXTRACT(YEAR FROM NEW.order_date),
          EXTRACT(MONTH FROM NEW.order_date),
          (NEW.quantity * (SELECT retail_price FROM garage_items WHERE id = NEW.garage_item_id)),
          0,
          revenue - cost)
        ON DUPLICATE KEY UPDATE
          revenue = revenue + (NEW.quantity * (SELECT retail_price FROM garage_items WHERE id = NEW.garage_item_id)),
          cost = cost,
          profit = revenue - cost;
    END IF;
  ELSEIF NEW.order_type = 'buy' THEN
    INSERT INTO monthly_profit_cost (year, month, revenue, cost, profit)
    VALUES (
      EXTRACT(YEAR FROM NEW.order_date),
      EXTRACT(MONTH FROM NEW.order_date),
      0,
      (NEW.quantity * (SELECT product_cost FROM garage_items WHERE id = NEW.garage_item_id)),
      revenue - cost)
    ON DUPLICATE KEY UPDATE
      cost = cost + (NEW.quantity * (SELECT product_cost FROM garage_items WHERE id = NEW.garage_item_id)),
      revenue = revenue,    
      profit = revenue - cost;
  END IF;
END$$
DELIMITER ;


DELIMITER $$
CREATE TRIGGER delete_order_trigger
AFTER DELETE ON orders
FOR EACH ROW
BEGIN
  IF OLD.order_type = 'sell' THEN
    UPDATE monthly_profit_cost
    SET revenue = revenue - (OLD.quantity * (SELECT retail_price FROM garage_items WHERE id = OLD.garage_item_id)),
        cost = cost,
        profit = revenue - cost
    WHERE year = EXTRACT(YEAR FROM OLD.order_date) AND month = EXTRACT(MONTH FROM OLD.order_date);
  ELSEIF OLD.order_type = 'buy' THEN
    UPDATE monthly_profit_cost
    SET cost = cost - (OLD.quantity * (SELECT product_cost FROM garage_items WHERE id = OLD.garage_item_id)),
        revenue = revenue,
        profit = revenue - cost
    WHERE year = EXTRACT(YEAR FROM OLD.order_date) AND month = EXTRACT(MONTH FROM OLD.order_date);
  END IF;
END$$
DELIMITER ;

-- DELIMITER $$

-- CREATE TRIGGER add_garage_item_cost_trigger
-- AFTER INSERT ON garage_items
-- FOR EACH ROW
-- BEGIN
--   DECLARE item_cost DECIMAL(10, 2);
--   SET item_cost = NEW.product_cost * NEW.quantity_on_hand;
--   INSERT INTO monthly_profit_cost (year, month, revenue, cost, profit)
--   VALUES (
--     EXTRACT(YEAR FROM NOW()),
--     EXTRACT(MONTH FROM NOW()),
--     0,
--     item_cost,
--     0
--   )
--   ON DUPLICATE KEY UPDATE
--     cost = cost + item_cost,
-- END$$

-- DELIMITER ;

-- DELIMITER $$

-- CREATE TRIGGER delete_garage_item_trigger
-- AFTER DELETE ON garage_items
-- FOR EACH ROW
-- BEGIN
--   UPDATE monthly_profit_cost
--   SET cost = cost - (OLD.product_cost * OLD.quantity_on_hand),
--   WHERE year = EXTRACT(YEAR FROM NOW()) AND month = EXTRACT(MONTH FROM NOW());
-- END$$

-- DELIMITER ;

