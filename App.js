const { GoogleAuth, GoogleApi } = require("google-auth-library");
const { google } = require("googleapis");
const fs = require("fs");
require('dotenv').config();
const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const path = require('path');



const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log(`listeneing @ ${port}`);
})

app.use(express.static('public'));
app.use(express.json({ limit: '100kb' }));

//--------------------Serving the Login Page with Password/UserName Validation---------------------
app.post('/LoginData', async (request, response) => {
    try {
        //use below code to create hashed password and store in DB
        // const hashedPassword = await bcrypt.hash(request.body.Pwd, 10)
        // console.log(hashedPassword);
        const pwd = await ReadFromGoogleSheetDB(); //Reading the password from database
        if (await bcrypt.compare(request.body.Pwd, pwd[0]) && await bcrypt.compare(request.body.UserId, pwd[1])) {
            response.sendFile(path.join(__dirname, 'public/Home.html'));
        }
        else {
            response.send("10");
        }
    } catch (error) {
        response.send(error);
    }
})
//-----------------------------------------------------------------------------------------

//--------------------Serving the Product list for home page dropdown---------------------
app.post('/ProductData', async (request, response) => {
    try {
        const vProductList = await ReadFromDB("Products");
        let vProductArray = [];
        for (let i = 1; i <= vProductList.length - 1; i++) {
            vProductArray.push(vProductList[i][0])
        }
        let vUnitArray = [];
        for (let i = 1; i <= vProductList.length - 1; i++) {
            vUnitArray.push(vProductList[i][1])
        }
        response.json({
            status: "successful",
            "Products": vProductArray,
            "Units": vUnitArray
        })
    } catch (error) {
        response.send(error);
    }
})
//-----------------------------------------------------------------------------------------

//--------------------Serving the Unit value for selected product-----------------------
app.post('/UnitData', async (request, response) => {
    try {
        const vProductList = await ReadFromDB("Products");
        for (let i = 1; i <= vProductList.length - 1; i++) {
            if (vProductList[i][0] == request.body.SelectedProduct) {
                response.json({
                    status: "successful",
                    "Unit": vProductList[i][1]
                })
                break
            }
        }
    } catch (error) {
        response.send(error);
    }
})
//-----------------------------------------------------------------------------------------


//--------------------Serving the Unit value for selected product-----------------------
app.post('/InventoryData', async (request, response) => {
    try {
        let vData = request.body;
        let vDataArray = [[vData["Timestamp"]
            ,vData["Product Name"], vData["Purchase Cost"]
            ,vData["Purchase Quantity"], vData["Unit"]
            ,vData["Warehouse Location"], vData["Note"]
        ]];
        const vUpdatedRow = await writeToGoogleSheet(vDataArray, 1,'Inventory');
        const vUpdatedData = await ReadFromDB(vUpdatedRow);
        const vHeaderData = await ReadFromDB("Inventory!A1:G1");
            response.json({
                status: "successful",
                "Row updated": vUpdatedRow,
                "Data": [vHeaderData[0],vUpdatedData[0]]
            })
    } catch (error) {
        response.send(error);
    }
})
//-----------------------------------------------------------------------------------------

/*1*/
async function ReadFromGoogleSheetDB() {
    const privateKey = fs.readFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS);
    const scopes = ["https://www.googleapis.com/auth/spreadsheets"];
    const jwtClient = new GoogleAuth({
        key: privateKey,
        scopes: scopes
    });
    const sheets = google.sheets({ version: "v4", auth: jwtClient });
    const sheetId = "1UEIYU3KPc5JKptHEL8WXDBFYifobnQBaXWe3SxPr_GE";
    const range = "Sheet1";
    const request = {
        spreadsheetId: sheetId, range: range
    }
    try {
        const response = [(await sheets.spreadsheets.values.get(request)).data.values[2][2], (await sheets.spreadsheets.values.get(request)).data.values[2][1]];
        return response;
    } catch (error) {
        return error;
    }
}

/*2*/
async function ReadFromDB(Range) {
    const privateKey = fs.readFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS);
    const scopes = ["https://www.googleapis.com/auth/spreadsheets"];
    const jwtClient = new GoogleAuth({
        key: privateKey,
        scopes: scopes
    });
    const sheets = google.sheets({ version: "v4", auth: jwtClient });
    const sheetId = "1kFjvRciwtIZS9JBmT19h8Zrp47A_sDYlmO_iL7AB69Y";
    const range = Range;
    const request = {
        spreadsheetId: sheetId, range: range
    }
    try {
        const response = (await sheets.spreadsheets.values.get(request)).data.values
        return response;
    } catch (error) {
        return error;
    }
}

/*3*/
async function writeToGoogleSheet(values, Row, Sheet) {
    const privateKey = fs.readFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS);
    const scopes = ["https://www.googleapis.com/auth/spreadsheets"];
    const jwtClient = new GoogleAuth({
        key: privateKey,
        scopes: scopes
    });
    const sheets = google.sheets({ version: "v4", auth: jwtClient });

    let request;
    if (Row == 1) { // To append row
        request = {
            spreadsheetId: "1kFjvRciwtIZS9JBmT19h8Zrp47A_sDYlmO_iL7AB69Y",
            //ReadFromGoogleSheet() will return the bank cell rang
            range: `${Sheet}!A${await ReadFromGoogleSheet(Sheet)}`,
            valueInputOption: "USER_ENTERED",
            insertDataOption: "INSERT_ROWS",
            resource: {
                values: values
            }
        };
    } else { // To update row
        request = {
            spreadsheetId: "1kFjvRciwtIZS9JBmT19h8Zrp47A_sDYlmO_iL7AB69Y",
            range: `${Sheet}!A${Row}`,
            valueInputOption: "USER_ENTERED",
            resource: {
                values: values
            }
        };
    }
    if (Row == 1) { // To append row
        try {
            const response = (await sheets.spreadsheets.values.append(request)).data.updates.updatedRange;
            const CellsUpdated = `${response}`;
            return CellsUpdated;
        } catch (error) {
            return error;
        }
    } else { // To update row
        try {
            const response = (await sheets.spreadsheets.values.update(request)).data.updatedRange;
            const CellsUpdated = `${response}`;
            return CellsUpdated;
        } catch (error) {
            return error;
        }
    }

    //*************************Below is one more way to wrire above code*****************************//
    // sheets.spreadsheets.values.append(request, (err, res) => {
    //     if (err) return console.log(`The API returned an error: ${err}`);
    //     console.log(res.data);
    // });
    //**********************************************************************************************//
}

/*2*/
async function ReadFromGoogleSheet(Range) {
    const privateKey = fs.readFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS);
    const scopes = ["https://www.googleapis.com/auth/spreadsheets"];
    const jwtClient = new GoogleAuth({
        key: privateKey,
        scopes: scopes
    });
    const sheets = google.sheets({ version: "v4", auth: jwtClient });
    const sheetId = "1kFjvRciwtIZS9JBmT19h8Zrp47A_sDYlmO_iL7AB69Y";
    const range = Range;
    const request = {
        spreadsheetId: sheetId, range: range
    }
    try {
        const response = (await sheets.spreadsheets.values.get(request)).data.values.length + 1;
        return response;
    } catch (error) {
        return error;
    }
}