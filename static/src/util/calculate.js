/**
 * 计算器
 */
export default function(v){
    let stack = [];
    let n = 0;
    for(let i =0 ;i<v.length;i++){
        let t = v[i];
        if(t >='0' && t<='9'){
            n = n * 10 + parseInt(t);
        }else if(t=='+'){
            stack.push(n);
            n =0 ;
            stack.push('+');
        }else if(t == '-'){
            stack.push(n);
            n =0 ;
            stack.push('-');
        }
    }
    if(n!=0){
        stack.push(n);
    }
    console.log(stack);

    let res = stack[0] ;
    for(let i =1;i<stack.length;i++){
        console.log(stack[i],stack[i+1]);
        if(stack[i]=='+'){
            res += stack[++i];
        }else if(stack[i]=='-'){
            res -= stack[++i];
        }
    }

    return res;
}