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

namespace TrixBatcher {
    export function writeBatch(range: GoogleAppsScript.Spreadsheet.Range, values: Array<any>) {
        if (values.length == 0) {
            return range;
        }
        const rowsToWrite = Math.min(values.length, Config.batchSize);
        const columnsToWrite = values[0].length;
        const writeRange = range.getSheet().getRange(range.getRow(), range.getColumn(), rowsToWrite, columnsToWrite);
        writeRange.setValues(values);
        return range.getSheet().getRange(range.getRow() + rowsToWrite, range.getColumn(), Config.batchSize, columnsToWrite);
    };

    export function writeFully(rangeName: string, values: Array<any>) {
        const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
        const range: GoogleAppsScript.Spreadsheet.Range = spreadsheet.getRangeByName(rangeName)!;
        range.clearContent();
        let currentRange = range;
        let currentValues = values;
        while (currentValues.length > 0) {
            currentRange = TrixBatcher.writeBatch(currentRange, currentValues.slice(0, Config.batchSize));
            currentValues = currentValues.slice(Config.batchSize);
        }
    };

};