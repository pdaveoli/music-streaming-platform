'use client';

import { useState } from 'react';

type ExpandableDescriptionProps = {
    text: string | undefined;
    truncateLength?: number;
};

export function ExpandableDescription({ text, truncateLength = 100 }: ExpandableDescriptionProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    if (!text) {
        return null;
    }

    const toggleExpanded = () => {
        setIsExpanded(!isExpanded);
    };

    const isTooLong = text.length > truncateLength;
    const displayedText = isExpanded || !isTooLong ? text : `${text.substring(0, truncateLength)}...`;

    return (
        <div>
            <p className="text-sm text-gray-500 whitespace-pre-wrap">
                {displayedText}
            </p>
            {isTooLong && (
                <button
                    onClick={toggleExpanded}
                    className="text-blue-500 hover:underline text-sm mt-1"
                >
                    {isExpanded ? 'Read less' : 'Read more'}
                </button>
            )}
        </div>
    );
}