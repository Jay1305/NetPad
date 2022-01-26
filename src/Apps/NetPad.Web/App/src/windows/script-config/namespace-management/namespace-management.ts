import {watch} from "aurelia";
import {ConfigStore} from "../config-store";
import {Util} from "@common";

export class NamespaceManagement {
    public namespaces: string;
    public error?: string;

    constructor(readonly configStore: ConfigStore) {
    }

    public binding() {
        let namespaces = this.configStore.namespaces.join("\n");
        if (namespaces)
            namespaces += "\n";
        this.namespaces = namespaces;
    }

    @watch<NamespaceManagement>(vm => vm.namespaces)
    public namespacesChanged(newValue: string) {
        let namespaces = this.namespaces
            .split('\n')
            .map(ns => ns.trim());

        this.error = this.validate(namespaces);
        if (this.error) return;

        namespaces = Util.distinct(namespaces);
        this.configStore.namespaces = namespaces;
    }

    private validate(namespaces: string[]): string | undefined {
        for (const namespace of namespaces) {
            if (namespace.startsWith("using "))
                return `The namespace \"${namespace}\" should not contain the word \"using\".`;
            if (namespace.length > 0 && !Util.isLetter(namespace[0]) && namespace[0] !== "_")
                return `The namespace \"${namespace}\" seems incorrect. It must start with an alphabet or underscore.`;
        }

        return undefined;
    }
}
