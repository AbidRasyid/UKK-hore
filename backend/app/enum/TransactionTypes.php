<?php

namespace App\enum;

enum TransactionTypes: string
{
    case DEPOSIT = 'deposit';
    case WITHDRAWAL = 'withdrawal';

}
