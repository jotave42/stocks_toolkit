const fs = require('fs');
const {spawn} = require("child_process")

const runProgram = (proc, path)=>{
    return  new Promise((resolve, reject) =>{
        const program = spawn(proc,[path],{stdio: 'inherit'});
        program.on('close', (code) => {
            console.log(proc+" "+path +" finished with code: " + code);
        });
      
       
    });
}

const runCompaniesDowloader = async () =>{
    console.log("Runnig CompaniesDowloader.py...");
    const companiesDowloaderPath = "./python/CompaniesDowloader.py";
    const opsys = process.platform;
    const command = opsys === "win32" ? "py" : "python3";
    await runProgram(command,companiesDowloaderPath);
    
};
const runGetStockPrice = async () =>{
    console.log("Runnig GetStockPrice.js...");
    const companiesDowloaderPath = "./js/api/GetStockPrice.js";
    const command = "node";
    await runProgram(command,companiesDowloaderPath);
    
};

const  main = async () =>{
    console.log("Starting system...");

    const today = new Date();
    today.setDate(today.getDate());
    const todayStr = today.toISOString().split('T')[0];
    const  fileJsonCompanies = "./Downloads/AllCompanies/JSON/companies-"+todayStr+".json";
    if( fs.existsSync(fileJsonCompanies) ){
       await runGetStockPrice();
    } else {
        await runCompaniesDowloader();
        await runGetStockPrice();
    }
    console.log("All Done index...");
};

main();