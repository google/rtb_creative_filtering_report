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

namespace Mailer {
    export function toCsv(range: string) {
        let values = SpreadsheetApp.getActiveSpreadsheet().getRangeByName(range)!.getValues();
        let csv = values!.map((v) => v.map((iv) => `"${iv}"`).join(",")).join("\n");
        return csv;
    };

    export function sendMail(to: string, subject: string) {
        let creativesCsv: string = Mailer.toCsv(Config.resultsSheets.byCreative.range);
        let statusCodeCsv: string = Mailer.toCsv(Config.resultsSheets.byStatusCode.range);
        MailApp.sendEmail({
            to,
            subject,
            htmlBody: "Please find attached the report.",
            attachments: [
                Utilities.newBlob(creativesCsv, "text/csv", "report_by_creatives.csv"),
                Utilities.newBlob(statusCodeCsv, "text/csv", "report_by_status.csv")
            ]
        });
        UsageTracker.registerEvent('sendMail', 'ok');
    };
};