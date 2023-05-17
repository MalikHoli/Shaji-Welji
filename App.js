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
        const response = [(await sheets.spreadsheets.values.get(request)).data.values[2][2],(await sheets.spreadsheets.values.get(request)).data.values[2][1]];
        return response;
    } catch (error) {
        return error;
    }
}