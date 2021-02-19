import powerbi from "powerbi-visuals-api";

import { DataViewObjectsParser } from "powerbi-visuals-utils-dataviewutils/lib/dataViewObjectsParser";

import { ColorHelper } from "powerbi-visuals-utils-colorutils";

export class BaseDescriptor {
    public applyDefault(defaultSettings: BaseDescriptor) {
        if (!defaultSettings) {
            return;
        }

        Object
            .keys(defaultSettings)
            .forEach((propertyName: string) => {
                this[propertyName] = defaultSettings[propertyName];
            });
    }

    public getValueByPropertyName(propertyName: string): any {
        return this[propertyName];
    }
}

export class ContainerSupportingSettings extends DataViewObjectsParser {
    public enumerateObjectInstancesWithSelectionId(
        options: powerbi.EnumerateVisualObjectInstancesOptions,
        displayName: string,
        selectionId: powerbi.visuals.ISelectionId,
        enumerationObject: powerbi.VisualObjectInstanceEnumerationObject = {
            containers: [],
            instances: [],
        },
    ): powerbi.VisualObjectInstanceEnumerationObject {
        if (this.areOptionsValid(options)) {
            const { objectName } = options;

            const selector: powerbi.data.Selector = selectionId && selectionId.getSelector();

            this.addSettingsToContainer(
                objectName,
                displayName,
                ColorHelper.normalizeSelector(selector),
                enumerationObject,
                this.getSettings(this[objectName]),
            );
        }

        return enumerationObject;
    }

    private areOptionsValid(options: powerbi.EnumerateVisualObjectInstancesOptions): boolean {
        return !!(options
            && options.objectName
            && this[options.objectName]
        );
    }

    private addSettingsToContainer(
        objectName: string,
        displayName: string,
        selector: powerbi.data.Selector,
        enumerationObject: powerbi.VisualObjectInstanceEnumerationObject,
        properties: { [propertyName: string]: powerbi.DataViewPropertyValue },
    ): void {
        const containerIdx: number = enumerationObject.containers.push({ displayName }) - 1;

        this.addSettingsToInstances(
            objectName,
            enumerationObject,
            properties,
            selector,
            containerIdx,
        );
    }

    private addSettingsToInstances(
        objectName: string,
        enumerationObject: powerbi.VisualObjectInstanceEnumerationObject,
        properties: { [propertyName: string]: powerbi.DataViewPropertyValue },
        selector: powerbi.data.Selector = null,
        containerIdx?: number,
    ): void {
        const instance: powerbi.VisualObjectInstance = {
            objectName,
            properties,
            selector,
        };

        if (containerIdx != null) {
            instance.containerIdx = containerIdx;
        }

        enumerationObject.instances.push(instance);
    }

    private getSettings(settings: BaseDescriptor): { [propertyName: string]: powerbi.DataViewPropertyValue } {
        const properties: { [propertyName: string]: powerbi.DataViewPropertyValue; } = {};

        for (const descriptor of Object.keys(settings)) {
            const value: any = settings.getValueByPropertyName
                ? settings.getValueByPropertyName(descriptor)
                : settings[descriptor];

            const typeOfValue: string = typeof value;

            if (typeOfValue === "undefined"
                || value === null
                || typeOfValue === "number"
                || typeOfValue === "string"
                || typeOfValue === "boolean"
            ) {
                properties[descriptor] = value;
            }
        }

        return properties;
    }
}