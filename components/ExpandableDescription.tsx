'use client';

import { JSX, useState } from 'react';

type ExpandableDescriptionProps = {
    text: string | undefined;
    truncateLength?: number;
};


/// <summary>
/// Component to display a description that can be expanded or truncated.
/// If the text exceeds the specified length, it shows a "Read more" link.
/// </summary>
/// <param name="text">The description text to display.</param>
/// <param name="truncateLength">The length at which to truncate the text. Default is 100 characters.</param>
/// <returns>A component that displays the description with expand/collapse functionality.</returns>
export function ExpandableDescription({ text, truncateLength = 100 }: ExpandableDescriptionProps): JSX.Element {
    const [isExpanded, setIsExpanded] = useState(false);

    if (!text) {
        return (
            <p className="text-sm text-gray-500">No description available.</p>
        );
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