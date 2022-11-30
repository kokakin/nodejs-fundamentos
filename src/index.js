const express = require('express');
const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(express.json());

const customers = [];


/**
 * Middlewares
 */
function VerifyIfAccountExistsCPF(request, response, next) {

  const { cpf } = request.headers;
  const customer = customers.find(customer => customer.cpf === cpf);

  if(!customer) {

    return response.status(400).json({error: "Customer not found"});

  }

  request.customer = customer;

  return next();
};

function getBalance(statement) {

  const balance = statement.reduce((acc, operation) => {

    if(operation.type === 'credit') {

      return acc + operation.amount;

    }else {

      return acc - operation.amount;

    }

  }, 0);

  return balance;
};


/**
 * cpf - string
 * name - string
 * id - uuid
 * statement []
 */


app.get("/statement", VerifyIfAccountExistsCPF, (request, response) => {

  const { customer } = request;
  
  return response.json(customer.statement);
});

app.get("/statement/date", VerifyIfAccountExistsCPF, (request, response) => {

 const { customer } = request;
 const { date } = request.query;
 
 const dateFormat = new Date(date + " 00:00");

 const statement = customer.statement.filter((statement)=>statement.created_at.toDateString() === new Date(dateFormat).toDateString());

 return response.json(statement);
});

app.get("/account", VerifyIfAccountExistsCPF, (request, response) => {

  const { customer } = request;
  
  return response.json(customer);

})

app.get("/balance", VerifyIfAccountExistsCPF, (request, response) => {

  const { customer } = request;

  const balance = getBalance(customer.statement);

  return response.json(balance);
  
});


app.post("/account", (request, response) => {

  const { cpf, name } = request.body;

  const CustomerAlreadyExists =  customers.some((customer) => customer.cpf === cpf);

  if(CustomerAlreadyExists) {

    return response.status(400).json({error: "customer already exists"})

  }

  customers.push({

    cpf,
    name,
    id: uuidv4(),
    statement: []

  });

  return response.status(201).send();

});


app.post("/deposit", VerifyIfAccountExistsCPF, (request, response) => {

  const { description, amount } = request.body;
  const { customer } = request;
  const statementOperation = {
    description,
    amount,
    created_at: new Date(),
    type: "credit"
  }

  customer.statement.push(statementOperation);

  return response.status(201).send();


});


app.post("/withdraw", VerifyIfAccountExistsCPF, (request, response) => {

  const { amount } = request.body;
  const { customer } = request;
  const balance = getBalance(customer.statement);

  if(balance < Math.abs(amount)) {
    
    return response.status(400).json({error: "Insufficient funds!"})

  }
  
  const statementOperation = {
    amount,
    created_at: new Date(),
    type: "debit"
  }

  customer.statement.push(statementOperation);

  return response.status(201).send();

});

app.put("/account", VerifyIfAccountExistsCPF, (request, response) => {

  const { name } = request.body;
  const { customer } = request;

  customer.name = name;

  return response.status(201).send();
});

app.delete("/account", VerifyIfAccountExistsCPF, (request, response) => {

  const { customer } = request;

  //splice
  customers.splice(customer, 1);

  return response.status(201).json(customers);

})





app.get("/courses",(request, response)=>{

  const query = request.query;
  console.log(query);
  return response.json(["Curso 1", "Curso 2", "Curso 3"]);

});

app.post("/courses", (request,response) => {

  const body = request.body;
  console.log(body);
  return response.json(["Curso 1", "Curso 2", "Curso 3", "Curso 4"]);

});

app.put("/courses/:id", (request,response) => {

  const { id } = request.params;
  console.log(id);
  return response.json(["Curso 6", "Curso 2", "Curso 3", "Curso 4"]);

});

app.patch("/courses/:id", (request, response)=>{

  return response.json(["Curso 6", "Curso 7", "Curso 4"]);

});

app.delete("/courses/:id", (request, response) => {

  return response.json(["Curso 6", "Curso 7", "Curso 4"]);

});

//localhost:6969
app.listen(6969);