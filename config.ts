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

namespace Config {
    export const filterSetName = "xcse-creative-report-fs";
    export const title = "Creative Filtering Report";
    export const instructions = [
        "Fill all the configuration fields below.",
        "If using a parent seat, leave the Child Id blank.",
        "Use the Weekly Creative Report menu above and click on Load creative metrics (If the menu is not present, try refreshing this page).",
        "In the first time you execute, you'll be asked to provide permissions. Review the authorization request.",
        "After providing permissions, you'll need to execute Load creative metrics again.",
        "Check the Status Log for the execution process.",
        "When completed, see the Results tab for your data.",
        "After that, you can use the menu to Send results by mail.",
        "If everything succeeded, you can go ahead and Schedule weekly report.",
        "Please make a copy of this spreadsheet for each account",
    ];
    export const configurations = {
        parentId: { name: "Parent Id", range: "ParentIdRange" },
        childId: { name: "Child Id", range: "ChildIdRange" },
        topCreative: { name: "Top # creatives", range: "TopNCreativesRange" },
        emailTitle: { name: "Email Title", range: "EmailTitleRange" },
        emailDestination: { name: "Email Destination", range: "EmailDestinationRange" },
        cadence: { name: "Run every # days", range: "CadenceRange" }
    };
    export const statusLogRange = "StatusLogRange";
    export const resultsSheets = {
        byCreative: { name: "Results by creative", range: "ResultsByCreativeRange" },
        byStatusCode: { name: "Results by status code", range: "ResultsByStatusCodeRange" }
    };
    export const batchSize = 100;
};