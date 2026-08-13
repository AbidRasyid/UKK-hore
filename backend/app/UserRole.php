<?php

namespace App;

enum UserRole: string
{
    case ADMINISTRATOR = 'administrator';
    case TELLER = 'teller';
    case SUPERVISOR = 'supervisor';
}
