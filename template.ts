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

namespace Template {
    const settings = {
        marginWidth: 16,
        marginHeight: 9,
        cellWidth: 32,
        cellHeight: 18,
        columns: 32,
        backgroundColor: "#CEEAD6",
        borderColor: "#9AA0A6",
        title: {
            rows: 4,
            backgroundColor: "white",
            fontColor: "#202124"
        },
        configuration: {
            backgroundColor: "white",
            valueBackgroundColor: "#34A853",
            valueFontColor: "white",
        },
        statusLog: {
            size: 10,
            backgroundColor: "white"
        },
    };

    export function apply(spreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet) {
        reset(spreadsheet);
        const sheet = spreadsheet.getActiveSheet();
        const container = addContainer(sheet);
        const title = addTitle(sheet, container);
        const titleSeparator = addSeparator(sheet, title);
        const instructions = addInstructions(sheet, titleSeparator);
        const instructionSeparator = addSeparator(sheet, instructions);
        const configurationRange = addConfiguration(sheet, instructionSeparator);
        const configurationSeparator = addSeparator(sheet, configurationRange);
        const statusLogRange = addStatusLog(sheet, configurationSeparator);
        sheet.deleteRow(statusLogRange.getRow() + statusLogRange.getNumRows());
        sheet.setName("Config");
        sheet.setTabColor(settings.backgroundColor);
        const resultsSheets = Object.values(Config.resultsSheets);
        for (const resultSheet of resultsSheets) {
            const result = spreadsheet.insertSheet(resultSheet.name);
            const resultRange = result.getRange(1, 1, result.getMaxRows(), result.getMaxColumns());
            resultRange.applyRowBanding();
            spreadsheet.setNamedRange(resultSheet.range, resultRange);
        }
        sheet.activate();
    };

    function addContainer(sheet: GoogleAppsScript.Spreadsheet.Sheet): GoogleAppsScript.Spreadsheet.Range {
        sheet.setHiddenGridlines(true);
        sheet.insertRowsAfter(1, 4);
        sheet.insertColumnsAfter(1, settings.columns - 1);
        for (let i = 1; i <= 2; i++) {
            sheet.setRowHeight(i, settings.marginHeight);
            sheet.setRowHeight(5 - (i - 1), settings.marginHeight);
            sheet.setColumnWidth(i, settings.marginWidth);
            sheet.setColumnWidth(settings.columns - (i - 1), settings.marginWidth);
        }
        sheet.setColumnWidth(3, settings.marginWidth);
        sheet.setColumnWidth(settings.columns - 2, settings.marginWidth);
        let container = sheet.getRange(2, 2, 3, settings.columns - 2);
        container.setBorder(true, true, true, true, null, null, settings.borderColor, SpreadsheetApp.BorderStyle.SOLID);
        container.setBackground(settings.backgroundColor);
        return container;
    };

    function addTitle(sheet: GoogleAppsScript.Spreadsheet.Sheet, container: GoogleAppsScript.Spreadsheet.Range): GoogleAppsScript.Spreadsheet.Range {
        sheet.insertRowsAfter(container.getRow() + 1, settings.title.rows);
        let title = sheet.getRange(container.getRow() + 1, container.getColumn(), settings.title.rows, container.getNumColumns());
        title.setBackground(settings.title.backgroundColor);
        title.setBorder(true, true, true, true, null, null, settings.borderColor, SpreadsheetApp.BorderStyle.SOLID);
        title.merge();
        title.setFontColor(settings.title.fontColor);
        title.setFontFamily("Google Sans");
        title.setFontSize(36);
        title.setFontWeight("bold");
        title.setVerticalAlignment("middle");
        title.setHorizontalAlignment("center");
        title.setValue(Config.title);
        return title;
    };

    function addSeparator(sheet: GoogleAppsScript.Spreadsheet.Sheet, after: GoogleAppsScript.Spreadsheet.Range): GoogleAppsScript.Spreadsheet.Range {
        sheet.insertRowsAfter(after.getRow() + after.getNumRows(), 1);
        sheet.setRowHeight(after.getRow() + after.getNumRows(), settings.marginHeight);
        return sheet.getRange(after.getRow() + after.getNumRows(), 2, 1, settings.columns - 2);
    };

    function addInstructions(sheet: GoogleAppsScript.Spreadsheet.Sheet, after: GoogleAppsScript.Spreadsheet.Range): GoogleAppsScript.Spreadsheet.Range {
        sheet.insertRowsAfter(after.getRow() + 1, Config.instructions.length + 1);
        const instructionsRange = sheet.getRange(after.getRow() + 1, 3, Config.instructions.length + 1, settings.columns - 3);
        const instructionHeader = sheet.getRange(after.getRow() + 1, 3, 1, settings.columns - 4);
        instructionHeader.mergeAcross();
        instructionHeader.setValue("Instructions:");
        instructionHeader.setFontWeight("bold");
        instructionHeader.setFontSize(16);
        for (let i = 0; i < Config.instructions.length; i++) {
            sheet.getRange(after.getRow() + 2 + i, 3, 1, 1).setValue("·").setHorizontalAlignment("center");
            const instruction = sheet.getRange(after.getRow() + 2 + i, 4, 1, settings.columns - 5);
            instruction.mergeAcross();
            instruction.setValue(Config.instructions[i]);
            instruction.setWrap(true);
        }
        return instructionsRange;
    };

    function addConfiguration(sheet: GoogleAppsScript.Spreadsheet.Sheet, after: GoogleAppsScript.Spreadsheet.Range): GoogleAppsScript.Spreadsheet.Range {
        const configurations = Object.values(Config.configurations);
        sheet.insertRowsAfter(after.getRow() + 1, configurations.length + 3);
        const configurationRange = sheet.getRange(after.getRow() + 1, 3, configurations.length + 3, settings.columns - 4);
        configurationRange.setBorder(true, true, true, true, null, null, settings.borderColor, SpreadsheetApp.BorderStyle.SOLID);
        configurationRange.setBackground(settings.configuration.backgroundColor);
        const configurationHeader = sheet.getRange(after.getRow() + 2, 3, 1, 1);
        configurationHeader.setValue("Configuration:");
        configurationHeader.setFontWeight("bold");
        configurationHeader.setFontSize(16);
        for (let i = 0; i < configurations.length; i++) {
            sheet.getRange(after.getRow() + 3 + i, 4, 1, 1).setValue(configurations[i].name);
            const configurationValueRange = sheet.getRange(after.getRow() + 3 + i, settings.columns - 10, 1, 8);
            configurationValueRange.mergeAcross();
            configurationValueRange.setBackground(settings.configuration.valueBackgroundColor);
            configurationValueRange.setFontColor(settings.configuration.valueFontColor);
            configurationValueRange.setHorizontalAlignment("center");
            SpreadsheetApp.getActiveSpreadsheet().setNamedRange(configurations[i].range, configurationValueRange);
        }
        sheet.setRowHeight(after.getRow() + 1, settings.marginHeight);
        sheet.setRowHeight(configurationRange.getRow() + configurationRange.getNumRows() - 1, settings.marginHeight);
        return configurationRange;
    };

    function addStatusLog(sheet: GoogleAppsScript.Spreadsheet.Sheet, after: GoogleAppsScript.Spreadsheet.Range): GoogleAppsScript.Spreadsheet.Range {
        sheet.insertRowsAfter(after.getRow() + 1, settings.statusLog.size + 3);
        const statusLogRange = sheet.getRange(after.getRow() + 1, 3, settings.statusLog.size + 3, settings.columns - 4);
        statusLogRange.setBorder(true, true, true, true, null, null, settings.borderColor, SpreadsheetApp.BorderStyle.SOLID);
        statusLogRange.setBackground(settings.statusLog.backgroundColor);
        const statusLogHeader = sheet.getRange(after.getRow() + 2, 3, 1, 1);
        statusLogHeader.setValue("Status Log:");
        statusLogHeader.setFontWeight("bold");
        statusLogHeader.setFontSize(16);
        for (let i = 0; i < settings.statusLog.size; i++) {
            const statusLineRange = sheet.getRange(after.getRow() + 3 + i, 4, 1, settings.columns - 6);
            statusLineRange.mergeAcross();
            statusLineRange.setWrap(true);
        }
        const statusLinesRange = sheet.getRange(after.getRow() + 3, 4, settings.statusLog.size, settings.columns - 6);
        statusLinesRange.setFontFamily("Roboto Mono");
        statusLinesRange.setFontSize(8);
        SpreadsheetApp.getActiveSpreadsheet().setNamedRange(Config.statusLogRange, statusLinesRange);
        sheet.setRowHeight(after.getRow() + 1, settings.marginHeight);
        sheet.setRowHeight(statusLogRange.getRow() + statusLogRange.getNumRows() - 1, settings.marginHeight);
        return statusLogRange;
    }

    export function reset(spreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet) {
        const sheets = spreadsheet.getSheets();
        for (let i = 1; i < sheets.length; i++) {
            spreadsheet.deleteSheet(sheets[i]);
        }
        const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
        sheet.clear();
        if (sheet.getMaxRows() > 1) {
            sheet.deleteRows(2, sheet.getMaxRows() - 1);
        }
        if (sheet.getMaxColumns() > 1) {
            sheet.deleteColumns(2, sheet.getMaxColumns() - 1);
        }
        sheet.setColumnWidths(1, sheet.getMaxColumns(), settings.cellWidth);
        sheet.setRowHeights(1, sheet.getMaxRows(), settings.cellHeight);
        const baseCell = sheet.getRange(1, 1);
        baseCell.setBackground('#F3F3F3');
        baseCell.setFontColor("#202124");
        baseCell.setFontFamily("Roboto");
        baseCell.setVerticalAlignment("middle");
        baseCell.setFontSize(12);
    };
};