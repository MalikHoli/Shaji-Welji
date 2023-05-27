/*Events to be triggered on Submit button click to write data in DB*/
document.querySelector("#submit-button").addEventListener("click", (event) => {
    event.preventDefault();
    let WriteRow = {
        "Timestamp": "",
        "Product Name": "",
        "Selling Price": "",
        "Selling Quantity": "",
        "Unit": "",
        "Warehouse Location": "",
        "Note": ""
    };

    let vDate = `${new Date().getDate()}-${new Date().getMonth() + 1}-${new Date().getFullYear()}`;
    let vtimeHr = new Date().getHours().toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false })
    let vtimeMin = new Date().getMinutes().toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false })
    let vtimeSec = new Date().getSeconds().toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false })

    WriteRow["Timestamp"] = `${vDate} ${vtimeHr}:${vtimeMin}:${vtimeSec}`;
    WriteRow["Product Name"] = document.querySelector("#SellingProduct").value;
    WriteRow["Selling Price"] = document.querySelector("#SellingPrice").value;
    WriteRow["Selling Quantity"] = document.querySelector("#SellingQuantity").value;
    WriteRow["Unit"] = document.querySelector("#SellingUnit").value;
    WriteRow["Warehouse Location"] = document.querySelector("#SellingWHouseLocation").value;
    WriteRow["Note"] = document.querySelector("#SellingNotes").value;

    let vConfirm = confirm(`Are you sure you want to submit below data
    Product Name: ${WriteRow["Product Name"]}
    Selling Price: ${WriteRow["Selling Price"]}
    Selling Quantity: ${WriteRow["Selling Quantity"]}
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
        fetch('/BillingData', options).then((res) => {  //POST method to send and receive data from server
            return res.json();
        }).then((response) => {
            document.querySelector("#Status").style = "text-align: center; display: block";
            document.querySelector("#Status").innerText = `Below data is successfully written:`
            document.querySelector("#Status2").style = "text-align: center; display: block";
            document.querySelector("#Status2").innerText = `Bill will be generated for Rs ${response.Data[1][2] * response.Data[1][3]}`
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
            let vSellingSelect = document.getElementById('SellingProduct');
            vSellingSelect.value = 'Default';
            let vContainer = document.getElementById("container");
            vContainer.className = "containerHidden";
        });
    }

});

/*Events to be triggered on Home menu click*/
document.querySelector("#Home").addEventListener("click", (event) => {
    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        }
    }
    fetch('/InventoryPage', options).then((res) => {  //POST method to receive HTML page from server
        return res.text();
    }).then((response) => {
        document.open('text/html');
        document.write(response);
        document.close();

        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            }
        }
        fetch('/ProductData', options).then((res) => {  //POST method to send and receive data from server
            return res.json();
        }).then((response) => {
            /*Fetching data from google sheet and getting all possible products in the dropdown*/
            let vSelect = document.getElementById('Product');
            let vUnit = document.getElementById('PurchaseUnit');

            for (let i = 0; i < response.Products.length; i++) {
                let opt = document.createElement('option');
                opt.value = response.Products[i];
                opt.innerHTML = response.Products[i];
                vSelect.appendChild(opt);
            }
            for (let i = 0; i < response.Units.length; i++) {
                let opt = document.createElement('option');
                opt.value = response.Units[i];
                opt.innerHTML = response.Units[i];
                vUnit.appendChild(opt);
            }

            /*Events to be triggered post selection of a product from dropdown*/
            vSelect.addEventListener("change", () => {
                if (vSelect.value == 'Default') {
                    let vContainer = document.getElementById("container");
                    vContainer.className = "containerHidden";
                    document.querySelector("#submit-button").style = 'display: none';
                } else {
                    let vContainer = document.getElementById("container");
                    vContainer.className = "container";
                    document.querySelector("#submit-button").style = 'display: inline-block';
                }

                let vSelectedProduct = document.getElementById('Product').value
                const options = {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ "SelectedProduct": vSelectedProduct })
                }

                fetch('/UnitData', options).then((res) => {  //POST method to send and receive data from server
                    return res.json();
                }).then((response) => {
                    document.getElementById('PurchaseUnit').value = response.Unit
                });

                /***************Resetting values post change in product selection******************************/
                document.querySelector("#PurchaseCost").value = "";
                document.querySelector("#PurchaseQuantity").value = "";
                document.querySelector("#WHouseLocation").value = "";
                document.querySelector("#Notes").value = "";
                if (document.querySelector("#HistoryDataDiv")) {
                    document.querySelector("#HistoryDataDiv").remove();
                    document.querySelector("#Status").style = 'display: none';
                };
                if (vSelect.value == 'Default') {
                    document.querySelector("#submit-button").style = 'display: none';
                } else {
                    document.querySelector("#submit-button").style = 'display: inline-block';
                }
                /*********************************************************************************************/
            })
        })
    });
});

/*Events for log out click*/
document.querySelector("#logout").addEventListener("click", (event) => {
    location.reload();
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