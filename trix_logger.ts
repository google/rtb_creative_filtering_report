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

namespace TrixLogger {
    let messages: Array<Array<string>> = [];
    export function log(message: string) {
        Logger.log(message);
        const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
        const statusRange = spreadsheet.getRangeByName(Config.statusLogRange)!;
        while (messages.length < statusRange.getHeight()) {
            messages.push([""]);
        }
        messages.shift();
        messages.push([message]);
        TrixBatcher.writeFully(Config.statusLogRange, messages);
    };
}