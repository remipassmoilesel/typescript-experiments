let wait = require('f-promise').wait;
let run = require('f-promise').run;

// cette fonction se résolvera toujours après deux secodnes
function resolveAfterNSeconds(x) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(x);
        }, 800);
    });
}

// f-promise utilise deux fonctions: wait et run.
// dans un bloc run, wait(Promise) attend que la promesse se résolve ou jette une erreur
run(()=>{

    let value = wait(resolveAfterNSeconds(5));
    console.log("value: " + value);

    let value2 = wait(resolveAfterNSeconds(10));
    console.log("value2: " + value2);

});
