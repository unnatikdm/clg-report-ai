export interface DocumentBlock {
    id: string; // The slot ID, e.g., 'introduction', 'code_implementation'
    type?: 'heading' | 'paragraph' | 'code' | 'list';
    title?: string;
    content: string;
    isUpdating?: boolean; // Used for UI loading pulses
}

export type DocumentTree = DocumentBlock[];

export interface DocumentPatch {
    blockId: string;
    newContent: string;
}

// Reducer function: applies an array of patches to the DocumentTree
export function applyDocumentPatch(
    tree: DocumentTree,
    patches: DocumentPatch[]
): DocumentTree {
    return tree.map((block) => {
        const patch = patches.find((p) => p.blockId === block.id);
        if (patch) {
            return {
                ...block,
                content: patch.newContent,
                isUpdating: false,
            };
        }
        return block;
    });
}

// Function to set a specific block to an updating state
export function setBlockUpdatingState(
    tree: DocumentTree,
    blockId: string,
    isUpdating: boolean
): DocumentTree {
    return tree.map((block) => {
        if (block.id === blockId) {
            return {
                ...block,
                isUpdating,
            };
        }
        return block;
    });
}
