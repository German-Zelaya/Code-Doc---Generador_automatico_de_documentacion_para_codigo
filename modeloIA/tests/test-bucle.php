<?php
function updateUserRecords($userIds, $updates) {
    $success = [];
    $failed = [];
    
    foreach ($userIds as $userId) {
        $user = User::find($userId);
        
        if ($user) {
            foreach ($updates as $field => $value) {
                $user->$field = $value;
            }
            
            if ($user->save()) {
                $success[] = $userId;
            } else {
                $failed[] = $userId;
            }
        } else {
            $failed[] = $userId;
        }
    }
    
    return ['success' => $success, 'failed' => $failed];
}
?>