<?php

namespace App;

enum UserRole: string
{
    case ADMINISTRATOR = 'administrator';
    case TELLER = 'teller';
    case SUPERVISOR = 'supervisor';
    case CUSTOMER = 'customer';

    public static function getThreeSpesific(){
        return [self::ADMINISTRATOR, self::SUPERVISOR, self::TELLER];
    }
}
