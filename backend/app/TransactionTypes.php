<?php

namespace App;

enum TransactionTypes: string
{
    case DEPOSIT = 'deposit';
    case WITHDRAWAL = 'withdrawal';

}
