export const transliterateBanglaToEnglish = (input: string): string => {
    const map: Record<string, string> = {
        // Add more mappings as needed
        'অ': 'o', 'আ': 'a', 'ই': 'i', 'ঈ': 'ee', 'উ': 'u', 'ঊ': 'oo', 'এ': 'e', 'ঐ': 'oi',
        'ও': 'o', 'ঔ': 'ou',
        'ক': 'k', 'খ': 'kh', 'গ': 'g', 'ঘ': 'gh', 'ঙ': 'ng',
        'চ': 'ch', 'ছ': 'chh', 'জ': 'j', 'ঝ': 'jh', 'ঞ': 'n',
        'ট': 't', 'ঠ': 'th', 'ড': 'd', 'ঢ': 'dh', 'ণ': 'n',
        'ত': 't', 'থ': 'th', 'দ': 'd', 'ধ': 'dh', 'ন': 'n',
        'প': 'p', 'ফ': 'ph', 'ব': 'b', 'ভ': 'bh', 'ম': 'm',
        'য': 'j', 'র': 'r', 'ল': 'l', 'শ': 'sh', 'ষ': 'sh', 'স': 's', 'হ': 'h',
        'া': 'a', 'ি': 'i', 'ী': 'ee', 'ু': 'u', 'ূ': 'oo',
        'ে': 'e', 'ৈ': 'oi', 'ো': 'o', 'ৌ': 'ou',
        'ঁ': 'n', 'ং': 'ng', 'ঃ': 'h', 'য়': 'y', 'ৃ': 'ri',
    };

    let result = '';
    for (const char of input) {
        result += map[char] ?? char;
    }
    return result;
}