/** Copyright 2022 Google LLC
* 
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* https://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

namespace RTBApi {
    const defaultOptions = {
        muteHttpExceptions: true,
        contentType: "application/json",
        headers: {
            Referer: "https://www.google.com/adx",
            Authorization: `Bearer ${ScriptApp.getOAuthToken()}`
        }
    };

    export function setupFilterSet(bidderId: string, accountId: string) {
        let result = true;
        if (!filterSetExists(bidderId, accountId)) {
            result = createFilterSet(bidderId, accountId);
        }
        return result;
    };

    export function fetchCreativeMetrics(bidderId: string, accountId: string, creativeStatusCode: string) {
        return getCreativeDetails(getFilterSetName(bidderId, accountId), creativeStatusCode);
    };

    export function fetchFilteredBids(bidderId: string, accountId: string) {
        return getFilteredBids(getFilterSetName(bidderId, accountId));
    };

    export function fetchImpressionMetrics(bidderId: string, accountId: string) {
        return getImpressionsMetrics(getFilterSetName(bidderId, accountId));
    };

    export function fetchCreativeDetails(bidderId: string, creativeIds: Array<string>) {
        let creatives: Array<any> = [];
        while (creativeIds.length > 0) {
            let currentCreatives = creativeIds.splice(0, 40);
            let filter = encodeURIComponent(`creativeId=(${currentCreatives.join(" OR ")})`);
            let response = UrlFetchApp.fetch(`https://realtimebidding.googleapis.com/v1/buyers/${bidderId}/creatives?filter=${filter}&pageSize=${currentCreatives.length}`, defaultOptions);
            creatives = creatives.concat(JSON.parse(response.getContentText()).creatives);
        }
        return creatives;
    };

    function getFilterSetPath(bidderId: string, accountId: string) {
        let path = `bidders/${bidderId}/filterSets`;
        if (accountId != "") {
            path = `bidders/${bidderId}/accounts/${accountId}/filterSets`;
        }
        return path;
    }

    function getFilterSetName(bidderId: string, accountId: string) {
        return `${getFilterSetPath(bidderId, accountId)}/${Config.filterSetName}`;
    };

    function listFilterSets(accountId: string) {
        let response = UrlFetchApp.fetch(`https://adexchangebuyer.googleapis.com/v2beta1/bidders/${accountId}/filterSets`, defaultOptions);
        Logger.log(response.getResponseCode());
        Logger.log(JSON.parse(response.getContentText()).filterSets.length);
        Logger.log(JSON.parse(response.getContentText()).filterSets);
    };

    function getImpressionsMetrics(filterSetName: string) {
        TrixLogger.log(`Getting total impression metrics from ${filterSetName}...`);
        let response = UrlFetchApp.fetch(`https://adexchangebuyer.googleapis.com/v2beta1/${filterSetName}/impressionMetrics`, defaultOptions);
        if (response.getResponseCode() != 200) {
            TrixLogger.log(`Error during last operation!`);
            TrixLogger.log(response.getContentText());
        }
        return JSON.parse(response.getContentText());
    };

    function getFilteredBids(filterSetName: string) {
        TrixLogger.log(`Getting filtered bids from ${filterSetName}/filteredBids...`);
        let response = UrlFetchApp.fetch(`https://adexchangebuyer.googleapis.com/v2beta1/${filterSetName}/filteredBids?pageSize=500`, defaultOptions);
        TrixLogger.log(`Metrics retrieval with status ${response.getResponseCode()}!`);
        if (response.getResponseCode() != 200) {
            TrixLogger.log(`Error during last operation!`);
            TrixLogger.log(response.getContentText());
        }
        return JSON.parse(response.getContentText());
    };

    function getCreativeDetails(filterSetName: string, creativeStatusId: string) {
        TrixLogger.log(`Getting metrics from ${filterSetName}/filteredBids/${creativeStatusId}/creatives...`);
        let response = UrlFetchApp.fetch(`https://adexchangebuyer.googleapis.com/v2beta1/${filterSetName}/filteredBids/${creativeStatusId}/creatives`, defaultOptions);
        TrixLogger.log(`Metrics retrieval with status ${response.getResponseCode()}!`);
        if (response.getResponseCode() != 200) {
            TrixLogger.log(`Error during last operation!`);
            TrixLogger.log(response.getContentText());
        }
        return JSON.parse(response.getContentText());
    };

    function createFilterSet(bidderId: string, accountId: string) {
        let path = getFilterSetPath(bidderId, accountId);
        let name = getFilterSetName(bidderId, accountId);
        TrixLogger.log(`Creating filterset ${name}...`);
        let options: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
            ...defaultOptions,
            method: "post",
            payload: JSON.stringify({
                name,
                relativeDateRange: {
                    offsetDays: 0,
                    durationDays: 7
                }
            })
        };
        let response = UrlFetchApp.fetch(`https://adexchangebuyer.googleapis.com/v2beta1/${path}`, options);
        TrixLogger.log(`Filterset creation with status ${response.getResponseCode()}!`);
        if (response.getResponseCode() != 200) {
            TrixLogger.log(`Error during last operation!`);
            TrixLogger.log(response.getContentText());
            return false;
        }
        TrixLogger.log("Filterset created successfully");
        return true;
    };

    function filterSetExists(bidderId: string, accountId: string) {
        let name = getFilterSetName(bidderId, accountId);
        TrixLogger.log(`Retrieving filterset ${name}...`);
        let response = UrlFetchApp.fetch(`https://adexchangebuyer.googleapis.com/v2beta1/${name}`, defaultOptions);
        TrixLogger.log(`Filterset get with status ${response.getResponseCode()}!`);
        if (response.getResponseCode() == 200) {
            return true;
        }
        return false;
    };
    function removeFilterSet(bidderId: string, accountId: string) {
        let name = getFilterSetName(bidderId, accountId);
        TrixLogger.log(`Removing filterset ${name}...`);
        let options: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
            ...defaultOptions,
            method: "delete",
        }
        let response = UrlFetchApp.fetch(`https://adexchangebuyer.googleapis.com/v2beta1/${name}`, options);
        TrixLogger.log(`Filterset removal with status ${response.getResponseCode()}!`);
        if (response.getResponseCode() != 200) {
            TrixLogger.log(`Error during last operation!`);
            TrixLogger.log(response.getContentText());
        }
    };
}