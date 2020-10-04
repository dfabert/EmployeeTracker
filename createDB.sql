DROP DATABASE IF EXISTS employee_tracker_db;

CREATE DATABASE employee_tracker_db;

USE employee_tracker_db;

CREATE TABLE department(
  id INTEGER(11) auto_increment NOT NULL, 
  name VARCHAR(30),
  PRIMARY KEY (id)  
);

CREATE TABLE role(
  id INTEGER(11) auto_increment NOT NULL, 
  title VARCHAR(30),
  salary decimal(9,2),
  PRIMARY KEY (id),
  FOREIGN KEY (department_id) REFERENCES department(id)
);


CREATE TABLE employee(
  id INTEGER(11) auto_increment NOT NULL,
  first_name varchar(30),
  last_name varchar(30),
  manager_id int(11),
  PRIMARY KEY (id),
  FOREIGN KEY (role_id) REFERENCES table(id)
);