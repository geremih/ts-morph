﻿import {Constructor} from "./../../../Constructor";
import * as errors from "./../../../errors";
import {insertIntoParentTextRange, verifyAndGetIndex, getNodesToReturn} from "./../../../manipulation";
import {getNodeByNameOrFindFunction} from "./../../../utils";
import {Node} from "./../../common";
import {ts, SyntaxKind} from "./../../../typescript";
import {JsxAttributeStructure} from "./../../../structures";
import {JsxAttributeStructureToText, SpaceFormattingStructuresToText} from "./../../../structureToTexts";
import {JsxAttributeLike} from "./../../aliases";
import {JsxTagNamedNode} from "./JsxTagNamedNode";

export type JsxAttributedNodeExtensionType = Node<ts.Node & { attributes: ts.JsxAttributes; }> & JsxTagNamedNode;

export interface JsxAttributedNode {
    /**
     * Gets the JSX element's attributes.
     */
    getAttributes(): JsxAttributeLike[];
    /**
     * Gets an attribute by name or returns undefined when it can't be found.
     * @param name - Name to search for.
     */
    getAttribute(name: string): JsxAttributeLike | undefined;
    /**
     * Gets an attribute by a find function or returns undefined when it can't be found.
     * @param findFunction - Find function.
     */
    getAttribute(findFunction: (attribute: JsxAttributeLike) => boolean): JsxAttributeLike | undefined;
    /**
     * Adds an attribute into the element.
     */
    addAttribute(attribute: JsxAttributeStructure): JsxAttributeLike;
    /**
     * Adds attributes into the element.
     */
    addAttributes(attributes: JsxAttributeStructure[]): JsxAttributeLike[];
    /**
     * Inserts an attribute into the element.
     */
    insertAttribute(index: number, attribute: JsxAttributeStructure): JsxAttributeLike;
    /**
     * Inserts attributes into the element.
     */
    insertAttributes(index: number, attributes: JsxAttributeStructure[]): JsxAttributeLike[];
}

export function JsxAttributedNode<T extends Constructor<JsxAttributedNodeExtensionType>>(Base: T): Constructor<JsxAttributedNode> & T {
    return class extends Base implements JsxAttributedNode {
        getAttributes() {
            return this.compilerNode.attributes.properties.map(p => this.getNodeFromCompilerNode<JsxAttributeLike>(p));
        }

        getAttribute(nameOrFindFunction: (string | ((attribute: JsxAttributeLike) => boolean))) {
            return getNodeByNameOrFindFunction(this.getAttributes(), nameOrFindFunction);
        }

        addAttribute(structure: JsxAttributeStructure) {
            return this.addAttributes([structure])[0];
        }

        addAttributes(structures: JsxAttributeStructure[]) {
            return this.insertAttributes(this.compilerNode.attributes.properties.length, structures);
        }

        insertAttribute(index: number, structure: JsxAttributeStructure) {
            return this.insertAttributes(index, [structure])[0];
        }

        insertAttributes(index: number, structures: JsxAttributeStructure[]) {
            index = verifyAndGetIndex(index, this.compilerNode.attributes.properties.length);

            const insertPos = index === 0 ? this.getTagName().getEnd() : this.getAttributes()[index - 1].getEnd();
            const writer = this.getWriterWithQueuedChildIndentation();
            const structuresToText = new SpaceFormattingStructuresToText(writer, new JsxAttributeStructureToText(writer));
            structuresToText.writeText(structures);

            insertIntoParentTextRange({
                insertPos,
                newText: " " + writer.toString(),
                parent: this.getNodeProperty("attributes").getFirstChildByKindOrThrow(SyntaxKind.SyntaxList)
            });

            return getNodesToReturn(this.getAttributes(), index, structures.length);
        }
    };
}
