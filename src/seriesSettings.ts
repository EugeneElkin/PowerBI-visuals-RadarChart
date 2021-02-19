import powerbi from "powerbi-visuals-api";

import { dataViewObjects, dataViewObjectsParser } from "powerbi-visuals-utils-dataviewutils";

import { LegendItemsSettings } from "./settings"
import { ContainerSupportingSettings } from "./containerSupportingSettings";

export interface IDescriptor {
    parse?(): void;
    setDefault?(): void;
}

/*
Class for all series settings that we want to be wrapped into containers.
*/
export class SeriesSettings extends ContainerSupportingSettings {
    /*
    We have the only one option group here that we going to wrap into container.
    Such group also exists in the regular settings class (settings.ts).
    But here we can describe several groups from the settings class. 
    */
    public legendItems: LegendItemsSettings = new LegendItemsSettings();

    public parse(): void {
        // This function is required to update settings once they are parsed from a data view object
    }

    /*
    The goal of this method is to extract values from settings inner structures
    to attach them in each series inside the update() main method of the visual
    */
    public parseObjects(objects: powerbi.DataViewObjects): dataViewObjectsParser.DataViewObjectsParser {
        if (objects) {
            const properties: dataViewObjectsParser.DataViewProperties = this.getProperties();

            for (const objectName of Object.keys(properties)) {
                for (const propertyName of Object.keys(properties[objectName])) {
                    const defaultValue: any = this[objectName][propertyName];

                    this[objectName][propertyName] = dataViewObjects.DataViewObjects.getCommonValue(
                        objects,
                        properties[objectName][propertyName],
                        defaultValue);
                }

                if ((<IDescriptor>this[objectName]).parse) {
                    (<IDescriptor>this[objectName]).parse();
                }
            }
        }

        this.parse();

        return this;
    }
}
