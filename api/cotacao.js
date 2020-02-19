const fs = require('fs');
const fetch = require("node-fetch");

const getStockPrice = async (dir,todayStr,jsonCompanies) => {

    const b3Api = "http://cotacao.b3.com.br/mds/api/v1/DailyFluctuationHistory/";
    const stocks = Object.keys(jsonCompanies);
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
            fs.writeFile(fileName,JSON.stringify(StockObject,null,4),()=>{
                console.log("saved file: ",fileName);
            })

        }).catch((err) => {
            console.log(err);
        });
        
    });
};
const main = async ()=>{
    const today = new Date();
    today.setDate(today.getDate());
    let todayStr = today.toISOString().split('T')[0];
    let fileJsonCompanies ='./../Downloads/AllCompanies/JSON/companies-'+todayStr+'.json';
    console.log("Trying Open: ",fileJsonCompanies);

    while (!fs.existsSync(fileJsonCompanies)){
        today.setDate(today.getDate()-1);
        todayStr =  today.toISOString().split('T')[0];
        fileJsonCompanies ='./../Downloads/AllCompanies/JSON/companies-'+todayStr+'.json';
        console.log("Trying Open: ",fileJsonCompanies);
    }
    
    const jsonCompanies = require(fileJsonCompanies);
    const dir = "./../Downloads/Companies/"+todayStr;

    if (!fs.existsSync(dir)){
    
        fs.mkdirSync(dir,{recursive: true});
    }
    
    await getStockPrice(dir,todayStr,jsonCompanies);
    
    
};

main().then(()=>{
    console.log("All done...");
}).catch((err)=>{
    console.log("Something went wrong...");
    console.log("Error:",err);
})