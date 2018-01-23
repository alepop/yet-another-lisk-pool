yet-another-lisk-pool
=====

Simple Lisk pool script (in development)
------------

Installation
------------

    git clone git@github.com:alepop/yet-another-lisk-pool.git
    cd ./yet-another-lisk-pool
    mkdir data
    npm install


Usage
-----
Rename `example.config.json` to `config.json` and fill it with your settings.

Then you can use this commands:


```js
npm run get:payouts // will calculate rewards and safe it to the ./data/balance.json file

npm run sign:transactions -- "secret" "secondSecre" // will sign transaction and safe it to the ./data/payouts.json file

npm run broadcast:transactions // Broad cast transaction to the network

```