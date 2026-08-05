<?php

namespace App;

enum TransactionTypes: string
{
    case DEPOSIT = 'deposit';
    case WITHDRAW = 'withdraw';

}
