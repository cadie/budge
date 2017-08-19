$(document).ready(function() {
   // Getting a reference to the input field where user adds a new todo
   var newItemInput = $("input.new-item");
   var newItemInput2 = $("input.new-item2");
   // Our new todos will go inside the todoContainer
   var expenseContainer = $(".expense-container");
   // Adding event listeners for deleting, editing, and adding todos
   $(document).on("click", "button.delete", deleteBudget);
   $(document).on("click", "button.complete", toggleComplete);
   $(document).on("click", ".expense-item", editBudget);
   $(document).on("keyup", ".expense-item", finishEdit);
   $(document).on("blur", ".expense-item", cancelEdit);
   $(document).on("submit", "#expense-form", insertBudget);


   $(document).on("submit", "#income-form", populateIncomeField);
   function populateIncomeField(event) {
     event.preventDefault();
     var input = $(".income").val();
     $("#income-amount").html(input);
     $(".income-dollarsign").removeClass("hidden");
     $(".income-dollarsign").addClass("visible");
     leftOver();
   }

   // Our initial todos array
   var expenses;

   // Getting todos from database when page loads
   getExpenses();

   // This function resets the todos displayed with new todos from the database
   function initializeRows() {
     expenseContainer.empty();
     var rowsToAdd = [];
     for (var i = 0; i < expenses.length; i++) {
       rowsToAdd.push(createNewRow(expenses[i]));
     }
     expenseContainer.prepend(rowsToAdd);
     createSum();
     leftOver();
     newItemInput.focus();
   }

   // This function grabs todos from the database and updates the view
   function getExpenses() {
     $.get("/api/budget", function(data) {
       console.log("Budget", data);
       expenses = data;
       initializeRows();
     });
   }

   // This function deletes a todo when the user clicks the delete button
   function deleteBudget() {
     var id = $(this).data("id");
     $.ajax({
       method: "DELETE",
       url: "/api/budget/" + id
     })
     .done(function() {
       getExpenses();
     });
   }

   // This function sets a todos complete attribute to the opposite of what it is
   // and then runs the updateTodo function
   function toggleComplete() {
     var expense = $(this)
       .parent()
       .data("expense");

     expense.complete = !expense.complete;
     updateExpense(expense);
   }

   // This function handles showing the input box for a user to edit a todo
   function editBudget() {
     var currentExpense = $(this).data("expense");
     $(this)
       .children()
       .hide();
     $(this)
       .children("input.edit")
       .val(currentExpense.text)

     $(this)
       .children("input.edit")
       .show();
     $(this)
       .children("input.edit")
       .focus();
   }

   // This function starts updating a todo in the database if a user hits the
   // "Enter Key" While in edit mode
   function finishEdit(event) {
     var updatedExpense;
     if (event.key === "Enter") {
       updatedExpense = {
         id: $(this)
           .data("expense")
           .id,
         category: $(this)
           .children("input")
           .val()
           .trim(),
         amount: $(this)
           .children("input")
           .val()
           .trim(),

       };
       $(this).blur();
       updateExpense(updatedExpense);
     }
   }

   // This function updates a todo in our database
   function updateExpense(expense) {
     $.ajax({
       method: "PUT",
       url: "/api/budget",
       data: expense
     })
     .done(function() {
       getExpenses();
     });
   }

   // This function is called whenever a todo item is in edit mode and loses focus
   // This cancels any edits being made
   function cancelEdit() {
     var currentExpense = $(this).data("expense");
     $(this)
       .children()
       .hide();
     $(this)
       .children("input.edit")
       .val(currentExpense.text)

     $(this)
       .children("span")
       .show();
     $(this)
       .children("button")
       .show();
   }

   // This function constructs a todo-item row
   function createNewRow(expense) {
     var newInputRow = $("<li>");
     newInputRow.addClass("list-group-item expense-item");
     var newExpenseSpan = $("<span>");
     newExpenseSpan.text(expense.category);
     newExpenseSpan.addClass("category-ref");

     newInputRow.append(newExpenseSpan);
     var newExpenseInput = $("<input>");
     newExpenseInput.attr("type", "text");
     newExpenseInput.addClass("edit");
     newExpenseInput.css("display", "none");
     newInputRow.append(newExpenseInput);

     var newAmountSpan = $("<span>");
     newAmountSpan.text(expense.amount);
     newAmountSpan.addClass("sum");

     newInputRow.append(newAmountSpan);
     var newAmountInput = $("<input>");
     newAmountInput.attr("type", "text");
     newAmountInput.addClass("edit");
     newAmountInput.css("display", "none");
     newInputRow.append(newAmountInput);

     var newDeleteBtn = $("<button>");
     newDeleteBtn.addClass("delete btn btn-default");
     newDeleteBtn.html("<i class=\"fa fa-trash-o\" aria-hidden=\"true\"></i>");
     newDeleteBtn.data("id", expense.id);
     newInputRow.append(newDeleteBtn);
     newInputRow.data("expense", expense);
     if (expense.complete) {
       newExpenseSpan.css("text-decoration", "line-through");
     }
     return newInputRow;
   }

   // This function inserts a new todo into our database and then updates the view
   function insertBudget(event) {
     event.preventDefault();
     // if (!newItemInput.val().trim()) {   return; }
     var expense = {
       category: newItemInput
         .val()
         .trim(),
       amount: newItemInput2
         .val()
         .trim(),


     };

     // Posting the new todo, calling getTodos when done
     $.post("/api/budget", expense, function() {
       getExpenses();
     });
     newItemInput.val(""),
     newItemInput2.val("");



   }

   function createSum() {

     var sum = 0;

     $(".sum").each(function() {
         var val = $.trim( $(this).text() );

         if ( val ) {
             val = parseFloat( val.replace( /^\$/, "" ) );

             sum += !isNaN( val ) ? val : 0;
         }
     });
     $("#total-expenses").html(sum);
     console.log(sum);
   }

   function leftOver() {

     var incomeInput = $("#income-amount").text();
     var totalExpensesInput = $("#total-expenses").text();

     var answer = (parseInt(incomeInput) - parseInt(totalExpensesInput))

     console.log(answer);
     $("#left-over").html(answer);
   }



 });
