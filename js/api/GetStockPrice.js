const fs = require('fs');
const fetch = require("node-fetch");

const getStockPrice = async (dir,jsonCompanies) => {

        const b3Api = "http://cotacao.b3.com.br/mds/api/v1/DailyFluctuationHistory/";
        const stocks = Object.keys(jsonCompanies);
        const  stocksProcesses = 
        stocks.map( async (stockId)=>{
            const company = jsonCompanies[stockId];
            const fileName = dir+"/"+stockId+".json";
            const StockObject = {    
                "CrpnNm" :  company.CrpnNm,
                "stockId" : stockId,
                "SpcfctnCd" : company.SpcfctnCd,
                "SctyCtgyNm" : company.SctyCtgyNm
            };
            return fetch(`${b3Api}${stockId}`,).then( async (res) => {
                const data = await res.json()
                if (!res.ok){
                    throw new Error(await res.text());
                }
                StockObject.stockPrice = data.TradgFlr.scty.lstQtn;
                
                fs.writeFileSync(fileName,JSON.stringify(StockObject,null,4));
                console.log("saved file: ",fileName);

            }).catch((err) => {
                console.log(err);
            });
            
        });
        await Promise.all(stocksProcesses);
    
};
const main = async ()=>{
    console.log("GetStockPrice.js Started...");
    const projectFolder = __dirname.split("js")[0];
    console.log(projectFolder);
    const today = new Date();
    today.setDate(today.getDate());
    let todayStr = today.toISOString().split('T')[0];
    let fileJsonCompanies =projectFolder+'Downloads\\AllCompanies\\JSON\\companies-'+todayStr+'.json';
    console.log("Trying Open: ",fileJsonCompanies);

    while (!fs.existsSync(fileJsonCompanies)){
        today.setDate(today.getDate()-1);
        todayStr =  today.toISOString().split('T')[0];
        fileJsonCompanies =projectFolder+'Downloads\\AllCompanies\\JSON\\companies-'+todayStr+'.json';
        console.log("Trying Open: ",fileJsonCompanies);
    }
    
    const jsonCompanies = require(fileJsonCompanies);
    const dir = projectFolder+"Downloads\\Companies\\"+todayStr;

    if (!fs.existsSync(dir)){
    
        fs.mkdirSync(dir,{recursive: true});
    }
    
    await getStockPrice(dir,jsonCompanies);
    
    
};

main().then(()=>{
    console.log("All done GetStockPrice ...");
}).catch((err)=>{
    console.log("Something went wrong...");
    console.log("Error:",err);
})