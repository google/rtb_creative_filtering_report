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

function mailData() {
    TrixLogger.log("*************************************");
    TrixLogger.log("***** Creative Filtering Report *****");
    TrixLogger.log("*************************************");
    const emailTo = SpreadsheetApp.getActiveSpreadsheet().getRangeByName(Config.configurations.emailDestination.range)!.getValue();
    const emailSubject = SpreadsheetApp.getActiveSpreadsheet().getRangeByName(Config.configurations.emailTitle.range)!.getValue();
    TrixLogger.log(`Sending email ${emailSubject} to ${emailTo}`);
    Mailer.sendMail(emailTo, emailSubject);
    TrixLogger.log("**********************************");
    TrixLogger.log("****** Execution  Completed ******");
    TrixLogger.log("**********************************");
}

function loadNow() {
    const bidderId = SpreadsheetApp.getActiveSpreadsheet().getRangeByName(Config.configurations.parentId.range)!.getValue();
    const accountId = SpreadsheetApp.getActiveSpreadsheet().getRangeByName(Config.configurations.childId.range)!.getValue();
    loadData(bidderId, accountId);
}

function loadData(bidderId: string, accountId: string) {
    clearResults();
    TrixLogger.log("*************************************");
    TrixLogger.log("***** Creative Filtering Report *****");
    TrixLogger.log("*************************************");
    const topNCreatives = SpreadsheetApp.getActiveSpreadsheet().getRangeByName(Config.configurations.topCreative.range)!.getValue();
    const creativeStatusCodes = CreativeStatusCodes.mapping;
    const categoriesMap = Categories.mapping;

    let filterSetCreatedOk = RTBApi.setupFilterSet(bidderId, accountId);

    if (filterSetCreatedOk) {
        let impressionMetrics = RTBApi.fetchBidMetrics(bidderId, accountId).bidMetricsRows[0];
        let totalErrors = impressionMetrics.bids.value - impressionMetrics.bidsInAuction.value;

        let filteredBids = RTBApi.fetchFilteredBids(bidderId, accountId).creativeStatusRows;
        let activeStatusCodes = filteredBids
            .filter((fb: { [key: string]: any }) => fb.creativeStatusId != null)
            .map((fb: { [key: string]: any }) => {
                let statusCode: number = parseInt(fb.creativeStatusId);
                return {
                    statusCode,
                    description: creativeStatusCodes[statusCode],
                    value: fb.bidCount.value
                }
            })
            .filter((fb: { [key: string]: any }) => fb.value > 0)
            .filter((fb: { [key: string]: any }) => fb.statusCode != 79) // Creative was outbid
            .sort((a: { [key: string]: any }, b: { [key: string]: any }) => a.statusCode - b.statusCode);

        let statusCodesResults = activeStatusCodes.map((asc: { [key: string]: any }) => {
            TrixLogger.log(`Loading report for status ${asc.statusCode}-${asc.description}`);
            let topCreatives = RTBApi.fetchCreativeMetrics(bidderId, accountId, asc.statusCode);
            let statusCodeResult = {
                statusCode: asc.statusCode,
                statusDescription: asc.description,
                totalErrors,
                topCreatives: [],
                value: asc.value,
                ratio: 0,
            };
            if ("filteredBidCreativeRows" in topCreatives) {
                statusCodeResult.topCreatives = topCreatives.filteredBidCreativeRows.map((fbcr: { [key: string]: any }) => {
                    return {
                        creativeId: fbcr.creativeId,
                        value: fbcr.bidCount.value
                    }
                }).slice(0, topNCreatives);
            }
            statusCodeResult.ratio = statusCodeResult.value / totalErrors;
            return statusCodeResult;
        }).sort((a: { [key: string]: any }, b: { [key: string]: any }) => b.value - a.value);

        let creatives = statusCodesResults.flatMap((scr: { [key: string]: any }) => {
            return scr.topCreatives.map((tc: { [key: string]: any }) => {
                return {
                    creativeId: tc.creativeId,
                    statusCode: scr.statusCode,
                    statusDescription: scr.statusDescription,
                    value: tc.value,
                    totalErrors: scr.totalErrors,
                    ratio: tc.value / scr.totalErrors
                }
            })
        }).sort((a: { [key: string]: any }, b: { [key: string]: any }) => b.value - a.value);

        let creativeDetails = RTBApi.fetchCreativeDetails(bidderId, creatives.filter((c: { [key: string]: any }) => c.creativeId && c.creativeId != "").map((c: { [key: string]: any }) => c.creativeId));
        const creativeDetailsMap: { [key: string]: any } = {};
        creativeDetails.forEach((cd) => {
            let categories: Array<number> = [];
            if ("creativeServingDecision" in cd) {
                categories = categories.concat(cd.creativeServingDecision.detectedProductCategories);
                categories = categories.concat(cd.creativeServingDecision.detectedSensitiveCategories);
            }
            creativeDetailsMap[cd.creativeId] = {
                ...cd,
                categories: categories.map((c) => categoriesMap[c])
            };
        });

        let enhancedCreatives = creatives.map((creative: { [key: string]: any }) => {
            return {
                ...creative,
                ...creativeDetailsMap[creative.creativeId]
            }
        })

        TrixOutputWriter.writeStatusCodes(statusCodesResults);
        TrixOutputWriter.writeCreatives(enhancedCreatives);
    }

    TrixLogger.log("**********************************");
    TrixLogger.log("****** Execution  Completed ******");
    TrixLogger.log("**********************************");
}

function loadAndMail() {
    const bidderId = PropertiesService.getUserProperties().getProperty("bidderId")!;
    const accountId = PropertiesService.getUserProperties().getProperty("accountId")!;
    loadData(bidderId, accountId);
    mailData();
}

function clearResults() {
    SpreadsheetApp.getActiveSpreadsheet().getRangeByName(Config.resultsSheets.byCreative.range)?.clearContent();
    SpreadsheetApp.getActiveSpreadsheet().getRangeByName(Config.resultsSheets.byStatusCode.range)?.clearContent();
}

function removeTriggers() {
    var triggers = ScriptApp.getProjectTriggers();
    for (var i = 0; i < triggers.length; i++) {
        ScriptApp.deleteTrigger(triggers[i]);
    }
}

function scheduleRecurring() {
    const ui = SpreadsheetApp.getUi();
    const bidderId = SpreadsheetApp.getActiveSpreadsheet().getRangeByName(Config.configurations.parentId.range)!.getValue();
    const accountId = SpreadsheetApp.getActiveSpreadsheet().getRangeByName(Config.configurations.childId.range)!.getValue();
    PropertiesService.getUserProperties().setProperty("bidderId", bidderId);
    PropertiesService.getUserProperties().setProperty("accountId", accountId);
    removeTriggers();
    const durationDays = SpreadsheetApp.getActiveSpreadsheet().getRangeByName(Config.configurations.cadence.range)!.getValue();
    const response = ui.alert(`Scheduling email every ${durationDays} days for account ${bidderId}, is this correct?`, ui.ButtonSet.YES_NO);
    if (response == ui.Button.YES) {
        ScriptApp.newTrigger('loadAndMail')
            .timeBased()
            .everyDays(durationDays)
            .create();
    }
}


function buildTemplate() {
    const spreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const ui = SpreadsheetApp.getUi();
    const response = ui.alert('This will clear all data and formatting on the spreadsheet, continue?', ui.ButtonSet.YES_NO);
    if (response == ui.Button.YES) {
        Template.apply(spreadsheet);
    }
}

function onOpen() {
    const ui = SpreadsheetApp.getUi();
    ui.createMenu('Creative Filtering Report')
        .addItem('Build template', 'buildTemplate')
        .addItem('Clear results', 'clearResults')
        .addItem('Load creative metrics', 'loadNow')
        .addItem('Send results by mail', 'mailData')
        .addItem('Schedule recurring report', 'scheduleRecurring')
        .addItem('Remove schedule', 'removeTriggers')
        .addToUi();
}