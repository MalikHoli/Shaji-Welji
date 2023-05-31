/*Fetching data from google sheet and getting all possible products in the dropdown*/
document.addEventListener('keydown',(evt)=>{
    if(vInterval){
        clearInterval(vInterval)
    }
    if(evt.key=='Enter'){
        if(vBarcode){
            const options = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ "SelectedProductCode": vBarcode })
            }

            fetch('/BarcodeProductData', options).then((res) => {  //POST method to send and receive data from server
                return res.json();
            }).then((response) => {
                document.querySelector('#SellingProduct').value = response.Product;
                document.querySelector('#SellingProduct').click();
            });
            
            vBarcode =''
            return
        }
    }
    if(evt.key != 'Shift'){
        vBarcode += evt.key
    }
    vInterval = setInterval(()=> vBarcode='',20)
});