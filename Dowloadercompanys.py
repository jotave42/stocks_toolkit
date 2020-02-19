from datetime import date, timedelta
import requests
import pandas as pd
import json
import os

def creatDirIfNotExist(dirLocation):
    
    if not os.path.exists(dirLocation):
        os.makedirs(dirLocation, exist_ok=True)

def downloadCompanisFile():

    today = date.today()
    todayStr = today.strftime("%Y-%m-%d")
    print("Fetching day: ",todayStr)

    url = "https://arquivos.b3.com.br/api/download/requestname?fileName=InstrumentsConsolidated&date="+todayStr+"&recaptchaToken="

    res = requests.get(url)
    statusCode = res.status_code


    while statusCode != 200:
        today = today - timedelta(days=1)
        todayStr = today.strftime("%Y-%m-%d")
        print("trying get the day: ",todayStr)
        url = "https://arquivos.b3.com.br/api/download/requestname?fileName=InstrumentsConsolidated&date="+todayStr+"&recaptchaToken="
        res = requests.get(url)
        statusCode = res.status_code

    print("Sucesses on getting the day: ",todayStr)
    requestJson = res.json()
    redirectUrl=  requestJson["redirectUrl"]
    fileName = requestJson["file"]["name"]+requestJson["file"]["extension"]
    print("Downloading file: ",fileName)
    parmsDoaload = str(redirectUrl).replace('~','')

    urlDowload ="https://arquivos.b3.com.br/api"+parmsDoaload

    resDowload = requests.get(urlDowload)
    if(resDowload.status_code == 200):
        print("Success on Downloading")

    sourceEncoding = "cp1252"
    targetEncoding = "utf-8"

    creatDirIfNotExist(".\Downloads\AllCompanies\CSV")

    fileCsvLocation = "./Downloads/AllCompanies/CSV/"+fileName
    with open(fileCsvLocation, 'wb') as f:
        f.write(str(resDowload.content,sourceEncoding).encode(targetEncoding))
    return (fileCsvLocation, todayStr)

def craeteCompanisJson(fileCsvLocation):

    data = pd.read_csv(fileCsvLocation, sep=";" , low_memory=False)

    dataSelectedRows = data.filter(items=['TckrSymb', 'SctyCtgyNm','SpcfctnCd','CrpnNm']) #seleciona so esses campos
    sotkcs = dataSelectedRows['SctyCtgyNm'].isin(('SHARES','UNIT'))
    diaLivr = ~dataSelectedRows['SpcfctnCd'].isin(['DIA LIVR']) # the ~ is  iqual to ! or not


    sanitizedData = dataSelectedRows[sotkcs & diaLivr]

    stocksByCompany = {}
    for index, row in sanitizedData.iterrows():
        stocksByCompany[row['TckrSymb']] = {
            "SctyCtgyNm" : row['SctyCtgyNm'],
            "SpcfctnCd" : row['SpcfctnCd'],
            "CrpnNm" : row['CrpnNm']
        }
    return stocksByCompany

def saveCompanisJson(stocksByCompany,todayStr):
    
    creatDirIfNotExist(".\Downloads\AllCompanies\JSON")

    jsonfileLocation = "./Downloads/AllCompanies/JSON/companies-"+todayStr+".json"
    print("Saving json on: ", jsonfileLocation)
    with open(jsonfileLocation, 'w', encoding='utf-8') as jsonFile:
        json.dump(stocksByCompany, jsonFile, ensure_ascii=False, indent=4)
    print("Json saved")
    return True

def main():
    
    fileCsvLocation, todayStr = downloadCompanisFile()

    stocksByCompany = craeteCompanisJson(fileCsvLocation)
    
    if(saveCompanisJson(stocksByCompany, todayStr)):
        print("All done...")
    
main()