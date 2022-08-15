# RTB Creative Filtering Report

It can be time consuming to manually navigate the Authorized Buyers product UI to find out what are the creatives that are being kept out of
auction because of errors, especially as the number of creatives rise.
This solution leverages [Ad Exchange Buyer II API](https://developers.google.com/authorized-buyers/apis/realtimebidding/reference/rest) and [Real-time bidding API](https://developers.google.com/authorized-buyers/apis/reference/rest) to help automate the search and handling of such errors.

## Disclaimer

This is not an official Google solution, and is provided "as-is" as a sample.
Please also keep in mind that this sample was written using the Real-time Bidding API v1 and Ad Exchanger Buyer II API v2beta1 and as such, it may not work properly on as newer versions of the API get released. There are no current plans to maintain or update this sample.

## Installing dependencies

- sudo apt install npm
- sudo npm install -g @google/clasp
- npm install

## Deploying new spreadsheet

- clasp login
- clasp create --type sheets --title "RTB Creative Filtering Report"
- clasp push -f

## Kickstarting the template

On the top menu of the spreadsheet, there will be a unique option called "Creative Filtering Report".
From that menu, select "Build template".
