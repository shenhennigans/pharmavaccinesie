<?php
    $service_url = 'https://www2.hse.ie/webservices/ServiceLists.asmx/GetPharmacies';
    $selectedCounty = $_GET["selectedCounty"];

    $curl = curl_init();
    $curl_post_data = array(
            'county' => $selectedCounty,
            'skip' => '0',
            'take' => '1000'
    );
    //url-ify the data for the POST
    $fields_string = http_build_query($curl_post_data);
    // set options
    curl_setopt($curl,CURLOPT_URL, $service_url);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($curl, CURLOPT_POST, true);
    curl_setopt($curl, CURLOPT_POSTFIELDS, $fields_string);
    curl_setopt($curl,CURLOPT_HTTPHEADER, array('Content-Type: application/x-www-form-urlencoded')); 
    
    $curl_response = curl_exec($curl);
    if ($curl_response === false) {
        $info = curl_getinfo($curl);
        curl_close($curl);
        die('error occured during curl exec. Additional info: ' . var_export($info));
    }
    curl_close($curl);
    $xml = simplexml_load_string($curl_response, "SimpleXMLElement", LIBXML_NOCDATA);
    $json = json_encode($xml);
    echo $json;
?>