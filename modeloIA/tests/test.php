<?php

function getUserById($id) {
    return "User " . $id;
}

function calculateTotal($items) {
    $total = 0;
    foreach ($items as $item) {
        $total += $item['price'];
    }
    return $total;
}

?>