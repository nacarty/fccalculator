
var globalStr = '',
        PI = '3.14159265358979',
        E = '2.71828182845904',
        placed = false,
       tempGlobalStr = '',
       result = '',
        trail = '',
        lock = undefined,
        lockVal = undefined,
        opStack = [],
        constant = false,
        trailVal = undefined,
        shortInt = /^(0|([1-9][\d]{0,9}))$/,                // validates an integer with 4 digits
        decimal = /^-{0,1}(?:(?:[1-9]\d{0,19})(?!\d)|0)(?:.\d{1,16}){0,1}$/;  //validates a decimal number with at most 20 leading digits and at most 16 digits following the decimal point
        
//I have chosen to use static information rather than dynamic to reduce computational time
var d1= ['button#scnd01.scnd0', 'button#square.scnd0', 'button#xExpY.scnd0', 'button#eToX.scnd0'];  //same as d1= $(".scnd0");
var d2 = ['button#scnd02.scnd1', 'button#root.scnd1', 'button#yRootX.scnd1', 'button#logE.scnd1'];   //same as  d2 = $(".scnd1");

function toggle2nd(k)     
{ 
   var len = 4,  //d1 & d2 .length always = 4
             op1 = 'none',
             op2 = 'inherit';
           
    if ( k !==0) {
        op1 = 'inherit';
        op2 = 'none';
    }        
   for (var i = 0; i < 4; i++)
   {
        $(d1[i]).css('display', op1);   
        $(d2[i]).css('display', op2);          
   }
}

function toggleSign() //from +ve to -ve and vice versa
{
    var len = globalStr.length;
    
    if (len === 0)
    {
        return;
    }    
    else if ( (len === 1) &&(globalStr[0]=== '-'))
    {
        globalStr = '';
        $('#result').html('0.');
    } 
    else if (globalStr[0]=== '-')
    {
        globalStr = globalStr.substring(1);    
       $('#result').html(globalStr);
    }
    else
    {
        globalStr = '-'+globalStr;    
       $('#result').html(globalStr);
    }
    //constant = true; //once sign has been toggled, you cannot alter the entered value
}

function addDecimalPoint()
{
    if ((constant === true)||(globalStr===''))
        return;
    
    tempGlobalStr = globalStr +'.0';
     if (decimal.test(tempGlobalStr) === true)
     {
         globalStr += '.';
         $('#result').html(globalStr+'0');
     }    
}

function addSpecialValue(val){  //values like PI are special E 
    if (globalStr === '')
    {
        globalStr = val; //we can make val = PI or E; then show
       $('#result').html(globalStr);
       constant = true;
   }
}

function addEntry(val)  //validate every character enter before it is added to the number string
{
    if (constant === true)
        return;
    
    tempGlobalStr = globalStr + val;
   
     if (decimal.test(tempGlobalStr) === true)
     {
         globalStr = tempGlobalStr;
         $('#result').html(globalStr);
     }
     else
     {
         console.log('This string is not a number:', tempGlobalStr);
     }  
}

function operation(operator) // +, -, x, ÷ and = are operators that instigate operations
{    
 if ((globalStr === '')||(globalStr === '-'))
        return;
    
  if (lock === 'XpowerY')
    {
        XpowerY(operator);
        return;
    }
  if (lock === 'XrootY')
   {
       XrootY(operator);
       return;
   }  
    
    var tempVal =  parseFloat(globalStr),   op;      
    constant = false;
    if (trailVal === undefined)
    {
         trailVal = tempVal;    
     }
     else
     { 
         op = opStack.pop(); /* opStack[] is not necessary for this application. We can use a 
                                global variable 'op' only to track the operation. However, if 
                                we wish to extend the application to perform operations using 
                                brackets and thus precedence of operations, a stack will become
                                necessary*/
         switch (op){
                case 'x': trailVal *= tempVal;
                                break;
                case '÷': trailVal = trailVal/tempVal;
                                 break;
                case '+' : trailVal += tempVal;
                                 break;
                case '-': trailVal -= tempVal;
                                 break;
                }   
      }      
       
      tempGlobalStr = '';
      if (trail[0]=== 'a') //That is, if trail begins with 'ans = '
          trail = '';
      if (operator !== '=') //if not the equal operator...
      {
          $('#result').html('<span style ="'+'font-size:10px'+'">'+operator+'</span>');
         opStack.push(operator);
         globalStr = '';
         if (placed === false) //other functions may add to the trail string. They would set 'placed = true; ' if they so do
             trail += tempVal + ' '+operator+' ';
         else 
         {
             trail += operator+' ';
             placed = false;
         }
      $('#trail').html(trail);   
      $('#answer').html('ans = '+trailVal);
       }
       else
       {
           //globalStr = trailVal.toString();
           $('#result').html(trailVal);  
          if (trail.length === 0)
             $('#trail').html(trailVal+' = [end]');   
         else 
             $('#trail').html(trail+' '+globalStr+' = [end]');
          $('#answer').html('[end]');
          constant = true;
          opStack = [];
       }             
}

function cancelAll(val) //invoking AC or CE on the calculator
{
    constant = false;
    tempGlobalStr = '';
    placed = false;    
    toggle2nd(1);  
    if (val === 1) //CE invoked 
    {       
        if (globalStr !== '') 
        {
            globalStr = '';
            $('#result').html('0'); 
            if ((trail.length > 0)&& (trail[0]=== 'a'))
            {
                trail = '';
                trailVal = undefined;
                $('#trail').html('0');
                opStack = [];                 
            }                
        }    
        else //if (globalStr === '')  //if nothing to clear in display (Then, there may be an operator attached to the trail string OR not)  
        {                        
                lock = undefined;
                lockVal = undefined;
                if (trailVal !== undefined)
                { 
                  globalStr =  trailVal;  //.toString();
                  $('#result').html(globalStr);
                  constant = true; //Can't do anything with the value except apply an operation
                }
                trail = '';
                trailVal = undefined;
                $('#trail').html('0');
                $('#answer').html('0');
                opStack = []; 
       }    
   }
    else   // (val === 0)  i.e AC is invoked
    {        
        lock = undefined;
        lockVal = undefined;
        globalStr = '';
        $('#result').html('0');
        trail = '';
         $('#trail').html('0'); 
         $('#answer').html('0');
         trailVal = undefined;
         valStack = [];
         opStack = [];
     }         
}

function setLock(L)  //when X to the Y OR the Yth root of X is invoked, you need to lock the system so that a second operand is entered
{    
    var op;
    
       if ((lock !== undefined)||(globalStr===''))
       {   
           alert('System cannot handle that compound operation..');
           return;
       }
       if (L === 'XpowerY')   //'XpowerY' or 'XrootY'
       {
          op = globalStr+'<sup>*</sup>';          
         $('#result').html('<span style ="'+'font-size:10px'+'">x<sup>y</sup></span>');
       }
       else 
       {
          op = globalStr+'<sup>1/*</sup>';
          $('#result').html('<span style ="'+'font-size:10px'+'"><sup><sup>y</sup></sup>&radic;<sub>x</sub></span>');
       }
        lock = L;  //'XpowerY' or 'XrootY' 
        lockVal = globalStr;   //lockVal = undefined initially
        globalStr = '';       
        
        constant = false;
        trail += op;
        $('#trail').html(trail);     
}

function XpowerY(op)
{
  var x = parseFloat(lockVal),
          y = parseFloat(globalStr);
  
  globalStr = Math.pow(x,y); //.toString();
  $('#result').html(globalStr);
  if (trail[trail.length -7]==='*')
    trail = trail.substring(0,trail.length-7)+y+'</sup>';
  else
    trail += '<sup>*'+y+'</sup>';
   $('#trail').html(trail); 
   placed = true;
   constant = true;  
   lock = undefined;
  lockVal = undefined;
  operation(op);
}

function XrootY(op)
{
  var x = parseFloat(lockVal),
          y = parseFloat(globalStr);
  
  globalStr = Math.pow(x,1/y); //.toString();
  $('#result').html(globalStr);
  if (trail[trail.length -7]==='*')
        trail = trail.substring(0,trail.length-7)+y+'</sup>';
  else
        trail += '<sup>*'+y+'</sup>';
   $('#trail').html(trail); 
   placed = true;
   constant = true;  
   lock = undefined;
  lockVal = undefined;
  operation(op);
}

function fac(n)
{
    if (globalStr ==='')
        return;    
    var num, temp = 1;
    
    if (shortInt.test(n)=== false)
    {
        alert('The number is invalid or otherwise out of range: '+n);        
        return;
     }
     
     num = parseInt(n);
     
    if  ( (parseFloat(n) !== num) ||( num < 0) )
    {
        alert('The number is invalid or otherwise out of range: '+n);
    }    
    else if ((num === 0)||(num===1))
    {
        globalStr = '1';
        $('#result').html('1');
        if (lockVal=== undefined)
        {
          if (constant === false)
               trail += ' '+num+'!';
          else
               trail += '! ';
          $('#trail').html(trail); 
          placed = true;
        }
      constant = true;
    }
    else if (num < 171)
    {
        for ( var i = 2; i <= num; i++)
            temp *= i; 
        globalStr = temp; //.toString();
        $('#result').html(globalStr);
        if (lockVal=== undefined)
        {            
            if (constant === false)
               trail += ' '+num+'!';
            else
               trail += '!';
            $('#trail').html(trail);
            placed = true;
        }
      constant = true;
    }
    else
    {
        alert('The number is too large for factorial!');
    }
 }
 
 function exp(n)
 {
     if (globalStr==='')
        return;
    
     var s = parseFloat(n);
     globalStr = Math.exp(s);
     $('#result').html(globalStr);
     if (lockVal=== undefined)
     {
        var vType = valueType(n);
        s = (vType !== undefined)? vType : s;
        if ((constant === false)||(vType!== undefined))
              trail += ' '+s+'<sup>(e<sup>x</sup>)</sup>';
        else
          trail += '<sup>(e<sup>x</sup>)</sup>';
         $('#trail').html(trail); 
         placed = true;
     }
      constant = true;
 }
 
 function valueType(n)
 {
     if (n===PI)
        return '&pi;';
     else if (n===E)
        return 'e';
     else 
        return undefined;     
 }
 
 function square(n)
 {           
     var s = parseFloat(n);
     globalStr = (s*s); //.toString();
     $('#result').html(globalStr);
     if (lockVal === undefined) // pow(x, y) or root(x,y) not invoked 
     {  
        var vType = valueType(n);
        s = (vType !== undefined)? vType : s;
        if ((constant === false)||(vType!== undefined))
              trail += ' '+s+'<sup>2</sup>';
          else
              trail += '<sup>.2</sup>';
         $('#trail').html(trail); 
         placed = true;
      }
      constant = true;
  }
 
 function sqrt(n)
 {
     if (globalStr==='')
        return;
    
     var s = parseFloat(n);
     globalStr = Math.sqrt(s); //.toString();
     $('#result').html(globalStr);
     if (lockVal=== undefined)
     {
        var vType = valueType(n);
        s = (vType !== undefined)? vType : s;
        if ((constant === false)||(vType!== undefined))
              trail += ' '+s+'<sup>-½</sup>';
        else
              trail += '<sup>.-½</sup>';
         $('#trail').html(trail); 
         placed = true;
    }
      constant = true; 
  }
 
 function loge(n)
 {  
     if (globalStr==='')
        return;
    
     var s = parseFloat(n);
     globalStr = Math.log(s); //.toString();
     $('#result').html(globalStr);
     if (lockVal=== undefined)
     {
       var vType = valueType(n);
        s = (vType !== undefined)? vType : s;
        if ((constant === false)||(vType!== undefined))
              trail += ' '+s+'(Lg<sub>e</sub>)';
          else
              trail += '(Lg<sub>e</sub>)';
         $('#trail').html(trail); 
         placed = true;
    }
      constant = true; 
 }
 
 function inverse(n)
 {
     if (globalStr==='')
        return;
    
     var s = parseFloat(n);
     globalStr = (1/s); //.toString();
     $('#result').html(globalStr);
     if (lockVal=== undefined)
     {
        var vType = valueType(n);
        s = (vType !== undefined)? vType : s;
        if ((constant === false)||(vType!== undefined))
              trail += ' '+s+'<sup>-1</sup>';
          else
              trail += '<sup>.-1</sup>';
         $('#trail').html(trail); 
         placed = true;
     }
      constant = true;  
  }
 
 function backspace()
 {
     if ((constant === true)||(globalStr===''))
     {
         globalStr = '';
         $('#result').html('0');
         return;
     }
     
     var len = globalStr.length;
     if (len > 1)
     {
         globalStr = globalStr.substring(0, len-1);
      $('#result').html(globalStr);
      }
      else
      {
          $('#result').html('0');
          globalStr = '';
      }
      if ((globalStr.length === 1)&&(globalStr[0]==='-'))
      {
          globalStr = '';   
          $('#result').html('0');
      }
 }