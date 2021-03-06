var budgetController =  ( function(){

    var Expense = function(id,description,value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function(totalIncome) {
        if(totalIncome > 0) {
            this.percentage  = Math.round((this.value / totalIncome)*100);
        } else {
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function() {
        return this.percentage;
    };

    var Income = function(id,description,value){
        this.id = id;
        this.description = description;
        this.value = value;
    }

    var calcTotal = function(type){
        var sum = 0;
        data.allItems[type].forEach(function(cur){
            sum += cur.value;
        });
        data.totals[type] = sum; 
    };

    var data = {
        allItems : {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budgetTotal: 0,
        percentage: -1

    }

    return {
        addItem: function(type,des,val){
            var newItem, ID;

            //ID = last ID +1
            //Create new ID
            if(data.allItems[type].length > 0){
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }
            //Create new item based on 'inc' or 'exp' type
            if(type === 'exp'){
                newItem = new Expense(ID,des,val);
            } else {
                newItem = new Income(ID,des,val);
            }
            //Push item into our data structure
            data.allItems[type].push(newItem);
            //Return new Item
            return newItem;
        },

        deleteItem: function(type,id){
            var ids,index;

            ids = data.allItems[type].map(function(current){
                return current.id;
            });
           
            index = ids.indexOf(id);

            if(index !== -1){
                data.allItems[type].splice(index,1);
            };

        },

        calculateBudget: function(){
            //Calculate total income and expenses
            calcTotal('exp');
            calcTotal('inc');

            //Calculate total Budget
            data.budgetTotal = data.totals.inc - data.totals.exp;

            //Calculate the percentage
            if(data.totals.inc > 0){
                data.percentage = Math.round((data.totals.exp / data.totals.inc )*100);
            } else {
                data.percentage = -1;
            }
            

        },

        calculatePercentages: function() {

            data.allItems.exp.forEach(function (curr){
                curr.calcPercentage(data.totals.inc);
            });

        },

        getPercentages: function () {
           var allPerc = data.allItems.exp.map(function(cur){
               return cur.getPercentage();
           }); 
           return allPerc;
        },

        getBudget: function(){
            return{
                budget: data.budgetTotal,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        }
    };



})();



var UIController = ( function(){

    var DOMStrings = {

     inputType: '.add__type',
     inputDescription: '.add__description',
     inputValue: '.add__value',
     inputBtn: '.add__btn',
     incomecontainer: '.income__list',
     expensecontainer: '.expenses__list' ,
     budgetLabel: '.budget__value',
     incomeLabel: '.budget__income--value',
     expensesLabel: '.budget__expenses--value',
     percentage: '.budget__expenses--percentage',
     container: '.container',
     expensesPercLabel: '.item__percentage',
     monthLabel: '.budget__title--month' 
    };

    var formatNumber = function (num, type) {
        var numSplit , int , dec;

        num = Math.abs(num);
        num = num.toFixed(2);
        numSplit = num.split('.');

        int = numSplit[0];
        if(int.length > 3){
            int = int.substr(0,int.length-3) + ',' + int.substr(int.length-3,int.length);
        }

        dec = numSplit[1];
        return (type === 'exp'?'-' : '+') + ' ' + int + '.' + dec; 
    };

    var nodeListForEach = function(list, callback) {

        for(var i = 0; i < list.length; i++) {
            callback(list[i],i);
        }
    };


    return {
        getInput: function() {
            return {
                type: document.querySelector(DOMStrings.inputType).value,
                description: document.querySelector(DOMStrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
            };
        },

        addListItem: function(obj,type){
            var Html, newHtml, element;
            //Create HTML string with placeholder text

            if(type === 'inc'){
                element = DOMStrings.incomecontainer;
                Html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            } else if (type === 'exp'){
                element = DOMStrings.expensecontainer;
                Html = ' <div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }


            //Replace the placeholder with some actual data

            newHtml = Html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%',obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value,type));

            //Make changes to the UI
            document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);
        },

        deleteListItem: function(selectorID){

            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },

        clearFields: function(){
            var fields, fieldsArr;

            fields = document.querySelectorAll(DOMStrings.inputDescription + ',' + DOMStrings.inputValue);

            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function(current,index,array){
                current.value = "";
            });

            fieldsArr[0].focus();

        },

        displayBudget: function(obj){

            document.querySelector(DOMStrings.budgetLabel).textContent = obj.budget;
            document.querySelector(DOMStrings.incomeLabel).textContent = obj.totalInc;
            document.querySelector(DOMStrings.expensesLabel).textContent = obj.totalExp;
            if(obj.totalInc > 0){
                document.querySelector(DOMStrings.percentage).textContent = obj.percentage + '%';  
            } else {
                document.querySelector(DOMStrings.percentage).textContent = '---';  
            }
            
        },

        displayPercentages: function(percentages) {

            var fields = document.querySelectorAll(DOMStrings.expensesPercLabel);

            nodeListForEach(fields, function(current,index){
                if(percentages[index] > 0){
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---' ;
                }

            });
        },

        displayMonth: function(){
            var now , month , months, year;

            now = new Date();
            months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
            month = now.getMonth();
            year = now.getFullYear();
            document.querySelector(DOMStrings.monthLabel).textContent = months[month] + ' ' + year ;

        },

        changedType: function(){

           var fields =  document.querySelectorAll(
                DOMStrings.inputType + ',' +
                DOMStrings.inputDescription + ',' +
                DOMStrings.inputValue);

            nodeListForEach(fields,function(cur){
                cur.classList.toggle('red-focus');
            });

            document.querySelector(DOMStrings.inputBtn).classList.toggle('red');

        },

        getDOMStrings: function(){
            return DOMStrings;
        }
    };
})();

// Controller 

var controller = (function (budgetCtrl,UICtrl) {

    var setupEventListeners = function(){
        var DOM = UICtrl.getDOMStrings();
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem); // Click by mouse

        document.addEventListener('keypress',function(event){// Click by the enter key

          if(event.keyCode === 13 || event.which === 13 ){
            ctrlAddItem();

         };
     });
     document.querySelector(DOM.container).addEventListener('click', ctrlDelItem);

     document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    }

    var updateBudget = function (){
        
        //1. Calculate the budget
        budgetCtrl.calculateBudget();

        //2 Return the budget 
        var budget = budgetCtrl.getBudget();

        //3. Display the budget in UI
        UICtrl.displayBudget(budget);
    };
    
    var updatepercentage = function(){
        //1. Calculate percentages
        budgetCtrl.calculatePercentages();

        //2. Read percentages and update the budget controller
        var percentages = budgetCtrl.getPercentages();

        //3. Update the UI
        UICtrl.displayPercentages(percentages);

    };
   
    var ctrlAddItem = function(){

        var input, newItem;
        // 1. Get the field input data
        input = UICtrl.getInput();
        

        if(input.description !== "" && !isNaN(input.value) && input.value > 0){
              //2. Add the item to the budget calculator
        newItem = budgetController.addItem(input.type,input.description,input.value);

        //3. Add to the UI
        UICtrl.addListItem(newItem,input.type);

        //4. Clear fields
        UICtrl.clearFields();

        //5. Calculate and update the budget
        updateBudget();

        //6. Calculate and update percentage
        updatepercentage();


        };

      
       

    };

    var ctrlDelItem = function(event){
        var itemID,splitID,ID,type;
        
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
       
        if(itemID){
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);
    
            //1. Delete the item from the DATA structure 
             budgetCtrl.deleteItem(type,ID);
        
             //2. Delete from the UI
             UICtrl.deleteListItem(itemID);

             //3. Update the budget
             updateBudget();

             //4. Update the percentage
             updatepercentage();
        };
    }; 

    return {
        init: function(){
            console.log('Application is started');
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    };
    


})(budgetController,UIController);


controller.init();