/*Events to be triggered for order creation and to write data in DB*/
document.querySelector("#order-button").addEventListener("click", (event) => {
    event.preventDefault();
    document.querySelector("#order-button").style = "display: none";

    let WriteRow = {
        "Timestamp": "",
        "Customer Name": "",
        "Mobile No": ""
    };
    let vDate = `${new Date().getDate()}-${new Date().getMonth() + 1}-${new Date().getFullYear()}`;
    let vtimeHr = new Date().getHours().toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false })
    let vtimeMin = new Date().getMinutes().toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false })
    let vtimeSec = new Date().getSeconds().toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false })

    WriteRow["Timestamp"] = `${vDate} ${vtimeHr}:${vtimeMin}:${vtimeSec}`;
    WriteRow["Customer Name"] = document.querySelector("#CustomerName").value;
    WriteRow["Mobile No"] = document.querySelector("#CustomerMobile").value;

    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(WriteRow)
    }
    fetch('/CustomerData', options).then((res) => {  //POST method to send and receive data from server
        return res.json();
    }).then((response) => {
        try {
            if (response.status == 'successful') {
                document.querySelector("#container2").className = "containerHidden2"
                document.querySelector("#SelectProductDiv").style = "text-align: center;"
            }
        } catch (error) {
            document.write("something is wrong please refresh page and try again")
        }
    });
});


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
        "Note": "",
        "Selling Cost": ""
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
    WriteRow["Selling Cost"] = document.querySelector("#SellingQuantity").value * document.querySelector("#SellingPrice").value;

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
            const vTableDiv = document.querySelector("#HistoryDataDiv");
            if(document.querySelector("#HistoryDataDiv").childElementCount>0){
                document.querySelector("#HistoryDataDiv").replaceChildren();
            }
            const vTable = document.createElement("table");
            vTable.id = "HistoryData";
            vTableDiv.style = "max-width: 100%; overflow: scroll; display: block;"
            vTable.className = "my-4 table table-bordered table-striped table-dark";
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
            document.querySelector("#order-completediv").style = 'text-align: center';

            /*Events to be triggered for Billing creation*/
            document.querySelector("#order-complete").addEventListener("click", (event) => {
                const options = {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ "OrderNo": response.Data[1][0] })
                }
                fetch('/GenerateBill', options).then((res) => {  //POST method to receive data from server
                    return res.json();
                }).then((response) => {
                    document.querySelector("#order-completediv").style = 'display: none';
                    document.querySelector("#Status").style = "display: none";
                    document.querySelector("#HistoryDataDiv").style = "display: none";
                    document.querySelector("#SelectProductDiv").style = "display: none";

                    const vTableDiv = document.querySelector("#FinalBillDiv");
                    if(document.querySelector("#FinalBillDiv").childElementCount>0){
                        document.querySelector("#FinalBillDiv").replaceChildren();
                    }
                    const vTable = document.createElement("table");
                    vTable.id = "FinalBillData";
                    vTableDiv.style = "max-width: 100%; overflow: scroll"
                    vTable.className = "my-4 table table-bordered table-striped";
                    vTableDiv.appendChild(vTable);
                    let table = '';
                    response.BillingTable.forEach((row, i) => {
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
                    document.querySelector("#Status2").style = "text-align: center; display: block";
                    document.querySelector("#Status2").innerText = `Total Amount: Rs ${response.BillValue}`;
                    document.querySelector("#Printdiv").style = "text-align: center; display: block";
                    
                    /*This is to print the bill */
                    document.querySelector("#Print").addEventListener("click", (event) => {
                        event.preventDefault();
                        vDivToPrint = document.querySelector("#FinalBillDiv");
                        newWin = window.open("");
                        newWin.document.write(`<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.3.1/dist/css/bootstrap.min.css"
                        integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">
                    
                      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">`);
                      newWin.document.write('<style>'); 
                      newWin.document.write('my-4 table table-bordered table-striped'); 
                      newWin.document.write('</style>'); 
                      newWin.document.write(vDivToPrint.innerHTML);
                        vDivToPrint = document.querySelector("#Status2");
                        newWin.document.write(vDivToPrint.innerHTML);
                        newWin.print();
                        newWin.close();
                    });

                    /*This is to create next billing order
                    Note that from const options line the code is copied from Home/Home2.js
                    Hence modify this code as well when you modify anything regarding History event trigger */
                    document.querySelector("#Next").addEventListener("click", (event) => {
                        event.preventDefault();
                        document.querySelector("#FinalBillDiv").style = "display: none";
                        document.querySelector("#Status2").style = "display: none";
                        document.querySelector("#Printdiv").style = "display: none";
                        
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
                                
                                document.querySelector("#HistoryDataDiv").style = 'display: none';
                                document.querySelector("#Status").style = 'display: none';
                                document.querySelector("#Status2").style = 'display: none';
                                
                                if (vSellingSelect.value == 'Default') {
                                    document.querySelector("#submit-button").style = 'display: none';
                                } else {
                                    document.querySelector("#submit-button").style = 'display: inline-block';
                                    document.querySelector("#order-completediv").style = 'display: none';
                                }
                                /*********************************************************************************************/
                            })
                        });
                    });
                });
            });
        });
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