<?php
$ch = curl_init('http://localhost:8000/api/auth/demo-sandbox');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json', 'Accept: application/json']);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(['category' => 'toko-retail']));
$response = curl_exec($ch);
if(curl_errno($ch)){
    echo 'Curl error: ' . curl_error($ch);
} else {
    $httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    echo "HTTP Status: $httpcode\n";
    echo $response;
}
curl_close($ch);
