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

namespace TrixOutputWriter {
    export function writeCreatives(creatives: Array<any>) {
        let rangeValues = [["Creative Id", "Creative Format", "Categories", "Status Code", "Status Description", "Value", "Total Account Errors", "Ratio"]];
        for (let creative of creatives) {
            rangeValues.push([
                creative.creativeId,
                creative.creativeFormat,
                creative.categories.join(",\n"),
                creative.statusCode,
                creative.statusDescription,
                creative.value,
                creative.totalErrors,
                creative.ratio]);
        }
        TrixLogger.log(`Writting ${rangeValues.length} rows to Results by Creative tab...`);
        TrixBatcher.writeFully(Config.resultsSheets.byCreative.range, rangeValues);
    };

    export function writeStatusCodes(statusCodes: Array<any>) {
        let rangeValues = [["Status Code", "Status Description", "Top Creatives", "Status Errors", "Total Account Errors", "Ratio"]];
        for (let statusCode of statusCodes) {
            rangeValues.push([
                statusCode.statusCode,
                statusCode.statusDescription,
                statusCode.topCreatives.map((tc: { creativeId: number }) => tc.creativeId).join("\n"),
                statusCode.value,
                statusCode.totalErrors,
                statusCode.ratio]);
        }
        TrixLogger.log(`Writting ${rangeValues.length} rows to Results by Status Code tab...`);
        TrixBatcher.writeFully(Config.resultsSheets.byStatusCode.range, rangeValues);
    };
}