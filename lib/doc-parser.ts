export interface DocumentSection {
    id: string;
    level: number;
    title: string;
    content: string;
    startIndex: number;
    endIndex: number;
}

/**
 * Parses markdown text into a flat list of sections based on ATX headings.
 * This creates a simple Abstract Syntax Tree (AST) mapping of the document structure.
 */
export function parseSections(markdown: string): DocumentSection[] {
    const sections: DocumentSection[] = [];
    const headingRegex = /^(#{1,6})\s+(.*)$/gm;

    let match;
    let lastIndex = 0;
    let currentSection: Partial<DocumentSection> | null = null;

    while ((match = headingRegex.exec(markdown)) !== null) {
        const level = match[1].length;
        const title = match[2].trim();
        const startIndex = match.index;

        // Close the previous section
        if (currentSection) {
            currentSection.endIndex = startIndex;
            currentSection.content = markdown.substring(lastIndex, startIndex);
            sections.push(currentSection as DocumentSection);
        } else if (startIndex > 0) {
            // Capture any preamble before the first heading
            sections.push({
                id: 'preamble',
                level: 0,
                title: 'Preamble',
                content: markdown.substring(0, startIndex),
                startIndex: 0,
                endIndex: startIndex
            });
        }

        // Start a new section
        currentSection = {
            id: generateSlug(title),
            level,
            title,
            startIndex,
        };
        lastIndex = headingRegex.lastIndex;
    }

    // Close the final section
    if (currentSection) {
        currentSection.endIndex = markdown.length;
        currentSection.content = markdown.substring(lastIndex);
        sections.push(currentSection as DocumentSection);
    } else if (sections.length === 0) {
        // If no headings found, the whole document is one section
        sections.push({
            id: 'root',
            level: 0,
            title: 'Root',
            content: markdown,
            startIndex: 0,
            endIndex: markdown.length
        });
    }

    return sections;
}

/**
 * Reconstructs the document while injecting new content into a specific slot.
 */
export function injectContentIntoSlot(
    sections: DocumentSection[],
    targetSlotId: string,
    newContent: string
): string {
    return sections.map(section => {
        // Reconstruct the heading
        const heading = section.level > 0 ? `${'#'.repeat(section.level)} ${section.title}\n` : '';

        // Inject if this is the target slot, otherwise keep original content
        const content = section.id === targetSlotId ? `\n${newContent}\n` : section.content;

        return `${heading}${content}`;
    }).join('');
}

// Utility to create a safe ID from a heading
function generateSlug(text: string): string {
    return text.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
}
