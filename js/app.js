
const selectCounty = document.getElementById('selectedCounty');
const contentWrapper = document.getElementById('content_wrapper');
const contentColumn1 = document.getElementById('content_column_1');
const contentColumn2 = document.getElementById('content_column_2');
const filterWrapper = document.getElementById('filter_wrapper');
const filterInput = document.getElementById('filter_input');
const messageContainer = document.getElementById('message_container');
let selectedCountyList = [];

// setting the form submit function to pass the selected county to the getData method
$(window).ready(function () {
  
    $("form").submit(function (e) {
        clearContent();
        filterInput.value = '';
        e.preventDefault();
        let selectedCounty = $("#selectedCounty").val();
        getData(selectedCounty)
    })

})

// make the call to the web service & evaluate the result
function getData(county){
    showAlert('loading...', 'loading');
    $.get("./php/getData.php?selectedCounty="+county).done(function(data){
        console.log(JSON.parse(data).Pharmacies);
        hideAlert();
        // no results
        if(Object.keys(JSON.parse(data).Pharmacies).length == 0){
            let message = 'no results found';
            showAlert(message, 'warning');
        }
        // if results are returned, process them
        else{
            selectedCountyList = JSON.parse(data).Pharmacies.Pharmacies;
            
            console.log(selectedCountyList);
            processResults(selectedCountyList);
            // unhide the drilldown filter
            filterWrapper.hidden = false;
        }
    });
}

// iterate over results
function processResults(array){
    clearContent();
    counter = 0;
    array.forEach(element => {
        counter += 1;
        let elCard = constructCard(element);
        if(counter % 2 === 0){
            contentColumn2.appendChild(elCard);
        }
        else{
            contentColumn1.appendChild(elCard);  
        }
    })
}

// construct card element for displaying results on html page
function constructCard(e){
    let mapsqueryurl = 'https://www.google.com/maps/search/'+e.name;
    let address = '';
    if(typeof e.address1 != 'object' || Object.keys(e.address1).length != 0){
        address += e.address1+',';
        mapsqueryurl += '+'+e.address1.replace("/", " ");
    }
    if(typeof e.address2 != 'object' || Object.keys(e.address2).length != 0){
        address += e.address2+',';
        mapsqueryurl += '+'+e.address2.replace("/", " ");
    }
    if(typeof e.address3 != 'object' || Object.keys(e.address3).length != 0){
        address += e.address3+',';
        mapsqueryurl += '+'+e.address3.replace("/", " ");
    }
    if(typeof e.eircode != 'object' || Object.keys(e.eircode).length != 0){
        address += e.eircode;
        mapsqueryurl += '+'+e.eircode;
    }
    // remove trailing comma
    if(address.slice(-1) == ','){
        address = address.slice(0, -1);
    }
  
    let phone = typeof e.phone_one != 'object' || Object.keys(e.phone_one).length != 0 ? e.phone_one : 'n/a';
    let email = typeof e.email_one != 'object' || Object.keys(e.email_one).length != 0 ? e.email_one : 'n/a';
    let openingHours = typeof e.opening_hours != 'object' || Object.keys(e.opening_hours).length != 0 ? e.opening_hours : 'n/a';

    let elCard = document.createElement('div');
    elCard.className = 'card';
    elCard.style.width = '18rem';
    elCard.innerHTML = `<div class="card-body">
    <h5 class="card-title">${e.name}</h5>
    <h6 class="card-subtitle mb-2 text-muted"><a href="${mapsqueryurl}" target=_blank>${address}</a></h6>
    <p class="card-text">ph: ${phone}</p>
    <p class="card-text">e: ${email}</p>
    <p class="card-text">${openingHours}</p>
  </div>`;
    return elCard;
}

// drilldown filter will fire when something is typed in it
filterInput.addEventListener('keyup', function(e){
    let term = e.target.value;
    if(term.length == 0){
        processResults(selectedCountyList);
    }
    else if(term.length > 0 && term.length < 3){
        clearContent();
        showAlert('enter at least 3 characters','warning');  
    }
    else if(selectedCountyList.length > 0){
        let filteredList = filterList(e.target.value);
        if(filteredList == 0){
            clearContent();
            showAlert('no results found','warning'); 
        }
        else{
            processResults(filteredList);
        }
    }
});

selectCounty.addEventListener('click', function(){
    filterInput.value = '';
    filterWrapper.hidden = true;
    clearContent();
})

// filter the county list by the term typed into the drilldown filter input
function filterList(term){
    let filteredList = [];
    if(term == ''){
        filteredList = selectedCountyList;
    }
    else{
        filteredList = selectedCountyList.filter(function (el) {
            return (typeof el.name === 'string' && el.name.toLowerCase().includes(term.toLowerCase())) ||
                (typeof el.address1 === 'string' && el.address1.toLowerCase().includes(term.toLowerCase())) ||
                (typeof el.address2 === 'string' && el.address2.toLowerCase().includes(term.toLowerCase())) ||
                (typeof el.address3 === 'string' && el.address3.toLowerCase().includes(term.toLowerCase()))
        });
    }
    console.log(filteredList.length);
    return filteredList;
}

function showAlert(message, type){
    if(type == 'warning'){
        messageContainer.className = 'alert alert-warning';
    }
    else if(type == 'loading'){
        messageContainer.className = 'alert alert-primary';
    }
    messageContainer.innerText = message;
    messageContainer.hidden = false;
}
function hideAlert(){
    messageContainer.innerText = '';
    messageContainer.hidden = true;
}
function clearContent(){
    contentColumn1.innerHTML = '';
    contentColumn2.innerHTML = '';
    hideAlert();
}

// https://www2.hse.ie/Apps/Services/PharmaciesServiceList.aspx