var mysql = require("mysql");
var inquirer = require("inquirer");

// create the connection information for the sql database
var connection = mysql.createConnection({
  host: "localhost",

  // Your port; if not 3306
  port: 3306,

  // Your username
  user: "dfwebdev",

  // Your password
  password: "go8of4y",
  database: "employee_tracker_db"
});

// connect to the mysql server and sql database
connection.connect(function(err) {
  if (err) throw err;
  // run the start function after the connection is made to prompt the user
  begin();
});

function begin() {
    inquirer
      .prompt({
        name: "action",
        type: "list",
        message: "Would you like to do?",
        choices:   ['add a department',
                    'add a role',
                    'add an employee',
                    'view all departments',
                    'view all roles',
                    'view all employees',
                    "update an employee's role",
                    "update employee's manager"
                ]
      })
      .then(function(answer) {
        if (answer.action === 'add a department') {
            addDepartment();
        }
        else if(answer.action === 'add a role') {
            addRole();
        }
        else if(answer.action === 'add an employee') {
            addEmployee();
        }
        else if(answer.action === 'view all departments') {
            viewDepartments();
        }
        else if(answer.action === 'view all roles') {
            viewRoles();
        }
        else if(answer.action === 'view all employees') {
            viewEmployees();          
        }
        else if(answer.action === "update an employee's role") {
            updateEmployee();
        }     
        else if(answer.action === "update employee's manager") {
            updateManager();
        }    
        else{
          connection.end();
        }
      });
}

function addDepartment() {
    inquirer.prompt([
        {
          name: 'name',
          type: 'input',
          message: 'What department would you like to add?'
        }
    ]).then(function(answer){
        connection.query(
            'INSERT INTO department SET ?',
            {name:  answer.name}
        )

        begin();
    });

    
}

function addRole() {
  connection.query('Select * FROM department', function(err,res) {
    if (err) throw err;
    inquirer
        .prompt([
          {
           name: 'department',
           type: 'list',
           choices:  function(){
                let choices = [];
                for (let i = 0; i < res.length; i++) {
                    choices.push(res[i].name);
                }
                return choices;
            },
            message: 'What department will this role be in?'
          },
          {
            name: 'title',
            type: 'input',
            message: 'What will be the title of this role?'
          },
          {
            name: 'salary',
            type: 'input',
            message: 'How much money will this role pay the employee?',
          }
        ]).then(function(answer){
            //Getting the Department ID number
            let departmentID;
            for (let i = 0; i < res.length; i++) {
                if (res[i].name === answer.department)
                departmentID = res[i].id;
            }
            connection.query(
                'INSERT INTO role SET ?',
                {
                 title:  answer.title,
                 salary: answer.salary,
                 department_id:  departmentID
                }
            )
            begin();
        })
  })
}

function addEmployee() {
    connection.query('Select * FROM role', function(err,res) {
        if (err) throw err;
        inquirer
            .prompt([
              {
               name: 'role',
               type: 'list',
               choices:  function(){
                    let choices = [];
                    for (let i = 0; i < res.length; i++) {
                        choices.push(res[i].title);
                    }
                    return choices;
                },
                message: 'What role will this employee fill?'
              },
              {
                name: 'first',
                type: 'input',
                message: 'What is the first name of the employee'
              },
              {
                name: 'last',
                type: 'input',
                message: 'What is the last name of the employee',
              }
            ]).then(function(answer){
                //Getting the Role ID number
                let roleID;
                for (let i = 0; i < res.length; i++) {
                    if (res[i].title === answer.role) {
                        roleID = res[i].id;
                    }
                }
                console.log(roleID);
                console.log(answer.first);
                console.log(answer.last);
                connection.query(
                    'INSERT INTO employee SET ?',
                    {
                     first_name:  answer.first,
                     last_name: answer.last,
                     role_id:  roleID,
                    }
                )
                begin();
            })
      })
}

function viewDepartments() {
    connection.query('SELECT * FROM department', function(err,res){
        const departments = res.reduce((acc, {id, ...x}) => { acc[id] = x; return acc}, {})
        console.table(res);
    });  
}

function viewRoles(){
    const query = 'SELECT * FROM role INNER JOIN department ON (role.department_id = department.id)'
    connection.query(query, function(err,res){
        if (err) throw err;
        console.table(res);
    });

    // begin();
}

function viewEmployees() {
    let query = 'SELECT * FROM employee LEFT JOIN role ON (employee.role_id = role.id) '
    query += 'LEFT JOIN department ON (role.department_id = department.id)'

    connection.query(query, function(err,res){
        if (err) throw err;
        console.table(res);
    });

    // begin();
}

function updateEmployee() {
    console.log("Let's update the employee's file here");
    let query = 'SELECT * FROM employee'
    connection.query(query, function(err, res) {
        if (err) throw err;
        inquirer
            .prompt([
              {
               name: 'employee',
               type: 'list',
               choices:  function(){
                    let choices = [];
                    for (let i = 0; i < res.length; i++) {
                        choices.push(res[i].first_name);
                    }
                    return choices;
                },
                message: 'Which employee would you like to update?'
              }
            ]).then(function(answer){
                for (let i = 0; i < res.length; i++) {
                    if (res[i].first_name === answer.employee) {
                        employeeID = res[i].id;
                    }
                }

                console.log(employeeID);

                const query = 'SELECT * FROM role INNER JOIN department ON (role.department_id = department.id)'
                connection.query(query, function(err,res){
                    if (err) throw err;
                    inquirer
                        .prompt([
                        {
                        name: 'role',
                        type: 'list',
                        choices:  function(){
                                let choices = [];
                                for (let i = 0; i < res.length; i++) {
                                    choices.push(res[i].title);
                                }
                                return choices;
                            },
                            message: 'Which role would you like to assign the employee?'
                        }
                        ]).then(function(answer){
                                let roleID;
                                for (let i = 0; i < res.length; i++) {
                                    if (res[i].title === answer.role) {
                                        roleID = res[i].id;
                                    }
                                }    
                                connection.query(
                                'UPDATE employee SET ? WHERE ?',
                                [
                                    {
                                        role_id:  roleID
                                    },
                                    {
                                        id:  employeeID
                                    }
                                ],
                                function(error) {
                                    if (error) throw err;
                                    begin();
                                  }
                                )
                            })
                });
            })
    });
};




function updateManager() {
    console.log("Let's update the employee's manager here");
    let query = 'SELECT * FROM employee'
    connection.query(query, function(err, res) {
        if (err) throw err;
        inquirer
            .prompt([
              {
               name: 'employee',
               type: 'list',
               choices:  function(){
                    let choices = [];
                    for (let i = 0; i < res.length; i++) {
                        choices.push(res[i].first_name);
                    }
                    return choices;
                },
                message: 'Which employee would you like have a new manager?'
              },
              {
                name: 'manager',
                type: 'list',
                choices:  function(){
                     let choices = [];
                     for (let i = 0; i < res.length; i++) {
                         choices.push(res[i].first_name);
                     }
                     return choices;
                 },
                 message: 'Which employee would you like to assign as the manager?'
               }
            ]).then(function(answer){
                for (let i = 0; i < res.length; i++) {
                    if (res[i].first_name === answer.employee) {
                        employeeID = res[i].id;
                    }
                }

                for (let i = 0; i < res.length; i++) {
                    if (res[i].first_name === answer.manager) {
                        managerID = res[i].id;
                    }
                }

                connection.query(
                    'UPDATE employee SET ? WHERE ?',
                    [
                        {
                            manager_id: managerID
                        },
                        {
                            id:  employeeID
                        }
                    ],
                    function(error) {
                        if (error) throw err;
                        begin();
                      }
                    )


            })
    });
};