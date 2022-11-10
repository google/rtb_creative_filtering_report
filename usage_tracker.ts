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

namespace UsageTracker {
    const BASE_API_OPTIONS: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
        contentType: 'application/json',
        muteHttpExceptions: true,
        method: 'post',
        headers: { 'Accept': 'application/json' }
    };
    const TRACKING_URL: string = 'https://xcse-solution-usage-tracker.uc.r.appspot.com/register-event';

    function convertObjectToTrackingEventCustomData(obj: { [key: string]: unknown }): { [key: string]: unknown }[] {
        return Object.keys(obj).map((key: string) => ({ key, value: obj[key] }));
    }

    export function registerEvent(event: string, status: string, additionalInfo: { [key: string]: unknown } = {}): GoogleAppsScript.URL_Fetch.HTTPResponse {
        const userDomain = Session.getEffectiveUser().getEmail().split('@')[1];
        const spreadsheetId = SpreadsheetApp.getActiveSpreadsheet().getId();
        const customData = {
            spreadsheetId,
            ...additionalInfo
        };
        const options = {
            ...BASE_API_OPTIONS,
            payload: JSON.stringify({
                'solution': 'creative_filtering_report',
                'event_name': event,
                'event_status': status,
                'client': userDomain,
                'custom_event_data': convertObjectToTrackingEventCustomData(customData),
            })
        };
        return UrlFetchApp.fetch(TRACKING_URL, options);
    }
}