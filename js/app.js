const filterWrapper = document.getElementById('filter_wrapper');
const filterInput = document.getElementById('filter_input');
const messageContainer = document.getElementById('message_container');
let selectedCountyList = [];

const v_countyselect = new Vue({
    el: '#selectedCounty',
    data: {
      selected: 'Choose a county',
      options: [
        { text: 'Choose a county', value: 'Choose a county'},
        { text: 'Carlow', value: 'Carlow' },
        { text: 'Cavan', value: 'Cavan' },
        { text: 'Clare', value: 'Clare' },
        { text: 'Cork', value: 'Cork' },
        { text: 'Donegal', value: 'Donegal' },
        { text: 'Dublin', value: 'Dublin' },
        { text: 'Galway', value: 'Galway' },
        { text: 'Kerry', value: 'Kerry' },
        { text: 'Kildare', value: 'Kildare' },
        { text: 'Kilkenny', value: 'Kilkenny' },
        { text: 'Laois', value: 'Laois' },
        { text: 'Leitrim', value: 'Leitrim' },
        { text: 'Limerick', value: 'Limerick' },
        { text: 'Longford', value: 'Longford' },
        { text: 'Louth', value: 'Louth' },
        { text: 'Mayo', value: 'Mayo' },
        { text: 'Meath', value: 'Meath' },
        { text: 'Monaghan', value: 'Monaghan' },
        { text: 'Offaly', value: 'Offaly' },
        { text: 'Roscommon', value: 'Roscommon' },
        { text: 'Sligo', value: 'Sligo' },
        { text: 'Tipperary', value: 'Tipperary' },
        { text: 'Waterford', value: 'Waterford' },
        { text: 'Westmeath', value: 'Westmeath' },
        { text: 'Wexford', value: 'Wexford' },
        { text: 'Wicklow', value: 'Wicklow' },
      ]
    },
    methods: {
        makeRequest(){
            clearContent();
            filterInput.value = '';
            getData(this.selected);
        },
        hidecontentandlistfilter: function () {
            clearContent();
            filterInput.value = '';
            filterWrapper.hidden = true;
        }
      }
});

const v_filtercounty = new Vue({
    el: '#filter_input',
    methods : {
        filterByInput(e){
            let term = e.target.value;
            clearContent();
            if(term.length == 0){
                displayOnPage(selectedCountyList);
            }
            else if(term.length > 0 && term.length < 3){
                showAlert('enter at least 3 characters');  
            }
            else if(selectedCountyList.length > 0){
                let filteredList = filterList(e.target.value);
                if(filteredList == 0){
                    showAlert('no results found'); 
                }
                else{
                    displayOnPage(filteredList);
                }
            }
        }
    }
})

Vue.component('pharmacy-card', {
    props: ['pharmacy'],
    template: '<div class="card" style="width:18rem"><div class="card-body"><h5 class="card-title">{{pharmacy.name}}</h5><h6 class="card-subtitle mb-2 text-muted"><a :href="pharmacy.url" target=_blank>{{pharmacy.address}}</a></h6><p class="card-text">ph: {{pharmacy.phone}}</p><p class="card-text">e: {{pharmacy.email}}</p><p class="card-text">{{pharmacy.openinghours}}</p></div></div>'
})

Vue.component('alert-box', {
    template: `<div class="alert alert-warning"><slot></slot></div>`
})

const content_column_1 = new Vue({
    el: '#content_column_1',
    data: {
        pharmacylist_col1 : []}
})
const content_column_2 = new Vue({
    el: '#content_column_2',
    data: {
        pharmacylist_col2 : []}
})

// make the call to the web service & evaluate the result
function getData(county){
    showAlert('loading...');
    $.get("./php/getData.php?selectedCounty="+county).done(function(data){
        hideAlert();
        // no results
        if(Object.keys(JSON.parse(data).Pharmacies).length == 0){
            showAlert('no results found');
        }
        // if results are returned, process them & display on page
        else{
            selectedCountyList = formatResults(JSON.parse(data).Pharmacies.Pharmacies);
            console.log(selectedCountyList);
            displayOnPage(selectedCountyList);
            // unhide the drilldown filter
            filterWrapper.hidden = false;
        }
    });
}
// iterate over results & format them
function formatResults(array){
    let ls = [];
    array.forEach(e => {
        let mapsqueryurl = 'https://www.google.com/maps/search/'+e.name;
        let address = '';
        if(typeof e.address1 === 'string'){
            address += e.address1+',';
            mapsqueryurl += '+'+e.address1.replace("/", " ");
        }
        if(typeof e.address2 === 'string'){
            address += e.address2+',';
            mapsqueryurl += '+'+e.address2.replace("/", " ");
        }
        if(typeof e.address3 === 'string'){
            address += e.address3+',';
            mapsqueryurl += '+'+e.address3.replace("/", " ");
        }
        if(typeof e.eircode === 'string'){
            address += e.eircode;
            mapsqueryurl += '+'+e.eircode;
        }
        // remove trailing comma
        if(address.slice(-1) == ','){
            address = address.slice(0, -1);
        }
        let phone = typeof e.phone_one != 'object' || Object.keys(e.phone_one).length != 0 ? e.phone_one : 'n/a';
        let email = typeof e.email_one != 'object' || Object.keys(e.email_one).length != 0 ? e.email_one : 'n/a';
        let openinghours = typeof e.opening_hours != 'object' || Object.keys(e.opening_hours).length != 0 ? e.opening_hours : 'n/a';

        ls.push({
            id : e.id,
            name : e.name,
            address : address,
            url : mapsqueryurl,
            phone : phone,
            email : email,
            openinghours : openinghours
        });
    });
    return ls; 
}

function displayOnPage(array){
    counter = 0;
    array.forEach(element => {
        counter += 1;
        if(counter % 2 === 0){
            content_column_2.pharmacylist_col2.push(element);
        }
        else{
            content_column_1.pharmacylist_col1.push(element);
        }    
    });
}
// filter the county list by the term typed into the drilldown filter input
function filterList(term){
    return selectedCountyList.filter(function (el) {
        return el.name != '' && el.name.toLowerCase().includes(term.toLowerCase()) ||
            el.address != '' && el.address.toLowerCase().includes(term.toLowerCase())
    });
}

function showAlert(message){
    messageContainer.hidden = false;
    messageContainer.innerHTML = `<alert-box>${message}</alert-box>`;
}
function hideAlert(){
    messageContainer.innerHTML = '';
    messageContainer.hidden = true;
}
function clearContent(){
    content_column_1.pharmacylist_col1 = [];
    content_column_2.pharmacylist_col2 = [];  
    hideAlert();
}