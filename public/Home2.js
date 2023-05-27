/*Events to be triggered on Submit button click to write data in DB*/
document.querySelector("#submit-button").addEventListener("click", (event) => {
    event.preventDefault();
    let WriteRow = {
        "Timestamp": "",
        "Product Name": "",
        "Purchase Cost": "",
        "Purchase Quantity": "",
        "Unit": "",
        "Warehouse Location": "",
        "Note": ""
    };

    let vDate = `${new Date().getDate()}-${new Date().getMonth() + 1}-${new Date().getFullYear()}`;
    let vtimeHr = new Date().getHours().toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false })
    let vtimeMin = new Date().getMinutes().toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false })
    let vtimeSec = new Date().getSeconds().toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false })

    WriteRow["Timestamp"] = `${vDate} ${vtimeHr}:${vtimeMin}:${vtimeSec}`;
    WriteRow["Product Name"] = document.querySelector("#Product").value;
    WriteRow["Purchase Cost"] = document.querySelector("#PurchaseCost").value;
    WriteRow["Purchase Quantity"] = document.querySelector("#PurchaseQuantity").value;
    WriteRow["Unit"] = document.querySelector("#PurchaseUnit").value;
    WriteRow["Warehouse Location"] = document.querySelector("#WHouseLocation").value;
    WriteRow["Note"] = document.querySelector("#Notes").value;

    let vConfirm = confirm(`Are you sure you want to submit below data
    Product Name: ${WriteRow["Product Name"]}
    Purchase Cost: ${WriteRow["Purchase Cost"]}
    Purchase Quantity: ${WriteRow["Purchase Quantity"]}
    Unit: ${WriteRow["Unit"]}
    Warehouse Location: ${WriteRow["Warehouse Location"]}
    Note: ${WriteRow["Note"]}`);

    if (vConfirm === true) {
        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(WriteRow)
        }
        fetch('/InventoryData', options).then((res) => {  //POST method to send and receive data from server
            return res.json();
        }).then((response) => {
            document.querySelector("#Status").style = "text-align: center; display: block";
            document.querySelector("#Status").innerText = `Below data is successfully written:`
            const vTableDiv = document.createElement("div");
            const vTable = document.createElement("table");
            vTable.id = "HistoryData";
            vTableDiv.id = "HistoryDataDiv"
            vTableDiv.style = "max-width: 100%; overflow: scroll"
            vTable.className = "my-4 table table-bordered table-striped table-dark";
            document.body.appendChild(vTableDiv);
            vTableDiv.appendChild(vTable);
            let table = '';
            response.Data.forEach((row, i) => {
                table += `<tr>`;
                if (i == 0) {
                    row.forEach((cell) => {
                        table += `<th>${cell}</th>`;
                    });
                }
                else {
                    row.forEach((cell) => {
                        table += `<td>${cell}</td>`;
                    });
                }
                table += `</tr>`
            });
            vTable.innerHTML = table;
            document.querySelector("#submit-button").style = 'display: none';
            let vSelect = document.getElementById('Product');
            vSelect.value = 'Default';
            let vContainer = document.getElementById("container");
            vContainer.className = "containerHidden";
        });
    }

});

/*Events for log out click*/
document.querySelector("#logout").addEventListener("click", (event) => {
    location.reload();
    // const options = {
    //     method: "POST",
    //     headers: {
    //         "Content-Type": "application/json"
    //     }
    // }
    // fetch('/LoginPage', options).then((res) => {  //POST method to receive HTML page from server
    //     return res.text();
    // }).then((response) => {
    //     document.open('text/html');
    //     document.write(response);
    //     document.close();
    // });

});

/*Events to be triggered on Billing menu click*/
document.querySelector("#History").addEventListener("click", (event) => {
    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        }
    }
    fetch('/BillingPage', options).then((res) => {  //POST method to receive HTML page from server
        return res.text();
    }).then((response) => {
        document.open('text/html');
        document.write(response);
        document.close();

        /*Fetching data from google sheet and getting all possible products in the dropdown*/
        let vSellingSelect = document.getElementById('SellingProduct');
        let vSellingUnit = document.getElementById('SellingUnit');

        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            }
        }
        fetch('/ProductData', options).then((res) => {  //POST method to send and receive data from server
            return res.json();
        }).then((response) => {
            for (let i = 0; i < response.Products.length; i++) {
                let opt = document.createElement('option');
                opt.value = response.Products[i];
                opt.innerHTML = response.Products[i];
                vSellingSelect.appendChild(opt);
            }
            for (let i = 0; i < response.Units.length; i++) {
                let opt = document.createElement('option');
                opt.value = response.Units[i];
                opt.innerHTML = response.Units[i];
                vSellingUnit.appendChild(opt);
            }
        })
        /*Events to be triggered post selection of a product from dropdown*/
        vSellingSelect.addEventListener("change", () => {
            if (vSellingSelect.value == 'Default') {
                let vContainer = document.getElementById("container");
                vContainer.className = "containerHidden";
                document.querySelector("#submit-button").style = 'display: none';
            } else {
                let vContainer = document.getElementById("container");
                vContainer.className = "container";
                document.querySelector("#submit-button").style = 'display: inline-block';
            }

            let vSelectedProduct = document.getElementById('SellingProduct').value

            const options = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ "SelectedProduct": vSelectedProduct })
            }

            //************getting default unit/selling price data for selected product****************************** 
            fetch('/UnitData', options).then((res) => {  //POST method to send and receive data from server
                return res.json();
            }).then((response) => {
                document.getElementById('SellingUnit').value = response.Unit
                document.getElementById('SellingPrice').value = response.SellingPrice
            });
            //*******************************************************************************************************

            /***************Resetting values post change in product selection******************************/
            document.querySelector("#SellingPrice").value = "";
            document.querySelector("#SellingQuantity").value = "";
            document.querySelector("#SellingWHouseLocation").value = "";
            document.querySelector("#SellingNotes").value = "";
            if (document.querySelector("#HistoryDataDiv")) {
                document.querySelector("#HistoryDataDiv").remove();
                document.querySelector("#Status").style = 'display: none';
                document.querySelector("#Status2").style = 'display: none';
            };
            if (vSellingSelect.value == 'Default') {
                document.querySelector("#submit-button").style = 'display: none';
            } else {
                document.querySelector("#submit-button").style = 'display: inline-block';
            }
            /*********************************************************************************************/
        })
    });
});



/*5*/function myFunction() {
    var x = document.getElementById("myTopnav");
    if (x.className === "topnav") {
        x.className += " responsive";
    } else {
        x.className = "topnav";
    }
    let vlogout = document.getElementById("logout");
    if (vlogout.className === "logout") {
        vlogout.removeAttribute("class")
    } else {
        vlogout.className = "logout"
    }
}